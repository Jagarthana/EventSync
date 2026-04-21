const mongoose = require('mongoose');

const { Schema } = mongoose;

const allocationSchema = new Schema(
  {
    bookingId: { type: String, required: true, unique: true },
    venueId: String,
    venueName: String,
    eventName: String,
    date: String,
    endDate: String,
    startTime: String,
    endTime: String,
    status: String,
    priority: String,
    participants: Schema.Types.Mixed,
    studentEmail: String,
    eventType: String,
    resources: [Schema.Types.Mixed],
    internalNotes: String,
    requestedAt: String,
  },
  { collection: 'allocations' }
);

module.exports = mongoose.models.Allocation || mongoose.model('Allocation', allocationSchema);
