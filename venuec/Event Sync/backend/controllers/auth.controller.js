const authService = require('../services/auth.service');

async function login(req, res) {
  const data = await authService.login(req.body);
  res.json({ data });
}

async function me(req, res) {
  const data = await authService.me(req.user);
  res.json({ data });
}

module.exports = { login, me };
