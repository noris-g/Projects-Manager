const express = require("express");
const router = express.Router();

const {
  getMessages,
  sendMessage,
  getConversationsByProject,
} = require("../controllers/conversation.controller");

// Get all messages in a conversation
router.get("/:conversationId/messages", getMessages);

// Send a message to a conversation
router.post("/:conversationId/messages", sendMessage);

// Get conversations by project (legacy - keeping for compatibility)
router.get("/conversations", getConversationsByProject);

module.exports = router;