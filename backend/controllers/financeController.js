const Event = require('../models/Event');
const { notifyOrganizer, SECTION } = require('../utils/notifyOrganizer');
const { notifyFinanceStakeholders } = require('../utils/notifyFinanceStakeholders');
const { notifyGovernanceStakeholders } = require('../utils/notifyGovernanceStakeholders');

function normalizeDocumentsForOutput(docs) {
  if (!docs || !Array.isArray(docs)) return [];
  return docs
    .map((d) => {
      if (!d) return null;
      if (typeof d === 'string') {
        try {
          const parsed = JSON.parse(d);
          if (parsed && typeof parsed === 'object') {
            return { name: parsed.name, type: parsed.type, url: parsed.url };
          }
        } catch {
          // ignore
        }
        return { name: undefined, type: undefined, url: d };
      }
      return { name: d.name, type: d.type, url: d.url };
    })
    .filter((x) => x && (x.name || x.type || x.url));
}

// @desc    Get events pending finance review
// @route   GET /api/finance/reviews
// @access  Private (Finance)
const getPendingReviews = async (req, res) => {
  try {
    const events = await Event.find({ 
      'financeApproval.status': 'pending',
      status: { $in: ['review', 'sub'] }
    }).populate('user', 'name email');
    events.forEach((e) => {
      e.documents = normalizeDocumentsForOutput(e.documents);
    });
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Approve/Allocate Budget
// @route   PUT /api/finance/approve/:id
// @access  Private (Finance)
const approveBudget = async (req, res) => {
  try {
    const { allocatedBudget, notes } = req.body;
    const event = await Event.findById(req.params.id);

    if (!event) return res.status(404).json({ message: 'Event not found' });

    const prevFinance = event.financeApproval?.status;

    event.allocatedBudget = allocatedBudget || event.allocatedBudget;
    event.financeApproval.status = 'approved';
    event.financeApproval.updatedAt = Date.now();
    if (notes) event.financeApproval.notes = notes;

    if (event.governanceApproval.status === 'approved' && event.venueApproval.status === 'approved') {
      event.status = 'approved';
    }

    await event.save();

    if (prevFinance !== 'approved' && event.user) {
      const noteLine = notes ? `\n\nFinance officer notes: ${notes}` : '';
      const alloc = event.allocatedBudget != null ? ` Allocated budget: ${Number(event.allocatedBudget).toLocaleString()}.` : '';
      await notifyOrganizer(event, {
        section: SECTION.FINANCE,
        kind: 'finance_approved',
        title: 'Finance: budget approved',
        body: `Finance approved the budget for "${event.title}".${alloc}${noteLine}`,
      });
      await notifyGovernanceStakeholders(event, {
        section: SECTION.FINANCE,
        kind: 'finance_approved',
        title: 'Finance: budget approved',
        body: `Finance approved the budget for "${event.title}".${alloc}${noteLine}`,
      });
    }

    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Finance approve/reject/return decision
// @route   PUT /api/finance/decision/:id
// @access  Private (Finance)
const updateFinanceDecision = async (req, res) => {
  try {
    const { decision, allocatedBudget, notes } = req.body;
    const event = await Event.findById(req.params.id);

    if (!event) return res.status(404).json({ message: 'Event not found' });

    if (!['approved', 'rejected', 'returned'].includes(decision)) {
      return res.status(400).json({ message: 'Invalid decision value' });
    }

    const prevFinance = event.financeApproval?.status;

    event.financeApproval.status = decision;
    event.financeApproval.updatedAt = Date.now();
    event.financeApproval.notes = notes || '';

    if (decision === 'approved' && allocatedBudget != null) {
      event.allocatedBudget = Number(allocatedBudget);
    }

    if (decision === 'rejected' || decision === 'returned') {
      event.status = decision;
    } else if (
      event.governanceApproval.status === 'approved' &&
      event.venueApproval.status === 'approved'
    ) {
      event.status = 'approved';
    } else {
      event.status = 'review';
    }

    await event.save();

    if (prevFinance !== decision && event.user) {
      const noteLine = (notes || '').trim() ? `\n\nFinance officer notes: ${notes}` : '';
      const alloc =
        decision === 'approved' && allocatedBudget != null
          ? `\nAllocated budget: ${Number(allocatedBudget).toLocaleString()}.`
          : '';
      let title = 'Finance: update';
      let body = '';
      if (decision === 'approved') {
        title = 'Finance: budget approved';
        body = `Finance approved the budget for "${event.title}".${alloc}${noteLine}`;
      } else if (decision === 'rejected') {
        title = 'Finance: budget rejected';
        body = `Finance rejected the budget request for "${event.title}".${noteLine}`;
      } else {
        title = 'Finance: returned for changes';
        body = `Finance returned "${event.title}" for budget or documentation changes.${noteLine}`;
      }
      await notifyOrganizer(event, {
        section: SECTION.FINANCE,
        kind: `finance_${decision}`,
        title,
        body,
      });
      await notifyGovernanceStakeholders(event, {
        section: SECTION.FINANCE,
        kind: `finance_${decision}`,
        title,
        body,
      });
    }

    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    All non-draft events for finance dashboard (stats, expenses, history)
// @route   GET /api/finance/snapshot
// @access  Private (Finance)
const getFinanceSnapshot = async (req, res) => {
  try {
    const events = await Event.find({ status: { $ne: "draft" } })
      .populate("user", "name email")
      .sort({ updatedAt: -1 });
    events.forEach((e) => {
      e.documents = normalizeDocumentsForOutput(e.documents);
    });
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Sign off or request revision on final report
// @route   PUT /api/finance/report-review/:id
// @access  Private (Finance)
const updateReportFinanceReview = async (req, res) => {
  try {
    const { status, notes } = req.body;
    if (!["signed_off", "revision_requested"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    if (event.status !== "done") {
      return res.status(400).json({ message: "Event must be completed with a final report" });
    }
    const prevRep = event.reportFinanceReview?.status;

    event.reportFinanceReview = {
      status,
      notes: notes || "",
      updatedAt: Date.now(),
    };
    await event.save();

    if (prevRep !== status && event.user) {
      const noteLine = (notes || "").trim() ? `\n\nFinance notes: ${notes}` : "";
      const title =
        status === "signed_off" ? "Finance: final report signed off" : "Finance: revision requested on final report";
      const body =
        status === "signed_off"
          ? `Finance signed off on your final report for "${event.title}".${noteLine}`
          : `Finance requested revisions to your final report for "${event.title}".${noteLine}`;
      await notifyOrganizer(event, {
        section: SECTION.FINANCE,
        kind: `finance_report_${status}`,
        title,
        body,
      });
    }

    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Approve or reject a single expense line (organizer-submitted)
// @route   PUT /api/finance/expense-line/:eventId/:lineId
// @access  Private (Finance)
const updateExpenseLineDecision = async (req, res) => {
  try {
    const { decision, reason } = req.body;
    if (!['approved', 'rejected'].includes(decision)) {
      return res.status(400).json({ message: 'Invalid decision' });
    }
    const reasonText = (reason != null ? String(reason) : '').trim();
    if (!reasonText) {
      return res.status(400).json({ message: 'A reason is required for approval and rejection.' });
    }

    const event = await Event.findById(req.params.eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const line = event.expenses.id(req.params.lineId);
    if (!line) return res.status(404).json({ message: 'Expense line not found' });

    line.status = decision;
    line.financeReason = reasonText;
    line.decidedAt = Date.now();

    await event.save();

    const amt = Number(line.amount || 0);
    const title =
      decision === 'approved' ? 'Finance: expense line approved' : 'Finance: expense line rejected';
    const body = `${decision === 'approved' ? 'Approved' : 'Rejected'} expense for "${event.title}" (${line.category || 'Line'} — ${line.description || 'No description'}). Amount: ${amt}.\n\nFinance officer reason: ${reasonText}`;

    await notifyFinanceStakeholders(event, {
      kind: `expense_line_${decision}`,
      title,
      body,
    });

    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getPendingReviews,
  getFinanceSnapshot,
  approveBudget,
  updateFinanceDecision,
  updateReportFinanceReview,
  updateExpenseLineDecision,
};
