import { motion } from 'framer-motion';

export default function CenteredShowcase() {
  const cards = [
    { id: 1, image: "/carousel/slide1.jpg", rotation: -15, xOffset: -45, yOffset: 15, zIndex: 10 },
    { id: 2, image: "/bestsellers/bs1.jpg", rotation: -8, xOffset: -25, yOffset: 8, zIndex: 11 },
    { id: 3, image: "/carousel/slide2.webp", rotation: 0, xOffset: 0, yOffset: 0, zIndex: 12 },
    { id: 4, image: "/bestsellers/bs2.jpg", rotation: 8, xOffset: 25, yOffset: -8, zIndex: 13 },
    { id: 5, image: "/carousel/slide3.jpg", rotation: 15, xOffset: 45, yOffset: -15, zIndex: 14 },
  ];

  const cardVariants = {
    hidden: (custom) => ({
      opacity: 0,
      x: custom.xOffset * 4, // Start widely spread out
      y: custom.yOffset * 4,
      rotate: custom.rotation * 2,
      scale: 1.5 // Start larger
    }),
    show: (custom) => ({
      opacity: 1,
      x: custom.xOffset,
      y: custom.yOffset,
      rotate: custom.rotation,
      scale: 1, // Shrink back together
      transition: {
        type: "spring",
        damping: 15,
        stiffness: 70,
        delay: 0.4
      }
    })
  };

  const textVariants = {
    hidden: { opacity: 0, y: 40 },
    show: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.8, ease: "easeOut", staggerChildren: 0.1 } 
    }
  };

  return (
    <section className="relative w-full bg-[#f4f3e6] py-32 px-6 overflow-hidden flex items-center justify-center min-h-[70vh]">
      
      {/* Background Text Container */}
      <motion.div 
        initial="hidden"
        whileInView="show"
        viewport={{ once: false, amount: 0.4 }}
        variants={textVariants}
        className="max-w-4xl mx-auto text-center z-10 relative"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: false, amount: 0.4 }}
          transition={{ type: "spring", delay: 0.8 }}
          className="absolute -top-10 left-[10%] bg-[#1a1a1a] text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg"
        >
          @hhawrisha
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: false, amount: 0.4 }}
          transition={{ type: "spring", delay: 1.0 }}
          className="absolute -top-5 right-[10%] bg-[#2b6cb0] text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg"
        >
          @premium
        </motion.div>

        <motion.h2 
          variants={textVariants}
          className="text-3xl md:text-5xl lg:text-5xl font-semibold text-[#2d3748] leading-snug md:leading-tight tracking-tight"
        >
          Whether you're a style enthusiast looking to upgrade your wardrobe <br className="hidden md:block"/>
          / or someone seeking unique comfort, <span className="text-[#38b2ac]">Hawrisha</span> connects <br className="hidden md:block"/>
          you to a world of creativity &amp; <span className="text-orange-500 line-through decoration-gray-400">commerce</span> quality.
        </motion.h2>
      </motion.div>

      {/* Foreground Centered Image Deck */}
      <motion.div 
        initial="hidden"
        whileInView="show"
        viewport={{ once: false, amount: 0.4 }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%] md:-translate-y-1/2 z-20 w-40 h-56 md:w-48 md:h-64 pointer-events-none"
      >
        {cards.map((card) => (
          <motion.div
            key={card.id}
            custom={card}
            variants={cardVariants}
            style={{ zIndex: card.zIndex, x: "-50%", y: "-50%" }}
            className="absolute top-1/2 left-1/2 w-full h-full rounded-2xl shadow-2xl overflow-hidden border-2 border-white bg-white pointer-events-auto cursor-pointer"
            whileHover={{ scale: 1.1, zIndex: 40, transition: { duration: 0.2 } }}
          >
            <img src={card.image} 
              alt={`Sock Deck ${card.id}`} 
              className="w-full h-full object-cover" onError={(e) => { e.target.onerror = null; e.target.src = '/categories/cat1.jpg'; }} />
          </motion.div>
        ))}
      </motion.div>

      {/* Bottom Icons/Navigation Dots (Decorative) */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex space-x-4 z-10">
        <div className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition cursor-pointer">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path></svg>
        </div>
        <div className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition cursor-pointer bg-white">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
        </div>
        <div className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition cursor-pointer">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14M12 5l7 7-7 7"></path></svg>
        </div>
      </div>
    </section>
  );
}
