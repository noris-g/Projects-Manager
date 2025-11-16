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

// ⭐ NEW — Get one project by ID (with populated members)
router.get("/:projectId", getProjectById);
router.get("/conversations", getProjectConversations);

module.exports = router;
