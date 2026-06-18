import bcrypt from "bcryptjs";
import { Account } from "../models/account.model.js";
import AppError from "../utils/AppError.js";
import {
  generateRefreshToken,
  getHashedRefreshToken,
} from "../utils/refreshToken.js";
import { generateToken } from "../utils/jwt.js";

const registerAccount = async (payload) => {
  const { email, password } = payload;

  const existingAccount = await Account.findOne({ email });

  if (existingAccount) {
    throw new AppError("Account with this email already exits", 500);
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const refreshToken = generateRefreshToken();
  const hashedRefreshToken = getHashedRefreshToken(refreshToken);

  const account = await Account.create({
    ...payload,
    refreshToken: hashedRefreshToken,
    password: passwordHash,
  });

  const accessToken = generateToken(account._id);

  return {
    account,
    accessToken,
    refreshToken,
  };
};

const loginAccount = async (payload) => {
  const { email, password } = payload;

  const existingAccount = await Account.findOne({ email }).select(
    "+refreshToken"
  );

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

  const accessToken = generateToken(existingAccount._id);

  return {
    account: existingAccount,
    accessToken,
    refreshToken: existingAccount.refreshToken,
  };
};

const refreshAccessToken = async (payload) => {
  const { refreshToken } = payload;

  if (!refreshToken) {
    throw new AppError("unauthorized request", 401);
  }

  const hashedRefreshToken = getHashedRefreshToken(refreshToken);

  const account = await Account.findOne({ refreshToken: hashedRefreshToken });

  if (!account) {
    throw new AppError("Invalid Refresh token", 401);
  }

  const newAccessToken = generateToken(account._id);

  const newRefreshToken = generateRefreshToken();
  const hashedNewRefreshToken = getHashedRefreshToken(newRefreshToken);

  account.refreshToken = hashedNewRefreshToken;

  await account.save({ validateBeforeSave: false });

  return { newAccessToken, newRefreshToken };
};

const logoutAccount = async (payload) => {
  const { _id } = payload;

  if (!_id) {
    throw new AppError("Unauthorized Request", 401);
  }

  await Account.findByIdAndUpdate(_id, { $unset: { refreshToken: "" } });
};

export { registerAccount, loginAccount, refreshAccessToken, logoutAccount };
