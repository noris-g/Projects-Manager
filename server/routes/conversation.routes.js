const express = require("express");
const router = express.Router();

const {
  getConversationsByProject
} = require("../controllers/conversation.controller");

router.get("/", getConversationsByProject);

module.exports = router;
