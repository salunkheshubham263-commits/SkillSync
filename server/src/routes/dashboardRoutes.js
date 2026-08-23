const express = require("express");
const router = express.Router();

const { getTrendingSkills, getUpcomingEvents } = require("../controllers/dashboardController");
const auth = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

router.get("/get-trending-skills", getTrendingSkills);
router.get("/get-upcoming-events", auth, getUpcomingEvents);

module.exports = router;