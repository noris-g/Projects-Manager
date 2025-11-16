const express = require("express");
const router = express.Router();

const {
  createProject,
  getMyProjects,
  getProjectById
} = require("../controllers/project.controller");
const { getProjectConversations } = require("../controllers/conversation.controller");

// Create a new project
router.post("/", createProject);

// Get all projects for logged-in user
router.get("/", getMyProjects);

// ✅ FIXED: Specific routes MUST come before parametric routes
// Get conversations for a specific project
router.get("/:projectId/conversations", getProjectConversations);

// Get one project by ID
router.get("/:projectId", getProjectById);

module.exports = router;