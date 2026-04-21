const http = require('http');

const testProxyLogin = () => {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ email: '123@gmail.com', password: 'ven1234' });
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
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
        console.log(`[Proxy Test] Status: ${res.statusCode} | Body:`, body.substring(0, 50));
        resolve();
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
};

testProxyLogin();
