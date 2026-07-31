const http = require('http');

const boundary = 'FormB' + Date.now();
function field(name, value) {
  return `--${boundary}\r\nContent-Disposition: form-data; name="${name}"\r\n\r\n${value}\r\n`;
}

let body = '';
body += field('name', JSON.stringify({en:"Test Socks Post",ku:"جووراب",ar:"جورب"}));
body += field('price', '1500');
body += field('category', JSON.stringify(["crew"]));
body += field('colorFamily', JSON.stringify(["green"]));
body += field('badge', JSON.stringify([]));
body += field('desc', JSON.stringify({en:"test desc",ku:"d",ar:"d"}));
body += field('colors', JSON.stringify(["bg-emerald-600"]));
body += field('colorNames', JSON.stringify(["Avocado Green"]));
body += field('styleLength', JSON.stringify(["crew"]));
body += field('stock', '10');
body += field('promotion', JSON.stringify([]));
body += field('material', JSON.stringify(["cotton"]));
body += field('seasonalType', JSON.stringify(["summer"]));
body += field('sizeCollection', JSON.stringify(["one_size"]));
body += field('sizeColors', JSON.stringify({"one_size":["bg-emerald-600"]}));
body += field('discount', '0');
body += field('vendorEmail', 'admin@gmail.com');
body += field('storeId', '1');
body += field('gender', '');
body += field('colorVariants', JSON.stringify([{
  color: {id:"green",class:"bg-emerald-600",name:"Avocado Green",family:"green"},
  image: '',
  sizes: ["one_size"],
  stock: {"one_size": 5}
}]));
body += `--${boundary}--\r\n`;

const buf = Buffer.from(body, 'utf8');
const req = http.request({
  hostname: 'localhost',
  port: 5001,
  path: '/api/products',
  method: 'POST',
  headers: {
    'Content-Type': `multipart/form-data; boundary=${boundary}`,
    'Content-Length': buf.length
  }
}, (res) => {
  let responseBody = '';
  res.on('data', d => responseBody += d);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Response:', responseBody);
    // Clean up if created
    if (res.statusCode === 201) {
      const data = JSON.parse(responseBody);
      http.request({
        hostname:'localhost', port:5001,
        path:`/api/products/${data.id}?vendorEmail=admin@gmail.com`,
        method:'DELETE'
      }, r => { 
        let b=''; r.on('data',d=>b+=d);
        r.on('end', () => { console.log('Cleaned up product'); process.exit(0); });
      }).end();
    } else {
      process.exit(0);
    }
  });
});
req.on('error', e => { console.error('Error:', e.message); process.exit(1); });
req.write(buf);
req.end();
