const fs = require('fs');
const lines = fs.readFileSync('c:/Users/shang/Desktop/GorawiXana/hawrisha-dashboard/src/components/AdminDashboard.jsx', 'utf8').split('\n');
lines.forEach((l, i) => { 
  if(l.toLowerCase().includes('email') || l.toLowerCase().includes('phone')) {
    if (l.includes('th>') || l.includes('<th') || l.includes('header')) {
      console.log(i+1, l.trim());
    }
  }
});
