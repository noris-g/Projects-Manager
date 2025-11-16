const Conversation = require("../models/conversation.model");

exports.getMessagesByConversation = async (req, res) => {
  try {
    const { id } = req.params;

    const conversation = await Conversation.findById(id).lean();

    if (!conversation)
      return res.status(404).json({ message: "Conversation not found" });

    return res.json(conversation.messages);
  } catch (err) {
    console.error("Error getting messages:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
