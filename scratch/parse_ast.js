const fs = require('fs');
const path = require('path');
const babel = require('@babel/parser');

const filePath = path.join(__dirname, '..', 'dashboard', 'src', 'components', 'AdminDashboard.jsx');
const code = fs.readFileSync(filePath, 'utf8');

try {
  babel.parse(code, {
    sourceType: 'module',
    plugins: ['jsx']
  });
  console.log("SUCCESS! No syntax errors found in dashboard/src/components/AdminDashboard.jsx.");
} catch (err) {
  console.error("Syntax Error found!");
  console.error("Message:", err.message);
  console.error("Line:", err.loc ? err.loc.line : 'unknown');
  console.error("Column:", err.loc ? err.loc.column : 'unknown');
}
