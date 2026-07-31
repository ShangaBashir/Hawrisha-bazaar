const fs = require('fs');
const lines = fs.readFileSync('c:/Users/shang/Desktop/GorawiXana/hawrisha-dashboard/src/components/AdminDashboard.jsx', 'utf8').split('\n');
const storesTableIdx = lines.findIndex(l => l.includes('STORE NAME') && l.includes('<th'));
if(storesTableIdx > -1) {
  console.log('Stores table headers:', lines.slice(storesTableIdx - 2, storesTableIdx + 15).join('\n'));
}

const tableDataIdx = lines.findIndex(l => l.includes('store.email') && l.includes('<td'));
if(tableDataIdx > -1) {
  console.log('Stores table data:', lines.slice(tableDataIdx - 5, tableDataIdx + 10).join('\n'));
}
