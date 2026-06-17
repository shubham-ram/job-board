import { Router } from "express";
import { registerAccount } from "../controllers/auth.controller.js"

const router = Router()

router.post("/register", async (req, res) => {
  const payload = req.body
  const { account, accessToken, refreshToken } = await registerAccount(payload)

  const cookieOption = {
    httpOnly: true,
    secure: true
  }

  res.cookie("accessToken", accessToken, { ...cookieOption, maxAge: 1000 * 60 * 30 })
  res.cookie("refreshToken", refreshToken, { ...cookieOption, maxAge: 1000 * 60 * 60 * 24 * 30 })
  res.status(201).json(account)
})