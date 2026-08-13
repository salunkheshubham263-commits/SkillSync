const jwt = require("jsonwebtoken");
const config = require("../config/config");
const crypto = require("crypto");

const generateAccessToken = (userId) => {
  return jwt.sign(
    { id: userId },
    config.jwt_secret,
    { expiresIn: "15m" }
  );
};

const generateRefreshToken = (userId) => {
  return jwt.sign(
    { id: userId },
    config.jwt_secret,
    { expiresIn: "7d" }
  );
};

const generateGithubState = (userId) => {
  return jwt.sign(
    {
      id: userId,
      purpose: "github_oauth",
    },
    config.jwt_secret,
    {
      expiresIn: "10m",
    }
  );
};

const verifyToken = (token) => {
  return jwt.verify(token, config.jwt_secret);
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  generateGithubState,
  verifyToken,
};