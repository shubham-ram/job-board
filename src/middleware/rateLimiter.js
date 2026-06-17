import rateLimit from "express-rate-limit";

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 50,
  message: "Too many request",
  standardHeaders: "draft-8",
});
