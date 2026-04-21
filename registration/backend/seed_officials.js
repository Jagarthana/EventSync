const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

dotenv.config();

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash('ven1234', salt);

    const officials = [
      { name: 'Finance Manager', email: 'fin@gmail.com', password, role: 'Finance' },
      { name: 'Venue Allocation Officer', email: 'ven@gmail.com', password, role: 'Venue' },
      { name: 'Governance Officer', email: 'governance@sliit.lk', password, role: 'Governance' }
    ];

    for (let o of officials) {
      const exists = await User.findOne({ email: o.email });
      if (!exists) {
        await User.create(o);
        console.log(`Created ${o.role} account`);
      } else {
        await User.updateOne({ email: o.email }, { $set: { password: o.password, role: o.role } });
        console.log(`Updated ${o.role} account`);
      }
    }

    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
};

seed();
