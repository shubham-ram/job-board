import bcrypt from "bcryptjs";
import { Account } from "../models/account.model.js";
import {
  generateRefreshToken,
  getHashedRefreshToken,
} from "../utils/refreshToken.js";
import { REFRESH_TOKEN_EXPIRY } from "../constant.js";

export async function createAccount(payload) {
  const { password } = payload;
  const passwordHash = await bcrypt.hash(password, 12);

  const refreshToken = generateRefreshToken();
  const hashedRefreshToken = getHashedRefreshToken(refreshToken);

  const account = await Account.create({
    ...payload,
    refreshToken: hashedRefreshToken,
    password: passwordHash,
    refreshTokenExpiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY),
  });

  return { account, refreshToken };
}
