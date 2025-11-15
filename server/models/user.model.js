const mongoose = require("mongoose");

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 50,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true, 
      minlength: 6,
    },
    projects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project", 
      },
    ],
  },
  {
    timestamps: true,
  }
);

const User = model("User", userSchema);
export default User;
