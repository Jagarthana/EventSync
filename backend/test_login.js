const axios = require('axios');
const http = require('http');

const testLogin = async (email, password) => {
  try {
    console.log(`Testing login for ${email}...`);
    const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
    console.log('SUCCESS:', res.data.email, res.data.roles);
  } catch (err) {
    console.log('FAILED:', err.response?.data || err.message);
  }
};

const run = async () => {
  await testLogin('123@gmail.com', 'ven1234');
  await testLogin('fin@gmail.com', 'ven1234');
  await testLogin('ven@gmail.com', 'ven1234');
  await testLogin('stdservices@gmail.com', 'ven1234');
};

run();
