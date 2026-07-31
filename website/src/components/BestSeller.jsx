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
  },
  {
    id: 5,
    name: 'Retro Stripes',
    price: '5,500 IQD',
    image: '/carousel/slide1.jpg'
  },
  {
    id: 6,
    name: 'Classic Dot',
    price: '6,000 IQD',
    image: '/carousel/slide2.webp'
  },
  {
    id: 7,
    name: 'Happy Clouds',
    price: '6,250 IQD',
    image: '/carousel/slide3.jpg'
  },
  {
    id: 8,
    name: 'Neon Dreams',
    price: '5,000 IQD',
    image: '/categories/cat1.jpg'
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
            setBestSellersList(filtered.slice(0, 8));
          } else {
            setBestSellersList(data.slice(0, 8));
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
    <section className="w-full bg-[#f4f3e6] py-12 overflow-hidden min-h-[60vh] flex flex-col items-center">
      {/* Diagonal Cascade */}
      <div className="w-full overflow-x-auto overflow-y-hidden pb-16 pt-6 custom-scrollbar">
        <div className="flex flex-row items-start justify-start md:justify-center min-w-max px-10 md:px-20">
          
          {/* Product Cards */}
          {bestSellersList.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, x: -50, y: -50 }}
              whileInView={{ opacity: 1, x: 0, y: 0 }}
              whileHover={{ 
                scale: 1.08, 
                zIndex: 100, 
                y: -10,
                transition: { duration: 0.3 } 
              }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ type: "spring", damping: 15, delay: i * 0.12 + 0.1 }}
              style={{ 
                marginTop: `${(i % 4) * 2.2}rem`, 
                marginLeft: i === 0 ? '0' : '-3rem',
                zIndex: 20 + i 
              }}
              className="relative w-40 md:w-52 aspect-[4/5] bg-white rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden cursor-pointer flex-shrink-0 group"
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
            >
              {product.discount > 0 && (
                <div className="absolute top-3 left-3 z-20 text-[10px] font-bold uppercase tracking-widest px-2 py-1 bg-red-500 text-white rounded shadow">
                  {product.discount}% OFF
                </div>
              )}
              
              <img 
                src={getProductImage(product.image || product.image_url)} 
                alt={getLocalized(product.name, language)} onError={(e) => { e.target.onerror = null; e.target.src = '/categories/cat1.jpg'; }} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
              />
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity"></div>
              
              <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-2 group-hover:translate-y-0 transition-transform">
                <p className="font-bold text-white text-sm md:text-base truncate drop-shadow-md">{product.name}</p>
                <div className="flex items-center space-x-2 mt-1">
                  {product.discount > 0 && (
                    <span className="line-through text-gray-300 text-xs">
                      {getProductPrice(product.price)}
                    </span>
                  )}
                  <span className="text-white font-bold text-sm">
                    {getProductPrice(
                      product.discount > 0 
                        ? Math.round(product.price * (1 - product.discount / 100)) 
                        : product.price
                    )}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
