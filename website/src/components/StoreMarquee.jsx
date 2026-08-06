import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext.jsx';

// Shipped sock photography, used when the catalogue has no images yet.
const FALLBACK_SOCKS = [
  '/categories/cat1.jpg',
  '/bestsellers/bs1.jpg',
  '/carousel/slide1.jpg',
  '/categories/cat3.jpg',
  '/bestsellers/bs2.jpg',
  '/carousel/slide2.webp',
  '/categories/cat2.jpg',
  '/carousel/slide3.jpg',
];

const parseImageList = (val) => {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  try {
    const parsed = JSON.parse(val);
    return Array.isArray(parsed) ? parsed : [val];
  } catch {
    return [val];
  }
};

const resolveImage = (img) => {
  if (!img || typeof img !== 'string') return null;
  if (img.startsWith('http') || img.startsWith('data:') || img.startsWith('/')) return img;
  return `/uploads/${img}`;
};

// Repeat the source images until there are enough tiles for the marquee to
// loop without a visible gap, regardless of how small the catalogue is.
const padTiles = (tiles) => {
  if (tiles.length === 0) return [];
  const out = [];
  while (out.length < 24) out.push(...tiles);
  return out;
};

export default function StoreMarquee() {
  const { language } = useLanguage();
  const [socks, setSocks] = useState([]);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    let active = true;
    const fallback = FALLBACK_SOCKS.map(image => ({ image, name: 'Socks' }));

    fetch('/api/products')
      .then(res => {
        if (!res.ok) throw new Error('products request failed');
        return res.json();
      })
      .then(data => {
        if (!active) return;
        const products = Array.isArray(data) ? data : [];
        const tiles = [];
        products.forEach(p => {
          [p.image_url, ...parseImageList(p.extra_images)]
            .map(resolveImage)
            .filter(Boolean)
            .forEach(image => tiles.push({ image, name: p.name }));
        });
        setSocks(padTiles(tiles.length > 0 ? tiles : fallback));
      })
      .catch(err => {
        console.error('Error fetching products for marquee:', err);
        if (active) setSocks(padTiles(fallback));
      });
    return () => { active = false; };
  }, []);

  // Product names are stored as {"en":..,"ku":..,"ar":..} JSON; fall back to
  // the raw value for plain-string names.
  const getSockName = (val) => {
    if (!val) return 'Socks';
    let obj = val;
    if (typeof val === 'string') {
      if (!val.trim().startsWith('{')) return val;
      try { obj = JSON.parse(val); } catch { return val; }
    }
    if (!obj || typeof obj !== 'object') return String(val);
    const l = (language || 'en').toLowerCase();
    return obj[l] || obj[l.toUpperCase()] || obj.en || obj.EN || Object.values(obj)[0] || 'Socks';
  };

  // Split into two arrays for the two scrolling rows (top and bottom)
  const half = Math.ceil(socks.length / 2);
  const row1 = socks.slice(0, half);
  const row2 = socks.slice(half);

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
            {row1.map((sock, idx) => (
              <div
                key={`row1-${idx}`}
                className="w-20 h-20 md:w-28 md:h-28 shrink-0 bg-white rounded-3xl overflow-hidden shadow-lg border border-gray-100 flex items-center justify-center hover:scale-110 hover:-translate-y-2 transition-all duration-300"
              >
                <img src={sock.image} alt={getSockName(sock.name)} className="w-full h-full object-cover pointer-events-none" onError={(e) => { e.target.onerror = null; e.target.src = '/categories/cat1.jpg'; }} />
              </div>
            ))}
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
            {row2.map((sock, idx) => (
              <div
                key={`row2-${idx}`}
                className="w-20 h-20 md:w-28 md:h-28 shrink-0 bg-white rounded-3xl overflow-hidden shadow-lg border border-gray-100 flex items-center justify-center hover:scale-110 hover:-translate-y-2 transition-all duration-300"
              >
                <img src={sock.image} alt={getSockName(sock.name)} className="w-full h-full object-cover pointer-events-none" onError={(e) => { e.target.onerror = null; e.target.src = '/categories/cat1.jpg'; }} />
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
