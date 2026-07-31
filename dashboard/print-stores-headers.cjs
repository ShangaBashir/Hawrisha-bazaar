const fs = require('fs');
const file = 'c:/Users/shang/Desktop/GorawiXana/hawrisha-dashboard/src/components/AdminDashboard.jsx';
const lines = fs.readFileSync(file, 'utf8').split('\n');

const thIndices = [];
lines.forEach((l, i) => { if(l.includes('REGISTERED STORES')) thIndices.push(i); });
if(thIndices.length > 0) {
  const start = thIndices[0];
  console.log(lines.slice(start, start + 25).join('\n'));
}
