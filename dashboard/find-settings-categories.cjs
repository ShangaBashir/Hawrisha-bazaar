const fs = require('fs');
const file = 'c:/Users/shang/Desktop/GorawiXana/hawrisha-dashboard/src/components/AdminDashboard.jsx';
const lines = fs.readFileSync(file, 'utf8').split('\n');

const idx = lines.findIndex(l => l.includes('settingsSubTab === "categories"') || l.includes("settingsSubTab === 'categories'"));
if (idx > -1) {
  console.log('Found categories block in settings at line:', idx + 1);
  console.log(lines.slice(idx - 2, idx + 40).join('\n'));
} else {
  console.log('Not found by settingsSubTab === "categories"');
}
