const express = require("express");
const router = express.Router();

const {signUpUser, getMe, refreshToken, loginUser, logoutUser, logoutAllDevice, verifyEmail} = require("../controllers/authController");

router.post("/signup", signUpUser);
router.get("/get_me", getMe);
router.get ("/refresh-token", refreshToken);
router.post("/login", loginUser);
router.get("/logout", logoutUser);
router.get("/logout-all", logoutAllDevice);
router.post("/verify-email", verifyEmail);

module.exports = router;