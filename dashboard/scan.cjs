const fs = require('fs');
const lines = fs.readFileSync('c:/Users/shang/Desktop/GorawiXana/hawrisha-dashboard/src/components/AdminDashboard.jsx', 'utf8').split('\n');

const searchPoints = [
  'const [activeTab, setActiveTab]',
  'const handleSidebarTabClick',
  'Settings Navigation',
  '<div className="w-64 bg-[#36454F] text-white flex flex-col shadow-2xl z-20 shrink-0">',
  '<div className="flex-1 flex flex-col min-w-0 bg-slate-50 relative">',
  'let filteredProducts = products.filter',
  'let sortedStores = stores.filter',
  'let sortedOrders = orders.filter',
  'const renderTabContent ='
];

for (const sp of searchPoints) {
  const index = lines.findIndex(l => l.includes(sp));
  if (index !== -1) {
    console.log(`\n--- Found: ${sp} at line ${index + 1} ---`);
    console.log(lines.slice(index - 2, index + 5).join('\n'));
  } else {
    console.log(`\n--- NOT FOUND: ${sp} ---`);
  }
}
