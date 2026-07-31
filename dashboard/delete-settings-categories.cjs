const fs = require('fs');
const file = 'c:/Users/shang/Desktop/GorawiXana/hawrisha-dashboard/src/components/AdminDashboard.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Remove the JSX block for categories subtab in settings
// Finding start: {/* Category Subtab */}
// and end before: {/* Badges Subtab */}

const startMarker = '{/* Category Subtab */}';
const endMarker = '{/* Badges Subtab */}';

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker);

if (startIndex !== -1 && endIndex !== -1 && startIndex < endIndex) {
  content = content.slice(0, startIndex) + content.slice(endIndex);
  console.log('Successfully removed settings category subtab JSX block.');
} else {
  console.log('Could not find start/end markers:', startIndex, endIndex);
}

// 2. Update subtitle text to remove mention of categories in settings header
content = content.replace('from product categories and labels', 'from product labels');

fs.writeFileSync(file, content);
