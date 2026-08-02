import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Heart, ShoppingBag, ArrowLeft, X, Plus, Minus, Check, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.jsx';

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

const parseJsonArray = (val) => {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  try {
    const parsed = JSON.parse(val);
    return Array.isArray(parsed) ? parsed : [val];
  } catch {
    return [val];
  }
};

const getProductImage = (imgUrl) => {
  if (!imgUrl) return '';
  if (imgUrl.startsWith('/') || imgUrl.startsWith('data:') || imgUrl.startsWith('http')) {
    return imgUrl;
  }
  return `/uploads/${imgUrl}`;
};

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

const getLocalizedGender = (gender, lang) => {
  if (!gender) return '';
  const g = gender.toLowerCase();
  if (g === 'women') return lang === 'ar' ? 'نساء' : lang === 'ku' ? 'ژن' : 'Women';
  if (g === 'men') return lang === 'ar' ? 'رجال' : lang === 'ku' ? 'پیاو' : 'Men';
  if (g === 'kids') return lang === 'ar' ? 'أطفال' : lang === 'ku' ? 'منداڵ' : 'Kids';
  if (g === 'unisex') return lang === 'ar' ? 'للجنسين' : lang === 'ku' ? 'بۆ هەردوو ڕەگەز' : 'Unisex';
  return gender;
};

const getCleanVendorName = (vendorName, language) => {
  if (!vendorName) return '';
  let name = getLocalized(vendorName, language).trim();
  // Strip language-specific prefixes (legacy cleanup)
  if (name.toLowerCase().endsWith(' store')) {
    name = name.substring(0, name.length - 6).trim();
  }
  return name;
};

const hasOptions = (product) => {
  if (!product) return false;
  const colors = product.colors || [];
  const sizes = parseJsonArray(product.size_collection).filter(s => s && s !== 'One Size');
  const styles = parseJsonArray(product.style_length).filter(Boolean).filter(b => String(b).toLowerCase() !== 'sale');
  return colors.length > 1 || sizes.length > 0 || styles.length > 1;
};

const productsData = [
  {
    id: 1,
    name: 'Pet Lovers',
    price: 6250,
    category: 'Animals',
    colorFamily: 'slate',
    colors: ['bg-[#36454F]', 'bg-[#F5F5DC]', 'bg-[#60A5FA]', 'bg-[#B2AC88]'],
    colorNames: ['Charcoal Slate', 'Classic Beige', 'Soft Sky Blue', 'Sage Green'],
    extraColors: '+15',
    image: '/categories/cat1.jpg',
    extra_images: JSON.stringify(['/categories/cat1.jpg', '/categories/cat2.jpg', '/categories/cat3.jpg', '/categories/cat4.jpg']),
    badge: 'Bestseller',
    desc: 'Express your passion for pets in cozy fashion. Knit with durable premium combed cotton, these socks deliver all-day comfort and a breathable stretch ideal for everyday walks.'
  },
  {
    id: 2,
    name: 'Tabby Cat',
    price: 6250,
    category: 'Animals',
    colorFamily: 'orange',
    colors: ['bg-orange-500', 'bg-[#36454F]', 'bg-[#F5F5DC]', 'bg-[#60A5FA]'],
    colorNames: ['Citrus Orange', 'Charcoal Slate', 'Classic Beige', 'Soft Sky Blue'],
    extraColors: '+15',
    image: '/categories/cat2.jpg',
    extra_images: JSON.stringify(['/categories/cat2.jpg', '/categories/cat1.jpg', '/categories/cat3.jpg']),
    badge: 'New',
    desc: 'Brighten your day with these lovable tabby kitten designs. Perfect for cat enthusiasts, utilizing soft combed cotton for a premium lightweight and sweat-wicking texture.'
  },
  {
    id: 3,
    name: 'Kangaroo Crew',
    price: 5000,
    category: 'Animals',
    colorFamily: 'beige',
    colors: ['bg-[#F5F5DC]', 'bg-[#36454F]', 'bg-[#60A5FA]'],
    colorNames: ['Classic Beige', 'Charcoal Slate', 'Soft Sky Blue'],
    extraColors: '+15',
    image: '/categories/cat3.jpg',
    extra_images: JSON.stringify(['/categories/cat3.jpg', '/categories/cat4.jpg']),
    badge: 'Sale',
    desc: 'Jump into premium comfort with our dynamic Kangaroo socks. Double-looped heel cushion supports high impact steps, keeping your feet padded and comfortable.'
  },
  {
    id: 4,
    name: 'Sweet Ribbons',
    price: 6250,
    category: 'Patterns',
    colorFamily: 'sage',
    colors: ['bg-[#B2AC88]', 'bg-[#36454F]', 'bg-[#F5F5DC]', 'bg-[#60A5FA]'],
    colorNames: ['Sage Green', 'Charcoal Slate', 'Classic Beige', 'Soft Sky Blue'],
    extraColors: '+12',
    image: '/categories/cat2.jpg',
    extra_images: null,
    badge: '',
    desc: 'Delicate pattern styling that adds a sweet touch to any aesthetic. Designed with standard rib arches to sit comfortably around the calf without binding.'
  },
  {
    id: 5,
    name: 'Abstract Faces',
    price: 6250,
    category: 'Patterns',
    colorFamily: 'rose',
    colors: ['bg-[#B2AC88]', 'bg-[#36454F]', 'bg-[#B2AC88]'],
    colorNames: ['Dusk Rose', 'Charcoal Slate', 'Sage Green'],
    extraColors: '+8',
    image: '/categories/cat4.jpg',
    extra_images: JSON.stringify(['/categories/cat4.jpg', '/categories/cat1.jpg', '/categories/cat2.jpg']),
    badge: 'Bestseller',
    desc: 'Make a bold statement with artist-inspired abstract faces. Knitted with combed yarns for high detailed resolution and rich, long-lasting wash durability.'
  },
  {
    id: 6,
    name: 'Cat Patterns',
    price: 6250,
    category: 'Animals',
    colorFamily: 'beige',
    colors: ['bg-[#F5F5DC]', 'bg-[#B2AC88]', 'bg-[#36454F]'],
    colorNames: ['Classic Beige', 'Dusk Rose', 'Charcoal Slate'],
    extraColors: '+10',
    image: '/categories/cat1.jpg',
    extra_images: null,
    badge: 'New',
    desc: 'A delightful assortment of repeating kitten patterns. Standard crew length looks fantastic paired with casual sneakers or boots.'
  },
  {
    id: 7,
    name: 'Tropical Flamingo',
    price: 7000,
    category: 'Patterns',
    colorFamily: 'rose',
    colors: ['bg-[#B2AC88]', 'bg-[#B2AC88]', 'bg-sky-400'],
    colorNames: ['Dusk Rose', 'Sage Green', 'Sky Blue'],
    extraColors: '+18',
    image: '/categories/cat3.jpg',
    extra_images: null,
    badge: 'Bestseller',
    desc: 'Evoke year-round vacation vibes with our tropical flamingo graphics. Offers supportive seamless toes and high elastic ankle bands.'
  },
  {
    id: 8,
    name: 'Sunny Lemon',
    price: 5500,
    category: 'Fruits',
    colorFamily: 'yellow',
    colors: ['bg-yellow-400', 'bg-[#36454F]', 'bg-[#F5F5DC]'],
    colorNames: ['Lemon Yellow', 'Charcoal Slate', 'Classic Beige'],
    extraColors: '+6',
    image: '/categories/cat2.jpg',
    extra_images: null,
    bgFallback: 'bg-yellow-100/60',
    badge: 'Sale',
    desc: 'A splash of sunshine for your wardrobe! Designed with seamless toe closures to eliminate pressure seams and keep active steps cheerful.'
  },
  {
    id: 9,
    name: 'Comfy Lavender',
    price: 4500,
    category: 'Cozy Crew',
    colorFamily: 'purple',
    colors: ['bg-purple-400', 'bg-violet-600', 'bg-gray-100'],
    colorNames: ['Soft Lavender', 'Deep Violet', 'Cloud Gray'],
    extraColors: '+4',
    image: '/categories/cat4.jpg',
    extra_images: null,
    bgFallback: 'bg-purple-100/60',
    badge: '',
    desc: 'Sink into luxurious relaxation with our extra-cushion lavender collection. Designed with organic wool blending to provide breathable warming wraps.'
  },
  {
    id: 10,
    name: 'Winter Snowflake',
    price: 8000,
    category: 'Cozy Crew',
    colorFamily: 'sky',
    colors: ['bg-sky-100', 'bg-blue-600', 'bg-white'],
    colorNames: ['Snow Sky Blue', 'Royal Blue', 'Pure White'],
    extraColors: '+14',
    image: '/categories/cat3.jpg',
    extra_images: null,
    bgFallback: 'bg-sky-200/60',
    badge: 'New',
    desc: 'Stay warm even in sub-zero climates with extra brushed-nap loops. Excellent thermoregulatory layers featuring festive holiday patterns.'
  },
  {
    id: 11,
    name: 'Retro Stripes',
    price: 6000,
    category: 'Patterns',
    colorFamily: 'red',
    colors: ['bg-red-400', 'bg-amber-400', 'bg-[#36454F]'],
    colorNames: ['Coral Red', 'Amber Yellow', 'Charcoal Slate'],
    extraColors: '+20',
    image: '/categories/cat2.jpg',
    extra_images: null,
    bgFallback: 'bg-amber-100/60',
    badge: '',
    desc: 'Vintage varsity stripes that pair beautifully with athleisure wear. Offers medium arch compressions to reduce foot fatigue.'
  },
  {
    id: 12,
    name: 'Avocado Smile',
    price: 5500,
    category: 'Fruits',
    colorFamily: 'green',
    colors: ['bg-emerald-600', 'bg-yellow-300', 'bg-[#36454F]'],
    colorNames: ['Avocado Green', 'Lemon Yellow', 'Charcoal Slate'],
    extraColors: '+8',
    image: '/categories/cat1.jpg',
    extra_images: null,
    bgFallback: 'bg-emerald-100/60',
    badge: 'New',
    desc: 'Start your mornings with positive, smiling avocado prints. Made with breathable mesh panels to keep sweat low and comfort exceptionally high.'
  }
];


const colorFilters = [
  { name: 'rose', class: 'bg-[#C08081]' },
  { name: 'sage', class: 'bg-[#B2AC88]' },
  { name: 'beige', class: 'bg-[#F5F5DC]' },
  { name: 'slate', class: 'bg-[#36454F]' },
  { name: 'yellow', class: 'bg-yellow-400' },
  { name: 'green', class: 'bg-emerald-600' },
  { name: 'purple', class: 'bg-purple-400' },
  { name: 'orange', class: 'bg-orange-500' }
];

function ProductCard({
  product,
  index,
  cart,
  likedProducts,
  onAddToCart,
  onRemoveFromCart,
  onToggleWishlist,
  onProductClick,
  t,
  onStoreClick
}) {
  const { language } = useLanguage();
  const [activeImage, setActiveImage] = useState(product.image || product.image_url);

  useEffect(() => {
    setActiveImage(product.image || product.image_url);
  }, [product.image, product.image_url]);


  const hasOpts = hasOptions(product);
  const isInCart = !hasOpts && cart.some((item) => String(item.id) === String(product.id));
  const isLiked = likedProducts.includes(product.id);

  return (
    <motion.div
      custom={index}
      variants={{
        hidden: { opacity: 0, y: 50, scale: 0.95 },
        visible: (i) => ({
          opacity: 1,
          y: 0,
          scale: 1,
          transition: {
            duration: 0.5,
            ease: [0.25, 0.46, 0.45, 0.94],
            delay: (i % 4) * 0.07
          }
        })
      }}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, amount: 0.08 }}
      whileHover={{ y: -5 }}
      exit={{ opacity: 0, y: -16, scale: 0.95, transition: { duration: 0.22 } }}
      onClick={() => onProductClick(product)}
      className="group cursor-pointer flex flex-col bg-transparent border border-transparent hover:border-[#B2AC88] p-0 rounded-2xl transition-all duration-300 relative overflow-hidden"
    >
      {/* Product Corner Badges (Rounded corners) */}
      {(product.stock === 0 || product.discount > 0 || parseJsonArray(product.badge).filter(Boolean).filter(b => String(b).toLowerCase() !== 'sale').length > 0) && (
        <div className="absolute top-3 left-3 z-10 flex flex-col items-start gap-1">
          {product.stock === 0 && (
            <div className="text-[8px] font-bold uppercase tracking-widest px-2.5 py-1 bg-gray-800 text-white rounded-lg shadow-xs">
              Out of Stock
            </div>
          )}
          {product.discount > 0 && (
            <div className="text-[8px] font-bold uppercase tracking-widest px-2.5 py-1 bg-red-500 text-white rounded-lg shadow-xs">
              {product.discount}% OFF
            </div>
          )}
          {parseJsonArray(product.badge).filter(Boolean).filter(b => String(b).toLowerCase() !== 'sale').map((b) => {
            const localizedB = getLocalized(b, language);
            return (
              <div
                key={b}
                className={`text-[8px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg shadow-xs ${
                  localizedB === 'New' || localizedB === 'جديد' || localizedB === 'نوێ' ? 'bg-[#B2AC88] text-white' :
                  localizedB === 'Bestseller' || localizedB === 'الأكثر مبيعا' || localizedB === 'پڕفرۆشترین' ? 'bg-[#36454F] text-white' : 'bg-[#C08081] text-white'
                }`}
              >
                {localizedB}
              </div>
            );
          })}
        </div>
      )}

      {/* Wishlist Button top-right */}
      <div className="absolute top-3 right-3 z-10">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(product, e);
          }}
          className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:scale-105 transition-transform cursor-pointer"
        >
          <Heart
            size={14}
            className={isLiked ? "fill-red-500 text-red-500" : "text-gray-400 hover:text-red-500"}
          />
        </button>
      </div>

      {/* Product Image Box */}
      <div className="w-full aspect-square rounded-2xl relative overflow-hidden flex items-center justify-center transition-all bg-[#f9fafb]">
        {activeImage ? (
          <img src={getProductImage(activeImage)}
            alt={getLocalized(product.name, language)}
            className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-103 rounded-2xl" onError={(e) => { e.target.onerror = null; e.target.src = '/categories/cat1.jpg'; }} />
        ) : (
          <span className="text-gray-300 font-serif text-md tracking-widest uppercase rotate-[-25deg] select-none opacity-80 font-bold">
            {parseJsonArray(product.category).map(cat => getLocalized(cat, language)).join(', ')}
          </span>
        )}
      </div>

      {/* Details Area */}
      <div className="flex flex-col flex-grow mt-3 px-3 pb-3">
        {/* Product Name (Under the photo / thumbnails) */}
        <h3 className="font-extrabold text-[#36454F] text-[12px] sm:text-[14px] group-hover:text-[#B2AC88] transition-colors line-clamp-2 text-start leading-snug">
          {getLocalized(product.name, language)}
        </h3>

        {/* Price (Under the product name) */}
        <div className="text-[13px] font-extrabold text-[#36454F] text-start flex items-center gap-2 flex-wrap mt-1">
          {product.discount > 0 ? (
            <>
              <span className="text-[#36454F] text-[15px] sm:text-base">
                {Math.round(product.price * (1 - product.discount / 100)).toLocaleString()} IQD
              </span>
              <span className="text-[11px] sm:text-[12px] line-through text-gray-400 font-normal">
                {product.price.toLocaleString()} IQD
              </span>
              <span className="text-red-500 text-[10px] sm:text-[11px] font-bold">
                {product.discount}% OFF
              </span>
            </>
          ) : (
          <span className="text-[#36454F] text-[13px] sm:text-[14px]">{product.price.toLocaleString()} IQD</span>
          )}
        </div>

        {/* Store Name (Under the product name) */}
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <p 
            onClick={(e) => {
              if (product.vendor_name && onStoreClick) {
                e.stopPropagation();
                onStoreClick(product.vendor_name);
              }
            }}
            className={`text-[11px] sm:text-[13px] text-gray-400 font-medium ${product.vendor_name ? 'cursor-pointer hover:text-[#B2AC88] transition-colors' : ''}`}
          >
            {product.vendor_name
              ? t('vendor_dashboard.sold_by', { vendor: getCleanVendorName(product.vendor_name, language) })
              : t('vendor_dashboard.platform_store')}
          </p>
        </div>

        {/* Promotion Badge (Under the store name) */}
        {(() => {
          const promos = parseJsonArray(product.promotion).filter(p => p && p !== 'None' && p !== '');
          if (promos.length === 0) return null;
          return (
            <div className="flex flex-wrap gap-1 mt-1">
              {promos.map((promo, idx) => (
                <span key={idx} className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#B2AC88]/10 border border-[#B2AC88]/20 rounded-full text-[9px] sm:text-[10px] font-bold text-[#B2AC88] uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#B2AC88] shrink-0" />
                  {promo}
                </span>
              ))}
            </div>
          );
        })()}

        {/* Cart Button (Under the store name) */}


        {/* Cart Button (Under the color swatches) */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (isInCart) {
              onRemoveFromCart(product, e);
            } else {
              onAddToCart(product, e);
            }
          }}
          className={`w-full mt-2.5 py-2 px-3 rounded-xl border border-transparent text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all duration-300 cursor-pointer text-white ${
            isInCart
              ? 'bg-[#36454F] hover:bg-[#36454F]'
              : 'bg-[#B2AC88] hover:bg-[#36454F]'
          }`}
        >
          <ShoppingBag size={14} className="shrink-0" />
          <span>
            {isInCart ? 'Added to Cart' : 'Add to cart'}
          </span>
        </button>
      </div>
    </motion.div>
  );
}

export default function AllProducts({ onAddToCart, onRemoveFromCart, onBackToHome, initialCategory = 'All', likedProducts = [], onToggleWishlist, initialViewingProduct = null, cart = [], initialSearchTerm = '', onClearGlobalSearch, previousView = 'home', isLoggedIn, onLoginRequired, globalFilters, onOpenCart, resetDetailTrigger = 0, onStoreClick }) {
  const { t, language, tCategory } = useLanguage();
  const isRTL = language === 'ar' || language === 'ku';

  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [localSearchTerm, setLocalSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('featured');
  const [priceRange, setPriceRange] = useState([0, 15000]);

  const getBackLabel = () => {
    if (previousView === 'wishlist') {
      return language === 'ar' ? 'العودة للمفضلة' : language === 'ku' ? 'گەڕانەوە بۆ لیستی دڵخوازەکان' : 'Back to Wishlist';
    }
    if (previousView === 'cart') {
      return language === 'ar' ? 'العودة للسلة' : language === 'ku' ? 'گەڕانەوە بۆ سەبەتە' : 'Back to Your Cart';
    }
    if (previousView === 'story') {
      return language === 'ar' ? 'العودة لقصتنا' : language === 'ku' ? 'گەڕانەوە بۆ چیرۆکی ئێمە' : 'Back to Our Story';
    }
    if (previousView === 'contact') {
      return language === 'ar' ? 'العودة للتواصل' : language === 'ku' ? 'گەڕانەوە بۆ پەیوەندی' : 'Back to Contact';
    }
    if (previousView === 'checkout') {
      return language === 'ar' ? 'العودة لتأكيد الطلب' : language === 'ku' ? 'گەڕانەوە بۆ پارەدان' : 'Back to Checkout';
    }
    return t('checkout_page.back_home') || 'Back to Home';
  };// Navigation & Filtering States
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stylesList, setStylesList] = useState([]);
  const [materialsList, setMaterialsList] = useState([]);
  const [seasonsList, setSeasonsList] = useState([]);
  const [sizesList, setSizesList] = useState([]);
  const [colorsList, setColorsList] = useState([]);
  const [badgesList, setBadgesList] = useState([]);
  const [promotionsList, setPromotionsList] = useState([]);
  const [designsList, setDesignsList] = useState([]);
  const [sportTypesList, setSportTypesList] = useState([]);

  const uniqueColorFilters = useMemo(() => {
    if (colorsList.length === 0) {
      return colorFilters;
    }
    const families = [];
    const seen = new Set();
    colorsList.forEach(col => {
      const fam = col.family.toLowerCase();
      if (!seen.has(fam)) {
        seen.add(fam);
        families.push({
          name: fam,
          class: col.class
        });
      }
    });
    return families;
  }, [colorsList]);

  const [selectedStyles, setSelectedStyles] = useState([]);
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [selectedSeasons, setSelectedSeasons] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedBadges, setSelectedBadges] = useState([]);
  const [selectedPromotions, setSelectedPromotions] = useState([]);
  const [selectedDesigns, setSelectedDesigns] = useState([]);
  const [selectedSportTypes, setSelectedSportTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [windowWidth, setWindowWidth] = useState(() => typeof window !== 'undefined' ? window.innerWidth : 1200);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const [viewingProduct, setViewingProduct] = useState(initialViewingProduct);
  const [prevInitialProduct, setPrevInitialProduct] = useState(initialViewingProduct);
  const [lastResetTrigger, setLastResetTrigger] = useState(resetDetailTrigger);

  if (initialViewingProduct !== prevInitialProduct) {
    setPrevInitialProduct(initialViewingProduct);
    setViewingProduct(initialViewingProduct);
  }

  if (resetDetailTrigger !== lastResetTrigger) {
    setLastResetTrigger(resetDetailTrigger);
    setViewingProduct(null);
  }

  const [detailActiveImage, setDetailActiveImage] = useState(null);

  useEffect(() => {
    if (viewingProduct) {
      setDetailActiveImage(viewingProduct.image || viewingProduct.image_url);
    } else {
      setDetailActiveImage(null);
    }
  }, [viewingProduct]);
  
  // Fetch products from database
  useEffect(() => {
    let active = true;
    fetch('/api/products')
      .then((res) => {
        if (!res.ok) throw new Error('API server offline');
        return res.json();
      })
      .then((data) => {
        if (active) {
          if (Array.isArray(data) && data.length > 0) {
            const sorted = [...data].sort((a, b) => Number(b.id) - Number(a.id));
            setProducts(sorted);
          } else {
            setProducts(productsData);
          }
          setLoading(false);
        }
      })
      .catch((err) => {
        console.warn('Backend API server offline, falling back to static catalog productsData', err);
        if (active) {
          setProducts(productsData);
          setLoading(false);
        }
      });
    return () => { active = false; };
  }, []);

  // Fetch categories from settings
  useEffect(() => {
    let active = true;
    fetch('/api/settings/categories')
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        if (active) {
          setCategories(data);
          try { localStorage.setItem('hhawrisha_categories', JSON.stringify(data)); } catch(e) {}
        }
      })
      .catch((err) => {
        console.warn('Failed to fetch categories, checking local storage fallback', err);
        if (active) {
          const localCats = localStorage.getItem('hhawrisha_categories');
          if (localCats) {
            try {
              setCategories(JSON.parse(localCats));
              return;
            } catch(e) {}
          }
          setCategories([
            { id: 'animals', name: 'Animals' },
            { id: 'fruits', name: 'Fruits' },
            { id: 'patterns', name: 'Patterns' },
            { id: 'cozy_crew', name: 'Cozy Crew' }
          ]);
        }
      });
    return () => { active = false; };
  }, []);

  // Fetch styles, materials, seasons, sizes, colors lists
  useEffect(() => {
    let active = true;

    // Fetch Styles
    fetch('/api/settings/styles')
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => { if (active) setStylesList(data); })
      .catch(() => {
        if (active) setStylesList([
          { id: 'crew', name: 'Crew' },
          { id: 'ankle', name: 'Ankle' },
          { id: 'no_show', name: 'No Show' },
          { id: 'knee_high', name: 'Knee High' }
        ]);
      });

    // Fetch Materials
    fetch('/api/settings/materials')
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => { if (active) setMaterialsList(data); })
      .catch(() => {
        if (active) setMaterialsList([
          { id: 'cotton', name: 'Cotton' },
          { id: 'bamboo', name: 'Bamboo' },
          { id: 'wool', name: 'Wool' },
          { id: 'polyester', name: 'Polyester' }
        ]);
      });

    // Fetch Seasons
    fetch('/api/settings/seasons')
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => { if (active) setSeasonsList(data); })
      .catch(() => {
        if (active) setSeasonsList([
          { id: 'winter', name: 'Winter' },
          { id: 'summer', name: 'Summer' },
          { id: 'spring', name: 'Spring' },
          { id: 'autumn', name: 'Autumn' },
          { id: 'all_season', name: 'All Season' }
        ]);
      });

    // Fetch Sizes
    fetch('/api/settings/sizes')
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => { if (active) setSizesList(data); })
      .catch(() => {
        if (active) setSizesList([
          { id: 'one_size', name: 'One Size' },
          { id: '35-38', name: '35-38' },
          { id: '39-42', name: '39-42' },
          { id: '43-46', name: '43-46' }
        ]);
      });

    // Fetch Colors
    fetch('/api/settings/colors')
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => { if (active) setColorsList(data); })
      .catch(() => {
        if (active) setColorsList([
          { id: 'beige', class: 'bg-[#F5F5DC]', name: 'Classic Beige', family: 'beige' },
          { id: 'sage', class: 'bg-[#B2AC88]', name: 'Sage Green', family: 'sage' },
          { id: 'slate', class: 'bg-[#36454F]', name: 'Charcoal Slate', family: 'slate' },
          { id: 'rose', class: 'bg-[#C08081]', name: 'Dusk Rose', family: 'rose' },
          { id: 'yellow', class: 'bg-yellow-400', name: 'Lemon Yellow', family: 'yellow' },
          { id: 'green', class: 'bg-emerald-600', name: 'Avocado Green', family: 'green' },
          { id: 'purple', class: 'bg-purple-400', name: 'Soft Lavender', family: 'purple' },
          { id: 'orange', class: 'bg-orange-500', name: 'Citrus Orange', family: 'orange' }
        ]);
      });

    // Fetch Promotions
    fetch('/api/settings/promotions')
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => { if (active) setPromotionsList(data); })
      .catch(() => {
        if (active) setPromotionsList([
          { id: 'buy_2_get_1_free', name: 'Buy 2 Get 1 Free' },
          { id: 'new_season_promo', name: 'New Season Promo' }
        ]);
      });

    // Fetch Badges
    fetch('/api/settings/badges')
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => { if (active) setBadgesList(data); })
      .catch(() => {
        if (active) setBadgesList([
          { id: 'new', name: 'New' },
          { id: 'bestseller', name: 'Bestseller' },
          { id: 'sale', name: 'Sale' }
        ]);
      });

    // Fetch Designs
    fetch('/api/settings/designs')
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => { if (active) setDesignsList(data); })
      .catch(() => { if (active) setDesignsList([]); });

    // Fetch Sport Types
    fetch('/api/settings/sport-types')
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => { if (active) setSportTypesList(data); })
      .catch(() => { if (active) setSportTypesList([]); });

    return () => { active = false; };
  }, []);

  // Memoized category counts calculated dynamically
  const categoryCounts = useMemo(() => {
    const counts = { All: products.length };
    if (likedProducts.length > 0) {
      counts['Wishlist'] = likedProducts.length;
    }
    categories.forEach(cat => {
      counts[cat.name] = products.filter(p => p.category === cat.name).length;
    });
    return counts;
  }, [products, categories, likedProducts]);

  // Scroll to top when entering or leaving product detail view
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [viewingProduct]);


  const [selectedCategories, setSelectedCategories] = useState(
    initialCategory === 'All' ? [] : [initialCategory]
  );
  const [prevInitialCategory, setPrevInitialCategory] = useState(initialCategory);
  const [prevGlobalFilters, setPrevGlobalFilters] = useState(null);
  
  const [showFilters, setShowFilters] = useState(() => typeof window !== 'undefined' && window.innerWidth >= 768);
  const [onlyDiscounted, setOnlyDiscounted] = useState(false);
  const [maxPriceFilter, setMaxPriceFilter] = useState(15000);
  const [hasSetDefaultPrice, setHasSetDefaultPrice] = useState(false);
  const [selectedColors, setSelectedColors] = useState([]);
  const [sortBy, setSortBy] = useState('Featured');
  const [selectedGender, setSelectedGender] = useState('');

  if (initialCategory !== prevInitialCategory) {
    setPrevInitialCategory(initialCategory);
    if (initialCategory === 'All') {
      setSelectedCategories([]);
    } else {
      setSelectedCategories([initialCategory]);
    }
  }

  if (globalFilters && globalFilters !== prevGlobalFilters) {
    setPrevGlobalFilters(globalFilters);
    setSelectedCategories(globalFilters.categories || []);
    setSelectedColors(globalFilters.colors || []);
    setSelectedStyles(globalFilters.styles || []);
    setSelectedMaterials(globalFilters.materials || []);
    setSelectedSeasons(globalFilters.seasons || []);
    setSelectedSizes(globalFilters.sizes || []);
    setSelectedBadges(globalFilters.badges || []);
    setSelectedPromotions(globalFilters.promotions || []);
    setSelectedDesigns(globalFilters.designs || []);
    setSelectedSportTypes(globalFilters.sportTypes || []);
    setOnlyDiscounted(globalFilters.onlyDiscounted || false);
    setSelectedGender(globalFilters.gender || '');
    
    if (globalFilters.categories && globalFilters.categories.length > 0) {
      setActiveCategory(globalFilters.categories[0]);
    } else {
      setActiveCategory('All');
    }
  }
  
  const [collapsedSections, setCollapsedSections] = useState({
    offers: false,
    gender: false,
    categories: false,
    badges: false,
    promotions: false,
    price: false,
    color: false,
    size: false,
    style: false,
    material: false,
    season: false,
    design: false,
    sportType: false,
  });

  const toggleSection = (section) => {
    setCollapsedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const maxPriceOfProducts = useMemo(() => {
    if (products.length === 0) return 15000;
    return Math.max(...products.map(p => Number(p.price) || 0), 250);
  }, [products]);

  useEffect(() => {
    if (products.length > 0 && !hasSetDefaultPrice) {
      setMaxPriceFilter(maxPriceOfProducts);
      setHasSetDefaultPrice(true);
    }
  }, [products, maxPriceOfProducts, hasSetDefaultPrice]);
  
  const [toastMessage, setToastMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(0);

  // Product Detail Page configurations
  const [detailSelectedColor, setDetailSelectedColor] = useState(null);
  const [detailQuantity, setDetailQuantity] = useState(1);
  const [isDetailRemovedBlue, setIsDetailRemovedBlue] = useState(false);
  const [detailSelectedStyle, setDetailSelectedStyle] = useState(null);
  const [detailSelectedSize, setDetailSelectedSize] = useState(null);
  const [relatedPage, setRelatedPage] = useState(0);
  const [hoveredRelatedId, setHoveredRelatedId] = useState(null);
  const [detailValidationError, setDetailValidationError] = useState('');

  // "Choose Options" Modal state
  const [optionsModalProduct, setOptionsModalProduct] = useState(null);
  const [modalColorIndex, setModalColorIndex] = useState(null);
  const [modalSelectedSize, setModalSelectedSize] = useState(null);
  const [modalSelectedStyle, setModalSelectedStyle] = useState(null);
  const [modalQuantity, setModalQuantity] = useState(1);
  const [modalValidationError, setModalValidationError] = useState('');
  const [modalActiveImage, setModalActiveImage] = useState(null);

  const selectedColorClass = (optionsModalProduct && modalColorIndex !== null)
    ? optionsModalProduct.colors?.[modalColorIndex]
    : null;

  useEffect(() => {
    if (optionsModalProduct) {
      setModalColorIndex(optionsModalProduct.colors && optionsModalProduct.colors.length > 0 ? 0 : null);
      setModalSelectedSize(null);
      setModalSelectedStyle(null);
      setModalQuantity(1);
      setModalValidationError('');
      setModalActiveImage(optionsModalProduct.image || optionsModalProduct.image_url);
      
      // Prevent background scrolling
      document.body.style.overflow = 'hidden';
    } else {
      // Re-enable background scrolling
      document.body.style.overflow = '';
    }
    
    // Cleanup on unmount or when modal closes
    return () => {
      document.body.style.overflow = '';
    };
  }, [optionsModalProduct]);

  useEffect(() => {
    setIsDetailRemovedBlue(false);
  }, [viewingProduct]);

  // Update Detail modal Active Image when color selection changes
  useEffect(() => {
    if (viewingProduct) {
      const variants = (() => {
        try {
          if (typeof viewingProduct.color_variants === 'string') {
            return JSON.parse(viewingProduct.color_variants);
          }
          return viewingProduct.color_variants || [];
        } catch(e) {
          return [];
        }
      })();
      if (variants.length > 0 && detailSelectedColor) {
        const selectedVariant = variants.find(v => v.color && v.color.class === detailSelectedColor);
        if (selectedVariant && selectedVariant.image) {
          setDetailActiveImage(selectedVariant.image);
        }
      }
    }
  }, [detailSelectedColor, viewingProduct]);

  // Update Options Modal Active Image when color selection changes
  useEffect(() => {
    if (optionsModalProduct) {
      const variants = (() => {
        try {
          if (typeof optionsModalProduct.color_variants === 'string') {
            return JSON.parse(optionsModalProduct.color_variants);
          }
          return optionsModalProduct.color_variants || [];
        } catch(e) {
          return [];
        }
      })();
      const selectedColor = optionsModalProduct.colors && modalColorIndex !== null ? optionsModalProduct.colors[modalColorIndex] : null;
      if (variants.length > 0 && selectedColor) {
        const selectedVariant = variants.find(v => v.color && v.color.class === selectedColor);
        if (selectedVariant && selectedVariant.image) {
          setModalActiveImage(selectedVariant.image);
        }
      }
    }
  }, [modalColorIndex, optionsModalProduct]);

  // Handle Toast notification for cart additions
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
    if (hasOptions(product)) {
      setOptionsModalProduct(product);
      return;
    }
    const finalPrice = product.discount > 0 
      ? Math.round(product.price * (1 - product.discount / 100))
      : product.price;
    onAddToCart({ ...product, price: finalPrice }, 1);
    showToast(`Added ${getLocalized(product.name, language)} to your cart!`);
  };

  const handleRemoveFromCartClick = (product, e) => {
    e.stopPropagation();
    if (onRemoveFromCart) {
      onRemoveFromCart(product.id);
      showToast(`Removed ${getLocalized(product.name, language)} from your cart!`);
    }
  };

  const handleToggleWishlistClick = (product, e) => {
    e.stopPropagation();
    const isLiked = likedProducts.includes(product.id);
    onToggleWishlist(product.id);
    if (isLiked) {
      showToast(`Removed ${getLocalized(product.name, language)} from your wishlist!`);
    } else {
      showToast(`Added ${getLocalized(product.name, language)} to your wishlist!`);
    }
  };

  // Reset Filters
  const handleResetFilters = () => {
    setLocalSearchTerm('');
    setSelectedCategories([]);
    setActiveCategory('All');
    setOnlyDiscounted(false);
    setMaxPriceFilter(maxPriceOfProducts);
    setSelectedColors([]);
    setSortBy('Featured');
    setSelectedStyles([]);
    setSelectedMaterials([]);
    setSelectedSeasons([]);
    setSelectedSizes([]);
    setSelectedBadges([]);
    setSelectedPromotions([]);
    setSelectedGender('');
    if (onClearGlobalSearch) {
      onClearGlobalSearch();
    }
  };

  // Memoized Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        const lTerm = localSearchTerm.toLowerCase();
        const matchesLocal = !lTerm || getLocalized(product.name, language).toLowerCase().includes(lTerm);

        const gTerm = initialSearchTerm.toLowerCase();
        const matchesGlobal = !gTerm || getLocalized(product.name, language).toLowerCase().includes(gTerm) ||
          (product.vendor_name && getLocalized(product.vendor_name, language).toLowerCase().includes(gTerm));
        const matchesSearch = matchesLocal && matchesGlobal;
        const matchesCategory = selectedCategories.length === 0 || 
          selectedCategories.some(cat => 
            cat === 'Wishlist' 
              ? likedProducts.includes(product.id) 
              : parseJsonArray(product.category).includes(cat)
          );
        const matchesDiscount = !onlyDiscounted || (Number(product.discount) > 0);
        const matchesPrice = product.price <= maxPriceFilter;
        // Find all families for this product's colors
        const productFamilies = [];
        const mainFamily = product.colorFamily || product.color_family;
        if (mainFamily) {
          productFamilies.push(mainFamily.toLowerCase());
        }
        
        // Also map each of the product's individual color classes to their families
        if (product.colors && Array.isArray(product.colors)) {
          product.colors.forEach(colClass => {
            const match = colorsList.find(c => c.class === colClass);
            if (match && match.family) {
              const fam = match.family.toLowerCase();
              if (!productFamilies.includes(fam)) {
                productFamilies.push(fam);
              }
            } else {
              // Fallback match to static color swatches if not in colorsList yet
              const staticMatch = [
                { class: 'bg-[#F5F5DC]', family: 'beige' },
                { class: 'bg-[#B2AC88]', family: 'sage' },
                { class: 'bg-[#36454F]', family: 'slate' },
                { class: 'bg-[#C08081]', family: 'rose' },
                { class: 'bg-yellow-400', family: 'yellow' },
                { class: 'bg-emerald-600', family: 'green' },
                { class: 'bg-purple-400', family: 'purple' },
                { class: 'bg-orange-500', family: 'orange' }
              ].find(c => c.class === colClass);
              if (staticMatch && !productFamilies.includes(staticMatch.family)) {
                productFamilies.push(staticMatch.family);
              }
            }
          });
        }

        const matchesColor = selectedColors.length === 0 || 
          selectedColors.some(selCol => productFamilies.includes(selCol.toLowerCase()));

        const matchesStyle = selectedStyles.length === 0 || 
          parseJsonArray(product.style_length).some(st => selectedStyles.includes(st));

        const matchesMaterial = selectedMaterials.length === 0 || 
          parseJsonArray(product.material).some(mat => selectedMaterials.includes(mat));

        const matchesSeason = selectedSeasons.length === 0 || 
          parseJsonArray(product.seasonal_type).some(seas => selectedSeasons.includes(seas));

        const matchesSize = selectedSizes.length === 0 || 
          parseJsonArray(product.size_collection).some(sz => selectedSizes.includes(sz));

        const matchesBadge = selectedBadges.length === 0 || 
          selectedBadges.some(b => parseJsonArray(product.badge).includes(b));

        const matchesPromotion = selectedPromotions.length === 0 || 
          selectedPromotions.some(promo => parseJsonArray(product.promotion).includes(promo));

        const matchesDesign = selectedDesigns.length === 0 ||
          selectedDesigns.some(d => parseJsonArray(product.design).includes(d));

        const matchesSportType = selectedSportTypes.length === 0 ||
          selectedSportTypes.some(st => parseJsonArray(product.sport_type).includes(st));

        const matchesGender = !selectedGender || product.gender === selectedGender;

        return matchesSearch && matchesCategory && matchesPrice && matchesColor && matchesStyle && matchesMaterial && matchesSeason && matchesSize && matchesDiscount && matchesBadge && matchesPromotion && matchesDesign && matchesSportType && matchesGender;
      })
      .sort((a, b) => {
        if (sortBy === 'Price: Low to High') {
          return a.price - b.price;
        }
        if (sortBy === 'Price: High to Low') {
          return b.price - a.price;
        }
        if (sortBy === 'Bestseller') {
          const isBestsellerA = parseJsonArray(a.badge).includes('Bestseller') ? 1 : 0;
          const isBestsellerB = parseJsonArray(b.badge).includes('Bestseller') ? 1 : 0;
          return isBestsellerB - isBestsellerA;
        }
        if (sortBy === 'Newest Arrivals') {
          const aIsNew = parseJsonArray(a.badge).includes('New') ? 1 : 0;
          const bIsNew = parseJsonArray(b.badge).includes('New') ? 1 : 0;
          if (bIsNew !== aIsNew) return bIsNew - aIsNew;
          return Number(b.id) - Number(a.id);
        }
        return 0;
      });
  }, [products, localSearchTerm, initialSearchTerm, selectedCategories, maxPriceFilter, selectedColors, sortBy, likedProducts, selectedStyles, selectedMaterials, selectedSeasons, selectedSizes, colorsList, onlyDiscounted, selectedBadges, selectedPromotions, selectedDesigns, selectedSportTypes, selectedGender]);

  // Reset page when any filter updates
  useEffect(() => {
    setCurrentPage(0);
  }, [localSearchTerm, initialSearchTerm, selectedCategories, maxPriceFilter, selectedColors, sortBy, selectedStyles, selectedMaterials, selectedSeasons, selectedSizes, colorsList, onlyDiscounted, selectedBadges, selectedPromotions, selectedGender]);

  // Memoized page count
  const pageCount = useMemo(() => {
    return Math.ceil(filteredProducts.length / 16);
  }, [filteredProducts]);

  // Paginated Products
  const paginatedProducts = useMemo(() => {
    if (filteredProducts.length <= 16) {
      return filteredProducts;
    }
    const start = currentPage * 16;
    const end = start + 16;
    return filteredProducts.slice(start, end);
  }, [filteredProducts, currentPage]);

  const hasActiveFilters = onlyDiscounted || selectedCategories.length > 0 || maxPriceFilter < maxPriceOfProducts || selectedColors.length > 0 || localSearchTerm !== '' || initialSearchTerm !== '' || selectedStyles.length > 0 || selectedMaterials.length > 0 || selectedSeasons.length > 0 || selectedSizes.length > 0 || !!selectedGender;

  // Trigger entering product detail state
  const handleCardClick = (product) => {
    setViewingProduct(product);
    setDetailSelectedColor(null);
    setDetailQuantity(1);
    setIsDetailRemovedBlue(false);
    setDetailSelectedStyle(null);
    setDetailSelectedSize(null);
    setRelatedPage(0);
    setHoveredRelatedId(null);
    setDetailValidationError('');
  };

  // Perform multiple dynamic additions to shopping bag or removal
  const handleDetailAdd = () => {
    if (!isLoggedIn) {
      if (onLoginRequired) onLoginRequired();
      return;
    }
    // Validate style selection when multiple styles exist
    const styleOptions = parseJsonArray(viewingProduct.style_length).filter(Boolean).filter(b => String(b).toLowerCase() !== 'sale');
    if (styleOptions.length > 1 && !detailSelectedStyle) {
      setDetailValidationError('Please select a Style / Length first.');
      return;
    }
    // Validate size selection when sizes exist
    const parsedSizes = parseJsonArray(viewingProduct.size_collection).filter(s => s && s !== 'One Size');
const sizeOptions = parsedSizes.length > 0 ? parsedSizes : ['EU 36-40', 'EU 41-45', 'Free Size'];
    if (sizeOptions.length > 0 && !detailSelectedSize) {
      setDetailValidationError('Please select a Size first.');
      return;
    }
    // Validate color selection
    const sizeColorMap = (() => { try { return JSON.parse(viewingProduct.size_colors || '{}'); } catch(e) { return {}; } })();
    const availableColorClasses = detailSelectedSize && sizeColorMap[detailSelectedSize] 
      ? sizeColorMap[detailSelectedSize] 
      : (viewingProduct.colors && viewingProduct.colors.length > 0 ? viewingProduct.colors : ['bg-[#C08081]', 'bg-[#B2AC88]', 'bg-[#F5F5DC]', 'bg-[#36454F]']);
    if (availableColorClasses.length > 0 && !detailSelectedColor) {
      setDetailValidationError('Please select a Color first.');
      return;
    }
    setDetailValidationError('');
    const finalPrice = viewingProduct.discount > 0
      ? Math.round(viewingProduct.price * (1 - viewingProduct.discount / 100))
      : viewingProduct.price;

    const variants = (() => {
      try {
        if (typeof viewingProduct.color_variants === 'string') {
          return JSON.parse(viewingProduct.color_variants);
        }
        return viewingProduct.color_variants || [];
      } catch(e) {
        return [];
      }
    })();

    let selectedColorName = null;
    if (variants.length > 0) {
      const match = variants.find(v => v.color && v.color.class === detailSelectedColor);
      selectedColorName = match && match.color ? match.color.name : null;
    } else {
      selectedColorName = viewingProduct.colorNames
        ? viewingProduct.colorNames[viewingProduct.colors ? viewingProduct.colors.indexOf(detailSelectedColor) : -1]
        : null;
    }
    onAddToCart({ 
      ...viewingProduct, 
      price: finalPrice, 
      selectedStyle: detailSelectedStyle, 
      selectedSize: detailSelectedSize,
      selectedColor: detailSelectedColor,
      selectedColorName: selectedColorName
    }, detailQuantity);
    const colorLabel = selectedColorName || detailSelectedColor || 'selected color';
    showToast(`Added ${detailQuantity}x ${getLocalized(viewingProduct.name, language)} (${colorLabel}) to cart!`);
    // Open cart panel immediately
    if (onOpenCart) onOpenCart();
  };

  return (
    <div className="bg-gradient-to-b from-[#F5F5DC]/10 via-white/80 to-[#F5F5DC]/5 min-h-screen py-6 px-8 sm:px-10 lg:px-16 relative select-none">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 350, damping: 22 }}
            className="fixed bottom-8 right-8 z-50 bg-[#36454F] text-white px-6 py-3.5 rounded-xl shadow-xl flex items-center space-x-3 border border-white/10"
          >
            <div className="w-2.5 h-2.5 rounded-full bg-[#B2AC88] animate-ping" />
            <span className="font-semibold text-sm tracking-wide">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-[1440px] mx-auto">
        <AnimatePresence mode="wait">
          {!viewingProduct ? (
            /* Catalog Page view */
            <motion.div
              key="catalog"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
            >
              {/* Luxury Banner Header */}
              {/* Clean Header & Filters Bar */}
              <div className="mb-2 md:mb-4">
                {/* Title Row */}
                <motion.div
                  initial={{ opacity: 0, y: -24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, amount: 0.1 }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className="flex flex-col md:flex-row md:items-end justify-between gap-2 md:gap-4 mb-4 md:mb-8"
                >
                  <div className="w-full">
                    <h1 className="text-2xl md:text-4xl font-black text-[#36454F] tracking-tight uppercase leading-none">{t('nav.all_products')}</h1>
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1, duration: 0.4 }}
                      className="mt-4 md:mt-6 relative group inline-block"
                    >
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-gray-400 group-focus-within:text-[#B2AC88] transition-colors duration-300" />
                      </div>
                      <input 
                        type="text"
                        placeholder={language === 'ar' ? 'البحث عن منتج...' : language === 'ku' ? 'گەڕان بۆ بەرهەم...' : 'Search products...'}
                        value={localSearchTerm}
                        onChange={(e) => setLocalSearchTerm(e.target.value)}
                        className="w-56 md:w-64 focus:w-72 md:focus:w-80 pl-9 pr-4 py-2 md:py-2.5 bg-white border border-gray-200 hover:border-gray-300 rounded-full focus:border-[#B2AC88] focus:ring-4 focus:ring-[#B2AC88]/15 outline-none transition-all duration-300 text-xs font-semibold text-[#36454F] placeholder-gray-400 shadow-sm"
                      />
                      {localSearchTerm && (
                        <button 
                          onClick={() => setLocalSearchTerm('')}
                          className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </motion.div>
                  </div>

                  {/* Search input deleted as requested */}
                </motion.div>

                {/* Filters Controls Bar */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: 0.2, ease: 'easeOut' }}
                  className="flex flex-col gap-2 border-t border-b border-gray-100 py-2.5"
                >
                  {/* Top Row: SHOW FILTERS (Left) + SORT BY (Right) in one row on mobile and desktop */}
                  <div className="flex flex-row items-center justify-between w-full gap-2">
                    {/* Hide / Show Filters Button */}
                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className="px-4 py-2 md:px-5 border border-gray-200 hover:border-gray-300 text-[10px] md:text-xs font-bold uppercase tracking-wider rounded-full hover:bg-gray-50 transition-all cursor-pointer shadow-xs text-[#36454F] bg-white shrink-0"
                    >
                      {showFilters 
                        ? (language === 'ar' ? 'إخفاء الفلاتر' : language === 'ku' ? 'شاردنەوەی فلتەرەکان' : 'Hide filters')
                        : (language === 'ar' ? 'عرض الفلاتر' : language === 'ku' ? 'پیشاندانی فلتەرەکان' : 'Show filters')}
                    </button>

                    {/* Sort By Dropdown */}
                    <div className="flex items-center space-x-1 md:space-x-1.5 px-3 py-1.5 md:px-4 md:py-2 border border-gray-200 hover:border-gray-300 rounded-full hover:bg-gray-50 transition-all cursor-pointer shadow-xs text-[#36454F] bg-white rtl:space-x-reverse shrink-0">
                      <span className="shrink-0 text-gray-400 text-[10px] md:text-xs font-semibold select-none">{t('product.sort_title')}:</span>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="bg-transparent border-0 py-0 pr-2 rtl:pl-2 rtl:pr-0 text-[10px] md:text-xs font-bold text-[#36454F] focus:outline-none cursor-pointer"
                      >
                        <option value="Featured">{language === 'ar' ? 'المميز' : language === 'ku' ? 'تایبەتمەند' : 'Featured'}</option>
                        <option value="Newest Arrivals">{t('product.sort_newest')}</option>
                        <option value="Bestseller">{t('product.badge_bestseller')}</option>
                        <option value="Price: Low to High">{t('product.sort_price_low')}</option>
                        <option value="Price: High to Low">{t('product.sort_price_high')}</option>
                      </select>
                    </div>
                  </div>

                  {/* Active Filter Badges */}
                  {hasActiveFilters && (
                    <div className="flex flex-wrap gap-2 items-center pt-1">
                      {selectedCategories.map(cat => (
                        <span key={cat} className="flex items-center space-x-1.5 px-3 py-1 bg-gray-100 border border-gray-200 text-gray-600 text-[10px] font-bold rounded-full">
                          <span>{language === 'ar' ? 'التصنيف' : language === 'ku' ? 'پۆلێن' : 'Category'}: {cat}</span>
                          <X size={10} className="cursor-pointer text-gray-400 hover:text-gray-600" onClick={() => setSelectedCategories(prev => prev.filter(x => x !== cat))} />
                        </span>
                      ))}
                      {onlyDiscounted && (
                        <span className="flex items-center space-x-1.5 px-3 py-1 bg-gray-100 border border-gray-200 text-gray-600 text-[10px] font-bold rounded-full">
                          <span>{language === 'ar' ? 'العروض: تخفيضات' : language === 'ku' ? 'پێشنیارەکان: داشکاندن' : 'Offers: Discount'}</span>
                          <X size={10} className="cursor-pointer text-gray-400 hover:text-gray-600" onClick={() => setOnlyDiscounted(false)} />
                        </span>
                      )}
                      {maxPriceFilter < maxPriceOfProducts && (
                        <span className="flex items-center space-x-1.5 px-3 py-1 bg-gray-100 border border-gray-200 text-gray-600 text-[10px] font-bold rounded-full">
                          <span>{language === 'ar' ? `أقل من ${maxPriceFilter.toLocaleString()} د.ع` : language === 'ku' ? `کەمتر لە ${maxPriceFilter.toLocaleString()} دینار` : `Under ${maxPriceFilter.toLocaleString()} IQD`}</span>
                          <X size={10} className="cursor-pointer text-gray-400 hover:text-gray-600" onClick={() => setMaxPriceFilter(maxPriceOfProducts)} />
                        </span>
                      )}
                      {selectedColors.length > 0 && (
                        <span className="flex items-center space-x-1.5 px-3 py-1 bg-gray-100 border border-gray-200 text-gray-600 text-[10px] font-bold rounded-full">
                          <span>{language === 'ar' ? 'الألوان' : language === 'ku' ? 'ڕەنگەکان' : 'Colors'} ({selectedColors.length})</span>
                          <X size={10} className="cursor-pointer text-gray-400 hover:text-gray-600" onClick={() => setSelectedColors([])} />
                        </span>
                      )}
                      {localSearchTerm !== '' && (
                        <span className="flex items-center space-x-1.5 px-3 py-1 bg-gray-100 border border-gray-200 text-gray-600 text-[10px] font-bold rounded-full">
                          <span>{language === 'ar' ? 'البحث' : language === 'ku' ? 'گەڕان' : 'Search'}: "{localSearchTerm}"</span>
                          <X size={10} className="cursor-pointer text-gray-400 hover:text-gray-600" onClick={() => setLocalSearchTerm('')} />
                        </span>
                      )}
                      {initialSearchTerm !== '' && (
                        <span className="flex items-center space-x-1.5 px-3 py-1 bg-gray-100 border border-gray-200 text-gray-600 text-[10px] font-bold rounded-full">
                          <span>{language === 'ar' ? 'البحث العام' : language === 'ku' ? 'گەڕانی گشتی' : 'Global Search'}: "{initialSearchTerm}"</span>
                          <X size={10} className="cursor-pointer text-gray-400 hover:text-gray-600" onClick={() => onClearGlobalSearch && onClearGlobalSearch()} />
                        </span>
                      )}
                      {selectedStyles.map(st => (
                        <span key={st} className="flex items-center space-x-1.5 px-3 py-1 bg-gray-100 border border-gray-200 text-gray-600 text-[10px] font-bold rounded-full">
                          <span>{language === 'ar' ? 'الموديل' : language === 'ku' ? 'شێواز' : 'Style'}: {st}</span>
                          <X size={10} className="cursor-pointer text-gray-400 hover:text-gray-600" onClick={() => setSelectedStyles(prev => prev.filter(x => x !== st))} />
                        </span>
                      ))}
                      {selectedMaterials.map(mat => (
                        <span key={mat} className="flex items-center space-x-1.5 px-3 py-1 bg-gray-100 border border-gray-200 text-gray-600 text-[10px] font-bold rounded-full">
                          <span>{language === 'ar' ? 'المادة' : language === 'ku' ? 'کەرەستە' : 'Material'}: {mat}</span>
                          <X size={10} className="cursor-pointer text-gray-400 hover:text-gray-600" onClick={() => setSelectedMaterials(prev => prev.filter(x => x !== mat))} />
                        </span>
                      ))}
                      {selectedSeasons.map(seas => (
                        <span key={seas} className="flex items-center space-x-1.5 px-3 py-1 bg-gray-100 border border-gray-200 text-gray-600 text-[10px] font-bold rounded-full">
                          <span>{language === 'ar' ? 'الموسم' : language === 'ku' ? 'وەرز' : 'Season'}: {seas}</span>
                          <X size={10} className="cursor-pointer text-gray-400 hover:text-gray-600" onClick={() => setSelectedSeasons(prev => prev.filter(x => x !== seas))} />
                        </span>
                      ))}
                      {selectedSizes.map(sz => (
                        <span key={sz} className="flex items-center space-x-1.5 px-3 py-1 bg-gray-100 border border-gray-200 text-gray-600 text-[10px] font-bold rounded-full">
                          <span>{language === 'ar' ? 'المقاس' : language === 'ku' ? 'قەبارە' : 'Size'}: {sz}</span>
                          <X size={10} className="cursor-pointer text-gray-400 hover:text-gray-600" onClick={() => setSelectedSizes(prev => prev.filter(x => x !== sz))} />
                        </span>
                      ))}
                      <button 
                        onClick={handleResetFilters}
                        className="text-[10px] font-bold uppercase tracking-wider text-[#B2AC88] hover:text-[#36454F] cursor-pointer ml-1.5"
                      >
                        {t('product.clear_all')}
                      </button>
                    </div>
                  )}
                </motion.div>
              </div>

              {/* Sidebar + Grid Layout */}
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Sidebar Sticky Filter Panel */}
                <AnimatePresence initial={false}>
                  {showFilters && (
                    <motion.aside 
                      initial={{ opacity: 0, width: 0, marginRight: 0 }}
                      animate={{ opacity: 1, width: 220, marginRight: 24 }}
                      exit={{ opacity: 0, width: 0, marginRight: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="w-full lg:w-64 shrink-0 self-start lg:sticky lg:top-28 z-20 overflow-hidden"
                    >
                      <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-xs flex flex-col space-y-4">
                        {/* Discount / Offers Section */}
                        <div className="space-y-2">
                          <div 
                            onClick={() => toggleSection('offers')} 
                            className="flex items-center justify-between cursor-pointer group select-none"
                          >
                            <h4 className="text-[11px] font-bold text-[#36454F] uppercase tracking-widest">Offers</h4>
                            <div className="flex items-center space-x-2">
                              {onlyDiscounted && (
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOnlyDiscounted(false);
                                  }}
                                  className="text-[10px] font-bold uppercase tracking-wider text-[#B2AC88] hover:text-[#36454F] cursor-pointer"
                                >
                                  Clear
                                </button>
                              )}
                              <ChevronDown 
                                size={13} 
                                className={`text-gray-400 group-hover:text-[#36454F] transition-transform duration-200 ${
                                  collapsedSections.offers ? '-rotate-90' : 'rotate-0'
                                }`} 
                              />
                            </div>
                          </div>
                          {!collapsedSections.offers && (
                            <div className="flex flex-col space-y-2">
                              <label className="flex items-center space-x-2.5 text-xs font-semibold text-[#36454F] py-0.5 cursor-pointer select-none">
                                <input 
                                  type="checkbox" 
                                  checked={onlyDiscounted}
                                  onChange={(e) => setOnlyDiscounted(e.target.checked)}
                                  className="w-4 h-4 rounded border-gray-300 text-[#B2AC88] focus:ring-[#B2AC88]" 
                                />
                                <span>Discount</span>
                              </label>
                            </div>
                          )}
                        </div>

                        {/* Gender Section */}
                        <div className="space-y-2">
                          <div 
                            onClick={() => toggleSection('gender')} 
                            className="flex items-center justify-between cursor-pointer group select-none"
                          >
                            <h4 className="text-[11px] font-bold text-[#36454F] uppercase tracking-widest">{language === 'ar' ? 'النوع' : language === 'ku' ? 'جۆری' : 'Gender'}</h4>
                            <div className="flex items-center space-x-2">
                              {selectedGender && (
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedGender('');
                                  }}
                                  className="text-[10px] font-bold uppercase tracking-wider text-[#B2AC88] hover:text-[#36454F] cursor-pointer"
                                >
                                  Clear
                                </button>
                              )}
                              <ChevronDown 
                                size={13} 
                                className={`text-gray-400 group-hover:text-[#36454F] transition-transform duration-200 ${
                                  collapsedSections.gender ? '-rotate-90' : 'rotate-0'
                                }`} 
                              />
                            </div>
                          </div>
                          {!collapsedSections.gender && (
                            <div className="flex flex-col space-y-2">
                              {['Women', 'Men', 'Kids'].map(g => (
                                <label key={g} className="flex items-center space-x-2.5 text-xs font-semibold text-[#36454F] py-0.5 cursor-pointer select-none">
                                  <input 
                                    type="checkbox" 
                                    checked={selectedGender === g}
                                    onChange={() => setSelectedGender(selectedGender === g ? '' : g)}
                                    className="w-4 h-4 rounded border-gray-300 text-[#B2AC88] focus:ring-[#B2AC88]" 
                                  />
                                  <span>{g === 'Women' ? (language === 'ar' ? 'نساء' : language === 'ku' ? 'ژن' : 'Women') : g === 'Men' ? (language === 'ar' ? 'رجال' : language === 'ku' ? 'پیاو' : 'Men') : (language === 'ar' ? 'أطفال' : language === 'ku' ? 'منداڵ' : 'Kids')}</span>
                                </label>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Promotions Section */}
                        <div className="border-b border-gray-100 pb-5 mb-5">
                          <div 
                            onClick={() => toggleSection('promotions')} 
                            className="flex items-center justify-between cursor-pointer group select-none"
                          >
                            <h4 className="text-[11px] font-bold text-[#36454F] uppercase tracking-widest">Promotions</h4>
                            <div className="flex items-center space-x-2">
                              {selectedPromotions.length > 0 && (
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedPromotions([]);
                                  }}
                                  className="text-[10px] font-bold uppercase tracking-wider text-[#B2AC88] hover:text-[#36454F] cursor-pointer"
                                >
                                  Clear
                                </button>
                              )}
                              <ChevronDown 
                                size={13} 
                                className={`text-gray-400 group-hover:text-[#36454F] transition-transform duration-200 ${
                                  collapsedSections.promotions ? '-rotate-90' : 'rotate-0'
                                }`} 
                              />
                            </div>
                          </div>
                          {!collapsedSections.promotions && (
                            <div className="flex flex-col space-y-2 mt-3 max-h-48 overflow-y-auto pr-1">
                              {promotionsList.map((promo) => (
                                <label key={promo.id} className="flex items-center space-x-2.5 text-xs font-semibold text-[#36454F] py-0.5 cursor-pointer select-none">
                                  <input 
                                    type="checkbox" 
                                    checked={selectedPromotions.includes(promo.name)}
                                    onChange={() => {
                                      if (selectedPromotions.includes(promo.name)) {
                                        setSelectedPromotions(selectedPromotions.filter(p => p !== promo.name));
                                      } else {
                                        setSelectedPromotions([...selectedPromotions, promo.name]);
                                      }
                                    }}
                                    className="w-4 h-4 rounded border-gray-300 text-[#B2AC88] focus:ring-[#B2AC88]" 
                                  />
                                  <span>{getLocalized(promo.name, language)}</span>
                                </label>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Price Range Slider Section */}
                        <div className="space-y-2">
                          <div 
                            onClick={() => toggleSection('price')} 
                            className="flex items-center justify-between cursor-pointer group select-none"
                          >
                            <h4 className="text-[11px] font-bold text-[#36454F] uppercase tracking-widest">Price</h4>
                            <div className="flex items-center space-x-2">
                              {maxPriceFilter < maxPriceOfProducts && (
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setMaxPriceFilter(maxPriceOfProducts);
                                  }}
                                  className="text-[10px] font-bold uppercase tracking-wider text-[#B2AC88] hover:text-[#36454F] cursor-pointer"
                                >
                                  Clear
                                </button>
                              )}
                              <ChevronDown 
                                size={13} 
                                className={`text-gray-400 group-hover:text-[#36454F] transition-transform duration-200 ${
                                  collapsedSections.price ? '-rotate-90' : 'rotate-0'
                                }`} 
                              />
                            </div>
                          </div>
                          {!collapsedSections.price && (
                            <div className="space-y-2">
                              <input 
                                type="range" 
                                min="250" 
                                max={maxPriceOfProducts} 
                                step="250"
                                value={maxPriceFilter}
                                onChange={(e) => setMaxPriceFilter(Number(e.target.value))}
                                className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#B2AC88] m-0 p-0"
                              />
                              <div className="flex justify-between text-[10px] font-bold text-gray-400">
                                <span>250 IQD</span>
                                <span className="text-[#36454F] font-bold bg-[#B2AC88]/10 px-2 py-0.5 rounded-md">{maxPriceFilter.toLocaleString()} IQD</span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Checkbox Color Filters Section */}
                        <div className="space-y-2">
                          <div 
                            onClick={() => toggleSection('color')} 
                            className="flex items-center justify-between cursor-pointer group select-none"
                          >
                            <h4 className="text-[11px] font-bold text-[#36454F] uppercase tracking-widest">Color</h4>
                            <div className="flex items-center space-x-2">
                              {selectedColors.length > 0 && (
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedColors([]);
                                  }}
                                  className="text-[10px] font-bold uppercase tracking-wider text-[#B2AC88] hover:text-[#36454F] cursor-pointer"
                                >
                                  Clear
                                </button>
                              )}
                              <ChevronDown 
                                size={13} 
                                className={`text-gray-400 group-hover:text-[#36454F] transition-transform duration-200 ${
                                  collapsedSections.color ? '-rotate-90' : 'rotate-0'
                                }`} 
                              />
                            </div>
                          </div>
                          {!collapsedSections.color && (
                            <div className="flex flex-col space-y-2 max-h-48 overflow-y-auto pr-1">
                              {uniqueColorFilters.map((color) => (
                                <label key={color.name} className="flex items-center space-x-2.5 text-xs font-semibold text-[#36454F] py-0.5 cursor-pointer select-none">
                                  <input 
                                    type="checkbox" 
                                    checked={selectedColors.includes(color.name)}
                                    onChange={() => {
                                      if (selectedColors.includes(color.name)) {
                                        setSelectedColors(selectedColors.filter(c => c !== color.name));
                                      } else {
                                        setSelectedColors([...selectedColors, color.name]);
                                      }
                                    }}
                                    className="w-4 h-4 rounded border-gray-300 text-[#B2AC88] focus:ring-[#B2AC88]" 
                                  />
                                  <span 
                                    className={`w-3 h-3 rounded-full border border-gray-200/50 ${color.class}`} 
                                    style={getColorStyle(color.class)}
                                  />
                                  <span className="capitalize">{color.name}</span>
                                </label>
                              ))}
                            </div>
                          )}
                        </div>

                         {/* Size Collection Section */}
                        {sizesList.length > 0 && (
                          <div className="space-y-2">
                            <div 
                              onClick={() => toggleSection('size')} 
                              className="flex items-center justify-between cursor-pointer group select-none"
                            >
                              <h4 className="text-[11px] font-bold text-[#36454F] uppercase tracking-widest">Size Collection</h4>
                              <div className="flex items-center space-x-2">
                                {selectedSizes.length > 0 && (
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedSizes([]);
                                    }}
                                    className="text-[10px] font-bold uppercase tracking-wider text-[#B2AC88] hover:text-[#36454F] cursor-pointer"
                                  >
                                    Clear
                                  </button>
                                )}
                                <ChevronDown 
                                  size={13} 
                                  className={`text-gray-400 group-hover:text-[#36454F] transition-transform duration-200 ${
                                    collapsedSections.size ? '-rotate-90' : 'rotate-0'
                                  }`} 
                                />
                              </div>
                            </div>
                            {!collapsedSections.size && (
                              <div className="flex flex-col space-y-2 max-h-48 overflow-y-auto pr-1">
                                {sizesList.map((sz) => (
                                  <label key={sz.id} className="flex items-center space-x-2.5 text-xs font-semibold text-[#36454F] py-0.5 cursor-pointer select-none">
                                    <input 
                                      type="checkbox" 
                                      checked={selectedSizes.includes(sz.name)}
                                      onChange={() => {
                                        if (selectedSizes.includes(sz.name)) {
                                          setSelectedSizes(selectedSizes.filter(x => x !== sz.name));
                                        } else {
                                          setSelectedSizes([...selectedSizes, sz.name]);
                                        }
                                      }}
                                      className="w-4 h-4 rounded border-gray-300 text-[#B2AC88] focus:ring-[#B2AC88]" 
                                    />
                                    <span>{getLocalized(sz.name, language)}</span>
                                  </label>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Styles / Lengths Section */}
                        {stylesList.length > 0 && (
                          <div className="space-y-2">
                            <div 
                              onClick={() => toggleSection('style')} 
                              className="flex items-center justify-between cursor-pointer group select-none"
                            >
                              <h4 className="text-[11px] font-bold text-[#36454F] uppercase tracking-widest">Style / Length</h4>
                              <div className="flex items-center space-x-2">
                                {selectedStyles.length > 0 && (
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedStyles([]);
                                    }}
                                    className="text-[10px] font-bold uppercase tracking-wider text-[#B2AC88] hover:text-[#36454F] cursor-pointer"
                                  >
                                    Clear
                                  </button>
                                )}
                                <ChevronDown 
                                  size={13} 
                                  className={`text-gray-400 group-hover:text-[#36454F] transition-transform duration-200 ${
                                    collapsedSections.style ? '-rotate-90' : 'rotate-0'
                                  }`} 
                                />
                              </div>
                            </div>
                            {!collapsedSections.style && (
                              <div className="flex flex-col space-y-2 max-h-48 overflow-y-auto pr-1">
                                {stylesList.map((st) => (
                                  <label key={st.id} className="flex items-center space-x-2.5 text-xs font-semibold text-[#36454F] py-0.5 cursor-pointer select-none">
                                    <input 
                                      type="checkbox" 
                                      checked={selectedStyles.includes(st.name)}
                                      onChange={() => {
                                        if (selectedStyles.includes(st.name)) {
                                          setSelectedStyles(selectedStyles.filter(x => x !== st.name));
                                        } else {
                                          setSelectedStyles([...selectedStyles, st.name]);
                                        }
                                      }}
                                      className="w-4 h-4 rounded border-gray-300 text-[#B2AC88] focus:ring-[#B2AC88]" 
                                    />
                                    <span>{getLocalized(st.name, language)}</span>
                                  </label>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Materials Section */}
                        {materialsList.length > 0 && (
                          <div className="space-y-2">
                            <div 
                              onClick={() => toggleSection('material')} 
                              className="flex items-center justify-between cursor-pointer group select-none"
                            >
                              <h4 className="text-[11px] font-bold text-[#36454F] uppercase tracking-widest">Material</h4>
                              <div className="flex items-center space-x-2">
                                {selectedMaterials.length > 0 && (
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedMaterials([]);
                                    }}
                                    className="text-[10px] font-bold uppercase tracking-wider text-[#B2AC88] hover:text-[#36454F] cursor-pointer"
                                  >
                                    Clear
                                  </button>
                                )}
                                <ChevronDown 
                                  size={13} 
                                  className={`text-gray-400 group-hover:text-[#36454F] transition-transform duration-200 ${
                                    collapsedSections.material ? '-rotate-90' : 'rotate-0'
                                  }`} 
                                />
                              </div>
                            </div>
                            {!collapsedSections.material && (
                              <div className="flex flex-col space-y-2 max-h-48 overflow-y-auto pr-1">
                                {materialsList.map((mat) => (
                                  <label key={mat.id} className="flex items-center space-x-2.5 text-xs font-semibold text-[#36454F] py-0.5 cursor-pointer select-none">
                                    <input 
                                      type="checkbox" 
                                      checked={selectedMaterials.includes(mat.name)}
                                      onChange={() => {
                                        if (selectedMaterials.includes(mat.name)) {
                                          setSelectedMaterials(selectedMaterials.filter(x => x !== mat.name));
                                        } else {
                                          setSelectedMaterials([...selectedMaterials, mat.name]);
                                        }
                                      }}
                                      className="w-4 h-4 rounded border-gray-300 text-[#B2AC88] focus:ring-[#B2AC88]" 
                                    />
                                    <span>{getLocalized(mat.name, language)}</span>
                                  </label>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Seasonal Type Section */}
                        {seasonsList.length > 0 && (
                          <div className="space-y-2">
                            <div 
                              onClick={() => toggleSection('season')} 
                              className="flex items-center justify-between cursor-pointer group select-none"
                            >
                              <h4 className="text-[11px] font-bold text-[#36454F] uppercase tracking-widest">Seasonal Type</h4>
                              <div className="flex items-center space-x-2">
                                {selectedSeasons.length > 0 && (
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedSeasons([]);
                                    }}
                                    className="text-[10px] font-bold uppercase tracking-wider text-[#B2AC88] hover:text-[#36454F] cursor-pointer"
                                  >
                                    Clear
                                  </button>
                                )}
                                <ChevronDown 
                                  size={13} 
                                  className={`text-gray-400 group-hover:text-[#36454F] transition-transform duration-200 ${
                                    collapsedSections.season ? '-rotate-90' : 'rotate-0'
                                  }`} 
                                />
                              </div>
                            </div>
                            {!collapsedSections.season && (
                              <div className="flex flex-col space-y-2 max-h-48 overflow-y-auto pr-1">
                                {seasonsList.map((seas) => (
                                  <label key={seas.id} className="flex items-center space-x-2.5 text-xs font-semibold text-[#36454F] py-0.5 cursor-pointer select-none">
                                    <input 
                                      type="checkbox" 
                                      checked={selectedSeasons.includes(seas.name)}
                                      onChange={() => {
                                        if (selectedSeasons.includes(seas.name)) {
                                          setSelectedSeasons(selectedSeasons.filter(x => x !== seas.name));
                                        } else {
                                          setSelectedSeasons([...selectedSeasons, seas.name]);
                                        }
                                      }}
                                      className="w-4 h-4 rounded border-gray-300 text-[#B2AC88] focus:ring-[#B2AC88]" 
                                    />
                                    <span>{getLocalized(seas.name, language)}</span>
                                  </label>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Design Section */}
                        {designsList.length > 0 && (
                          <div className="space-y-2">
                            <div
                              onClick={() => toggleSection('design')}
                              className="flex items-center justify-between cursor-pointer group select-none"
                            >
                              <h4 className="text-[11px] font-bold text-[#36454F] uppercase tracking-widest">
                                {language === 'ar' ? 'التصميم' : language === 'ku' ? 'دیزاین' : 'Design'}
                              </h4>
                              <div className="flex items-center space-x-2">
                                {selectedDesigns.length > 0 && (
                                  <button
                                    onClick={(e) => { e.stopPropagation(); setSelectedDesigns([]); }}
                                    className="text-[10px] font-bold uppercase tracking-wider text-[#B2AC88] hover:text-[#36454F] cursor-pointer"
                                  >
                                    Clear
                                  </button>
                                )}
                                <ChevronDown
                                  size={13}
                                  className={`text-gray-400 group-hover:text-[#36454F] transition-transform duration-200 ${collapsedSections.design ? '-rotate-90' : 'rotate-0'}`}
                                />
                              </div>
                            </div>
                            {!collapsedSections.design && (
                              <div className="flex flex-col space-y-2 max-h-48 overflow-y-auto pr-1">
                                {designsList.map((d) => (
                                  <label key={d.id || d.name} className="flex items-center space-x-2.5 text-xs font-semibold text-[#36454F] py-0.5 cursor-pointer select-none">
                                    <input
                                      type="checkbox"
                                      checked={selectedDesigns.includes(d.name)}
                                      onChange={() => {
                                        if (selectedDesigns.includes(d.name)) {
                                          setSelectedDesigns(selectedDesigns.filter(x => x !== d.name));
                                        } else {
                                          setSelectedDesigns([...selectedDesigns, d.name]);
                                        }
                                      }}
                                      className="w-4 h-4 rounded border-gray-300 text-[#B2AC88] focus:ring-[#B2AC88]"
                                    />
                                    <span>{getLocalized(d.name, language)}</span>
                                  </label>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Sport Type Section */}
                        {sportTypesList.length > 0 && (
                          <div className="space-y-2">
                            <div
                              onClick={() => toggleSection('sportType')}
                              className="flex items-center justify-between cursor-pointer group select-none"
                            >
                              <h4 className="text-[11px] font-bold text-[#36454F] uppercase tracking-widest">
                                {language === 'ar' ? 'نوع الرياضة' : language === 'ku' ? 'جۆری وەرزش' : 'Sport Type'}
                              </h4>
                              <div className="flex items-center space-x-2">
                                {selectedSportTypes.length > 0 && (
                                  <button
                                    onClick={(e) => { e.stopPropagation(); setSelectedSportTypes([]); }}
                                    className="text-[10px] font-bold uppercase tracking-wider text-[#B2AC88] hover:text-[#36454F] cursor-pointer"
                                  >
                                    Clear
                                  </button>
                                )}
                                <ChevronDown
                                  size={13}
                                  className={`text-gray-400 group-hover:text-[#36454F] transition-transform duration-200 ${collapsedSections.sportType ? '-rotate-90' : 'rotate-0'}`}
                                />
                              </div>
                            </div>
                            {!collapsedSections.sportType && (
                              <div className="flex flex-col space-y-2 max-h-48 overflow-y-auto pr-1">
                                {sportTypesList.map((sp) => (
                                  <label key={sp.id || sp.name} className="flex items-center space-x-2.5 text-xs font-semibold text-[#36454F] py-0.5 cursor-pointer select-none">
                                    <input
                                      type="checkbox"
                                      checked={selectedSportTypes.includes(sp.name)}
                                      onChange={() => {
                                        if (selectedSportTypes.includes(sp.name)) {
                                          setSelectedSportTypes(selectedSportTypes.filter(x => x !== sp.name));
                                        } else {
                                          setSelectedSportTypes([...selectedSportTypes, sp.name]);
                                        }
                                      }}
                                      className="w-4 h-4 rounded border-gray-300 text-[#B2AC88] focus:ring-[#B2AC88]"
                                    />
                                    <span>{getLocalized(sp.name, language)}</span>
                                  </label>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                      </div>
                    </motion.aside>
                  )}
                </AnimatePresence>

                {/* Right Area - Grid Content */}
                <div className="flex-1 flex flex-col space-y-6">
                  {loading ? (
                    <div className="py-24 text-center">
                      <div className="w-8 h-8 border-4 border-[#B2AC88] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                      <p className="text-sm text-gray-500 font-semibold">Loading product catalog...</p>
                    </div>
                  ) : (
                    <>
                      <motion.div 
                        key={currentPage}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.35, ease: 'easeOut' }}
                        className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3 md:gap-x-6 gap-y-8 md:gap-y-14"
                      >
                        <AnimatePresence mode="popLayout">
                          {paginatedProducts.map((product, index) => {
                            return (
                              <ProductCard
                                key={product.id}
                                product={product}
                                index={index}
                                cart={cart}
                                likedProducts={likedProducts}
                                onAddToCart={handleAddToCartClick}
                                onRemoveFromCart={handleRemoveFromCartClick}
                                onToggleWishlist={handleToggleWishlistClick}
                                onProductClick={handleCardClick}
                                t={t}
                                onStoreClick={onStoreClick}
                              />
                            );
                          })}
                        </AnimatePresence>
                      </motion.div>

                      {/* Pagination Controls */}
                      {filteredProducts.length > 16 && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: false, amount: 0.5 }}
                          transition={{ duration: 0.4, ease: 'easeOut' }}
                          className="flex flex-col items-center justify-center space-y-4 mt-12"
                        >
                          <div className="text-xs text-gray-500 font-medium font-sans select-none">
                            Showing {currentPage * 16 + 1} to {Math.min(filteredProducts.length, (currentPage + 1) * 16)} of {filteredProducts.length} items — Page {currentPage + 1} of {pageCount}
                          </div>
                          
                          <div className="flex items-center justify-center space-x-4">
                            {/* Prev Button */}
                            <button
                              type="button"
                              disabled={currentPage === 0}
                              onClick={() => {
                                setCurrentPage(prev => Math.max(0, prev - 1));
                                window.scrollTo(0, 0);
                              }}
                              className="p-1.5 border border-[#C08081] text-[#C08081] hover:bg-[#C08081]/10 disabled:opacity-30 disabled:cursor-not-allowed rounded-full transition-all cursor-pointer flex items-center justify-center"
                              aria-label="Previous Page"
                            >
                              <ChevronLeft size={16} />
                            </button>

                            {/* Dots */}
                            <div className="flex items-center space-x-2.5">
                              {(() => {
                                let startIdx = Math.max(0, currentPage - 2);
                                let endIdx = Math.min(pageCount - 1, startIdx + 4);
                                if (endIdx - startIdx < 4) startIdx = Math.max(0, endIdx - 4);
                                const idxs = [];
                                for (let p = startIdx; p <= endIdx; p++) idxs.push(p);
                                return idxs.map((i) => {
                                  const isActive = currentPage === i;
                                  return (
                                    <button
                                      key={i}
                                      onClick={() => {
                                        setCurrentPage(i);
                                        window.scrollTo(0, 0);
                                      }}
                                      className={`w-2.5 h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                                        isActive 
                                          ? 'bg-[#C08081] scale-110 shadow-xs' 
                                          : 'border border-[#C08081] bg-transparent hover:bg-[#C08081]/15'
                                      }`}
                                      aria-label={`Go to page ${i + 1}`}
                                    />
                                  );
                                });
                              })()}
                            </div>

                            {/* Next Button */}
                            <button
                              type="button"
                              disabled={currentPage === pageCount - 1}
                              onClick={() => {
                                setCurrentPage(prev => Math.min(pageCount - 1, prev + 1));
                                window.scrollTo(0, 0);
                              }}
                              className="p-1.5 border border-[#C08081] text-[#C08081] hover:bg-[#C08081]/10 disabled:opacity-30 disabled:cursor-not-allowed rounded-full transition-all cursor-pointer flex items-center justify-center"
                              aria-label="Next Page"
                            >
                              <ChevronRight size={16} />
                            </button>
                          </div>
                        </motion.div>
                      )}

                      {/* Empty Search State */}
                      {filteredProducts.length === 0 && (
                        <motion.div 
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex flex-col items-center justify-center py-24 text-center bg-white/60 backdrop-blur-md rounded-3xl border border-gray-100"
                        >
                          <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-xs border border-gray-100 mb-4">
                             <Search className="text-gray-400" size={24} />
                          </div>
                          <h3 className="text-md font-bold text-[#36454F] uppercase tracking-wider">No products found</h3>
                          <p className="text-xs text-gray-500 mt-1 max-w-xs leading-relaxed">
                            We couldn't find any socks matching your search criteria. Try modifying your filters or clear all values.
                          </p>
                          <button 
                            onClick={handleResetFilters}
                            className="mt-6 px-6 py-2.5 bg-[#B2AC88] hover:bg-[#36454F] text-white text-[10px] font-bold uppercase tracking-wider rounded-full transition-colors cursor-pointer shadow-sm active:scale-95"
                          >
                            Clear All Filters
                          </button>
                        </motion.div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          ) : (
            /* Premium Animated Product Detail Screen */
            <motion.div
              key="detail"
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -60 }}
              transition={{ type: "spring", stiffness: 350, damping: 26 }}
              className="bg-white border border-gray-100 rounded-3xl p-6 md:p-12 shadow-md relative overflow-hidden font-sans text-brand-charcoal"
            >
              
              {/* Top back navigation */}
              <button
                onClick={() => {
                  if (initialViewingProduct) {
                    onBackToHome();
                  } else {
                    setViewingProduct(null);
                  }
                }}
                className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-[#B2AC88] hover:text-[#36454F] transition-colors mb-8 cursor-pointer group"
              >
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform duration-300" />
                <span>
                  {initialViewingProduct
                    ? (previousView === 'wishlist' ? 'Back to Wishlist' : previousView === 'cart' ? 'Back to Your Cart' : previousView === 'story' ? 'Back to Our Story' : previousView === 'contact' ? 'Back to Contact' : 'Back to Home')
                    : 'Back to Catalog'}
                </span>
              </button>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                
                {/* Left Side: Dynamic Image Gallery */}
                <div className="lg:col-span-5 flex flex-col items-center">
                  <motion.div 
                    layoutId={`img-box-${viewingProduct.id}`}
                    className={`w-full aspect-[3/4] rounded-2xl relative shadow-md flex items-center justify-center border border-gray-50 overflow-hidden ${
                      (viewingProduct.image || viewingProduct.image_url) ? 'bg-gray-50' : (viewingProduct.bgFallback || 'bg-brand-beige')
                    }`}
                  >
                    {/* Glowing highlight ring based on selected active color */}
                    <div className="absolute inset-0 border-[6px] border-white/95 rounded-2xl pointer-events-none z-10" />

                    {detailActiveImage ? (
                      <div className="w-full h-full relative">
                        <img src={getProductImage(detailActiveImage)} 
                          alt={getLocalized(viewingProduct.name, language)} 
                          className="w-full h-full object-contain transition-transform duration-500 hover:scale-105" onError={(e) => { e.target.onerror = null; e.target.src = '/categories/cat1.jpg'; }} />
                        {detailSelectedColor && (
                          <div 
                            className="absolute inset-0 pointer-events-none z-2 opacity-50"
                            style={{
                              ...getColorStyle(detailSelectedColor),
                              mixBlendMode: 'color'
                            }}
                          />
                        )}
                      </div>
                    ) : (
                      <span className="text-[#36454F]/20 font-serif text-3xl font-bold tracking-widest uppercase rotate-[-20deg]">
                        {getLocalized(viewingProduct.category, language)}
                      </span>
                    )}

                    {parseJsonArray(viewingProduct.badge).filter(Boolean).filter(b => String(b).toLowerCase() !== 'sale').length > 0 && (
                      <span className="absolute top-4 left-4 z-10 text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 bg-[#36454F] text-white rounded-full">
                        {parseJsonArray(viewingProduct.badge).filter(Boolean).filter(b => String(b).toLowerCase() !== 'sale').join(', ')}
                      </span>
                    )}
                  </motion.div>


                </div>

                {/* Right Side: Product Details & Purchase Form */}
                <div className="lg:col-span-7 flex flex-col">
                  
                  {/* Product Name only - category label removed */}
                  <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#36454F] italic leading-tight mb-2">
                    {getLocalized(viewingProduct.name, language)}
                  </h2>
                  <div className="flex items-center gap-2 flex-wrap mb-4">
                    <p 
                      className={`text-xs font-bold text-[#B2AC88] tracking-wider uppercase ${viewingProduct.vendor_name ? 'cursor-pointer hover:text-[#36454F] transition-colors' : ''}`}
                      onClick={() => viewingProduct.vendor_name && onStoreClick && onStoreClick(viewingProduct.vendor_name)}
                    >
                      {viewingProduct.vendor_name 
                        ? t('vendor_dashboard.sold_by', { vendor: getCleanVendorName(viewingProduct.vendor_name, language) }) 
                        : t('vendor_dashboard.platform_store')}
                    </p>
                  </div>

                  {/* Localized Price with Discount Support */}
                  <div className="flex items-center space-x-3 mb-6">
                    {viewingProduct.discount > 0 ? (
                      <>
                        <span className="text-2xl font-bold text-[#36454F]">
                          {Math.round(viewingProduct.price * (1 - viewingProduct.discount / 100)).toLocaleString()} IQD
                        </span>
                        <span className="text-sm font-semibold line-through text-gray-400">
                          {viewingProduct.price.toLocaleString()} IQD
                        </span>
                        <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                          {viewingProduct.discount}% OFF
                        </span>
                      </>
                    ) : (
                      <span className="text-2xl font-bold text-[#36454F]">
                        {viewingProduct.price.toLocaleString()} IQD
                      </span>
                    )}
                  </div>

                  {/* Description — directly under the price */}
                  {(viewingProduct.description || viewingProduct.desc) && (
                    <p className="text-sm text-gray-500 leading-relaxed max-w-xl mb-6">
                      {getLocalized(viewingProduct.description || viewingProduct.desc, language)}
                    </p>
                  )}

                  {/* Specifications Table */}
                  <div className="border border-gray-200 rounded-2xl overflow-hidden mb-6 text-sm text-[#36454F]">
                    {/* Gender */}
                    {viewingProduct.gender && (
                      <div className="flex items-center px-5 py-3.5 border-b border-gray-100 hover:bg-gray-50/60 transition-colors">
                        <span className="w-36 font-medium text-gray-400 shrink-0">
                          {language === 'ar' ? 'النوع' : language === 'ku' ? 'جۆری رەگەز' : 'Gender'}
                        </span>
                        <span className="font-semibold">
                          {getLocalizedGender(viewingProduct.gender, language)}
                        </span>
                      </div>
                    )}
                    {/* Category */}
                    <div className="flex items-center px-5 py-3.5 border-b border-gray-100 hover:bg-gray-50/60 transition-colors">
                      <span className="w-36 font-medium text-gray-400 shrink-0">
                        {language === 'ar' ? 'التصنيف' : language === 'ku' ? 'پۆلێن' : 'Category'}
                      </span>
                      <span className="font-semibold">
                        {parseJsonArray(viewingProduct.category).map(cat => getLocalized(cat, language)).filter(Boolean).join(', ') || 'General'}
                      </span>
                    </div>
                    {/* Style / Length */}
                    <div className="flex items-center px-5 py-3.5 border-b border-gray-100 hover:bg-gray-50/60 transition-colors">
                      <span className="w-36 font-medium text-gray-400 shrink-0">
                        {language === 'ar' ? 'الموديل / الطول' : language === 'ku' ? 'شێواز / درێژی' : 'Style / Length'}
                      </span>
                      <span className="font-semibold">
                        {parseJsonArray(viewingProduct.style_length).map(st => getLocalized(st, language)).join(', ') || 'Standard'}
                      </span>
                    </div>
                    {/* Material */}
                    <div className="flex items-center px-5 py-3.5 border-b border-gray-100 hover:bg-gray-50/60 transition-colors">
                      <span className="w-36 font-medium text-gray-400 shrink-0">
                        {language === 'ar' ? 'المادة' : language === 'ku' ? 'کەرەستە' : 'Material'}
                      </span>
                      <span className="font-semibold">
                        {parseJsonArray(viewingProduct.material).map(mat => getLocalized(mat, language)).join(', ') || 'Cotton blend'}
                      </span>
                    </div>
                    {/* Seasonal Type */}
                    <div className={`flex items-center px-5 py-3.5 hover:bg-gray-50/60 transition-colors ${parseJsonArray(viewingProduct.promotion).filter(p => p !== 'None' && p !== '').length > 0 ? 'border-b border-gray-100' : ''}`}>
                      <span className="w-36 font-medium text-gray-400 shrink-0">
                        {language === 'ar' ? 'النوع الموسمي' : language === 'ku' ? 'جۆری وەرزی' : 'Seasonal Type'}
                      </span>
                      <span className="font-semibold">
                        {parseJsonArray(viewingProduct.seasonal_type).map(seas => getLocalized(seas, language)).join(', ') || 'All Season'}
                      </span>
                    </div>
                    {parseJsonArray(viewingProduct.promotion).filter(p => p !== 'None' && p !== '').length > 0 && (
                      <div className="flex items-center px-5 py-3.5 bg-[#B2AC88]/8 hover:bg-[#B2AC88]/12 transition-colors">
                        <span className="w-36 text-[11px] font-bold uppercase tracking-wider text-[#B2AC88] shrink-0">
                          {language === 'ar' ? 'العرض النشط' : language === 'ku' ? 'داشکاندنی چالاک' : 'Active Promo'}
                        </span>
                        <span className="font-bold text-[#36454F]">
                          {parseJsonArray(viewingProduct.promotion).map(promo => getLocalized(promo, language)).filter(p => p !== 'None' && p !== '').join(', ')}
                        </span>
                      </div>
                    )}
                  </div>



                  {/* Form fields */}
                  <div className="space-y-6">
                    
                    {/* Size & Color Selectors */}
                    {(() => {
                      const variants = (() => {
                        try {
                          if (typeof viewingProduct.color_variants === 'string') {
                            return JSON.parse(viewingProduct.color_variants);
                          }
                          return viewingProduct.color_variants || [];
                        } catch(e) {
                          return [];
                        }
                      })();
                      const hasVariants = variants.length > 0;

                      if (hasVariants) {
                        const availableColorClasses = variants.map(v => v.color?.class).filter(Boolean);
                        
                        const selectedVariant = detailSelectedColor
                          ? variants.find(v => v.color && v.color.class === detailSelectedColor)
                          : null;
                        const sizeOptions = selectedVariant
                          ? Object.keys(selectedVariant.stock || {})
                          : [...new Set(variants.flatMap(v => Object.keys(v.stock || {})))];

                        const sizesForSelectedColor = selectedVariant
                          ? Object.keys(selectedVariant.stock || {})
                          : [...new Set(variants.flatMap(v => Object.keys(v.stock || {})))];

                        return (
                          <>
                            {/* Size Selector */}
                            {sizeOptions.length > 0 && (
                              <div>
                                <div className="flex justify-between text-xs font-bold uppercase tracking-wider mb-2.5 font-sans">
                                  <span className="text-gray-400">Select Size</span>
                                  {detailSelectedSize && <span className="text-[#36454F] font-semibold">{detailSelectedSize}</span>}
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {sizeOptions.map((size) => {
                                    const isAvailable = !detailSelectedColor || sizesForSelectedColor.includes(size);
                                    return (
                                      <button
                                        key={size}
                                        type="button"
                                        onClick={() => {
                                          setDetailSelectedSize(size);
                                        }}
                                        className={`px-4 py-1.5 rounded-full text-xs font-bold border cursor-pointer transition-all ${
                                          !isAvailable
                                            ? 'opacity-30 cursor-not-allowed border-gray-100 bg-gray-50 text-gray-400'
                                            : detailSelectedSize === size
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

                            {/* Color Swatches */}
                            {availableColorClasses.length > 0 && (
                              <div>
                                <div className="flex justify-between text-xs font-bold uppercase tracking-wider mb-2.5 font-sans">
                                  <span className="text-gray-400">Select Color</span>
                                  {detailSelectedColor && (
                                    <span className="text-[#36454F] font-semibold">
                                      {(() => {
                                        const match = variants.find(v => v.color && v.color.class === detailSelectedColor);
                                        return match ? match.color.name : detailSelectedColor;
                                      })()}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center flex-wrap gap-3">
                                  {variants.map((v, idx) => {
                                    if (!v.color) return null;
                                    const colorClass = v.color.class;
                                    return (
                                      <button
                                        key={idx}
                                        onClick={() => {
                                          setDetailSelectedColor(colorClass);
                                          const variantSizes = Object.keys(v.stock || {});
                                          if (variantSizes.length > 0) {
                                            if (!variantSizes.includes(detailSelectedSize)) {
                                              setDetailSelectedSize(variantSizes[0]);
                                            }
                                          }
                                        }}
                                        style={getColorStyle(colorClass)}
                                        className={`w-8 h-8 rounded-full border relative flex items-center justify-center transition-transform cursor-pointer hover:scale-110 active:scale-90 ${colorClass.startsWith('#') ? '' : colorClass} ${
                                          detailSelectedColor === colorClass
                                            ? 'ring-2 ring-offset-2 ring-[#B2AC88] border-transparent'
                                            : 'border-gray-200'
                                        }`}
                                      >
                                        {detailSelectedColor === colorClass && <Check size={14} className="text-white mix-blend-difference" />}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </>
                        );
                      }

                      const sizeColorMap = (() => { try { return JSON.parse(viewingProduct.size_colors || '{}'); } catch(e) { return {}; } })();
                      const hasSizeColors = Object.keys(sizeColorMap).length > 0;
                      const parsedSizes = parseJsonArray(viewingProduct.size_collection).filter(s => s && s !== 'One Size');
                      const sizeOptions = parsedSizes.length > 0 ? parsedSizes : ['EU 36-40', 'EU 41-45', 'Free Size'];
                      const availableColorClasses = detailSelectedSize && sizeColorMap[detailSelectedSize]
                        ? sizeColorMap[detailSelectedSize]
                        : (viewingProduct.colors && viewingProduct.colors.length > 0 ? viewingProduct.colors : ['bg-[#C08081]', 'bg-[#B2AC88]', 'bg-[#F5F5DC]', 'bg-[#36454F]']);
                      const sizesForSelectedColor = detailSelectedColor
                        ? sizeOptions.filter(size => (sizeColorMap[size] || []).includes(detailSelectedColor))
                        : sizeOptions;
                      return (
                        <>
                          {/* Size Selector */}
                          {sizeOptions.length > 0 && (
                            <div>
                              <div className="flex justify-between text-xs font-bold uppercase tracking-wider mb-2.5 font-sans">
                                <span className="text-gray-400">Select Size</span>
                                {detailSelectedSize && <span className="text-[#36454F] font-semibold">{detailSelectedSize}</span>}
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {sizeOptions.map((size) => {
                                  const isAvailable = !detailSelectedColor || sizesForSelectedColor.includes(size);
                                  return (
                                    <button
                                      key={size}
                                      type="button"
                                      onClick={() => {
                                        setDetailSelectedSize(size);
                                        if (detailSelectedColor && sizeColorMap[size] && !sizeColorMap[size].includes(detailSelectedColor)) {
                                          setDetailSelectedColor(null);
                                        }
                                      }}
                                      className={`px-4 py-1.5 rounded-full text-xs font-bold border cursor-pointer transition-all ${
                                        !isAvailable
                                          ? 'opacity-30 cursor-not-allowed border-gray-100 bg-gray-50 text-gray-400'
                                          : detailSelectedSize === size
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

                          {/* Color Swatches */}
                          {availableColorClasses.length > 0 && (
                            <div>
                              <div className="flex justify-between text-xs font-bold uppercase tracking-wider mb-2.5 font-sans">
                                <span className="text-gray-400">Select Color</span>
                                {detailSelectedColor && (
                                  <span className="text-[#36454F] font-semibold">
                                    {viewingProduct.colorNames
                                      ? viewingProduct.colorNames[viewingProduct.colors ? viewingProduct.colors.indexOf(detailSelectedColor) : -1]
                                      : detailSelectedColor}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center flex-wrap gap-3">
                                {(viewingProduct.colors || []).filter(colorClass => availableColorClasses.includes(colorClass)).map((colorClass, idx) => {
                                  return (
                                    <button
                                      key={idx}
                                      onClick={() => {
                                        setDetailSelectedColor(colorClass);
                                        if (!detailSelectedSize && hasSizeColors) {
                                          const firstSize = sizeOptions.find(s => (sizeColorMap[s] || []).includes(colorClass));
                                          if (firstSize) setDetailSelectedSize(firstSize);
                                        }
                                      }}
                                      style={getColorStyle(colorClass)}
                                      className={`w-8 h-8 rounded-full border relative flex items-center justify-center transition-transform cursor-pointer hover:scale-110 active:scale-90 ${colorClass.startsWith('#') ? '' : colorClass} ${
                                        detailSelectedColor === colorClass
                                          ? 'ring-2 ring-offset-2 ring-[#B2AC88] border-transparent'
                                          : 'border-gray-200'
                                      }`}
                                    >
                                      {detailSelectedColor === colorClass && <Check size={14} className="text-white mix-blend-difference" />}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </>
                      );
                    })()}


                    {/* Inline validation error */}
                    {detailValidationError && (
                      <div className="flex items-center gap-2 text-red-500 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 text-xs font-bold font-sans">
                        <span className="w-2 h-2 rounded-full bg-red-500 shrink-0 animate-pulse" />
                        {detailValidationError}
                      </div>
                    )}

                    {/* Stock Alert - only shown when out of stock or low stock */}
                    <div>
                      {(() => {
                        const variants = (() => {
                          try {
                            if (typeof viewingProduct.color_variants === 'string') {
                              return JSON.parse(viewingProduct.color_variants);
                            }
                            return viewingProduct.color_variants || [];
                          } catch(e) {
                            return [];
                          }
                        })();
                        const hasVariants = variants.length > 0;
                        
                        let currentStock = viewingProduct.stock;
                        if (hasVariants) {
                          if (detailSelectedColor && detailSelectedSize) {
                            const match = variants.find(v => v.color && v.color.class === detailSelectedColor);
                            currentStock = match && match.stock ? (parseInt(match.stock[detailSelectedSize]) || 0) : 0;
                          } else {
                            currentStock = variants.reduce((sum, v) => sum + Object.values(v.stock || {}).reduce((s, val) => s + (parseInt(val) || 0), 0), 0);
                          }
                        }

                        if (currentStock === undefined) return null;
                        
                        return currentStock === 0 ? (
                          <div className="bg-red-50 border border-red-200/40 text-red-600 rounded-2xl p-4 text-xs font-bold flex items-center space-x-2.5 font-sans animate-fade-in">
                            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                            <span>Out of Stock — Temporarily Unavailable</span>
                          </div>
                        ) : currentStock <= 6 ? (
                          <div className="bg-amber-50 border border-amber-200/40 text-amber-700 rounded-2xl p-4 text-xs font-bold flex items-center space-x-2.5 font-sans animate-fade-in">
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
                            <span>Only {currentStock} pairs left in stock! Order soon.</span>
                          </div>
                        ) : null;
                      })()}
                    </div>

                    {/* Quantity & CTA Addition */}
                    <div className="flex flex-col space-y-3 pt-2">
                      
                      {/* Quantity counter */}
                      <div className="flex items-center justify-between border border-gray-200 rounded-full w-32 p-1 shrink-0 bg-white">
                        <button
                          type="button"
                          disabled={viewingProduct.stock === 0}
                          onClick={() => setDetailQuantity(prev => Math.max(1, prev - 1))}
                          className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 cursor-pointer transition-colors active:scale-90 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="font-bold text-sm text-[#36454F] select-none min-w-[20px] text-center">
                          {viewingProduct.stock === 0 ? 0 : detailQuantity}
                        </span>
                        <button
                          type="button"
                          disabled={viewingProduct.stock === 0 || detailQuantity >= (viewingProduct.stock || 10)}
                          onClick={() => setDetailQuantity(prev => Math.min(viewingProduct.stock || 10, prev + 1))}
                          className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 cursor-pointer transition-colors active:scale-90 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      {/* Add to Cart + Heart — always side by side */}
                      <div className="flex items-center gap-3">
                        {/* Add to Cart CTA Button */}
                        {(() => {
                          let buttonBgClass = '';
                          let buttonText = 'Add to Cart';

                          if (viewingProduct.stock === 0) {
                            buttonBgClass = 'bg-gray-200 border border-gray-300 text-gray-400 cursor-not-allowed shadow-none hover:bg-gray-200';
                            buttonText = 'Out of Stock';
                          } else {
                            buttonBgClass = 'bg-[#36454F] hover:bg-[#B2AC88]';
                          }

                          return (
                            <motion.button
                              type="button"
                              disabled={viewingProduct.stock === 0}
                              onClick={handleDetailAdd}
                              whileHover={viewingProduct.stock === 0 ? {} : { scale: 1.03 }}
                              whileTap={viewingProduct.stock === 0 ? {} : { scale: 0.97 }}
                              className={`flex-grow py-3.5 px-8 text-white font-bold text-xs uppercase tracking-wider rounded-full shadow-md flex items-center justify-center space-x-2.5 cursor-pointer transition-all duration-300 ${buttonBgClass}`}
                            >
                              <ShoppingBag size={16} />
                              <span>{buttonText}</span>
                            </motion.button>
                          );
                        })()}

                        {/* Toggle Wishlist Heart Button */}
                        <button
                          type="button"
                          onClick={() => onToggleWishlist(viewingProduct.id)}
                          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer shrink-0 hover:scale-105 active:scale-95 ${
                            likedProducts.includes(viewingProduct.id)
                              ? 'bg-[#C08081] border border-[#C08081] text-white hover:bg-[#C08081]/90 shadow-sm'
                              : 'bg-white border border-gray-200 text-gray-450 hover:border-[#C08081] hover:bg-[#C08081]/5'
                          }`}
                        >
                          <Heart 
                            size={18} 
                            className={likedProducts.includes(viewingProduct.id) ? "fill-white text-white" : "text-gray-450 hover:text-[#C08081]"}
                          />
                        </button>
                      </div>
                    </div>

                  </div>



                </div>

              </div>

              {/* You Might Also Like */}
              {(() => {
                const allRelated = filteredProducts.filter(p => p.id !== viewingProduct.id).slice(0, 6);
                if (allRelated.length === 0) return null;
                
                const itemsPerPage = windowWidth < 640 ? 2 : 4;
                
                const maxIndex = Math.max(0, allRelated.length - itemsPerPage);
                const safeIndex = Math.min(relatedPage, maxIndex);
                const visibleItems = allRelated.slice(safeIndex, safeIndex + itemsPerPage);
                
                const activeDotIndex = hoveredRelatedId !== null
                  ? allRelated.findIndex(item => item.id === hoveredRelatedId)
                  : safeIndex;

                const accentColors = [
                  { bg: 'bg-amber-50', text: 'text-amber-600' },
                  { bg: 'bg-rose-50', text: 'text-rose-500' },
                  { bg: 'bg-sky-50', text: 'text-sky-500' },
                  { bg: 'bg-violet-50', text: 'text-violet-500' },
                ];
                return (
                  <div className="mt-12 pt-10 border-t border-gray-100">
                    {/* Header */}
                    <h3 className="text-center text-lg font-extrabold uppercase tracking-[0.2em] text-[#36454F] mb-8">You Might Also Like</h3>

                    {/* Carousel row: left arrow + grid + right arrow */}
                    <div className="flex items-center gap-1 sm:gap-3">
                      {/* Left arrow */}
                      <motion.button
                        type="button"
                        onClick={() => setRelatedPage(p => Math.max(0, p - 1))}
                        disabled={safeIndex === 0}
                        whileHover={safeIndex > 0 ? { scale: 1.1 } : {}}
                        whileTap={safeIndex > 0 ? { scale: 0.9 } : {}}
                        className={`w-6 h-6 sm:w-9 sm:h-9 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                          safeIndex === 0
                            ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                            : 'border-[#B2AC88] text-[#B2AC88] hover:bg-[#B2AC88] hover:text-white cursor-pointer'
                        }`}
                      >
                        <ChevronLeft size={10} />
                      </motion.button>

                      {/* Cards grid — no white background, clean cards */}
                      <div className={`grid gap-3 flex-1 ${
                        visibleItems.length === 1 ? 'grid-cols-1 max-w-[160px] mx-auto' :
                        'grid-cols-2 sm:grid-cols-4'
                      }`}>
                        {visibleItems.map((p, idx) => {
                          const relatedFinalPrice = p.discount > 0
                            ? Math.round(p.price * (1 - p.discount / 100))
                            : p.price;
                          const relatedImg = p.image || p.image_url;
                          const isHovered = hoveredRelatedId === p.id;
                          const someoneElseHovered = hoveredRelatedId !== null && !isHovered;
                          return (
                            <motion.button
                              key={p.id}
                              type="button"
                              onClick={() => handleCardClick(p)}
                              onMouseEnter={() => setHoveredRelatedId(p.id)}
                              onMouseLeave={() => setHoveredRelatedId(null)}
                              initial={{ opacity: 0, y: 16 }}
                              animate={{
                                opacity: someoneElseHovered ? 0.6 : 1,
                                y: 0,
                                scale: isHovered ? 1.04 : 1,
                                filter: someoneElseHovered ? 'blur(1px)' : 'blur(0px)',
                              }}
                              transition={{ duration: 0.25, delay: idx * 0.07 }}
                              className="flex flex-col text-left cursor-pointer rounded-xl overflow-hidden transition-shadow"
                            >
                              {/* Image — no white card background, just the image */}
                              <div className="w-full aspect-square rounded-xl overflow-hidden relative bg-[#F5F4EF]">
                                {relatedImg ? (
                                  <img
                                    src={relatedImg.startsWith('/') || relatedImg.startsWith('data:') ? relatedImg : `/uploads/${relatedImg}`}
                                    alt={getLocalized(p.name, language)} onError={(e) => { e.target.onerror = null; e.target.src = '/categories/cat1.jpg'; }}
                                    className="w-full h-full object-contain transition-transform duration-500"
                                    style={{ transform: isHovered ? 'scale(1.08)' : 'scale(1)' }}
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <span className="text-xs font-bold uppercase text-[#B2AC88]">{parseJsonArray(p.category).map(cat => tCategory(cat)).join(', ')}</span>
                                  </div>
                                )}
                                {/* Badge (Bestseller, etc.) */}
                                {parseJsonArray(p.badge).filter(Boolean).filter(b => String(b).toLowerCase() !== 'sale')[0] && (
                                  <span className="absolute top-2 left-2 text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#36454F] text-white whitespace-nowrap">
                                    {parseJsonArray(p.badge).filter(Boolean).filter(b => String(b).toLowerCase() !== 'sale')[0]}
                                  </span>
                                )}
                              </div>
                              {/* Info — clean, no background */}
                              <div className="pt-2 px-0.5">
                                <p className={`text-[10px] sm:text-xs font-bold uppercase tracking-wide line-clamp-2 leading-snug transition-colors ${isHovered ? 'text-[#B2AC88]' : 'text-[#36454F]'}`}>{getLocalized(p.name, language)}</p>
                                <p className="text-xs font-semibold text-[#36454F] mt-0.5">{relatedFinalPrice.toLocaleString()} IQD</p>
                              </div>
                            </motion.button>
                          );
                        })}
                      </div>

                      {/* Right arrow */}
                      <motion.button
                        type="button"
                        onClick={() => setRelatedPage(p => Math.min(maxIndex, p + 1))}
                        disabled={safeIndex >= maxIndex}
                        whileHover={safeIndex < maxIndex ? { scale: 1.1 } : {}}
                        whileTap={safeIndex < maxIndex ? { scale: 0.9 } : {}}
                        className={`w-6 h-6 sm:w-9 sm:h-9 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                          safeIndex >= maxIndex
                            ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                            : 'border-[#B2AC88] text-[#B2AC88] hover:bg-[#B2AC88] hover:text-white cursor-pointer'
                        }`}
                      >
                        <ChevronRight size={10} />
                      </motion.button>
                    </div>

                    {/* Pagination dots — circle outlines (like reference: < ● ○ ○ ○ ○ >) */}
                    <div className="flex justify-center items-center gap-2 mt-5">
                      {allRelated.map((p, i) => {
                        const isActive = i === activeDotIndex;
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => setRelatedPage(Math.min(i, maxIndex))}
                            className={`rounded-full transition-all duration-200 cursor-pointer border-2 ${
                              isActive 
                                ? 'w-3 h-3 bg-[#B2AC88] border-[#B2AC88]' 
                                : 'w-3 h-3 bg-transparent border-[#B2AC88]/50 hover:border-[#B2AC88]'
                            }`}
                          />
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

            </motion.div>
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
                        <div className="w-full h-full relative">
                          <img src={modalActiveImage.startsWith('/') || modalActiveImage.startsWith('data:') ? modalActiveImage : `/uploads/${modalActiveImage}`} 
                            alt={getLocalized(optionsModalProduct.name, language)} 
                            className="w-full h-full object-contain" onError={(e) => { e.target.onerror = null; e.target.src = '/categories/cat1.jpg'; }} />
                          {selectedColorClass && (
                            <div 
                              className="absolute inset-0 pointer-events-none z-2 opacity-50"
                              style={{
                                ...getColorStyle(selectedColorClass),
                                mixBlendMode: 'color'
                              }}
                            />
                          )}
                        </div>
                      ) : (
                        <span className="text-[#36454F]/20 font-serif text-2xl font-bold uppercase rotate-[-20deg]">
                          {parseJsonArray(optionsModalProduct.category).map(cat => getLocalized(cat, language)).join(', ')}
                        </span>
                      )}
                    </div>


                  </div>

                  {/* Right Side: Options Form */}
                  <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-between overflow-visible md:overflow-y-auto rounded-b-3xl md:rounded-b-none md:rounded-r-3xl shrink-0">
                    <div className="space-y-5">
                      <div>
                        <span className="text-[10px] font-bold text-[#B2AC88] tracking-widest uppercase mb-1 block">Choose Options</span>
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
                        const parsedSizes = parseJsonArray(optionsModalProduct.size_collection).filter(s => s && s !== 'One Size');
const sizeOptions = parsedSizes.length > 0 ? parsedSizes : ['EU 36-40', 'EU 41-45', 'Free Size'];
                        const availableColorClasses = modalSelectedSize && sizeColorMap[modalSelectedSize]
                          ? sizeColorMap[modalSelectedSize]
                          : (optionsModalProduct.colors && optionsModalProduct.colors.length > 0 ? optionsModalProduct.colors : ['bg-[#C08081]', 'bg-[#B2AC88]', 'bg-[#F5F5DC]', 'bg-[#36454F]']);
                        const sizesForSelectedColor = modalColorIndex !== null
                          ? sizeOptions.filter(size => (sizeColorMap[size] || []).includes(optionsModalProduct.colors?.[modalColorIndex]))
                          : sizeOptions;
                        return (
                          <>
                            {/* Size Selector */}
                            {sizeOptions.length > 0 && (
                              <div className="space-y-2">
                                <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider">
                                  <span className="text-gray-400">Select Size</span>
                                  {modalSelectedSize && <span className="text-[#36454F] font-semibold">{modalSelectedSize}</span>}
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {sizeOptions.map((size) => {
                                    const selectedColorClass = modalColorIndex !== null ? optionsModalProduct.colors?.[modalColorIndex] : null;
                                    const isAvailable = !selectedColorClass || !hasSizeColors || sizesForSelectedColor.includes(size);
                                    return (
                                      <button
                                        key={size}
                                        type="button"
                                        onClick={() => {
                                          setModalSelectedSize(size);
                                          // Reset color if not available for new size
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
                                  <span className="text-gray-400">Select Color</span>
                                  {modalColorIndex !== null && (
                                    <span className="text-[#36454F] font-semibold">
                                      {optionsModalProduct.colorNames ? getLocalized(optionsModalProduct.colorNames[modalColorIndex], language) : `Option ${modalColorIndex + 1}`}
                                    </span>
                                  )}
                                </div>
                                <div className="flex flex-wrap gap-2.5">
                                  {optionsModalProduct.colors.filter(colorClass => availableColorClasses.includes(colorClass)).map((colorClass, idx) => {
                                    const actualIndex = optionsModalProduct.colors.indexOf(colorClass);
                                    const isSelected = modalColorIndex === actualIndex;
                                    return (
                                      <button
                                        key={idx}
                                        type="button"
                                        onClick={() => {
                                          setModalColorIndex(actualIndex);
                                          if (!modalSelectedSize && hasSizeColors) {
                                            const firstSize = sizeOptions.find(s => (sizeColorMap[s] || []).includes(colorClass));
                                            if (firstSize) setModalSelectedSize(firstSize);
                                          }
                                        }}
                                        style={getColorStyle(colorClass)}
                                        className={`w-7 h-7 rounded-full border cursor-pointer flex items-center justify-center relative transition-transform hover:scale-110 active:scale-95 ${colorClass.startsWith('#') ? '' : colorClass} ${
                                          isSelected
                                            ? 'ring-2 ring-offset-2 ring-[#B2AC88] border-transparent'
                                            : 'border-gray-200'
                                        }`}
                                      >
                                        {isSelected && <Check size={12} className="text-white mix-blend-difference" />}
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
                        <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Quantity</label>
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
                          const styleOptions = parseJsonArray(optionsModalProduct.style_length).filter(Boolean).filter(b => String(b).toLowerCase() !== 'sale');
                          if (styleOptions.length > 1 && !modalSelectedStyle) {
                            setModalValidationError('Please select a Style / Length first.');
                            return;
                          }
                          const parsedSizes = parseJsonArray(optionsModalProduct.size_collection).filter(s => s && s !== 'One Size');
const sizeOptions = parsedSizes.length > 0 ? parsedSizes : ['EU 36-40', 'EU 41-45', 'Free Size'];
                          if (sizeOptions.length > 0 && !modalSelectedSize) {
                            setModalValidationError('Please select a Size first.');
                            return;
                          }
                          const sizeColorMap = (() => { try { return JSON.parse(optionsModalProduct.size_colors || '{}'); } catch(e) { return {}; } })();
                          const availColorClasses = modalSelectedSize && sizeColorMap[modalSelectedSize]
                            ? sizeColorMap[modalSelectedSize]
                            : (optionsModalProduct.colors && optionsModalProduct.colors.length > 0 ? optionsModalProduct.colors : ['bg-[#C08081]', 'bg-[#B2AC88]', 'bg-[#F5F5DC]', 'bg-[#36454F]']);
                          if (availColorClasses.length > 0 && modalColorIndex === null) {
                            setModalValidationError('Please select a Color first.');
                            return;
                          }

                          // Add to cart
                          const finalPrice = optionsModalProduct.discount > 0
                            ? Math.round(optionsModalProduct.price * (1 - optionsModalProduct.discount / 100))
                            : optionsModalProduct.price;

                          const modalColorName = optionsModalProduct.colorNames && modalColorIndex !== null ? optionsModalProduct.colorNames[modalColorIndex] : null;
                          onAddToCart({ 
                            ...optionsModalProduct, 
                            price: finalPrice, 
                            selectedStyle: modalSelectedStyle, 
                            selectedSize: modalSelectedSize,
                            selectedColor: optionsModalProduct.colors && modalColorIndex !== null ? optionsModalProduct.colors[modalColorIndex] : null,
                            selectedColorName: modalColorName
                          }, modalQuantity);

                          const colorLabel = modalColorName || 'selected color';
                          showToast(`Added ${modalQuantity}x ${getLocalized(optionsModalProduct.name, language)} (${colorLabel}) to cart!`);
                          setOptionsModalProduct(null);
                          
                          if (onOpenCart) onOpenCart();
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
    </div>
  );
}
