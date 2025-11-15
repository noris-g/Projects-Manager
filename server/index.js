const express = require("express");
const cors = require("cors");
const connectToDB = require("./config/connectToDB");

const app = express();

app.use(cors());
app.use(express.json());

app.listen(3001, async () => {
  console.log("Server is running...");
  await connectToDB();
});
