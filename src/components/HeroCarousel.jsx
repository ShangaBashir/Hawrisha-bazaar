import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function HeroCarousel({ onShopNow }) {
  const { t, language } = useLanguage();
  const [spread, setSpread] = useState(115);

  useEffect(() => {
    const handleResize = () => {
      setSpread(window.innerWidth < 768 ? 65 : 115);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const cards = [
    { id: 1, image: "/carousel/slide1.jpg", rotation: -6, yOffset: 2, xOffset: -spread * 2, zIndex: 10, isFirst: true },
    { id: 2, image: "/bestsellers/bs1.jpg", rotation: 4, yOffset: -4, xOffset: -spread, zIndex: 11, isFirst: false },
    { id: 3, image: "/carousel/slide2.webp", rotation: -2, yOffset: 5, xOffset: 0, zIndex: 12, isFirst: false },
    { id: 4, image: "/bestsellers/bs2.jpg", rotation: 5, yOffset: -2, xOffset: spread, zIndex: 13, isFirst: false },
    { id: 5, image: "/carousel/slide3.jpg", rotation: -4, yOffset: 3, xOffset: spread * 2, zIndex: 14, isFirst: false },
  ];

  const cardVariants = {
    hidden: { opacity: 0, y: 150, x: 0, scale: 0.8, rotate: 0 },
    show: (custom) => ({
      opacity: 1,
      y: custom.yOffset,
      x: custom.xOffset,
      scale: 1,
      rotate: custom.rotation,
      transition: {
        type: "spring",
        damping: 22,
        stiffness: 75,
        delay: custom.isFirst ? 0 : 0.5 // Red one first, others together at 0.5s
      }
    }),
  };

  const handleShopNow = () => {
    if (onShopNow) {
      onShopNow();
    } else {
      window.scrollTo({ top: window.innerHeight * 0.8, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative w-full min-h-[75vh] bg-[#F5F5DC] flex flex-col items-center justify-center pt-16 pb-12 overflow-hidden">
      
      {/* Title */}
      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.1 }}
        transition={{ duration: 0.8 }}
        className="text-4xl md:text-5xl font-bold text-[#36454F] text-center max-w-3xl px-4 z-10 tracking-tight"
        style={{ fontFamily: 'Inter, sans-serif' }}
      >
        {language === 'ar' 
          ? 'المكان المثالي لعرض جواربك الأنيقة.' 
          : language === 'ku' 
          ? 'شوێنی گونجاو بۆ پیشاندانی گۆرەوییە ناوازەکانت.' 
          : 'A place to display your perfect pair.'}
      </motion.h1>

      {/* Cards Container */}
      <motion.div 
        initial="hidden"
        whileInView="show"
        viewport={{ once: false, amount: 0.1 }}
        className="relative flex items-center justify-center w-full h-[220px] md:h-[280px] mt-8 mb-6 z-20"
      >
        {cards.map((card, index) => {
          return (
            <motion.div
              key={card.id}
              custom={card}
              variants={cardVariants}
              whileHover={{ 
                scale: 1.05, 
                rotate: 0, 
                zIndex: 40,
                y: card.yOffset - 15,
                transition: { duration: 0.3 }
              }}
              style={{ zIndex: card.zIndex }}
              className="absolute w-28 h-36 md:w-36 md:h-44 rounded-2xl shadow-xl overflow-hidden border-[3px] border-white cursor-pointer bg-white"
            >
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{
                  duration: 3 + index * 0.4, // Stagger continuous float speed so they look natural
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="w-full h-full"
              >
                <img 
                  src={card.image} 
                  alt={`Hawrisha Bazaar ${card.id}`} 
                  className="w-full h-full object-cover"
                />
              </motion.div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Subtitle */}
      <motion.p 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.1 }}
        transition={{ duration: 0.8, delay: 0.8 }}
        className="text-gray-600 text-center max-w-xl px-6 mb-6 text-sm z-10"
      >
        {language === 'ar' 
          ? 'اكتشف مجموعة الجوارب الفريدة من Hawrisha. نحن نقدم لك الجودة والراحة مع كل خطوة.' 
          : language === 'ku' 
          ? 'کۆمەڵە گۆرەوییە تایبەتەکانی هاوریێشا بدۆزەرەوە. ئێمە کوالێتی و ئاسوودەییتان پێشکەش دەکەین لەگەڵ هەموو هەنگاوێکدا.' 
          : 'Hawrisha offers premium comfort and style. Discover our unique collection that resonates with your everyday journey.'}
      </motion.p>

      <motion.button
        onClick={handleShopNow}
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: false, amount: 0.1 }}
        transition={{ duration: 0.5, delay: 1.0 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="px-6 py-2.5 bg-[#36454F] hover:bg-[#B2AC88] text-white rounded-full font-medium transition-all duration-300 shadow-lg z-10 text-sm md:text-base cursor-pointer"
      >
        {t('hero.shop_now') || 'Shop Now'}
      </motion.button>

    </div>
  );
}
