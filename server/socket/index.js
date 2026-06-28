import { Server } from "socket.io";

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    io.emit("clients:count", io.engine.clientsCount);

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
      io.emit("clients:count", io.engine.clientsCount);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.IO not initialized");
  }
  return io;
};
