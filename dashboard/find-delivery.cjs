const fs = require('fs');
const lines = fs.readFileSync('c:/Users/shang/Desktop/GorawiXana/hawrisha-dashboard/src/components/AdminDashboard.jsx', 'utf8').split('\n');
const idx = lines.findIndex(l => l.includes('activeTab === "delivery" && ('));
if(idx > -1) {
  console.log('Found JSX UI at line:', idx + 1);
  console.log(lines.slice(Math.max(0, idx - 5), idx + 20).join('\n'));
} else {
  console.log('JSX UI Not found');
}
