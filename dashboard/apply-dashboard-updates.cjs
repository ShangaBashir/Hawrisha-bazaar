const fs = require('fs');
const file = 'c:/Users/shang/Desktop/GorawiXana/hawrisha-dashboard/src/components/AdminDashboard.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add Search import
if (!content.includes('Search,')) {
  content = content.replace('XCircle,', 'XCircle,\n  Search,');
}

// 2. Add state
const stateStr = 'const [activeTab, setActiveTab] = useState("inventory");';
const newStateStr = `const [activeTab, setActiveTab] = useState("inventory");
  const [searchQuery, setSearchQuery] = useState("");
  const [deliveryCities, setDeliveryCities] = useState([]);
  const [deliveryForm, setDeliveryForm] = useState({ nameEn: "", nameKu: "", nameAr: "", price: 0 });
  const [deliveryStoreId, setDeliveryStoreId] = useState(""); // For Admin to select store

  // Fetch store delivery prices when Delivery tab is active
  useEffect(() => {
    let targetStoreId = currentUserRole === "admin" ? deliveryStoreId : currentUserStoreId;
    if (activeTab === "delivery" && targetStoreId) {
      fetch(\`/api/stores/\${targetStoreId}/delivery\`)
        .then(res => res.json())
        .then(data => {
          if(data.success) {
            setDeliveryCities(data.delivery_prices || []);
          }
        })
        .catch(err => console.error("Error fetching delivery prices:", err));
    }
  }, [activeTab, currentUserStoreId, currentUserRole, deliveryStoreId]);

  const handleSaveDeliveryCity = async () => {
    let targetStoreId = currentUserRole === "admin" ? deliveryStoreId : currentUserStoreId;
    if (!targetStoreId) return alert("No store selected");
    if (!deliveryForm.nameEn.trim() || !deliveryForm.nameKu.trim() || !deliveryForm.nameAr.trim()) {
      return alert("Please fill all city names");
    }
    if (Number(deliveryForm.price) < 0) {
      return alert("Price cannot be negative");
    }

    const cityObjStr = JSON.stringify({ en: deliveryForm.nameEn, ku: deliveryForm.nameKu, ar: deliveryForm.nameAr });
    
    if (deliveryCities.some(c => c.city_name.includes(deliveryForm.nameEn))) {
      return alert("City already exists");
    }

    const newPrices = [...deliveryCities, { city_name: cityObjStr, price: Number(deliveryForm.price), is_available: true }];
    
    try {
      const res = await fetch(\`/api/stores/\${targetStoreId}/delivery\`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: currentUserEmail, prices: newPrices })
      });
      const data = await res.json();
      if (data.success) {
        setDeliveryCities(newPrices);
        setDeliveryForm({ nameEn: "", nameKu: "", nameAr: "", price: 0 });
        alert("City added successfully!");
      } else {
        alert(data.message || "Failed to add city");
      }
    } catch (err) {
      console.error(err);
      alert("Error adding city");
    }
  };

  const handleDeleteDeliveryCity = async (index) => {
    if (!confirm("Are you sure you want to delete this city?")) return;
    let targetStoreId = currentUserRole === "admin" ? deliveryStoreId : currentUserStoreId;
    
    const newPrices = deliveryCities.filter((_, i) => i !== index);
    
    try {
      const res = await fetch(\`/api/stores/\${targetStoreId}/delivery\`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: currentUserEmail, prices: newPrices })
      });
      const data = await res.json();
      if (data.success) {
        setDeliveryCities(newPrices);
      }
    } catch (err) {
      console.error(err);
    }
  };
`;
if (content.includes(stateStr) && !content.includes('const [searchQuery')) {
  content = content.replace(stateStr, newStateStr);
}

// 3. Filtering Logic
const oldFilteredProducts = 'const filteredProducts = storeFilter ? products.filter(p => p.store_id === storeFilter) : products;';
const newFilteredProducts = `const baseFilteredProducts = storeFilter ? products.filter(p => p.store_id === storeFilter) : products;
  const filteredProducts = searchQuery ? baseFilteredProducts.filter(p => 
    (typeof p.name === 'string' ? p.name : JSON.stringify(p.name)).toLowerCase().includes(searchQuery.toLowerCase()) || 
    (p.category || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    String(p.id).includes(searchQuery)
  ) : baseFilteredProducts;`;
if(content.includes(oldFilteredProducts)) {
  content = content.replace(oldFilteredProducts, newFilteredProducts);
}

const oldPaginatedStores = `const storesTotalPages = Math.ceil(stores.length / itemsPerPage) || 1;
  const safestoresPage = Math.min(storesPage, storesTotalPages);
  const paginatedStores = stores.slice(`;
const newPaginatedStores = `const filteredStores = searchQuery ? stores.filter(s => 
    (s.name || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
    (s.owner_name || "").toLowerCase().includes(searchQuery.toLowerCase())
  ) : stores;
  const storesTotalPages = Math.ceil(filteredStores.length / itemsPerPage) || 1;
  const safestoresPage = Math.min(storesPage, storesTotalPages);
  const paginatedStores = filteredStores.slice(`;
if(content.includes(oldPaginatedStores)) {
  content = content.replace(oldPaginatedStores, newPaginatedStores);
}

const oldDisplayedOrders = `const displayedOrders = ((currentUserRole === "vendor" || currentUserRole === "admin")
    ? (vendorOrderTab === "All" ? [...orders] : orders.filter(o => o.status === vendorOrderTab))
    : [...orders]).sort((a, b) => {
      if (a.payment_status === 'Unpaid' && b.payment_status === 'Paid') return -1;
      if (a.payment_status === 'Paid' && b.payment_status === 'Unpaid') return 1;
      return 0;
    });`;
const newDisplayedOrders = `const baseDisplayedOrders = ((currentUserRole === "vendor" || currentUserRole === "admin")
    ? (vendorOrderTab === "All" ? [...orders] : orders.filter(o => o.status === vendorOrderTab))
    : [...orders]).sort((a, b) => {
      if (a.payment_status === 'Unpaid' && b.payment_status === 'Paid') return -1;
      if (a.payment_status === 'Paid' && b.payment_status === 'Unpaid') return 1;
      return 0;
    });
  const displayedOrders = searchQuery ? baseDisplayedOrders.filter(o => 
    (o.order_number || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
    (o.full_name || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
    (o.phone || "").toLowerCase().includes(searchQuery.toLowerCase())
  ) : baseDisplayedOrders;`;
if(content.includes(oldDisplayedOrders)) {
  content = content.replace(oldDisplayedOrders, newDisplayedOrders);
}

// 4. Header Search UI
const oldHeaderRight = `            <span className="bg-[#B2AC88] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              {products.length} items
            </span>
          </div>
        </header>`;
const newHeaderRight = `            <span className="bg-[#B2AC88] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              {products.length} items
            </span>
          </div>
          <div className="ml-4 flex-1 max-w-md hidden md:flex relative">
            <input
              type="text"
              placeholder="Search dashboard..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100 border border-slate-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#B2AC88] pr-10 text-slate-700 placeholder-slate-400 shadow-sm"
            />
            {searchQuery ? (
              <button 
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            ) : (
              <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            )}
          </div>
        </header>`;
if(content.includes(oldHeaderRight)) {
  content = content.replace(oldHeaderRight, newHeaderRight);
}

// 5. Sidebar Delivery Tab
const orderTabRegex = /<button\s+onClick=\{\(\) => handleSidebarTabClick\("orders"\)\}[\s\S]*?<span>Orders<\/span>\s*<\/div>\s*<\/button>/g;
content = content.replace(orderTabRegex, (match) => {
  return match + `
                <button
                  onClick={() => handleSidebarTabClick("delivery")}
                  className={\`w-full flex items-center justify-between px-3.5 py-2.5 font-bold text-xs uppercase tracking-wider rounded-xl transition-all border text-left cursor-pointer \${
                    activeTab === "delivery"
                      ? "bg-[#B2AC88]/15 text-[#B2AC88] border-[#B2AC88]/25"
                      : "text-[#F5F5DC]/55 border-transparent hover:text-[#F5F5DC]/80"
                  }\`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Truck size={16} />
                    <span>Delivery</span>
                  </div>
                </button>`;
});

// 6. Delivery UI Block
// Let's inject it right before: {activeTab === "settings" && (
const settingsBlockStr = '{activeTab === "settings" && (';
const deliveryUIStr = `
          {activeTab === "delivery" && (
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
                <div>
                  <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#36454F] italic tracking-tight">
                    Delivery Management
                  </h1>
                  <p className="text-xs text-slate-400 mt-1 max-w-lg font-sans">
                    Configure your store's delivery cities and prices.
                  </p>
                </div>
              </div>

              {currentUserRole === "admin" && (
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Select Store to Manage Delivery</label>
                  <select
                    value={deliveryStoreId}
                    onChange={(e) => setDeliveryStoreId(e.target.value)}
                    className="w-full border px-4 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B2AC88]"
                  >
                    <option value="">-- Select Store --</option>
                    {stores.map(store => (
                      <option key={store.id} value={store.id}>{store.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {(currentUserRole === "vendor" || deliveryStoreId) && (
                <>
                  {/* Add City Form */}
                  <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-2xs flex flex-col space-y-4">
                    <h3 className="text-md font-bold text-[#36454F] mb-2 uppercase tracking-wider">
                      Add New Delivery City
                    </h3>
                    
                    <LangTextInput
                      label="City Name"
                      valueEn={deliveryForm.nameEn}
                      valueKu={deliveryForm.nameKu}
                      valueAr={deliveryForm.nameAr}
                      onChangeEn={(val) => setDeliveryForm({ ...deliveryForm, nameEn: val })}
                      onChangeKu={(val) => setDeliveryForm({ ...deliveryForm, nameKu: val })}
                      onChangeAr={(val) => setDeliveryForm({ ...deliveryForm, nameAr: val })}
                      required
                    />

                    <div>
                      <label className="text-sm uppercase font-bold text-slate-600 block mb-1">Delivery Price (IQD) *</label>
                      <input
                        type="number"
                        value={deliveryForm.price}
                        onChange={(e) => setDeliveryForm({ ...deliveryForm, price: e.target.value })}
                        className="w-full md:w-1/3 border px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B2AC88] border-slate-200 text-black font-medium"
                        min="0"
                        step="500"
                      />
                    </div>
                    
                    <button
                      onClick={handleSaveDeliveryCity}
                      className="px-6 py-2.5 bg-[#36454F] hover:bg-[#36454F]/90 text-white font-bold text-xs uppercase tracking-wider rounded-xl w-max transition-colors"
                    >
                      Save City
                    </button>
                  </div>

                  {/* Cities List */}
                  <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-2xs">
                    <h3 className="text-md font-bold text-[#36454F] mb-4 uppercase tracking-wider">
                      Current Delivery Zones
                    </h3>
                    <div className="overflow-x-auto rounded-xl border border-slate-200">
                      <table className="w-full text-left text-sm text-slate-600">
                        <thead className="text-xs uppercase bg-slate-50 text-slate-400 font-bold border-b border-slate-200">
                          <tr>
                            <th className="px-4 py-3">City Name (En)</th>
                            <th className="px-4 py-3">City Name (Ku)</th>
                            <th className="px-4 py-3">City Name (Ar)</th>
                            <th className="px-4 py-3">Price (IQD)</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {deliveryCities.filter(c => !searchQuery || c.city_name.toLowerCase().includes(searchQuery.toLowerCase())).map((city, idx) => {
                            let parsed = { en: "", ku: "", ar: "" };
                            try {
                              parsed = JSON.parse(city.city_name);
                            } catch (e) {
                              parsed.en = city.city_name;
                            }
                            return (
                              <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-4 py-3 font-medium text-slate-800">{parsed.en}</td>
                                <td className="px-4 py-3">{parsed.ku}</td>
                                <td className="px-4 py-3">{parsed.ar}</td>
                                <td className="px-4 py-3 font-medium text-[#B2AC88]">{Number(city.price).toLocaleString()} IQD</td>
                                <td className="px-4 py-3 text-right">
                                  <button
                                    onClick={() => handleDeleteDeliveryCity(idx)}
                                    className="p-2 text-slate-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
                                    title="Delete City"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                          {deliveryCities.length === 0 && (
                            <tr>
                              <td colSpan="5" className="px-4 py-8 text-center text-slate-400">
                                No delivery zones configured for this store.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
`;
if (content.includes(settingsBlockStr) && !content.includes('activeTab === "delivery"')) {
  content = content.replace(settingsBlockStr, deliveryUIStr + '\n' + settingsBlockStr);
}

// 7. Render friendly "No results found" placeholder when search is active and list is empty
// Wait, for simplicity I can inject a "No results found" block at the end of the filteredProducts list.
// However, the `paginatedProducts` array will just be empty and render nothing.
// I can do a quick check and add an empty state for Products.
const productTableBodyStr = '<tbody className="divide-y divide-slate-100">';
const emptyProductsState = `
                          {paginatedProducts.length === 0 && (
                            <tr>
                              <td colSpan="8" className="px-4 py-12 text-center">
                                <div className="flex flex-col items-center justify-center text-slate-400">
                                  <PackageSearch size={48} className="mb-4 opacity-50" />
                                  <p className="text-lg font-bold text-slate-500">No results found</p>
                                  <p className="text-sm mt-1">We couldn't find anything matching "{searchQuery}"</p>
                                </div>
                              </td>
                            </tr>
                          )}
`;
// Let's add PackageSearch to imports.
if(!content.includes('PackageSearch,')) {
  content = content.replace('Search,', 'Search,\n  PackageSearch,');
}
// Inject empty state into the tbody
if (content.includes(productTableBodyStr) && !content.includes('paginatedProducts.length === 0')) {
  content = content.replace(productTableBodyStr, productTableBodyStr + emptyProductsState);
}


fs.writeFileSync(file, content);
console.log('Successfully updated AdminDashboard.jsx with Delivery, Search, and empty states!');
