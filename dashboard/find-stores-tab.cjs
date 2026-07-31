const fs = require('fs');
const file = 'c:/Users/shang/Desktop/GorawiXana/hawrisha-dashboard/src/components/AdminDashboard.jsx';
const lines = fs.readFileSync(file, 'utf8').split('\n');
const storesTabIdx = lines.findIndex(l => l.includes('activeTab === "stores" && ('));
if(storesTabIdx > -1) {
  console.log(lines.slice(storesTabIdx, storesTabIdx + 150).join('\n'));
}
