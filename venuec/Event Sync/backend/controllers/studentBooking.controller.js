const studentBookingService = require('../services/studentBooking.service');

async function list(_req, res) {
  const data = await studentBookingService.listStudentBookings();
  res.json({ data });
}

module.exports = { list };
