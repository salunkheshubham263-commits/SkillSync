const express = require("express");
const router = express.Router();

const {completeProfile, getSkills, getProfileImage} = require("../controllers/profileController");
const auth = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

router.post("/complete-profile", auth, upload.single("profileImage"), completeProfile);
router.get("/skills", getSkills);
router.get("/getProfileImage", auth, getProfileImage);

module.exports = router;