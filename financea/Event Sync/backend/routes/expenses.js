const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');
const Budget = require('../models/Budget');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { protect, requireRole } = require('../middleware/auth');
const { checkAndSendBudgetAlerts } = require('../services/alertService');

// GET /api/expenses — all expenses; organizer sees own; BAM sees all
router.get('/', protect, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'Student Organizer') {
      query['submittedBy.id'] = req.user._id;
    }
    const { budgetId, status } = req.query;
    if (budgetId) query.budgetId = budgetId;
    if (status) query.status = status;

    const expenses = await Expense.find(query).sort({ createdAt: -1 });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const STAFF_FINANCE_ROLES = [
  'Budget Allocation Manager',
  'Student Service Officer',
  'Venue & Resource Officer',
];

// GET /api/expenses/pending — pending expenses for staff finance roles
router.get('/pending', protect, requireRole(...STAFF_FINANCE_ROLES), async (req, res) => {
  try {
    const expenses = await Expense.find({ status: 'Pending' }).sort({ createdAt: -1 });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/expenses/:id — single expense
router.get('/:id', protect, async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ message: 'Expense not found' });
    res.json(expense);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/expenses — submit expense (organizer)
router.post('/', protect, requireRole('Student Organizer'), async (req, res) => {
  try {
    const { budgetId, expenseTitle, category, amount, description, receiptUrl } = req.body;

    const budget = await Budget.findById(budgetId);
    if (!budget || budget.status !== 'Approved') {
      return res.status(400).json({ message: 'Invalid or unapproved budget' });
    }

    const expense = await Expense.create({
      budgetId,
      eventName: budget.eventName,
      expenseTitle,
      category,
      amount,
      description,
      receiptUrl,
      submittedBy: { id: req.user._id, name: req.user.name, email: req.user.email }
    });

    // Notify BAMs
    const bams = await User.find({ role: 'Budget Allocation Manager' });
    for (const bam of bams) {
      await Notification.create({
        recipient: bam._id,
        type: 'alert',
        title: 'New Expense Submitted',
        message: `${req.user.name} submitted an expense of LKR ${amount.toLocaleString()} for "${budget.eventName}" — ${expenseTitle}.`,
        budgetId,
        expenseId: expense._id
      });
    }

    res.status(201).json(expense);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/expenses/:id/approve — BAM approves expense, deducts from balance
router.put('/:id/approve', protect, requireRole('Budget Allocation Manager'), async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ message: 'Expense not found' });
    if (expense.status !== 'Pending') return res.status(400).json({ message: 'Expense already processed' });

    const budget = await Budget.findById(expense.budgetId);
    if (!budget) return res.status(404).json({ message: 'Associated budget not found' });

    if (expense.amount > budget.remainingBalance) {
      return res.status(400).json({ message: 'Insufficient remaining balance for this expense' });
    }

    // Update expense
    expense.status = 'Approved';
    expense.approvedBy = req.user._id;
    expense.approvedAt = new Date();
    await expense.save();

    // Deduct from budget balance
    budget.totalExpenses += expense.amount;
    budget.remainingBalance -= expense.amount;
    await budget.save();

    // Check and send budget alerts (email + whatsapp)
    await checkAndSendBudgetAlerts(budget);

    // Notify organizer
    if (expense.submittedBy?.id) {
      await Notification.create({
        recipient: expense.submittedBy.id,
        type: 'expense_approved',
        title: 'Expense Approved',
        message: `Your expense "${expense.expenseTitle}" of LKR ${expense.amount.toLocaleString()} for "${expense.eventName}" has been approved.`,
        budgetId: expense.budgetId,
        expenseId: expense._id
      });
    }

    res.json({ expense, budget });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/expenses/:id/reject — BAM rejects expense
router.put('/:id/reject', protect, requireRole('Budget Allocation Manager'), async (req, res) => {
  try {
    const { rejectionReason } = req.body;
    if (!rejectionReason) return res.status(400).json({ message: 'Rejection reason required' });

    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ message: 'Expense not found' });

    expense.status = 'Rejected';
    expense.rejectionReason = rejectionReason;
    expense.approvedBy = req.user._id;
    expense.approvedAt = new Date();
    await expense.save();

    if (expense.submittedBy?.id) {
      await Notification.create({
        recipient: expense.submittedBy.id,
        type: 'expense_rejected',
        title: 'Expense Rejected',
        message: `Your expense "${expense.expenseTitle}" of LKR ${expense.amount.toLocaleString()} was rejected. Reason: ${rejectionReason}`,
        budgetId: expense.budgetId,
        expenseId: expense._id
      });
    }

    res.json(expense);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;