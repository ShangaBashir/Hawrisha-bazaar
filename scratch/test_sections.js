const fs = require('fs');
const path = require('path');
const babel = require('@babel/parser');

const filePath = path.join(__dirname, '..', 'dashboard', 'src', 'components', 'AdminDashboard.jsx');
const code = fs.readFileSync(filePath, 'utf8');
const lines = code.split('\n');

// Find function body of AdminDashboard
const startLine = 369; // line where function AdminDashboard starts
const endLine = 8570;  // line where function AdminDashboard ends

// Let's test binary search or line-by-line block syntax check
for (let targetLine = startLine + 100; targetLine <= endLine; targetLine += 100) {
  const partialCode = lines.slice(0, targetLine).join('\n') + '\n}';
  try {
    babel.parse(partialCode, { sourceType: 'module', plugins: ['jsx'] });
    // If this parses cleanly, then up to targetLine everything is closed!
    console.log(`Parsed cleanly up to line ${targetLine}`);
  } catch (err) {
    // If it fails with unexpected token near end, that line or before has an unclosed block
    console.log(`Failed at line ${targetLine}: ${err.message}`);
  }
}
