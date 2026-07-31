const fs = require('fs');
const file = 'c:/Users/shang/Desktop/GorawiXana/hawrisha-dashboard/src/components/AdminDashboard.jsx';
let content = fs.readFileSync(file, 'utf8');

// The block to extract:
// From "// Fetch store delivery prices when Delivery tab is active"
// To just before "const [storeFilter, setStoreFilter] = useState(null);"
const extractRegex = /\s*\/\/ Fetch store delivery prices when Delivery tab is active[\s\S]*?(?=\s*const \[storeFilter, setStoreFilter\] = useState\(null\);)/;

const match = content.match(extractRegex);
if(match) {
  const block = match[0];
  content = content.replace(block, ''); // remove it from the top

  const anchor = `const currentUserStoreId = currentUserRole === "vendor" && products.length > 0 ? products[0].store_id : (currentUserRole === "vendor" ? (stores.find(s => s.email === currentUserEmail)?.id || null) : null);`;
  
  if (content.includes(anchor)) {
    content = content.replace(anchor, anchor + '\n' + block);
    fs.writeFileSync(file, content);
    console.log('Successfully moved Delivery logic after currentUserStoreId!');
  } else {
    console.log('Could not find anchor to insert!');
  }
} else {
  console.log('Could not find block to extract!');
}
