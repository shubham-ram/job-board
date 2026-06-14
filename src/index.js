import express from "express";
import cors from "cors";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

import "dotenv/config";

import connectDB from "./config/db.js";

const app = express();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 50,
  message: "Too many request",
  standardHeaders: "draft-8",
});

app.use(cors());
app.use(morgan("dev"));
app.use(limiter);

app.get("/", (req, res, next) => {
  let a = true;

  if (a) {
    next({ message: "testing err" });
  }
});

app.use((err, req, res, next) => {
  res.status(500).send(err.message);
});

connectDB().then(() => {
  app.listen("3000", () => {
    console.log("server started on port 3000");
  });
});
