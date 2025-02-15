import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createServer, Server as HttpServer } from "node:http";
import { Server } from "socket.io";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const app = express();

// CORS configuration
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// Create HTTP server
const server = createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  },
});

// Store connected users
const onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log(`New user connected: ${socket.id}`);

  // Register user with socket ID
  socket.on("join", (userId) => {
    onlineUsers.set(userId, socket.id);
    console.log(`User ${userId} connected with socket ${socket.id}`);
  });

  // Handle private messaging
  socket.on("sendMessage", ({ senderId, receiverId, message }) => {
    const receiverSocketId = onlineUsers.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("receiveMessage", { senderId, message });
    }
  });

  // Blog interactions
  socket.on("likeBlog", ({ blogId, userId }) => {
    io.emit("updateLikes", { blogId, userId });
  });

  socket.on("commentBlog", ({ blogId, comment }) => {
    io.emit("updateComments", { blogId, comment });
  });

  socket.on("bookmarkBlog", ({ blogId, comment }) => {
    io.emit("updateBookmark", { blogId, comment });
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    for (let [key, value] of onlineUsers.entries()) {
      if (value === socket.id) {
        onlineUsers.delete(key);
        console.log(`User ${key} disconnected`);
      }
    }
  });
});

// Attach Socket.io to req
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes import
import userRouter from "./routes/user.route.js";
import blogRouter from "./routes/blog.route.js";
import reportRouter from "./routes/report.route.js";
import bookmarkRouter from "./routes/bookmark.route.js";

// Routes declaration
app.use("/api/v1/users", userRouter);
app.use("/api/v1/blog", blogRouter);
app.use("/api/v1/report", reportRouter);
app.use("/api/v1/bookmark", bookmarkRouter);

export { app, io, server };
