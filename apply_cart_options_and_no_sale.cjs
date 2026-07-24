const fs = require('fs');
const path = require('path');

// Files to update
const targetFiles = [
  path.join(__dirname, 'hawrisha-frontend', 'src', 'components', 'AllProducts.jsx'),
  path.join(__dirname, 'src', 'components', 'AllProducts.jsx'),
  path.join(__dirname, 'hawrisha-frontend', 'src', 'components', 'ProductGrid.jsx'),
  path.join(__dirname, 'src', 'components', 'ProductGrid.jsx'),
  path.join(__dirname, 'hawrisha-frontend', 'src', 'components', 'Stores.jsx'),
  path.join(__dirname, 'src', 'components', 'Stores.jsx'),
  path.join(__dirname, 'hawrisha-frontend', 'src', 'components', 'BestSeller.jsx'),
  path.join(__dirname, 'src', 'components', 'BestSeller.jsx'),
  path.join(__dirname, 'hawrisha-frontend', 'src', 'components', 'Header.jsx'),
  path.join(__dirname, 'src', 'components', 'Header.jsx')
];

function processFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // 1. Filter out 'Sale' badge from rendering in parseJsonArray maps
  content = content.replace(
    /parseJsonArray\(([^)]+)\)\.filter\(Boolean\)/g,
    "parseJsonArray($1).filter(Boolean).filter(b => String(b).toLowerCase() !== 'sale')"
  );

  // 2. Filter out 'Sale' badge in Stores.jsx / ProductGrid.jsx
  content = content.replace(
    /badges\.map\(\(b\)/g,
    "badges.filter(b => String(b).toLowerCase() !== 'sale').map((b)"
  );

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated badges & removed Sale label in: ${filePath}`);
  }
}

console.log('Processing files to remove SALE badges everywhere...');
targetFiles.forEach(file => processFile(file));
console.log('Finished removing SALE badges!');
