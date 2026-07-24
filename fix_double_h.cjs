const fs = require('fs');
const path = require('path');

const replaceTextMap = [
  { oldText: /Hhawrisha/g, newText: 'Hawrisha' },
  { oldText: /HHAWRISHA/g, newText: 'HAWRISHA' }
];

const targetDirs = [
  path.join(__dirname, 'src'),
  path.join(__dirname, 'hawrisha-frontend', 'src'),
  path.join(__dirname, 'hawrisha-dashboard', 'src'),
  path.join(__dirname, 'hawrisha-backend'),
  path.join(__dirname, 'backend')
];

const targetFiles = [
  path.join(__dirname, 'index.html'),
  path.join(__dirname, 'hawrisha-frontend', 'index.html'),
  path.join(__dirname, 'hawrisha-dashboard', 'index.html')
];

function processFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const ext = path.extname(filePath).toLowerCase();
  if (!['.js', '.jsx', '.css', '.json', '.html', '.cjs', '.mjs', '.ts', '.tsx'].includes(ext)) return;
  if (filePath.includes('node_modules') || filePath.includes('.git') || filePath.includes('dist')) return;

  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  replaceTextMap.forEach(({ oldText, newText }) => {
    content = content.replace(oldText, newText);
  });

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Cleaned double H in: ${filePath}`);
  }
}

function processDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) return;
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== '.git' && entry.name !== 'dist') {
        processDirectory(fullPath);
      }
    } else if (entry.isFile()) {
      processFile(fullPath);
    }
  }
}

console.log('Fixing any double H text occurrences...');
targetDirs.forEach(dir => processDirectory(dir));
targetFiles.forEach(file => processFile(file));
console.log('Finished double H fixes!');
