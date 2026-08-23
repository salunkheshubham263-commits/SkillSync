const express = require("express");
const router = express.Router();

const { getTrendingSkills } = require("../controllers/dashboardController");
const auth = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

router.get("/get-trending-skills", getTrendingSkills);

module.exports = router;