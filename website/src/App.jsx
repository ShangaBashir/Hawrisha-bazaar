import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, Trash2, ShoppingBag, LogOut } from 'lucide-react';
import { useLanguage } from './context/LanguageContext.jsx';
import BestSeller from './components/BestSeller';
import Header from './components/Header';
import HeroCarousel from './components/HeroCarousel';
import ProductGrid from './components/ProductGrid';
import Footer from './components/Footer';
import AllProducts from './components/AllProducts';
// Dashboard components split to separate repository

import Wishlist from './components/Wishlist';
import Checkout from './components/Checkout';
import Contact from './components/Contact';
import Story from './components/Story';
import Cart from './components/Cart';
import Account from './components/Account';
import AuthPage from './components/AuthPage';
import Stores from './components/Stores';

// Helper: extract English from multilingual JSON string
const parseEn = (val) => {
  if (!val) return '';
  try {
    const parsed = JSON.parse(val);
    return (typeof parsed === 'object' && parsed.en) ? parsed.en : val;
  } catch { return val; }
};

const getLocalized = (val, lang) => {
  if (!val) return '';
  const l = lang ? lang.toLowerCase() : 'en';
  const u = l.toUpperCase();
  if (typeof val === 'object') {
    return val[l] || val[u] || val['en'] || val['EN'] || val['ku'] || val['KU'] || val['ar'] || val['AR'] || '';
  }
  let currentVal = val;
  for (let i = 0; i < 3; i++) {
    try {
      if (typeof currentVal !== 'string') break;
      const parsed = JSON.parse(currentVal);
      if (typeof parsed === 'object' && parsed !== null) {
        return parsed[l] || parsed[u] || parsed['en'] || parsed['EN'] || parsed['ku'] || parsed['KU'] || parsed['ar'] || parsed['AR'] || val;
      }
      currentVal = parsed;
    } catch {
      break;
    }
  }
  return currentVal;
};

import ShowcaseSection from './components/ShowcaseSection';
import SocksStory from './components/SocksStory';
import StoreMarquee from './components/StoreMarquee';

const getAppCartColorStyle = (colorVal) => {
  if (!colorVal) return {};
  if (colorVal.startsWith('bg-[#') && colorVal.endsWith(']')) {
    return { backgroundColor: colorVal.slice(4, -1) };
  }
  if (colorVal.startsWith('#')) {
    return { backgroundColor: colorVal };
  }
  return {};
};

function App() {
  const { t, language } = useLanguage();

  const [currentView, setCurrentView] = useState(() => {
    const path = window.location.pathname;
    if (path === '/stores' || path.startsWith('/store/')) return 'stores';
    if (path === '/login' || path === '/signup' || path === '/forgot-password' || path === '/verify-code' || path === '/reset-password') return 'auth';
    if (path === '/all_products') return 'all_products';
    if (path === '/story') return 'story';
    if (path === '/contact') return 'contact';
    if (path === '/wishlist') return 'wishlist';
    if (path === '/account') return 'account';
    if (path === '/cart') return 'cart';
    if (path === '/checkout') return 'checkout';
    return 'home';
  });

  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem('wishlist');
    return saved ? JSON.parse(saved) : [];
  });
  const [isInitializingSync, setIsInitializingSync] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [drawerItemToDelete, setDrawerItemToDelete] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedProductForDetail, setSelectedProductForDetail] = useState(null);
  const [selectedStoreIdForDetail, setSelectedStoreIdForDetail] = useState(null);
  const [resetDetailTrigger, setResetDetailTrigger] = useState(0);
  const [globalSearchTerm, setGlobalSearchTerm] = useState('');
  const [globalProducts, setGlobalProducts] = useState([]);

  const [cartColorsList, setCartColorsList] = useState([]);

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setGlobalProducts(data);
      })
      .catch(err => console.error('Error fetching global products:', err));

    // Used to show a readable colour name in the cart drawer for items that
    // were added without one (otherwise we'd fall back to the raw hex code).
    fetch('/api/settings/colors')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setCartColorsList(data);
      })
      .catch(err => console.error('Error fetching colors:', err));
  }, []);

  // Resolve a cart item's colour to a localized name, falling back to the
  // settings list (matched on css class or hex) before showing the raw value.
  const getCartColorName = (item) => {
    const named = getLocalized(item.selectedColorName, language);
    if (named) return named;
    const raw = item.selectedColor || '';
    const hex = raw.startsWith('bg-[') ? raw.slice(4, -1) : raw;
    const found = cartColorsList.find(c => {
      const cls = c.class || '';
      const cHex = cls.startsWith('bg-[') ? cls.slice(4, -1) : cls;
      return cls === raw || c.id === raw || cHex.toLowerCase() === hex.toLowerCase();
    });
    if (found) return getLocalized(found.name, language);
    return hex;
  };

  // Handle deep link query parameters from Dashboard or direct URLs
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const storeParam = searchParams.get('store');
    const prodParam = searchParams.get('product');

    if (storeParam) {
      setSelectedStoreIdForDetail(Number(storeParam));
      setCurrentView('stores');
    } else if (prodParam && globalProducts.length > 0) {
      const found = globalProducts.find(p => String(p.id) === String(prodParam));
      if (found) {
        setSelectedProductForDetail(found);
        setCurrentView('all_products');
      }
    }
  }, [globalProducts]);

  // Clean up invalid wishlist items
  useEffect(() => {
    if (globalProducts.length > 0 && wishlist.length > 0) {
      const validWishlist = wishlist.filter(id => globalProducts.some(p => p.id === id));
      if (validWishlist.length !== wishlist.length) {
        setWishlist(validWishlist);
      }
    }
  }, [globalProducts, wishlist]);
  const [globalFilters, setGlobalFilters] = useState({
    categories: [],
    colors: [],
    styles: [],
    materials: [],
    seasons: [],
    sizes: [],
    badges: [],
    promotions: [],
    onlyDiscounted: false,
    gender: ''
  });
  
  // Auth states
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('isLoggedIn') === 'true');
  const [currentUser, setCurrentUser] = useState(() => localStorage.getItem('currentUser') || null);
  const [currentUserLastName, setCurrentUserLastName] = useState(() => localStorage.getItem('currentUserLastName') || null);
  const [currentUserEmail, setCurrentUserEmail] = useState(() => localStorage.getItem('currentUserEmail') || null);
  const [currentUserRole, setCurrentUserRole] = useState(() => localStorage.getItem('currentUserRole') || null);
  const [currentUserStoreName, setCurrentUserStoreName] = useState(() => localStorage.getItem('currentUserStoreName') || null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showMultiStoreModal, setShowMultiStoreModal] = useState(false);
  const [storesList, setStoresList] = useState([]);

  useEffect(() => {
    fetch('/api/stores')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.vendors) {
          setStoresList(data.vendors);
        }
      })
      .catch(err => console.error('Error fetching stores for search:', err));
  }, []);

  useEffect(() => {
    if (isLoggedIn && currentUserEmail) {
      setIsInitializingSync(true);
      Promise.all([
        fetch(`/api/user_data/cart?email=${encodeURIComponent(currentUserEmail)}`).then(r => r.json()),
        fetch(`/api/user_data/wishlist?email=${encodeURIComponent(currentUserEmail)}`).then(r => r.json())
      ])
      .then(([cartData, wishlistData]) => {
        if (cartData.success) {
          setCart(cartData.cart || []);
        }
        if (wishlistData.success) {
          setWishlist(wishlistData.wishlist || []);
        }
      })
      .catch(err => console.error('Error fetching user data:', err))
      .finally(() => setIsInitializingSync(false));
    } else {
      setIsInitializingSync(false);
    }
  }, [isLoggedIn, currentUserEmail]);

  useEffect(() => {
    if (!isInitializingSync && isLoggedIn && currentUserEmail) {
      fetch('/api/user_data/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: currentUserEmail, cart })
      }).catch(err => console.error('Error saving cart:', err));
    }
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart, isLoggedIn, currentUserEmail, isInitializingSync]);

  useEffect(() => {
    if (!isInitializingSync && isLoggedIn && currentUserEmail) {
      fetch('/api/user_data/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: currentUserEmail, wishlist })
      }).catch(err => console.error('Error saving wishlist:', err));
    }
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
  }, [wishlist, isLoggedIn, currentUserEmail, isInitializingSync]);

  // Handle route protection and redirects
  useEffect(() => {
    if (isInitializingSync) return;
    
    if (!isLoggedIn && (currentView === 'cart' || currentView === 'checkout' || currentView === 'account')) {
      setCurrentView('auth');
      syncBrowserUrl('auth');
    } else if (isLoggedIn && currentView === 'auth') {
      setCurrentView('account');
      syncBrowserUrl('account');
    }
  }, [isLoggedIn, currentView, isInitializingSync]);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(''), 2500);
  };

  // Automatically scroll to the top of the screen when switching pages or opening product details
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentView, selectedProductForDetail]);

  // Prevent body scroll when logout confirmation is open
  useEffect(() => {
    if (showLogoutConfirm) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showLogoutConfirm]);

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path === '/stores' || path.startsWith('/store/')) setCurrentView('stores');
      else if (path === '/login' || path === '/forgot-password' || path === '/verify-code' || path === '/reset-password') setCurrentView('auth');
      else if (path === '/all_products') setCurrentView('all_products');
      else if (path === '/story') setCurrentView('story');
      else if (path === '/contact') setCurrentView('contact');
      else if (path === '/wishlist') setCurrentView('wishlist');
      else if (path === '/account') setCurrentView('account');
      else if (path === '/cart') setCurrentView('cart');
      else if (path === '/checkout') setCurrentView('checkout');
      else setCurrentView('home');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const [viewHistory, setViewHistory] = useState(['home']);

  const syncBrowserUrl = (view, customUrl = null) => {
    const targetPath = customUrl 
      ? customUrl 
      : view === 'home' ? '/' 
      : view === 'admin' ? '/dashboard' 
      : view === 'auth' ? '/login' 
      : `/${view}`;
      
    const currentPath = window.location.pathname + window.location.search;
    if (currentPath !== targetPath) {
      window.history.pushState(null, '', targetPath);
    }
  };

  const handleViewChange = (view, keepProductDetail = false, customUrl = null) => {
    if ((view === 'cart' || view === 'checkout') && !isLoggedIn) {
      setCurrentView('auth');
      setViewHistory(prev => [...prev, 'auth']);
      showToast(t('toasts.login_required_cart'));
      syncBrowserUrl('auth');
      return;
    }

    // Update browser URL history
    syncBrowserUrl(view, customUrl);

    setCurrentView(view);
    if (!keepProductDetail) {
      setSelectedProductForDetail(null);
      if (view === 'all_products' || view === 'stores') {
        setResetDetailTrigger(prev => prev + 1);
        if (view !== 'stores') setSelectedStoreIdForDetail(null);
      }
    }
    if (view === 'home') {
      setViewHistory(['home']);
    } else {
      setViewHistory(prev => {
        const lastView = prev[prev.length - 1];
        if (lastView === view) return prev;
        return [...prev, view];
      });
    }
  };

  const handleFilterSelect = (type, value) => {
    const newFilters = {
      categories: [],
      colors: [],
      styles: [],
      materials: [],
      seasons: [],
      sizes: [],
      badges: [],
      promotions: [],
      onlyDiscounted: false,
      gender: '',
      designs: [],
      sportTypes: []
    };
    if (type === 'categories' && value.includes('All')) {
      newFilters.categories = [];
    } else if (type === 'gender') {
      newFilters.gender = Array.isArray(value) ? value[0] : value;
    } else {
      newFilters[type] = value;
    }
    setGlobalFilters(newFilters);
    setSelectedCategory(type === 'categories' && value.length > 0 ? value[0] : 'All');
    handleViewChange('all_products');
  };

  const handleBack = () => {
    if (viewHistory.length <= 1) {
      setCurrentView('home');
      setViewHistory(['home']);
      syncBrowserUrl('home');
      return;
    }
    const newHistory = viewHistory.slice(0, -1);
    const lastView = newHistory[newHistory.length - 1] || 'home';
    setCurrentView(lastView);
    setViewHistory(newHistory);
    syncBrowserUrl(lastView);
  };

  const previousView = viewHistory[viewHistory.length - 2] || 'home';

  const handleAddToCart = (product, quantity = 1) => {
    if (!isLoggedIn) {
      setIsLoginModalOpen(true);
      showToast(t('toasts.login_required_add'));
      return;
    }

    // Require Color and Size selection first across all pages
    if (!product.selectedColor || !product.selectedSize) {
      setSelectedProductForDetail(product);
      handleViewChange('all_products', true);
      showToast(t('ui.select_color_size_first'));
      return;
    }

    // Check if user is trying to add a product from a different store
    if (cart.length > 0) {
      const currentStoreId = cart[0].store_id;
      const productStoreId = product.store_id;
      if (String(currentStoreId || 0) !== String(productStoreId || 0)) {
        setShowMultiStoreModal(true);
        return;
      }
    }

    const cartItemId = `${product.id}-${product.selectedColor || ''}-${product.selectedStyle || ''}-${product.selectedSize || ''}`;
    setCart(prev => {
      const existing = prev.find(item => item.cartItemId === cartItemId);
      if (existing) {
        return prev.map(item =>
          item.cartItemId === cartItemId ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prev, { ...product, cartItemId, quantity }];
    });
  };

  const handleRemoveFromCart = (idOrCartItemId) => {
    setCart(prev => prev.filter(item => {
      const isCartItemMatch = item.cartItemId === idOrCartItemId;
      const isProductMatch = String(item.id) === String(idOrCartItemId);
      return !isCartItemMatch && !isProductMatch;
    }));
  };

  const handleUpdateCartQuantity = (cartItemId, delta) => {
    setCart(prev =>
      prev.map(item => {
        if (item.cartItemId === cartItemId || item.id === cartItemId) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : item;
        }
        return item;
      })
    );
  };

  const handleToggleWishlist = (productId) => {
    setWishlist(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      }
      return [...prev, productId];
    });
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const wishlistCount = wishlist.length;
  const isAdminView = currentView === 'admin';

  // Dashboard portal split to separate repository

  return (
    <div className="min-h-screen flex flex-col font-sans bg-brand-beige">
      {!isAdminView && (
        <Header 
          currentView={currentView} 
          onViewChange={handleViewChange} 
          cartCount={cartCount} 
          wishlistCount={wishlistCount}
          isLoggedIn={isLoggedIn}
          currentUser={currentUser}
          currentUserRole={currentUserRole}
          currentUserStoreName={currentUserStoreName}
          onLoginClick={() => handleViewChange('auth')}
          onLogoutClick={() => setShowLogoutConfirm(true)}
          onCartClick={() => {
            if (isLoggedIn) {
              setIsCartOpen(true);
            } else {
              handleViewChange('auth');
              showToast(t('toasts.login_required_cart'));
            }
          }}
          onWishlistClick={() => {
            handleViewChange('wishlist');
          }}
          onSearch={(term) => {
            const lowerTerm = term.toLowerCase().trim();
            if (!lowerTerm) {
              setGlobalSearchTerm('');
              return;
            }
            const matchesStore = lowerTerm.includes('store') || storesList.some(store => 
              store.name && parseEn(store.name).toLowerCase().includes(lowerTerm)
            );
            if (matchesStore) {
              setGlobalSearchTerm(term);
              handleViewChange('stores', false, '/stores');
            } else {
              setGlobalSearchTerm(term);
              handleViewChange('all_products');
            }
          }}
          onFilterSelect={(type, value) => handleFilterSelect(type, value)}
        />
      )}
      <main className="flex-grow">
        {currentView === 'home' && (
          <>
            <HeroCarousel onShopNow={() => {
              setSelectedCategory('All');
              handleViewChange('all_products');
            }} />
            <ShowcaseSection onViewAll={() => {
              setSelectedCategory('All');
              handleViewChange('all_products');
            }} />
            <SocksStory 
              isLoggedIn={isLoggedIn}
              onReadStory={() => handleViewChange('story')}
              onJoinUs={() => handleViewChange('auth')}
              onExploreStores={() => handleViewChange('stores')}
              onContactClick={() => handleViewChange('contact')}
            />
            <StoreMarquee />
          </>
        )}
        
        {currentView === 'all_products' && (
          <AllProducts 
            cart={cart}
            onAddToCart={handleAddToCart}
            onRemoveFromCart={handleRemoveFromCart}
            onBackToHome={handleBack}
            initialCategory={selectedCategory}
            likedProducts={wishlist}
            onToggleWishlist={handleToggleWishlist}
            initialViewingProduct={selectedProductForDetail}
            initialSearchTerm={globalSearchTerm}
            onClearGlobalSearch={() => {
              setGlobalSearchTerm('');
              setSelectedCategory('All');
              setGlobalFilters({
                categories: [],
                colors: [],
                styles: [],
                materials: [],
                seasons: [],
                sizes: [],
                badges: [],
                promotions: [],
                onlyDiscounted: false,
                gender: ''
              });
            }}
            previousView={previousView}
            isLoggedIn={isLoggedIn}
            onLoginRequired={() => handleViewChange('auth')}
            globalFilters={globalFilters}
            onOpenCart={() => setIsCartOpen(true)}
            resetDetailTrigger={resetDetailTrigger}
            onStoreClick={(storeName) => {
              const cleanName = parseEn(storeName);
              const slug = cleanName.toLowerCase().replace(/\s+/g, '-');
              handleViewChange('stores', false, `/store/${encodeURIComponent(slug)}`);
            }}
          />
        )}

        {currentView === 'wishlist' && (
          <Wishlist 
            cart={cart}
            wishlist={wishlist}
            onAddToCart={handleAddToCart}
            onRemoveFromCart={handleRemoveFromCart}
            onToggleWishlist={handleToggleWishlist}
            onExplore={() => {
              setSelectedCategory('All');
              handleViewChange('all_products');
            }}
            onBackToHome={handleBack}
            onProductClick={(product) => {
              setSelectedProductForDetail(product);
              handleViewChange('all_products', true);
            }}
            previousView={previousView}
            isLoggedIn={isLoggedIn}
            onLoginRequired={() => handleViewChange('auth')}
          />
        )}

        {currentView === 'stores' && (
          <Stores 
            key={window.location.pathname}
            resetTrigger={resetDetailTrigger}
            initialSearchTerm={globalSearchTerm}
            initialStoreId={selectedStoreIdForDetail}
            cart={cart}
            likedProducts={wishlist}
            onAddToCart={handleAddToCart}
            onRemoveFromCart={handleRemoveFromCart}
            onToggleWishlist={handleToggleWishlist}
            onProductClick={(product) => {
              setSelectedProductForDetail(product);
              handleViewChange('all_products', true);
            }}
            isLoggedIn={isLoggedIn}
            onLoginRequired={() => handleViewChange('auth')}
          />
        )}



        {/* Inline Admin Dashboard view removed */}

        {currentView === 'checkout' && (
          <Checkout 
            cart={cart}
            onClearCart={() => setCart([])}
            onBackToHome={handleBack}
            onViewAccount={() => handleViewChange('account', true)}
            previousView={previousView}
            currentUser={currentUser}
            currentUserLastName={currentUserLastName}
            currentUserEmail={currentUserEmail}
          />
        )}

        {currentView === 'contact' && (
          <Contact />
        )}

        {currentView === 'story' && (
          <Story onViewChange={handleViewChange} />
        )}

        {currentView === 'account' && (
          <Account 
            email={currentUserEmail}
            onBackToHome={() => handleViewChange('home')}
            onLogoutClick={() => setShowLogoutConfirm(true)}
            onViewChange={handleViewChange}
            onSelectStore={(storeId) => {
              setSelectedStoreIdForDetail(storeId);
              setResetDetailTrigger(prev => prev + 1);
              handleViewChange('stores');
            }}
          />
        )}

        {currentView === 'auth' && (
          <AuthPage 
            onLoginSuccess={(firstName, lastName, email, role, storeName) => {
              setIsLoggedIn(true);
              setCurrentUser(firstName);
              setCurrentUserLastName(lastName);
              setCurrentUserEmail(email);
              setCurrentUserRole(role);
              setCurrentUserStoreName(storeName);
              localStorage.setItem('isLoggedIn', 'true');
              localStorage.setItem('currentUser', firstName);
              localStorage.setItem('currentUserLastName', lastName || '');
              localStorage.setItem('currentUserEmail', email);
              localStorage.setItem('currentUserRole', role || '');
              if (storeName) localStorage.setItem('currentUserStoreName', storeName);
              showToast(t('toasts.login_success', { user: firstName }));
              handleBack();
            }}
            onCancel={handleBack}
          />
        )}



        {currentView === 'cart' && (
          <Cart 
            cart={cart}
            onUpdateQuantity={(id, delta) => handleUpdateCartQuantity(id, delta)}
            onRemoveItem={(id) => handleRemoveFromCart(id)}
            onExplore={() => {
              setSelectedCategory('All');
              handleViewChange('all_products');
            }}
            onCheckout={() => handleViewChange('checkout')}
            onBack={handleBack}
            previousView={previousView}
            onProductClick={(product) => {
              setSelectedProductForDetail(product);
              handleViewChange('all_products', true);
            }}
            onStoreClick={(storeName) => {
              const cleanName = parseEn(storeName);
              const slug = cleanName.toLowerCase().replace(/\s+/g, '-');
              handleViewChange('stores', false, `/store/${encodeURIComponent(slug)}`);
            }}
          />
        )}
      </main>
      {!isAdminView && <Footer onViewChange={handleViewChange} onFilterSelect={(type, value) => handleFilterSelect(type, value)} />}

      {/* Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-black z-50 cursor-pointer"
            />
            {/* Drawer Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-full sm:w-[420px] bg-white border-l border-gray-100 shadow-2xl z-50 flex flex-col font-sans text-brand-charcoal"
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <ShoppingBag size={20} className="text-[#36454F]" />
                  <h3 className="text-lg font-bold text-[#36454F] uppercase tracking-wider">{t('ui.your_cart')}</h3>
                  <span className="bg-[#B2AC88]/10 text-[#B2AC88] text-xs font-bold px-2 py-0.5 rounded-full">
                    {cartCount}
                  </span>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 hover:text-[#36454F] cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100">
                      <ShoppingBag className="text-gray-300" size={24} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#36454F] uppercase tracking-wider">{t('ui.cart_empty')}</h4>
                      <p className="text-xs text-gray-400 mt-1 max-w-[200px] mx-auto leading-relaxed">
                        {t('ui.cart_empty_hint')}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setIsCartOpen(false);
                        handleViewChange('all_products');
                      }}
                      className="px-6 py-2.5 bg-[#B2AC88] hover:bg-[#36454F] text-white text-[10px] font-bold uppercase tracking-wider rounded-full transition-colors cursor-pointer"
                    >
                      {t('ui.shop_products')}
                    </button>
                  </div>
                ) : (
                  cart.map((item) => {
                    const imgUrl = item.image || item.image_url;
                    const finalImg = !imgUrl
                      ? '/categories/cat1.jpg'
                      : (imgUrl.startsWith('data:') || imgUrl.startsWith('/') ? imgUrl : `/uploads/${imgUrl}`);
                    
                    return (
                      <div key={item.cartItemId || item.id} className="flex space-x-4 border border-gray-100 rounded-2xl p-3 bg-white hover:shadow-xs transition-shadow">
                        {/* Thumbnail */}
                        <div className="w-16 h-20 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 shrink-0 flex items-center justify-center">
                          <img src={finalImg} alt={item.name && item.name.startsWith('{') ? (JSON.parse(item.name).en || item.name) : item.name} onError={(e) => { e.target.onerror = null; e.target.src = '/categories/cat1.jpg'; }} className="w-full h-full object-cover" />
                        </div>
                        {/* Details */}
                        <div className="flex-1 flex flex-col justify-between py-0.5">
                          <div>
                            <h4 className="text-xs font-bold text-[#36454F] truncate">{getLocalized(item.name, language)}</h4>
                            <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">
                              {getLocalized(item.vendor_name, language) || t('vendor_dashboard.platform_store')}
                            </p>
                            {/* Promotion Badge */}
                            {(() => {
                              const parsePromo = (val) => {
                                if (!val) return [];
                                if (Array.isArray(val)) return val;
                                try { const p = JSON.parse(val); return Array.isArray(p) ? p : [val]; } catch { return [val]; }
                              };
                              const promos = parsePromo(item.promotion).filter(p => p && p !== 'None' && p !== '');
                              if (promos.length === 0) return null;
                              return (
                                <div className="flex flex-wrap gap-1 mt-0.5">
                                  {promos.map((promo, idx) => (
                                    <span key={idx} className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-[#B2AC88]/10 border border-[#B2AC88]/20 rounded-full text-[8px] font-bold text-[#B2AC88] uppercase tracking-wider">
                                      <span className="w-1 h-1 rounded-full bg-[#B2AC88] shrink-0" />
                                      {promo}
                                    </span>
                                  ))}
                                </div>
                              );
                            })()}
                            <div className="text-[11px] text-gray-400 font-semibold mt-0.5">
                              {item.discount > 0 ? (
                                <span className="inline-flex gap-1 items-center">
                                  <span className="line-through text-gray-300">{Math.round(item.price / (1 - item.discount / 100)).toLocaleString()}</span>
                                  <span className="text-[#36454F]">{item.price.toLocaleString()} IQD</span>
                                  <span className="text-red-500 font-bold ml-1 text-[8px]">({item.discount}% OFF)</span>
                                </span>
                              ) : (
                                <span className="text-[#36454F]">{item.price.toLocaleString()} IQD</span>
                              )}
                            </div>
                            {/* Selected Options */}
                            {(item.selectedColor || item.selectedStyle || item.selectedSize) && (
                              <div className="flex flex-col gap-1 mt-1.5">
                                {item.selectedColor && (
                                  <div className="flex items-center space-x-1 rtl:space-x-reverse bg-gray-50 border border-gray-100 rounded px-1.5 py-0.5 w-fit">
                                    <span className="text-gray-400 font-normal text-[9px]">{language === 'ar' ? 'اللون: ' : language === 'ku' ? 'ڕەنگ: ' : 'Color: '}</span>
                                    <span 
                                      className={`w-2.5 h-2.5 rounded-full border border-gray-200 shrink-0 ${item.selectedColor?.startsWith('bg-') && !item.selectedColor?.includes('[') ? item.selectedColor : ''}`} 
                                      style={getAppCartColorStyle(item.selectedColor)}
                                    />
                                    <span className="text-[9px] font-bold text-[#36454F]">
                                      {getCartColorName(item)}
                                    </span>
                                  </div>
                                )}
                                {item.selectedStyle && (
                                  <div className="bg-gray-50 border border-gray-100 rounded px-1.5 py-0.5 text-[9px] font-bold text-[#36454F] w-fit">
                                    <span className="text-gray-400 font-normal">{language === 'ar' ? 'النوع: ' : language === 'ku' ? 'جۆر: ' : 'Style: '}</span>
                                    {getLocalized(item.selectedStyle, language)}
                                  </div>
                                )}
                                {item.selectedSize && (
                                  <div className="bg-gray-50 border border-gray-100 rounded px-1.5 py-0.5 text-[9px] font-bold text-[#36454F] w-fit">
                                    <span className="text-gray-400 font-normal">{language === 'ar' ? 'المقاس: ' : language === 'ku' ? 'قەبارە: ' : 'Size: '}</span>
                                    {getLocalized(item.selectedSize, language)}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            {/* Quantity Controls */}
                            <div className="flex items-center space-x-2.5 border border-gray-150 rounded-full px-2 py-0.5 bg-gray-50/50">
                              <button
                                onClick={() => handleUpdateCartQuantity(item.cartItemId || item.id, -1)}
                                className="text-gray-400 hover:text-[#36454F] active:scale-75 transition-transform"
                              >
                                <Minus size={11} />
                              </button>
                              <span className="text-xs font-bold text-[#36454F] select-none min-w-[12px] text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => handleUpdateCartQuantity(item.cartItemId || item.id, 1)}
                                className="text-gray-400 hover:text-[#36454F] active:scale-75 transition-transform"
                              >
                                <Plus size={11} />
                              </button>
                            </div>
                            {/* Remove Icon */}
                             <button
                               onClick={() => setDrawerItemToDelete(item)}
                               className="text-gray-300 hover:text-red-500 transition-colors p-1"
                             >
                               <Trash2 size={13} />
                             </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer Checkout Summary */}
              {cart.length > 0 && (
                <div className="p-6 border-t border-gray-100 space-y-4 bg-gray-50/50">


                  {/* Summary Rows */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold text-gray-500">
                      <span>{t('ui.subtotal')}</span>
                      <span>
                        {cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toLocaleString()} IQD
                      </span>
                    </div>
                    <div className="flex justify-between text-xs font-semibold text-gray-500">
                      <span>{t('ui.delivery')}</span>
                      {(() => {
                        const parsePromo = (val) => {
                          if (!val) return [];
                          if (Array.isArray(val)) return val;
                          try { const p = JSON.parse(val); return Array.isArray(p) ? p : [val]; } catch { return [val]; }
                        };
                        const hasFreeDelivery = cart.some(item => parsePromo(item.promotion).some(p => p && p.toLowerCase().includes('free delivery')));
                        return hasFreeDelivery ? (
                          <span className="text-green-600 font-bold">{t('ui.free')}</span>
                        ) : (
                          <span>4,000 IQD</span>
                        );
                      })()}
                    </div>
                    <div className="flex justify-between text-sm font-bold text-[#36454F] pt-1">
                      <span>{t('ui.total')}</span>
                      <span>
                        {(() => {
                          const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
                          const parsePromo = (val) => {
                            if (!val) return [];
                            if (Array.isArray(val)) return val;
                            try { const p = JSON.parse(val); return Array.isArray(p) ? p : [val]; } catch { return [val]; }
                          };
                          const hasFreeDelivery = cart.some(item => parsePromo(item.promotion).some(p => p && p.toLowerCase().includes('free delivery')));
                          const shipping = hasFreeDelivery ? 0 : 4000;
                          return (subtotal + shipping).toLocaleString();
                        })()} IQD
                      </span>
                    </div>
                  </div>

                  {/* Action CTA */}
                  <div className="grid grid-cols-2 gap-3.5">
                    <button 
                      onClick={() => {
                        setIsCartOpen(false);
                        handleViewChange('cart');
                      }}
                      className="py-3.5 bg-white border border-[#E9ECEF] hover:bg-gray-200 text-[#36454F] text-xs font-bold uppercase tracking-wider rounded-full shadow-sm transition-all cursor-pointer select-none text-center hover:scale-102 active:scale-98 font-bold"
                    >
                      {t('ui.view_cart')}
                    </button>
                    <button 
                      onClick={() => {
                        setIsCartOpen(false);
                        handleViewChange('checkout');
                      }}
                      className="py-3.5 bg-[#36454F] hover:bg-[#C08081] text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-md transition-all cursor-pointer select-none text-center hover:scale-102 active:scale-98"
                    >
                      {t('ui.checkout')}
                    </button>
                  </div>
                </div>
              )}

              {/* Delete Confirmation Modal inside Drawer */}
              <AnimatePresence>
                {drawerItemToDelete && (
                  <motion.div
                    key="drawer-delete-modal"
                    className="absolute inset-0 z-10 flex items-center justify-center p-6"
                  >
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.5 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setDrawerItemToDelete(null)}
                      className="absolute inset-0 bg-black cursor-pointer"
                    />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 20 }}
                      transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                      className="relative bg-white border border-[#E9ECEF] rounded-[28px] p-7 w-full text-center shadow-2xl font-sans"
                    >
                      <div className="w-10 h-10 bg-red-50 border border-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Trash2 size={18} className="stroke-[1.5]" />
                      </div>
                      <h3 className="text-sm font-bold text-[#36454F] uppercase tracking-wider mb-2">
                        {language === 'ar' ? 'إزالة العنصر؟' : language === 'ku' ? 'سڕینەوەی بەرهەم؟' : 'Remove Item?'}
                      </h3>
                      <p className="text-xs text-gray-500 leading-relaxed mb-5">
                        {language === 'ar'
                          ? `هل أنت متأكد من إزالة ${getLocalized(drawerItemToDelete.name, language)} من السلة؟`
                          : language === 'ku'
                          ? `دڵنیایت لە سڕینەوەی ${getLocalized(drawerItemToDelete.name, language)} لە سەبەتەکەتدا؟`
                          : `Remove "${getLocalized(drawerItemToDelete.name, language)}" from your cart?`}
                      </p>
                      <div className="flex space-x-3 rtl:space-x-reverse">
                        <button
                          onClick={() => setDrawerItemToDelete(null)}
                          className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-[10px] font-bold uppercase tracking-wider rounded-full transition-all cursor-pointer border-0"
                        >
                          {language === 'ar' ? 'إلغاء' : language === 'ku' ? 'پاشگەزبوونەوە' : 'Cancel'}
                        </button>
                        <button
                          onClick={() => {
                            handleRemoveFromCart(drawerItemToDelete.cartItemId || drawerItemToDelete.id);
                            setDrawerItemToDelete(null);
                          }}
                          className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider rounded-full transition-all cursor-pointer shadow-md border-0"
                        >
                          {language === 'ar' ? 'إزالة' : language === 'ku' ? 'سڕینەوە' : 'Remove'}
                        </button>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Toast Alert */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 350, damping: 22 }}
            className="fixed bottom-8 right-8 z-[200] bg-[#36454F] text-white px-6 py-3.5 rounded-xl shadow-xl flex items-center space-x-3 border border-white/10 select-none font-sans"
          >
            <div className="w-2.5 h-2.5 rounded-full bg-[#B2AC88] animate-ping" />
            <span className="font-semibold text-sm tracking-wide">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* No modal needed */}

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLogoutConfirm(false)}
              className="fixed inset-0 bg-black z-[250] cursor-pointer"
            />
            {/* Modal Dialog */}
            <div className="fixed inset-0 flex items-center justify-center p-4 z-[260] pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: "spring", duration: 0.3 }}
                className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-gray-100 shadow-2xl pointer-events-auto text-center font-sans text-brand-charcoal"
                dir={language === 'ar' || language === 'ku' ? 'rtl' : 'ltr'}
              >
                <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center border border-red-100 mx-auto mb-5">
                  <LogOut className="text-red-500" size={24} />
                </div>
                
                <h3 className="text-lg font-bold text-[#36454F] uppercase tracking-wider">
                  {t('logout_confirm.title')}
                </h3>
                <p className="text-xs text-gray-400 mt-2 max-w-xs mx-auto leading-relaxed font-semibold">
                  {t('logout_confirm.desc')}
                </p>

                <div className="grid grid-cols-2 gap-3.5 mt-8">
                  <button
                    onClick={() => setShowLogoutConfirm(false)}
                    className="py-3 bg-white border border-[#E9ECEF] hover:bg-gray-50 text-[#36454F] text-xs font-bold uppercase tracking-wider rounded-2xl transition-all cursor-pointer text-center select-none active:scale-98 font-bold"
                  >
                    {t('logout_confirm.no')}
                  </button>
                  <button
                    onClick={() => {
                      setIsLoggedIn(false);
                      setCurrentUser(null);
                      setCurrentUserLastName(null);
                      setCurrentUserEmail(null);
                      setCurrentUserRole(null);
                      setCurrentUserStoreName(null);
                      setCart([]);
                      setWishlist([]);
                      setIsInitializingSync(true);
                      setShowLogoutConfirm(false);
                      localStorage.removeItem('isLoggedIn');
                      localStorage.removeItem('cart');
                      localStorage.removeItem('wishlist');
                      localStorage.removeItem('currentUser');
                      localStorage.removeItem('currentUserLastName');
                      localStorage.removeItem('currentUserEmail');
                      localStorage.removeItem('currentUserRole');
                      localStorage.removeItem('currentUserStoreName');
                      if (currentView === 'account' || currentView === 'checkout' || currentView === 'admin') {
                        setCurrentView('home');
                        setViewHistory(['home']);
                      }
                      showToast(t('toasts.logout_success'));
                    }}
                    className="py-3 bg-red-500 hover:bg-red-650 text-white text-xs font-bold uppercase tracking-wider rounded-2xl transition-all cursor-pointer text-center select-none active:scale-98 font-bold shadow-sm"
                  >
                    {t('logout_confirm.yes')}
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Multi-Store Restriction Modal */}
      <AnimatePresence>
        {showMultiStoreModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMultiStoreModal(false)}
              className="fixed inset-0 bg-black/60 z-[250] cursor-pointer backdrop-blur-xs"
            />
            {/* Modal Dialog */}
            <div className="fixed inset-0 flex items-center justify-center p-4 z-[260] pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: "spring", duration: 0.3 }}
                className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-gray-100 shadow-2xl pointer-events-auto text-center font-sans text-brand-charcoal"
                dir={language === 'ar' || language === 'ku' ? 'rtl' : 'ltr'}
              >
                <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center border border-amber-100 mx-auto mb-5">
                  <ShoppingBag className="text-amber-500" size={24} />
                </div>
                
                <h3 className="text-lg font-bold text-[#36454F] uppercase tracking-wider">
                  {language === 'ar' ? 'تنبيه السلة' : language === 'ku' ? 'ئاگاداری سەبەتە' : 'Cart Warning'}
                </h3>
                <p className="text-xs text-gray-500 mt-3 max-w-xs mx-auto leading-relaxed font-semibold">
                  {t('toasts.multi_store_restriction')}
                </p>

                <div className="mt-8 flex justify-center">
                  <button
                    onClick={() => setShowMultiStoreModal(false)}
                    className="py-3 px-8 bg-[#B2AC88] hover:bg-[#B2AC88]/90 text-white text-xs font-bold uppercase tracking-wider rounded-2xl transition-all cursor-pointer text-center select-none active:scale-98 font-bold shadow-md"
                  >
                    {t('toasts.ok')}
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
