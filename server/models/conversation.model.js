const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema({
  users: [
    {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      username: {
        type: String,
        required: true,
      },
    },
  ],
  messages: [
    {
      content: {
        type: String,
        required: true,
      },
      senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    },
    { timestamps: true },
  ],
});

const Conversation = mongoose.model("Conversation", conversationaaSchema);

module.exports = Conversation;