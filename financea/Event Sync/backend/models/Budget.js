const mongoose = require('mongoose');

const breakdownSchema = new mongoose.Schema({
  category: { type: String, required: true },
  amount: { type: Number, required: true }
}, { _id: false });

const budgetSchema = new mongoose.Schema({
  eventName: { type: String, required: true },
  eventDate: { type: Date },
  eventVenue: { type: String },
  organizer: {
    id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String },
    email: { type: String },
    phone: { type: String }
  },
  requestedAmount: { type: Number, required: true },
  breakdown: [breakdownSchema],
  description: { type: String },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'Modified'],
    default: 'Pending'
  },
  approvedAmount: { type: Number },
  rejectionReason: { type: String },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedAt: { type: Date },
  totalBudget: { type: Number, default: 0 },
  totalExpenses: { type: Number, default: 0 },
  remainingBalance: { type: Number, default: 0 },
  previousYearAmount: { type: Number },
  notifiedToSSO: { type: Boolean, default: false },
  alertsSent: { type: [Number], default: [] }
}, { timestamps: true });

module.exports = mongoose.model('Budget', budgetSchema);