import { io } from "socket.io-client";

export const socket = io("http://localhost:3000", {
  autoConnect: true
});

socket.on("connect", () => {
  console.log("Connected to socket server:", socket.id);
});

socket.on("connect_error", (err) => {
  console.error("Connection error:", err.message);
});
