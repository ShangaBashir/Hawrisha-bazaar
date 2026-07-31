const fs = require('fs');
const file = 'c:/Users/shang/Desktop/GorawiXana/hawrisha-dashboard/src/components/AdminDashboard.jsx';
const lines = fs.readFileSync(file, 'utf8').split('\n');
const storesTableIdx = lines.findIndex(l => l.includes('REGISTERED STORES'));
if(storesTableIdx > -1) {
  console.log(lines.slice(storesTableIdx + 5, storesTableIdx + 30).join('\n'));
}
