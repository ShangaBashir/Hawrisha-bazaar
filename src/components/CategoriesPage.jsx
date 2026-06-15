import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutGrid, ShoppingBag, ArrowLeft, Loader2, Heart } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.jsx';

const fallbackCategories = [
  {
    id: 'animals',
    name: 'Animals',
    productCount: 4,
    image: '/categories/cat1.jpg'
  },
  {
    id: 'fruits',
    name: 'Fruits',
    productCount: 2,
    image: '/categories/cat2.jpg'
  },
  {
    id: 'patterns',
    name: 'Patterns',
    productCount: 3,
    image: '/categories/cat3.jpg'
  },
  {
    id: 'cozy_crew',
    name: 'Cozy Crew',
    productCount: 3,
    image: '/categories/cat4.jpg'
  }
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

export default function CategoriesPage({ cart, likedProducts, onAddToCart, onRemoveFromCart, onToggleWishlist, onProductClick, isLoggedIn, onLoginRequired }) {
  const { t, language, tCategory, tBadge } = useLanguage();
  const [categories, setCategories] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const isRTL = language === 'ar' || language === 'ku';

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    
    Promise.all([
      fetch('/api/settings/categories').then(res => {
        if (!res.ok) throw new Error('Failed to fetch categories');
        return res.json();
      }),
      fetch('/api/products').then(res => {
        if (!res.ok) throw new Error('Failed to fetch products');
        return res.json();
      })
    ])
      .then(([cats, prods]) => {
        if (active) {
          const fallbackImages = ['/categories/cat1.jpg', '/categories/cat2.jpg', '/categories/cat3.jpg', '/categories/cat4.jpg'];
          
          const compiled = cats.map((cat, index) => {
            const categoryProducts = prods.filter(p => parseJsonArray(p.category).includes(cat.name));
            const count = categoryProducts.length;
            
            let img;
            if (categoryProducts.length > 0 && categoryProducts[0].image_url) {
              const url = categoryProducts[0].image_url;
              img = url.startsWith('data:') || url.startsWith('/') ? url : `/uploads/${url}`;
            } else if (categoryProducts.length > 0 && categoryProducts[0].image) {
              const url = categoryProducts[0].image;
              img = url.startsWith('data:') || url.startsWith('/') ? url : `/uploads/${url}`;
            } else {
              img = fallbackImages[index % fallbackImages.length];
            }
            
            return {
              id: cat.id,
              name: cat.name,
              productCount: count,
              image: img
            };
          });
          
          setCategories(compiled);
          setAllProducts(prods);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.error(err);
        if (active) {
          setCategories(fallbackCategories);
          setIsLoading(false);
        }
      });
      
    return () => { active = false; };
  }, []);

  const handleSelectCategory = (category) => {
    setSelectedCategory(category);
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
  };

  // Filter products for the chosen category storefront
  const filteredProducts = selectedCategory 
    ? allProducts.filter(p => parseJsonArray(p.category).includes(selectedCategory.name))
    : [];

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 text-[#B2AC88] animate-spin" />
        <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest animate-pulse">
          {language === 'ar' ? 'جاري تحميل الأقسام...' : language === 'ku' ? 'بارکردنی پۆلەکان...' : 'Loading Categories...'}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 font-sans text-brand-charcoal" dir={isRTL ? 'rtl' : 'ltr'}>
      <AnimatePresence mode="wait">
        {!selectedCategory ? (
          // 1. Directory of Categories
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
                {t('categories_page.title')}
              </h1>
              <p className="text-xs sm:text-sm text-[#B2AC88] font-medium mt-1">
                {t('categories_page.subtitle')}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {categories.map((category) => (
                <motion.div
                  key={category.id}
                  whileHover={{ y: -6, boxShadow: '0 12px 30px rgba(0,0,0,0.06)' }}
                  onClick={() => handleSelectCategory(category)}
                  className="group cursor-pointer bg-white rounded-3xl p-4 border border-gray-100 shadow-xs flex flex-col justify-between min-h-[320px] transition-all relative overflow-hidden"
                >
                  {/* Category Image Cover */}
                  <div className="w-full aspect-[3/4] rounded-2xl bg-gray-50 overflow-hidden relative border border-gray-100 flex items-center justify-center">
                    {category.image ? (
                      <img 
                        src={category.image} 
                        alt={tCategory(category.name)} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                      />
                    ) : (
                      <LayoutGrid size={32} className="text-gray-300" />
                    )}
                  </div>

                  {/* Title & Count */}
                  <div className="mt-4 flex flex-col items-center text-center space-y-1 pb-1">
                    <h3 className="text-base font-extrabold text-[#36454F] uppercase tracking-wide group-hover:text-[#B2AC88] transition-colors">
                      {tCategory(category.name)}
                    </h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                      {t('categories_page.products_count', { count: category.productCount })}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : (
          // 2. Category Products Grid
          <motion.div
            key="storefront"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="space-y-8"
          >
            {/* Category Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-10 pb-6 border-b border-gray-200/60">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-3xl bg-[#B2AC88]/15 border border-[#B2AC88]/30 flex items-center justify-center text-[#B2AC88]">
                  <LayoutGrid size={26} />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-[#36454F] uppercase tracking-wider">
                    {tCategory(selectedCategory.name)}
                  </h1>
                  <p className="text-xs sm:text-sm text-[#B2AC88] font-bold mt-1 uppercase tracking-wider">
                    {t('categories_page.products_count', { count: selectedCategory.productCount })}
                  </p>
                </div>
              </div>
              <button
                onClick={handleBackToCategories}
                className="flex items-center self-start sm:self-center gap-2 text-xs font-bold uppercase tracking-wider text-[#36454F] hover:text-[#B2AC88] transition-colors cursor-pointer border border-gray-200 px-4 py-2.5 rounded-full bg-white shadow-xs"
              >
                <ArrowLeft size={14} className={isRTL ? 'rotate-180' : ''} />
                {t('categories_page.back_categories')}
              </button>
            </div>

            {/* Category Products */}
            {filteredProducts.length === 0 ? (
              <div className="h-[300px] flex flex-col items-center justify-center text-center space-y-4 py-8 bg-white rounded-3xl border border-gray-100 shadow-xs">
                <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100">
                  <ShoppingBag className="text-gray-300" size={24} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#36454F] uppercase tracking-wider">
                    {t('categories_page.no_products')}
                  </h4>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredProducts.map((product) => {
                  const imgUrl = product.image_url || product.image;
                  const finalImg = !imgUrl
                    ? '/categories/cat1.jpg'
                    : (imgUrl.startsWith('data:') || imgUrl.startsWith('/') ? imgUrl : `/uploads/${imgUrl}`);
                  
                  const isWishlisted = likedProducts.includes(product.id);

                  return (
                    <motion.div
                      key={product.id}
                      whileHover={{ y: -5, boxShadow: '0 16px 40px rgba(0,0,0,0.08)' }}
                      onClick={() => onProductClick(product)}
                      className="group cursor-pointer flex flex-col bg-white border border-gray-100 p-3 rounded-3xl transition-all duration-300 relative overflow-hidden"
                    >
                      {/* Corner Badges */}
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
                            {tBadge(b)}
                          </div>
                        ))}
                      </div>

                      {/* Wishlist Button */}
                      <div className="absolute top-5 right-5 z-10">
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
