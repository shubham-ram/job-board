import bcrypt from "bcryptjs";
import { Account } from "../models/account.model";
import AppError from "../utils/AppError";

const registerAccount = async (payload) => {
  const { email, password } = payload;

  const account = Account.findOne({ email });

  if (account) {
    throw new AppError("Account with this email already exits", 500);
  }

  const passwordHash = await bcrypt.hash(password, 12);
  console.log("passwordHash >>", passwordHash);
};

const loginAccount = () => {};

export { registerAccount, loginAccount };
