import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, User, Heart, ShoppingCart, ChevronDown, Menu, X, Settings } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.jsx';

const HawrishaH = ({ size = 28, className = "" }) => (
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

export default function Header({ currentView, onViewChange, cartCount, wishlistCount, onCartClick, onWishlistClick, onSearch, isLoggedIn, currentUser, currentUserRole, onLoginClick, onLogoutClick, onFilterSelect }) {
  const { language, setLanguage, t, tCategory, getLocalized } = useLanguage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [headerSearchTerm, setHeaderSearchTerm] = useState('');
  const searchContainerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isSearchOpen && searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        if (headerSearchTerm.trim() !== '') return;
        setIsSearchOpen(false);
        setHeaderSearchTerm('');
        if (onSearch) onSearch('');
      }
    };

    if (isSearchOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSearchOpen, headerSearchTerm, onSearch]);
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
  const [designsList, setDesignsList] = useState([]);
  const [sportTypesList, setSportTypesList] = useState([]);
  // Bumped whenever we want to re-pull the latest dashboard settings (so
  // category/filter changes made in the admin dashboard appear here live).
  const [settingsVersion, setSettingsVersion] = useState(0);

  const [mobileOpenSections, setMobileOpenSections] = useState({
    categories: false,
    badges: false,
    colors: false,
    styles: false,
    materials: false,
    seasons: false,
    sizes: false,
    promotions: false,
    designs: false,
    sportTypes: false,
  });

  const toggleMobileSection = (sec) => {
    setMobileOpenSections(prev => ({ ...prev, [sec]: !prev[sec] }));
  };

  const [openGroups, setOpenGroups] = useState({
    colors: true,
    gender: true,
    sizes: true,
    materials: true,
    styles: true,
    seasons: true,
    designs: true,
    sportTypes: true,
  });

  const toggleGroup = (group) => {
    setOpenGroups(prev => ({ ...prev, [group]: !prev[group] }));
  };

  const langDropdownRef = useRef(null);
  const categoriesDropdownRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (isLangDropdownOpen && langDropdownRef.current && !langDropdownRef.current.contains(event.target)) {
        setIsLangDropdownOpen(false);
      }
      if (isCategoriesDropdownOpen && categoriesDropdownRef.current && !categoriesDropdownRef.current.contains(event.target)) {
        setIsCategoriesDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick, true);
    document.addEventListener('touchstart', handleOutsideClick, true);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick, true);
      document.removeEventListener('touchstart', handleOutsideClick, true);
    };
  }, [isLangDropdownOpen, isCategoriesDropdownOpen]);

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

    // Fetch Designs
    fetch('/api/settings/designs')
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => { if (active) setDesignsList(data); })
      .catch(() => {
        if (active) setDesignsList([]);
      });

    // Fetch Sport Types
    fetch('/api/settings/sport-types')
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => { if (active) setSportTypesList(data); })
      .catch(() => {
        if (active) setSportTypesList([]);
      });

    return () => { active = false; };
  }, [settingsVersion]);

  // Keep the SOCKS menu in sync with the dashboard: re-pull settings whenever
  // the tab regains focus/visibility (e.g. after editing in the dashboard tab)
  // and whenever the mega menu is opened.
  useEffect(() => {
    const refresh = () => setSettingsVersion(v => v + 1);
    const onVisible = () => { if (document.visibilityState === 'visible') refresh(); };
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  useEffect(() => {
    if (isCategoriesDropdownOpen) setSettingsVersion(v => v + 1);
  }, [isCategoriesDropdownOpen]);

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
    <header className="bg-[#FAF9F5] text-brand-charcoal border-b border-brand-sage/10 sticky top-0 z-50 shadow-sm transition-all duration-300">
      {/* Top Bar */}
      <div className="w-full px-6 sm:px-10 lg:px-12 pt-3 pb-3 lg:pt-5 lg:pb-5">
        {/* Main Top Bar Content */}
        <div className="items-center justify-between w-full flex">
          {/* Left: Language (Desktop) or Hamburger Menu (Mobile) */}
          <div className="flex items-center">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden text-brand-charcoal hover:text-[#B2AC88] cursor-pointer transition-colors p-1"
            >
              <Menu size={24} />
            </button>
            
            {/* Desktop Language Selector */}
            <div ref={langDropdownRef} className="hidden lg:block relative">
              <button 
                onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                className="flex items-center space-x-1 cursor-pointer text-[13px] font-semibold hover:text-[#B2AC88] transition-colors select-none bg-transparent border-0"
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
              className="flex items-center gap-1 cursor-pointer hover:opacity-90 select-none active:scale-[0.98] transition-all text-[#36454F]"
            >
              <HawrishaH size={34} className="text-[#36454F] shrink-0 w-[27px] h-[29px] lg:w-[34px] lg:h-[36px]" />
              <div className="flex flex-col items-start leading-[0.9] text-start">
                <span className="text-[15px] lg:text-[18px] font-black tracking-[0.06em] uppercase font-sans">AWRISHA</span>
                <span className="text-[6.5px] lg:text-[8px] font-extrabold tracking-[0.35em] uppercase font-sans text-[#B2AC88] mt-1.5 mb-0.5">BAZAAR</span>
              </div>
            </button>
          </div>

          {/* Right: Icons */}
          <div className="flex items-center space-x-1 lg:space-x-2.5">
          <div ref={searchContainerRef} className="hidden lg:flex items-center space-x-2 relative">
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
                  animate={{ width: 220, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="flex items-center border border-[#B2AC88] rounded-full px-4 py-1.5 bg-gray-50/50 shadow-sm"
                >
                  <input
                    type="text"
                    placeholder={t('nav.search_placeholder')}
                    value={headerSearchTerm}
                    onChange={(e) => {
                      setHeaderSearchTerm(e.target.value);
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
                  const wasActiveSearch = headerSearchTerm.trim() !== '';
                  setHeaderSearchTerm('');
                  if (wasActiveSearch && onSearch) onSearch('');
                } else {
                  setIsSearchOpen(true);
                }
              }}
              className="hover:text-[#B2AC88] transition-colors cursor-pointer active:scale-90 p-0.5"
            >
              {isSearchOpen ? <X size={19} /> : <Search size={22} />}
            </button>
          </div>

          <div className="hidden lg:block">
            <button 
              onClick={() => {
                if (isLoggedIn) {
                  onViewChange('account');
                } else {
                  onLoginClick();
                }
              }}
              className={`hover:text-[#B2AC88] transition-colors cursor-pointer active:scale-90 p-0.5 flex items-center ${
                isLoggedIn ? 'text-[#C08081]' : 'text-brand-charcoal'
              }`}
            >
              <User size={22} />
            </button>
          </div>
          {/* Mobile Search Button */}
          <button 
            type="button"
            onClick={() => {
              setHeaderSearchTerm('');
              setIsMobileSearchOpen(true);
            }}
            className="lg:hidden hover:text-[#B2AC88] transition-colors relative cursor-pointer active:scale-90 p-0.5 text-brand-charcoal"
          >
            <Search size={20} />
          </button>

          {/* Wishlist Icon */}
          <button 
            onClick={onWishlistClick}
            className="hidden lg:flex hover:text-[#B2AC88] transition-colors relative cursor-pointer active:scale-90 p-0.5"
          >
            <Heart size={22} className="w-[21px] h-[21px] lg:w-[22px] lg:h-[22px]" />
            <motion.span 
              key={wishlistCount}
              initial={{ scale: 0.6 }}
              animate={{ scale: [1, 1.3, 1] }}
              className="absolute -top-1 -end-1 bg-brand-charcoal text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-bold leading-none"
            >
              {wishlistCount}
            </motion.span>
          </button>
          
          {/* Cart Icon */}
          <button 
            onClick={onCartClick}
            className="hover:text-[#B2AC88] transition-colors relative cursor-pointer active:scale-90 p-0.5"
          >
            <ShoppingCart size={22} className="w-[21px] h-[21px] lg:w-[22px] lg:h-[22px]" />
            <motion.span 
              key={cartCount}
              initial={{ scale: 0.6 }}
              animate={{ scale: [1, 1.45, 1] }}
              transition={{ type: "spring", stiffness: 450, damping: 12 }}
              className="absolute -top-1 -end-1 bg-[#B2AC88] text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-bold shadow-xs select-none leading-none"
            >
              {cartCount}
            </motion.span>
          </button>
        </div>
      </div>
    </div>

      {/* Navigation (Desktop only) */}
      <nav className="hidden lg:block w-full px-6 sm:px-10 lg:px-12 pb-3.5 relative">
        <ul className="flex justify-center gap-8 text-xs font-semibold select-none uppercase tracking-wider">
          <li className="relative py-1">
            <button 
              onClick={() => onViewChange('home')}
              className={`hover:text-[#B2AC88] cursor-pointer transition-colors pb-1.5 relative uppercase tracking-wider ${
                currentView === 'home' ? 'text-[#B2AC88] font-bold' : 'text-brand-charcoal'
              }`}
            >
              {t('nav.home')}
            </button>
          </li>
          <li className="relative py-1">
            <button 
              onClick={() => onViewChange('stores')}
              className={`hover:text-[#B2AC88] cursor-pointer transition-colors pb-1.5 relative uppercase tracking-wider ${
                currentView === 'stores' ? 'text-[#B2AC88] font-bold' : 'text-brand-charcoal'
              }`}
            >
              {t('nav.stores')}
            </button>
          </li>
          <li 
            ref={categoriesDropdownRef}
            className="py-1"
          >
            <button 
              type="button"
              onClick={() => setIsCategoriesDropdownOpen(!isCategoriesDropdownOpen)}
              className="flex items-center gap-1 hover:text-[#B2AC88] cursor-pointer transition-colors pb-1.5 relative text-brand-charcoal font-semibold uppercase tracking-wider border-0 bg-transparent"
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
                  className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-100 rounded-2xl shadow-2xl z-50 font-sans text-start normal-case tracking-normal overflow-hidden"
                >
                  {/* Header Banner */}
                  <div className="bg-gradient-to-r from-[#36454F] to-[#4a5f6e] px-8 py-4 flex items-center justify-between">
                    <div>
                      <h2 className="text-white font-bold text-sm uppercase tracking-widest">Shop Socks</h2>
                      <p className="text-[#B2AC88]/80 text-xs mt-0.5">
                        {language === 'ar' ? 'استكشف حسب الفئة' : language === 'ku' ? 'بگەڕێ بەپێی پۆل' : 'Browse by filter'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCategoriesDropdownOpen(false);
                        if (onFilterSelect) onFilterSelect('categories', ['All']);
                      }}
                      className="text-xs text-[#B2AC88] hover:text-white border border-[#B2AC88]/40 hover:border-white/60 px-3 py-1.5 rounded-lg transition-all font-semibold uppercase tracking-wider cursor-pointer"
                    >
                      {language === 'ar' ? 'عرض الكل' : language === 'ku' ? 'هەموو ببینە' : 'View All'}
                    </button>
                  </div>

                  {/* Grid of 4 columns × 2 rows */}
                  <div className="grid grid-cols-4 gap-0 p-6 gap-x-0">

                    {/* ─── Col 1: Colors ─── */}
                    <div className="px-4 border-r border-gray-100">
                      <button
                        type="button"
                        onClick={() => toggleGroup('colors')}
                        className="w-full flex items-center justify-between text-[11px] font-extrabold text-[#36454F] uppercase tracking-widest mb-3 border-0 bg-transparent cursor-pointer p-0 select-none group"
                      >
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[#B2AC88] shrink-0" />
                          {language === 'ar' ? 'الألوان' : language === 'ku' ? 'ڕەنگەکان' : 'Colors'}
                        </span>
                        <ChevronDown size={12} className={`text-gray-300 transition-transform duration-200 ${openGroups.colors ? 'rotate-0' : '-rotate-90'}`} />
                      </button>
                      {openGroups.colors && (
                        <div className="flex flex-wrap gap-2 mb-2">
                          {uniqueColorFilters.map(col => (
                            <button
                              key={col.name}
                              type="button"
                              onClick={() => {
                                setIsCategoriesDropdownOpen(false);
                                if (onFilterSelect) onFilterSelect('colors', [col.name]);
                              }}
                              className="flex items-center gap-1.5 px-2 py-1 rounded-lg border border-gray-100 hover:border-[#B2AC88]/50 hover:bg-[#FAF9F5] text-[11px] font-semibold text-gray-600 hover:text-[#36454F] transition-all cursor-pointer capitalize group"
                            >
                              <span className="w-3.5 h-3.5 rounded-full border border-gray-200 shrink-0" style={getColorStyle(col.class)} />
                              <span>{col.name}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* ─── Col 2: Gender ─── */}
                    <div className="px-4 border-r border-gray-100">
                      <button
                        type="button"
                        onClick={() => toggleGroup('gender')}
                        className="w-full flex items-center justify-between text-[11px] font-extrabold text-[#36454F] uppercase tracking-widest mb-3 border-0 bg-transparent cursor-pointer p-0 select-none"
                      >
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[#B2AC88] shrink-0" />
                          {language === 'ar' ? 'النوع' : language === 'ku' ? 'جۆری' : 'Gender'}
                        </span>
                        <ChevronDown size={12} className={`text-gray-300 transition-transform duration-200 ${openGroups.gender ? 'rotate-0' : '-rotate-90'}`} />
                      </button>
                      {openGroups.gender && (
                        <div className="flex flex-col space-y-1.5">
                          {[
                            { val: 'Women', ar: 'نساء', ku: 'ژن' },
                            { val: 'Men', ar: 'رجال', ku: 'پیاو' },
                            { val: 'Kids', ar: 'أطفال', ku: 'منداڵ' },
                            { val: 'Unisex', ar: 'للجنسين', ku: 'هەردووکی' },
                          ].map(g => (
                            <button
                              key={g.val}
                              type="button"
                              onClick={() => {
                                setIsCategoriesDropdownOpen(false);
                                if (onFilterSelect) onFilterSelect('gender', g.val);
                              }}
                              className="text-xs font-semibold text-gray-500 hover:text-[#B2AC88] hover:translate-x-1 transition-all duration-200 text-start border-0 bg-transparent py-0.5 cursor-pointer"
                            >
                              {language === 'ar' ? g.ar : language === 'ku' ? g.ku : g.val}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* ─── Col 3: Sizes ─── */}
                    <div className="px-4 border-r border-gray-100">
                      <button
                        type="button"
                        onClick={() => toggleGroup('sizes')}
                        className="w-full flex items-center justify-between text-[11px] font-extrabold text-[#36454F] uppercase tracking-widest mb-3 border-0 bg-transparent cursor-pointer p-0 select-none"
                      >
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[#B2AC88] shrink-0" />
                          {language === 'ar' ? 'المقاسات' : language === 'ku' ? 'قەبارەکان' : 'Sizes'}
                        </span>
                        <ChevronDown size={12} className={`text-gray-300 transition-transform duration-200 ${openGroups.sizes ? 'rotate-0' : '-rotate-90'}`} />
                      </button>
                      {openGroups.sizes && (
                        <div className="flex flex-wrap gap-1.5">
                          {sizesList.map(sz => (
                            <button
                              key={sz.id || sz.name}
                              type="button"
                              onClick={() => {
                                setIsCategoriesDropdownOpen(false);
                                if (onFilterSelect) onFilterSelect('sizes', [sz.name]);
                              }}
                              className="px-2.5 py-1 text-[11px] font-bold text-gray-600 hover:text-[#36454F] border border-gray-200 hover:border-[#B2AC88] rounded-lg hover:bg-[#FAF9F5] transition-all cursor-pointer"
                            >
                              {getLocalized(sz.name, language)}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* ─── Col 4: Material ─── */}
                    <div className="px-4">
                      <button
                        type="button"
                        onClick={() => toggleGroup('materials')}
                        className="w-full flex items-center justify-between text-[11px] font-extrabold text-[#36454F] uppercase tracking-widest mb-3 border-0 bg-transparent cursor-pointer p-0 select-none"
                      >
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[#B2AC88] shrink-0" />
                          {language === 'ar' ? 'المواد' : language === 'ku' ? 'کەرەستەکان' : 'Material'}
                        </span>
                        <ChevronDown size={12} className={`text-gray-300 transition-transform duration-200 ${openGroups.materials ? 'rotate-0' : '-rotate-90'}`} />
                      </button>
                      {openGroups.materials && (
                        <div className="flex flex-col space-y-1.5">
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
                              {getLocalized(mat.name, language)}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Divider row */}
                    <div className="col-span-4 border-t border-gray-100 my-4" />

                    {/* ─── Col 1 (row 2): Style / Length ─── */}
                    <div className="px-4 border-r border-gray-100">
                      <button
                        type="button"
                        onClick={() => toggleGroup('styles')}
                        className="w-full flex items-center justify-between text-[11px] font-extrabold text-[#36454F] uppercase tracking-widest mb-3 border-0 bg-transparent cursor-pointer p-0 select-none"
                      >
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[#B2AC88] shrink-0" />
                          {language === 'ar' ? 'الموديل / الطول' : language === 'ku' ? 'شێواز / درێژی' : 'Style / Length'}
                        </span>
                        <ChevronDown size={12} className={`text-gray-300 transition-transform duration-200 ${openGroups.styles ? 'rotate-0' : '-rotate-90'}`} />
                      </button>
                      {openGroups.styles && (
                        <div className="flex flex-col space-y-1.5">
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
                              {getLocalized(st.name, language)}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* ─── Col 2 (row 2): Season ─── */}
                    <div className="px-4 border-r border-gray-100">
                      <button
                        type="button"
                        onClick={() => toggleGroup('seasons')}
                        className="w-full flex items-center justify-between text-[11px] font-extrabold text-[#36454F] uppercase tracking-widest mb-3 border-0 bg-transparent cursor-pointer p-0 select-none"
                      >
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[#B2AC88] shrink-0" />
                          {language === 'ar' ? 'الفصول' : language === 'ku' ? 'وەرزەکان' : 'Season'}
                        </span>
                        <ChevronDown size={12} className={`text-gray-300 transition-transform duration-200 ${openGroups.seasons ? 'rotate-0' : '-rotate-90'}`} />
                      </button>
                      {openGroups.seasons && (
                        <div className="flex flex-col space-y-1.5">
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
                              {getLocalized(seas.name, language)}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* ─── Col 3 (row 2): Design ─── */}
                    <div className="px-4 border-r border-gray-100">
                      <button
                        type="button"
                        onClick={() => toggleGroup('designs')}
                        className="w-full flex items-center justify-between text-[11px] font-extrabold text-[#36454F] uppercase tracking-widest mb-3 border-0 bg-transparent cursor-pointer p-0 select-none"
                      >
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[#B2AC88] shrink-0" />
                          {language === 'ar' ? 'التصميم' : language === 'ku' ? 'دیزاین' : 'Design'}
                        </span>
                        <ChevronDown size={12} className={`text-gray-300 transition-transform duration-200 ${openGroups.designs ? 'rotate-0' : '-rotate-90'}`} />
                      </button>
                      {openGroups.designs && (
                        <div className="flex flex-col space-y-1.5">
                          {designsList.length > 0 ? designsList.map(d => (
                            <button
                              key={d.id || d.name}
                              type="button"
                              onClick={() => {
                                setIsCategoriesDropdownOpen(false);
                                if (onFilterSelect) onFilterSelect('designs', [d.name]);
                              }}
                              className="text-xs font-semibold text-gray-500 hover:text-[#B2AC88] hover:translate-x-1 transition-all duration-200 text-start border-0 bg-transparent py-0.5 cursor-pointer"
                            >
                              {getLocalized(d.name, language)}
                            </button>
                          )) : (
                            <span className="text-xs text-gray-400 italic">
                              {language === 'ar' ? 'قريباً' : language === 'ku' ? 'بەزووی' : 'Coming soon'}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* ─── Col 4 (row 2): Sport Type ─── */}
                    <div className="px-4">
                      <button
                        type="button"
                        onClick={() => toggleGroup('sportTypes')}
                        className="w-full flex items-center justify-between text-[11px] font-extrabold text-[#36454F] uppercase tracking-widest mb-3 border-0 bg-transparent cursor-pointer p-0 select-none"
                      >
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[#B2AC88] shrink-0" />
                          {language === 'ar' ? 'نوع الرياضة' : language === 'ku' ? 'جۆری وەرزش' : 'Sport Type'}
                        </span>
                        <ChevronDown size={12} className={`text-gray-300 transition-transform duration-200 ${openGroups.sportTypes ? 'rotate-0' : '-rotate-90'}`} />
                      </button>
                      {openGroups.sportTypes && (
                        <div className="flex flex-col space-y-1.5">
                          {sportTypesList.length > 0 ? sportTypesList.map(sp => (
                            <button
                              key={sp.id || sp.name}
                              type="button"
                              onClick={() => {
                                setIsCategoriesDropdownOpen(false);
                                if (onFilterSelect) onFilterSelect('sportTypes', [sp.name]);
                              }}
                              className="text-xs font-semibold text-gray-500 hover:text-[#B2AC88] hover:translate-x-1 transition-all duration-200 text-start border-0 bg-transparent py-0.5 cursor-pointer"
                            >
                              {getLocalized(sp.name, language)}
                            </button>
                          )) : (
                            <span className="text-xs text-gray-400 italic">
                              {language === 'ar' ? 'قريباً' : language === 'ku' ? 'بەزووی' : 'Coming soon'}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </li>
          <li className="relative py-1">
            <button 
              onClick={() => onViewChange('all_products')}
              className={`hover:text-[#B2AC88] cursor-pointer transition-colors pb-1.5 relative uppercase tracking-wider ${
                currentView === 'all_products' ? 'text-[#B2AC88] font-bold' : 'text-brand-charcoal'
              }`}
            >
              {t('nav.all_products')}
            </button>
          </li>
          <li className="relative py-1">
            <button 
              onClick={() => onViewChange('story')}
              className={`hover:text-[#B2AC88] cursor-pointer transition-colors pb-1.5 relative uppercase tracking-wider ${
                currentView === 'story' ? 'text-[#B2AC88] font-bold' : 'text-brand-charcoal'
              }`}
            >
              {t('nav.story')}
            </button>
          </li>
          <li className="relative py-1">
            <button 
              onClick={() => onViewChange('contact')}
              className={`hover:text-[#B2AC88] cursor-pointer transition-colors pb-1.5 relative uppercase tracking-wider ${
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
              className={`fixed top-0 bottom-0 ${isRTL ? 'right-0 border-l' : 'left-0 border-r'} w-80 max-w-[80vw] bg-white shadow-2xl z-50 flex flex-col font-sans p-5 text-brand-charcoal border-gray-150`}
            >
              {/* Header of Mobile Menu */}
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-5">
                <div className="flex items-center gap-1 select-none text-start font-sans text-[#36454F] leading-none">
                  <HawrishaH size={28} className="text-[#36454F] shrink-0 w-[20px] h-[22px]" />
                  <div className="flex flex-col items-start leading-[0.9]">
                    <span className="text-[13px] font-black tracking-[0.06em] uppercase">AWRISHA</span>
                    <span className="text-[6.5px] font-extrabold tracking-[0.22em] uppercase text-[#B2AC88] mt-0.5">BAZAAR</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-brand-charcoal hover:text-[#B2AC88] cursor-pointer p-1"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Navigation Links in Mobile Menu */}
              <div className="flex-1 space-y-2 overflow-y-auto pr-2 rtl:pl-2 rtl:pr-0">
                <button
                  type="button"
                  onClick={() => {
                    onViewChange('home');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full text-start py-1 text-sm font-bold uppercase tracking-wider transition-colors cursor-pointer border-0 ${
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
                  className={`w-full text-start py-1 text-sm font-bold uppercase tracking-wider transition-colors cursor-pointer border-0 ${
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
                    className="w-full flex items-center justify-between py-1 text-sm font-bold uppercase tracking-wider text-brand-charcoal cursor-pointer border-0"
                  >
                    <span>{t('nav.categories')}</span>
                    <ChevronDown size={14} className={`transition-transform duration-200 ${isMobileCategoriesOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  <AnimatePresence>
                    {isMobileCategoriesOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="ps-4 mt-1 space-y-1.5 overflow-hidden border-l border-gray-100/70"
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
                        {renderMobileSubSection(
                          language === 'ar' ? 'النوع' : language === 'ku' ? 'جۆری' : 'Gender',
                          'gender',
                          [
                            { id: 'women', name: language === 'ar' ? 'نساء' : language === 'ku' ? 'ژن' : 'Women', value: 'Women' },
                            { id: 'men', name: language === 'ar' ? 'رجال' : language === 'ku' ? 'پیاو' : 'Men', value: 'Men' },
                            { id: 'kids', name: language === 'ar' ? 'أطفال' : language === 'ku' ? 'منداڵ' : 'Kids', value: 'Kids' }
                          ],
                          (item) => item.value,
                          (item) => item.name
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
                  className={`w-full text-start py-1 text-sm font-bold uppercase tracking-wider transition-colors cursor-pointer border-0 ${
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
                  className={`w-full text-start py-1 text-sm font-bold uppercase tracking-wider transition-colors cursor-pointer border-0 ${
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
                  className={`w-full text-start py-1 text-sm font-bold uppercase tracking-wider transition-colors cursor-pointer border-0 ${
                    currentView === 'contact' ? 'text-[#B2AC88]' : 'text-brand-charcoal'
                  }`}
                >
                  {t('nav.contact')}
                </button>
                
                <div className="h-px bg-gray-100 my-6" />

                {/* Profile & Links in Mobile Menu */}
                <div className="space-y-2.5 pt-2">
                  <button 
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      if (isLoggedIn) {
                        onViewChange('account');
                      } else {
                        onLoginClick();
                      }
                    }}
                    className="flex items-center space-x-3 rtl:space-x-reverse text-brand-charcoal hover:text-[#B2AC88] text-sm font-semibold py-0.5 transition-colors cursor-pointer border-0 w-full text-start"
                  >
                    <User size={16} />
                    <span>{language === 'en' ? 'Account' : t('account_page.title')}</span>
                  </button>
                  
                  <button 
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onCartClick();
                    }}
                    className="flex items-center space-x-3 rtl:space-x-reverse text-brand-charcoal hover:text-[#B2AC88] text-sm font-semibold py-0.5 transition-colors cursor-pointer border-0 w-full text-start"
                  >
                    <ShoppingCart size={16} />
                    <span>{language === 'en' ? 'Your Basket' : t('nav.cart')}</span>
                  </button>

                  <button 
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onWishlistClick();
                    }}
                    className="flex items-center space-x-3 rtl:space-x-reverse text-brand-charcoal hover:text-[#B2AC88] text-sm font-semibold py-0.5 transition-colors cursor-pointer border-0 w-full text-start"
                  >
                    <Heart size={16} />
                    <span>{t('nav.wishlist')}</span>
                  </button>
                </div>
              </div>

              {/* Footer of Mobile Menu (Pinned at the Very Bottom of Sidebar Screen with zero extra bottom space) */}
              <div className="shrink-0 pt-4 pb-3 border-t border-gray-100 mt-3">
                <div className="grid grid-cols-3 gap-2 w-full">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => {
                        setLanguage(lang.code);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`text-xs font-bold py-1.5 px-1 rounded-full border transition-colors cursor-pointer w-full text-center ${
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
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Mobile & Tablet Search Overlay */}
      <AnimatePresence>
        {isMobileSearchOpen && (
          <>
            {/* Backdrop for lower half click-to-close */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileSearchOpen(false)}
              className="fixed inset-0 bg-black/45 z-[99] lg:hidden cursor-pointer"
            />
            <motion.div
              initial={{ y: '-100%' }}
              animate={{ y: 0 }}
              exit={{ y: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed top-0 left-0 right-0 h-auto py-5 bg-white z-[100] flex flex-col font-sans lg:hidden rounded-b-3xl shadow-xl"
            >
              <div className="px-4 flex items-center justify-between gap-3 w-full max-w-xl mx-auto">
                {/* Full Width Search Bar with #B2AC88 Border */}
                <div className="flex-1 flex items-center bg-[#F8F9FA] border border-[#B2AC88] rounded-full px-4 py-2 shadow-xs">
                  <form 
                    className="flex-grow flex items-center"
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (headerSearchTerm.trim() && onSearch) {
                        onSearch(headerSearchTerm.trim());
                        setIsMobileSearchOpen(false);
                      }
                    }}
                  >
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={headerSearchTerm}
                      onChange={(e) => {
                        setHeaderSearchTerm(e.target.value);
                      }}
                      className="w-full text-sm bg-transparent focus:outline-none text-[#36454F] placeholder-slate-400 font-semibold"
                      autoFocus
                    />
                  </form>
                </div>
                {/* X Button in #B2AC88 */}
                <button
                  type="button"
                  onClick={() => setIsMobileSearchOpen(false)}
                  className="text-[#B2AC88] hover:text-[#8E8866] transition-colors p-1.5 shrink-0 cursor-pointer"
                  title="Close search"
                >
                  <X size={22} strokeWidth={2.5} className="text-[#B2AC88]" />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
