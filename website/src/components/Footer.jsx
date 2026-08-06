import { useLanguage } from '../context/LanguageContext.jsx';
import { Mail } from 'lucide-react';

const HawrishaH = ({ size = 32, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size * 19 / 20}
    height={size}
    viewBox="1 2 19 20"
    fill="currentColor"
    className={className}
  >
    <path d="M 4 2 h 5 v 20 H 3 a 2 2 0 0 1 -2 -2 a 2 2 0 0 1 2 -2 h 1 V 2 Z M 15 2 h 5 v 20 H 14 a 2 2 0 0 1 -2 -2 a 2 2 0 0 1 2 -2 h 1 V 2 Z M 9 10 h 6 v 3 H 9 Z" />
  </svg>
);

const TikTokIcon = ({ size = 17, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M16.6 5.82A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 0 1-2.59 2.5 2.59 2.59 0 0 1 0-5.18c.27 0 .53.04.77.12v-3.2a5.76 5.76 0 0 0-.77-.05A5.72 5.72 0 0 0 4.14 15.3a5.72 5.72 0 0 0 9.4 4.4 5.72 5.72 0 0 0 2-4.35V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3a4.29 4.29 0 0 1-3.24-1.48z" />
  </svg>
);

const InstagramIcon = ({ size = 17, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

export default function Footer({ onViewChange, onFilterSelect }) {
  const { language } = useLanguage();
  const isRTL = language === 'ar' || language === 'ku';

  const linkClass = "hover:text-[#C08081] opacity-75 hover:opacity-100 transition-all cursor-pointer text-start border-0 bg-transparent p-0 text-brand-beige";

  return (
    <footer className="bg-brand-charcoal text-brand-beige pt-14 pb-8 font-sans" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12">
        {/* 3-Column Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8 items-start">

          {/* Column 1 — About Hawrisha Bazaar */}
          <div className="md:col-span-5 space-y-4">
            <div
              onClick={() => onViewChange && onViewChange('home')}
              dir="ltr"
              className="inline-flex items-center gap-1 text-white select-none cursor-pointer hover:opacity-90 transition-all active:scale-[0.98]"
            >
              <HawrishaH size={32} className="text-white shrink-0" />
              <div className="flex flex-col items-start leading-[0.9] text-start">
                <span className="text-[16px] font-black tracking-[0.06em] uppercase font-sans text-white">AWRISHA</span>
                <span className="text-[7px] font-extrabold tracking-[0.35em] uppercase font-sans text-[#B2AC88] mt-1">BAZAAR</span>
              </div>
            </div>
            <p className="text-sm text-brand-beige/75 leading-relaxed max-w-sm">
              {language === 'ar'
                ? 'وجهتك المفضلة للجوارب الفاخرة في العراق — نجمع بين الجودة والأسلوب والتنوع لتناسب كل شخصية وذوق.'
                : language === 'ku'
                ? 'شوێنی خوازراوی تۆ بۆ گۆرەوی بەرز لە عێراق — تێکەڵەیەک لە کوالێتی، ستایل و جۆراوجۆری بۆ هەموو کەسێک.'
                : 'Your favourite destination for premium socks in Iraq — where quality, style, and variety come together for every taste.'}
            </p>
          </div>

          {/* Column 2 — Quick Links */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-brand-beige">
              {language === 'ar' ? 'روابط سريعة' : language === 'ku' ? 'بەستەرە خێراکان' : 'QUICK LINKS'}
            </h4>
            <ul className="space-y-2.5 text-sm font-semibold">
              <li>
                <button
                  onClick={() => onViewChange && onViewChange('home')}
                  className={linkClass}
                >
                  {language === 'ar' ? 'الرئيسية' : language === 'ku' ? 'سەرەتا' : 'Home'}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onViewChange && onViewChange('stores')}
                  className={linkClass}
                >
                  {language === 'ar' ? 'المتاجر' : language === 'ku' ? 'فرۆشگاکان' : 'Stores'}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onViewChange && onViewChange('all_products')}
                  className={linkClass}
                >
                  {language === 'ar' ? 'جميع الجوارب' : language === 'ku' ? 'هەموو گۆرەوییەکان' : 'All Socks'}
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    if (onFilterSelect) onFilterSelect('badges', ['New']);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={linkClass}
                >
                  {language === 'ar' ? 'وصل حديثاً' : language === 'ku' ? 'تازە گەیشتووەکان' : 'New Arrivals'}
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    if (onFilterSelect) onFilterSelect('badges', ['Bestseller']);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={linkClass}
                >
                  {language === 'ar' ? 'الأكثر مبيعاً' : language === 'ku' ? 'پڕفڕۆشترینەکان' : 'Best Sellers'}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onViewChange && onViewChange('story')}
                  className={linkClass}
                >
                  {language === 'ar' ? 'قصتنا' : language === 'ku' ? 'چیرۆکی ئێمە' : 'Our Story'}
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3 — Contact Us */}
          <div className="md:col-span-4 space-y-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-brand-beige">
              {language === 'ar' ? 'تواصل معنا' : language === 'ku' ? 'پەیوەندیمان پێوە بکە' : 'CONTACT US'}
            </h4>
            <div className="space-y-3.5 text-xs sm:text-sm font-semibold text-brand-beige/75">

              {/* Email */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-white/10 text-[#B2AC88] flex items-center justify-center shrink-0">
                  <Mail size={15} />
                </div>
                <a
                  href="mailto:hawrishaa@gmail.com"
                  className="hover:text-[#C08081] transition-colors"
                >
                  hawrishaa@gmail.com
                </a>
              </div>

              {/* Instagram */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-white/10 text-[#B2AC88] flex items-center justify-center shrink-0">
                  <InstagramIcon size={15} />
                </div>
                <a
                  href="https://instagram.com/hawrisha_bazaar"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#C08081] transition-colors"
                >
                  @hawrisha_bazaar
                </a>
              </div>

              {/* TikTok */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-white/10 text-[#B2AC88] flex items-center justify-center shrink-0">
                  <TikTokIcon size={15} />
                </div>
                <a
                  href="https://www.tiktok.com/@hawrisha.bazaar"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#C08081] transition-colors"
                >
                  @hawrisha.bazaar
                </a>
              </div>

            </div>
          </div>

        </div>

        {/* Bottom Copyright Divider */}
        <div className="border-t border-white/10 mt-12 pt-6 text-center text-xs font-semibold opacity-40">
          <p>&copy; {new Date().getFullYear()} {language === 'ku' ? 'هەورێشە بازاڕ.' : 'HAWRISHA BAZAAR.'} {language === 'ar' ? 'جميع الحقوق محفوظة.' : language === 'ku' ? 'هەموو مافەکان پارێزراون.' : 'All rights reserved.'}</p>
        </div>
      </div>
    </footer>
  );
}
