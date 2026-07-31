const fs = require('fs');
const lines = fs.readFileSync('c:/Users/shang/Desktop/GorawiXana/hawrisha-dashboard/src/components/AdminDashboard.jsx', 'utf8').split('\n');

const stateIdx = lines.findIndex(l => l.includes('const [settingsTab'));
if(stateIdx > -1) console.log('State at:', stateIdx, lines[stateIdx]);

const tabsIdx = lines.findIndex(l => l.includes('id: "categories"'));
if(tabsIdx > -1) console.log('Tabs at:', tabsIdx, lines.slice(tabsIdx-2, tabsIdx+4).join('\n'));

const storesTableIdx = lines.findIndex(l => l.includes('REGISTERED STORES'));
if(storesTableIdx > -1) console.log('Stores Table at:', storesTableIdx, lines.slice(storesTableIdx, storesTableIdx + 40).join('\n'));
