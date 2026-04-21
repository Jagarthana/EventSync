const mongoose = require('mongoose');

const { Schema } = mongoose;

const profileSchema = new Schema(
  {
    email: String,
    displayName: String,
    department: String,
    roleTitle: String,
    phone: String,
    avatarDataUrl: String,
  },
  { collection: 'profiles' }
);

module.exports = mongoose.models.Profile || mongoose.model('Profile', profileSchema);
