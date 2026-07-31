const fs = require('fs');
const lines = fs.readFileSync('./src/components/AdminDashboard.jsx', 'utf8').split('\n');
lines.forEach((line, idx) => {
  if (line.includes('handleAddCity') || line.includes('handleDeleteCity') || line.includes('cities') || line.includes('City')) {
    if (line.includes('const') || line.includes('function')) {
      console.log(idx + 1, ':', line.trim());
    }
  }
});
