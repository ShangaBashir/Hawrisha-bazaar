const fs = require('fs');
const path = require('path');

// White H icon favicon
const whiteFaviconHContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="1 2 19 20" fill="none">
  <path d="M 4 2 h 5 v 20 H 3 a 2 2 0 0 1 -2 -2 a 2 2 0 0 1 2 -2 h 1 V 2 Z M 15 2 h 5 v 20 H 14 a 2 2 0 0 1 -2 -2 a 2 2 0 0 1 2 -2 h 1 V 2 Z M 9 10 h 6 v 3 H 9 Z" fill="#FFFFFF" />
</svg>`;

// Update favicons to White H
const faviconPaths = [
  path.join(__dirname, 'public', 'favicon.svg'),
  path.join(__dirname, 'hawrisha-frontend', 'public', 'favicon.svg'),
  path.join(__dirname, 'hawrisha-dashboard', 'public', 'favicon.svg')
];

faviconPaths.forEach(fp => {
  if (fs.existsSync(fp)) {
    fs.writeFileSync(fp, whiteFaviconHContent, 'utf8');
    console.log(`Updated favicon with white H: ${fp}`);
  }
});

const replaceTextMap = [
  { oldText: /AWRISHA BAZAAR/g, newText: 'HAWRISHA BAZAAR' },
  { oldText: /Awrisha Bazaar/g, newText: 'Hawrisha Bazaar' },
  { oldText: /awrisha bazaar/g, newText: 'hawrisha bazaar' },
  { oldText: /AWRISHA/g, newText: 'HAWRISHA' },
  { oldText: /Awrisha/g, newText: 'Hawrisha' },
  { oldText: /awrisha/g, newText: 'hawrisha' },
  { oldText: /أوريشا/g, newText: 'هاوريشا' },
  { oldText: /ئاوڕیشا/g, newText: 'هاوڕێشا' }
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

  // Restore SVG path for H logo
  content = content.replace(
    /d="M 12 2 L 3 22 h 4.5 l 2.2 -5 h 4.6 l 2.2 5 H 21 Z M 10.8 13 L 12 7.2 L 13.2 13 Z"/g,
    'd="M 4 2 h 5 v 20 H 3 a 2 2 0 0 1 -2 -2 a 2 2 0 0 1 2 -2 h 1 V 2 Z M 15 2 h 5 v 20 H 14 a 2 2 0 0 1 -2 -2 a 2 2 0 0 1 2 -2 h 1 V 2 Z M 9 10 h 6 v 3 H 9 Z"'
  );

  // Set Big H logo class in Header to text-white for white color
  content = content.replace(
    /<HawrishaH size=\{38\} className="text-\[#36454F\]/g,
    '<HawrishaH size={38} className="text-white'
  );

  replaceTextMap.forEach(({ oldText, newText }) => {
    content = content.replace(oldText, newText);
  });

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated file: ${filePath}`);
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

console.log('Applying Hawrisha brand & White H logo updates...');
targetDirs.forEach(dir => processDirectory(dir));
targetFiles.forEach(file => processFile(file));
console.log('Finished final updates!');
