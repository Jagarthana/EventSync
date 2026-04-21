const Notification = require("../models/Notification");

const SECTION = {
  GOVERNANCE: "governance",
  FINANCE: "finance",
  VENUE: "venue",
  SYSTEM: "system",
};

/**
 * Notify the event organizer (student) — used from governance, finance, and venue flows.
 */
async function notifyOrganizer(event, { section, kind, title, body }) {
  if (!event?.user) return;
  try {
    await Notification.create({
      user: event.user,
      event: event._id,
      section: section || SECTION.SYSTEM,
      kind: kind || "update",
      title: title || "Update",
      body: body || "",
      read: false,
    });
  } catch (e) {
    console.error("notifyOrganizer:", e.message);
  }
}

module.exports = { notifyOrganizer, SECTION };
