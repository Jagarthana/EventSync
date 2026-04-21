const express = require("express");
const router = express.Router();
const {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  updateExpenditure,
  submitReport,
} = require("../controllers/eventController");
const {
  updateGovernanceApproval,
  updateFinanceApproval,
  updateVenueApproval,
} = require("../controllers/adminController");
const { analyzeProposal } = require("../controllers/smartFeasibilityController");
const { protect, govAuth, finAuth, venueAuth } = require("../middlewares/authMiddleware");

router.post("/smart-feasibility", protect, analyzeProposal);

// getEvents can act as public depending on query, but creation/updates need auth
router.route("/").get(getEvents).post(protect, createEvent);
router.route("/:id").put(protect, updateEvent).delete(protect, deleteEvent);

// Life-cycle Routes
router.route("/:id/expenditure").put(protect, updateExpenditure);
router.route("/:id/report").put(protect, submitReport);

// Approval Routes
router.route("/:id/governance").put(protect, govAuth, updateGovernanceApproval);
router.route("/:id/finance").put(protect, finAuth, updateFinanceApproval);
router.route("/:id/venue").put(protect, venueAuth, updateVenueApproval);

module.exports = router;
