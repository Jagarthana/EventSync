const { Allocation } = require('../models');
const { leanPlain } = require('../utils/transform');
const { findOverlapPairs } = require('../utils/allocationOverlap');

async function listOverlaps() {
  const rows = await Allocation.find().lean();
  const list = rows.map(leanPlain);
  const pairs = findOverlapPairs(list);
  return { pairs, count: pairs.length };
}

module.exports = { listOverlaps };
