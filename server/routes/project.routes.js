const express = require("express");
const router = express.Router();

const {
  createProject,
  getMyProjects,
  getProjectById
} = require("../controllers/project.controller");

// Create a new project
router.post("/", createProject);

// Get all projects for logged-in user
router.get("/", getMyProjects);

// ⭐ NEW — Get one project by ID (with populated members)
router.get("/:projectId", getProjectById);

module.exports = router;
