const fs = require('fs');
const file = 'c:/Users/shang/Desktop/GorawiXana/hawrisha-dashboard/src/components/AdminDashboard.jsx';
let content = fs.readFileSync(file, 'utf8');

const emailHeaderPattern = /<th[^>]*>\s*Email\s*<\/th>\s*/i;
const phoneHeaderPattern = /<th[^>]*>\s*Phone\s*<\/th>\s*/i;
content = content.replace(emailHeaderPattern, '');
content = content.replace(phoneHeaderPattern, '');

fs.writeFileSync(file, content);
console.log('Case-insensitive header removal complete.');
