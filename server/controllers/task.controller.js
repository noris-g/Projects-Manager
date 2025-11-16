const Task = require("../models/task.model");
const User = require("../models/user.model");

/**
 * POST /api/tasks
 * Create a new task
 */
const createTask = async (req, res) => {
  try {
    const { title, deadline, priority, assignedUsers, createdBy, projectId } = req.body;

    if (!title || !createdBy) {
      return res.status(400).json({ message: "Title and createdBy are required" });
    }

    // Validate creator
    const creator = await User.findOne({auth0Id: createdBy});
    if (!creator) return res.status(404).json({ message: "Creator not found" });

    // Validate assigned users
    let validAssigned = [];
    if (assignedUsers && assignedUsers.length > 0) {
      validAssigned = await User.find({
        auth0Id: { $in: assignedUsers }
      }).select("_id");
    }

    const task = await Task.create({
      title,
      deadline,
      priority,
      assignedUsers: validAssigned.map((u) => u.auth0Id),
      createdBy,
      projectId: projectId || null
    });

    res.status(201).json({ message: "Task created", task });

  } catch (err) {
    console.error("createTask error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

/**
 * GET /api/tasks/project/:projectId
 */
// const getTasksByProject = async (req, res) => {
//   try {
//     const { projectId } = req.params;

//     const tasks = await Task.find({ projectId });

//     // Convert assignedUsers/auth0Id → user documents
//     const allAuth0Ids = [
//       ...new Set([
//         ...tasks.flatMap(t => t.assignedUsers),
//         ...tasks.map(t => t.createdBy)
//       ])
//     ];

//     const users = await User.find(
//       { auth0Id: { $in: allAuth0Ids } },
//       "nickname email auth0Id"
//     );

//     // Attach user objects
//     const tasksWithUsers = tasks.map(task => ({
//       ...task._doc,
//       createdBy: users.find(u => u.auth0Id === task.createdBy) || null,
//       assignedUsers: users.filter(u => task.assignedUsers.includes(u.auth0Id))
//     }));

//     return res.status(200).json({ tasks: tasksWithUsers });
//   } catch (err) {
//     console.error("getTasksByProject error:", err);
//     return res.status(500).json({
//       message: "Server error fetching tasks",
//       error: err.message,
//     });
//   }
// };

const getTasksByProject = async (req, res) => {
  try {
    const tasks = await Task.find({ projectId: req.params.projectId })
      .populate({
  path: "assignedUsers",
  match: { auth0Id: { $exists: true } },
  select: "nickname email auth0Id",
  localField: "assignedUsers",
  foreignField: "auth0Id"
})
.populate({
  path: "createdBy",
  match: { auth0Id: { $exists: true } },
  select: "nickname email auth0Id",
  localField: "createdBy",
  foreignField: "auth0Id"
})
      .sort({ deadline: 1 });

    res.json({ tasks });
  } catch (err) {
    console.error("getTasksByProject error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

/**
 * GET /api/tasks/user/:userId
 */
const getTasksByUser = async (req, res) => {
  try {
    const tasks = await Task.find({ assignedUsers: req.params.userId })
      .populate("assignedUsers", "nickname email")
      .populate("createdBy", "nickname email")
      .sort({ deadline: 1 });

    res.json({ tasks });
  } catch (err) {
    console.error("getTasksByUser error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = {
  createTask,
  getTasksByProject,
  getTasksByUser
};
