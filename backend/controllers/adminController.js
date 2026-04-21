const Event = require("../models/Event");
const User = require("../models/User");
const AuditLog = require("../models/AuditLog");

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

const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const userRoleChange = await User.findById(req.params.id);
    if (userRoleChange) {
      const oldRoles = [...userRoleChange.roles];
      userRoleChange.roles = req.body.roles || userRoleChange.roles;
      const updatedUser = await userRoleChange.save();

      await AuditLog.create({
        user: req.user._id,
        action: 'ROLE_CHANGE',
        targetType: 'User',
        targetId: userRoleChange._id,
        details: `Roles for ${userRoleChange.name} changed from [${oldRoles.join(', ')}] to [${userRoleChange.roles.join(', ')}]`
      });

      res.json(updatedUser);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find({})
      .populate('user', 'name email')
      .sort({ timestamp: -1 })
      .limit(100);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  updateGovernanceApproval,
  updateFinanceApproval,
  updateVenueApproval,
  getUsers,
  updateUserRole,
  getLogs
};
