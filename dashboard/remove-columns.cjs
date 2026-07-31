const fs = require('fs');
const lines = fs.readFileSync('c:/Users/shang/Desktop/GorawiXana/hawrisha-dashboard/src/components/AdminDashboard.jsx', 'utf8').split('\n');
const storesTableIdx = lines.findIndex(l => l.includes('<th>LOGO</th>'));
console.log(lines.slice(storesTableIdx - 2, storesTableIdx + 20).join('\n'));
