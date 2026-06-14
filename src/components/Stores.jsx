import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Store, ShoppingBag, ArrowLeft, Loader2, Heart } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function Stores({ cart, likedProducts, onAddToCart, onRemoveFromCart, onToggleWishlist, onProductClick, isLoggedIn, onLoginRequired }) {
  const { t, language } = useLanguage();
  const [vendors, setVendors] = useState([]);
  const [isLoadingVendors, setIsLoadingVendors] = useState(true);
  const [selectedStore, setSelectedStore] = useState(null);
  
  // Selected storefront state
  const [storeProducts, setStoreProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  const isRTL = language === 'ar' || language === 'ku';

  useEffect(() => {
    fetch('/api/auth/vendors')
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to fetch stores.');
        return data;
      })
      .then((data) => {
        if (data.success && data.vendors) {
          setVendors(data.vendors);
        }
        setIsLoadingVendors(false);
      })
      .catch((err) => {
        console.error(err);
        setIsLoadingVendors(false);
      });
  }, []);

  const handleVisitStore = (vendor) => {
    setSelectedStore(vendor);
    setIsLoadingProducts(true);
    
    fetch(`/api/products/vendor?email=${encodeURIComponent(vendor.email)}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to load products.');
        return data;
      })
      .then((data) => {
        setStoreProducts(data);
        setIsLoadingProducts(false);
      })
      .catch((err) => {
        console.error(err);
        setIsLoadingProducts(false);
      });
  };

  const handleBackToStores = () => {
    setSelectedStore(null);
    setStoreProducts([]);
  };

  const parseJsonArray = (val) => {
    if (!val) return [];
    try {
      const parsed = JSON.parse(val);
      return Array.isArray(parsed) ? parsed : [val];
    } catch {
      return [val];
    }
  };

  if (isLoadingVendors) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 text-[#B2AC88] animate-spin" />
        <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest animate-pulse">
          {language === 'ar' ? 'جاري تحميل المتاجر...' : language === 'ku' ? 'بارکردنی فرۆشگاکان...' : 'Loading Stores...'}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 font-sans text-brand-charcoal" dir={isRTL ? 'rtl' : 'ltr'}>
      <AnimatePresence mode="wait">
        {!selectedStore ? (
          // 1. Directory of Stores
          <motion.div
            key="directory"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="space-y-10"
          >
            {/* Title Header */}
            <div className="border-b border-gray-200/60 pb-6">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#36454F] uppercase tracking-wider">
                {t('stores_page.title')}
              </h1>
              <p className="text-xs sm:text-sm text-[#B2AC88] font-medium mt-1">
                {language === 'ar' ? 'اكتشف الجوارب المميزة من مختلف التجار المعتمدين' : language === 'ku' ? 'بەرهەمە نایابەکان لە فرۆشیارانی متمانەپێکراو بدۆزەرەوە' : 'Discover unique character socks from our verified partners'}
              </p>
            </div>

            {vendors.length === 0 ? (
              <div className="min-h-[300px] flex flex-col items-center justify-center text-center space-y-4 py-8">
                <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100">
                  <Store className="text-gray-300" size={24} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#36454F] uppercase tracking-wider">
                    {t('stores_page.no_stores')}
                  </h4>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {vendors.map((vendor) => (
                  <motion.div
                    key={vendor.id}
                    whileHover={{ y: -6, boxShadow: '0 12px 30px rgba(0,0,0,0.06)' }}
                    className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs flex flex-col justify-between min-h-[200px] transition-all relative overflow-hidden"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-[#B2AC88]/15 border border-[#B2AC88]/30 flex items-center justify-center text-[#B2AC88]">
                          <Store size={22} />
                        </div>
                        <div>
                          <h3 className="text-base font-extrabold text-[#36454F] uppercase tracking-wide">
                            {vendor.storeName}
                          </h3>
                          <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5 tracking-wider">
                            By {vendor.firstName} {vendor.lastName}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-400 font-semibold">
                        {t('stores_page.products_count', { count: vendor.productCount })}
                      </p>
                    </div>

                    <button
                      onClick={() => handleVisitStore(vendor)}
                      className="w-full mt-6 py-3 bg-[#36454F] hover:bg-[#B2AC88] text-white text-xs font-bold uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer hover:shadow-md active:scale-98"
                    >
                      <Store size={14} />
                      {t('stores_page.visit_store')}
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        ) : (
          // 2. Specific Storefront View
          <motion.div
            key="storefront"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="space-y-8"
          >
            {/* Storefront Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-10 pb-6 border-b border-gray-200/60">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-3xl bg-[#B2AC88]/15 border border-[#B2AC88]/30 flex items-center justify-center text-[#B2AC88]">
                  <Store size={26} />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-[#36454F] uppercase tracking-wider">
                    {selectedStore.storeName}
                  </h1>
                  <p className="text-xs sm:text-sm text-[#B2AC88] font-bold mt-1 uppercase tracking-wider">
                    {t('stores_page.welcome', { name: selectedStore.storeName })}
                  </p>
                </div>
              </div>
              <button
                onClick={handleBackToStores}
                className="flex items-center self-start sm:self-center gap-2 text-xs font-bold uppercase tracking-wider text-[#36454F] hover:text-[#B2AC88] transition-colors cursor-pointer border border-gray-200 px-4 py-2.5 rounded-full bg-white shadow-xs"
              >
                <ArrowLeft size={14} className={isRTL ? 'rotate-180' : ''} />
                {t('stores_page.back_stores')}
              </button>
            </div>

            {/* Store Products List */}
            {isLoadingProducts ? (
              <div className="h-[300px] flex flex-col items-center justify-center space-y-3">
                <Loader2 className="w-7 h-7 text-[#B2AC88] animate-spin" />
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Loading products...</p>
              </div>
            ) : storeProducts.length === 0 ? (
              <div className="h-[300px] flex flex-col items-center justify-center text-center space-y-4 py-8 bg-white rounded-3xl border border-gray-100 shadow-xs">
                <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100">
                  <ShoppingBag className="text-gray-300" size={24} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#36454F] uppercase tracking-wider">
                    {t('stores_page.no_products')}
                  </h4>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {storeProducts.map((product) => {
                  const imgUrl = product.image_url || product.image;
                  const finalImg = !imgUrl
                    ? '/categories/cat1.jpg'
                    : (imgUrl.startsWith('data:') || imgUrl.startsWith('/') ? imgUrl : `/uploads/${imgUrl}`);
                  
                  const isInCart = cart.some(item => item.id === product.id);
                  const isWishlisted = likedProducts.includes(product.id);

                  return (
                    <motion.div
                      key={product.id}
                      whileHover={{ y: -5, boxShadow: '0 16px 40px rgba(0,0,0,0.08)' }}
                      onClick={() => onProductClick(product)}
                      className="group cursor-pointer flex flex-col bg-white border border-gray-100 p-3 rounded-3xl transition-all duration-300 relative overflow-hidden"
                    >
                      {/* Product Corner Badges */}
                      <div className="absolute top-5 left-5 z-10 flex flex-col items-start gap-1">
                        {product.discount > 0 && (
                          <div className="text-[8px] font-bold uppercase tracking-widest px-2.5 py-1 bg-red-500 text-white rounded-full shadow-xs">
                            {product.discount}% OFF
                          </div>
                        )}
                        {parseJsonArray(product.badge).map((b) => (
                          <div 
                            key={b}
                            className={`text-[8px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full shadow-xs ${
                              b === 'New' ? 'bg-[#B2AC88] text-white' :
                              b === 'Bestseller' ? 'bg-[#36454F] text-white' : 'bg-[#C08081] text-white'
                            }`}
                          >
                            {b}
                          </div>
                        ))}
                      </div>

                      {/* Action Buttons */}
                      <div className="absolute top-5 right-5 z-10 flex flex-col space-y-2">
                        <button 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            onToggleWishlist(product.id);
                          }}
                          className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-xs border border-gray-50 transition-all hover:scale-105 cursor-pointer"
                        >
                          <Heart 
                            size={13} 
                            className={isWishlisted ? "fill-red-500 text-red-500" : "text-gray-400 hover:text-red-500"} 
                          />
                        </button>
                      </div>

                      {/* Product Image */}
                      <div className="w-full aspect-[3/4] rounded-2xl mb-4 relative overflow-hidden flex items-center justify-center bg-[#f9fafb] border border-gray-100/50">
                        <img 
                          src={finalImg} 
                          alt={product.name} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103" 
                        />
                      </div>

                      {/* Details */}
                      <div className="space-y-1 text-center pb-2">
                        <h3 className="font-bold text-[#36454F] text-[14px] group-hover:text-[#B2AC88] transition-colors line-clamp-1">
                          {product.name}
                        </h3>
                        <p className="text-xs font-semibold text-gray-400">
                          {product.discount > 0 ? (
                            <span className="flex items-center justify-center space-x-1.5">
                              <span className="line-through text-gray-300">
                                {product.price.toLocaleString()} IQD
                              </span>
                              <span className="text-[#36454F] font-bold">
                                {Math.round(product.price * (1 - product.discount / 100)).toLocaleString()} IQD
                              </span>
                            </span>
                          ) : (
                            <span>{product.price.toLocaleString()} IQD</span>
                          )}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
