import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function StoreMarquee() {
  const { language } = useLanguage();
  const [stores, setStores] = useState([]);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    let active = true;
    fetch('/api/stores')
      .then(res => res.json())
      .then(data => {
        if (active && data.success && data.vendors) {
          // Filter to only stores that have logos, or just use them all and handle fallbacks
          let vendorList = data.vendors;
          if (vendorList.length === 0) {
            // Fallback mock stores for demonstration if none exist
            vendorList = [
              { store_name: 'Hawrisha Original', logo: '/categories/cat1.jpg' },
              { store_name: 'Style Studio', logo: '/bestsellers/bs1.jpg' },
              { store_name: 'Urban Comfort', logo: '/carousel/slide1.jpg' },
              { store_name: 'Premium Socks', logo: '/categories/cat3.jpg' },
              { store_name: 'Socks Haven', logo: '/bestsellers/bs2.jpg' },
              { store_name: 'Footwear Co.', logo: '/carousel/slide2.webp' },
              { store_name: 'Creative Threads', logo: '/categories/cat2.jpg' },
              { store_name: 'Artisan Socks', logo: '/carousel/slide3.jpg' },
            ];
          }
          // Duplicate array to ensure enough items for a seamless marquee
          const duplicated = [...vendorList, ...vendorList, ...vendorList, ...vendorList];
          setStores(duplicated);
        }
      })
      .catch(err => {
        console.error('Error fetching stores for marquee:', err);
        if (active) {
          const fallback = [
            { store_name: 'Hawrisha Original', logo: '/categories/cat1.jpg' },
            { store_name: 'Style Studio', logo: '/bestsellers/bs1.jpg' },
            { store_name: 'Urban Comfort', logo: '/carousel/slide1.jpg' },
            { store_name: 'Premium Socks', logo: '/categories/cat3.jpg' },
            { store_name: 'Socks Haven', logo: '/bestsellers/bs2.jpg' },
          ];
          setStores([...fallback, ...fallback, ...fallback, ...fallback, ...fallback]);
        }
      });
    return () => { active = false; };
  }, []);

  const getLogoUrl = (logoPath) => {
    if (!logoPath) return null;
    if (logoPath.startsWith('http') || logoPath.startsWith('data:') || logoPath.startsWith('/')) {
      return logoPath;
    }
    return `/uploads/${logoPath}`;
  };

  const getStoreName = (store) => {
    const rawName = store.name || store.store_name || '';
    if (!rawName) return 'S';
    try {
      if (rawName.startsWith('{')) {
        const parsed = JSON.parse(rawName);
        return parsed.en || parsed.ku || parsed.ar || rawName;
      }
    } catch (e) {}
    return rawName;
  };

  // Split stores into two arrays for the two scrolling rows (top and bottom)
  const half = Math.ceil(stores.length / 2);
  const row1 = stores.slice(0, half);
  const row2 = stores.slice(half);

  return (
    <section className="w-full bg-[#F5F5DC] py-24 overflow-hidden relative border-t border-[#e5e4d7]">
      <style>
        {`
          @keyframes marqueeLeft {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          @keyframes marqueeRight {
            0% { transform: translateX(-50%); }
            100% { transform: translateX(0); }
          }
          .animate-marquee-left {
            animation: marqueeLeft 40s linear infinite;
          }
          .animate-marquee-right {
            animation: marqueeRight 45s linear infinite;
          }
        `}
      </style>

      <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-[#F5F5DC] via-transparent to-[#F5F5DC] z-10"></div>

      <div 
        className="max-w-[100vw] mx-auto flex flex-col items-center justify-center gap-12 marquee-container relative z-0"
        onClick={() => setIsPaused(!isPaused)}
      >
        
        {/* Top Marquee Row (Scrolling Left) */}
        <div 
          className="w-full flex whitespace-nowrap animate-marquee-left w-max"
          style={{ animationPlayState: isPaused ? 'paused' : 'running' }}
        >
          <div className="flex gap-6 md:gap-10 px-3 md:px-5 cursor-pointer">
            {row1.map((store, idx) => {
              const displayName = getStoreName(store);
              return (
                <div 
                  key={`row1-${idx}`} 
                  className="w-20 h-20 md:w-28 md:h-28 flex-shrink-0 bg-white rounded-3xl overflow-hidden shadow-lg border border-gray-100 flex items-center justify-center hover:scale-110 hover:-translate-y-2 transition-all duration-300"
                >
                  {store.logo ? (
                    <img src={getLogoUrl(store.logo)} alt={displayName} className="w-full h-full object-cover pointer-events-none" onError={(e) => { e.target.onerror = null; e.target.src = '/categories/cat1.jpg'; }} />
                  ) : (
                    <div className="w-full h-full bg-[#36454F] flex items-center justify-center text-white font-bold text-xl uppercase pointer-events-none">
                      {displayName.substring(0, 1)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Center Text Area */}
        <div className="text-center z-20 px-4 py-8 bg-[#F5F5DC]/80 backdrop-blur-sm rounded-3xl cursor-default" onClick={(e) => e.stopPropagation()}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-[#36454F] tracking-tight mb-4">
              {language === 'ar' ? 'اعثر على جواربك المفضلة في مكان واحد' : language === 'ku' ? 'گۆرەوی دڵخوازت لە یەک شوێن بدۆزەوە' : 'Find Your Favorite Socks in One Place'}
            </h2>
            <p className="text-gray-500 text-xs md:text-sm max-w-md mx-auto leading-relaxed">
              {language === 'ar' 
                ? 'استكشف مجموعات من عدة متاجر تقدم أنماطًا وراحة وجودة تناسب كل الأذواق.' 
                : language === 'ku' 
                ? 'کۆکراوەکان لە چەندین فرۆشگاوە بپشکنە کە ستایل، ئاسوودەیی و کوالێتی بۆ هەموو سەلیقەیەک پێشکەش دەکەن.' 
                : 'Explore collections from multiple stores offering styles, comfort, and quality for every taste.'}
            </p>
          </motion.div>
        </div>

        {/* Bottom Marquee Row (Scrolling Right) */}
        <div 
          className="w-full flex whitespace-nowrap animate-marquee-right w-max"
          style={{ animationPlayState: isPaused ? 'paused' : 'running' }}
        >
          <div className="flex gap-6 md:gap-10 px-3 md:px-5 cursor-pointer">
            {row2.map((store, idx) => {
              const displayName = getStoreName(store);
              return (
                <div 
                  key={`row2-${idx}`} 
                  className="w-20 h-20 md:w-28 md:h-28 flex-shrink-0 bg-white rounded-3xl overflow-hidden shadow-lg border border-gray-100 flex items-center justify-center hover:scale-110 hover:-translate-y-2 transition-all duration-300"
                >
                  {store.logo ? (
                    <img src={getLogoUrl(store.logo)} alt={displayName} className="w-full h-full object-cover pointer-events-none" onError={(e) => { e.target.onerror = null; e.target.src = '/categories/cat1.jpg'; }} />
                  ) : (
                    <div className="w-full h-full bg-[#C08081] flex items-center justify-center text-white font-bold text-xl uppercase pointer-events-none">
                      {displayName.substring(0, 1)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}
