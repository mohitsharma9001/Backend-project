import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
const app = express();
// app.use(cors({
//     origin: '*',
//     methods: 'GET,POST,PUT,DELETE',
//     allowedHeaders: 'Content-Type,Authorization'
// }));
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// routes import

import userRouter from "./routes/user.route.js";
import blogRouter from "./routes/blog.route.js";
import reportRouter from "./routes/report.route.js";
// routes declaration
app.use("/api/v1/users", userRouter);
app.use("/api/v1/blog", blogRouter);
app.use("/api/v1/report", reportRouter);

export { app };
