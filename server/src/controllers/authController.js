const crypto = require("crypto");
const pool = require("../config/db");
const sendEmail = require("../services/emailService");
const sendOtp = require("../utils/sendotp");
const { generateOtp, getOtpHtml } = require("../utils/otpGeneration");

const {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
} = require("../utils/jwt");

const signUpUser = async (req, res) => {
  try {
    const { first_name, last_name, username, email, age, password } = req.body;

    const hashedPassword = crypto
      .createHash("sha256")
      .update(password)
      .digest("hex");
    const signUp = await pool.query(
      "insert into users (first_name, last_name, username, email, age, password) values ($1,$2,$3,$4,$5,$6) RETURNING *",
      [first_name, last_name, username, email, age, hashedPassword],
    );
    await sendOtp(signUp.rows[0].user_id, signUp.rows[0].email);

    res.status(201).json({
      message: "User registered successfully. Please verify your email.",
      user: {
        username: signUp.rows[0].username,
        email: signUp.rows[0].email,
        verified: signUp.rows[0].verified,
      },
    });
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const getMe = async (req, res) => {
  try {
    const userResult = await pool.query(
      "select * from users where user_id = $1",
      [req.user.id],
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = userResult.rows[0];

    res.status(200).json({
      message: "User fetched successfully",
      user: {
        id: user.user_id,
        first_name: user.first_name,
        last_name: user.last_name,
        username: user.username,
        email: user.email,
        completeProfile: user.complete_profile,
      },
    });
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const refreshToken = async (req, res) => {
  try {
    const refreshTokenFromCookie = req.cookies?.refreshToken;

    if (!refreshTokenFromCookie) {
      return res.status(401).json({
        message: "Refresh token not found",
      });
    }

    const decoded = verifyToken(refreshTokenFromCookie);

    const refreshTokenHash = crypto
      .createHash("sha256")
      .update(refreshTokenFromCookie)
      .digest("hex");

    const session = await pool.query(
      "select * from sessions where refresh_token_hash = $1 and is_revoked=false",
      [refreshTokenHash],
    );
    if (session.rows.length === 0) {
      return res.status(401).json({
        message: "Invalid refresh token",
      });
    }

    const accessToken = generateAccessToken(decoded.id);
    const newRefreshToken = generateRefreshToken(decoded.id);

    const newRefreshTokenHash = crypto
      .createHash("sha256")
      .update(newRefreshToken)
      .digest("hex");

    await pool.query(
      "update sessions set refresh_token_hash = $1 where session_id = $2",
      [newRefreshTokenHash, session.rows[0].session_id],
    );

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const user = await pool.query("select * from users where user_id = $1", [
      decoded.id,
    ]);

    return res.status(200).json({
      message: "Access token refreshed successfully",
      accessToken,
      user: {
        id: user.rows[0].user_id,
        email: user.rows[0].email,
        username: user.rows[0].username,
        completeProfile: user.rows[0].complete_profile,
      },
    });
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({
      message: "Token refresh failed",
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const dcrypt = crypto.createHash("sha256").update(password).digest("hex");

    const login = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (login.rows.length === 0) {
      return res.status(404).json({
        message: "Invalid Email Id!",
      });
    }

    const user = login.rows[0];

    if (user.password !== dcrypt) {
      return res.status(401).json({
        message: "Incorrect Password!",
      });
    }

    if (!user.verified) {
      await sendOtp(user.user_id, user.email);
      return res.status(200).json({
        verify: false,
        email: user.email,
        message: "Email not verified",
      });
    }

    const accessToken = generateAccessToken(user.user_id);
    const refreshToken = generateRefreshToken(user.user_id);

    const refreshTokenHash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    await pool.query(
      "insert into sessions (user_id, refresh_token_hash, ip_address, user_agent, expires_at) values ($1,$2,$3,$4,$5)",
      [
        user.user_id,
        refreshTokenHash,
        req.ip,
        req.headers["user-agent"],
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      ],
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "Login successful",
      accessToken,
      user: {
        id: user.user_id,
        email: user.email,
        username: user.username,
        completeProfile: user.complete_profile,
      },
      verify: user.verified,
      completeProfile: user.complete_profile,
    });
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const logoutUser = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(400).json({
        message: "refresh token not found",
      });
    }
    const refreshTokenHash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    await pool.query(
      "update sessions set is_revoked = true where refresh_token_hash = $1",
      [refreshTokenHash],
    );
    res.clearCookie("refreshToken");
    return res.status(200).json({
      message: "Logged out successfully!",
    });
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const logoutAllDevice = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(400).json({
        message: "refresh token not found",
      });
    }
    const decoded = verifyToken(refreshToken);

    await pool.query(
      "update sessions set is_revoked = true where user_id = $1",
      [decoded.id],
    );

    res.clearCookie("refreshToken");

    return res.status(200).json({
      message: "Logged out from all devices successfully!",
    });
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { otp, email, source } = req.body;

    const otpHash = crypto.createHash("sha256").update(otp).digest("hex");

    const otpDoc = await pool.query(
      "SELECT * FROM otps WHERE email = $1 AND otpHash = $2",
      [email, otpHash],
    );

    if (otpDoc.rows.length === 0) {
      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    await pool.query("UPDATE users SET verified = true WHERE email = $1", [
      email,
    ]);

    await pool.query("DELETE FROM otps WHERE email = $1", [email]);

    if (source === "signup") {
      return res.status(200).json({
        message: "Email verified successfully",
      });
    }

    const userResult = await pool.query("SELECT * FROM users WHERE email=$1", [
      email,
    ]);
    const user = userResult.rows[0];

    const accessToken = generateAccessToken(user.user_id);
    const refreshToken = generateRefreshToken(user.user_id);

    const refreshTokenHash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    await pool.query(
      "insert into sessions (user_id, refresh_token_hash, ip_address, user_agent, expires_at) values ($1,$2,$3,$4,$5)",
      [
        user.user_id,
        refreshTokenHash,
        req.ip,
        req.headers["user-agent"],
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      ],
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "Email verified successfully",
      accessToken,
      user: {
        id: user.user_id,
        email: user.email,
        username: user.username,
        completeProfile: user.complete_profile,
      },
      completeProfile: user.complete_profile,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = {
  signUpUser,
  getMe,
  refreshToken,
  loginUser,
  logoutUser,
  logoutAllDevice,
  verifyEmail,
};
