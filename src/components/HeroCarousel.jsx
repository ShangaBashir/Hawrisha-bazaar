import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function HeroCarousel() {
  const { t, language } = useLanguage();
  const [current, setCurrent] = useState(0);

  const slides = [
    {
      id: 1,
      title: t('hero.slide1_title'),
      subtitle: t('hero.slide1_subtitle'),
      image: "/carousel/slide1.jpg",
    },
    {
      id: 2,
      title: t('hero.slide2_title'),
      subtitle: t('hero.slide2_subtitle'),
      image: "/carousel/slide2.webp",
    },
    {
      id: 3,
      title: t('hero.slide3_title'),
      subtitle: t('hero.slide3_subtitle'),
      image: "/carousel/slide3.jpg",
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrent((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrent((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <div className="relative w-full h-[500px] overflow-hidden bg-brand-beige">
      <AnimatePresence>
        <motion.div
          key={current}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="absolute inset-0 flex flex-col items-center justify-center text-white"
        >
           <motion.div 
             initial={{ scale: 1.15, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             exit={{ scale: 0.95, opacity: 0 }}
             transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
             className="absolute inset-0 bg-cover bg-center bg-no-repeat"
             style={{ backgroundImage: `url(${slides[current].image})` }}
           />
           <div className="absolute inset-0 bg-black/40" />
           <div className="relative z-10 flex flex-col items-center justify-center px-4 text-center">
             <motion.h2 
               initial={{ opacity: 0, y: 35 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ 
                 duration: 0.8, 
                 type: "spring", 
                 damping: 15, 
                 stiffness: 80, 
                 delay: 0.2 
               }}
               className="text-5xl font-bold mb-4 drop-shadow-md font-sans"
             >
               {slides[current].title}
             </motion.h2>
             <motion.p 
               initial={{ opacity: 0, y: 25 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ 
                 duration: 0.8, 
                 type: "spring", 
                 damping: 15, 
                 stiffness: 80, 
                 delay: 0.35 
               }}
               className="text-xl mb-8 drop-shadow-md font-sans max-w-lg"
             >
               {slides[current].subtitle}
             </motion.p>
             <motion.button 
               initial={{ opacity: 0, scale: 0.9, y: 15 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               transition={{ 
                 duration: 0.7, 
                 type: "spring", 
                 damping: 12, 
                 stiffness: 90, 
                 delay: 0.5 
               }}
               whileHover={{ 
                 scale: 1.08, 
                 backgroundColor: "var(--color-brand-rose, #C08081)", 
                 color: "#ffffff",
                 boxShadow: "0px 12px 30px rgba(192, 128, 129, 0.45)"
               }}
               whileTap={{ scale: 0.95 }}
               className="px-8 py-3 bg-white text-brand-charcoal font-semibold rounded-full hover:bg-brand-beige transition-colors shadow-lg cursor-pointer font-sans"
             >
               {t('hero.shop_now')}
             </motion.button>
           </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      <motion.button 
        onClick={prevSlide}
        whileHover={{ scale: 1.15, backgroundColor: "rgba(255, 255, 255, 0.45)" }}
        whileTap={{ scale: 0.9 }}
        className="absolute start-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 rounded-full text-white cursor-pointer z-20 transition-all duration-300"
      >
        <ChevronLeft size={32} className="rtl:rotate-180" />
      </motion.button>
      <motion.button 
        onClick={nextSlide}
        whileHover={{ scale: 1.15, backgroundColor: "rgba(255, 255, 255, 0.45)" }}
        whileTap={{ scale: 0.9 }}
        className="absolute end-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 rounded-full text-white cursor-pointer z-20 transition-all duration-300"
      >
        <ChevronRight size={32} className="rtl:rotate-180" />
      </motion.button>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center space-x-2.5 z-20">
        {slides.map((_, idx) => (
          <motion.button
            key={idx}
            onClick={() => setCurrent(idx)}
            animate={{
              width: idx === current ? 26 : 10,
              height: 10,
              backgroundColor: idx === current ? "#ffffff" : "rgba(255, 255, 255, 0.4)",
            }}
            whileHover={{
              scale: idx === current ? 1 : 1.15,
              backgroundColor: idx === current ? "#ffffff" : "rgba(255, 255, 255, 0.75)",
            }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
            className="rounded-full cursor-pointer"
          />
        ))}
      </div>
    </div>
  );
}
