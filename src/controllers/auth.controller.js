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

  const existingAccount = await Account.findOne({ email }).select(
    "+refreshToken +password +refreshTokenExpiresAt"
  );

  if (!existingAccount) {
    throw new AppError("No User Found", 404);
  }

  let {
    password: storedPassword,
    refreshTokenExpiresAt,
    refreshToken,
    ...rest
  } = existingAccount.toObject();

  const isPasswordMatch = await bcrypt.compare(password, storedPassword);

  if (!isPasswordMatch) {
    throw new AppError("Incorrect Password", 401);
  }

  const isRefreshTokenExpired =
    !refreshToken || refreshTokenExpiresAt < new Date();

  if (isRefreshTokenExpired) {
    refreshToken = generateRefreshToken();
    const hashedRefreshToken = getHashedRefreshToken(refreshToken);

    existingAccount.refreshToken = hashedRefreshToken;
    existingAccount.refreshTokenExpiresAt = new Date(
      Date.now() + REFRESH_TOKEN_EXPIRY
    );

    await existingAccount.save({ validateBeforeSave: false });
  }

  const accessToken = generateToken({ accountId: existingAccount._id });

  return {
    account: rest,
    accessToken,
    refreshToken: refreshToken,
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

  const newAccessToken = generateToken({ accountId: account._id });

  return { newAccessToken };
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
