import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, User, Heart, ShoppingCart, ChevronDown, Menu, X, Store } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.jsx';

const HawrishaH = ({ size = 28, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M 4 2 h 5 v 20 H 3 a 2 2 0 0 1 -2 -2 a 2 2 0 0 1 2 -2 h 1 V 2 Z M 15 2 h 5 v 20 H 14 a 2 2 0 0 1 -2 -2 a 2 2 0 0 1 2 -2 h 1 V 2 Z M 9 10 h 6 v 3 H 9 Z" />
  </svg>
);

export default function Header({ currentView, onViewChange, cartCount, wishlistCount, onCartClick, onWishlistClick, onSearch, isLoggedIn, currentUser, currentUserRole, currentUserStoreName, onLoginClick, onLogoutClick }) {
  const { language, setLanguage, t } = useLanguage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [headerSearchTerm, setHeaderSearchTerm] = useState('');
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);

  const langDropdownRef = useRef(null);
  const userDropdownRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (isLangDropdownOpen && langDropdownRef.current && !langDropdownRef.current.contains(event.target)) {
        setIsLangDropdownOpen(false);
      }
      if (isUserDropdownOpen && userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setIsUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick, true);
    document.addEventListener('touchstart', handleOutsideClick, true);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick, true);
      document.removeEventListener('touchstart', handleOutsideClick, true);
    };
  }, [isLangDropdownOpen, isUserDropdownOpen]);

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'ar', name: 'العربية' },
    { code: 'ku', name: 'کوردی' }
  ];

  const isRTL = language === 'ar' || language === 'ku';

  return (
    <header className="bg-white/80 backdrop-blur-md text-brand-charcoal border-b border-brand-sage/10 sticky top-0 z-50 shadow-sm transition-all duration-300">
      {/* Top Bar */}
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        
        {/* Left: Language (Desktop) or Hamburger Menu (Mobile) */}
        <div className="flex items-center">
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden text-brand-charcoal hover:text-[#B2AC88] cursor-pointer transition-colors p-1"
          >
            <Menu size={24} />
          </button>
          
          {/* Desktop Language Selector */}
          <div ref={langDropdownRef} className="hidden md:block relative">
            <button 
              onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
              className="flex items-center space-x-1 cursor-pointer text-sm font-medium hover:text-[#B2AC88] transition-colors select-none bg-transparent border-0"
            >
              <span>{language === 'en' ? 'English' : language === 'ar' ? 'العربية' : 'کوردی'}</span>
              <ChevronDown size={14} className={`transition-transform duration-300 ${isLangDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {isLangDropdownOpen && (
                <>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute start-0 mt-2 w-32 bg-white border border-gray-100 rounded-xl shadow-lg py-1.5 z-20 font-sans"
                  >
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => {
                          setLanguage(lang.code);
                          setIsLangDropdownOpen(false);
                        }}
                        className={`w-full text-start px-4 py-2 text-xs font-semibold hover:bg-gray-50 transition-colors cursor-pointer border-0 ${
                          language === lang.code ? 'text-[#B2AC88]' : 'text-brand-charcoal'
                        }`}
                      >
                        {lang.name}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Center: Logo */}
        <div className="flex-1 flex justify-center">
          <button 
            onClick={() => {
              onViewChange('home');
              setIsMobileMenuOpen(false);
            }}
            dir="ltr"
            className="flex items-center gap-[2px] cursor-pointer hover:opacity-90 select-none active:scale-[0.98] transition-all text-[#1a365d]"
          >
            <HawrishaH size={38} className="text-[#1a365d] shrink-0" />
            <div className="flex flex-col items-start leading-[0.9] text-start">
              <span className="text-[21px] font-black tracking-[0.06em] uppercase font-sans">AWRISHA</span>
              <span className="text-[9px] font-extrabold tracking-[0.35em] uppercase font-sans text-[#B2AC88] mt-1">SOCKS</span>
            </div>
          </button>
        </div>

        {/* Right: Icons */}
        <div className="flex items-center space-x-3.5 md:space-x-5">
          <div className="hidden md:flex items-center space-x-2 relative">
            <AnimatePresence>
              {isSearchOpen && (
                <motion.form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (headerSearchTerm.trim() && onSearch) {
                      onSearch(headerSearchTerm.trim());
                    }
                  }}
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 280, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="flex items-center border border-brand-charcoal/10 rounded-full px-4 py-1.5 bg-gray-50/50"
                >
                  <input
                    type="text"
                    placeholder={t('nav.search_placeholder')}
                    value={headerSearchTerm}
                    onChange={(e) => {
                      setHeaderSearchTerm(e.target.value);
                      if (onSearch) onSearch(e.target.value);
                    }}
                    className="w-full text-xs sm:text-sm bg-transparent focus:outline-none text-brand-charcoal placeholder-gray-400 font-semibold"
                    autoFocus
                  />
                  {headerSearchTerm && (
                    <button
                      type="button"
                      onClick={() => {
                        setHeaderSearchTerm('');
                        if (onSearch) onSearch('');
                      }}
                      className="text-gray-400 hover:text-brand-charcoal ml-1 cursor-pointer"
                    >
                      <X size={14} />
                    </button>
                  )}
                </motion.form>
              )}
            </AnimatePresence>
            <button 
              type="button"
              onClick={() => {
                if (isSearchOpen) {
                  setIsSearchOpen(false);
                  setHeaderSearchTerm('');
                  if (onSearch) onSearch('');
                } else {
                  setIsSearchOpen(true);
                }
              }}
              className="hover:text-[#B2AC88] transition-colors cursor-pointer active:scale-90 p-1"
            >
              {isSearchOpen ? <X size={20} /> : <Search size={22} />}
            </button>
          </div>
          <div ref={userDropdownRef} className="relative hidden md:block">
            <button 
              onClick={() => {
                if (isLoggedIn) {
                  setIsUserDropdownOpen(!isUserDropdownOpen);
                } else {
                  onLoginClick();
                }
              }}
              className={`hover:text-[#B2AC88] transition-colors cursor-pointer active:scale-90 p-1 flex items-center ${
                isLoggedIn ? 'text-[#C08081]' : 'text-brand-charcoal'
              }`}
            >
              <User size={22} />
            </button>

            <AnimatePresence>
              {isLoggedIn && isUserDropdownOpen && (
                <>
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute end-0 mt-2.5 w-48 bg-white border border-[#E9ECEF] rounded-2xl shadow-xl py-3 px-4 z-20 font-sans"
                  >
                    <div className="pb-2.5 border-b border-gray-100 mb-2">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{language === 'ar' ? 'مسجل الدخول باسم' : language === 'ku' ? 'چوونەژوورەوە وەک' : 'Signed In As'}</p>
                      <p className="text-xs font-bold text-[#36454F] truncate mt-0.5">{currentUser}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setIsUserDropdownOpen(false);
                        onViewChange('account');
                      }}
                      className="w-full text-start text-xs font-semibold text-brand-charcoal hover:text-[#B2AC88] transition-colors py-1.5 cursor-pointer uppercase tracking-wider border-0"
                    >
                      {t('account_page.title')}
                    </button>
                    {currentUserRole === 'vendor' && (
                      <>
                        <div className="h-px bg-gray-150 my-1" />
                        <button
                          type="button"
                          onClick={() => {
                            setIsUserDropdownOpen(false);
                            onViewChange('vendor_dashboard');
                          }}
                          className="w-full text-start text-xs font-semibold text-brand-charcoal hover:text-[#B2AC88] transition-colors py-1.5 cursor-pointer uppercase tracking-wider border-0"
                        >
                          {t('vendor_dashboard.title')}
                        </button>
                      </>
                    )}
                    <div className="h-px bg-gray-150 my-1" />
                    <button
                      type="button"
                      onClick={() => {
                        setIsUserDropdownOpen(false);
                        onLogoutClick();
                      }}
                      className="w-full text-start text-xs font-semibold text-red-500 hover:text-red-650 transition-colors py-1.5 cursor-pointer uppercase tracking-wider border-0"
                    >
                      {t('nav.sign_out')}
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
          
          {/* Wishlist Icon */}
          <button 
            onClick={onWishlistClick}
            className="hover:text-[#B2AC88] transition-colors relative cursor-pointer active:scale-90 p-1"
          >
            <Heart size={22} />
            <motion.span 
              key={wishlistCount}
              initial={{ scale: 0.6 }}
              animate={{ scale: [1, 1.3, 1] }}
              className="absolute -top-1 -end-1 bg-brand-charcoal text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold"
            >
              {wishlistCount}
            </motion.span>
          </button>
          
          {/* Cart Icon */}
          <button 
            onClick={onCartClick}
            className="hover:text-[#B2AC88] transition-colors relative cursor-pointer active:scale-90 p-1"
          >
            <ShoppingCart size={22} />
            <motion.span 
              key={cartCount}
              initial={{ scale: 0.6 }}
              animate={{ scale: [1, 1.45, 1] }}
              transition={{ type: "spring", stiffness: 450, damping: 12 }}
              className="absolute -top-1 -end-1 bg-[#B2AC88] text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold shadow-xs select-none"
            >
              {cartCount}
            </motion.span>
          </button>
        </div>
      </div>

      {/* Navigation (Desktop only) */}
      <nav className="hidden md:block container mx-auto px-4 pb-4">
        <ul className="flex justify-center gap-8 text-sm font-medium select-none">
          <li className="relative py-1">
            <button 
              onClick={() => onViewChange('home')}
              className={`hover:text-[#B2AC88] cursor-pointer transition-colors pb-1.5 relative ${
                currentView === 'home' ? 'text-[#B2AC88] font-bold' : 'text-brand-charcoal'
              }`}
            >
              {t('nav.home')}
            </button>
          </li>
          <li 
            onClick={() => {
              onViewChange('home');
              setTimeout(() => {
                const el = document.getElementById('categories-section') || document.querySelector('.grid-cols-2');
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }, 200);
            }}
            className="flex items-center gap-1 hover:text-[#B2AC88] transition-colors cursor-pointer py-1 pb-1.5 relative text-brand-charcoal"
          >
            <span>{t('nav.categories')}</span>
            <ChevronDown size={14} />
          </li>
          <li className="relative py-1">
            <button 
              onClick={() => onViewChange('all_products')}
              className={`hover:text-[#B2AC88] cursor-pointer transition-colors pb-1.5 relative ${
                currentView === 'all_products' ? 'text-[#B2AC88] font-bold' : 'text-brand-charcoal'
              }`}
            >
              {t('nav.all_products')}
            </button>
          </li>
          <li className="relative py-1">
            <button 
              onClick={() => onViewChange('story')}
              className={`hover:text-[#B2AC88] cursor-pointer transition-colors pb-1.5 relative ${
                currentView === 'story' ? 'text-[#B2AC88] font-bold' : 'text-brand-charcoal'
              }`}
            >
              {t('nav.story')}
            </button>
          </li>
          <li className="relative py-1">
            <button 
              onClick={() => onViewChange('stores')}
              className={`hover:text-[#B2AC88] cursor-pointer transition-colors pb-1.5 relative ${
                currentView === 'stores' ? 'text-[#B2AC88] font-bold' : 'text-brand-charcoal'
              }`}
            >
              {t('nav.stores')}
            </button>
          </li>
          <li className="relative py-1">
            <button 
              onClick={() => onViewChange('contact')}
              className={`hover:text-[#B2AC88] cursor-pointer transition-colors pb-1.5 relative ${
                currentView === 'contact' ? 'text-[#B2AC88] font-bold' : 'text-brand-charcoal'
              }`}
            >
              {t('nav.contact')}
            </button>
          </li>
        </ul>
      </nav>

      {/* Mobile Drawer (AnimatePresence) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black z-50 cursor-pointer"
            />
            
            {/* Slide-out Menu Panel */}
            <motion.div
              initial={{ x: isRTL ? '100%' : '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: isRTL ? '100%' : '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className={`fixed top-0 bottom-0 ${isRTL ? 'right-0 border-l' : 'left-0 border-r'} w-80 max-w-[80vw] bg-white shadow-2xl z-50 flex flex-col font-sans p-6 text-brand-charcoal border-gray-150`}
            >
              {/* Header of Mobile Menu */}
              <div className="flex items-center justify-between pb-5 border-b border-gray-100 mb-6">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t('nav.home')}</span>
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-brand-charcoal hover:text-[#B2AC88] cursor-pointer p-1"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Navigation Links in Mobile Menu */}
              <div className="flex-1 space-y-4 overflow-y-auto pr-2 rtl:pl-2 rtl:pr-0">
                <button
                  type="button"
                  onClick={() => {
                    onViewChange('home');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full text-start py-2 text-base font-bold uppercase tracking-wider transition-colors cursor-pointer border-0 ${
                    currentView === 'home' ? 'text-[#B2AC88]' : 'text-brand-charcoal'
                  }`}
                >
                  {t('nav.home')}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onViewChange('home');
                    setIsMobileMenuOpen(false);
                    // Add quick scroll target to homepage categories
                    setTimeout(() => {
                      const el = document.getElementById('categories-section') || document.querySelector('.grid-cols-2');
                      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }, 200);
                  }}
                  className="w-full text-start py-2 text-base font-bold uppercase tracking-wider text-brand-charcoal cursor-pointer border-0"
                >
                  {t('nav.categories')}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onViewChange('all_products');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full text-start py-2 text-base font-bold uppercase tracking-wider transition-colors cursor-pointer border-0 ${
                    currentView === 'all_products' ? 'text-[#B2AC88]' : 'text-brand-charcoal'
                  }`}
                >
                  {t('nav.all_products')}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onViewChange('story');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full text-start py-2 text-base font-bold uppercase tracking-wider transition-colors cursor-pointer border-0 ${
                    currentView === 'story' ? 'text-[#B2AC88]' : 'text-brand-charcoal'
                  }`}
                >
                  {t('nav.story')}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onViewChange('stores');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full text-start py-2 text-base font-bold uppercase tracking-wider transition-colors cursor-pointer border-0 ${
                    currentView === 'stores' ? 'text-[#B2AC88]' : 'text-brand-charcoal'
                  }`}
                >
                  {t('nav.stores')}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onViewChange('contact');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full text-start py-2 text-base font-bold uppercase tracking-wider transition-colors cursor-pointer border-0 ${
                    currentView === 'contact' ? 'text-[#B2AC88]' : 'text-brand-charcoal'
                  }`}
                >
                  {t('nav.contact')}
                </button>
                
                <div className="h-px bg-gray-100 my-6" />

                {/* Profile & Search in Mobile Menu */}
                <div className="space-y-4 pt-1">
                  <button 
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      if (onSearch) onSearch('');
                      onViewChange('all_products');
                    }}
                    className="flex items-center space-x-3.5 rtl:space-x-reverse text-brand-charcoal hover:text-[#B2AC88] text-sm font-semibold transition-colors cursor-pointer border-0 w-full text-start"
                  >
                    <Search size={18} />
                    <span>{t('nav.search_store')}</span>
                  </button>
                  
                  {isLoggedIn ? (
                    <div className="space-y-3.5 pt-1.5 border-t border-gray-100 mt-4">
                      <div className="flex items-center space-x-3 rtl:space-x-reverse text-xs text-gray-400 font-semibold select-none px-1">
                        <User size={16} />
                        <span>{language === 'ar' ? 'مسجل باسم' : language === 'ku' ? 'چوونەژوورەوە وەک' : 'Signed in as'} <strong className="text-[#36454F]">{currentUser}</strong></span>
                      </div>
                      <button 
                        type="button"
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          onViewChange('account');
                        }}
                        className="flex items-center space-x-3.5 rtl:space-x-reverse text-brand-charcoal hover:text-[#B2AC88] text-sm font-semibold transition-colors cursor-pointer border-0 w-full text-start"
                      >
                        <User size={18} />
                        <span className="uppercase tracking-wider">{t('account_page.title')}</span>
                      </button>
                      {currentUserRole === 'vendor' && (
                        <button 
                          type="button"
                          onClick={() => {
                            setIsMobileMenuOpen(false);
                            onViewChange('vendor_dashboard');
                          }}
                          className="flex items-center space-x-3.5 rtl:space-x-reverse text-brand-charcoal hover:text-[#B2AC88] text-sm font-semibold transition-colors cursor-pointer border-0 w-full text-start"
                        >
                          <Store size={18} className="text-gray-500" />
                          <span className="uppercase tracking-wider">{t('vendor_dashboard.title')}</span>
                        </button>
                      )}
                      <button 
                        type="button"
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          onLogoutClick();
                        }}
                        className="flex items-center space-x-3.5 rtl:space-x-reverse text-red-500 hover:text-red-650 text-sm font-bold uppercase tracking-wider transition-colors cursor-pointer border-0 w-full text-start"
                      >
                        <span>{t('nav.sign_out')}</span>
                      </button>
                    </div>
                  ) : (
                    <button 
                      type="button"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        onLoginClick();
                      }}
                      className="flex items-center space-x-3.5 rtl:space-x-reverse text-brand-charcoal hover:text-[#B2AC88] text-sm font-semibold transition-colors cursor-pointer border-0 w-full text-start"
                    >
                      <User size={18} />
                      <span>{t('nav.sign_in')}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Footer of Mobile Menu */}
              <div className="border-t border-gray-100 pt-6 mt-6">
                <div className="flex flex-col space-y-2.5">
                  <span className="text-xs font-semibold text-gray-400">{t('nav.language')}:</span>
                  <div className="flex flex-wrap gap-2">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => {
                          setLanguage(lang.code);
                          setIsMobileMenuOpen(false);
                        }}
                        className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-colors cursor-pointer ${
                          language === lang.code
                            ? 'bg-[#B2AC88] text-white border-[#B2AC88]'
                            : 'bg-transparent text-brand-charcoal border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        {lang.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
