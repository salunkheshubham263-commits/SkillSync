const express = require("express");
const router = express.Router();

const { getSuggestions, sendConnectionRequest } = require("../controllers/networkController");
const auth = require("../middleware/authMiddleware");

router.get("/suggestions", auth, getSuggestions);
router.post("/connect/:receiver_id", auth, sendConnectionRequest);


module.exports = router;