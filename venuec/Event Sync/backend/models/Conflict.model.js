const mongoose = require('mongoose');

const { Schema } = mongoose;

const conflictSchema = new Schema(
  {
    conflictId: { type: String, required: true, unique: true },
    conflictType: String,
    severity: String,
    description: String,
    status: String,
    resolution: Schema.Types.Mixed,
    requestA: Schema.Types.Mixed,
    requestB: Schema.Types.Mixed,
  },
  { collection: 'conflicts' }
);

module.exports = mongoose.models.Conflict || mongoose.model('Conflict', conflictSchema);
