// project.controller.js
const Project = require("../models/project.model");
const User = require("../models/user.model");
const Conversation = require("../models/conversation.model");

// POST /api/projects
// Body: { title, description?, roles?, members? }
const createProject = async (req, res) => {
  try {
    const { auth0Id } = req.body;

    if (!auth0Id) {
      return res.status(401).json({ message: "Unauthorized: no auth0Id" });
    }

    const { title, description, roles } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    // Find the current user in Mongo by auth0Id
    const user = await User.findOne({ auth0Id });
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found in database for this auth0Id" });
    }

    // Create the project
    const project = await Project.create({
      title,
      description: description || "",
      roles:
        Array.isArray(roles) && roles.length > 0
          ? [...roles, "owner"]
          : ["owner"],
      members: [], // empty on creation
    });

    // ✅ UPDATED: safely get members from body (might be undefined)
    const { members = [] } = req.body;

    // ✅ UPDATED: add creator as owner directly on this project instance
    project.members.push({
      userId: user.auth0Id.toString(),
      role: "owner",
    });

    // ✅ UPDATED: add additional members (if provided)
    for (let i = 0; i < members.length; i++) {
      await addUserToProjectService({
        projectId: project._id,
        email: members[i].email,
        role: members[i].role,
      });
    }

    // ✅ UPDATED: create conversations for this project
    const conversations = await createProjectConversationsService(project._id);

    // ✅ NEW: attach conversation ids to the project document
    const conversationIds = conversations.map((conv) => conv._id);
    project.conversations = conversationIds;

    // ✅ UPDATED: save updated project (with members + conversations)
    await project.save();

    // Add project to the creator's projects list
    user.projects.push(project._id);
    await user.save();

    return res.status(201).json({
      message: "Project created successfully",
      project,
    });
  } catch (err) {
    console.error("createProject error:", err);
    return res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
};

async function addUserToProjectService({ projectId, email, role }) {
  // Find user by email
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error(`User with email ${email} not found`);
  }

  const project = await Project.findById(projectId);
  if (!project) {
    throw new Error(`Project ${projectId} not found`);
  }

  // Optional: check role against project.roles
  if (!Array.isArray(project.roles) || !project.roles.includes(role)) {
    throw new Error(`${role} is not a valid role for this project`);
  }

  const alreadyMember = project.members.some(
    (m) => m.userId === user.auth0Id
  );
  if (!alreadyMember) {
    project.members.push({
      userId: user.auth0Id,
      role,
    });
  }

  const hasProject = user.projects.some(
    (pId) => pId.toString() === project._id.toString()
  );
  if (!hasProject) {
    user.projects.push(project._id);
  }

  await project.save();
  await user.save();

  return { project, user };
}

// ✅ UPDATED: set restrictedToRoles for role-specific conversations
async function createProjectConversationsService(projectId) {
  if (!projectId) {
    throw new Error("projectId is required.");
  }

  // 1. Load project with members
  const project = await Project.findById(projectId);
  if (!project) {
    throw new Error("Project not found.");
  }

  const members = project.members || [];
  if (members.length === 0) {
    throw new Error("Project has no members to create conversations for.");
  }

  // 2. Load all User docs based on auth0Id from members.userId
  const auth0Ids = members.map((m) => m.userId);
  const users = await User.find({ auth0Id: { $in: auth0Ids } });

  if (!users.length) {
    throw new Error("No matching users found for project members.");
  }

  // Map auth0Id -> User doc
  const userByAuth0Id = new Map(users.map((u) => [u.auth0Id, u]));

  // 3. Group users by role
  const roleGroups = {}; // { role: [User] }

  for (const member of members) {
    const user = userByAuth0Id.get(member.userId);

    if (!user || !member.role) continue;

    if (!roleGroups[member.role]) {
      roleGroups[member.role] = [];
    }

    if (!roleGroups[member.role].some((u) => u.auth0Id === user.auth0Id)) {
      roleGroups[member.role].push(user);
    }
  }

  const conversationsToInsert = [];

  // One conversation per role (restricted to that role only)
  for (const [role, usersForRole] of Object.entries(roleGroups)) {
    if (!usersForRole.length) continue;

    conversationsToInsert.push({
      project: projectId,
      title: role,
      restrictedToRoles: [role], // ✅ NEW: restrict to this role
      users: usersForRole.map((u) => ({
        id: u.auth0Id,
        nickname: u.nickname,
      })),
      messages: [],
    });
  }

  // Conversation with ALL users (no restrictions)
  const uniqueUsers = Array.from(
    new Map(users.map((u) => [u.auth0Id.toString(), u])).values()
  );

  conversationsToInsert.push({
    project: projectId,
    title: "Everyone",
    restrictedToRoles: [], // ✅ NEW: empty array = no restrictions
    users: uniqueUsers.map((u) => ({
      id: u.auth0Id,
      nickname: u.nickname,
    })),
    messages: [],
  });

  const createdConversations = await Conversation.insertMany(
    conversationsToInsert
  );
  return createdConversations;
}

// GET /api/projects/projects
// Returns projects for the current user using user.projects
const getMyProjects = async (req, res) => {
  try {
    const { auth0Id } = req.query;
    if (!auth0Id) {
      return res.status(401).json({ message: "Unauthorized: no auth0Id" });
    }

    // Find user and populate their projects
    const user = await User.findOne({ auth0Id }).populate("projects");

    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found in database for this auth0Id" });
    }
    return res.status(200).json({
      count: user.projects.length,
      projects: user.projects,
    });
  } catch (err) {
    console.error("getMyProjects error:", err);
    return res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
};

const addUserToProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { email, role } = req.body;

    // ✅ UPDATED: check email, not auth0Id (we don't have it in body)
    if (!email || !role) {
      return res
        .status(400)
        .json({ message: "Both email and role are required." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: `${email} not found.` });
    }

    const auth0Id = user.auth0Id; // ✅ NEW: get auth0Id from user

    // 2. Find project
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found." });
    }

    // 3. Check if user is already a member
    const alreadyMember = project.members.some((m) => m.userId === auth0Id);
    if (alreadyMember) {
      return res
        .status(400)
        .json({ message: "User is already a member of this project." });
    }

    // 4. (Optional but helpful) check role against project's roles before save
    if (!Array.isArray(project.roles) || !project.roles.includes(role)) {
      return res.status(400).json({
        message: `${role} is not a valid role for this project.`,
      });
    }

    project.members.push({
      userId: auth0Id,
      role,
    });

    // 6. Add project to user's projects if not present
    const hasProject = user.projects?.some(
      (pId) => pId.toString() === project._id.toString()
    );
    if (!hasProject) {
      user.projects.push(project._id);
    }

    // 7. Save both
    await project.save(); // will also trigger the Mongoose validator on role
    await user.save();

    // 8. Optionally populate members if you want to return more info
    const updatedProject = await Project.findById(projectId);

    return res.status(200).json({
      message: "User added to project successfully.",
      project: updatedProject,
    });
  } catch (err) {
    console.error("Error adding user to project:", err);
    return res.status(500).json({ message: "Internal server error." });
  }
};

// GET /api/projects/:projectId
const getProjectById = async (req, res) => {
  try {
    const { projectId } = req.params;
    console.log("getting for ", projectId);

    // ✅ UPDATED: simple, safe lookup
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // If later you want member user data, you can enrich here,
    // but for now just return the project document.
    return res.status(200).json({ project });
  } catch (err) {
    console.error("getProjectById error:", err);
    return res.status(500).json({
      message: "Internal server error",
      error: err.message,
    });
  }
};

module.exports = {
  createProject,
  getMyProjects,
  getProjectById,
  addUserToProject,
};