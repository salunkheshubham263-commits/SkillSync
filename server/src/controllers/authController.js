const crypto = require("crypto");
const pool = require("../config/db");
const sendEmail = require("../services/emailService");
const {generateOtp, getOtpHtml} = require("../utils/otpGeneration");

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

    const otp = generateOtp();
    const html = getOtpHtml(otp);
    const userId = signUp.rows[0].user_id;

    const otpHash = crypto.createHash("sha256").update(otp).digest("hex");
    await pool.query("insert into otps (email, user_id, otpHash) values ($1,$2, $3)",[email,userId,otpHash]);
    
    await sendEmail(email, "OTP Verification", `Your OTP is ${otp}`, html);

    res.status(201).json({
      message: "User registered successfully",
      user: {
        username: signUp.rows[0].username,
        email: signUp.rows[0].email,
        verified: signUp.rows[0].verified
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
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "token is not found",
      });
    }

    const decoded = verifyToken(token);
    const user = await pool.query("select * from users where user_id = $1", [
      decoded.id,
    ]);

    res.status(200).json({
      message: "User fetched successfully",
      user: {
        id: user.rows[0].user_id,
        first_name: user.rows[0].first_name,
        last_name: user.rows[0].last_name,
        username: user.rows[0].username,
        email: user.rows[0].email,
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

    const updateSession = await pool.query(
      "update sessions set refresh_token_hash = $1 where session_id = $2",
      [newRefreshTokenHash, session.rows[0].session_id],
    );

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "Access token refreshed successfully",
      accessToken,
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

    if(!user.verified) {
      return res.status(401).json({
        message: "email not verified"
      })
    }

    const accessToken = generateAccessToken(user.user_id);
    const refreshToken = generateRefreshToken(user.user_id);

    const refreshTokenHash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");
    const session = await pool.query(
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
      user: user.email,
      verify: user.verified
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

    const session = await pool.query(
      "select * from sessions where refresh_token_hash = $1 AND is_revoked= false",
      [refreshTokenHash],
    );
    if (session.rows.length === 0) {
      return res.status(400).json({
        message: "Invalid refresh token",
      });
    } else {
      await pool.query(
        "update sessions set is_revoked = true where refresh_token_hash = $1",
        [refreshTokenHash],
      );
      res.clearCookie("refreshToken");
      return res.status(200).json({
        message: "Logged out successfully!",
      });
    }
  } catch (err) {
    console.error(err.message);
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

    await pool.query("update sessions set is_revoked = true where user_id = $1", [decoded.id]);

    res.clearCookie("refreshToken");

    return res.status(200).json({
      message: "Logged out from all devices successfully!",
    });

  } catch (err) {
    console.error(err.message);
  }
};

const verifyEmail = async (req, res) => {
  try {
    const {otp, email} = req.body;
    const otpHash = crypto.createHash("sha256").update(otp).digest("hex");

    const otpDoc = await pool.query("select * from otps where email= $1 and otpHash=$2", [email,otp]);

    if(!otpDoc){
      return res.status(400).json({
        message: "Invalid OTP"
      })
    }

    const user = await pool.query("update users set verified=true where email=$1 returning *", [email]);
    await pool.query("delete from otps where email=$1",[email]);

    return res.status(200).json({
      message: "Email verified successfully"
    })

  } catch (error) {
    console.error(error.message);
  }
}

module.exports = {
  signUpUser,
  getMe,
  refreshToken,
  loginUser,
  logoutUser,
  logoutAllDevice,
  verifyEmail
};
