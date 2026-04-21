const mongoose = require('mongoose');

const { Schema } = mongoose;

const checklistSchema = new Schema(
  {
    bookingId: { type: String, required: true, unique: true },
    checks: [Boolean],
  },
  { collection: 'pre_event_checklists' }
);

module.exports = mongoose.models.PreEventChecklist || mongoose.model('PreEventChecklist', checklistSchema);
