const mongoose = require('mongoose');

const { Schema } = mongoose;

const studentBookingSchema = new Schema(
  {
    bookingId: { type: String, required: true, unique: true },
    status: String,
    eventDate: String,
    venueName: String,
  },
  { collection: 'student_bookings' }
);

module.exports = mongoose.models.StudentBooking || mongoose.model('StudentBooking', studentBookingSchema);
