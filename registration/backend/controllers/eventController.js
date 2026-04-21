const Event = require("../models/Event");

// @desc    Get all events
// @route   GET /api/events
// @access  Public/Private?
const getEvents = async (req, res) => {
  try {
    // If we want public events, we can filter by status: 'approved'
    // But for dashboard, we want logged-in user's events or all if admin
    let filter = {};
    if (req.user) {
      if (req.user.role === "Admin") {
        // Admin sees all
        filter = {};
      } else {
        // Organizer sees only theirs
        filter = { user: req.user._id };
      }
    } else {
      // Public view (home page)
      filter = { status: "approved" };
    }

    const events = await Event.find(filter).sort({ createdAt: -1 });
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create event proposal
// @route   POST /api/events
// @access  Private
const createEvent = async (req, res) => {
  try {
    const {
      title,
      type,
      club,
      objectives,
      description,
      date,
      duration,
      startTime,
      endTime,
      participants,
      venue,
      requirements,
      status,
      documents,
      expenses,
      totalEstimated,
      resources,
    } = req.body;

    const event = await Event.create({
      user: req.user.id,
      title,
      type,
      club,
      objectives,
      description,
      date,
      duration,
      startTime,
      endTime,
      participants,
      venue,
      requirements,
      documents,
      expenses,
      totalEstimated,
      resources,
      status: status || "draft",
    });

    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update event (like budget, status, etc)
// @route   PUT /api/events/:id
// @access  Private
const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Check for user
    if (!req.user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Admin or creator can update
    if (event.user.toString() !== req.user.id && req.user.role !== "Admin") {
      return res.status(401).json({ message: "User not authorized" });
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.status(200).json(updatedEvent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update actual expenditure (Post-approval)
// @route   PUT /api/events/:id/expenditure
// @access  Private (Owner/Admin)
const updateExpenditure = async (req, res) => {
  try {
    const { amount, notes } = req.body;
    const event = await Event.findById(req.params.id);

    if (!event) return res.status(404).json({ message: "Event not found" });
    if (event.user.toString() !== req.user.id && req.user.role !== "Admin") {
      return res.status(401).json({ message: "User not authorized" });
    }

    event.report.actualExpenditure = amount;
    event.report.expenditureNotes = notes;

    await event.save();
    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Submit final report
// @route   PUT /api/events/:id/report
// @access  Private (Owner/Admin)
const submitReport = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) return res.status(404).json({ message: "Event not found" });
    if (event.user.toString() !== req.user.id && req.user.role !== "Admin") {
      return res.status(401).json({ message: "User not authorized" });
    }

    event.report = { ...event.report, ...req.body };
    event.status = "done"; // Mark as completed

    await event.save();
    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (!req.user) {
      return res.status(401).json({ message: "User not found" });
    }

    if (event.user.toString() !== req.user.id && req.user.role !== "Admin") {
      return res.status(401).json({ message: "User not authorized" });
    }

    await event.deleteOne();

    res.status(200).json({ id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  updateExpenditure,
  submitReport,
};
