const fs = require('fs');
const file = 'c:/Users/shang/Desktop/GorawiXana/hawrisha-dashboard/src/components/AdminDashboard.jsx';
const lines = fs.readFileSync(file, 'utf8').split('\n');

lines.forEach((l, i) => {
  if (l.includes('System & Store Settings') || l.includes('BADGES / LABELS') || l.includes('settingsSubTab')) {
    console.log(i + 1, l.trim());
  }
});
