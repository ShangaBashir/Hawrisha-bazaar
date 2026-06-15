import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, User, Heart, ShoppingCart, ChevronDown, Menu, X, Store, Settings } from 'lucide-react';
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

const getColorStyle = (colorClass) => {
  if (!colorClass) return {};
  if (colorClass.startsWith('bg-[#') && colorClass.endsWith(']')) {
    return { backgroundColor: colorClass.slice(4, -1) };
  }
  if (colorClass.startsWith('#')) {
    return { backgroundColor: colorClass };
  }
  return {};
};

export default function Header({ currentView, onViewChange, cartCount, wishlistCount, onCartClick, onWishlistClick, onSearch, isLoggedIn, currentUser, currentUserRole, currentUserStoreName, onLoginClick, onLogoutClick, onFilterSelect }) {
  const { language, setLanguage, t, tCategory } = useLanguage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [headerSearchTerm, setHeaderSearchTerm] = useState('');
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [isCategoriesDropdownOpen, setIsCategoriesDropdownOpen] = useState(false);
  const [isMobileCategoriesOpen, setIsMobileCategoriesOpen] = useState(false);
  
  const [categoriesList, setCategoriesList] = useState([]);
  const [badgesList, setBadgesList] = useState([]);
  const [colorsList, setColorsList] = useState([]);
  const [stylesList, setStylesList] = useState([]);
  const [materialsList, setMaterialsList] = useState([]);
  const [seasonsList, setSeasonsList] = useState([]);
  const [sizesList, setSizesList] = useState([]);
  const [promotionsList, setPromotionsList] = useState([]);

  const [mobileOpenSections, setMobileOpenSections] = useState({
    categories: false,
    badges: false,
    colors: false,
    styles: false,
    materials: false,
    seasons: false,
    sizes: false,
    promotions: false,
  });

  const toggleMobileSection = (sec) => {
    setMobileOpenSections(prev => ({ ...prev, [sec]: !prev[sec] }));
  };

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

  useEffect(() => {
    let active = true;

    // Fetch Categories
    fetch('/api/settings/categories')
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => { if (active) setCategoriesList(data); })
      .catch(() => {
        if (active) setCategoriesList([
          { id: 'animals', name: 'Animals' },
          { id: 'fruits', name: 'Fruits' },
          { id: 'patterns', name: 'Patterns' },
          { id: 'cozy_crew', name: 'Cozy Crew' }
        ]);
      });

    // Fetch Badges
    fetch('/api/settings/badges')
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => { if (active) setBadgesList(data); })
      .catch(() => {
        if (active) setBadgesList([
          { id: 'new', name: 'New' },
          { id: 'bestseller', name: 'Bestseller' },
          { id: 'sale', name: 'Sale' }
        ]);
      });

    // Fetch Colors
    fetch('/api/settings/colors')
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => { if (active) setColorsList(data); })
      .catch(() => {
        if (active) setColorsList([
          { id: 'beige', class: 'bg-[#F5F5DC]', name: 'Classic Beige', family: 'beige' },
          { id: 'sage', class: 'bg-[#B2AC88]', name: 'Sage Green', family: 'sage' },
          { id: 'slate', class: 'bg-[#36454F]', name: 'Charcoal Slate', family: 'slate' },
          { id: 'rose', class: 'bg-[#C08081]', name: 'Dusk Rose', family: 'rose' },
          { id: 'yellow', class: 'bg-yellow-400', name: 'Lemon Yellow', family: 'yellow' },
          { id: 'green', class: 'bg-emerald-600', name: 'Avocado Green', family: 'green' },
          { id: 'purple', class: 'bg-purple-400', name: 'Soft Lavender', family: 'purple' },
          { id: 'orange', class: 'bg-orange-500', name: 'Citrus Orange', family: 'orange' }
        ]);
      });

    // Fetch Styles
    fetch('/api/settings/styles')
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => { if (active) setStylesList(data); })
      .catch(() => {
        if (active) setStylesList([
          { id: 'crew', name: 'Crew' },
          { id: 'ankle', name: 'Ankle' },
          { id: 'no_show', name: 'No Show' },
          { id: 'knee_high', name: 'Knee High' }
        ]);
      });

    // Fetch Materials
    fetch('/api/settings/materials')
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => { if (active) setMaterialsList(data); })
      .catch(() => {
        if (active) setMaterialsList([
          { id: 'cotton', name: 'Cotton' },
          { id: 'bamboo', name: 'Bamboo' },
          { id: 'wool', name: 'Wool' },
          { id: 'polyester', name: 'Polyester' }
        ]);
      });

    // Fetch Seasons
    fetch('/api/settings/seasons')
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => { if (active) setSeasonsList(data); })
      .catch(() => {
        if (active) setSeasonsList([
          { id: 'winter', name: 'Winter' },
          { id: 'summer', name: 'Summer' },
          { id: 'spring', name: 'Spring' },
          { id: 'autumn', name: 'Autumn' },
          { id: 'all_season', name: 'All Season' }
        ]);
      });

    // Fetch Sizes
    fetch('/api/settings/sizes')
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => { if (active) setSizesList(data); })
      .catch(() => {
        if (active) setSizesList([
          { id: 'one_size', name: 'One Size' },
          { id: '35-38', name: '35-38' },
          { id: '39-42', name: '39-42' },
          { id: '43-46', name: '43-46' }
        ]);
      });

    // Fetch Promotions
    fetch('/api/settings/promotions')
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => { if (active) setPromotionsList(data); })
      .catch(() => {
        if (active) setPromotionsList([
          { id: 'buy_2_get_1_free', name: 'Buy 2 Get 1 Free' },
          { id: 'new_season_promo', name: 'New Season Promo' }
        ]);
      });

    return () => { active = false; };
  }, []);

  const uniqueColorFilters = useMemo(() => {
    if (colorsList.length === 0) return [];
    const families = [];
    const seen = new Set();
    colorsList.forEach(col => {
      const fam = col.family.toLowerCase();
      if (!seen.has(fam)) {
        seen.add(fam);
        families.push({
          name: fam,
          class: col.class
        });
      }
    });
    return families;
  }, [colorsList]);

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'ar', name: 'العربية' },
    { code: 'ku', name: 'کوردی' }
  ];

  const isRTL = language === 'ar' || language === 'ku';

  const renderMobileSubSection = (title, type, list, valueSelector, nameSelector) => {
    const isOpen = mobileOpenSections[type];
    return (
      <div className="w-full border-b border-gray-50/50 pb-1" dir={isRTL ? "rtl" : "ltr"}>
        <button
          type="button"
          onClick={() => toggleMobileSection(type)}
          className="w-full flex items-center justify-between py-1.5 text-sm font-bold text-gray-500 hover:text-[#B2AC88] cursor-pointer border-0 text-start"
        >
          <span>{title}</span>
          <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="ps-4 space-y-1 mt-1 overflow-hidden"
            >
              {type === 'categories' && (
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    if (onFilterSelect) onFilterSelect('categories', ['All']);
                  }}
                  className="w-full text-start py-1 text-xs font-semibold text-gray-400 hover:text-[#B2AC88] cursor-pointer border-0 uppercase tracking-wider"
                >
                  {language === 'ar' ? 'جميع الأقسام' : language === 'ku' ? 'هەموو پۆلەکان' : 'All Categories'}
                </button>
              )}
              {list.map(item => {
                const name = nameSelector ? nameSelector(item) : item.name;
                const value = valueSelector ? valueSelector(item) : item.name;
                return (
                  <button
                    key={item.id || item.name}
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      if (onFilterSelect) onFilterSelect(type, [value]);
                    }}
                    className="w-full text-start py-1 text-xs font-semibold text-gray-400 hover:text-[#B2AC88] cursor-pointer border-0 flex items-center space-x-2"
                  >
                    {type === 'colors' && (
                      <span 
                        className="w-2.5 h-2.5 rounded-full border border-gray-200/50 shrink-0" 
                        style={getColorStyle(item.class)}
                      />
                    )}
                    <span className={type === 'colors' ? 'capitalize' : ''}>{name}</span>
                  </button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

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
                    {currentUserRole === 'admin' && (
                      <>
                        <div className="h-px bg-gray-150 my-1" />
                        <button
                          type="button"
                          onClick={() => {
                            setIsUserDropdownOpen(false);
                            onViewChange('admin');
                          }}
                          className="w-full text-start text-xs font-semibold text-brand-charcoal hover:text-[#B2AC88] transition-colors py-1.5 cursor-pointer uppercase tracking-wider border-0"
                        >
                          {t('admin_dashboard.title')}
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
      <nav className="hidden md:block container mx-auto px-4 pb-4 relative">
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
          <li 
            className="py-1"
            onMouseEnter={() => setIsCategoriesDropdownOpen(true)}
            onMouseLeave={() => setIsCategoriesDropdownOpen(false)}
          >
            <button 
              type="button"
              className="flex items-center gap-1 hover:text-[#B2AC88] cursor-pointer transition-colors pb-1.5 relative text-brand-charcoal font-medium"
            >
              <span>{t('nav.categories')}</span>
              <ChevronDown size={14} className={`transition-transform duration-200 ${isCategoriesDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            <AnimatePresence>
              {isCategoriesDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 15 }}
                  transition={{ duration: 0.2 }}
                  className="absolute left-0 right-0 top-full mt-1 bg-white/95 backdrop-blur-md border border-gray-150 rounded-3xl shadow-2xl p-8 z-50 font-sans grid grid-cols-4 gap-y-8 gap-x-10 text-start"
                >
                  {/* Column 1: Categories & Badges */}
                  <div className="flex flex-col space-y-6">
                    {/* Categories Group */}
                    <div>
                      <h4 className="text-[11px] font-bold text-[#36454F] uppercase tracking-widest pb-2 mb-3 border-b border-gray-100">
                        {language === 'ar' ? 'الفئات' : language === 'ku' ? 'پۆلەکان' : 'Categories'}
                      </h4>
                      <div className="flex flex-col space-y-2">
                        <button
                          type="button"
                          onClick={() => {
                            setIsCategoriesDropdownOpen(false);
                            if (onFilterSelect) onFilterSelect('categories', ['All']);
                          }}
                          className="text-xs font-semibold text-gray-500 hover:text-[#B2AC88] hover:translate-x-1 transition-all duration-200 text-start border-0 bg-transparent py-0.5 cursor-pointer uppercase tracking-wider"
                        >
                          {language === 'ar' ? 'جميع الأقسام' : language === 'ku' ? 'هەموو پۆلەکان' : 'All Categories'}
                        </button>
                        {categoriesList.map(cat => (
                          <button
                            key={cat.id || cat.name}
                            type="button"
                            onClick={() => {
                              setIsCategoriesDropdownOpen(false);
                              if (onFilterSelect) onFilterSelect('categories', [cat.name]);
                            }}
                            className="text-xs font-semibold text-gray-500 hover:text-[#B2AC88] hover:translate-x-1 transition-all duration-200 text-start border-0 bg-transparent py-0.5 cursor-pointer"
                          >
                            {tCategory ? tCategory(cat.name) : cat.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Badges / Labels Group */}
                    <div>
                      <h4 className="text-[11px] font-bold text-[#36454F] uppercase tracking-widest pb-2 mb-3 border-b border-gray-100">
                        {language === 'ar' ? 'الملصقات' : language === 'ku' ? 'نیشانەکان' : 'Badges & Labels'}
                      </h4>
                      <div className="flex flex-col space-y-2">
                        {badgesList.map(badge => (
                          <button
                            key={badge.id || badge.name}
                            type="button"
                            onClick={() => {
                              setIsCategoriesDropdownOpen(false);
                              if (onFilterSelect) onFilterSelect('badges', [badge.name]);
                            }}
                            className="text-xs font-semibold text-gray-500 hover:text-[#B2AC88] hover:translate-x-1 transition-all duration-200 text-start border-0 bg-transparent py-0.5 cursor-pointer"
                          >
                            {badge.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Column 2: Colors & Styles */}
                  <div className="flex flex-col space-y-6">
                    {/* Colors Group */}
                    <div>
                      <h4 className="text-[11px] font-bold text-[#36454F] uppercase tracking-widest pb-2 mb-3 border-b border-gray-100">
                        {language === 'ar' ? 'الألوان' : language === 'ku' ? 'ڕەنگەکان' : 'Colors'}
                      </h4>
                      <div className="flex flex-col space-y-2">
                        {uniqueColorFilters.map(col => (
                          <button
                            key={col.name}
                            type="button"
                            onClick={() => {
                              setIsCategoriesDropdownOpen(false);
                              if (onFilterSelect) onFilterSelect('colors', [col.name]);
                            }}
                            className="flex items-center space-x-2.5 text-xs font-semibold text-gray-500 hover:text-[#B2AC88] hover:translate-x-1 transition-all duration-200 text-start border-0 bg-transparent py-0.5 cursor-pointer capitalize"
                          >
                            <span 
                              className="w-3 h-3 rounded-full border border-gray-200/50 shrink-0" 
                              style={getColorStyle(col.class)}
                            />
                            <span>{col.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Styles Group */}
                    <div>
                      <h4 className="text-[11px] font-bold text-[#36454F] uppercase tracking-widest pb-2 mb-3 border-b border-gray-100">
                        {language === 'ar' ? 'الموديلات' : language === 'ku' ? 'شێوازەکان' : 'Styles'}
                      </h4>
                      <div className="flex flex-col space-y-2">
                        {stylesList.map(st => (
                          <button
                            key={st.id || st.name}
                            type="button"
                            onClick={() => {
                              setIsCategoriesDropdownOpen(false);
                              if (onFilterSelect) onFilterSelect('styles', [st.name]);
                            }}
                            className="text-xs font-semibold text-gray-500 hover:text-[#B2AC88] hover:translate-x-1 transition-all duration-200 text-start border-0 bg-transparent py-0.5 cursor-pointer"
                          >
                            {st.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Column 3: Materials & Seasons */}
                  <div className="flex flex-col space-y-6">
                    {/* Materials Group */}
                    <div>
                      <h4 className="text-[11px] font-bold text-[#36454F] uppercase tracking-widest pb-2 mb-3 border-b border-gray-100">
                        {language === 'ar' ? 'المواد' : language === 'ku' ? 'کەرەستەکان' : 'Materials'}
                      </h4>
                      <div className="flex flex-col space-y-2">
                        {materialsList.map(mat => (
                          <button
                            key={mat.id || mat.name}
                            type="button"
                            onClick={() => {
                              setIsCategoriesDropdownOpen(false);
                              if (onFilterSelect) onFilterSelect('materials', [mat.name]);
                            }}
                            className="text-xs font-semibold text-gray-500 hover:text-[#B2AC88] hover:translate-x-1 transition-all duration-200 text-start border-0 bg-transparent py-0.5 cursor-pointer"
                          >
                            {mat.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Seasons Group */}
                    <div>
                      <h4 className="text-[11px] font-bold text-[#36454F] uppercase tracking-widest pb-2 mb-3 border-b border-gray-100">
                        {language === 'ar' ? 'الفصول' : language === 'ku' ? 'وەرزەکان' : 'Seasons'}
                      </h4>
                      <div className="flex flex-col space-y-2">
                        {seasonsList.map(seas => (
                          <button
                            key={seas.id || seas.name}
                            type="button"
                            onClick={() => {
                              setIsCategoriesDropdownOpen(false);
                              if (onFilterSelect) onFilterSelect('seasons', [seas.name]);
                            }}
                            className="text-xs font-semibold text-gray-500 hover:text-[#B2AC88] hover:translate-x-1 transition-all duration-200 text-start border-0 bg-transparent py-0.5 cursor-pointer"
                          >
                            {seas.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Column 4: Sizes & Promotions */}
                  <div className="flex flex-col space-y-6">
                    {/* Sizes Group */}
                    <div>
                      <h4 className="text-[11px] font-bold text-[#36454F] uppercase tracking-widest pb-2 mb-3 border-b border-gray-100">
                        {language === 'ar' ? 'المقاسات' : language === 'ku' ? 'قەبارەکان' : 'Sizes'}
                      </h4>
                      <div className="flex flex-col space-y-2">
                        {sizesList.map(sz => (
                          <button
                            key={sz.id || sz.name}
                            type="button"
                            onClick={() => {
                              setIsCategoriesDropdownOpen(false);
                              if (onFilterSelect) onFilterSelect('sizes', [sz.name]);
                            }}
                            className="text-xs font-semibold text-gray-500 hover:text-[#B2AC88] hover:translate-x-1 transition-all duration-200 text-start border-0 bg-transparent py-0.5 cursor-pointer"
                          >
                            {sz.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Promotions Group */}
                    <div>
                      <h4 className="text-[11px] font-bold text-[#36454F] uppercase tracking-widest pb-2 mb-3 border-b border-gray-100">
                        {language === 'ar' ? 'العروض الترويجية' : language === 'ku' ? 'کەمپین و عەرزەکان' : 'Promotions'}
                      </h4>
                      <div className="flex flex-col space-y-2">
                        {promotionsList.map(promo => (
                          <button
                            key={promo.id || promo.name}
                            type="button"
                            onClick={() => {
                              setIsCategoriesDropdownOpen(false);
                              if (onFilterSelect) onFilterSelect('promotions', [promo.name]);
                            }}
                            className="text-xs font-semibold text-gray-500 hover:text-[#B2AC88] hover:translate-x-1 transition-all duration-200 text-start border-0 bg-transparent py-0.5 cursor-pointer"
                          >
                            {promo.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
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
                    onViewChange('stores');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full text-start py-2 text-base font-bold uppercase tracking-wider transition-colors cursor-pointer border-0 ${
                    currentView === 'stores' ? 'text-[#B2AC88]' : 'text-brand-charcoal'
                  }`}
                >
                  {t('nav.stores')}
                </button>

                {/* Collapsible Categories Section in Mobile */}
                <div className="w-full">
                  <button
                    type="button"
                    onClick={() => setIsMobileCategoriesOpen(!isMobileCategoriesOpen)}
                    className="w-full flex items-center justify-between py-2 text-base font-bold uppercase tracking-wider text-brand-charcoal cursor-pointer border-0"
                  >
                    <span>{t('nav.categories')}</span>
                    <ChevronDown size={16} className={`transition-transform duration-200 ${isMobileCategoriesOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  <AnimatePresence>
                    {isMobileCategoriesOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="ps-4 mt-2 space-y-2 overflow-hidden border-l border-gray-100/70"
                      >
                        {renderMobileSubSection(
                          language === 'ar' ? 'الفئات' : language === 'ku' ? 'پۆلەکان' : 'Categories',
                          'categories',
                          categoriesList,
                          null,
                          tCategory ? (c) => tCategory(c.name) : null
                        )}
                        {renderMobileSubSection(
                          language === 'ar' ? 'الملصقات' : language === 'ku' ? 'نیشانەکان' : 'Badges & Labels',
                          'badges',
                          badgesList
                        )}
                        {renderMobileSubSection(
                          language === 'ar' ? 'الألوان' : language === 'ku' ? 'ڕەنگەکان' : 'Colors',
                          'colors',
                          uniqueColorFilters,
                          (c) => c.name
                        )}
                        {renderMobileSubSection(
                          language === 'ar' ? 'الموديلات' : language === 'ku' ? 'شێوازەکان' : 'Styles',
                          'styles',
                          stylesList
                        )}
                        {renderMobileSubSection(
                          language === 'ar' ? 'المواد' : language === 'ku' ? 'کەرەستەکان' : 'Materials',
                          'materials',
                          materialsList
                        )}
                        {renderMobileSubSection(
                          language === 'ar' ? 'الفصول' : language === 'ku' ? 'وەرزەکان' : 'Seasons',
                          'seasons',
                          seasonsList
                        )}
                        {renderMobileSubSection(
                          language === 'ar' ? 'المقاسات' : language === 'ku' ? 'قەبارەکان' : 'Sizes',
                          'sizes',
                          sizesList
                        )}
                        {renderMobileSubSection(
                          language === 'ar' ? 'العروض الترويجية' : language === 'ku' ? 'کەمپین و عەرزەکان' : 'Promotions',
                          'promotions',
                          promotionsList
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

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
                      {currentUserRole === 'admin' && (
                        <button 
                          type="button"
                          onClick={() => {
                            setIsMobileMenuOpen(false);
                            onViewChange('admin');
                          }}
                          className="flex items-center space-x-3.5 rtl:space-x-reverse text-brand-charcoal hover:text-[#B2AC88] text-sm font-semibold transition-colors cursor-pointer border-0 w-full text-start"
                        >
                          <Settings size={18} className="text-gray-500" />
                          <span className="uppercase tracking-wider">{t('admin_dashboard.title')}</span>
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
