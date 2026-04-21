function normalizeLoginEmail(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\u200b/g, '');
}

function normalizeLoginPassword(value) {
  return String(value || '').trim().replace(/\u200b/g, '');
}

module.exports = { normalizeLoginEmail, normalizeLoginPassword };
