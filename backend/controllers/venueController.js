const Event = require('../models/Event');
const { notifyOrganizer, SECTION } = require('../utils/notifyOrganizer');
const { notifyGovernanceStakeholders } = require('../utils/notifyGovernanceStakeholders');

function timeToMinutes(t) {
  if (!t || typeof t !== 'string') return null;
  const parts = t.trim().split(':');
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1] || '0', 10);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return h * 60 + m;
}

/** True if [aStart,aEnd) overlaps [bStart,bEnd) (half-open intervals, same day). */
function intervalsOverlapTime(aStart, aEnd, bStart, bEnd) {
  const as = timeToMinutes(aStart);
  const ae = timeToMinutes(aEnd);
  const bs = timeToMinutes(bStart);
  const be = timeToMinutes(bEnd);
  if (as == null || ae == null || bs == null || be == null) return false;
  return as < be && bs < ae;
}

function sameCalendarDay(d1, d2) {
  const a = new Date(d1);
  const b = new Date(d2);
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

/**
 * Find another approved booking for the same venue on the same calendar day with overlapping times.
 */
async function findVenueScheduleConflict(excludeId, venueName, date, startTime, endTime) {
  if (!venueName || !String(venueName).trim() || !date) return null;
  const others = await Event.find({
    _id: { $ne: excludeId },
    venue: venueName.trim(),
    status: 'approved',
  })
    .select('title startTime endTime date venue')
    .lean();

  for (const o of others) {
    if (!sameCalendarDay(o.date, date)) continue;
    if (intervalsOverlapTime(startTime, endTime, o.startTime, o.endTime)) {
      return o;
    }
  }
  return null;
}

function normalizeResourcesInput(raw) {
  if (!Array.isArray(raw)) return [];
  const out = [];
  for (const item of raw) {
    if (item == null) continue;
    if (typeof item === 'string') {
      const s = item.trim();
      if (s) out.push(s);
      continue;
    }
    if (typeof item === 'object') {
      const name = (item.name != null ? String(item.name) : item.label != null ? String(item.label) : '').trim();
      if (!name) continue;
      const q = item.quantity;
      if (q != null && q !== '' && !Number.isNaN(Number(q))) {
        out.push({ name, quantity: Number(q) });
      } else {
        out.push({ name });
      }
    }
  }
  return out;
}

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

// @desc    Get events pending venue allocation
// @route   GET /api/venue/requests
// @access  Private (Venue)
const getPendingRequests = async (req, res) => {
  try {
    const events = await Event.find({ 
      'venueApproval.status': 'pending',
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

// @desc    All non-draft events for venue officer dashboard (calendar, stats, conflicts)
// @route   GET /api/venue/snapshot
// @access  Private (Venue)
const getVenueSnapshot = async (req, res) => {
  try {
    const events = await Event.find({ status: { $ne: 'draft' } })
      .populate('user', 'name email')
      .sort({ date: 1 });
    events.forEach((e) => {
      e.documents = normalizeDocumentsForOutput(e.documents);
    });
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Allocate Venue Location
// @route   PUT /api/venue/allocate/:id
// @access  Private (Venue)
const allocateVenue = async (req, res) => {
  try {
    const { venue, resources: resourcesIn } = req.body;
    const event = await Event.findById(req.params.id);

    if (!event) return res.status(404).json({ message: 'Event not found' });

    const bodyVenue = venue != null && String(venue).trim() ? String(venue).trim() : null;
    const effectiveVenue =
      bodyVenue || (event.venue != null && String(event.venue).trim() ? String(event.venue).trim() : null);

    if (!effectiveVenue) {
      return res.status(400).json({
        message: 'Venue is required. Enter a venue name (or ensure the event already has one).',
      });
    }

    const conflict = await findVenueScheduleConflict(
      req.params.id,
      effectiveVenue,
      event.date,
      event.startTime,
      event.endTime
    );
    if (conflict) {
      return res.status(400).json({
        message: `Venue conflict: "${effectiveVenue}" is already booked for "${conflict.title}" from ${conflict.startTime || '?'} to ${conflict.endTime || '?'}`,
      });
    }
    if (bodyVenue) {
      event.venue = bodyVenue;
    }

    if (resourcesIn !== undefined) {
      event.resources = normalizeResourcesInput(resourcesIn);
    }

    const prevVenue = event.venueApproval?.status;

    event.venueApproval.status = 'approved';
    event.venueApproval.updatedAt = Date.now();
    
    // Check if fully approved (Governance done, Finance Approved, Venue Allocated)
    if (event.governanceApproval.status === 'approved' && event.financeApproval.status === 'approved') {
        event.status = 'approved';
    }

    await event.save();

    if (prevVenue !== 'approved' && event.user) {
      const resList = Array.isArray(event.resources) ? event.resources : [];
      const resHint =
        resList.length > 0
          ? `\nResources noted: ${resList
              .map((r) =>
                typeof r === 'string' ? r : `${r.name || ''}${r.quantity != null ? ` ×${r.quantity}` : ''}`
              )
              .filter(Boolean)
              .join(', ')}.`
          : '';
      await notifyOrganizer(event, {
        section: SECTION.VENUE,
        kind: 'venue_approved',
        title: 'Venue: booking confirmed',
        body: `Venue allocated "${event.title}" to ${effectiveVenue}.${resHint}`,
      });
      await notifyGovernanceStakeholders(event, {
        section: SECTION.VENUE,
        kind: 'venue_approved',
        title: 'Venue: booking confirmed',
        body: `Venue allocated "${event.title}" to ${effectiveVenue}.${resHint}`,
      });
    }

    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Venue approve/reject/return with optional suggestion
// @route   PUT /api/venue/decision/:id
// @access  Private (Venue)
const updateVenueDecision = async (req, res) => {
  try {
    const { decision, venue, notes, resources: resourcesIn } = req.body;
    const event = await Event.findById(req.params.id);

    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (!['approved', 'rejected', 'returned'].includes(decision)) {
      return res.status(400).json({ message: 'Invalid decision value' });
    }

    const prevVenue = event.venueApproval?.status;

    if (decision === 'approved') {
      const bodyVenue = venue != null && String(venue).trim() ? String(venue).trim() : null;
      const effectiveVenue =
        bodyVenue || (event.venue != null && String(event.venue).trim() ? String(event.venue).trim() : null);
      if (!effectiveVenue) {
        return res.status(400).json({
          message: 'Venue is required before approving.',
        });
      }
      const conflict = await findVenueScheduleConflict(
        req.params.id,
        effectiveVenue,
        event.date,
        event.startTime,
        event.endTime
      );
      if (conflict) {
        return res.status(400).json({
          message: `Venue conflict: "${effectiveVenue}" is already booked for "${conflict.title}" from ${conflict.startTime || '?'} to ${conflict.endTime || '?'}`,
        });
      }
      if (bodyVenue) {
        event.venue = bodyVenue;
      }
      if (resourcesIn !== undefined) {
        event.resources = normalizeResourcesInput(resourcesIn);
      }
    } else if (venue != null && String(venue).trim()) {
      event.venue = String(venue).trim();
    }

    event.venueApproval.status = decision;
    event.venueApproval.updatedAt = Date.now();
    event.venueApproval.notes = notes || '';

    if (decision === 'rejected' || decision === 'returned') {
      event.status = decision;
    } else if (
      event.governanceApproval.status === 'approved' &&
      event.financeApproval.status === 'approved'
    ) {
      event.status = 'approved';
    } else {
      event.status = 'review';
    }

    await event.save();

    if (prevVenue !== decision && event.user) {
      const noteLine = (notes || '').trim() ? `\n\nVenue officer notes: ${notes}` : '';
      let title = 'Venue: update';
      let body = '';
      if (decision === 'approved') {
        const vName = event.venue || venue || 'assigned venue';
        title = 'Venue: booking approved';
        body = `Venue approved "${event.title}" for ${vName}.${noteLine}`;
      } else if (decision === 'rejected') {
        title = 'Venue: booking rejected';
        body = `Venue could not approve the booking for "${event.title}".${noteLine}`;
      } else {
        title = 'Venue: returned for changes';
        body = `Venue returned "${event.title}" for schedule or venue changes.${noteLine}`;
      }
      await notifyOrganizer(event, {
        section: SECTION.VENUE,
        kind: `venue_${decision}`,
        title,
        body,
      });
      await notifyGovernanceStakeholders(event, {
        section: SECTION.VENUE,
        kind: `venue_${decision}`,
        title,
        body,
      });
    }

    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getPendingRequests,
  getVenueSnapshot,
  allocateVenue,
  updateVenueDecision
};
