const http = require("http");
const express = require("express");
const { Server } = require("socket.io");
const User = require("../models/user.model");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});
// Load conversation socket logic
require("./conversation.socket")(io);

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  // 1️⃣ Listen for client sending a message
  socket.on("send_message", (data) => {
    console.log("📩 Message received on server:", data);

    // optional: save to database here...

    // 2️⃣ Emit to ALL other clients in the conversation
    io.emit("new_message", data); 
    // (we will refine this to room-based later)
  });
});

// ... keep your online user logic here ...
module.exports = { server, app, io };
