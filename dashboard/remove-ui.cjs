const fs = require('fs');
const file = 'c:/Users/shang/Desktop/GorawiXana/hawrisha-dashboard/src/components/AdminDashboard.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Settings - change default tab
content = content.replace('const [settingsSubTab, setSettingsSubTab] = useState("categories");', 'const [settingsSubTab, setSettingsSubTab] = useState("badges");');

// 2. Settings - remove Categories from tabs list
const categoriesTabPattern = /\s*\{\s*id:\s*"categories",\s*label:\s*"Categories"\s*\},\n?/;
content = content.replace(categoriesTabPattern, '');

// 3. Stores - remove Email and Phone headers
const emailHeaderPattern = /<th[^>]*>\s*EMAIL\s*<\/th>\s*/;
const phoneHeaderPattern = /<th[^>]*>\s*PHONE\s*<\/th>\s*/;
content = content.replace(emailHeaderPattern, '');
content = content.replace(phoneHeaderPattern, '');

// 4. Stores - remove Email and Phone data cells
const emailTdPattern = /\s*\{\/\* Email \*\/\}\s*<td[^>]*>\{store\.email\}<\/td>/;
const phoneTdPattern = /\s*\{\/\* Phone \*\/\}\s*<td[^>]*>\{store\.phone \|\| '—'\}<\/td>/;
content = content.replace(emailTdPattern, '');
content = content.replace(phoneTdPattern, '');

fs.writeFileSync(file, content);
console.log('UI elements removed successfully.');
