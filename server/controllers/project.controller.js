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
  roles: Array.isArray(roles) && roles.length > 0 ? [...roles, "owner"] : ["owner"],
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

module.exports = {
  createProject,
  getMyProjects,
};
