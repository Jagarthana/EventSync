const Event = require('../models/Event');

function num(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function normalizeType(t) {
  return String(t || '')
    .trim()
    .toLowerCase();
}

function median(arr) {
  if (!arr.length) return 0;
  const s = [...arr].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

/**
 * POST body: proposal snapshot (same shape as wizard formData subset).
 * Uses historical EventSync records + rule-based heuristics (no external AI API).
 */
async function analyzeProposal(req, res) {
  try {
    const b = req.body || {};
    const participants = num(b.participants);
    const expenses = Array.isArray(b.expenses) ? b.expenses : [];
    const totalBudget = expenses.reduce((s, e) => s + num(e?.amount), 0);
    const documents = Array.isArray(b.documents) ? b.documents : [];
    const docCount = documents.filter((d) => d && typeof d === 'object' && d.url).length;
    const eventType = String(b.type || '').trim();
    const venuePref = String(b.venue || '').trim();
    const dateStr = b.date;

    const history = await Event.find({
      status: { $in: ['sub', 'review', 'approved', 'returned', 'done'] },
    })
      .select('type totalEstimated participants venue status title date')
      .sort({ createdAt: -1 })
      .limit(150)
      .lean();

    const sameType = history.filter((e) => normalizeType(e.type) === normalizeType(eventType));
    const pool = sameType.length >= 4 ? sameType : history;

    const budgets = pool.map((e) => num(e.totalEstimated)).filter((x) => x > 0);
    const parts = pool.map((e) => num(e.participants)).filter((x) => x > 0);

    const peerBudgetMedian = median(budgets) || (totalBudget > 0 ? totalBudget : 75000);
    const peerPartMedian = median(parts) || Math.max(40, participants || 80);

    let budgetScore = 72;
    if (peerBudgetMedian > 0 && totalBudget > 0) {
      const ratio = totalBudget / peerBudgetMedian;
      if (ratio >= 0.78 && ratio <= 1.32) budgetScore = 93;
      else if (ratio >= 0.55 && ratio < 0.78) budgetScore = 76;
      else if (ratio < 0.55) budgetScore = Math.max(38, 58 - Math.floor((0.55 - ratio) * 70));
      else if (ratio > 1.32 && ratio <= 2.1) budgetScore = 66;
      else budgetScore = Math.max(42, 82 - Math.floor(Math.max(0, ratio - 1.32) * 28));
    } else if (totalBudget <= 0) {
      budgetScore = 44;
    }

    const typeMult = /conference|seminar/i.test(eventType) ? 0.92 : /sports|cultural/i.test(eventType) ? 1.12 : 1;
    const anchor = Math.max(15, peerPartMedian * typeMult);
    const mid = Math.round(Math.max(participants * 0.9, Math.min(participants * 1.08, anchor * 0.95 + participants * 0.05)));
    const low = Math.max(5, Math.floor(mid * 0.86));
    const high = Math.ceil(mid * 1.14);

    let suggestedVenue = venuePref || 'Main Auditorium';
    if (participants > 260) suggestedVenue = 'Main Auditorium';
    else if (participants > 130) suggestedVenue = venuePref || 'Main Auditorium';
    else if (participants <= 55) suggestedVenue = venuePref || 'Seminar Hall A';

    const venueRationale =
      participants > 180
        ? 'Higher headcount usually needs tier-1 capacity and built-in AV.'
        : participants > 90
          ? 'Mid-size hall balances capacity and cost for this profile.'
          : 'Smaller rooms improve attendance density and lower venue fees.';

    const risks = [];
    if (docCount < 3) {
      risks.push('Document pack looks incomplete — ensure Agenda, Request Letter, and Risk Assessment are all uploaded before submission.');
    }
    if (totalBudget > 0 && totalBudget < peerBudgetMedian * 0.42) {
      risks.push('Budget sits far below similar past events — Finance may request justification or a phased plan.');
    }
    if (participants > 200 && totalBudget > 0 && totalBudget < peerBudgetMedian * 0.58) {
      risks.push('Large crowd projection with a lean budget — plan security, medical, and crowd-control resources explicitly.');
    }

    if (dateStr) {
      const d = new Date(dateStr);
      if (!Number.isNaN(d.getTime())) {
        const dayStart = new Date(d);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(d);
        dayEnd.setHours(23, 59, 59, 999);
        const conflicts = history.filter((e) => {
          if (!e.date) return false;
          const ed = new Date(e.date);
          return ed >= dayStart && ed <= dayEnd;
        });
        const heavy = conflicts.filter((e) => num(e.participants) + participants > 320);
        if (heavy.length) {
          risks.push(
            `${heavy.length} other sizeable event(s) overlap this date in historical records — check campus calendar for clashes.`,
          );
        } else if (conflicts.length >= 3) {
          risks.push('Several events are historically booked around this date — allow buffer for setup/teardown.');
        }
      }
    }

    const optimizations = [];
    const byCat = {};
    expenses.forEach((e) => {
      const c = String(e?.category || 'Other').trim() || 'Other';
      byCat[c] = (byCat[c] || 0) + num(e?.amount);
    });
    const sorted = Object.entries(byCat).sort((a, b) => b[1] - a[1]);
    if (sorted[0] && totalBudget > 0 && sorted[0][1] > totalBudget * 0.42) {
      optimizations.push(
        `Revisit "${sorted[0][0]}" (largest line item) — competitive quotes or scope trimming often saves 8–20%.`,
      );
    }
    if (byCat.Catering && totalBudget > 0 && byCat.Catering > totalBudget * 0.28) {
      optimizations.push('Catering is carrying a lot of weight — consider snack packs or tiered service before full meals.');
    }
    if (byCat.Equipment && byCat.Venue && byCat.Equipment + byCat.Venue > totalBudget * 0.55) {
      optimizations.push('Venue + equipment dominate spend — ask if bundled AV or in-house gear is available before renting externally.');
    }
    if (totalBudget > peerBudgetMedian * 1.45) {
      optimizations.push('Total is above peer median — align with a comparable approved event breakdown to improve approval odds.');
    }
    if (!optimizations.length) {
      optimizations.push('Keep a 10–15% contingency line for last-minute items; split “Other” into specific categories for reviewer clarity.');
    }

    res.json({
      budgetFeasibilityScore: Math.round(Math.min(100, Math.max(0, budgetScore))),
      budgetPeerMedian: Math.round(peerBudgetMedian),
      participantForecast: {
        low,
        high,
        headline: `${low}–${high} expected participants (historical band)`,
      },
      venueSuggestion: {
        preferred: venuePref || null,
        recommended: suggestedVenue,
        rationale: venueRationale,
      },
      risks,
      costOptimization: optimizations,
      dataPointsUsed: pool.length,
      engineNote:
        'Powered by historical EventSync submissions and rule-based checks. Refine budget and resources, then continue to Resources.',
    });
  } catch (e) {
    console.error('[smart-feasibility]', e);
    res.status(500).json({ message: e.message || 'Smart analysis failed' });
  }
}

module.exports = { analyzeProposal };
