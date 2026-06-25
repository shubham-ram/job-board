import bcrypt from "bcryptjs";
import { Account } from "../models/account.model.js";
import AppError from "../utils/AppError.js";
import {
  generateRefreshToken,
  getHashedRefreshToken,
} from "../utils/refreshToken.js";
import { generateToken } from "../utils/jwt.js";
import { REFRESH_TOKEN_EXPIRY } from "../constant.js";

const registerAccount = async (payload) => {
  const { email, password } = payload;

  const existingAccount = await Account.findOne({ email });

  if (existingAccount) {
    throw new AppError("Account with this email already exists", 409);
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const refreshToken = generateRefreshToken();
  const hashedRefreshToken = getHashedRefreshToken(refreshToken);

  const account = await Account.create({
    ...payload,
    refreshToken: hashedRefreshToken,
    password: passwordHash,
    refreshTokenExpiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY),
  });

  const accessToken = generateToken({ accountId: account._id });

  const { password: _p, refreshToken: _r, ...rest } = account.toObject();

  return {
    account: rest,
    accessToken,
    refreshToken,
  };
};

const loginAccount = async (payload) => {
  const { email, password } = payload;

  const existingAccount = await Account.findOne({ email }).select("+password");

  if (!existingAccount) {
    throw new AppError("No User Found", 404);
  }

  const isPasswordMatch = await bcrypt.compare(
    password,
    existingAccount.password
  );

  if (!isPasswordMatch) {
    throw new AppError("Incorrect Password", 401);
  }

  const refreshToken = generateRefreshToken();
  existingAccount.refreshToken = getHashedRefreshToken(refreshToken);
  existingAccount.refreshTokenExpiresAt = new Date(
    Date.now() + REFRESH_TOKEN_EXPIRY
  );
  await existingAccount.save({ validateBeforeSave: false });

  const accessToken = generateToken({ accountId: existingAccount._id });

  const {
    password: _p,
    refreshToken: _r,
    ...rest
  } = existingAccount.toObject();

  return {
    account: rest,
    accessToken,
    refreshToken,
  };
};

const refreshAccessToken = async (payload) => {
  const { refreshToken } = payload;

  if (!refreshToken) {
    throw new AppError("unauthorized request", 401);
  }

  const hashedRefreshToken = getHashedRefreshToken(refreshToken);

  const account = await Account.findOne({
    refreshToken: hashedRefreshToken,
  }).select("+refreshTokenExpiresAt");

  if (!account) {
    throw new AppError("Invalid Refresh token", 401);
  }

  const isRefreshTokenExpired =
    !account.refreshTokenExpiresAt ||
    account.refreshTokenExpiresAt < new Date();

  if (isRefreshTokenExpired) {
    throw new AppError("Refresh token expired, please login", 401);
  }

  const newRefreshToken = generateRefreshToken();
  account.refreshToken = getHashedRefreshToken(newRefreshToken);
  account.refreshTokenExpiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY);
  await account.save({ validateBeforeSave: false });

  const newAccessToken = generateToken({ accountId: account._id });

  return { newAccessToken, newRefreshToken };
};

const logoutAccount = async (payload) => {
  const { _id } = payload;

  if (!_id) {
    throw new AppError("Unauthorized Request", 401);
  }

  await Account.findByIdAndUpdate(_id, {
    $unset: { refreshToken: "", refreshTokenExpiresAt: "" },
  });
};

export { registerAccount, loginAccount, refreshAccessToken, logoutAccount };
