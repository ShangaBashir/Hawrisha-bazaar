const fs = require('fs');
const file = 'c:/Users/shang/Desktop/GorawiXana/hawrisha-dashboard/src/components/AdminDashboard.jsx';
const content = fs.readFileSync(file, 'utf8');

const hasCategoryTab = content.includes('activeTab === "category"');
const hasCategoriesBlock = content.includes('settingsSubTab === "categories"');

console.log('Main Category Sidebar Tab intact:', hasCategoryTab);
console.log('Settings Categories Subtab present:', hasCategoriesBlock);
