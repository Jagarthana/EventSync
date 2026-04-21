const profileService = require('../services/profile.service');

async function get(req, res) {
  const data = await profileService.getProfile();
  res.json({ data });
}

async function update(req, res) {
  const data = await profileService.updateProfile(req.body);
  res.json({ data });
}

module.exports = { get, update };
