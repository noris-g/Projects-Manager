const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },

    deadline: { type: Date, default: null },

    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },

    // Users assigned to the task
    assignedUsers: [{userId:{ type: String, ref: "User" }}],

    // The user who created the task
    createdBy: { type: String, ref: "User", required: true },

    // Link to project (optional)
    projectId: { type: String, ref: "Project", default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Task", taskSchema);
