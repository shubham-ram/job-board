const REFRESH_TOKEN_EXPIRY = 1000 * 60 * 60 * 24 * 7;

const REFRESH_TOKEN_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  maxAge: REFRESH_TOKEN_EXPIRY,
};

const ACCESS_TOKEN_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  maxAge: 1000 * 60 * 15,
};

export {
  REFRESH_TOKEN_EXPIRY,
  REFRESH_TOKEN_COOKIE_OPTIONS,
  ACCESS_TOKEN_COOKIE_OPTIONS,
};
