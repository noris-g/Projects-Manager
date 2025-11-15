const express = require("express");
const cors = require("cors");
const connectedToDB = require("./config/connectToDB");
const { app, server } = require("./socket/socket");

app.use(cors());
app.use(express.json());

server.listen(3001, () => {
  connectedToDB();
  console.log("Server is running");
});

module.exports = {}