const fs = require('fs');
const path = require('path');

const faviconContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
  <path d="M 12 2 L 3 22 h 4.5 l 2.2 -5 h 4.6 l 2.2 5 H 21 Z M 10.8 13 L 12 7.2 L 13.2 13 Z" fill="#36454F" />
</svg>`;

// Update favicons
const faviconPaths = [
  path.join(__dirname, 'public', 'favicon.svg'),
  path.join(__dirname, 'hawrisha-frontend', 'public', 'favicon.svg'),
  path.join(__dirname, 'hawrisha-dashboard', 'public', 'favicon.svg')
];

faviconPaths.forEach(fp => {
  if (fs.existsSync(fp)) {
    fs.writeFileSync(fp, faviconContent, 'utf8');
    console.log(`Updated favicon: ${fp}`);
  }
});

// Helper for replacement in code files
const replaceTextMap = [
  { oldText: /HAWRISHA BAZAAR/g, newText: 'AWRISHA BAZAAR' },
  { oldText: /Hawrisha Bazaar/g, newText: 'Awrisha Bazaar' },
  { oldText: /hawrisha bazaar/g, newText: 'awrisha bazaar' },
  { oldText: /HAWRISHA/g, newText: 'AWRISHA' },
  { oldText: /Hawrisha/g, newText: 'Awrisha' },
  { oldText: /هاوريشا/g, newText: 'أوريشا' },
  { oldText: /هاوڕێشا/g, newText: 'ئاوڕیشا' }
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
  // Avoid changing file path names / imports of backend directory name
  if (filePath.includes('node_modules') || filePath.includes('.git') || filePath.includes('dist')) return;

  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Replace SVG path for old H logo if present in Header / Footer
  content = content.replace(
    /d="M 4 2 h 5 v 20 H 3 a 2 2 0 0 1 -2 -2 a 2 2 0 0 1 2 -2 h 1 V 2 Z M 15 2 h 5 v 20 H 14 a 2 2 0 0 1 -2 -2 a 2 2 0 0 1 2 -2 h 1 V 2 Z M 9 10 h 6 v 3 H 9 Z"/g,
    'd="M 12 2 L 3 22 h 4.5 l 2.2 -5 h 4.6 l 2.2 5 H 21 Z M 10.8 13 L 12 7.2 L 13.2 13 Z"'
  );

  replaceTextMap.forEach(({ oldText, newText }) => {
    content = content.replace(oldText, newText);
  });

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated text in: ${filePath}`);
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

console.log('Starting brand name replacements...');
targetDirs.forEach(dir => processDirectory(dir));
targetFiles.forEach(file => processFile(file));
console.log('Finished brand name replacements!');
