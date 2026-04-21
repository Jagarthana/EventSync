const activityService = require('../services/activity.service');

async function list(_req, res) {
  const data = await activityService.listActivity();
  res.json({ data });
}

async function create(req, res) {
  const data = await activityService.createActivity(req.body);
  res.json({ data });
}

module.exports = { list, create };
