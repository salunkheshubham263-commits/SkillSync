const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware"); // <-- IMPORT MIDDLEWARE

const {
  signUpUser,
  getMe,
  refreshToken,
  loginUser,
  logoutUser,
  logoutAllDevice,
  verifyEmail,
} = require("../controllers/authController");

router.post("/signup", signUpUser);
router.get("/me", auth, getMe);           // <-- ADD AUTH HERE
router.get("/get_me", auth, getMe);       // <-- ADD AUTH HERE
router.get("/refresh-token", refreshToken);
router.post("/login", loginUser);
router.get("/logout", logoutUser);
router.get("/logout-all", logoutAllDevice);
router.post("/verify-email", verifyEmail);

module.exports = router;