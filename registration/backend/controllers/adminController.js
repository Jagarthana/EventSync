const Event = require("../models/Event");

// @desc    Update Governance Approval
// @route   PUT /api/events/:id/governance
// @access  Private (Governance/Admin)
const updateGovernanceApproval = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const event = await Event.findById(req.params.id);

    if (!event) return res.status(404).json({ message: "Event not found" });

    event.governanceApproval = {
      status,
      notes,
      updatedAt: Date.now(),
    };

    // If rejected, set overall status
    if (status === "rejected") event.status = "rejected";
    if (status === "returned") event.status = "returned";
    
    // Check if fully approved (Sequential or Parallel - User said "give approvals individually")
    // Let's assume sequential: Gov -> Fin -> Venue or just check all
    checkAndSetFullApproval(event);

    await event.save();
    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update Finance Approval
// @route   PUT /api/events/:id/finance
// @access  Private (Finance/Admin)
const updateFinanceApproval = async (req, res) => {
  try {
    const { status, notes, allocatedBudget } = req.body;
    const event = await Event.findById(req.params.id);

    if (!event) return res.status(404).json({ message: "Event not found" });

    event.financeApproval = {
      status,
      notes,
      updatedAt: Date.now(),
    };

    if (allocatedBudget) event.allocatedBudget = allocatedBudget;
    if (status === "rejected") event.status = "rejected";
    if (status === "returned") event.status = "returned";

    checkAndSetFullApproval(event);

    await event.save();
    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update Venue Approval
// @route   PUT /api/events/:id/venue
// @access  Private (Venue/Admin)
const updateVenueApproval = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const event = await Event.findById(req.params.id);

    if (!event) return res.status(404).json({ message: "Event not found" });

    event.venueApproval = {
      status,
      notes,
      updatedAt: Date.now(),
    };

    if (status === "rejected") event.status = "rejected";
    if (status === "returned") event.status = "returned";

    checkAndSetFullApproval(event);

    await event.save();
    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper to check if all stages are approved
const checkAndSetFullApproval = (event) => {
  if (
    event.governanceApproval.status === "approved" &&
    event.financeApproval.status === "approved" &&
    event.venueApproval.status === "approved"
  ) {
    event.status = "approved";
  }
};

module.exports = {
  updateGovernanceApproval,
  updateFinanceApproval,
  updateVenueApproval,
};
