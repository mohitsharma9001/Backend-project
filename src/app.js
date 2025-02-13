import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createServer, Server as HttpServer } from "node:http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import connectDB from "./db/index.js";

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
  socket.on("join", (userId) => {
    onlineUsers.set(userId, socket.id);
  });

  socket.on("likeBlog", ({ blogId, userId }) => {
    io.emit("updateLikes", { blogId, userId });
  });

  socket.on("commentBlog", ({ blogId, comment }) => {
    io.emit("updateComments", { blogId, comment });
  });

  socket.on("bookmarkBlog", ({ blogId, comment }) => {
    io.emit("updateBookmark", { blogId, comment });
  });

  socket.on("findRoom", (id) => {
    let result = chatRooms.filter((room) => room.id == id);
    socket.emit("foundRoom", result[0].messages);
  });

  socket.on("newMessage", (data) => {
    const { room_id, message, user, timestamp } = data;
    let result = chatRooms.filter((room) => room.id == room_id);
    const newMessage = {
      id: generateID(),
      text: message,
      user,
      time: `${timestamp.hour}:${timestamp.mins}`,
    };
    socket.to(result[0].name).emit("roomMessage", newMessage);
    result[0].messages.push(newMessage);
    socket.emit("roomsList", chatRooms);
    socket.emit("foundRoom", result[0].messages);
  });

  socket.on("disconnect", () => {
    for (let [key, value] of onlineUsers.entries()) {
      if (value === socket.id) {
        onlineUsers.delete(key);
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
