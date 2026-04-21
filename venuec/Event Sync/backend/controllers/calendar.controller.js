const calendarService = require('../services/calendar.service');

async function overlaps(_req, res) {
  const data = await calendarService.listOverlaps();
  res.json({ data });
}

module.exports = { overlaps };
