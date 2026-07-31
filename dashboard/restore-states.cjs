const fs = require('fs');
const file = 'c:/Users/shang/Desktop/GorawiXana/hawrisha-dashboard/src/components/AdminDashboard.jsx';
let content = fs.readFileSync(file, 'utf8');

const badAnchor = `  const [products, setProducts] = useState([]);
    totalSales: 0,`;

const goodCode = `  const [products, setProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewOnly, setIsViewOnly] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const lastTouchedIdRef = useRef(null);

  const [stores, setStores] = useState([]);
  const currentUserStoreId = currentUserRole === "vendor" && products.length > 0 ? products[0].store_id : (currentUserRole === "vendor" ? (stores.find(s => s.email === currentUserEmail)?.id || null) : null);
  
  const [orders, setOrders] = useState([]);
  const [vendorOrderTab, setVendorOrderTab] = useState("Pending");
  const [orderToConfirm, setOrderToConfirm] = useState(null);
  const [paymentToConfirm, setPaymentToConfirm] = useState(null);
  const [adminStats, setAdminStats] = useState({
    totalSales: 0,`;

if(content.includes(badAnchor)) {
  content = content.replace(badAnchor, goodCode);
  fs.writeFileSync(file, content);
  console.log('Restored states successfully!');
} else {
  console.log('Could not find badAnchor!');
}
