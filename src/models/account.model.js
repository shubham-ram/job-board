import mongoose from "mongoose";

const accountSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    email: {
      type: String,
      unique: true,
      required: [true, "Email is required"],
    },
    password: {
      type: String,
      minlength: 6,
      required: [true, "Password is required"],
      select: false,
    },
    role: {
      type: String,
      enum: ["admin", "company", "candidate"],
      required: true,
    },
    refreshToken: {
      type: String,
      required: true,
      select: false,
    },
    resumeUrl: {
      type: String,
    },
  },
  { timestamps: true },
);

export const Account = mongoose.model("Account", accountSchema);
