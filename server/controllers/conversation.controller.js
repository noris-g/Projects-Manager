const mongoose = require("mongoose");
const Conversation = require("../models/conversation.model");
const User = require("../models/user.model");

// GET /api/conversations/:conversationId/messages
exports.getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;

    if (!mongoose.isValidObjectId(conversationId)) {
      return res.status(400).json({ message: "Invalid conversationId" });
    }

    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    // Return messages with sender info
    return res.status(200).json({
      messages: conversation.messages || [],
      conversationTitle: conversation.title,
    });
  } catch (err) {
    console.error("Error getting messages:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// POST /api/conversations/:conversationId/messages
exports.sendMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { content, auth0Id } = req.body;

    if (!content || !auth0Id) {
      return res.status(400).json({ message: "content and auth0Id are required" });
    }

    if (!mongoose.isValidObjectId(conversationId)) {
      return res.status(400).json({ message: "Invalid conversationId" });
    }

    // Find the conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    // Find the user
    const user = await User.findOne({ auth0Id });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user is part of this conversation
    const isParticipant = conversation.users.some((u) => u.id === auth0Id);
    if (!isParticipant) {
      return res.status(403).json({ message: "You are not a participant in this conversation" });
    }

    // Create new message
    const newMessage = {
      content,
      senderId: user._id,
      senderAuth0Id: auth0Id, // Add this for easy lookup
      senderNickname: user.nickname || user.email || "Unknown",
      timestamp: new Date(),
    };

    // Add message to conversation
    conversation.messages.push(newMessage);
    await conversation.save();

    // Return the newly created message
    const savedMessage = conversation.messages[conversation.messages.length - 1];

    return res.status(201).json({
      message: "Message sent successfully",
      data: savedMessage,
    });
  } catch (err) {
    console.error("Error sending message:", err);
    return res.status(500).json({ message: "Internal server error", error: err.message });
  }
};

// GET /api/conversations/:projectId (already exists - keep it)
exports.getConversationsByProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    if (!projectId) {
      return res.status(400).json({ message: "projectId is required." });
    }

    if (!mongoose.isValidObjectId(projectId)) {
      return res.status(400).json({ message: "Invalid projectId." });
    }

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

    const conversations = await Conversation.find({ project: projectId }).lean();

    return res.status(200).json(conversations);
  } catch (err) {
    console.error("Error getting conversations for project:", err);
    return res.status(500).json({ message: "Internal server error." });
  }
};