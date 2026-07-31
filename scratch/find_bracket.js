const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'dashboard', 'src', 'components', 'AdminDashboard.jsx');
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

const stack = [];

for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
  const line = lines[lineIdx];
  for (let colIdx = 0; colIdx < line.length; colIdx++) {
    const char = line[colIdx];
    if (char === '{') {
      stack.push({ line: lineIdx + 1, snippet: line.trim() });
    } else if (char === '}') {
      stack.pop();
    }
  }
}

console.log("Remaining stack:");
stack.forEach(s => console.log(`Line ${s.line}: ${s.snippet}`));
