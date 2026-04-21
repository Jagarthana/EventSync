/**
 * Host string for startup logs — prefers driver-resolved host (Atlas shard) after connect.
 */
function hostFromUri(mongoUri) {
  const s = String(mongoUri || '');
  const at = s.indexOf('@');
  if (at === -1) return '127.0.0.1';
  const rest = s.slice(at + 1);
  const end = rest.search(/[/?]/);
  const hostPort = end === -1 ? rest : rest.slice(0, end);
  return hostPort.split(':')[0] || hostPort;
}

function getMongoDisplayHost(mongoose, mongoUri) {
  const c = mongoose.connection;
  if (c && c.host) return c.host;
  return hostFromUri(mongoUri);
}

module.exports = { getMongoDisplayHost, hostFromUri };
