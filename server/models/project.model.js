const mongoose = require("mongoose");
const { required } = require("nodemon/lib/config");

const projectSchema = new mongoose.Schema(
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
    members: [
      {
        userId: {
          type: String,
          required: true,
        },
        role: {
          type: String,
          required: true,
          validate: {
            validator: function (value) {
              // `this` is the member subdocument
              const projectDoc = this.parent(); // the parent Project document

              return (
                Array.isArray(projectDoc.roles) &&
                projectDoc.roles.includes(value)
              );
            },
            message: (props) =>
              `${props.value} is not a valid role for this project`,
          },
        },
      },
    ],

    roles: [
      {
        type: String,
        required: true,
      },
    ],
    conversations: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Conversation" },
    ],

    events: {
      idEvent: { type: mongoose.Schema.Types.ObjectId, ref: "event" },
    },
  },
  {
    timestamps: true,
  }
);

const Project = mongoose.model("Project", projectSchema);

module.exports = Project;
