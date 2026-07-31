import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function ShowcaseSection({ onViewAll }) {
  const { language } = useLanguage();
  const [windowWidth, setWindowWidth] = useState(() => typeof window !== 'undefined' ? window.innerWidth : 1200);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 768;

  // Responsive offsets: clear, beautiful fanned-out spread on mobile matching desktop showcase layout
  const cards = isMobile
    ? [
        { id: 1, image: '/carousel/slide1.jpg',   rotation: -8, yOffset: -6,  xOffset: -75, zIndex: 10, size: 'w-20 h-28' },
        { id: 2, image: '/bestsellers/bs1.jpg',   rotation:  5, yOffset:  12,  xOffset: -38, zIndex: 11, size: 'w-24 h-32' },
        { id: 3, image: '/carousel/slide2.webp',  rotation: -10, yOffset: -4,  xOffset:   2, zIndex: 12, size: 'w-28 h-36' },
        { id: 4, image: '/bestsellers/bs2.jpg',   rotation:  8, yOffset:  14,  xOffset:  40, zIndex: 13, size: 'w-22 h-30' },
        { id: 5, image: '/carousel/slide3.jpg',   rotation: -4, yOffset: -8,   xOffset:  75, zIndex: 14, size: 'w-20 h-28' },
      ]
    : [
        { id: 1, image: '/carousel/slide1.jpg',   rotation: -8, yOffset: -20, xOffset: -180, zIndex: 10, size: 'w-32 h-40 md:w-40 md:h-48' },
        { id: 2, image: '/bestsellers/bs1.jpg',   rotation:  5, yOffset:  30, xOffset:  -90, zIndex: 11, size: 'w-36 h-44 md:w-48 md:h-56' },
        { id: 3, image: '/carousel/slide2.webp',  rotation: -12, yOffset: -10, xOffset:  15, zIndex: 12, size: 'w-40 h-48 md:w-56 md:h-64' },
        { id: 4, image: '/bestsellers/bs2.jpg',   rotation:  8, yOffset:  40, xOffset: 130, zIndex: 13, size: 'w-32 h-32 md:w-44 md:h-44' },
        { id: 5, image: '/carousel/slide3.jpg',   rotation: -4, yOffset: -30, xOffset: 220, zIndex: 14, size: 'w-28 h-36 md:w-36 md:h-48' },
      ];

  const cardVariants = {
    hidden: { opacity: 0, x: 0, y: 0, rotate: 0, scale: 0.8 },
    stacked: {
      opacity: 1,
      x: 0,
      y: 0,
      rotate: 0,
      scale: 1,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
    spread: (custom) => ({
      x: custom.xOffset,
      y: custom.yOffset,
      rotate: custom.rotation,
      opacity: 1,
      transition: {
        type: 'spring',
        damping: 18,
        stiffness: 70,
        delay: isMobile ? 0.3 : 0.8,
      },
    }),
  };

  const textLineVariants = {
    hidden: { opacity: 0, y: -30 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  };

  return (
    <section className="w-full bg-[#F5F5DC] pt-12 pb-24 md:py-20 px-4 sm:px-6 md:px-12 lg:px-24 overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-8 md:gap-16">
        
        {/* Left Side: Text */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: false, amount: 0.2 }}
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.2, delayChildren: 0.1 } },
          }}
          className="flex-1 text-left z-20 w-full"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[#36454F] leading-tight mb-4 md:mb-6 tracking-tight">
            <motion.div variants={textLineVariants} className="block">
              Discover, Sell,
            </motion.div>
            <motion.div variants={textLineVariants} className="block text-[#C08081]">
              & wear socks that
            </motion.div>
            <motion.div variants={textLineVariants} className="block">
              define your style.
            </motion.div>
          </h2>
          <motion.p
            variants={textLineVariants}
            className="text-gray-600 text-sm md:text-base max-w-md mb-6 md:mb-8 leading-relaxed"
          >
            Hawrisha brings together top sock brands and customers in one modern marketplace.
          </motion.p>
          <motion.div variants={textLineVariants} className="flex flex-wrap items-center gap-4">
            <button
              onClick={onViewAll}
              className="px-5 py-2 bg-[#36454F] text-[#FFFFFF] rounded-full font-medium hover:bg-[#C08081] transition-colors duration-300 text-xs cursor-pointer shadow-lg shadow-black/10 hover:scale-105 active:scale-95"
            >
              {language === 'ar' ? 'جميع الجوارب' : language === 'ku' ? 'هەموو گۆرەویەکان' : 'All Socks'}
            </button>
          </motion.div>
        </motion.div>

        {/* Right Side: Animated Image Cluster */}
        <div className="flex-1 relative h-[250px] sm:h-[380px] md:h-[460px] w-full flex items-center justify-center lg:justify-end pr-0 lg:pr-20 z-10 overflow-visible mt-4 sm:mt-0 my-2 sm:my-0">
          <div className="relative flex items-center justify-center w-full h-full scale-100">
            {cards.map((card, index) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, scale: 0.85, x: 0, y: 0, rotate: 0 }}
                whileInView={{ 
                  opacity: 1, 
                  scale: 1,
                  x: card.xOffset, 
                  y: card.yOffset, 
                  rotate: card.rotation,
                }}
                viewport={{ once: false, amount: 0.2 }}
                transition={{
                  type: 'spring',
                  damping: 18,
                  stiffness: 70,
                  delay: index * 0.08,
                }}
                whileHover={{
                  scale: 1.08,
                  rotate: 0,
                  zIndex: 40,
                  transition: { duration: 0.3 },
                }}
                style={{ zIndex: card.zIndex }}
                className={`absolute ${card.size} rounded-[1.25rem] sm:rounded-[1.5rem] shadow-xl overflow-hidden border-2 sm:border-4 border-white bg-white cursor-pointer`}
              >
                <img src={card.image}
                  alt={`Socks ${card.id}`}
                  className="w-full h-full object-cover" onError={(e) => { e.target.onerror = null; e.target.src = '/categories/cat1.jpg'; }} />
              </motion.div>
            ))}
            
            {/* Popout Tags */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.7 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: false, amount: 0.2 }}
              transition={{ delay: 0.4 }}
              className="absolute top-[2%] left-[4%] sm:left-[20%] bg-[#C08081] text-white text-[9px] sm:text-xs font-bold px-2 sm:px-3 py-0.5 sm:py-1.5 rounded-full shadow-md z-30"
            >
              @Elegance
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.7 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: false, amount: 0.2 }}
              transition={{ delay: 0.5 }}
              className="absolute bottom-[4%] right-[2%] sm:right-[5%] bg-[#36454F] text-white text-[9px] sm:text-xs font-bold px-2 sm:px-3 py-0.5 sm:py-1.5 rounded-full shadow-md z-30"
            >
              @Trending
            </motion.div>
          </div>
        </div>

      </div>
    </section>
  );
}
