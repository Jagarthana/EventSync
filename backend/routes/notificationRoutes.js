const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const {
  getMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} = require("../controllers/notificationController");

router.route("/").get(protect, getMyNotifications);
router.route("/read-all").patch(protect, markAllNotificationsRead);
router.route("/:id/read").patch(protect, markNotificationRead);

module.exports = router;
