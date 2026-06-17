import bcrypt from "bcryptjs";
import { Account } from "../models/account.model.js";
import AppError from "../utils/AppError.js";
import { generateRefreshToken } from "../utils/refreshToken.js";
import { generateToken } from "../utils/jwt.js";

const registerAccount = async (payload) => {
  const { email, password } = payload;

  const existingAccount = Account.findOne({ email });

  if (existingAccount) {
    throw new AppError("Account with this email already exits", 500);
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const refreshToken = generateRefreshToken();

  const account = await Account.create({
    ...payload,
    refreshToken,
    password: passwordHash,
  });

  const accessToken = generateToken(account);

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

  const isPasswordMatch = await bcrypt.compare(password, existingAccount);

  if (!isPasswordMatch) {
    throw new AppError("Incorrect Password", 401);
  }

  const accessToken = generateToken(existingAccount);

  return {
    account: existingAccount,
    accessToken,
    refreshToken: existingAccount.refreshToken,
  };
};

const refreshAccessToken = async (payload) => {
  const { refreshToken } = payload;

  if (!refreshAccessToken) {
    throw new AppError("unauthorized request", 401);
  }

  const account = Account.findOne({ refreshToken });

  if (!account) {
    throw new AppError("Invalid Refresh token", 401);
  }

  const newRefreshToken = generateRefreshToken();
  const newAccessToken = generateToken(account);

  account.refreshToken = newRefreshToken;

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
