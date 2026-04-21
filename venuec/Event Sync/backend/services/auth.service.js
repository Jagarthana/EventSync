const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/env');
const { DEMO_EMAIL, DEMO_PASSWORD, JWT_EXPIRES, USER_ROLE } = require('../constants/auth');
const { normalizeLoginEmail, normalizeLoginPassword } = require('../utils/normalize');
const { Profile } = require('../models');

function fail401(msg) {
  const e = new Error(msg);
  e.status = 401;
  return e;
}

async function login(body) {
  const emailNorm = normalizeLoginEmail(body?.email);
  const passNorm = normalizeLoginPassword(body?.password);
  if (emailNorm !== DEMO_EMAIL.toLowerCase() || passNorm !== DEMO_PASSWORD) {
    throw fail401('Invalid email or password');
  }
  const profile = await Profile.findOne();
  if (profile) {
    profile.email = DEMO_EMAIL;
    await profile.save();
  }
  const token = jwt.sign({ email: DEMO_EMAIL, role: USER_ROLE }, jwtSecret, { expiresIn: JWT_EXPIRES });
  return {
    token,
    user: { email: DEMO_EMAIL, role: USER_ROLE },
  };
}

async function me(user) {
  const profile = await Profile.findOne().lean();
  return { email: profile?.email || user.email, role: USER_ROLE };
}

module.exports = { login, me };
