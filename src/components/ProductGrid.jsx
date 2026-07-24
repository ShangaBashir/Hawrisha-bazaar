import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext.jsx';

const fallbackProducts = [
  {
    id: 101,
    name: 'Abstract Faces Premium Socks',
    price: 6250,
    discount: 10,
    image: '/bestsellers/bs1.jpg',
    gender: 'Men',
    rating: 4.8
  },
  {
    id: 102,
    name: 'Cozy Cat Patterns Socks',
    price: 6250,
    discount: 5,
    image: '/bestsellers/bs2.jpg',
    gender: 'Women',
    rating: 4.7
  },
  {
    id: 103,
    name: 'Happy Kangaroo Crew Socks',
    price: 5000,
    discount: 15,
    image: '/categories/cat3.jpg',
    gender: 'Kids',
    rating: 4.6
  },
  {
    id: 104,
    name: 'Pet Lovers Special Socks',
    price: 6250,
    discount: 0,
    image: '/categories/cat1.jpg',
    gender: 'Kids',
    rating: 4.9
  },
  {
    id: 105,
    name: 'Retro Stripes Athletic Socks',
    price: 5500,
    discount: 12,
    image: '/carousel/slide1.jpg',
    gender: 'Men',
    rating: 4.5
  },
  {
    id: 106,
    name: 'Classic Dot Cozy Socks',
    price: 6000,
    discount: 8,
    image: '/carousel/slide2.webp',
    gender: 'Women',
    rating: 4.6
  },
  {
    id: 107,
    name: 'Happy Clouds Sky Socks',
    price: 6250,
    discount: 20,
    image: '/carousel/slide3.jpg',
    gender: 'Kids',
    rating: 4.8
  },
  {
    id: 108,
    name: 'Neon Dreams Vibrant Socks',
    price: 5000,
    discount: 0,
    image: '/categories/cat2.jpg',
    gender: 'Men',
    rating: 4.4
  }
];

export default function ProductGrid({ onAddToCart, onCategorySelect, wishlist = [], onToggleWishlist }) {
  const { language } = useLanguage();
  const [productsList, setProductsList] = useState([]);
  const [activeTab, setActiveTab] = useState('Men'); // 'Men', 'Women', 'Kids'

  useEffect(() => {
    let active = true;
    fetch('/api/products')
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(data => {
        if (active) {
          if (data && data.length > 0) {
            setProductsList(data);
          } else {
            setProductsList(fallbackProducts);
          }
        }
      })
      .catch(() => {
        if (active) {
          setProductsList(fallbackProducts);
        }
      });
    return () => { active = false; };
  }, []);

  const getProductImage = (imgUrl) => {
    if (!imgUrl) return '/categories/cat1.jpg';
    if (imgUrl.startsWith('data:') || imgUrl.startsWith('/')) {
      return imgUrl;
    }
    return `/uploads/${imgUrl}`;
  };

  const getProductPrice = (price) => {
    if (typeof price === 'number') {
      return `${price.toLocaleString()} IQD`;
    }
    return price;
  };

  // Filter products by selected activeTab gender
  const filteredProducts = productsList.filter(p => {
    const g = (p.gender || '').toLowerCase();
    if (activeTab === 'Men') return g === 'men';
    if (activeTab === 'Women') return g === 'women';
    if (activeTab === 'Kids') return g === 'kids';
    return true;
  });

  // If filtered returns nothing, fallback to mock filtered data so tabs are never empty
  const displayList = filteredProducts.length > 0 
    ? filteredProducts.slice(0, 4)
    : fallbackProducts.filter(p => p.gender === activeTab).slice(0, 4);

  const tabs = [
    { key: 'Men', label: language === 'ar' ? 'رجال' : language === 'ku' ? 'پیاوان' : 'Men' },
    { key: 'Women', label: language === 'ar' ? 'نساء' : language === 'ku' ? 'ئافرەتان' : 'Women' },
    { key: 'Kids', label: language === 'ar' ? 'أطفال' : language === 'ku' ? 'منداڵان' : 'Kids' }
  ];

  return (
    <section className="w-full bg-[#f4f3e6] py-16 px-6 md:px-12 lg:px-24">
      <div className="max-w-7xl mx-auto">
        
        {/* Header containing Title & Tabs (Line removed: border-b removed) */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10 pb-2">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-[#36454F] uppercase">
            {language === 'ar' ? 'جوارب' : language === 'ku' ? 'گۆرەوی' : 'Socks'}
          </h2>
          
          {/* Tab selector pill list */}
          <div className="flex items-center bg-[#e5e4d7] p-1.5 rounded-full shadow-inner">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`relative px-6 py-2 rounded-full text-xs md:text-sm font-semibold tracking-wide transition-all duration-300 cursor-pointer ${
                  activeTab === tab.key 
                    ? 'bg-[#36454F] text-white shadow-md' 
                    : 'text-[#555] hover:text-[#36454F]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        <motion.div 
          layout
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8"
        >
          <AnimatePresence mode="popLayout">
            {displayList.map((product, idx) => {
              const rating = product.rating || (4.5 + (product.id % 5) * 0.1);
              const numericPrice = typeof product.price === 'string' 
                ? (parseFloat(product.price.replace(/[^0-9.]/g, '')) || 0)
                : product.price;
              const hasDiscount = product.discount > 0;
              const discountedPrice = hasDiscount 
                ? Math.round(numericPrice * (1 - product.discount / 100))
                : numericPrice;
              const isLiked = wishlist.includes(product.id);

              return (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  whileHover={{ y: -8 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="group flex flex-col justify-between cursor-pointer"
                >
                  {/* Image Card Container (Border & Padding Removed, Full Image Cover) */}
                  <div className="relative w-full aspect-square bg-[#ecebe0] rounded-3xl overflow-hidden transition-all duration-300 group-hover:shadow-lg">
                    <img 
                      src={getProductImage(product.image || product.image_url)} 
                      alt={getLocalized(product.name, language)} onError={(e) => { e.target.onerror = null; e.target.src = '/categories/cat1.jpg'; }} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />

                    {/* Corner Badges */}
                    <div className="absolute top-3 left-3 z-10 flex flex-col items-start gap-1">
                      {product.stock === 0 && (
                        <div className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 bg-gray-800 text-white rounded-lg shadow-xs">
                          Out of Stock
                        </div>
                      )}
                      {hasDiscount && (
                        <div className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 bg-red-500 text-white rounded-lg shadow-xs">
                          {product.discount}% OFF
                        </div>
                      )}
                    </div>
                    
                    {/* Add to Wishlist Heart Icon (Top Right Corner) */}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onToggleWishlist) onToggleWishlist(product.id);
                      }}
                      className="absolute top-4 right-4 bg-white/90 hover:bg-white text-[#36454F] p-2.5 rounded-full shadow-md transition-all hover:scale-110 active:scale-95 cursor-pointer z-10"
                    >
                      {isLiked ? (
                        <svg className="w-4 h-4 text-red-500 fill-current" viewBox="0 0 24 24">
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 text-[#36454F] hover:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      )}
                    </button>

                    {/* Add to Cart Floating Button (Color changed to charcoal #36454F / hover brand sage #B2AC88) */}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddToCart({ ...product, price: discountedPrice });
                      }}
                      className="absolute bottom-4 right-4 bg-[#36454F] hover:bg-[#B2AC88] text-white p-3.5 rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all cursor-pointer z-10 flex items-center justify-center border-0"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </button>
                  </div>

                  {/* Details below Card */}
                  <div className="pt-4 px-2 space-y-1 text-left">
                    {/* Stars (Reviews removed) */}
                    <div className="flex items-center text-xs font-semibold text-gray-500">
                      <span className="text-[#B2AC88] mr-1">★</span>
                      <span>{rating.toFixed(1)}</span>
                    </div>

                    {/* Product Name (Hover color changed to brand green #B2AC88) */}
                    <h3 className="font-bold text-sm text-[#36454F] group-hover:text-[#B2AC88] transition-colors truncate">
                      {product.name}
                    </h3>

                    {/* Price and Discount Info */}
                    <div className="flex items-center gap-2 flex-wrap text-sm font-bold mt-1">
                      <span className="text-[#36454F]">
                        {getProductPrice(discountedPrice)}
                      </span>
                      {hasDiscount && (
                        <>
                          <span className="line-through text-gray-400 text-xs font-medium">
                            {getProductPrice(numericPrice)}
                          </span>
                          <span className="text-red-500 text-[10px] font-bold font-mono">
                            {product.discount}% OFF
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>

        {/* Bottom Navigation Button: "All Category" with hover animation */}
        <div className="flex justify-center mt-12">
          <motion.button 
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onCategorySelect('All')}
            className="group flex items-center gap-2.5 px-8 py-3 bg-[#e5e4d7] text-[#36454F] rounded-full font-bold hover:bg-[#36454F] hover:text-white transition-all duration-300 text-sm cursor-pointer shadow-sm border-0"
          >
            <span>{language === 'ar' ? 'جميع الفئات' : language === 'ku' ? 'هەموو هاوپۆلەکان' : 'All Category'}</span>
            <svg 
              className="w-4 h-4 transform rtl:rotate-180 transition-transform duration-300 group-hover:translate-x-1 rtl:group-hover:-translate-x-1" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </motion.button>
        </div>

      </div>
    </section>
  );
}
