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


const verifyToken = (token) => {
  return jwt.verify(token, config.jwt_secret);
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
};