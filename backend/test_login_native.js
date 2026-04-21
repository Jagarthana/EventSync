const http = require('http');

const testLogin = (email, password) => {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ email, password });
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        console.log(`[${email}] Status: ${res.statusCode} | Body:`, body.substring(0, 50));
        resolve();
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
};

const run = async () => {
  await testLogin('123@gmail.com', 'ven1234');
  await testLogin('fin@gmail.com', 'ven1234');
  await testLogin('ven@gmail.com', 'ven1234');
  await testLogin('stdservices@gmail.com', 'ven1234');
};

run();
