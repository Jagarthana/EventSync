const { Profile } = require('../models');
const { leanPlain } = require('../utils/transform');

async function getProfile() {
  const profile = await Profile.findOne().lean();
  const p = leanPlain(profile);
  return p || {};
}

async function updateProfile(body) {
  const profile = await Profile.findOne();
  if (!profile) {
    const e = new Error('Profile not found');
    e.status = 404;
    throw e;
  }
  Object.assign(profile, body || {});
  await profile.save();
  return leanPlain(profile);
}

module.exports = { getProfile, updateProfile };
