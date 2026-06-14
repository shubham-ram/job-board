import express from "express";
import cors from "cors";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

import "dotenv/config";

import connectDB from "./config/db.js";
import helmet from "helmet";

const app = express();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 50,
  message: "Too many request",
  standardHeaders: "draft-8",
});

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(limiter);

app.get("/", (req, res, next) => {
  let a = true;

  if (a) {
    next({ message: "testing err" });
  }
});

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : "Something went wrong";

  console.log("err >>", err); // always log the full error server-side

  res.status(statusCode).json({
    success: false,
    message,
  });
});

const PORT = process.env.PORT || 3000;
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log("server started on port 3000");
  });
});
