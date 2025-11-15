const express = require("express");
const cors = require("cors");
const connectedToDB = require("./config/connectToDB");
const { app, server } = require("./socket/socket");
const userRoutes = require("./routes/user.routes");
const projectRoutes = require("./routes/project.routes");

app.use(cors());
app.use(express.json());
app.use("/api/users", userRoutes);
app.use("/api/projects", projectRoutes);

server.listen(3000, () => {
  connectedToDB();
  console.log("Server is running");
});

module.exports = {}