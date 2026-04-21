const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

function trimUri(uri) {
  if (uri == null) return '';
  return String(uri).trim();
}

const mongoUri =
  trimUri(process.env.MONGO_URI) ||
  trimUri(process.env.MONGODB_URI) ||
  'mongodb://127.0.0.1:27017/eventsync';

const jwtSecret = trimUri(process.env.JWT_SECRET) || 'eventsync-dev-secret-change-me';

if (!mongoUri.startsWith('mongodb://') && !mongoUri.startsWith('mongodb+srv://')) {
  console.error('Invalid MONGO_URI: must start with mongodb:// or mongodb+srv://');
  process.exit(1);
}

module.exports = {
  port: Number(process.env.PORT) || 5000,
  mongoUri,
  jwtSecret,
};
