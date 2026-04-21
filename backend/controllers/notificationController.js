const Notification = require("../models/Notification");

const getMyNotifications = async (req, res) => {
  try {
    const list = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(80)
      .populate({ path: "event", select: "title status" })
      .lean();
    res.status(200).json(list);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const markNotificationRead = async (req, res) => {
  try {
    const n = await Notification.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!n) return res.status(404).json({ message: "Notification not found" });
    n.read = true;
    await n.save();
    res.status(200).json(n);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const markAllNotificationsRead = async (req, res) => {
  try {
    await Notification.updateMany({ user: req.user._id, read: false }, { $set: { read: true } });
    res.status(200).json({ ok: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
};
