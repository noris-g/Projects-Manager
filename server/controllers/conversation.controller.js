const Conversation = require("../models/conversation.model");
const mongoose = require("mongoose");

exports.createConversation = async (req, res) => {
  try {
    const { projectId, title, users } = req.body;

    if (!projectId || !title || !users) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    if (!mongoose.isValidObjectId(projectId)) {
      return res.status(400).json({ message: "Invalid projectId." });
    }

    const newConv = await Conversation.create({
      project: projectId,
      title,
      users,
      messages: [],
    });

    return res.status(201).json(newConv);
  } catch (err) {
    console.error("Error creating conversation:", err);
    return res.status(500).json({ message: "Internal server error." });
  }
};
