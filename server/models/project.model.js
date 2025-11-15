const mongoose = require("mongoose");

const projectSchema = new Schema(
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
    members: [{
        userId:{
            type:String,
            required:true
        }
    }],

    roles: [{
        type:String,
        required:true
    }],

    events: {
        idEvent:{type:mongoose.Schema.Types.ObjectId, ref:"event"}
    },
  },
  {
    timestamps: true,  
  }
);
