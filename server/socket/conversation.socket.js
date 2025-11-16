const Conversation = require("../models/conversation.model");

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // User joins a conversation room
    socket.on("join_conversation", (conversationId) => {
      socket.join(conversationId);
      console.log(`User joined conversation ${conversationId}`);
    });

    // Handle sending a message
    socket.on("send_message", async (data) => {
      const { conversationId, senderId, content } = data;

      // Save to DB
      const updatedConv = await Conversation.findByIdAndUpdate(
        conversationId,
        {
          $push: {
            messages: {
              content,
              senderId,
              flag: { flaggedByAI: false, reason: "" }
            }
          }
        },
        { new: true }
      );

      const newMessage =
        updatedConv.messages[updatedConv.messages.length - 1];

      // Broadcast to room
      io.to(conversationId).emit("receive_message", newMessage);
    });
  });
};
