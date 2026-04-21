const User = require("../models/User");
const Notification = require("../models/Notification");
const { notifyOrganizer, SECTION } = require("./notifyOrganizer");

/** Notify event organizer + all users with StudentServices role (e.g. Student Services Officer). */
async function notifyFinanceStakeholders(event, { kind, title, body }) {
  await notifyOrganizer(event, {
    section: SECTION.FINANCE,
    kind,
    title,
    body,
  });
  try {
    const officers = await User.find({ roles: "StudentServices" }).select("_id").lean();
    for (const u of officers) {
      await Notification.create({
        user: u._id,
        event: event._id,
        section: SECTION.FINANCE,
        kind: `${kind}_sso`,
        title: `[Student Services] ${title}`,
        body,
        read: false,
      });
    }
  } catch (e) {
    console.error("notifyFinanceStakeholders SSO fan-out:", e.message);
  }
}

module.exports = { notifyFinanceStakeholders };
