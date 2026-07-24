const fs = require('fs');
const path = require('path');

const colorMap = [
  { oldRegex: /#E17578/gi, newHex: '#C08081' },
  { oldRegex: /#C9C293/gi, newHex: '#B2AC88' },
  { oldRegex: /#425664/gi, newHex: '#36454F' },
  { oldRegex: /#9C9672/gi, newHex: '#8E8866' }
];

const targetDirs = [
  path.join(__dirname, 'src'),
  path.join(__dirname, 'hawrisha-frontend'),
  path.join(__dirname, 'hawrisha-dashboard'),
  path.join(__dirname, 'hawrisha-backend'),
  path.join(__dirname, 'backend')
];

const targetFiles = [
  path.join(__dirname, 'tailwind.config.js'),
  path.join(__dirname, 'update_home_colors.cjs')
];

function processFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const ext = path.extname(filePath).toLowerCase();
  if (!['.js', '.jsx', '.css', '.json', '.html', '.cjs', '.mjs', '.ts', '.tsx'].includes(ext)) return;
  if (filePath.includes('node_modules') || filePath.includes('.git') || filePath.includes('dist')) return;

  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  colorMap.forEach(({ oldRegex, newHex }) => {
    content = content.replace(oldRegex, newHex);
  });

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated colors in: ${filePath}`);
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

console.log('Starting color updates...');
targetDirs.forEach(dir => processDirectory(dir));
targetFiles.forEach(file => processFile(file));
console.log('Finished updating colors across project!');
