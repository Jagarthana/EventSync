const mongoose = require('mongoose');

const { Schema } = mongoose;

const equipmentSchema = new Schema(
  {
    equipmentId: { type: String, required: true, unique: true },
    equipmentName: Schema.Types.Mixed,
    category: String,
    total: Schema.Types.Mixed,
    available: Schema.Types.Mixed,
    inUse: Number,
    underMaintenance: Number,
    quantity: Schema.Types.Mixed,
    status: String,
    cost: Number,
  },
  { collection: 'equipment' }
);

module.exports = mongoose.models.Equipment || mongoose.model('Equipment', equipmentSchema);
