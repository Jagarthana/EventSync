const User = require("../models/User");
const Notification = require("../models/Notification");
const { SECTION } = require("./notifyOrganizer");

/**
 * Notify all users with the Governance role (officers’ inbox / dashboard).
 */
async function notifyGovernanceStakeholders(event, { section, kind, title, body }) {
  if (!event?._id) return;
  try {
    const officers = await User.find({ roles: "Governance" }).select("_id").lean();
    const sec = section && ["governance", "finance", "venue", "system"].includes(section) ? section : SECTION.GOVERNANCE;
    for (const u of officers) {
      await Notification.create({
        user: u._id,
        event: event._id,
        section: sec,
        kind: kind || "gov_update",
        title: title || "Update",
        body: body || "",
        read: false,
      });
    }
  } catch (e) {
    console.error("notifyGovernanceStakeholders:", e.message);
  }
}

module.exports = { notifyGovernanceStakeholders };
