import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Store, ShoppingBag, ArrowLeft, Loader2, Heart, Search, MapPin, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.jsx';

// Helper: extract active language from multilingual JSON string or return as-is
const getLocalized = (val, lang) => {
  if (!val) return '';
  const l = lang ? lang.toLowerCase() : 'en';
  const u = l.toUpperCase();
  if (typeof val === 'object') {
    return val[l] || val[u] || val['en'] || val['EN'] || val['ku'] || val['KU'] || val['ar'] || val['AR'] || '';
  }
  let currentVal = val;
  for (let i = 0; i < 3; i++) {
    try {
      if (typeof currentVal !== 'string') break;
      const parsed = JSON.parse(currentVal);
      if (typeof parsed === 'object' && parsed !== null) {
        return parsed[l] || parsed[u] || parsed['en'] || parsed['EN'] || parsed['ku'] || parsed['KU'] || parsed['ar'] || parsed['AR'] || val;
      }
      currentVal = parsed;
    } catch {
      break;
    }
  }
  return currentVal;
};
// Custom inline SVG icons to prevent Lucide build failures
function FacebookIcon({ size = 12, className = '' }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function InstagramIcon({ size = 12, className = '' }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function TwitterIcon({ size = 12, className = '' }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
    </svg>
  );
}

function GlobeIcon({ size = 12, className = '' }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      <path d="M2 12h20" />
    </svg>
  );
}

function StoreProductCard({ product, likedProducts, onToggleWishlist, onAddToCart, onProductClick, isRTL, t, vendorName }) {
  const { language } = useLanguage();
  const mainImg = product.image_url || product.image;
  const parseJsonArray = (val) => {
    if (!val) return [];
    try {
      const parsed = JSON.parse(val);
      return Array.isArray(parsed) ? parsed : [val];
    } catch {
      return [val];
    }
  };

  const imgSrc = mainImg
    ? (mainImg.startsWith('data:') || mainImg.startsWith('/') ? mainImg : `/uploads/${mainImg}`)
    : '/categories/cat1.jpg';
  const isWishlisted = likedProducts.includes(product.id);

  const finalPrice = product.discount > 0 
    ? Math.round(product.price * (1 - product.discount / 100))
    : product.price;

  const badges = parseJsonArray(product.badge);

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ type: 'spring', stiffness: 220, damping: 22 }}
      whileHover={{ y: -5, borderColor: 'rgba(178, 172, 136, 0.5)', backgroundColor: '#ffffff', boxShadow: '0 12px 30px rgba(178,172,136,0.08)' }}
      onClick={() => onProductClick(product)}
      className="group cursor-pointer flex flex-col bg-transparent border border-transparent p-4 rounded-[2rem] transition-all duration-300 relative text-start justify-between min-h-[430px]"
    >
      <div className="flex flex-col flex-grow">
        {/* Product Image and badges */}
        <div className="w-full aspect-square rounded-2xl mb-3 relative overflow-hidden flex items-center justify-center bg-gray-50 border border-gray-100/50">
          {/* Badges */}
          <div className="absolute top-3 left-3 z-10 flex flex-col items-start gap-1">
            {product.stock === 0 && (
              <div className="text-[8px] font-bold uppercase tracking-widest px-2.5 py-1 bg-gray-800 text-white rounded-full shadow-xs">
                Out of Stock
              </div>
            )}
            {product.discount > 0 && (
              <div className="text-[8px] font-bold uppercase tracking-widest px-2.5 py-1 bg-red-500 text-white rounded-full shadow-xs">
                {product.discount}% OFF
              </div>
            )}
            {badges.map((b) => (
              <div 
                key={b}
                className={`text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-xs ${
                  b === 'New' ? 'bg-[#B2AC88] text-white' :
                  b === 'Bestseller' ? 'bg-[#36454F] text-white' : 'bg-[#C08081] text-white'
                }`}
              >
                {b}
              </div>
            ))}
          </div>

          {/* Wishlist Button */}
          <div className="absolute top-3 right-3 z-10">
            <button 
              onClick={(e) => { 
                e.stopPropagation(); 
                onToggleWishlist(product.id);
              }}
              className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md border border-gray-100 transition-all hover:scale-110 cursor-pointer"
            >
              <Heart 
                size={14} 
                className={isWishlisted ? "fill-red-500 text-red-500" : "text-gray-400 hover:text-red-500"} 
              />
            </button>
          </div>

          <img 
            src={imgSrc} 
            alt={getLocalized(product.name, language)} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103" 
          />
        </div>



        {/* Details */}
        <div className="space-y-1 mt-1 mb-3">
          {/* Name */}
          <h3 className="font-semibold text-gray-800 text-sm group-hover:text-[#B2AC88] transition-colors line-clamp-1 leading-snug">
            {getLocalized(product.name, language)}
          </h3>

          {/* Price */}
          <div className="text-base font-extrabold text-[#36454F] mt-1">
            {product.discount > 0 ? (
              <div className="flex items-center space-x-1.5 flex-wrap">
                <span className="line-through text-xs text-gray-300 font-semibold">
                  {product.price.toLocaleString()} IQD
                </span>
                <span>
                  {finalPrice.toLocaleString()} IQD
                </span>
                <span className="text-red-500 text-[10px] font-bold">
                  {product.discount}% OFF
                </span>
              </div>
            ) : (
              <span>{product.price.toLocaleString()} IQD</span>
            )}
          </div>

          {/* Store Name */}
          <p className="text-[11px] font-semibold text-gray-400">
            {getLocalized(vendorName, language)}
          </p>

          {/* Promotion Badge */}
          {(() => {
            const parsePromo = (val) => {
              if (!val) return [];
              if (Array.isArray(val)) return val;
              try { const p = JSON.parse(val); return Array.isArray(p) ? p : [val]; } catch { return [val]; }
            };
            const promos = parsePromo(product.promotion).filter(p => p && p !== 'None' && p !== '');
            if (promos.length === 0) return null;
            return (
              <div className="flex flex-wrap gap-1 mt-1">
                {promos.map((promo, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-[#B2AC88]/10 border border-[#B2AC88]/20 rounded-full text-[9px] font-bold text-[#B2AC88] uppercase tracking-wider">
                    <span className="w-1 h-1 rounded-full bg-[#B2AC88] shrink-0" />
                    {promo}
                  </span>
                ))}
              </div>
            );
          })()}
        </div>
      </div>

      {/* Add To Cart Button */}
      <button 
        onClick={(e) => {
          e.stopPropagation();
          onProductClick(product);
        }}
        className="w-full py-3 bg-[#B2AC88] hover:bg-[#9C9672] text-white text-xs font-bold uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-98"
      >
        <ShoppingBag size={14} />
        <span>{t('product.add_to_cart')}</span>
      </button>
    </motion.div>
  );
}

const Pagination = ({ currentPage, totalItems, itemsPerPage, onPageChange }) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex flex-col items-center space-y-4 pt-8 pb-4">
      <div className="text-[13px] font-medium text-[#64748b]">
        Showing {startItem} to {endItem} of {totalItems} items — Page {currentPage} of {totalPages}
      </div>
      <div className="flex items-center space-x-3">
        <button
          onClick={() => {
            onPageChange(currentPage - 1);
            window.scrollTo(0, 0);
          }}
          disabled={currentPage === 1}
          className="w-8 h-8 rounded-full flex items-center justify-center border border-[#C08081]/30 text-[#C08081] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#C08081]/5 transition-colors shadow-sm"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        
        <div className="flex items-center space-x-2.5 mx-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => {
                onPageChange(page);
                window.scrollTo(0, 0);
              }}
              className={`rounded-full transition-all flex items-center justify-center cursor-pointer ${
                currentPage === page 
                  ? 'w-2.5 h-2.5 bg-[#C08081]'
                  : 'w-2.5 h-2.5 border-[1.5px] border-[#C08081] bg-transparent hover:bg-[#C08081]/20'
              }`}
              aria-label={`Page ${page}`}
            />
          ))}
        </div>

        <button
          onClick={() => {
            onPageChange(currentPage + 1);
            window.scrollTo(0, 0);
          }}
          disabled={currentPage === totalPages}
          className="w-8 h-8 rounded-full flex items-center justify-center border border-[#C08081]/30 text-[#C08081] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#C08081]/5 transition-colors shadow-sm"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
        </button>
      </div>
    </div>
  );
};

export default function Stores({ cart, likedProducts, onAddToCart, onRemoveFromCart, onToggleWishlist, onProductClick, isLoggedIn, onLoginRequired, resetTrigger, initialSearchTerm, initialStoreId }) {
  const { t, language } = useLanguage();
  const parseEn = (val) => getLocalized(val, language);
  const [vendors, setVendors] = useState([]);
  const [isLoadingVendors, setIsLoadingVendors] = useState(true);
  const [selectedStore, setSelectedStore] = useState(null);
  
  const [storeSearchTerm, setStoreSearchTerm] = useState(initialSearchTerm || '');
  const [selectedCity, setSelectedCity] = useState('All');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [storePage, setStorePage] = useState(1);

  // Selected storefront state
  const [storeProducts, setStoreProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [productPage, setProductPage] = useState(1);

  useEffect(() => {
    if (resetTrigger > 0) {
      setSelectedStore(null);
      setStoreProducts([]);
    }
  }, [resetTrigger]);

  useEffect(() => {
    if (initialSearchTerm !== undefined) {
      setStoreSearchTerm(initialSearchTerm || '');
      setSelectedStore(null);
      setStoreProducts([]);
    }
  }, [initialSearchTerm]);

  useEffect(() => {
    setStorePage(1);
  }, [storeSearchTerm, selectedCity]);

  // Scroll to top when selectedStore changes
  useEffect(() => {
    setProductPage(1);
    window.scrollTo(0, 0);
  }, [selectedStore]);

  const isRTL = language === 'ar' || language === 'ku';

  useEffect(() => {
    fetch('/api/stores')
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to fetch stores.');
        return data;
      })
      .then((data) => {
        if (data.success && data.vendors) {
          const sorted = [...data.vendors].sort((a, b) => Number(b.id) - Number(a.id));
          setVendors(sorted);
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
    
    // Extract English name for the URL slug
    let enName = vendor.name;
    try {
      const parsed = JSON.parse(vendor.name);
      enName = parsed.en || parsed.ku || parsed.ar || vendor.name;
    } catch (e) {}
    const slug = enName.toLowerCase().replace(/\s+/g, '-');
    window.history.pushState(null, '', `/store/${encodeURIComponent(slug)}`);
    
    fetch(`/api/products/vendor?email=${encodeURIComponent(vendor.email)}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to load products.');
        return data;
      })
      .then((data) => {
        const sorted = [...data].sort((a, b) => Number(b.id) - Number(a.id));
        setStoreProducts(sorted);
        setIsLoadingProducts(false);
      })
      .catch((err) => {
        console.error(err);
        setIsLoadingProducts(false);
      });
  };

  // Auto-select store by ID (from admin dashboard eye icon)
  useEffect(() => {
    if (initialStoreId && vendors.length > 0) {
      const found = vendors.find(v => String(v.id) === String(initialStoreId));
      if (found) handleVisitStore(found);
    }
  }, [initialStoreId, vendors]);

  // URL parsing on mount/vendors load
  useEffect(() => {
    if (vendors.length > 0) {
      const path = window.location.pathname;
      if (path.startsWith('/store/')) {
        const slug = decodeURIComponent(path.substring(7)).toLowerCase();
        const found = vendors.find(v => {
          // Extract English name from JSON or use raw
          let enName = v.name;
          try {
            const parsed = JSON.parse(v.name);
            enName = parsed.en || parsed.ku || parsed.ar || v.name;
          } catch (e) {}
          const vSlug = enName.toLowerCase().replace(/\s+/g, '-');
          const vClean = enName.toLowerCase().replace(/ store$/, '').trim();
          const vCleanSlug = vClean.replace(/\s+/g, '-');
          const searchClean = slug.replace(/-store$/, '').replace(/ store$/, '').trim();
          const searchCleanSlug = searchClean.replace(/\s+/g, '-');
          
          return vSlug === slug || 
                 enName.toLowerCase() === slug || 
                 vCleanSlug === slug ||
                 vCleanSlug === searchCleanSlug ||
                 vSlug === searchCleanSlug;
        });
        if (found) {
          handleVisitStore(found);
        }
      }
    }
  }, [vendors]);

  const handleBackToStores = () => {
    setSelectedStore(null);
    setStoreProducts([]);
    window.history.pushState(null, '', '/stores');
  };

  // Hardcoded specific cities requested by the user
  const cities = ['All', 'Erbil', 'Sulaymaniyah', 'Baghdad', 'Basra'];

  // Real-time filter vendors with robust variations matching
  const filteredVendors = useMemo(() => {
    return vendors.filter((vendor) => {
      let nameEn = '', nameKu = '', nameAr = '', rawName = vendor.name || '';
      try {
        const parsed = JSON.parse(vendor.name);
        nameEn = parsed.en || '';
        nameKu = parsed.ku || '';
        nameAr = parsed.ar || '';
      } catch (e) {
        nameEn = vendor.name || '';
      }

      let cityEn = '', cityKu = '', cityAr = '', rawCity = vendor.city || '';
      try {
        const parsed = JSON.parse(vendor.city);
        cityEn = parsed.en || '';
        cityKu = parsed.ku || '';
        cityAr = parsed.ar || '';
      } catch (e) {
        cityEn = vendor.city || '';
      }

      const city = parseEn(vendor.city) || '';
      const term = storeSearchTerm.toLowerCase().trim();
      const matchesSearch = 
        nameEn.toLowerCase().includes(term) ||
        nameKu.toLowerCase().includes(term) ||
        nameAr.toLowerCase().includes(term) ||
        rawName.toLowerCase().includes(term) ||
        cityEn.toLowerCase().includes(term) ||
        cityKu.toLowerCase().includes(term) ||
        cityAr.toLowerCase().includes(term) ||
        rawCity.toLowerCase().includes(term);

      let matchesCity = selectedCity === 'All';
      if (!matchesCity) {
        const normCity = city.toLowerCase().replace(/\s+/g, '');
        const normSelected = selectedCity.toLowerCase().replace(/\s+/g, '');
        
        if (normSelected === 'sulaymaniyah') {
          matchesCity = normCity.includes('sulay') || normCity.includes('sulam') || normCity.includes('slimani');
        } else if (normSelected === 'erbil') {
          matchesCity = normCity.includes('erbil') || normCity.includes('hawler') || normCity.includes('arbil');
        } else {
          matchesCity = normCity.includes(normSelected) || normSelected.includes(normCity);
        }
      }

      return matchesSearch && matchesCity;
    });
  }, [vendors, storeSearchTerm, selectedCity]);

  // Framer Motion staggered animation configurations
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { 
      opacity: 1, 
      y: 0, 
      transition: { type: 'spring', stiffness: 300, damping: 24 } 
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
            className="space-y-8"
          >
            {/* Title Header */}
            <div className="border-b border-gray-200/60 pb-6 text-start">
              <h1 className="text-3xl sm:text-4xl font-black text-[#36454F] uppercase tracking-wider">
                {t('stores_page.title')}
              </h1>
              <p className="text-xs sm:text-sm text-[#B2AC88] font-semibold mt-1 uppercase tracking-wider">
                {language === 'ar' ? 'اكتشف الجوارب المميزة من مختلف التجار المعتمدين' : language === 'ku' ? 'بەرهەمە نایابەکان لە فرۆشیارانی متمانەپێکراو بدۆزەرەوە' : 'Discover unique character socks from our verified partners'}
              </p>
            </div>

            {/* Search Input directly styled without outer container background */}
            <div className="flex justify-start">
              <motion.div 
                animate={{ 
                  maxWidth: isSearchFocused ? '440px' : '320px',
                  scale: isSearchFocused ? 1.02 : 1,
                  borderColor: isSearchFocused ? '#B2AC88' : '#e5e7eb',
                  boxShadow: isSearchFocused ? '0 10px 25px -5px rgba(178, 172, 136, 0.12)' : 'none'
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 26 }}
                className="relative w-full border rounded-full bg-white flex items-center"
              >
                <Search size={16} className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${isSearchFocused ? 'text-[#B2AC88]' : 'text-gray-400'}`} />
                <input
                  type="text"
                  placeholder={language === 'ar' ? 'ابحث عن متجر...' : language === 'ku' ? 'گەڕان بۆ فرۆشگا...' : 'Search stores...'}
                  value={storeSearchTerm}
                  onChange={(e) => setStoreSearchTerm(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  className="w-full pl-11 pr-11 py-2.5 bg-transparent border-none text-xs font-medium focus:outline-none focus:ring-0"
                />
                {storeSearchTerm && (
                  <button 
                    type="button"
                    onPointerDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setStoreSearchTerm('');
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors cursor-pointer flex items-center justify-center z-10"
                  >
                    <X size={15} />
                  </button>
                )}
              </motion.div>
            </div>

            {/* List grid with entrance stagger animation */}
            {filteredVendors.length === 0 ? (
              <div className="min-h-[300px] flex flex-col items-center justify-center text-center space-y-4 py-12 bg-white rounded-[2rem] border border-gray-100 shadow-2xs">
                <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100">
                  <Store className="text-gray-300" size={24} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#36454F] uppercase tracking-wider">
                    {language === 'ar' ? 'لا توجد متاجر تطابق البحث' : language === 'ku' ? 'هیچ فرۆشگایەک نەدۆزرایەوە' : 'No matching stores found'}
                  </h4>
                  <button
                    type="button"
                    onClick={() => { setStoreSearchTerm(''); setSelectedCity('All'); }}
                    className="mt-3 text-xs font-extrabold uppercase tracking-widest text-[#B2AC88] hover:text-[#9C9672] transition-colors cursor-pointer"
                  >
                    Reset Filters
                  </button>
                </div>
              </div>
            ) : (
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="space-y-8"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {(() => {
                  const storesPerPage = 15;
                  const indexOfLastStore = storePage * storesPerPage;
                  const indexOfFirstStore = indexOfLastStore - storesPerPage;
                  const currentStores = filteredVendors.slice(indexOfFirstStore, indexOfLastStore);
                  
                  return currentStores.map((vendor) => {
                    const cardBanner = vendor.banner 
                      ? (vendor.banner.startsWith('/') ? vendor.banner : `/uploads/${vendor.banner}`)
                      : null;

                  return (
                    <motion.div
                      key={vendor.id}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-40px" }}
                      transition={{ type: 'spring', stiffness: 180, damping: 20 }}
                      whileHover={{ y: -8, scale: 1.03, boxShadow: '0 25px 50px -12px rgba(178,172,136,0.12)' }}
                      className="bg-white rounded-3xl border border-gray-100 shadow-xs flex flex-col justify-between min-h-[280px] transition-all duration-300 relative overflow-hidden text-start"
                    >
                      <div>
                        {/* Miniature Banner Slice - Fully Covered Cover Image */}
                        <div className="h-24 w-full relative overflow-hidden bg-gray-100 border-b border-gray-100/50">
                          {cardBanner ? (
                            <img 
                              src={cardBanner} 
                              alt="" 
                              className="absolute inset-0 w-full h-full object-cover object-center brightness-95 select-none pointer-events-none" 
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-r from-[#B2AC88]/20 to-[#36454F]/20" />
                          )}
                          <div className="absolute inset-0 bg-black/10 z-3" />
                        </div>

                        {/* Overlapping Logo */}
                        <div className="flex justify-center -mt-10 relative z-10">
                          {vendor.logo ? (
                            <img 
                              src={vendor.logo.startsWith('/') ? vendor.logo : `/uploads/${vendor.logo}`} 
                              alt={vendor.name} 
                              className="w-20 h-20 rounded-2xl object-cover border-4 border-white shadow-md bg-white shrink-0"
                            />
                          ) : (
                            <div className="w-20 h-20 rounded-2xl bg-white text-[#B2AC88] flex items-center justify-center border-4 border-white shadow-md shrink-0">
                              <Store size={32} />
                            </div>
                          )}
                        </div>

                        {/* Store text info */}
                        <div className="px-6 pt-3 text-center flex flex-col items-center">
                          <h3 className="text-lg font-black text-[#36454F] uppercase tracking-wide">
                            {parseEn(vendor.name)}
                          </h3>

                          {/* City Location Badge */}
                          {vendor.city && (
                            <div className="inline-flex items-center gap-1 text-[10px] font-bold text-gray-500 bg-gray-50 border border-gray-100 px-3 py-1 rounded-full mt-2">
                              <MapPin size={10} className="text-[#B2AC88]" />
                              <span>{parseEn(vendor.city)}</span>
                            </div>
                          )}

                          <p className="text-xs font-bold text-[#B2AC88] mt-3.5 px-2 flex items-center justify-center gap-1.5">
                            <ShoppingBag size={12} />
                            {vendor.productCount || 0} {vendor.productCount === 1 ? 'Product' : 'Products'}
                          </p>
                        </div>
                      </div>

                      {/* Store CTA without number of products */}
                      <div className="p-6 pt-0 text-center">
                        <button
                          onClick={() => handleVisitStore(vendor)}
                          className="w-full py-3 bg-[#36454F] hover:bg-[#B2AC88] text-white text-xs font-bold uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs hover:shadow-md active:scale-98"
                        >
                          <Store size={14} />
                          {t('stores_page.visit_store')}
                        </button>
                      </div>
                    </motion.div>
                  );
                })})()}
                </div>
                
                <Pagination 
                  currentPage={storePage}
                  totalItems={filteredVendors.length}
                  itemsPerPage={15}
                  onPageChange={setStorePage}
                />
              </motion.div>
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
            className="space-y-6"
          >
            {/* Smaller, Repositioned Back button above banner */}
            <div className="flex items-center justify-between">
              <button
                onClick={handleBackToStores}
                className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-gray-500 hover:text-[#B2AC88] transition-colors cursor-pointer border border-gray-200/80 px-3 py-1.5 rounded-full bg-white shadow-2xs hover:shadow-xs"
              >
                <ArrowLeft size={12} className={isRTL ? 'rotate-180' : ''} />
                {t('stores_page.back_stores')}
              </button>
            </div>

            {/* Storefront Banner with Cover Banner filling entire container (Bigger Rectangle) */}
            <div className="w-full h-64 sm:h-80 lg:h-96 rounded-3xl overflow-hidden relative border border-gray-100 bg-gray-50 mb-8 flex items-center justify-center">
              {/* Banner image as cover, showing it fully contained */}
              <img 
                src={selectedStore.banner ? (selectedStore.banner.startsWith('/') ? selectedStore.banner : `/uploads/${selectedStore.banner}`) : '/categories/cat2.jpg'} 
                alt={selectedStore.name} 
                className="w-full h-full object-contain brightness-90 relative block select-none pointer-events-none z-2"
              />
              <div className="absolute inset-0 bg-black/25 z-1" />

              {/* City Tag floating in the Right Corner */}
              {selectedStore.city && (
                <div className="absolute top-6 right-6 z-10 flex items-center gap-1.5 text-white text-xs font-bold uppercase tracking-wider drop-shadow-md bg-black/20 backdrop-blur-xs px-3.5 py-1.5 rounded-full border border-white/20">
                  <MapPin size={12} className="text-white" />
                  <span>{parseEn(selectedStore.city)}</span>
                </div>
              )}

              <div className="absolute bottom-6 start-6 flex items-center gap-4 text-white text-start z-10">
                {selectedStore.logo ? (
                  <img 
                    src={selectedStore.logo.startsWith('/') ? selectedStore.logo : `/uploads/${selectedStore.logo}`} 
                    alt={selectedStore.name} 
                    className="w-20 h-20 sm:w-28 sm:h-28 rounded-3xl object-cover border-4 border-white shadow-lg bg-white shrink-0"
                  />
                ) : (
                  <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-3xl bg-white text-[#B2AC88] flex items-center justify-center border-4 border-white shadow-lg shrink-0">
                    <Store size={44} />
                  </div>
                )}
                <div>
                  <h1 className="text-xl sm:text-3xl font-black uppercase tracking-wider drop-shadow-md">
                  {parseEn(selectedStore.name)}
                  </h1>

                  <p className="text-xs text-white/95 font-medium max-w-xl line-clamp-2 drop-shadow-xs mt-1.5">
                    {parseEn(selectedStore.description) || 'Welcome to our verified partner store!'}
                  </p>

                  {/* Products Count placed under description with white icon */}
                  <div className="flex items-center gap-1.5 text-white/90 text-xs font-bold uppercase tracking-wider drop-shadow-xs mt-2.5">
                    <ShoppingBag size={12} className="text-white" />
                    <span>{storeProducts.length} {storeProducts.length === 1 ? 'Product' : 'Products'}</span>
                  </div>

                  {/* Social media links */}
                  {(() => {
                    const parseSocialLinks = (val) => {
                      if (!val) return {};
                      try {
                        return JSON.parse(val);
                      } catch {
                        return {};
                      }
                    };
                    const links = parseSocialLinks(selectedStore.social_links);
                    const hasLinks = Object.keys(links).some(k => links[k]);
                    if (!hasLinks) return null;
                    return (
                      <div className="flex items-center gap-3 mt-3">
                        {Object.entries(links).map(([platform, url]) => {
                          if (!url) return null;
                          const finalUrl = url.startsWith('http') ? url : `https://${url}`;
                          return (
                            <a
                              key={platform}
                              href={finalUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all hover:scale-110 flex items-center justify-center"
                              title={platform}
                            >
                              {platform === 'facebook' && <FacebookIcon size={12} />}
                              {platform === 'instagram' && <InstagramIcon size={12} />}
                              {platform === 'twitter' && <TwitterIcon size={12} />}
                              {platform === 'website' && <GlobeIcon size={12} />}
                            </a>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              </div>
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
              <div className="space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {(() => {
                    const productsPerPage = 16;
                    const indexOfLastProduct = productPage * productsPerPage;
                    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
                    const currentProducts = storeProducts.slice(indexOfFirstProduct, indexOfLastProduct);

                    return currentProducts.map((product) => (
                      <StoreProductCard
                        key={product.id}
                        product={product}
                        likedProducts={likedProducts}
                        onToggleWishlist={onToggleWishlist}
                        onAddToCart={onAddToCart}
                        onProductClick={onProductClick}
                        isRTL={isRTL}
                        t={t}
                        vendorName={selectedStore.name}
                      />
                    ));
                  })()}
                </div>

                <Pagination 
                  currentPage={productPage}
                  totalItems={storeProducts.length}
                  itemsPerPage={16}
                  onPageChange={setProductPage}
                />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

