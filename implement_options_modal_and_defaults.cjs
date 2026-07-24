const fs = require('fs');
const path = require('path');

const targetFiles = [
  path.join(__dirname, 'hawrisha-frontend', 'src', 'components', 'AllProducts.jsx'),
  path.join(__dirname, 'src', 'components', 'AllProducts.jsx')
];

targetFiles.forEach(tf => {
  if (!fs.existsSync(tf)) return;
  let content = fs.readFileSync(tf, 'utf8');

  // Ensure default sizeOptions includes EU 36-40, EU 41-45, Free Size if empty
  content = content.replace(
    /const sizeOptions = parseJsonArray\(([^)]+)\)\.filter\(s => s && s !== 'One Size'\);/g,
    "const parsedSizes = parseJsonArray($1).filter(s => s && s !== 'One Size');\nconst sizeOptions = parsedSizes.length > 0 ? parsedSizes : ['EU 36-40', 'EU 41-45', 'Free Size'];"
  );

  // Ensure default colors are available if product.colors is empty
  content = content.replace(
    /: \(viewingProduct\.colors \|\| \[\]\);/g,
    ": (viewingProduct.colors && viewingProduct.colors.length > 0 ? viewingProduct.colors : ['bg-[#C08081]', 'bg-[#B2AC88]', 'bg-[#F5F5DC]', 'bg-[#36454F]']);"
  );

  content = content.replace(
    /: \(optionsModalProduct\.colors \|\| \[\]\);/g,
    ": (optionsModalProduct.colors && optionsModalProduct.colors.length > 0 ? optionsModalProduct.colors : ['bg-[#C08081]', 'bg-[#B2AC88]', 'bg-[#F5F5DC]', 'bg-[#36454F]']);"
  );

  fs.writeFileSync(tf, content, 'utf8');
  console.log(`Updated size & color defaults in: ${tf}`);
});

console.log('Finished options defaults update!');
