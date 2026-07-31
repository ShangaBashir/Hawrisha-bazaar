const fs = require('fs');
const file = 'c:/Users/shang/Desktop/GorawiXana/hawrisha-dashboard/src/components/AdminDashboard.jsx';
let content = fs.readFileSync(file, 'utf8');

const extractRegex = /\s*\/\/ Fetch store delivery prices when Delivery tab is active[\s\S]*?(?=\/\/ Fetch products from database)/;
const match = content.match(extractRegex);

if (match) {
  const extractedBlock = match[0];
  content = content.replace(extractedBlock, '\n  ');

  const anchor = 'const [stores, setStores] = useState([]);';
  const newBlockToInsert = `const [stores, setStores] = useState([]);
  const currentUserStoreId = currentUserRole === "vendor" ? stores.find(s => s.email === currentUserEmail)?.id : null;
  ${extractedBlock}`;
  
  if (content.includes(anchor)) {
    content = content.replace(anchor, newBlockToInsert);
    fs.writeFileSync(file, content);
    console.log('Fixed currentUserStoreId scoping issues!');
  } else {
    console.log('Could not find storesAnchor');
  }
} else {
  console.log('Could not match extraction regex');
}
