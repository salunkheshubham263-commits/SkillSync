const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  respondToConnection,
  deleteNotification,
  deleteAllNotifications,
} = require("../controllers/notificationController");

router.get("/", auth, getNotifications);
router.get("/unread-count", auth, getUnreadNotificationCount);
router.patch("/:notification_id/read", auth, markNotificationAsRead);
router.patch("/read-all", auth, markAllNotificationsAsRead);
router.patch("/connections/:connection_id/respond", auth, respondToConnection);
router.delete("/:notification_id", auth, deleteNotification);
router.delete("/", auth, deleteAllNotifications);

module.exports = router;