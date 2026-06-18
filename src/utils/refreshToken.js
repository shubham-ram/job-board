import crypto from "crypto";

export const generateRefreshToken = () => {
  return crypto.randomBytes(64).toString("hex");
};

export const getHashedRefreshToken = (refreshToken) => {
  const hash = crypto.createHash("sha256");
  hash.update(refreshToken);

  const hashedToken = hash.digest("hex");
  return hashedToken;
};
