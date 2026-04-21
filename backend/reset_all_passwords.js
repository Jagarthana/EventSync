const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

dotenv.config();

const resetAllPasswords = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const salt = await bcrypt.genSalt(10);
    const newPassword = await bcrypt.hash('12345678', salt);

    await User.updateMany({}, { $set: { password: newPassword } });
    console.log('Successfully reset ALL user passwords to: 12345678');

    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
};

resetAllPasswords();
