const mongoose = require('mongoose');

const { Schema } = mongoose;

const activitySchema = new Schema(
  {
    message: String,
    time: String,
  },
  { collection: 'activity' }
);

module.exports = mongoose.models.Activity || mongoose.model('Activity', activitySchema);
