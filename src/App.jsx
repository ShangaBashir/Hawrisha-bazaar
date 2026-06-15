import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { useLanguage } from './context/LanguageContext.jsx';
import BestSeller from './components/BestSeller';
import Header from './components/Header';
import HeroCarousel from './components/HeroCarousel';
import ProductGrid from './components/ProductGrid';
import Footer from './components/Footer';
import AllProducts from './components/AllProducts';
import AdminDashboard from './components/AdminDashboard';
import Wishlist from './components/Wishlist';
import Checkout from './components/Checkout';
import Contact from './components/Contact';
import Story from './components/Story';
import Cart from './components/Cart';
import Account from './components/Account';
import AuthPage from './components/AuthPage';
import VendorDashboard from './components/VendorDashboard';
import Stores from './components/Stores';
import CategoriesPage from './components/CategoriesPage';

function App() {
  const { t, language } = useLanguage();
  const [currentView, setCurrentView] = useState(() => {
    // Check if the route is /admin
    if (window.location.pathname === '/admin') {
      return 'admin';
    }
    return 'home';
  });

  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedProductForDetail, setSelectedProductForDetail] = useState(null);
  const [globalSearchTerm, setGlobalSearchTerm] = useState('');
  
  // Auth states
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentUserEmail, setCurrentUserEmail] = useState(null);
  const [currentUserRole, setCurrentUserRole] = useState(null);
  const [currentUserStoreName, setCurrentUserStoreName] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(''), 2500);
  };

  // Automatically scroll to the top of the screen when switching pages
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentView]);

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

  const [viewHistory, setViewHistory] = useState(['home']);

  const handleViewChange = (view) => {
    if ((view === 'cart' || view === 'checkout') && !isLoggedIn) {
      setCurrentView('auth');
      setViewHistory(prev => [...prev, 'auth']);
      showToast(t('toasts.login_required_cart'));
      return;
    }
    setCurrentView(view);
    if (view !== 'all_products') {
      setSelectedProductForDetail(null);
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

  const handleBack = () => {
    if (viewHistory.length <= 1) {
      setCurrentView('home');
      setViewHistory(['home']);
      return;
    }
    const newHistory = viewHistory.slice(0, -1);
    const lastView = newHistory[newHistory.length - 1] || 'home';
    setCurrentView(lastView);
    setViewHistory(newHistory);
  };

  const previousView = viewHistory[viewHistory.length - 2] || 'home';

  const handleAddToCart = (product, quantity = 1) => {
    if (!isLoggedIn) {
      setIsLoginModalOpen(true);
      showToast(t('toasts.login_required_add'));
      return;
    }
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prev, { ...product, quantity }];
    });
  };

  const handleRemoveFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const handleUpdateCartQuantity = (productId, delta) => {
    setCart(prev =>
      prev.map(item => {
        if (item.id === productId) {
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
            setGlobalSearchTerm(term);
            handleViewChange('all_products');
          }}
        />
      )}
      <main className="flex-grow">
        {currentView === 'home' && (
          <>
            <HeroCarousel />
            <BestSeller 
              onViewAll={() => {
                setSelectedCategory('All');
                handleViewChange('all_products');
              }} 
              onAddToCart={handleAddToCart}
            />
            <ProductGrid 
              onCategorySelect={(catName) => {
                setSelectedCategory(catName);
                handleViewChange('all_products');
              }} 
            />
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
            previousView={previousView}
            isLoggedIn={isLoggedIn}
            onLoginRequired={() => handleViewChange('auth')}
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
              handleViewChange('all_products');
            }}
            previousView={previousView}
            isLoggedIn={isLoggedIn}
            onLoginRequired={() => handleViewChange('auth')}
          />
        )}

        {currentView === 'stores' && (
          <Stores 
            cart={cart}
            likedProducts={wishlist}
            onAddToCart={handleAddToCart}
            onRemoveFromCart={handleRemoveFromCart}
            onToggleWishlist={handleToggleWishlist}
            onProductClick={(product) => {
              setSelectedProductForDetail(product);
              handleViewChange('all_products');
            }}
            isLoggedIn={isLoggedIn}
            onLoginRequired={() => handleViewChange('auth')}
          />
        )}

        {currentView === 'categories' && (
          <CategoriesPage 
            cart={cart}
            likedProducts={wishlist}
            onAddToCart={handleAddToCart}
            onRemoveFromCart={handleRemoveFromCart}
            onToggleWishlist={handleToggleWishlist}
            onProductClick={(product) => {
              setSelectedProductForDetail(product);
              handleViewChange('all_products');
            }}
            isLoggedIn={isLoggedIn}
            onLoginRequired={() => handleViewChange('auth')}
          />
        )}

        {currentView === 'admin' && (
          <AdminDashboard />
        )}

        {currentView === 'checkout' && (
          <Checkout 
            cart={cart}
            onClearCart={() => setCart([])}
            onBackToHome={handleBack}
            previousView={previousView}
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
          />
        )}

        {currentView === 'auth' && (
          <AuthPage 
            onLoginSuccess={(username, email, role, storeName) => {
              setIsLoggedIn(true);
              setCurrentUser(username);
              setCurrentUserEmail(email);
              setCurrentUserRole(role);
              setCurrentUserStoreName(storeName);
              showToast(t('toasts.login_success', { user: username }));
              handleBack();
            }}
            onCancel={handleBack}
          />
        )}

        {currentView === 'vendor_dashboard' && (
          <VendorDashboard 
            email={currentUserEmail}
            storeName={currentUserStoreName}
            onBackToHome={() => handleViewChange('home')}
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
          />
        )}
      </main>
      {!isAdminView && <Footer onViewChange={handleViewChange} />}

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
                  <h3 className="text-lg font-bold text-[#36454F] uppercase tracking-wider">Your Cart</h3>
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
                      <h4 className="text-sm font-bold text-[#36454F] uppercase tracking-wider">Your cart is empty</h4>
                      <p className="text-xs text-gray-400 mt-1 max-w-[200px] mx-auto leading-relaxed">
                        Add some of our premium character socks to get started!
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setIsCartOpen(false);
                        handleViewChange('all_products');
                      }}
                      className="px-6 py-2.5 bg-[#B2AC88] hover:bg-[#36454F] text-white text-[10px] font-bold uppercase tracking-wider rounded-full transition-colors cursor-pointer"
                    >
                      Shop Products
                    </button>
                  </div>
                ) : (
                  cart.map((item) => {
                    const imgUrl = item.image || item.image_url;
                    const finalImg = !imgUrl
                      ? '/categories/cat1.jpg'
                      : (imgUrl.startsWith('data:') || imgUrl.startsWith('/') ? imgUrl : `/uploads/${imgUrl}`);
                    
                    return (
                      <div key={item.id} className="flex space-x-4 border border-gray-100 rounded-2xl p-3 bg-white hover:shadow-xs transition-shadow">
                        {/* Thumbnail */}
                        <div className="w-16 h-20 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 shrink-0 flex items-center justify-center">
                          <img src={finalImg} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        {/* Details */}
                        <div className="flex-1 flex flex-col justify-between py-0.5">
                          <div>
                            <h4 className="text-xs font-bold text-[#36454F]">{item.name}</h4>
                            <p className="text-[11px] text-gray-400 font-semibold mt-0.5">
                              {item.price.toLocaleString()} IQD
                            </p>
                          </div>
                          <div className="flex items-center justify-between">
                            {/* Quantity Controls */}
                            <div className="flex items-center space-x-2.5 border border-gray-150 rounded-full px-2 py-0.5 bg-gray-50/50">
                              <button
                                onClick={() => handleUpdateCartQuantity(item.id, -1)}
                                className="text-gray-400 hover:text-[#36454F] active:scale-75 transition-transform"
                              >
                                <Minus size={11} />
                              </button>
                              <span className="text-xs font-bold text-[#36454F] select-none min-w-[12px] text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => handleUpdateCartQuantity(item.id, 1)}
                                className="text-gray-400 hover:text-[#36454F] active:scale-75 transition-transform"
                              >
                                <Plus size={11} />
                              </button>
                            </div>
                            {/* Remove Icon */}
                            <button
                              onClick={() => handleRemoveFromCart(item.id)}
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
                      <span>Subtotal</span>
                      <span>
                        {cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toLocaleString()} IQD
                      </span>
                    </div>
                    <div className="flex justify-between text-xs font-semibold text-gray-500">
                      <span>Delivery</span>
                      {(() => {
                        const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
                        return subtotal >= 45000 ? (
                          <span className="text-green-600 font-bold">FREE</span>
                        ) : (
                          <span>4,000 IQD</span>
                        );
                      })()}
                    </div>
                    <div className="flex justify-between text-sm font-bold text-[#36454F] pt-1">
                      <span>Total</span>
                      <span>
                        {(() => {
                          const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
                          const shipping = subtotal >= 45000 ? 0 : 4000;
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
                      View Cart
                    </button>
                    <button 
                      onClick={() => {
                        setIsCartOpen(false);
                        handleViewChange('checkout');
                      }}
                      className="py-3.5 bg-[#36454F] hover:bg-[#C08081] text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-md transition-all cursor-pointer select-none text-center hover:scale-102 active:scale-98"
                    >
                      Checkout
                    </button>
                  </div>
                </div>
              )}
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
                      setCurrentUserEmail(null);
                      setCurrentUserRole(null);
                      setCurrentUserStoreName(null);
                      setCart([]);
                      setShowLogoutConfirm(false);
                      if (currentView === 'account' || currentView === 'checkout' || currentView === 'vendor_dashboard') {
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
    </div>
  );
}

export default App;
