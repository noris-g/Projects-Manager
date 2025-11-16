// models/ChatMessage.ts
import mongoose from "mongoose";

const chatMessageSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    role: { type: String, enum: ["user", "assistant"], required: true },
    caseType: { type: Number, enum: [1, 2], required: true },
    subject: { type: String },
    content: { type: String, required: true },
    meta: { type: Object },
  },
  { timestamps: true }
);

export const ChatMessage = mongoose.model("ChatMessage", chatMessageSchema);
