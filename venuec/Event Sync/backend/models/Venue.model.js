const mongoose = require('mongoose');

const { Schema } = mongoose;

const venueSchema = new Schema(
  {
    venueId: { type: String, required: true, unique: true },
    venueName: Schema.Types.Mixed,
    capacity: Schema.Types.Mixed,
    location: String,
    status: String,
    utilisation: String,
  },
  { collection: 'venues' }
);

module.exports = mongoose.models.Venue || mongoose.model('Venue', venueSchema);
