const fs = require('fs');
const file = 'c:/Users/shang/Desktop/GorawiXana/hawrisha-dashboard/src/components/AdminDashboard.jsx';
const lines = fs.readFileSync(file, 'utf8').split('\n');

const idx = lines.findIndex(l => l.includes('activeTab === "settings" && ('));
if (idx > -1) {
  console.log('Settings start line:', idx + 1);
  console.log(lines.slice(idx, idx + 50).join('\n'));
}
