const express = require("express");
const router = express.Router();

const {
  createProject,
  getMyProjects,
} = require("../controllers/project.controller");

// Create a new project for the logged-in user
router.post("/", createProject);

// Get all projects for the logged-in user
router.get("/projects", getMyProjects);

module.exports = router;
