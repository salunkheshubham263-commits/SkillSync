// services/sendOtp.js

const crypto = require("crypto");
const pool = require("../config/db");
const sendEmail = require("../services/emailService");
const { generateOtp, getOtpHtml } = require("../utils/otpGeneration");

const sendOtp = async (userId, email) => {

    const otp = generateOtp();

    const otpHash = crypto
        .createHash("sha256")
        .update(otp)
        .digest("hex");

    await pool.query(
        "DELETE FROM otps WHERE email=$1",
        [email]
    );

    await pool.query(
        "INSERT INTO otps(email,user_id,otpHash) VALUES($1,$2,$3)",
        [email,userId,otpHash]
    );

    const html = getOtpHtml(otp);

    await sendEmail(
        email,
        "OTP Verification",
        `Your OTP is ${otp}`,
        html
    );
};

module.exports = sendOtp;