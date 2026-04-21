const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const reset = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);
    
    const user = await User.findOneAndUpdate(
      { email: 'it12345678@my.sliit.lk' },
      { password: hashedPassword },
      { new: true, upsert: true }
    );
    
    console.log('User updated/created:', user.email);
    console.log('Password set to: password123');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
};

reset();
