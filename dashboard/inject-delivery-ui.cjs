const fs = require('fs');
const file = 'c:/Users/shang/Desktop/GorawiXana/hawrisha-dashboard/src/components/AdminDashboard.jsx';
let content = fs.readFileSync(file, 'utf8');

const settingsBlockRegex = /\{\s*activeTab\s*===\s*["']settings["']\s*&&\s*\(/;

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

if (!content.includes('activeTab === "delivery" && (')) {
  const match = content.match(settingsBlockRegex);
  if (match) {
    content = content.replace(match[0], deliveryUIStr + '\n' + match[0]);
    fs.writeFileSync(file, content);
    console.log('Successfully injected Delivery UI!');
  } else {
    console.log('Could not find settings block regex');
  }
} else {
  console.log('Delivery UI already exists');
}
