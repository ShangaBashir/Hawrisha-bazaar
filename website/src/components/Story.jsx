import { motion } from 'framer-motion';
import { 
  Sparkles, 
  Award, 
  HeartHandshake, 
  ChevronRight, 
  Check, 
  ShieldCheck,
  Heart,
  Truck
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function Story({ onViewChange }) {
  const { t, language } = useLanguage();
  const isRTL = language === 'ar' || language === 'ku';

  // Stagger animation setups
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 35 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', damping: 20 } }
  };

  const highlights = [
    {
      icon: <Award size={20} className="text-[#B2AC88]" />,
      title: t('story_page.highlight1_title'),
      description: t('story_page.highlight1_desc')
    },
    {
      icon: <ShieldCheck size={20} className="text-[#B2AC88]" />,
      title: t('story_page.highlight2_title'),
      description: t('story_page.highlight2_desc')
    },
    {
      icon: <Sparkles size={20} className="text-[#B2AC88]" />,
      title: t('story_page.highlight3_title'),
      description: t('story_page.highlight3_desc')
    },
    {
      icon: <HeartHandshake size={20} className="text-[#B2AC88]" />,
      title: t('story_page.highlight4_title'),
      description: t('story_page.highlight4_desc')
    }
  ];

  return (
    <div className="py-12 bg-brand-beige min-h-screen font-sans selection:bg-[#B2AC88]/30 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <span className="text-[11px] font-bold text-[#C08081] uppercase tracking-[0.25em] bg-[#C08081]/10 px-3.5 py-1.5 rounded-full inline-block mb-3.5">
            {t('story_page.tagline')}
          </span>
          <h1 className="text-3xl md:text-5xl font-black text-[#36454F] tracking-wide mb-4 uppercase">
            {t('story_page.title')}
          </h1>
          <p className="text-gray-500 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
            {t('story_page.subtitle')}
          </p>
        </motion.div>

        {/* Narrative & Philosophy Block */}
        <motion.div 
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto space-y-8 text-center mb-24"
        >
          <h2 className="text-2xl md:text-3xl font-black text-[#36454F] uppercase tracking-wider flex items-center justify-center">
            <span className="w-1.5 h-7 bg-[#B2AC88] rounded-full mr-3.5 rtl:mr-0 rtl:ml-3.5 inline-block"></span>
            {t('story_page.philosophy')}
          </h2>
          <p className="text-sm md:text-base lg:text-lg text-gray-600 leading-relaxed max-w-3xl mx-auto">
            {t('story_page.philosophy_desc')}
          </p>
          <div className="relative max-w-2xl mx-auto py-8 px-10 rounded-3xl bg-[#B2AC88]/5 border border-dashed border-[#B2AC88]/30 mt-8">
            <span className="absolute -top-4 left-6 rtl:left-auto rtl:right-6 text-6xl font-serif text-[#B2AC88]/30 pointer-events-none">“</span>
            <p className="text-sm md:text-lg text-[#36454F] italic font-semibold leading-relaxed">
              {t('story_page.quote')}
            </p>
            <span className="absolute -bottom-10 right-6 rtl:right-auto rtl:left-6 text-6xl font-serif text-[#B2AC88]/30 pointer-events-none">”</span>
          </div>
        </motion.div>

        {/* Brand Overview: Mission and Values */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: false, margin: '-100px' }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24"
        >
          {/* Our Mission */}
          <motion.div 
            variants={itemVariants}
            whileHover={{ y: -6, scale: 1.015 }}
            whileTap={{ scale: 0.985 }}
            className={`bg-transparent border border-[#36454F]/15 ${isRTL ? 'border-r-4 border-r-[#C08081] border-l-0' : 'border-l-4 border-l-[#C08081]'} rounded-3xl p-8 hover:shadow-md transition-all duration-300 relative overflow-hidden group`}
          >
            <div className={`absolute top-0 ${isRTL ? 'left-0 rounded-br-full' : 'right-0 rounded-bl-full'} w-24 h-24 bg-[#C08081]/5 pointer-events-none`}></div>
            <div className="w-12 h-12 rounded-2xl bg-[#C08081]/10 flex items-center justify-center text-[#C08081] mb-6 transition-transform duration-300 group-hover:scale-110">
              <Sparkles size={24} />
            </div>
            <h3 className="text-base font-bold text-[#36454F] uppercase tracking-wider mb-3 flex items-center">
              {t('story_page.mission')}
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              {t('story_page.mission_desc')}
            </p>
          </motion.div>

          {/* Our Values */}
          <motion.div 
            variants={itemVariants}
            whileHover={{ y: -6, scale: 1.015 }}
            whileTap={{ scale: 0.985 }}
            className={`bg-transparent border border-[#36454F]/15 ${isRTL ? 'border-r-4 border-r-[#B2AC88] border-l-0' : 'border-l-4 border-l-[#B2AC88]'} rounded-3xl p-8 hover:shadow-md transition-all duration-300 relative overflow-hidden group`}
          >
            <div className={`absolute top-0 ${isRTL ? 'left-0 rounded-br-full' : 'right-0 rounded-bl-full'} w-24 h-24 bg-[#B2AC88]/5 pointer-events-none`}></div>
            <div className="w-12 h-12 rounded-2xl bg-[#B2AC88]/10 flex items-center justify-center text-[#B2AC88] mb-6 transition-transform duration-300 group-hover:scale-110">
              <Heart size={24} />
            </div>
            <h3 className="text-base font-bold text-[#36454F] uppercase tracking-wider mb-4 flex items-center">
              {t('story_page.values')}
            </h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-2.5 rtl:space-x-reverse">
                <div className="w-1.5 h-1.5 rounded-full bg-[#B2AC88] mt-1.5 shrink-0" />
                <p className="text-xs text-gray-500 leading-relaxed">
                  <strong className="text-[#36454F]">{language === 'ar' ? 'الجودة' : language === 'ku' ? 'کوالیتی' : 'Quality'}:</strong> {language === 'ar' ? 'نختبر كل جورب بمفرده لضمان متانة تدوم طويلاً.' : language === 'ku' ? 'ئێمە تاقیکردنەوە بۆ هەموو تاکە گۆرەوییەک دەکەین بۆ دڵنیابوونەوە لە مانەوەی درێژخایەن.' : 'We test every single sock to ensure long-lasting durability.'}
                </p>
              </div>
              <div className="flex items-start space-x-2.5 rtl:space-x-reverse">
                <div className="w-1.5 h-1.5 rounded-full bg-[#B2AC88] mt-1.5 shrink-0" />
                <p className="text-xs text-gray-500 leading-relaxed">
                  <strong className="text-[#36454F]">{language === 'ar' ? 'الخدمة' : language === 'ku' ? 'خزمەتگوزاری' : 'Service'}:</strong> {language === 'ar' ? 'نساعد عملائنا بسرعة ولطف وسعادة.' : language === 'ku' ? 'خزمەتگوزاری: ئێمە یارمەتی کڕیارەکانمان دەدەین بە خێرایی، بە باشی و بە دڵخۆشی.' : 'We help our customers quickly, nicely, and happily.'}
                </p>
              </div>
              <div className="flex items-start space-x-2.5 rtl:space-x-reverse">
                <div className="w-1.5 h-1.5 rounded-full bg-[#B2AC88] mt-1.5 shrink-0" />
                <p className="text-xs text-gray-500 leading-relaxed">
                  <strong className="text-[#36454F]">{language === 'ar' ? 'الإبداع' : language === 'ku' ? 'داهێنان' : 'Creativity'}:</strong> {language === 'ar' ? 'نصمم باستمرار موديلات شخصيات فريدة.' : language === 'ku' ? 'داهێنان: ئێمە بە بەردەوامی شێوازی کەسایەتی ناوازە دیزاین دەکەین.' : 'We continuously design unique character styles.'}
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Quality Material Highlights Grid */}
        <div className="mb-24">
          <div className="text-center mb-16">
            <h2 className="text-2xl md:text-3xl font-bold text-[#36454F] uppercase tracking-wider">
              {language === 'ar' ? 'تميز المواد' : language === 'ku' ? 'ناوازەیی کەرەستە' : 'MATERIAL EXCELLENCE'}
            </h2>
            <p className="text-xs text-gray-400 mt-2">
              {language === 'ar' ? 'تم تصميم كل التفاصيل من أجل المتانة والأناقة' : language === 'ku' ? 'هەموو وردەکارییەک ئەندازیاری کراوە بۆ مانەوە و جوانی' : 'Every detail is engineered for durability and style'}
            </p>
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: false, margin: '-100px' }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {highlights.map((h, idx) => (
              <motion.div 
                key={idx}
                variants={itemVariants}
                whileHover={{ y: -8, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-white border border-gray-100/80 rounded-2xl p-6 shadow-xs hover:shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className={`w-10 h-10 rounded-xl bg-[#B2AC88]/10 flex items-center justify-center text-[#B2AC88] mb-5`}>
                    {h.icon}
                  </div>
                  <h3 className="text-xs font-bold text-[#36454F] uppercase tracking-widest mb-3.5">{h.title}</h3>
                  <p className="text-[11px] text-gray-500 leading-relaxed">{h.description}</p>
                </div>
                
                <div className="mt-6 flex items-center space-x-1.5 rtl:space-x-reverse text-[10px] text-[#B2AC88] font-bold uppercase tracking-wider">
                  <Check size={11} />
                  <span>{language === 'ar' ? 'جودة مضمونة' : language === 'ku' ? 'کوالیتی مسۆگەرکراوە' : 'Quality Assured'}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Core Values Stats banner */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: false, margin: '-100px' }}
          transition={{ duration: 0.5 }}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className="bg-white border border-gray-100 rounded-3xl p-8 md:p-10 shadow-sm text-center mb-24 grid grid-cols-1 sm:grid-cols-3 gap-8 cursor-pointer"
        >
          <div className="space-y-1">
            <div className="w-9 h-9 rounded-full bg-[#B2AC88]/10 flex items-center justify-center text-[#B2AC88] mx-auto mb-2">
              <Truck size={18} />
            </div>
            <h3 className="text-2xl md:text-3xl font-black text-[#36454F]">{language === 'ar' ? 'في جميع أنحاء العراق' : language === 'ku' ? 'تەواوی عێراق' : 'Iraq Wide'}</h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{language === 'ar' ? 'توصيل محلي سريع' : language === 'ku' ? 'گەیاندنی خێرای ناوخۆیی' : 'Fast Local Delivery'}</p>
          </div>
          <div className="space-y-1 sm:border-x sm:border-gray-100">
            <div className="w-9 h-9 rounded-full bg-[#B2AC88]/10 flex items-center justify-center text-[#B2AC88] mx-auto mb-2">
              <Sparkles size={18} />
            </div>
            <h3 className="text-2xl md:text-3xl font-black text-[#36454F]">50+</h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{language === 'ar' ? 'تصاميم فريدة' : language === 'ku' ? 'دیزاینی ناوازە' : 'Unique Designs'}</p>
          </div>
          <div className="space-y-1">
            <div className="w-9 h-9 rounded-full bg-[#B2AC88]/10 flex items-center justify-center text-[#B2AC88] mx-auto mb-2">
              <Award size={18} />
            </div>
            <h3 className="text-2xl md:text-3xl font-black text-[#36454F]">100%</h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{language === 'ar' ? 'ضمان الرضا 100%' : language === 'ku' ? 'مسۆگەرکردنی ڕەزامەندی' : 'Satisfaction Guaranteed'}</p>
          </div>
        </motion.div>

        {/* CTA section */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-[#C08081]/10 rounded-3xl p-10 md:p-14 text-center max-w-4xl mx-auto border border-[#C08081]/15 relative overflow-hidden"
        >
          {/* Absolute decorative circle */}
          <div className={`absolute -bottom-20 ${isRTL ? '-left-20' : '-right-20'} w-44 h-44 bg-[#C08081]/5 rounded-full pointer-events-none`}></div>

          <h3 className="text-xl md:text-3xl font-black text-[#36454F] uppercase tracking-wider mb-4">
            {language === 'ar' ? 'هل أنت مستعد للانضمام إلى ثورة الجوارب؟' : language === 'ku' ? 'ئامادەیت بۆ پەیوەندیکردن بە شۆڕشی گۆرەوییەکانەوە؟' : 'READY TO JOIN THE SOCKS REVOLUTION?'}
          </h3>
          <p className="text-xs md:text-sm text-gray-500 max-w-md mx-auto leading-relaxed mb-8">
            {language === 'ar' ? 'أظهر أناقتك مع مجموعاتنا. امشِ براحة ومظهر فريد كل يوم.' : language === 'ku' ? 'شێوازی خۆت پیشان بدە لەگەڵ کۆکراوەکانمان. ڕۆژانە بە ئارامی و دەرکەوتنی ناوازەوە هەنگاو بنێ.' : 'Show your style with our collections. Walk with comfort and a unique look every day.'}
          </p>

          <button 
            onClick={() => onViewChange && onViewChange('all_products')}
            className="inline-flex items-center space-x-2 rtl:space-x-reverse bg-[#36454F] hover:bg-[#C08081] text-white text-[11px] font-bold uppercase tracking-[0.2em] px-8 py-3.5 rounded-full cursor-pointer shadow-md hover:scale-105 active:scale-95 transition-all duration-300"
          >
            <span>{language === 'ar' ? 'استكشف المنتجات' : language === 'ku' ? 'بینینی بەرهەمەکان' : 'Explore Products'}</span>
            <ChevronRight size={12} className="rtl:rotate-180" />
          </button>
        </motion.div>

      </div>
    </div>
  );
}
