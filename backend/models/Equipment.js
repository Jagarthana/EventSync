const mongoose = require('mongoose');

const equipmentSchema = new mongoose.Schema(
  {
    equipmentName: { type: String, required: true, trim: true },
    category: { type: String, default: '', trim: true },
    total: { type: Number, default: 0, min: 0 },
    available: { type: Number, default: 0, min: 0 },
    inUse: { type: Number, default: 0, min: 0 },
    underMaintenance: { type: Number, default: 0, min: 0 },
    status: { type: String, enum: ['available', 'in_use', 'maintenance'], default: 'available' },
  },
  { timestamps: true }
);

equipmentSchema.index({ equipmentName: 1 }, { unique: true });

module.exports = mongoose.model('Equipment', equipmentSchema);

