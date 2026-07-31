const fs = require('fs');
const file = 'c:/Users/shang/Desktop/GorawiXana/hawrisha-dashboard/src/components/AdminDashboard.jsx';
const lines = fs.readFileSync(file, 'utf8').split('\n');

for (let i = 3515; i < 3530; i++) {
  console.log(i + 1, lines[i]);
}
