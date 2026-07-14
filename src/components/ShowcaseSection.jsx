import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function ShowcaseSection({ onViewAll }) {
  const { language } = useLanguage();

  const cards = [
    { id: 1, image: "/carousel/slide1.jpg", rotation: -8, yOffset: -20, xOffset: -180, zIndex: 10, size: "w-32 h-40 md:w-40 md:h-48" },
    { id: 2, image: "/bestsellers/bs1.jpg", rotation: 5, yOffset: 30, xOffset: -90, zIndex: 11, size: "w-36 h-44 md:w-48 md:h-56" },
    { id: 3, image: "/carousel/slide2.webp", rotation: -12, yOffset: -10, xOffset: 15, zIndex: 12, size: "w-40 h-48 md:w-56 md:h-64" },
    { id: 4, image: "/bestsellers/bs2.jpg", rotation: 8, yOffset: 40, xOffset: 130, zIndex: 13, size: "w-32 h-32 md:w-44 md:h-44" },
    { id: 5, image: "/carousel/slide3.jpg", rotation: -4, yOffset: -30, xOffset: 220, zIndex: 14, size: "w-28 h-36 md:w-36 md:h-48" },
  ];

  // Sequence: 
  // 1. Initial (hidden): all stacked at x=0, y=0, rot=0, opacity=0
  // 2. Step 1 (appear stacked): opacity=1, still stacked (like "Shrink back together be one image")
  // 3. Step 2 (fan out): move to final positions.
  
  const cardVariants = {
    hidden: { opacity: 0, x: 0, y: 0, rotate: 0, scale: 0.8 },
    stacked: { 
      opacity: 1, 
      x: 0, 
      y: 0, 
      rotate: 0, 
      scale: 1,
      transition: { duration: 0.6, ease: "easeOut" }
    },
    spread: (custom) => ({
      x: custom.xOffset,
      y: custom.yOffset,
      rotate: custom.rotation,
      transition: { 
        type: "spring", 
        damping: 18, 
        stiffness: 70, 
        delay: 0.8 // Wait for stacking and text to appear before spreading
      }
    }),
  };

  const textLineVariants = {
    hidden: { opacity: 0, y: -30 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" } 
    }
  };

  return (
    <section className="w-full bg-[#F5F5DC] py-20 px-6 md:px-12 lg:px-24 overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-16">
        
        {/* Left Side: Text */}
        <motion.div 
          initial="hidden"
          whileInView="show"
          viewport={{ once: false, amount: 0.3 }}
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.25, delayChildren: 0.1 } }
          }}
          className="flex-1 text-left z-20"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#36454F] leading-tight mb-6 tracking-tight">
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
          <motion.p variants={textLineVariants} className="text-gray-600 text-sm md:text-base max-w-md mb-8 leading-relaxed">
            Hawrisha brings together top sock brands and customers in one modern marketplace.
          </motion.p>
          <motion.div variants={textLineVariants} className="flex flex-wrap items-center gap-4">
            <button 
              onClick={onViewAll}
              className="px-8 py-3.5 bg-[#36454F] text-white rounded-full font-medium hover:bg-[#B2AC88] transition-colors duration-300 text-sm cursor-pointer shadow-lg shadow-black/10"
            >
              {language === 'ar' ? 'جميع الجوارب' : language === 'ku' ? 'هەموو گۆرەویەکان' : 'All Socks'}
            </button>
          </motion.div>
        </motion.div>

        {/* Right Side: Animated Image Cluster */}
        <div className="flex-1 relative h-[400px] md:h-[500px] w-full flex items-center justify-center lg:justify-end pr-0 lg:pr-20 z-10">
          <motion.div
            initial="hidden"
            whileInView={["stacked", "spread"]}
            viewport={{ once: false, amount: 0.3 }}
            className="relative flex items-center justify-center w-full h-full"
          >
            {cards.map((card) => (
              <motion.div
                key={card.id}
                custom={card}
                variants={cardVariants}
                whileHover={{ 
                  scale: 1.05, 
                  rotate: 0, 
                  zIndex: 40,
                  transition: { duration: 0.3 }
                }}
                style={{ zIndex: card.zIndex }}
                className={`absolute ${card.size} rounded-[1.5rem] md:rounded-[2rem] shadow-xl overflow-hidden border-4 border-white bg-white cursor-pointer`}
              >
                <img 
                  src={card.image} 
                  alt={`Socks ${card.id}`} 
                  className="w-full h-full object-cover"
                />
              </motion.div>
            ))}
            
            {/* Popout Tags (Like @howard, @robin in the image) */}
            <motion.div 
              initial={{ opacity: 0, scale: 0 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ type: "spring", delay: 1.5 }}
              className="absolute top-[10%] left-[20%] bg-[#C08081] text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg z-30"
            >
              @Elegance
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ type: "spring", delay: 1.7 }}
              className="absolute bottom-[20%] right-[5%] bg-[#36454F] text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg z-30"
            >
              @Trending
            </motion.div>
          </motion.div>
        </div>

      </div>
    </section>
  );
}
