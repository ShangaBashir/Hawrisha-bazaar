import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function SocksStory({ isLoggedIn, onReadStory, onJoinUs, onExploreStores }) {
  const { language } = useLanguage();

  return (
    <section className="w-full bg-[#F5F5DC] py-20 px-6 md:px-12 lg:px-24 overflow-hidden border-t border-[#e5e4d7]">
      <div className="max-w-7xl mx-auto">
        
        {/* Title Area */}
        <div className="text-center mb-16">
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.15 }}
            transition={{ duration: 0.5 }}
            className="text-xs md:text-sm font-bold uppercase tracking-widest text-gray-500 mb-2"
          >
            {language === 'ar' ? 'قصة جواربك' : language === 'ku' ? 'چیرۆکی گۆرەویەکەت' : 'Your Socks'} <span className="text-[#C08081]">{language === 'ar' ? 'سرد القصص' : language === 'ku' ? 'گێڕانەوە' : 'Storytelling'}</span>
          </motion.p>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.15 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#36454F] tracking-tight max-w-2xl mx-auto leading-tight"
          >
            {language === 'ar' 
              ? 'كل زوج من الجوارب يروي قصة' 
              : language === 'ku' 
              ? 'هەر جووتێک گۆرەوی چیرۆکێک دەگێڕێتەوە' 
              : 'Every pair of socks tells a story'}
          </motion.h2>
        </div>

        {/* Grid Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* COLUMN 1: LEFT SIDE (Rows 1 & 2) */}
          <div className="lg:col-span-5 flex flex-col gap-8">
            
            {/* Card 1: Explore Local Boutiques & Stores */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.15 }}
              transition={{ duration: 0.6 }}
              className="bg-white rounded-[2rem] p-8 shadow-xl border border-gray-100 flex flex-col justify-between relative overflow-hidden group"
            >
              {/* Top Row: Stores Pill */}
              <div className="flex justify-between items-center mb-6 z-10">
                <span className="flex items-center gap-1.5 px-4 py-1.5 bg-[#F5F5DC] rounded-full text-[10px] font-bold tracking-wider uppercase text-[#36454F] select-none">
                  ★ {language === 'ar' ? 'المتاجر المتميزة' : language === 'ku' ? 'متا نایابەکان' : 'Featured Boutiques'}
                </span>
              </div>

              {/* Overlapping Stores Badges Cluster */}
              <div className="relative h-44 w-full flex items-center justify-center my-4 select-none">
                {/* Left Boutique Badge */}
                <div className="absolute transform -translate-x-12 translate-y-2 w-16 h-16 rounded-full border-2 border-white shadow-lg bg-[#B2AC88] text-white flex flex-col items-center justify-center font-bold text-[10px] tracking-tight leading-none z-10 transition-transform duration-300 group-hover:scale-105">
                  <span>SAGE</span>
                  <span className="text-[6px] font-medium tracking-widest mt-0.5">GOLD</span>
                </div>
                
                {/* Right Boutique Badge */}
                <div className="absolute transform translate-x-12 translate-y-2 w-16 h-16 rounded-full border-2 border-white shadow-lg bg-[#C08081] text-white flex flex-col items-center justify-center font-bold text-[10px] tracking-tight leading-none z-10 transition-transform duration-300 group-hover:scale-105">
                  <span>ROSE</span>
                  <span className="text-[6px] font-medium tracking-widest mt-0.5">PINK</span>
                </div>

                {/* Center Boutique Badge */}
                <div className="absolute w-20 h-20 rounded-full border-4 border-white shadow-xl bg-[#36454F] text-[#F5F5DC] flex flex-col items-center justify-center font-black text-xs tracking-wider leading-none z-20 transition-transform duration-500 group-hover:rotate-6">
                  <span>HAWRISHA</span>
                  <span className="text-[6px] font-bold tracking-widest text-[#B2AC88] mt-1">BAZAAR</span>
                </div>
                
                {/* Bubble Tag */}
                <span className="absolute top-2 right-[18%] bg-[#C08081] text-white text-[9px] font-black py-1 px-3 rounded-full shadow-lg z-30 transform rotate-12 group-hover:rotate-0 transition-transform duration-300">
                  @Boutiques
                </span>
              </div>

              {/* Bottom text & explore button */}
              <div className="mt-4 text-left">
                <h3 className="text-xl font-bold text-[#36454F] mb-2">
                  {language === 'ar' ? 'اكتشف المتاجر المحلية' : language === 'ku' ? 'متاکانی هاوڕێشا بدۆزەرەوە' : 'Discover Local Boutiques'}
                </h3>
                <p className="text-gray-500 text-xs md:text-sm leading-relaxed mb-6">
                  {language === 'ar' 
                    ? 'تسوق من العلامات التجارية الفريدة والمتاجر الشريكة المستقلة في منصة واحدة...' 
                    : language === 'ku' 
                    ? 'لە مارکە ناوازەکان و فرۆشگاکانی هاوبەشمان لە یەک شوێندا بازاڕ بکە...' 
                    : 'Shop from unique independent brand collections and our local boutique partners...'}
                </p>
                <button 
                  onClick={onExploreStores}
                  className="px-6 py-2.5 bg-[#36454F] hover:bg-[#B2AC88] text-white hover:scale-105 active:scale-95 rounded-full text-xs font-bold transition-all cursor-pointer border-0 shadow-md flex items-center gap-1"
                >
                  {language === 'ar' ? 'زيارة المتاجر' : language === 'ku' ? 'سەردانی متاکان' : 'Explore Stores'} &rarr;
                </button>
              </div>
            </motion.div>

            {/* Card 3: Spin Your Style into Gold */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.15 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-white rounded-[2rem] p-6 shadow-xl border border-gray-100 overflow-hidden group flex flex-col justify-between"
            >
              <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden mb-6 bg-slate-50">
                <img src="/carousel/slide3.jpg" alt="Vibrant Socks Style" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" onError={(e) => { e.target.onerror = null; e.target.src = '/categories/cat1.jpg'; }} />
              </div>
              <div className="text-left px-2 pb-2">
                <h3 className="text-xl font-bold text-[#36454F] mb-2">
                  {isLoggedIn 
                    ? (language === 'ar' ? 'انضممت إلى مجتمع هاوريشا' : language === 'ku' ? 'بوویت بە بەشێک لە کۆمەڵگەی هاوڕێشا' : 'Joined the Hawrisha Community')
                    : (language === 'ar' ? 'انضم إلى مجتمع هاوريشا' : language === 'ku' ? 'ببە بە بەشێک لە کۆمەڵگەی هاوڕێشا' : 'Join the Hawrisha Community')}
                </h3>
                <p className="text-gray-500 text-xs md:text-sm leading-relaxed mb-4">
                  {language === 'ar' 
                    ? 'تواصل مع محبي الجوارب وكن جزءًا من مجتمع متنامٍ حيث يجتمع الأسلوب والراحة والإبداع.' 
                    : language === 'ku' 
                    ? 'پەیوەندی بکە لەگەڵ خۆشەویستانی گۆرەوی و ببە بە بەشێک لە کۆمەڵگەیەکی گەشەسەندوو کە تێیدا ستایل، ئاسوودەیی و داهێنان بەیەکەوە کۆدەبنەوە.' 
                    : 'Connect with sock lovers and Become part of a growing community where style, comfort, and creativity come together.'}
                </p>
                {!isLoggedIn && (
                  <button onClick={onJoinUs} className="text-xs font-bold text-[#C08081] hover:text-[#B2AC88] transition-colors border-0 bg-transparent p-0 cursor-pointer">
                    {language === 'ar' ? 'انضم إلينا الآن' : language === 'ku' ? 'ئێستا پەیوەندیمان پێوە بکە' : 'Join us now'} &rarr;
                  </button>
                )}
              </div>
            </motion.div>

          </div>

          {/* COLUMN 2: RIGHT SIDE (Rows 1 & 2) */}
          <div className="lg:col-span-7 flex flex-col gap-8">
            
            {/* Card 2: Where Art Breathes Comfort */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.15 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white rounded-[2rem] p-8 shadow-xl border border-gray-100 flex flex-col gap-6"
            >
              {/* Accent colored image box (Using brand red #C08081 / or Charcoal #36454F) */}
              <div className="w-full aspect-[16/9] rounded-2xl bg-[#C08081] flex items-center justify-center overflow-hidden relative group">
                <div className="absolute inset-0 bg-gradient-to-tr from-black/30 via-transparent to-transparent opacity-60"></div>
                <img src="/carousel/slide2.webp" 
                  alt="Artistic Socks Showcase" 
                  className="w-[85%] h-[85%] object-cover rounded-xl shadow-2xl border-4 border-white group-hover:scale-105 transition-transform duration-500" onError={(e) => { e.target.onerror = null; e.target.src = '/categories/cat1.jpg'; }} />
              </div>
              <div className="text-left">
                <h3 className="text-xl font-bold text-[#36454F] mb-2">
                  {language === 'ar' ? 'حيث يتنفس الفن الراحة' : language === 'ku' ? 'لەو شوێنەی کە هونەر ئاسودەیی دروست دەکات' : 'Where Art Breathes Comfort'}
                </h3>
                <p className="text-gray-500 text-xs md:text-sm leading-relaxed mb-4 line-clamp-1">
                  {language === 'ar' 
                    ? 'لفترة طويلة، تم التعامل مع الجوارب كأمر ثانوي — مجرد أقمشة بيضاء أو سوداء بسيطة مخفية داخل الأحذية.' 
                    : language === 'ku' 
                    ? 'بۆ ماوەیەکی زۆر، گۆرەوی وەک شتێکی لاوەکی سەیر کراوە — قوماشێکی سپی یان ڕەشی سادە کە لەناو پێڵاودا شاراوەتەوە.' 
                    : 'For too long, socks have been treated as an afterthought — simple white or black fabrics hidden inside shoes.'}
                </p>
                <button onClick={onReadStory} className="text-xs font-bold text-[#C08081] hover:text-[#B2AC88] transition-colors border-0 bg-transparent p-0 cursor-pointer">
                  {language === 'ar' ? 'اقرأ القصة' : language === 'ku' ? 'خوێندنەوەی چیرۆک' : 'Read story'} &rarr;
                </button>
              </div>
            </motion.div>

            {/* Card 4: Personal Identity */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.15 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-white rounded-[2rem] p-8 shadow-xl border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-8 items-center"
            >
              {/* Left text column */}
              <div className="text-left order-2 md:order-1">
                <span className="text-[10px] font-bold text-[#B2AC88] uppercase tracking-widest block mb-2">Socks Box</span>
                <h3 className="text-2xl font-bold text-[#36454F] mb-4">
                  {language === 'ar' ? 'الهوية الشخصية' : language === 'ku' ? 'ناسنامەی کەسی' : 'Personal Identity'}
                </h3>
                <p className="text-gray-500 text-xs md:text-sm leading-relaxed mb-6">
                  {language === 'ar' 
                    ? 'صمم صندوق جواربك الخاص ليعبر تمامًا عن شخصيتك وتفردك.' 
                    : language === 'ku' 
                    ? 'سندووقی گۆرەوی تایبەتی خۆت دروستبکە کە گوزارشت لە کەسایەتی خۆت بکات.' 
                    : 'Design your own custom box of socks that represents your unique style and personality.'}
                </p>
                <button className="text-xs font-bold text-[#C08081] hover:text-[#B2AC88] transition-colors border-0 bg-transparent p-0 cursor-pointer">
                  {language === 'ar' ? 'اقرأ القصة' : language === 'ku' ? 'خوێندنەوەی چیرۆک' : 'Read story'} &rarr;
                </button>
              </div>
              
              {/* Right mockup screen column */}
              <div className="order-1 md:order-2 bg-[#36454F] rounded-2xl aspect-[3/4] p-6 flex flex-col justify-between text-white relative shadow-2xl">
                <div className="flex justify-between items-center text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                  <span>Hawrisha Brand</span>
                  <span>Special Box</span>
                </div>
                <div className="my-auto flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-[#B2AC88]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-bold text-center text-[#B2AC88] leading-tight">
                    Personal Identity <br/>Socks Pack
                  </h4>
                </div>
                <div className="text-[10px] text-gray-400 text-center uppercase tracking-widest font-semibold">
                  Unbox Comfort
                </div>
              </div>
            </motion.div>

          </div>

        </div>

      </div>
    </section>
  );
}
