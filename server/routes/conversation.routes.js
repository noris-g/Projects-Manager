const express = require("express");
const router = express.Router();
const {
  getConversationsByProject,
  createConversation,
} = require("../controllers/conversation.controller");

router.get("/", getConversationsByProject);
router.post("/", createConversation); // 👈 ADD THIS

module.exports = router;
