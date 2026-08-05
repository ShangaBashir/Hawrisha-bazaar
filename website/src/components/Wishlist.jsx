import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShoppingBag, ArrowLeft, X, Check, Plus, Minus } from 'lucide-react';

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

const getColorStyle = (colorClass) => {
  if (!colorClass) return {};
  if (colorClass.startsWith('bg-[#') && colorClass.endsWith(']')) {
    return { backgroundColor: colorClass.slice(4, -1) };
  }
  if (colorClass.startsWith('#')) {
    return { backgroundColor: colorClass };
  }
  return {};
};
import { useLanguage } from '../context/LanguageContext.jsx';

const productsData = [
  { id: 1, name: 'Pet Lovers', price: 6250, category: 'Animals', image: '/categories/cat1.jpg' },
  { id: 2, name: 'Tabby Cat', price: 6250, category: 'Animals', image: '/categories/cat2.jpg' },
  { id: 3, name: 'Kangaroo Crew', price: 5000, category: 'Animals', image: '/categories/cat3.jpg' },
  { id: 4, name: 'Sweet Ribbons', price: 6250, category: 'Patterns', image: '/categories/cat4.jpg' },
  { id: 5, name: 'Abstract Faces', price: 6250, category: 'Patterns', image: '/bestsellers/bs1.jpg' },
  { id: 6, name: 'Cat Patterns', price: 6250, category: 'Animals', image: '/bestsellers/bs2.jpg' }
];

const parseJsonArray = (val) => {
  if (!val) return [];
  try {
    const parsed = JSON.parse(val);
    return Array.isArray(parsed) ? parsed : [val];
  } catch {
    return [val];
  }
};

// Stagger and reveal animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 25, scale: 0.96 },
  show: { 
    opacity: 1, 
    y: 0, 
    scale: 1, 
    transition: { type: 'spring', damping: 20, stiffness: 110 } 
  }
};

export default function Wishlist({ cart = [], wishlist, onAddToCart, onRemoveFromCart, onToggleWishlist, onExplore, onBackToHome, onProductClick, previousView = 'home', isLoggedIn, onLoginRequired }) {
  const { t, language } = useLanguage();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');
  const [itemToRemove, setItemToRemove] = useState(null);

  const isRTL = language === 'ar' || language === 'ku';

  // "Choose Options" Modal state
  const [optionsModalProduct, setOptionsModalProduct] = useState(null);
  const [modalColorIndex, setModalColorIndex] = useState(null);
  const [modalSelectedSize, setModalSelectedSize] = useState(null);
  const [modalSelectedStyle, setModalSelectedStyle] = useState(null);
  const [modalQuantity, setModalQuantity] = useState(1);
  const [modalValidationError, setModalValidationError] = useState('');
  const [modalActiveImage, setModalActiveImage] = useState(null);

  useEffect(() => {
    if (optionsModalProduct) {
      setModalColorIndex(optionsModalProduct.colors && optionsModalProduct.colors.length > 0 ? 0 : null);
      setModalSelectedSize(null);
      setModalSelectedStyle(null);
      setModalQuantity(1);
      setModalValidationError('');
      setModalActiveImage(optionsModalProduct.image || optionsModalProduct.image_url);
      
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [optionsModalProduct]);

  useEffect(() => {
    let active = true;
    fetch('/api/products')
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        if (active) {
          setProducts(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.warn('API offline, falling back to local dataset', err);
        if (active) {
          setProducts(productsData);
          setLoading(false);
        }
      });
    return () => { active = false; };
  }, []);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(''), 2500);
  };

  const handleAddToCartClick = (product, e) => {
    e.stopPropagation();
    if (!isLoggedIn) {
      if (onLoginRequired) onLoginRequired();
      return;
    }
    setOptionsModalProduct(product);
  };

  const handleRemoveFromCartClick = (product, e) => {
    e.stopPropagation();
    if (onRemoveFromCart) {
      onRemoveFromCart(product.id);
      showToast(t('toasts.removed_from_cart') || `Removed ${product.name} from your cart!`);
    }
  };

  const favoriteProducts = products.filter((p) => wishlist.includes(p.id));

  const getBackLabel = () => {
    if (previousView === 'all_products') return language === 'ar' ? 'العودة للمنتجات' : language === 'ku' ? 'گەڕانەوە بۆ بەرهەمەکان' : 'Back to Products';
    if (previousView === 'cart') return language === 'ar' ? 'العودة للسلة' : language === 'ku' ? 'گەڕانەوە بۆ سەبەتە' : 'Back to Your Cart';
    if (previousView === 'story') return language === 'ar' ? 'العودة لقصتنا' : language === 'ku' ? 'گەڕانەوە بۆ چیرۆکەکەمان' : 'Back to Our Story';
    if (previousView === 'contact') return language === 'ar' ? 'العودة للاتصال' : language === 'ku' ? 'گەڕانەوە بۆ پەیوەندی' : 'Back to Contact';
    if (previousView === 'checkout') return language === 'ar' ? 'العودة للدفع' : language === 'ku' ? 'گەڕانەوە بۆ کۆتاییهێنان بە کڕین' : 'Back to Checkout';
    return language === 'ar' ? 'العودة للرئيسية' : language === 'ku' ? 'گەڕانەوە بۆ سەرەکی' : 'Back to Home';
  };

  return (
    <div className="bg-gradient-to-b from-[#F5F5DC]/10 via-white/80 to-[#F5F5DC]/5 min-h-screen py-10 px-4 lg:px-16 xl:px-24 relative select-none">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 350, damping: 22 }}
            className={`fixed bottom-8 ${isRTL ? 'left-8' : 'right-8'} z-50 bg-[#36454F] text-white px-6 py-3.5 rounded-xl shadow-xl flex items-center space-x-3 rtl:space-x-reverse border border-white/10`}
          >
            <div className="w-2.5 h-2.5 rounded-full bg-[#B2AC88] animate-ping" />
            <span className="font-semibold text-sm tracking-wide">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-[1440px] mx-auto text-start">
        <motion.button 
          onClick={onBackToHome}
          whileHover={{ x: isRTL ? 4 : -4 }}
          className="flex items-center space-x-1 text-[10px] font-bold uppercase tracking-widest text-[#B2AC88] hover:text-[#36454F] transition-colors mb-4 cursor-pointer border-0 bg-transparent py-0 px-0"
        >
          <ArrowLeft size={10} className="rtl:rotate-180" />
          <span>{getBackLabel()}</span>
        </motion.button>

        <motion.div 
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", damping: 18, stiffness: 120 }}
          className="flex flex-col items-start border-b border-gray-100 pb-3 mb-5 gap-1 text-start"
        >
          <h1 className="text-3xl md:text-4xl font-black text-[#36454F] tracking-tight uppercase leading-none text-start">
            {t('wishlist_page.title')}
          </h1>
          <span className="text-xs sm:text-sm text-gray-400 font-bold select-none font-sans text-start">
            {favoriteProducts.length} {language === 'ar' ? 'عناصر محفوظة' : language === 'ku' ? 'بەرهەمی پاشەکەوتکراو' : 'saved items'}
          </span>
        </motion.div>

        {loading ? (
          <div className="py-24 text-center">
            <div className="w-8 h-8 border-4 border-[#B2AC88] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm text-gray-500 font-semibold">{language === 'ar' ? 'جاري تحميل المفضلة...' : language === 'ku' ? 'لیستی دڵخوازەکان باردەکرێت...' : 'Loading wishlist...'}</p>
          </div>
        ) : favoriteProducts.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-24 text-center bg-white border border-gray-100 rounded-3xl p-8 max-w-2xl mx-auto shadow-xs"
          >
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center border border-red-100 mb-6">
              <Heart className="text-red-400 fill-red-100" size={26} />
            </div>
            <h3 className="text-lg font-bold text-[#36454F] uppercase tracking-wider">{t('wishlist_page.empty')}</h3>
            <p className="text-xs text-gray-400 mt-2 max-w-sm leading-relaxed">
              {language === 'ar' 
                ? 'استكشف مجموعاتنا، واعثر على الجوارب التي تمثل شخصيتك، واضغط على أيقونة القلب في أي بطاقة لحفظها هنا!' 
                : language === 'ku' 
                ? 'کۆکراوەکانمان بگەڕێ، ئەو گۆرەوییانە بدۆزەرەوە کە کەسایەتیت نیشان دەدەن، و کلیک لەسەر نیشانەی دڵ لەسەر هەر کارتێک بکە بۆ پاشەکەوتکردنیان لێرە!' 
                : 'Explore our collections, find socks that represent your personality, and tap the heart icon on any card to save them here!'}
            </p>
            <button 
              onClick={onExplore}
              className="mt-8 px-8 py-3 bg-[#36454F] hover:bg-[#B2AC88] text-white text-[10px] font-bold uppercase tracking-wider rounded-full transition-colors cursor-pointer shadow-md hover:scale-103 active:scale-97 transition-all duration-300 border-0"
            >
              {language === 'ar' ? 'استكشف المنتجات' : language === 'ku' ? 'بینینی بەرهەمەکان' : 'Explore Products'}
            </button>
          </motion.div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-6 sm:gap-x-5 sm:gap-y-8 w-full"
          >
            <AnimatePresence mode="popLayout">
              {favoriteProducts.map((product) => {
                const imgUrl = product.image || product.image_url;
                const finalImg = !imgUrl
                  ? ''
                  : (imgUrl.startsWith('data:') || imgUrl.startsWith('/') ? imgUrl : `/uploads/${imgUrl}`);

                const isInCart = cart.some((item) => item.id === product.id);

                return (
                  <motion.div
                    key={product.id}
                    layout
                    variants={cardVariants}
                    exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                    whileHover={{ y: -4 }}
                    onClick={() => onProductClick(product)}
                    className="group cursor-pointer flex flex-col bg-transparent border border-transparent hover:border-[#B2AC88] p-0 rounded-2xl transition-all duration-300 relative text-start overflow-hidden"
                  >
                    {/* Delete / Remove from Wishlist button (opens confirmation modal) */}
                    <button 
                      type="button"
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        setItemToRemove(product); 
                      }}
                      className="absolute top-2.5 right-2.5 z-10 w-7 h-7 sm:w-8 sm:h-8 bg-white text-gray-400 hover:text-red-500 rounded-full flex items-center justify-center shadow-md border border-gray-100 transition-all hover:scale-110 cursor-pointer"
                      title={language === 'ar' ? 'إزالة' : language === 'ku' ? 'سڕینەوە' : 'Remove'}
                    >
                      <X size={14} />
                    </button>

                    {/* Image box */}
                    <div className="w-full aspect-square rounded-2xl relative overflow-hidden flex items-center justify-center transition-all bg-[#f9fafb] border border-gray-100/50">
                      {(product.stock === 0 || product.discount > 0) && (
                        <div className="absolute top-2.5 left-2.5 z-10 flex flex-col items-start gap-1">
                          {product.stock === 0 && (
                            <div className="text-[7.5px] sm:text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 bg-gray-800 text-white rounded-lg shadow-xs">
                              {t('ui.out_of_stock')}
                            </div>
                          )}
                          {product.discount > 0 && (
                            <div className="text-[7.5px] sm:text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 bg-red-500 text-white rounded-lg shadow-xs">
                              {product.discount}% OFF
                            </div>
                          )}
                        </div>
                      )}
                      {finalImg ? (
                        <img 
                          src={finalImg} 
                          alt={getLocalized(product.name, language)} onError={(e) => { e.target.onerror = null; e.target.src = '/categories/cat1.jpg'; }} 
                          className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-103 rounded-2xl" 
                        />
                      ) : (
                        <span className="text-gray-300 font-serif text-[10px] sm:text-md tracking-widest uppercase rotate-[-25deg] select-none opacity-80 font-bold">
                          {parseJsonArray(product.category).join(', ')}
                        </span>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex flex-col flex-grow mt-2.5 px-2 pb-2 text-start">
                      <h3 className="font-extrabold text-[#36454F] text-[13px] sm:text-[15px] group-hover:text-[#B2AC88] transition-colors line-clamp-2 text-start leading-snug">
                        {getLocalized(product.name, language)}
                      </h3>
                      <div className="text-[14px] sm:text-[15px] font-extrabold text-[#36454F] text-start flex items-center gap-1.5 flex-wrap mt-1">
                        {product.discount > 0 ? (
                          <>
                            <span className="text-[#36454F] text-[13px] sm:text-[14px]">
                              {Math.round(product.price * (1 - product.discount / 100)).toLocaleString()} IQD
                            </span>
                            <span className="text-[10px] sm:text-[11px] line-through text-gray-400 font-normal">
                              {product.price.toLocaleString()} IQD
                            </span>
                            <span className="text-red-500 text-[9px] sm:text-[10px] font-bold">
                              {product.discount}% OFF
                            </span>
                          </>
                        ) : (
                          <span className="text-[#36454F] text-[13px] sm:text-[14px]">{product.price.toLocaleString()} IQD</span>
                        )}
                      </div>
                      <p className="text-[10px] sm:text-[12px] text-gray-400 font-medium text-start mt-0.5">
                        {getLocalized(product.vendor_name, language) || t('vendor_dashboard.platform_store')}
                      </p>
                      {(() => {
                        const promos = parseJsonArray(product.promotion).filter(p => p && p !== 'None' && p !== '');
                        if (promos.length === 0) return null;
                        return (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {promos.map((promo, idx) => (
                              <span key={idx} className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#B2AC88]/10 border border-[#B2AC88]/20 rounded-full text-[8px] sm:text-[9px] font-bold text-[#B2AC88] uppercase tracking-wider">
                                <span className="w-1 h-1 rounded-full bg-[#B2AC88] shrink-0" />
                                {promo}
                              </span>
                            ))}
                          </div>
                        );
                      })()}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCartClick(product, e);
                        }}
                        className="w-full py-2.5 bg-[#B2AC88] hover:bg-[#36454F] text-white text-[11px] sm:text-xs font-bold uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-98 mt-2.5 border-0"
                      >
                        <ShoppingBag size={13} />
                        <span>{t('product.add_to_cart')}</span>
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Wishlist Item Removal Confirmation Modal */}
      <AnimatePresence>
        {itemToRemove && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setItemToRemove(null)}
              className="fixed inset-0 bg-black/40 backdrop-blur-xs cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              transition={{ type: 'spring', damping: 22, stiffness: 220 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center shadow-2xl border border-gray-100 relative z-10 space-y-4 font-sans"
            >
              <div className="w-14 h-14 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto border border-red-100">
                <Heart className="fill-red-500" size={24} />
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-extrabold text-[#36454F] uppercase tracking-wider">
                  {language === 'ar' ? 'إزالة من المفضلة؟' : language === 'ku' ? 'سڕینەوە لە دڵخوازەکان؟' : 'Remove from Wishlist?'}
                </h3>
                <p className="text-xs text-gray-500 font-medium mt-1.5 leading-relaxed">
                  {language === 'ar'
                    ? `هل أنت تأكد من إزالة "${getLocalized(itemToRemove.name, language)}" من قائمة المفضلة؟`
                    : language === 'ku'
                    ? `دڵنیایت لە سڕینەوەی "${getLocalized(itemToRemove.name, language)}" لە لیستی دڵخوازەکانت؟`
                    : `Are you sure you want to remove "${getLocalized(itemToRemove.name, language)}" from your wishlist?`}
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setItemToRemove(null)}
                  className="flex-1 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs uppercase tracking-wider rounded-full transition-colors cursor-pointer border-0"
                >
                  {language === 'ar' ? 'إلغاء' : language === 'ku' ? 'پەشیمانبوونەوە' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onToggleWishlist(itemToRemove.id);
                    setItemToRemove(null);
                  }}
                  className="flex-1 py-2.5 px-4 bg-red-500 hover:bg-red-600 text-white font-bold text-xs uppercase tracking-wider rounded-full transition-colors cursor-pointer border-0 shadow-sm active:scale-95"
                >
                  {language === 'ar' ? 'إزالة' : language === 'ku' ? 'سڕینەوە' : 'Remove'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Choose Options Modal */}
      <AnimatePresence>
        {optionsModalProduct && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setOptionsModalProduct(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 cursor-pointer"
            />
            
            {/* Modal Container */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                className="bg-white rounded-3xl max-w-3xl w-full text-start shadow-2xl relative flex flex-col md:flex-row max-h-[90vh] overflow-y-auto md:overflow-hidden overflow-x-hidden font-sans text-brand-charcoal border border-gray-100"
              >
                {/* Close Button */}
                <button
                  onClick={() => setOptionsModalProduct(null)}
                  className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white hover:bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors shadow-sm cursor-pointer"
                >
                  <X size={16} />
                </button>

                {/* Left Side: Image Gallery */}
                <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col items-center bg-gray-50 border-r border-gray-100 shrink-0 rounded-t-3xl md:rounded-t-none md:rounded-l-3xl overflow-hidden">
                  <div className="w-full aspect-[3/4] bg-white rounded-2xl relative shadow-sm flex items-center justify-center border border-gray-100 overflow-hidden mb-4">
                    {modalActiveImage ? (
                      <img src={modalActiveImage.startsWith('/') || modalActiveImage.startsWith('data:') ? modalActiveImage : `/uploads/${modalActiveImage}`} 
                        alt={getLocalized(optionsModalProduct.name, language)} 
                        className="w-full h-full object-contain" onError={(e) => { e.target.onerror = null; e.target.src = '/categories/cat1.jpg'; }} />
                    ) : (
                      <span className="text-[#36454F]/20 font-serif text-2xl font-bold uppercase rotate-[-20deg]">
                        {parseJsonArray(optionsModalProduct.category).join(', ')}
                      </span>
                    )}
                  </div>


                </div>

                {/* Right Side: Options Form */}
                <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-between overflow-visible md:overflow-y-auto rounded-b-3xl md:rounded-b-none md:rounded-r-3xl shrink-0">
                  <div className="space-y-5">
                    <div>
                      <span className="text-[10px] font-bold text-[#B2AC88] tracking-widest uppercase mb-1 block">{t('ui.choose_options')}</span>
                      <h3 className="text-xl md:text-2xl font-serif font-bold text-[#36454F] leading-tight mb-1">
                        {getLocalized(optionsModalProduct.name, language)}
                      </h3>
                      {/* Price */}
                      <div className="flex items-center space-x-2.5 mt-2">
                        {optionsModalProduct.discount > 0 ? (
                          <>
                            <span className="text-lg font-bold text-[#36454F]">
                              {Math.round(optionsModalProduct.price * (1 - optionsModalProduct.discount / 100)).toLocaleString()} IQD
                            </span>
                            <span className="text-xs font-semibold line-through text-gray-400">
                              {optionsModalProduct.price.toLocaleString()} IQD
                            </span>
                          </>
                        ) : (
                          <span className="text-lg font-bold text-[#36454F]">
                            {optionsModalProduct.price.toLocaleString()} IQD
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="h-px bg-gray-100" />

                    {/* Size & Color Cross-Filtering Selectors */}
                    {(() => {
                      const sizeColorMap = (() => { try { return JSON.parse(optionsModalProduct.size_colors || '{}'); } catch(e) { return {}; } })();
                      const hasSizeColors = Object.keys(sizeColorMap).length > 0;
                      const sizeOptions = parseJsonArray(optionsModalProduct.size_collection).filter(s => s && s !== 'One Size');
                      const availableColorClasses = modalSelectedSize && sizeColorMap[modalSelectedSize]
                        ? sizeColorMap[modalSelectedSize]
                        : (optionsModalProduct.colors || []);
                      const sizesForSelectedColor = modalColorIndex !== null
                        ? sizeOptions.filter(size => (sizeColorMap[size] || []).includes(optionsModalProduct.colors?.[modalColorIndex]))
                        : sizeOptions;
                      return (
                        <>
                          {/* Size Selector */}
                          {sizeOptions.length > 0 && (
                            <div className="space-y-2">
                              <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider">
                                <span className="text-gray-400">{t('ui.select_size')}</span>
                                {modalSelectedSize && <span className="text-[#36454F] font-semibold">{modalSelectedSize}</span>}
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {sizeOptions.map((size) => {
                                  const selectedColorClass = modalColorIndex !== null ? optionsModalProduct.colors?.[modalColorIndex] : null;
                                  const isAvailable = !selectedColorClass || sizesForSelectedColor.includes(size);
                                  return (
                                    <button
                                      key={size}
                                      type="button"
                                      onClick={() => {
                                        setModalSelectedSize(size);
                                        if (selectedColorClass && sizeColorMap[size] && !sizeColorMap[size].includes(selectedColorClass)) {
                                          setModalColorIndex(null);
                                        }
                                      }}
                                      className={`px-3.5 py-1 rounded-full text-xs font-bold border cursor-pointer transition-all ${
                                        !isAvailable
                                          ? 'opacity-30 cursor-not-allowed border-gray-100 bg-gray-50 text-gray-400'
                                          : modalSelectedSize === size
                                          ? 'bg-[#36454F] text-white border-[#36454F]'
                                          : 'bg-white text-[#36454F] border-gray-200 hover:border-[#36454F]'
                                      }`}
                                      disabled={!isAvailable}
                                    >
                                      {size}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                          {/* Color Selector */}
                          {availableColorClasses.length > 0 && (
                            <div className="space-y-2">
                              <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider">
                                <span className="text-gray-400">{t('ui.select_color')}</span>
                                {modalColorIndex !== null && (
                                  <span className="text-[#36454F] font-semibold">
                                    {optionsModalProduct.colorNames ? optionsModalProduct.colorNames[modalColorIndex] : `${t('ui.option')} ${modalColorIndex + 1}`}
                                  </span>
                                )}
                              </div>
                              <div className="flex flex-wrap gap-2.5">
                                {optionsModalProduct.colors.map((colorClass, idx) => {
                                  const isAvail = availableColorClasses.includes(colorClass);
                                  return (
                                    <button
                                      key={idx}
                                      type="button"
                                      onClick={() => {
                                        if (!isAvail) return;
                                        setModalColorIndex(idx);
                                        if (!modalSelectedSize && hasSizeColors) {
                                          const firstSize = sizeOptions.find(s => (sizeColorMap[s] || []).includes(colorClass));
                                          if (firstSize) setModalSelectedSize(firstSize);
                                        }
                                      }}
                                      style={isAvail ? getColorStyle(colorClass) : {}}
                                      className={`w-7 h-7 rounded-full border cursor-pointer flex items-center justify-center relative transition-transform ${
                                        !isAvail
                                          ? 'opacity-25 cursor-not-allowed bg-gray-200 border-gray-200'
                                          : `hover:scale-110 active:scale-95 ${colorClass.startsWith('#') ? '' : colorClass} ${
                                            modalColorIndex === idx
                                              ? 'ring-2 ring-offset-2 ring-[#B2AC88] border-transparent'
                                              : 'border-gray-200'
                                          }`
                                      }`}
                                      disabled={!isAvail}
                                    >
                                      {modalColorIndex === idx && <Check size={12} className="text-white mix-blend-difference" />}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </>
                      );
                    })()}

                    {/* Quantity Picker */}
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400">{t('ui.quantity')}</label>
                      <div className="flex items-center space-x-3.5 border border-[#E9ECEF] rounded-xl px-4 py-2 w-32 bg-gray-50/20">
                        <button
                          type="button"
                          onClick={() => setModalQuantity(q => Math.max(1, q - 1))}
                          className="text-gray-400 hover:text-[#36454F] active:scale-75 transition-transform cursor-pointer border-0 bg-transparent"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="text-sm font-bold text-[#36454F] select-none min-w-[20px] text-center">
                          {modalQuantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => setModalQuantity(q => q + 1)}
                          className="text-gray-400 hover:text-[#36454F] active:scale-75 transition-transform cursor-pointer border-0 bg-transparent"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Actions / Add Button */}
                  <div className="mt-8 pt-4 border-t border-gray-100">
                    {/* Error display */}
                    {modalValidationError && (
                      <p className="text-xs text-red-500 font-bold mb-3 bg-red-50 border border-red-100 rounded-xl px-4 py-2">
                        {modalValidationError}
                      </p>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        // Validation
                        const styleOptions = parseJsonArray(optionsModalProduct.style_length).filter(Boolean);
                        if (styleOptions.length > 1 && !modalSelectedStyle) {
                          setModalValidationError(t('ui.select_style_first'));
                          return;
                        }
                        const sizeOptions = parseJsonArray(optionsModalProduct.size_collection).filter(s => s && s !== 'One Size');
                        if (sizeOptions.length > 0 && !modalSelectedSize) {
                          setModalValidationError('Please select a Size first.');
                          return;
                        }
                        const sizeColorMap = (() => { try { return JSON.parse(optionsModalProduct.size_colors || '{}'); } catch(e) { return {}; } })();
                        const availColorClasses = modalSelectedSize && sizeColorMap[modalSelectedSize]
                          ? sizeColorMap[modalSelectedSize]
                          : (optionsModalProduct.colors || []);
                        if (availColorClasses.length > 0 && modalColorIndex === null) {
                          setModalValidationError('Please select a Color first.');
                          return;
                        }

                        // Add to cart
                        const finalPrice = optionsModalProduct.discount > 0
                          ? Math.round(optionsModalProduct.price * (1 - optionsModalProduct.discount / 100))
                          : optionsModalProduct.price;

                        onAddToCart({ 
                          ...optionsModalProduct, 
                          price: finalPrice, 
                          selectedStyle: modalSelectedStyle, 
                          selectedSize: modalSelectedSize,
                          selectedColor: optionsModalProduct.colors && modalColorIndex !== null ? optionsModalProduct.colors[modalColorIndex] : null,
                          selectedColorName: optionsModalProduct.colorNames && modalColorIndex !== null ? optionsModalProduct.colorNames[modalColorIndex] : null
                        }, modalQuantity);

                        const colorLabel = optionsModalProduct.colorNames ? optionsModalProduct.colorNames[modalColorIndex] : 'selected color';
                        showToast(`Added ${modalQuantity}x ${getLocalized(optionsModalProduct.name, language)} (${colorLabel}) to cart!`);
                        setOptionsModalProduct(null);
                      }}
                      className="w-full py-4 bg-[#36454F] hover:bg-[#B2AC88] text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-md hover:scale-[1.02] active:scale-[0.98] border-0"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>

              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
