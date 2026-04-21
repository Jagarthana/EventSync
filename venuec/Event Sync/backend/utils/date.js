function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function localeDateTimeString() {
  return new Date().toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

module.exports = { todayIso, localeDateTimeString };
