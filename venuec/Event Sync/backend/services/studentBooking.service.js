const { StudentBooking } = require('../models');
const { leanPlain } = require('../utils/transform');

async function listStudentBookings() {
  const rows = await StudentBooking.find().lean();
  return rows.map(leanPlain);
}

module.exports = { listStudentBookings };
