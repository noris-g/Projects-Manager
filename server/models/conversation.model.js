const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  users: [
    {
      id: {
        type: String,
        ref: "User",
        required: true,
      },
      nickname: {
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
      flag: {
        flaggedByAI: {
          type: Boolean,
          default: false,
        },
        reason: {
          type: String,
          required: true,
        },
      },
    },
    { timestamps: true },
  ],
});

const Conversation = mongoose.model("Conversation", conversationSchema);

module.exports = Conversation;
