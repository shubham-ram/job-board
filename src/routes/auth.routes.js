import { Router } from "express";
import {
  registerAccount,
  loginAccount,
  refreshAccessToken,
  logoutAccount,
} from "../controllers/auth.controller.js";
import {
  ACCESS_TOKEN_COOKIE_OPTIONS,
  REFRESH_TOKEN_COOKIE_OPTIONS,
} from "../constant.js";

const router = Router();

router.post("/register", async (req, res) => {
  const payload = req.body;
  const { account, accessToken, refreshToken } = await registerAccount(payload);

  return res
    .status(201)
    .cookie("accessToken", accessToken, ACCESS_TOKEN_COOKIE_OPTIONS)
    .cookie("refreshToken", refreshToken, REFRESH_TOKEN_COOKIE_OPTIONS)
    .json(account);
});

router.post("/login", async (req, res) => {
  const payload = req.body;

  const { account, accessToken, refreshToken } = await loginAccount(payload);

  return res
    .status(201)
    .cookie("accessToken", accessToken, ACCESS_TOKEN_COOKIE_OPTIONS)
    .cookie("refreshToken", refreshToken, REFRESH_TOKEN_COOKIE_OPTIONS)
    .json(account);
});

router.post("/refresh", async (req, res) => {
  const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

  const { newAccessToken, newRefreshToken } = await refreshAccessToken({
    refreshToken,
  });

  res
    .status(200)
    .cookie("accessToken", newAccessToken, ACCESS_TOKEN_COOKIE_OPTIONS)
    .cookie("refreshToken", newRefreshToken, REFRESH_TOKEN_COOKIE_OPTIONS)
    .json("Access token refreshed");
});

router.post("/logout", async (req, res) => {
  const account = req.account;

  await logoutAccount(account);

  res
    .status(200)
    .clearCookie("accessToken")
    .clearCookie("refreshToken")
    .json("Logout successfully");
});

export default router;
