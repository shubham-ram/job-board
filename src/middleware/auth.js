import { Account } from "../models/account.model.js";
import AppError from "../utils/AppError.js";
import { verifyToken } from "../utils/jwt.js";

async function verifyJWT(req, res, next) {
  try {
    const { accessToken } = req.cookies;

    if (!accessToken) {
      throw new AppError("Unauthorized requies", 401);
    }

    const decoded = verifyToken(accessToken);

    const account = await Account.findById(decoded.accountId);

    if (!account) {
      throw new AppError("Invalid access token", 401);
    }

    req.account = account;

    next();
  } catch (error) {
    throw new AppError(error?.message || "Invalid access token", 401);
  }
}

export default verifyJWT;
