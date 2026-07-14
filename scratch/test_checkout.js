const http = require('http');

const postData = JSON.stringify({
  fullName: 'Test User',
  phone: '+964 750 123 4567',
  province: 'Baghdad',
  address: 'Test Address',
  notes: '',
  cart: [{ id: 1, name: 'Socks', price: 10, quantity: 1, store_id: 1 }],
  subtotal: 10,
  shippingCost: 5,
  total: 15
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/orders',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log('STATUS:', res.statusCode);
    console.log('BODY:', data);
  });
});

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
});

req.write(postData);
req.end();
