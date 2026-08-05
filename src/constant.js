const REFRESH_TOKEN_EXPIRY = 1000 * 60 * 60 * 24 * 7;

const ADMIN = "admin";
const COMPANY = "company";
const CANDIDATE = "candidate";

const isProd = process.env.NODE_ENV === "production";

const REFRESH_TOKEN_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProd,
  sameSite: "lax",
  maxAge: REFRESH_TOKEN_EXPIRY,
};

const ACCESS_TOKEN_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProd,
  sameSite: "lax",
  maxAge: 1000 * 60 * 15,
};

const RESUME_RESOURCE_TYPE = "raw";
const RESUME_FOLDER = "job-board/resume";

export {
  ADMIN,
  COMPANY,
  CANDIDATE,
  REFRESH_TOKEN_EXPIRY,
  REFRESH_TOKEN_COOKIE_OPTIONS,
  ACCESS_TOKEN_COOKIE_OPTIONS,
  RESUME_RESOURCE_TYPE,
  RESUME_FOLDER,
};
