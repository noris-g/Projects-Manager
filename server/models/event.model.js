const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    startAt: {
      type: Date,
      required: true,
    },
    endAt: {
      type: Date,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    access:[{
        userId:mongoose.Schema.Types.ObjectId,
        ref:"User",
        username:{
            type:String
        },
        required:true
    }]
  },
  { timestamps: true }
)

const Event = mongoose.model("Event", eventSchema);

module.exports = Event;