import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function SocksStory({ isLoggedIn, onReadStory, onJoinUs, onExploreStores, onContactClick }) {
  const { language, t } = useLanguage();

  return (
    <section className="w-full bg-[#F5F5DC] py-12 md:py-16 px-4 sm:px-6 lg:px-8 overflow-hidden border-t border-[#e5e4d7]">
      <div className="max-w-7xl mx-auto">
        
        {/* Title Area */}
        <div className="text-center mb-12">
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.15 }}
            transition={{ duration: 0.5 }}
            className="text-xs md:text-sm font-bold uppercase tracking-widest text-gray-500 mb-2"
          >
            {language === 'ar' ? 'قصة جواربك' : language === 'ku' ? 'چیرۆکی گۆرەویەکەت' : 'Your Socks'} <span className="text-[#C08081]">{language === 'ar' ? 'سرد القصص' : language === 'ku' ? 'بگێڕەوە' : 'Storytelling'}</span>
          </motion.p>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.15 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#36454F] tracking-tight max-w-2xl mx-auto leading-tight"
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
                  ★ {language === 'ar' ? 'الأزياء المتميزة' : language === 'ku' ? 'فاشیۆن نایابەکان' : 'Featured Fashion'}
                </span>
              </div>

              {/* Overlapping Stores Badges Cluster */}
              <div className="relative h-44 w-full flex items-center justify-center my-4 select-none">
                {/* Left Boutique Badge */}
                <div className="absolute transform -translate-x-12 translate-y-2 w-16 h-16 rounded-full border-2 border-white shadow-lg bg-[#B2AC88] text-white flex flex-col items-start justify-center pl-2 font-bold text-[9px] tracking-tight leading-none z-10 transition-transform duration-300 group-hover:scale-105 select-none">
                  {language === 'ar' ? (
                    <>
                      <span>منزلي</span>
                    </>
                  ) : language === 'ku' ? (
                    <>
                      <span>ماڵیی</span>
                    </>
                  ) : (
                    <>
                      <span>HOMEY</span>
                    </>
                  )}
                </div>
                
                {/* Right Boutique Badge */}
                <div className="absolute transform translate-x-12 translate-y-2 w-16 h-16 rounded-full border-2 border-white shadow-lg bg-[#C08081] text-white flex flex-col items-center justify-center font-bold text-[9px] tracking-tight leading-none z-10 transition-transform duration-300 group-hover:scale-105 select-none">
                  {language === 'ar' ? (
                    <>
                      <span>دافئ</span>
                    </>
                  ) : language === 'ku' ? (
                    <>
                      <span>ئاسودە</span>
                    </>
                  ) : (
                    <>
                      <span>COZY</span>
                    </>
                  )}
                </div>

                {/* Center Boutique Badge */}
                <div className="absolute w-20 h-20 rounded-full border-4 border-white shadow-xl bg-[#36454F] text-[#F5F5DC] flex flex-col items-center justify-center font-black text-[10px] tracking-wider leading-none z-20 transition-transform duration-500 group-hover:rotate-6">
                  <span>{language === 'ku' ? 'هەورێشە' : 'HAWRISHA'}</span>
                  <span className="text-[6px] font-bold tracking-widest text-[#B2AC88] mt-0.5">{language === 'ku' ? 'بازاڕ' : 'BAZAAR'}</span>
                </div>
                
                {/* Bubble Tag */}
                <span className="absolute top-2 right-[18%] bg-[#C08081] text-white text-[9px] font-black py-1 px-3 rounded-full shadow-lg z-30 transform rotate-12 group-hover:rotate-0 transition-transform duration-300">
                  @Fashion
                </span>
              </div>

              {/* Bottom text & explore button */}
              <div className="mt-4 text-left">
                <h3 className="text-xl font-bold text-[#36454F] mb-2">
                  {language === 'ar' ? 'اكتشف المتاجر المحلية' : language === 'ku' ? 'فرۆشگاکانی هەورێشە بدۆزەرەوە' : 'Discover Local Boutiques'}
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
                  {language === 'ar' ? 'زيارة المتاجر' : language === 'ku' ? 'سەردانی فرۆشگاکان' : 'Explore Stores'} &rarr;
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
                <img src="/carousel/cominity.jfif" alt="Vibrant Socks Style" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" onError={(e) => { e.target.onerror = null; e.target.src = '/categories/cat1.jpg'; }} />
              </div>
              <div className="text-left px-2 pb-2">
                <h3 className="text-xl font-bold text-[#36454F] mb-2">
                  {isLoggedIn 
                    ? (language === 'ar' ? 'انضممت إلى مجتمع هاوريشا' : language === 'ku' ? 'بوویت بە بەشێک لە کۆمەڵگەی هەورێشە' : 'Joined the Hawrisha Community')
                    : (language === 'ar' ? 'انضم إلى مجتمع هاوريشا' : language === 'ku' ? 'ببە بە بەشێک لە کۆمەڵگەی هەورێشە' : 'Join the Hawrisha Community')}
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
              {/* Image box without colored frame */}
              <div className="w-full aspect-[16/9] rounded-2xl overflow-hidden relative group bg-slate-50">
                <img src="/carousel/artsy2.webp" 
                  alt="Artistic Socks Showcase" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onError={(e) => { e.target.onerror = null; e.target.src = '/categories/cat1.jpg'; }} />
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

            {/* Card 4: Contact Us & Socials */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.15 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-white rounded-[2rem] p-8 shadow-xl border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-8 items-center"
            >
              {/* Left text column */}
              <div className="text-left order-2 md:order-1">
                <h3 className="text-2xl font-bold text-[#36454F] mb-4">
                  {language === 'ar' ? 'تواصل معنا' : language === 'ku' ? 'پەیوەندیمان پێوە بکە' : 'Get in Touch'}
                </h3>
                <p className="text-gray-500 text-xs md:text-sm leading-relaxed mb-6">
                  {language === 'ar' 
                    ? 'لديك أي استفسارات أو تعليقات؟ نحن هنا لمساعدتك. أرسل لنا رسالة مباشرة.' 
                    : language === 'ku' 
                    ? 'پرسیار یان سەرنجت هەیە؟ ئێمە لێرەین بۆ یارمەتیدانت. پەیاممان بۆ بنێرە.' 
                    : 'Have questions, feedback, or need help? Send us a message or find us on Instagram. We are here to help.'}
                </p>
                <button 
                  onClick={onContactClick}
                  className="text-xs font-bold text-[#C08081] hover:text-[#B2AC88] transition-colors border-0 bg-transparent p-0 cursor-pointer"
                >
                  {language === 'ar' ? 'اتصل بنا' : language === 'ku' ? 'پەیوەندیمان پێوە بکە' : 'Contact Us'} &rarr;
                </button>
              </div>
              
              {/* Right mockup screen column (Contact info box) */}
              <div className="order-1 md:order-2 bg-[#36454F] rounded-2xl aspect-[3/4] p-6 flex flex-col justify-between text-white relative shadow-2xl overflow-hidden group">
                <div className="flex justify-between items-center text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                  <span>{t('ui.support')}</span>
                  <span>{t('ui.connect')}</span>
                </div>
                
                <div className="my-auto flex flex-col gap-6 text-left">
                  {/* Email row */}
                  <a href="mailto:hawrishaa@gmail.com" className="flex items-center space-x-3.5 hover:text-[#B2AC88] transition-colors">
                    <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-[#B2AC88]">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider">{t('ui.email_us')}</span>
                      <span className="text-xs font-bold text-white break-all">hawrishaa@gmail.com</span>
                    </div>
                  </a>

                  {/* Instagram row */}
                  <a href="https://www.instagram.com/hawrisha_bazaar" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-3.5 hover:text-[#B2AC88] transition-colors">
                    <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-[#B2AC88]">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <rect width="20" height="20" x="2" y="2" rx="5" ry="5" strokeWidth="2" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zM17.5 6.5h.01" />
                      </svg>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider">{t('ui.instagram')}</span>
                      <span className="text-xs font-bold text-white">@hawrisha_bazaar</span>
                    </div>
                  </a>
                </div>

                <div className="text-[10px] text-gray-400 text-center uppercase tracking-widest font-semibold">
                  {t('ui.always_active')}
                </div>
              </div>
            </motion.div>

          </div>

        </div>

      </div>
    </section>
  );
}
