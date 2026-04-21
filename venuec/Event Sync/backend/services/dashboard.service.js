const { Allocation, Conflict, Maintenance, PreEventChecklist } = require('../models');
const { todayIso } = require('../utils/date');

async function summary() {
  const [allocations, conflicts, maintenanceRows, checklistRows] = await Promise.all([
    Allocation.find().lean(),
    Conflict.find().lean(),
    Maintenance.find().lean(),
    PreEventChecklist.find().lean(),
  ]);

  const checklists = {};
  for (const r of checklistRows) {
    checklists[r.bookingId] = r.checks || [];
  }

  const today = todayIso();
  const pending = allocations.filter((a) => a.status === 'pending_venue').length;
  const openConflicts = conflicts.filter((c) => c.status !== 'resolved').length;
  const issues = maintenanceRows.filter((m) => m.status === 'open').length;

  const upcomingApproved = allocations.filter((a) => a.status === 'approved' && a.date >= today);
  let preEvent = 0;
  for (const a of upcomingApproved) {
    const checks = checklists[a.bookingId] || [];
    const incomplete = checks.length === 0 || checks.some((x) => !x);
    if (incomplete) preEvent += 1;
  }

  return { pending, conflicts: openConflicts, preEvent, issues };
}

module.exports = { summary };
