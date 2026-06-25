import jwt from "jsonwebtoken";
import { Account } from "../models/account.model.js";
import AppError from "../utils/AppError.js";
import { verifyToken } from "../utils/jwt.js";

async function verifyJWT(req, res, next) {
  const { accessToken } = req.cookies;

  if (!accessToken) {
    throw new AppError("Unauthorized request", 401);
  }

  let decoded;
  try {
    decoded = verifyToken(accessToken);
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new AppError("Access token expired", 401);
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new AppError("Invalid access token", 401);
    }
    throw error;
  }

  const account = await Account.findById(decoded.accountId);

  if (!account) {
    throw new AppError("Invalid access token", 401);
  }

  req.account = account;
  next();
}

export default verifyJWT;
