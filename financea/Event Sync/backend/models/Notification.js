const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recipientRole: { type: String },
  type: {
    type: String,
    enum: ['budget_rejected', 'budget_approved', 'expense_approved', 'expense_rejected', 'alert'],
    required: true
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  budgetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Budget' },
  expenseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Expense' },
  isRead: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
