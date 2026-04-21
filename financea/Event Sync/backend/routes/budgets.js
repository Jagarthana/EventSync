const express = require('express');
const router = express.Router();
const Budget = require('../models/Budget');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { protect, requireRole } = require('../middleware/auth');

// GET /api/budgets — all budgets (BAM sees all; SSO sees all; organizer sees own)
router.get('/', protect, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'Student Organizer') {
      query['organizer.id'] = req.user._id;
    }
    const budgets = await Budget.find(query).sort({ createdAt: -1 });
    res.json(budgets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const STAFF_FINANCE_ROLES = [
  'Budget Allocation Manager',
  'Student Service Officer',
  'Venue & Resource Officer',
];

// GET /api/budgets/pending — pending requests for staff finance roles
router.get('/pending', protect, requireRole(...STAFF_FINANCE_ROLES), async (req, res) => {
  try {
    const budgets = await Budget.find({ status: 'Pending' }).sort({ createdAt: -1 });
    res.json(budgets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/budgets/active — approved budgets
router.get('/active', protect, async (req, res) => {
  try {
    const budgets = await Budget.find({ status: 'Approved' }).sort({ approvedAt: -1 });
    res.json(budgets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/budgets/:id — single budget detail
router.get('/:id', protect, async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.id);
    if (!budget) return res.status(404).json({ message: 'Budget not found' });
    res.json(budget);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/budgets — submit budget request (organizer)
router.post('/', protect, requireRole('Student Organizer'), async (req, res) => {
  try {
    const { eventName, eventDate, eventVenue, requestedAmount, breakdown, description, previousYearAmount } = req.body;
    const budget = await Budget.create({
      eventName,
      eventDate,
      eventVenue,
      organizer: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone
      },
      requestedAmount,
      breakdown,
      description,
      previousYearAmount
    });

    // Notify all BAMs
    const bams = await User.find({ role: 'Budget Allocation Manager' });
    for (const bam of bams) {
      await Notification.create({
        recipient: bam._id,
        recipientRole: 'Budget Allocation Manager',
        type: 'alert',
        title: 'New Budget Request',
        message: `${req.user.name} submitted a budget request of LKR ${requestedAmount.toLocaleString()} for "${eventName}".`,
        budgetId: budget._id
      });
    }

    res.status(201).json(budget);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/budgets/:id/approve — BAM approves
router.put('/:id/approve', protect, requireRole('Budget Allocation Manager'), async (req, res) => {
  try {
    const { approvedAmount } = req.body;
    const budget = await Budget.findById(req.params.id);
    if (!budget) return res.status(404).json({ message: 'Budget not found' });

    const finalAmount = approvedAmount || budget.requestedAmount;
    budget.status = 'Approved';
    budget.approvedAmount = finalAmount;
    budget.totalBudget = finalAmount;
    budget.remainingBalance = finalAmount;
    budget.approvedBy = req.user._id;
    budget.approvedAt = new Date();
    await budget.save();

    // Notify organizer
    if (budget.organizer?.id) {
      await Notification.create({
        recipient: budget.organizer.id,
        type: 'budget_approved',
        title: 'Budget Approved',
        message: `Your budget request for "${budget.eventName}" has been approved. Amount: LKR ${finalAmount.toLocaleString()}.`,
        budgetId: budget._id
      });
    }

    // Notify SSOs
    const ssos = await User.find({ role: 'Student Service Officer' });
    for (const sso of ssos) {
      await Notification.create({
        recipient: sso._id,
        recipientRole: 'Student Service Officer',
        type: 'budget_approved',
        title: 'Budget Approved',
        message: `Budget for "${budget.eventName}" (organizer: ${budget.organizer?.name}) has been approved for LKR ${finalAmount.toLocaleString()}.`,
        budgetId: budget._id
      });
    }

    res.json(budget);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/budgets/:id/reject — BAM rejects
router.put('/:id/reject', protect, requireRole('Budget Allocation Manager'), async (req, res) => {
  try {
    const { rejectionReason } = req.body;
    if (!rejectionReason) return res.status(400).json({ message: 'Rejection reason is required' });

    const budget = await Budget.findById(req.params.id);
    if (!budget) return res.status(404).json({ message: 'Budget not found' });

    budget.status = 'Rejected';
    budget.rejectionReason = rejectionReason;
    budget.approvedBy = req.user._id;
    budget.approvedAt = new Date();
    await budget.save();

    // Notify organizer
    if (budget.organizer?.id) {
      await Notification.create({
        recipient: budget.organizer.id,
        type: 'budget_rejected',
        title: 'Budget Request Rejected',
        message: `Your budget request for "${budget.eventName}" was rejected. Reason: ${rejectionReason}`,
        budgetId: budget._id
      });
    }

    // Notify SSOs with rejection reason
    const ssos = await User.find({ role: 'Student Service Officer' });
    for (const sso of ssos) {
      await Notification.create({
        recipient: sso._id,
        recipientRole: 'Student Service Officer',
        type: 'budget_rejected',
        title: 'Budget Request Rejected',
        message: `Budget for "${budget.eventName}" (organizer: ${budget.organizer?.name}) was rejected. Reason: ${rejectionReason}`,
        budgetId: budget._id
      });
    }

    res.json(budget);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/budgets/stats/dashboard — dashboard summary for staff finance roles
router.get('/stats/dashboard', protect, requireRole(...STAFF_FINANCE_ROLES), async (req, res) => {
  try {
    const [totalApproved, totalExpenses, pendingCount, nearLimit] = await Promise.all([
      Budget.aggregate([{ $match: { status: 'Approved' } }, { $group: { _id: null, total: { $sum: '$totalBudget' } } }]),
      Budget.aggregate([{ $match: { status: 'Approved' } }, { $group: { _id: null, total: { $sum: '$totalExpenses' } } }]),
      Budget.countDocuments({ status: 'Pending' }),
      Budget.countDocuments({
        status: 'Approved',
        $expr: { $gte: [{ $divide: ['$totalExpenses', '$totalBudget'] }, 0.8] }
      })
    ]);

    res.json({
      totalApprovedBudget: totalApproved[0]?.total || 0,
      totalExpensesRecorded: totalExpenses[0]?.total || 0,
      pendingBudgetRequests: pendingCount,
      eventsNearingLimit: nearLimit
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;