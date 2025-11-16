// controllers/conversationController.js
const mongoose = require("mongoose");
const Conversation = require("../models/conversation.model");

exports.getConversationsByProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    if (!projectId) {
      return res.status(400).json({ message: "projectId is required." });
    }

    if (!mongoose.isValidObjectId(projectId)) {
      return res.status(400).json({ message: "Invalid projectId." });
    }

    // users.id is a String (auth0Id), so we just return it as-is
    const conversations = await Conversation.find({ project: projectId }).lean();

    return res.status(200).json(conversations);
  } catch (err) {
    console.error("Error getting conversations by projectId:", err);
    return res.status(500).json({ message: "Internal server error." });
  }
};

exports.getProjectConversations = async (req, res) => {
  try {
    const { projectId } = req.params;

    if (!projectId) {
      return res.status(400).json({ message: "projectId is required." });
    }

    if (!mongoose.isValidObjectId(projectId)) {
      return res.status(400).json({ message: "Invalid projectId." });
    }

    // conversations remember the project id in `project`
    const conversations = await Conversation.find({ project: projectId }).lean();

    return res.status(200).json(conversations);
  } catch (err) {
    console.error("Error getting conversations for project:", err);
    return res.status(500).json({ message: "Internal server error." });
  }
};
