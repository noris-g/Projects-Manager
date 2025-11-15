const mongoose = require("mongoose");
require("dotenv").config();

const MONGO_URI = process.env.MONGO_URI;

const connectToDB = async () => {
  try {
    mongoose.connect(MONGO_URI);
    console.log("Connected To Database...");
  } catch (error) {
    console.log(
      "There was an error while trying to connect to the Database: \n",
      error
    );
    process.exit(1);
  }
};

mongoose.connection.on("disconnected", () => {
  console.log("Database disconnected");
});

mongoose.connection.on("error", (error) => {
  console.error("Database error: ", error);
});

module.exports = connectToDB;
