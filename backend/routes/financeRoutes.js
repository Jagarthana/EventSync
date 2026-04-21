const express = require('express');
const router = express.Router();
const {
  getPendingReviews,
  getFinanceSnapshot,
  approveBudget,
  updateFinanceDecision,
  updateReportFinanceReview,
  updateExpenseLineDecision,
} = require('../controllers/financeController');
const { protect, finAuth } = require('../middlewares/authMiddleware');

router.route('/reviews').get(protect, finAuth, getPendingReviews);
router.route('/snapshot').get(protect, finAuth, getFinanceSnapshot);
router.route('/approve/:id').put(protect, finAuth, approveBudget);
router.route('/decision/:id').put(protect, finAuth, updateFinanceDecision);
router.route('/report-review/:id').put(protect, finAuth, updateReportFinanceReview);
router.route('/expense-line/:eventId/:lineId').put(protect, finAuth, updateExpenseLineDecision);

module.exports = router;
