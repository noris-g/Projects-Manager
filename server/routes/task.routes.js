const express = require("express");
const router = express.Router();


const {
  createTask,
  getTasksByProject,
  getTasksByUser,
} = require("../controllers/task.controller.js");

// POST create task
router.post("/", createTask);

// GET tasks for a project
router.get("/project/:projectId", getTasksByProject);

// GET tasks for a user
router.get("/user/:userId", getTasksByUser);

module.exports = router;
