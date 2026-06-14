import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, X, Upload, DollarSign, Package, TrendingUp, ShoppingBag, Loader2, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function VendorDashboard({ email, storeName, onBackToHome }) {
  const { t, language } = useLanguage();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const isRTL = language === 'ar' || language === 'ku';

  // Form states
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Animals');
  const [stock, setStock] = useState('50');
  const [discount, setDiscount] = useState('0');
  const [badge, setBadge] = useState('');
  const [desc, setDesc] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedColors, setSelectedColors] = useState([]); // array of color IDs

  const categories = ['Animals', 'Fruits', 'Patterns', 'Cozy Crew'];
  const badges = ['Bestseller', 'New', 'Sale', 'None'];
  
  const colorsList = [
    { id: 'beige', class: 'bg-[#F5F5DC]', name: 'Classic Beige' },
    { id: 'sage', class: 'bg-[#B2AC88]', name: 'Sage Green' },
    { id: 'slate', class: 'bg-[#36454F]', name: 'Charcoal Slate' },
    { id: 'rose', class: 'bg-[#C08081]', name: 'Dusk Rose' },
    { id: 'yellow', class: 'bg-yellow-400', name: 'Lemon Yellow' },
    { id: 'green', class: 'bg-emerald-600', name: 'Avocado Green' },
    { id: 'purple', class: 'bg-purple-400', name: 'Soft Lavender' },
    { id: 'orange', class: 'bg-orange-500', name: 'Citrus Orange' }
  ];

  const fetchProducts = () => {
    setIsLoading(true);
    fetch(`/api/products/vendor?email=${encodeURIComponent(email)}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to load products.');
        return data;
      })
      .then((data) => {
        setProducts(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    if (email) {
      fetchProducts();
    }
  }, [email]);

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setName('');
    setPrice('');
    setCategory('Animals');
    setStock('50');
    setDiscount('0');
    setBadge('');
    setDesc('');
    setImageFile(null);
    setImagePreview(null);
    setSelectedColors([]);
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product) => {
    setEditingProduct(product);
    setName(product.name || '');
    setPrice(product.price ? product.price.toString() : '');
    setCategory(product.category || 'Animals');
    setStock(product.stock ? product.stock.toString() : '0');
    setDiscount(product.discount ? product.discount.toString() : '0');
    setBadge(product.badge || '');
    setDesc(product.description || '');
    setImageFile(null);
    const imgUrl = product.image_url || product.image;
    const finalImg = !imgUrl
      ? null
      : (imgUrl.startsWith('data:') || imgUrl.startsWith('/') ? imgUrl : `/uploads/${imgUrl}`);
    setImagePreview(finalImg);
    
    // Map colors
    if (product.colors) {
      // colors might be color classes, let's map them to IDs
      const mappedColorIds = colorsList
        .filter(c => product.colors.includes(c.class) || product.colors.includes(c.id))
        .map(c => c.id);
      setSelectedColors(mappedColorIds);
    } else {
      setSelectedColors([]);
    }
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleToggleColor = (colorId) => {
    if (selectedColors.includes(colorId)) {
      setSelectedColors(prev => prev.filter(id => id !== colorId));
    } else {
      setSelectedColors(prev => [...prev, colorId]);
    }
  };

  const handleDeleteProduct = (productId) => {
    if (window.confirm(t('vendor_dashboard.delete_confirm'))) {
      fetch(`/api/products/${productId}?vendorEmail=${encodeURIComponent(email)}`, {
        method: 'DELETE'
      })
        .then(async (res) => {
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Failed to delete product.');
          fetchProducts();
        })
        .catch(err => {
          alert(err.message);
        });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return setErrorMsg('Product Name is required.');
    if (!price || Number(price) < 250) return setErrorMsg('Price must be at least 250 IQD.');

    setIsSubmitting(true);
    setErrorMsg('');

    const formData = new FormData();
    formData.append('name', name.trim());
    formData.append('price', price);
    formData.append('category', category);
    formData.append('stock', stock);
    formData.append('discount', discount);
    formData.append('badge', badge && badge !== 'None' ? badge : '');
    formData.append('desc', desc.trim());
    formData.append('vendorEmail', email);

    // Color Swatches
    const colorClasses = selectedColors.map(id => {
      const match = colorsList.find(c => c.id === id);
      return match ? match.class : '';
    }).filter(Boolean);
    const colorNames = selectedColors.map(id => {
      const match = colorsList.find(c => c.id === id);
      return match ? match.name : '';
    }).filter(Boolean);

    formData.append('colors', JSON.stringify(colorClasses));
    formData.append('colorNames', JSON.stringify(colorNames));

    if (imageFile) {
      formData.append('image', imageFile);
    }

    const endpoint = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products';
    const method = editingProduct ? 'PUT' : 'POST';

    fetch(endpoint, {
      method: method,
      body: formData
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to save product.');
        setIsSubmitting(false);
        setIsModalOpen(false);
        fetchProducts();
      })
      .catch((err) => {
        setIsSubmitting(false);
        setErrorMsg(err.message);
      });
  };

  const totalProductsCount = products.length;
  const totalStockSum = products.reduce((sum, p) => sum + (p.stock || 0), 0);
  const mockRevenue = products.reduce((sum, p) => sum + (p.price * 12), 0); // simulated sales

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 font-sans text-brand-charcoal" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-10 pb-6 border-b border-gray-200/60">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#36454F] uppercase tracking-wider">
            {t('vendor_dashboard.title')}
          </h1>
          <p className="text-xs sm:text-sm text-[#B2AC88] font-bold mt-1 uppercase tracking-wider">
            {storeName || 'My Store'} ({email})
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToHome}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#36454F] hover:text-[#B2AC88] transition-colors cursor-pointer border border-gray-200 px-4 py-2.5 rounded-full bg-white shadow-xs"
          >
            <ArrowLeft size={14} className={isRTL ? 'rotate-180' : ''} />
            {t('wishlist_page.back_shop')}
          </button>
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-white bg-[#36454F] hover:bg-[#B2AC88] transition-colors cursor-pointer px-5 py-2.5 rounded-full shadow-md"
          >
            <Plus size={16} />
            {t('vendor_dashboard.add_product')}
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-center gap-5">
          <div className="w-12 h-12 rounded-2xl bg-[#B2AC88]/15 border border-[#B2AC88]/30 flex items-center justify-center text-[#B2AC88]">
            <Package size={22} />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
              {t('vendor_dashboard.total_products')}
            </p>
            <h3 className="text-xl font-extrabold text-[#36454F] mt-0.5">{totalProductsCount}</h3>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-center gap-5">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-500">
            <ShoppingBag size={22} />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
              {language === 'ar' ? 'إجمالي المخزون' : language === 'ku' ? 'کۆی کۆگا' : 'Total Stock'}
            </p>
            <h3 className="text-xl font-extrabold text-[#36454F] mt-0.5">{totalStockSum}</h3>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-center gap-5">
          <div className="w-12 h-12 rounded-2xl bg-green-50 border border-green-100 flex items-center justify-center text-green-500">
            <DollarSign size={22} />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
              {t('vendor_dashboard.revenue')} (Est.)
            </p>
            <h3 className="text-xl font-extrabold text-[#36454F] mt-0.5" dir="ltr">
              {mockRevenue.toLocaleString()} IQD
            </h3>
          </div>
        </div>
      </div>

      {/* Products list card */}
      <div className="bg-white rounded-[32px] p-6 sm:p-8 border border-gray-100 shadow-sm min-h-[400px]">
        <h2 className="text-base font-bold text-[#36454F] uppercase tracking-wide mb-6">
          {t('vendor_dashboard.my_products')}
        </h2>

        {isLoading ? (
          <div className="h-[250px] flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-7 h-7 text-[#B2AC88] animate-spin" />
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="h-[250px] flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100">
              <ShoppingBag className="text-gray-300" size={22} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#36454F] uppercase tracking-wider">
                {t('vendor_dashboard.no_products')}
              </h4>
              <p className="text-[11px] text-gray-400 mt-1 max-w-[240px] leading-relaxed mx-auto">
                Add your premium custom character socks to start selling on Hawrisha.
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-start border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 text-[10px] font-bold uppercase tracking-wider text-start">
                  <th className="pb-3 text-start">{language === 'ar' ? 'المنتج' : language === 'ku' ? 'بەرهەم' : 'Product'}</th>
                  <th className="pb-3 text-start">{language === 'ar' ? 'القسم' : language === 'ku' ? 'پۆل' : 'Category'}</th>
                  <th className="pb-3 text-start">{language === 'ar' ? 'السعر' : language === 'ku' ? 'نرخ' : 'Price'}</th>
                  <th className="pb-3 text-start">{language === 'ar' ? 'المخزون' : language === 'ku' ? 'کۆگا' : 'Stock'}</th>
                  <th className="pb-3 text-start">{language === 'ar' ? 'التخفيض' : language === 'ku' ? 'داشکاندن' : 'Discount'}</th>
                  <th className="pb-3 text-end">{language === 'ar' ? 'الإجراءات' : language === 'ku' ? 'کردارەکان' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {products.map((product) => {
                  const imgUrl = product.image_url || product.image;
                  const finalImg = !imgUrl
                    ? '/categories/cat1.jpg'
                    : (imgUrl.startsWith('data:') || imgUrl.startsWith('/') ? imgUrl : `/uploads/${imgUrl}`);

                  return (
                    <tr key={product.id} className="group hover:bg-gray-50/40 transition-colors">
                      <td className="py-4 text-start">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-12 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 shrink-0 flex items-center justify-center">
                            <img src={finalImg} alt={product.name} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-[#36454F]">{product.name}</p>
                            {product.badge && (
                              <span className="inline-block bg-[#C08081]/10 text-[#C08081] text-[9px] font-extrabold px-1.5 py-0.5 rounded-full uppercase mt-1">
                                {product.badge}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 text-xs font-semibold text-gray-500 text-start">{product.category}</td>
                      <td className="py-4 text-xs font-bold text-[#36454F] text-start" dir="ltr">{product.price.toLocaleString()} IQD</td>
                      <td className="py-4 text-xs font-semibold text-gray-500 text-start">{product.stock || 0}</td>
                      <td className="py-4 text-xs font-semibold text-red-500 text-start">{product.discount || 0}%</td>
                      <td className="py-4 text-end">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleOpenEditModal(product)}
                            className="p-2 border border-gray-100 hover:border-[#B2AC88]/30 hover:bg-[#B2AC88]/5 text-gray-400 hover:text-[#B2AC88] rounded-xl transition-all cursor-pointer"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="p-2 border border-gray-100 hover:border-red-100 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-xl transition-all cursor-pointer"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit modal */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-black z-[250] cursor-pointer"
            />
            <div className="fixed inset-0 flex items-center justify-center p-4 z-[260] pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white rounded-[32px] p-6 sm:p-8 max-w-2xl w-full border border-gray-100 shadow-2xl pointer-events-auto overflow-y-auto max-h-[90vh] font-sans text-brand-charcoal"
              >
                <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
                  <h3 className="text-base font-extrabold uppercase tracking-wider text-[#36454F]">
                    {editingProduct ? t('vendor_dashboard.edit_product') : t('vendor_dashboard.add_product')}
                  </h3>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 hover:text-brand-charcoal cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>

                {errorMsg && (
                  <div className="p-4 bg-red-50 border border-red-150 rounded-2xl text-red-650 text-xs font-semibold mb-6">
                    {errorMsg}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Name */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Product Name</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-semibold focus:outline-none focus:border-[#36454F] focus:bg-white transition-all"
                        required
                      />
                    </div>

                    {/* Price */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Price (IQD)</label>
                      <input
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-semibold focus:outline-none focus:border-[#36454F] focus:bg-white transition-all"
                        required
                      />
                    </div>

                    {/* Category */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Category</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-semibold focus:outline-none focus:border-[#36454F] focus:bg-white transition-all"
                      >
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    {/* Stock */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Stock Quantity</label>
                      <input
                        type="number"
                        value={stock}
                        onChange={(e) => setStock(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-semibold focus:outline-none focus:border-[#36454F] focus:bg-white transition-all"
                      />
                    </div>

                    {/* Badge */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Badge</label>
                      <select
                        value={badge}
                        onChange={(e) => setBadge(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-semibold focus:outline-none focus:border-[#36454F] focus:bg-white transition-all"
                      >
                        {badges.map((b) => (
                          <option key={b} value={b === 'None' ? '' : b}>{b}</option>
                        ))}
                      </select>
                    </div>

                    {/* Discount */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Discount (%)</label>
                      <input
                        type="number"
                        value={discount}
                        onChange={(e) => setDiscount(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-semibold focus:outline-none focus:border-[#36454F] focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Description</label>
                    <textarea
                      value={desc}
                      onChange={(e) => setDesc(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-semibold focus:outline-none focus:border-[#36454F] focus:bg-white transition-all resize-none"
                    />
                  </div>

                  {/* Colors List Swatches */}
                  <div className="space-y-2">
                    <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Color Swatches</label>
                    <div className="flex flex-wrap gap-2.5">
                      {colorsList.map((color) => {
                        const isSelected = selectedColors.includes(color.id);
                        return (
                          <button
                            key={color.id}
                            type="button"
                            onClick={() => handleToggleColor(color.id)}
                            className={`px-3 py-1.5 rounded-full border text-[11px] font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
                              isSelected
                                ? 'border-[#36454F] bg-[#36454F] text-white'
                                : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                            }`}
                          >
                            <span className={`w-3.5 h-3.5 rounded-full ${color.class} border border-black/10`} />
                            {color.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Image Upload */}
                  <div className="space-y-2">
                    <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Product Image</label>
                    <div className="flex items-center gap-5">
                      <div className="w-16 h-20 bg-gray-50 border border-gray-200 rounded-2xl flex items-center justify-center overflow-hidden shrink-0">
                        {imagePreview ? (
                          <img src={imagePreview} className="w-full h-full object-cover" />
                        ) : (
                          <Upload className="text-gray-300" size={20} />
                        )}
                      </div>
                      <label className="px-5 py-3 border border-gray-200 hover:border-[#36454F] rounded-2xl text-xs font-bold uppercase tracking-wider text-gray-500 hover:text-brand-charcoal transition-colors cursor-pointer bg-white">
                        <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                        {language === 'ar' ? 'رفع صورة' : language === 'ku' ? 'وێنە زیاد بکە' : 'Upload File'}
                      </label>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex justify-end gap-3.5 pt-4 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-6 py-3 bg-white border border-gray-200 hover:bg-gray-55 text-[#36454F] text-xs font-bold uppercase tracking-wider rounded-2xl transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-3 bg-[#36454F] hover:bg-[#B2AC88] text-white text-xs font-bold uppercase tracking-wider rounded-2xl transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-75"
                    >
                      {isSubmitting ? (
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                      ) : (
                        language === 'ar' ? 'حفظ المنتج' : language === 'ku' ? 'بەرهەم پاشەکەوت بکە' : 'Save Product'
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
