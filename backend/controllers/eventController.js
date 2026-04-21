const Event = require("../models/Event");
const { notifyGovernanceStakeholders } = require("../utils/notifyGovernanceStakeholders");

const hasRole = (user, roleName) => {
  if (!user) return false;
  const roles = Array.isArray(user.roles)
    ? user.roles
    : user.role
      ? [user.role]
      : [];
  return roles.includes(roleName);
};

function lineFingerprint(ex) {
  return [
    String(ex.category || ""),
    String(ex.description || ""),
    Number(ex.amount || 0),
    String(ex.receiptUrl || ""),
  ].join("|");
}

/** Organizer edits: new or changed lines go pending; unchanged approved lines stay approved. */
function normalizeOrganizerExpenses(oldList = [], incoming = []) {
  const oldById = new Map();
  (oldList || []).forEach((ex) => {
    if (ex._id) oldById.set(String(ex._id), ex);
  });
  return (incoming || []).map((ex) => {
    const id = ex._id ? String(ex._id) : null;
    const prev = id ? oldById.get(id) : null;
    const next = {
      category: ex.category,
      description: ex.description,
      amount: ex.amount,
      receiptUrl: ex.receiptUrl,
    };
    if (!prev) {
      return { ...next, status: "pending" };
    }
    const prevEffective = prev.status || "approved";
    const unchangedApproved =
      prevEffective === "approved" && lineFingerprint(prev) === lineFingerprint({ ...prev, ...next });
    if (unchangedApproved) {
      return {
        ...next,
        _id: prev._id,
        status: "approved",
        financeReason: prev.financeReason,
        decidedAt: prev.decidedAt,
      };
    }
    return {
      ...next,
      _id: prev._id,
      status: "pending",
      financeReason: undefined,
      decidedAt: undefined,
    };
  });
}

function mapNewExpensesForCreate(expenses) {
  if (!Array.isArray(expenses)) return [];
  return expenses.map((ex) => ({
    category: ex.category,
    description: ex.description,
    amount: ex.amount,
    receiptUrl: ex.receiptUrl,
    status: "pending",
  }));
}

function normalizeDocuments(input) {
  if (!input) return [];
  if (Array.isArray(input)) {
    return input
      .map((d) => {
        if (!d) return null;
        if (typeof d === "string") {
          // Sometimes the UI sends stringified objects; try to recover.
          const s = d.trim();
          // JSON-like
          if ((s.startsWith("{") && s.endsWith("}")) || (s.startsWith("[") && s.endsWith("]"))) {
            try {
              const parsed = JSON.parse(s);
              if (Array.isArray(parsed)) {
                // If it's an array, we'll handle it at the top-level.
                return null;
              }
              return { name: parsed?.name, type: parsed?.type, url: parsed?.url };
            } catch {
              // fall through to regex
            }
          }
          // Regex for patterns like: name: 'CV se.pdf', type: 'Event Agenda', url: '/uploads/x.pdf'
          const nameMatch = s.match(/name\s*:\s*['"]([^'"]+)['"]/i);
          const typeMatch = s.match(/type\s*:\s*['"]([^'"]+)['"]/i);
          const urlMatch = s.match(/url\s*:\s*['"]([^'"]+)['"]/i);
          if (nameMatch || typeMatch || urlMatch) {
            return {
              name: nameMatch ? nameMatch[1] : undefined,
              type: typeMatch ? typeMatch[1] : undefined,
              url: urlMatch ? urlMatch[1] : undefined,
            };
          }
          return null;
        }
        return { name: d.name, type: d.type, url: d.url };
      })
      .filter(Boolean);
  }
  // If a single object
  if (typeof input === "object") {
    return [{ name: input.name, type: input.type, url: input.url }].filter(
      (d) => d.name || d.type || d.url
    );
  }
  return [];
}

// @desc    Get all events
// @route   GET /api/events
// @access  Public/Private?
const getEvents = async (req, res) => {
  try {
    // If we want public events, we can filter by status: 'approved'
    // But for dashboard, we want logged-in user's events or all if admin
    let filter = {};
    if (req.user) {
      if (hasRole(req.user, "Admin")) {
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

    const events = await Event.find(filter).sort({ createdAt: -1 }).lean();
    const payload = events.map((e) => ({
      ...e,
      documents: normalizeDocuments(e.documents),
    }));
    res.status(200).json(payload);
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

    // Business Rule: Event dates must be in the future
    if (date && new Date(date) < new Date()) {
      return res.status(400).json({ message: "Event date must be in the future" });
    }

    // Business Rule: Duplicate event titles are not allowed
    if (title) {
      const duplicate = await Event.findOne({
        user: req.user.id,
        title: { $regex: new RegExp(`^${title.trim()}$`, "i") },
      });
      if (duplicate) {
        return res.status(400).json({ message: "An event with this title already exists" });
      }
    }

    const normalizedDocuments = normalizeDocuments(documents);
    const expensesForCreate = mapNewExpensesForCreate(expenses);

    // Some legacy UI/data paths have historically sent documents in formats
    // that can trip Mongoose casting. Retry with stringified documents if needed.
    let event;
    try {
      event = await Event.create({
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
        documents: normalizedDocuments,
        expenses: expensesForCreate,
        totalEstimated,
        resources,
        status: status || "draft",
      });
    } catch (err) {
      const msg = String(err && err.message ? err.message : err);
    const isDocsCastIssue = msg.includes("documents") && msg.includes("CastError");

      if (isDocsCastIssue) {
        const stringDocs = normalizedDocuments.map((d) => (typeof d === "string" ? d : JSON.stringify(d)));
        event = await Event.create({
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
          documents: stringDocs,
          expenses: expensesForCreate,
          totalEstimated,
          resources,
          status: status || "draft",
        });
      } else {
        throw err;
      }
    }

    if (["sub", "review"].includes(event.status)) {
      await notifyGovernanceStakeholders(event, {
        section: "governance",
        kind: "proposal_submitted",
        title: `New proposal submitted: ${event.title}`,
        body: `An organizer submitted this event for Governance, Finance, and Venue review.`,
      });
    }

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
    if (event.user.toString() !== req.user.id && !hasRole(req.user, "Admin")) {
      return res.status(401).json({ message: "User not authorized" });
    }

    const prevStatus = event.status;
    const body = { ...req.body };
    if (
      Array.isArray(body.expenses) &&
      event.user.toString() === req.user.id
    ) {
      body.expenses = normalizeOrganizerExpenses(event.expenses, body.expenses);
    }

    const updatedEvent = await Event.findByIdAndUpdate(req.params.id, body, {
      new: true,
    });

    const inPipeline = (s) => ["sub", "review"].includes(s);
    if (
      updatedEvent &&
      inPipeline(updatedEvent.status) &&
      !inPipeline(prevStatus)
    ) {
      const resub = prevStatus === "returned" || prevStatus === "rejected";
      await notifyGovernanceStakeholders(updatedEvent, {
        section: "governance",
        kind: "proposal_submitted",
        title: resub ? `Proposal resubmitted: ${updatedEvent.title}` : `New proposal submitted: ${updatedEvent.title}`,
        body: resub
          ? `An organizer resubmitted this event for Governance, Finance, and Venue review.`
          : `An organizer submitted this event for Governance, Finance, and Venue review.`,
      });
    }

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
    if (event.user.toString() !== req.user.id && !hasRole(req.user, "Admin")) {
      return res.status(401).json({ message: "User not authorized" });
    }

    if (event.allocatedBudget > 0 && amount > event.allocatedBudget) {
      return res.status(400).json({ message: `Expenditure exceeds approved budget of ${event.allocatedBudget}` });
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
    if (event.user.toString() !== req.user.id && !hasRole(req.user, "Admin")) {
      return res.status(401).json({ message: "User not authorized" });
    }

    const reportData = req.body;
    
    // Business Rule: Receipts are mandatory for all expenses
    if (reportData.expenses && Array.isArray(reportData.expenses)) {
      const missingReceipt = reportData.expenses.some(exp => !exp.receiptUrl || exp.receiptUrl.trim() === "");
      if (missingReceipt) {
        return res.status(400).json({ message: "Receipts are mandatory for all expenses" });
      }
      
      const totalExp = reportData.expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
      if (event.allocatedBudget > 0 && totalExp > event.allocatedBudget) {
         return res.status(400).json({ message: `Total expenses (${totalExp}) exceed approved budget (${event.allocatedBudget})` });
      }
    }

    const wasNotDone = event.status !== "done";
    event.report = { ...event.report, ...reportData };
    event.status = "done"; // Mark as completed
    if (wasNotDone || !event.reportFinanceReview || event.reportFinanceReview.status === "revision_requested") {
      event.reportFinanceReview = {
        status: "pending",
        notes: "",
        updatedAt: Date.now(),
      };
    }

    await event.save();
    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/** Draft always; submitted (sub/review) only while G/F/V are all still pending. */
function organizerMayDeleteEvent(event) {
  if (event.status === "draft") return true;
  const g = event.governanceApproval?.status ?? "pending";
  const f = event.financeApproval?.status ?? "pending";
  const v = event.venueApproval?.status ?? "pending";
  const committeesNotStarted = g === "pending" && f === "pending" && v === "pending";
  if (["sub", "review"].includes(event.status) && committeesNotStarted) return true;
  return false;
}

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

    if (event.user.toString() !== req.user.id && !hasRole(req.user, "Admin")) {
      return res.status(401).json({ message: "User not authorized" });
    }

    if (!hasRole(req.user, "Admin") && !organizerMayDeleteEvent(event)) {
      return res.status(400).json({
        message:
          "This proposal cannot be deleted. Delete is only allowed for drafts or submitted events before Governance, Finance, or Venue has recorded a decision.",
      });
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
