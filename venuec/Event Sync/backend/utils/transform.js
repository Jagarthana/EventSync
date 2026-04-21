function leanPlain(doc) {
  if (!doc) return doc;
  const o = typeof doc.toObject === 'function' ? doc.toObject() : { ...doc };
  delete o._id;
  delete o.__v;
  return o;
}

function conflictToClient(doc) {
  const o = leanPlain(doc);
  if (!o) return o;
  const { conflictId, ...rest } = o;
  return { id: conflictId, ...rest };
}

function maintenanceToClient(doc) {
  const o = leanPlain(doc);
  if (!o) return o;
  const { maintId, ...rest } = o;
  return { id: maintId, ...rest };
}

module.exports = { leanPlain, conflictToClient, maintenanceToClient };
