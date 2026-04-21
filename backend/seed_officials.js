const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

dotenv.config({ path: path.join(__dirname, '.env') });

const seed = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error('MONGO_URI is missing. Copy backend/.env.example to backend/.env and set MONGO_URI.');
      process.exit(1);
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const salt = await bcrypt.genSalt(10);
    const defaultPassword = '12345678';
    const password = await bcrypt.hash(defaultPassword, salt);

    const officials = [
      // Must match student email rules: IT/BM + 8 alphanumeric @my.sliit.lk
      { name: 'Student Organizer', email: 'it12345678@my.sliit.lk', password, roles: ['Organizer'] },
      { name: 'Governance and Approval Officer', email: 'stdservices@gmail.com', password, roles: ['Governance'] },
      { name: 'Finance Manager', email: 'fin@gmail.com', password, roles: ['Finance'] },
      { name: 'Venue and Resource Allocation Officer', email: 'ven@gmail.com', password, roles: ['Venue'] },
      { name: 'Student Services Officer', email: 'studentservices@gmail.com', password, roles: ['StudentServices'] },
    ];

    for (let o of officials) {
      const exists = await User.findOne({ email: o.email });
      if (!exists) {
        await User.create(o);
        console.log(`Created ${o.roles[0]} account: ${o.email}`);
      } else {
        await User.updateOne(
          { email: o.email },
          { $set: { name: o.name, password: o.password, roles: o.roles } }
        );
        console.log(`Updated ${o.roles[0]} account: ${o.email}`);
      }
    }

    console.log(`\nDefault password for seeded users: ${defaultPassword}`);

    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
};

seed();
