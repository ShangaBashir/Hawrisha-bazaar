const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, 'src', 'components');
const filesToUpdate = [
  'HeroCarousel.jsx',
  'ShowcaseSection.jsx',
  'SocksStory.jsx',
  'StoreMarquee.jsx'
];

filesToUpdate.forEach(file => {
  const filePath = path.join(componentsDir, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Background color
    content = content.replace(/#f4f3e6/gi, '#F5F5DC');
    
    // Dark colors
    content = content.replace(/#1a1a1a/gi, '#36454F');
    content = content.replace(/#2d3748/gi, '#36454F');
    
    // Red colors
    content = content.replace(/#a03033/gi, '#C08081');

    // Specific text replacements in SocksStory
    if (file === 'SocksStory.jsx') {
      content = content.replace(/@hawrisha/g, '@Fashion');
      content = content.replace(/@premium/g, '@Elegance');
      // Hover changes for SocksStory buttons
      content = content.replace(/hover:bg-\[#36454F\]/g, 'hover:bg-[#B2AC88]');
    }

    // Hover changes for HeroCarousel
    if (file === 'HeroCarousel.jsx') {
      content = content.replace(/hover:bg-black/g, 'hover:bg-[#B2AC88]');
    }

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});
