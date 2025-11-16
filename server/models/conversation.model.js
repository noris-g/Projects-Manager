const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
    },
    senderId: {
      type: String, // <-- CHANGED from ObjectId to String
      required: true,
    },
    flag: {
      flaggedByAI: {
        type: Boolean,
        default: false,
      },
      reason: {
        type: String,
        default: "", // <-- CHANGED, no longer required
      },
    },
  },
  { timestamps: true }
);

const conversationSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Project",
    },
    title: {
      type: String,
      required: true,
    },
    users: [
      {
        id: {
          type: String, // if you want ObjectId, change to Schema.Types.ObjectId
          required: true,
        },
        nickname: {
          type: String,
          required: true,
        },
      },
    ],
    messages: [messageSchema], // <-- FIXED, timestamps now apply correctly
  },
  { timestamps: true }
);

module.exports = mongoose.model("Conversation", conversationSchema);
