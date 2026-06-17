import { Account } from "../models/account.model.js";
import AppError from "../utils/AppError.js";
import { verifyToken } from "../utils/jwt.js";

function verifyJWT(req, res, next) {
  try {
    const { accessToken } = req.cookies;

    if (!accessToken) {
      throw new AppError("Unauthorized requies", 401);
    }

    const account = verifyToken(accessToken);

    req.account = account;

    next();
  } catch (error) {
    throw new AppError(error?.message || "Invalid access token", 401);
  }
}

export default verifyJWT;
