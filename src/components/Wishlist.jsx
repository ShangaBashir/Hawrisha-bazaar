import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShoppingBag, ArrowLeft, X } from 'lucide-react';
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

  const isRTL = language === 'ar' || language === 'ku';

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
    onAddToCart(product);
    showToast(t('toasts.added_to_cart') || `Added ${product.name} to your cart!`);
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
    <div className="bg-gradient-to-b from-[#F5F5DC]/40 via-white/50 to-[#F5F5DC]/30 min-h-screen py-10 px-4 lg:px-16 xl:px-24 relative select-none">
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
          className="flex items-center justify-between border-b border-gray-100 pb-5 mb-8"
        >
          <h1 className="text-4xl font-black text-[#36454F] tracking-tight uppercase leading-none">
            {t('wishlist_page.title')}
          </h1>
          <span className="text-xs text-gray-400 font-semibold select-none font-sans">
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
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
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
                    whileHover={{ y: -8, scale: 1.02, transition: { type: 'spring', damping: 15, stiffness: 150 } }}
                    onClick={() => onProductClick(product)}
                    className="group cursor-pointer flex flex-col bg-white border border-gray-100 p-3 rounded-3xl hover:shadow-lg transition-all duration-300 relative overflow-hidden"
                  >
                    <motion.button 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        onToggleWishlist(product.id); 
                      }}
                      whileHover={{ scale: 1.15, rotate: 90, backgroundColor: '#FEF2F2', color: '#EF4444' }}
                      whileTap={{ scale: 0.9 }}
                      className="absolute top-5 end-5 z-10 w-8 h-8 bg-white text-[#C08081] rounded-full flex items-center justify-center shadow-xs border border-gray-50 transition-all cursor-pointer"
                    >
                      <X size={14} />
                    </motion.button>

                    <div className="w-full aspect-[3/4] rounded-2xl mb-4 relative overflow-hidden flex items-center justify-center transition-all bg-[#f9fafb] border border-gray-100/50">
                      {finalImg ? (
                        <img 
                          src={finalImg} 
                          alt={product.name} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103" 
                        />
                      ) : (
                        <span className="text-gray-300 font-serif text-md tracking-widest uppercase rotate-[-25deg] select-none opacity-80 font-bold">
                          {parseJsonArray(product.category).join(', ')}
                        </span>
                      )}
                    </div>

                    <div className="space-y-1 text-center pb-2">
                      <h3 className="font-bold text-[#36454F] text-[15px] group-hover:text-[#B2AC88] transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-xs font-semibold text-gray-400 font-sans">
                        {product.price.toLocaleString()} IQD
                      </p>
                    </div>

                    <motion.button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isInCart) {
                          handleRemoveFromCartClick(product, e);
                        } else {
                          handleAddToCartClick(product, e);
                        }
                      }}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className={`mt-2 py-2.5 px-4 text-white text-[10px] font-bold uppercase tracking-wider rounded-full transition-all duration-300 flex items-center justify-center space-x-1.5 rtl:space-x-reverse select-none cursor-pointer border-0 ${
                        isInCart
                          ? 'bg-[#C08081] hover:bg-[#36454F]'
                          : 'bg-[#36454F] hover:bg-[#C08081]'
                      }`}
                    >
                      <span>{isInCart ? (language === 'ar' ? 'تمت الإضافة للسلة' : language === 'ku' ? 'زیادکرا بۆ سەبەتە' : 'Added to Cart') : t('product.add_to_cart')}</span>
                    </motion.button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}
