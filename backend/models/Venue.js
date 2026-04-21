const mongoose = require('mongoose');

const venueSchema = new mongoose.Schema(
  {
    venueName: { type: String, required: true, trim: true },
    capacity: { type: Number, required: true, min: 0 },
    location: { type: String, default: '', trim: true },
    status: { type: String, enum: ['available', 'blocked', 'maintenance'], default: 'available' },
  },
  { timestamps: true }
);

venueSchema.index({ venueName: 1 }, { unique: true });

module.exports = mongoose.model('Venue', venueSchema);

