const dashboardService = require('../services/dashboard.service');

async function summary(_req, res) {
  const data = await dashboardService.summary();
  res.json({ data });
}

module.exports = { summary };
