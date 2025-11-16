const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema({
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
      flaggedIncorrect: {
        type: Boolean,
        default: false,
      },
      flaggedMessage: {
        type: String,
        default: "",
      },
    },
    { timestamps: true },
  ],
});

const Conversation = mongoose.model("Conversation", conversationSchema);

module.exports = Conversation;
