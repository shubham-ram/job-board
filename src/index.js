import "dotenv/config";

import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import cookieParser from "cookie-parser";

import gracefulShutdown from "./utils/gracefulShutdown.js";
import connectDB from "./config/db.js";
import { globalLimiter } from "./middleware/rateLimiter.js";

import authRoutes from "./routes/auth.routes.js";

const app = express();

app.use(helmet());
app.use(morgan("dev"));

app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(",") ?? true,
    credentials: true,
  })
);

app.use(globalLimiter);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.use("/auth", authRoutes);

app.get("/health", (req, res) => {
  res.status(200).send("Working fine");
});

app.use((err, req, res, _next) => {
  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : "Something went wrong";

  console.error("err >>", err); // always log the full error server-side

  res.status(statusCode).json({
    success: false,
    message,
  });
});

let server;
const PORT = process.env.PORT || 3000;

connectDB().then(() => {
  server = app.listen(PORT, () => {
    console.log(`server started on port ${PORT}`);
  });
});

process.on("SIGTERM", () => gracefulShutdown(server, "SIGTERM"));
process.on("SIGINT", () => gracefulShutdown(server, "SIGINT"));
