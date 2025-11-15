const Project = require("../models/project.model");
const User = require("../models/user.model");

// POST /api/projects
// Body: { title, description?, roles? }
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

    // Create the project and add current user as a member
    const project = await Project.create({
      title,
      description: description || "",
      roles:
        Array.isArray(roles) && roles.length > 0
          ? [...roles, "owner"]
          : ["owner"],
      members: [], // empty on creation
    });

    // 2. Push user into members AFTER creation
    project.members.push({
      userId: user._id.toString(),
      role: "owner",
    });

    // 3. Save updated project
    await project.save();
    // Add project to the user's projects list
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

    if (!auth0Id || !role) {
      return res
        .status(400)
        .json({ message: "Both auth0Id and role are required." });
    }

    const user = await User.findOne({ email });
    const auth0Id = user?.auth0Id;

    if (!user) {
      return res.status(404).json({ message: `${email } not found.` });
    }

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

module.exports = {
  createProject,
  getMyProjects,
  addUserToProject,
};
