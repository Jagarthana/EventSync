const Event = require('../models/Event');
const { notifyOrganizer, SECTION } = require('../utils/notifyOrganizer');

function normalizeDocumentsForOutput(docs) {
  if (!docs) return [];
  if (!Array.isArray(docs)) return [];
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

const getEvents = async (req, res) => {
  try {
    // All submitted+ events so officers can see queue, decisions, and audit history
    const events = await Event.find({
      status: { $ne: 'draft' },
    })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    
    events.forEach((e) => {
      e.documents = normalizeDocumentsForOutput(e.documents);
    });
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateEventStatus = async (req, res) => {
  try {
    const { status, notes, reason } = req.body;
    const event = await Event.findById(req.params.id);
    
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const prevGovStatus = event.governanceApproval?.status;

    event.governanceApproval.status = status;
    const justification = notes || reason;

    if ((status === 'rejected' || status === 'returned') && (!justification || justification.trim() === "")) {
      return res.status(400).json({ message: "Justification is required for rejection or return" });
    }

    event.governanceApproval.notes = justification;
    event.governanceApproval.updatedAt = Date.now();

    if (status === 'rejected' || status === 'returned') {
      event.status = status;
    } else if (status === 'approved' && event.financeApproval.status === 'approved' && event.venueApproval.status === 'approved') {
      event.status = 'approved';
    } else if (status === 'approved') {
      event.status = 'review';
    }

    await event.save();

    if (event.user && prevGovStatus !== status) {
      const noteLine = justification ? `\n\nOfficer notes: ${justification}` : '';
      if (status === 'approved' && prevGovStatus !== 'approved') {
        const fullyApproved = event.status === 'approved';
        await notifyOrganizer(event, {
          section: SECTION.GOVERNANCE,
          kind: 'governance_approved',
          title: fullyApproved ? 'Governance: proposal fully approved' : 'Governance: approved your proposal',
          body: fullyApproved
            ? `Your event "${event.title}" has been approved by Governance, Finance, and Venue. You can proceed with execution.${noteLine}`
            : `Governance has approved "${event.title}". Finance and Venue may still update their decisions.${noteLine}`,
        });
      } else if (status === 'rejected' && prevGovStatus !== 'rejected') {
        await notifyOrganizer(event, {
          section: SECTION.GOVERNANCE,
          kind: 'governance_rejected',
          title: 'Governance: proposal rejected',
          body: `Your proposal "${event.title}" was rejected.${noteLine}`,
        });
      } else if (status === 'returned' && prevGovStatus !== 'returned') {
        await notifyOrganizer(event, {
          section: SECTION.GOVERNANCE,
          kind: 'governance_returned',
          title: 'Governance: changes requested',
          body: `Governance returned "${event.title}" for changes.${noteLine}`,
        });
      }
    }

    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getEvents, updateEventStatus };
