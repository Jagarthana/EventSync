const adminService = require('../services/admin.service');

async function resetDemo(_req, res) {
  const data = await adminService.resetDemo();
  res.json({ data });
}

module.exports = { resetDemo };
