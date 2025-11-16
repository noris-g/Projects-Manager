const express = require("express");
const router = express.Router();

const {
  getConversationsByProject
} = require("../controllers/conversation.controller");

router.get("/conversations", getConversationsByProject);

module.exports = router;
