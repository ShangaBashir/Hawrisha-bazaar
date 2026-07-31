const fs = require('fs');
const file = 'c:/Users/shang/Desktop/GorawiXana/hawrisha-dashboard/src/components/AdminDashboard.jsx';
const lines = fs.readFileSync(file, 'utf8').split('\n');

const settingsIdx = lines.findIndex(l => l.includes('activeTab === "settings" && ('));
if(settingsIdx > -1) {
  // Find matching closing paren/brace or end of block
  let depth = 0;
  for(let i = settingsIdx; i < lines.length; i++) {
    const l = lines[i];
    if (l.includes('System Settings') || l.includes('System & Store Settings') || l.includes('General Settings') || l.includes('Cities Management')) {
      console.log(i + 1, l.trim());
    }
  }
}
