const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const check = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const users = await User.find(
      { email: { $in: ['it12345678@my.sliit.lk', 'stdservices@gmail.com', 'fin@gmail.com', 'ven@gmail.com'] } },
      'email roles'
    );
    console.log('--- Database Verification ---');
    users.forEach(u => console.log(`${u.email}: ${JSON.stringify(u.roles)}`));
    process.exit(0);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};
check();
