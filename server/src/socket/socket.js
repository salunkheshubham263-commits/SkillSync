const { Server } = require("socket.io");
const jwt = require("../utils/jwt");

const initializeSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: [
        "http://localhost:5173",
        "http://192.168.0.111:5173",
      ],
      credentials: true,
    },
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error("Unauthorized"));
      }

      const decoded = jwt.verifyToken(token);

      socket.user = {
        id: decoded.id,
      };

      next();
    } catch (err) {
      console.error("Socket authentication error:", err.message);
      next(new Error("Invalid or expired token"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`User ${socket.user.id} connected`);

    socket.join(`user:${socket.user.id}`);

    console.log(
      `User ${socket.user.id} joined room user:${socket.user.id}`
    );

    socket.on("disconnect", () => {
      console.log(`User ${socket.user.id} disconnected`);
    });
  });

  return io;
};

module.exports = initializeSocket;