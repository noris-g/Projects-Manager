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
  restrictedToRoles: {
    type: [String],
    default: [],
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
        required: false,  // ✅ FIXED: Made optional in case some users don't have nicknames
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
      senderAuth0Id: {
        type: String,
        required: false,
      },
      senderNickname: {
        type: String,
        required: false,
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
      flag: {
        flaggedByAI: {
          type: Boolean,
          default: false,
        },
        reason: {
          type: String,
          required: false,
        },
        severity: {
          type: String,
          enum: ["low", "medium", "high"],
          required: false,
        },
        flaggedAt: {
          type: Date,
          required: false,
        },
      },
    },
  ],
});

const Conversation = mongoose.model("Conversation", conversationSchema);

module.exports = Conversation;