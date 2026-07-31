const fs = require('fs');
const file = 'c:/Users/shang/Desktop/GorawiXana/hawrisha-dashboard/src/components/AdminDashboard.jsx';
let content = fs.readFileSync(file, 'utf8');

const anchor = 'const [products, setProducts] = useState([]);';
const newAnchor = `const [products, setProducts] = useState([]);
  const currentUserStoreId = currentUserRole === "vendor" && products.length > 0 ? products[0].store_id : (currentUserRole === "vendor" ? (stores.find(s => s.email === currentUserEmail)?.id || null) : null);`;

if(content.includes(anchor) && !content.includes('const currentUserStoreId =')) {
  content = content.replace(anchor, newAnchor);
  fs.writeFileSync(file, content);
  console.log('Fixed currentUserStoreId scoping issues!');
} else {
  console.log('Already fixed or anchor missing');
}
