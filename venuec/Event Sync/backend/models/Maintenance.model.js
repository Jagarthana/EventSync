const mongoose = require('mongoose');

const { Schema } = mongoose;

const maintenanceSchema = new Schema(
  {
    maintId: { type: String, required: true, unique: true },
    description: String,
    resource: String,
    location: String,
    reported: String,
    reportedBy: String,
    affectsEvent: String,
    status: String,
    resolvedAt: String,
  },
  { collection: 'maintenance' }
);

module.exports = mongoose.models.Maintenance || mongoose.model('Maintenance', maintenanceSchema);
