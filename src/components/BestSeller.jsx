import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext.jsx';

const fallbackBestSellers = [
  {
    id: 1,
    name: 'Abstract Faces',
    price: '6,250 IQD',
    image: '/bestsellers/bs1.jpg'
  },
  {
    id: 2,
    name: 'Cat Patterns',
    price: '6,250 IQD',
    image: '/bestsellers/bs2.jpg'
  },
  {
    id: 3,
    name: 'Pet Lovers',
    price: '6,250 IQD',
    image: '/categories/cat1.jpg'
  },
  {
    id: 4,
    name: 'Kangaroo Crew',
    price: '5,000 IQD',
    image: '/categories/cat3.jpg'
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

export default function BestSeller({ onViewAll, onAddToCart }) {
  const { t, language } = useLanguage();
  const [bestSellersList, setBestSellersList] = useState([]);

  useEffect(() => {
    let active = true;
    fetch('/api/products')
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(data => {
        if (active) {
          const filtered = data.filter(p => {
            const badges = parseJsonArray(p.badge).map(b => b.toLowerCase());
            return badges.includes('bestseller');
          });
          if (filtered.length > 0) {
            setBestSellersList(filtered.slice(0, 4));
          } else {
            setBestSellersList(data.slice(0, 4));
          }
        }
      })
      .catch(() => {
        if (active) {
          setBestSellersList(fallbackBestSellers);
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

  return (
    <section className="container mx-auto px-4 lg:px-16 xl:px-32 py-16">
      {/* Title with lines */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.3 }}
        transition={{ duration: 0.6 }}
        className="flex items-center justify-center mb-10"
      >
        <div className="h-px bg-gray-200 flex-grow max-w-[300px]"></div>
        <h2 className="text-xl md:text-2xl font-bold text-[#1a365d] mx-6 uppercase tracking-wider">{t('bestseller.title')}</h2>
        <div className="h-px bg-gray-200 flex-grow max-w-[300px]"></div>
      </motion.div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {bestSellersList.map((product, index) => (
          <motion.div 
            key={product.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.5, delay: index * 0.05 }}
            onClick={(e) => {
              e.stopPropagation();
              let numericPrice = product.price;
              if (typeof numericPrice === 'string') {
                numericPrice = parseFloat(numericPrice.replace(/[^0-9.]/g, '')) || 0;
              }
              const finalPrice = product.discount > 0 
                ? Math.round(numericPrice * (1 - product.discount / 100))
                : numericPrice;
              onAddToCart({ ...product, price: finalPrice });
            }}
            className="group cursor-pointer flex flex-col"
          >
            <div className="w-full aspect-square bg-gray-100 mb-4 overflow-hidden relative rounded-md shadow-sm">
              {product.discount > 0 && (
                <div className="absolute top-3 start-3 z-10 text-[8px] font-bold uppercase tracking-widest px-2.5 py-1 bg-red-500 text-white rounded-full shadow-xs">
                  {product.discount}% {language === 'ar' ? 'خصم' : language === 'ku' ? 'داشکاندن' : 'OFF'}
                </div>
              )}
               <img 
                 src={getProductImage(product.image || product.image_url)} 
                 alt={product.name} 
                 className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
               />
            </div>
            <h3 className="text-[15px] text-brand-charcoal">{product.name}</h3>
            <p className="text-[15px] mt-0.5">
              {product.discount > 0 ? (
                <span className="flex items-center space-x-1.5 rtl:space-x-reverse text-xs">
                  <span className="line-through text-gray-400">
                    {getProductPrice(product.price)}
                  </span>
                  <span className="text-brand-charcoal font-bold">
                    {getProductPrice(Math.round(product.price * (1 - product.discount / 100)))}
                  </span>
                </span>
              ) : (
                <span className="text-gray-500">{getProductPrice(product.price)}</span>
              )}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Pagination Dots */}
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: false }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="flex items-center justify-center space-x-2.5 rtl:space-x-reverse mt-10"
      >
        <div className="w-2.5 h-2.5 rounded-full bg-[#C08081]"></div>
        {[...Array(6)].map((_, i) => (
          <div key={i} className="w-2.5 h-2.5 rounded-full border border-[#C08081]"></div>
        ))}
      </motion.div>

      {/* View All Button */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: false }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="flex justify-center mt-8"
      >
        <button 
          onClick={onViewAll}
          className="px-10 py-2 border border-[#C08081] text-[#C08081] text-sm font-medium rounded-full hover:bg-[#36454F] hover:border-[#36454F] hover:text-white transition-all duration-300 cursor-pointer bg-transparent"
        >
          {language === 'ar' ? 'عرض الكل' : language === 'ku' ? 'پیشاندانی هەمووی' : 'View all'}
        </button>
      </motion.div>
    </section>
  );
}
