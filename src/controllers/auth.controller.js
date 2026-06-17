import bcrypt from "bcryptjs";
import { Account } from "../models/account.model";
import AppError from "../utils/AppError";
import { generateRefreshToken } from "../utils/refreshToken";
import { generateToken } from "../utils/jwt";

const registerAccount = async (payload) => {
  const { email, password } = payload;

  const existingAccount = Account.findOne({ email });

  if (existingAccount) {
    throw new AppError("Account with this email already exits", 500);
  }

  try {

    const passwordHash = await bcrypt.hash(password, 12);

    const refreshToken = generateRefreshToken();

    const account = await Account.create({ ...payload, refreshToken, password: passwordHash })

    const accessToken = generateToken(account)

    return {
      account,
      accessToken,
      refreshToken
    }

  } catch (error) {
    throw error
  }
};

const loginAccount = () => { };

export { registerAccount, loginAccount };
