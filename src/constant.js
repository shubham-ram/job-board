const REFRESH_TOKEN_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  maxAge: 1000 * 60 * 60 * 24 * 7,
};

const ACCESS_TOKEN_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  maxAge: 1000 * 60 * 15,
};

export { REFRESH_TOKEN_COOKIE_OPTIONS, ACCESS_TOKEN_COOKIE_OPTIONS };
