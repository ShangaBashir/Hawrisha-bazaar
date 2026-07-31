import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, Truck, ChevronRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.jsx';

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

const getCartColorStyle = (colorVal) => {
  if (!colorVal) return {};
  if (colorVal.startsWith('bg-[#') && colorVal.endsWith(']')) {
    return { backgroundColor: colorVal.slice(4, -1) };
  }
  if (colorVal.startsWith('#')) {
    return { backgroundColor: colorVal };
  }
  return {}; // Let tailwind class handle standard colors like bg-red-500
};

export default function Cart({ cart, onUpdateQuantity, onRemoveItem, onExplore, onCheckout, onBack, previousView = 'home', onProductClick, onStoreClick }) {
  const { t, language } = useLanguage();
  const [itemToDelete, setItemToDelete] = useState(null);
  
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const parsePromo = (val) => {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    try { const p = JSON.parse(val); return Array.isArray(p) ? p : [val]; } catch { return [val]; }
  };
  const hasFreeDelivery = cart.some(item => parsePromo(item.promotion).some(p => p && p.toLowerCase().includes('free delivery')));
  const shippingCost = hasFreeDelivery ? 0 : 4000;
  const total = subtotal + shippingCost;

  const isRTL = language === 'ar' || language === 'ku';

  const getBackLabel = () => {
    if (previousView === 'all_products') return language === 'ar' ? 'العودة للمنتجات' : language === 'ku' ? 'گەڕانەوە بۆ بەرهەمەکان' : 'Back to Products';
    if (previousView === 'wishlist') return language === 'ar' ? 'العودة للمفضلة' : language === 'ku' ? 'گەڕانەوە بۆ دڵخوازەکان' : 'Back to Wishlist';
    if (previousView === 'story') return language === 'ar' ? 'العودة لقصتنا' : language === 'ku' ? 'گەڕانەوە بۆ چیرۆکەکەمان' : 'Back to Our Story';
    if (previousView === 'contact') return language === 'ar' ? 'العودة للاتصال' : language === 'ku' ? 'گەڕانەوە بۆ پەیوەندی' : 'Back to Contact';
    if (previousView === 'checkout') return language === 'ar' ? 'العودة للدفع' : language === 'ku' ? 'گەڕانەوە بۆ کۆتاییهێنان بە کڕین' : 'Back to Checkout';
    return t('cart_page.continue_shopping');
  };

  // Stagger variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', damping: 20 } }
  };

  return (
    <div className="bg-gradient-to-b from-[#F5F5DC]/40 via-white/50 to-[#F5F5DC]/30 min-h-screen py-10 px-4 lg:px-16 xl:px-24 font-sans select-none">
      <div className="max-w-[1280px] mx-auto text-start">
        
        {/* Continue Shopping Link */}
        <button 
          onClick={onBack || onExplore}
          className="flex items-center space-x-1.5 rtl:space-x-reverse text-[10px] font-bold uppercase tracking-widest text-[#B2AC88] hover:text-[#36454F] transition-colors mb-6 cursor-pointer group border-0 bg-transparent py-0 px-0"
        >
          <ArrowLeft size={12} className="group-hover:-translate-x-0.5 rtl:group-hover:translate-x-0.5 transition-transform rtl:rotate-180" />
          <span>{getBackLabel()}</span>
        </button>

        <div className="border-b border-gray-100 pb-5 mb-10 text-start">
          <h1 className="text-3xl md:text-4xl font-black text-[#36454F] tracking-tight uppercase leading-none">{t('cart_page.title')}</h1>
          <p className="text-xs text-gray-400 mt-1.5 font-semibold">
            {language === 'ar' ? 'راجع جوارب شخصياتك الفاخرة قبل الدفع' : language === 'ku' ? 'پێداچوونەوە بە گۆرەوی کەسایەتی ناوازەکەتدا بکە پێش پارەدان' : 'Review your premium character socks before checkout'}
          </p>
        </div>

        {cart.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20 bg-white border border-[#E9ECEF] rounded-[32px] max-w-lg mx-auto shadow-xs p-8"
          >
            <div className="w-16 h-16 bg-gray-50 border border-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
              <ShoppingBag size={24} />
            </div>
            <h3 className="text-lg font-bold text-[#36454F] uppercase tracking-wider">{t('cart_page.empty')}</h3>
            <p className="text-xs text-gray-400 mt-2 max-w-xs mx-auto leading-relaxed">
              {language === 'ar' ? 'أضف بعضاً من جواربنا القطنية الممشطة الفاخرة إلى مجموعتك لتمشي براحة وأناقة!' : language === 'ku' ? 'هەندێک لە گۆرەوییە لۆکە نایابەکانمان زیاد بکە بۆ کۆکراوەکەت بۆ ئەوەی بە ئارامی و جوانییەوە هەنگاو بنێیت!' : 'Add some of our premium combed cotton socks to your collection to walk with comfort and style!'}
            </p>
            <button
              onClick={onExplore}
              className="mt-8 px-8 py-3.5 bg-[#36454F] hover:bg-[#B2AC88] text-white text-[10px] font-bold uppercase tracking-wider rounded-full transition-colors cursor-pointer shadow-md hover:scale-103 active:scale-97 transition-all duration-300 border-0"
            >
              {language === 'ar' ? 'تسوق المجموعة' : language === 'ku' ? 'کڕینی کۆکراوەکان' : 'Shop Collection'}
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:items-start">
            
            {/* Left: Cart Items List (col-span-7) */}
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="lg:col-span-7 space-y-4"
            >
              <AnimatePresence mode="popLayout">
                {cart.map((item) => {
                  const imgUrl = item.image || item.image_url;
                  const finalImg = !imgUrl
                    ? '/categories/cat1.jpg'
                    : (imgUrl.startsWith('data:') || imgUrl.startsWith('/') ? imgUrl : `/uploads/${imgUrl}`);
                  
                  return (
                    <motion.div 
                      key={item.cartItemId || item.id} 
                      variants={itemVariants}
                      layout
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="flex space-x-3 sm:space-x-4 rtl:space-x-reverse border border-[#E9ECEF] rounded-[24px] p-4 bg-white hover:shadow-sm transition-all duration-300"
                    >
                      {/* Thumbnail */}
                      <div 
                        className="w-20 h-24 sm:w-24 sm:h-28 rounded-2xl overflow-hidden bg-[#F8F9FA] border border-[#E9ECEF] shrink-0 flex items-center justify-center cursor-pointer transition-transform hover:scale-105"
                        onClick={() => onProductClick && onProductClick(item)}
                      >
                        <img src={finalImg} alt={getLocalized ? getLocalized(item.name, language) : item.name} onError={(e) => { e.target.onerror = null; e.target.src = '/categories/cat1.jpg'; }} className="w-full h-full object-cover" />
                      </div>

                      {/* Content Wrapper */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between min-w-0 flex-1 gap-4">
                        
                        {/* Name and Price info */}
                        <div className="min-w-0 text-start flex-1">
                          <h4 
                            className="font-bold text-[#36454F] text-[13px] sm:text-sm uppercase tracking-wider line-clamp-2 leading-snug cursor-pointer hover:text-[#B2AC88] transition-colors"
                            onClick={() => onProductClick && onProductClick(item)}
                          >
                             {getLocalized(item.name, language)}
                          </h4>
                          <p className="text-[10px] sm:text-xs text-gray-500 font-bold uppercase tracking-widest mt-0.5">
                            {language === 'ar' ? 'المتجر: ' : language === 'ku' ? 'فرۆشگا: ' : 'Store: '}
                            <span 
                              onClick={() => {
                                const vendor = item.vendor_name || '';
                                if (onStoreClick && vendor) onStoreClick(vendor);
                              }}
                              className="hover:underline hover:text-[#B2AC88] cursor-pointer transition-colors"
                            >
                              {getLocalized(item.vendor_name, language) || 'HAWRISHA'}
                            </span>
                          </p>
                          {/* Promotion Badge */}
                          {(() => {
                            const promos = parsePromo(item.promotion).filter(p => p && p !== 'None' && p !== '');
                            if (promos.length === 0) return null;
                            return (
                              <div className="flex flex-wrap gap-1.5 mt-1">
                                {promos.map((promo, idx) => (
                                  <span key={idx} className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#B2AC88]/10 border border-[#B2AC88]/20 rounded-full text-[9px] sm:text-[10px] font-bold text-[#B2AC88] uppercase tracking-wider">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#B2AC88] shrink-0" />
                                    {promo}
                                  </span>
                                ))}
                              </div>
                            );
                          })()}
                          <div className="text-xs text-gray-400 font-semibold mt-1">
                            {language === 'ar' ? 'سعر الوحدة: ' : language === 'ku' ? 'نرخی یەکە: ' : 'Unit Price: '} 
                            {item.discount > 0 ? (
                              <span className="inline-flex gap-1 items-center ml-1">
                                <span className="line-through text-gray-300">{Math.round(item.price / (1 - item.discount / 100)).toLocaleString()}</span>
                                <span className="text-[#36454F]">{item.price.toLocaleString()} IQD</span>
                                <span className="text-red-500 font-bold ml-1 text-[10px]">({item.discount}% OFF)</span>
                              </span>
                            ) : (
                              <span className="text-[#36454F] ml-1">{item.price.toLocaleString()} IQD</span>
                            )}
                          </div>
                          {/* Selected Options */}
                          {(item.selectedColor || item.selectedStyle || item.selectedSize) && (
                            <div className="flex flex-wrap gap-2 mt-2.5">
                              {item.selectedColor && (
                                <div className="flex items-center space-x-2 rtl:space-x-reverse bg-gray-50 border border-gray-100 rounded-xl px-2.5 py-1.5 w-fit">
                                  <span className="text-gray-400 font-medium text-[10px] sm:text-xs">{language === 'ar' ? 'اللون: ' : language === 'ku' ? 'ڕەنگ: ' : 'Color: '}</span>
                                  <span 
                                    className={`w-3.5 h-3.5 rounded-full border border-gray-200 shrink-0 ${item.selectedColor?.startsWith('bg-') && !item.selectedColor?.includes('[') ? item.selectedColor : ''}`} 
                                    style={getCartColorStyle(item.selectedColor)}
                                  />
                                  <span className="text-[10px] sm:text-xs font-extrabold text-[#36454F]">
                                    {item.selectedColorName || item.selectedColor?.replace('bg-[', '').replace(']', '') || ''}
                                  </span>
                                </div>
                              )}
                              {item.selectedStyle && (
                                <div className="bg-gray-50 border border-gray-100 rounded-xl px-2.5 py-1.5 text-[10px] sm:text-xs font-extrabold text-[#36454F] w-fit">
                                  <span className="text-gray-400 font-medium">{language === 'ar' ? 'النوع: ' : language === 'ku' ? 'جۆر: ' : 'Style: '}</span>
                                  {item.selectedStyle}
                                </div>
                              )}
                              {item.selectedSize && (
                                <div className="bg-gray-50 border border-gray-100 rounded-xl px-2.5 py-1.5 text-[10px] sm:text-xs font-extrabold text-[#36454F] w-fit">
                                  <span className="text-gray-400 font-medium">{language === 'ar' ? 'المقاس: ' : language === 'ku' ? 'قەبارە: ' : 'Size: '}</span>
                                  {item.selectedSize}
                                </div>
                              )}
                            </div>
                          )}
                          <p className="text-xs font-bold text-[#C08081] mt-2.5">
                            {language === 'ar' ? 'السعر الإجمالي: ' : language === 'ku' ? 'نرخی گشتی: ' : 'Total Price: '} {(item.price * item.quantity).toLocaleString()} IQD
                          </p>
                        </div>

                        {/* Quantity Controls & Delete button */}
                        <div className="flex items-center justify-between sm:justify-start space-x-4 rtl:space-x-reverse shrink-0 sm:flex-col sm:space-x-0 sm:space-y-3 sm:items-end w-full sm:w-auto">
                          {/* Quantity picker box */}
                          <div className="flex items-center space-x-3.5 rtl:space-x-reverse border border-[#E9ECEF] rounded-full px-3 py-1.5 bg-gray-50/50">
                            <button
                              onClick={() => onUpdateQuantity(item.cartItemId || item.id, -1)}
                              className="text-gray-400 hover:text-[#36454F] active:scale-75 transition-transform cursor-pointer border-0 bg-transparent"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="text-xs font-bold text-[#36454F] select-none min-w-[14px] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => onUpdateQuantity(item.cartItemId || item.id, 1)}
                              className="text-gray-400 hover:text-[#36454F] active:scale-75 transition-transform cursor-pointer border-0 bg-transparent"
                            >
                              <Plus size={12} />
                            </button>
                          </div>

                          {/* Remove from Cart */}
                          <button
                            onClick={() => setItemToDelete(item)}
                            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-red-50 hover:border-red-100 bg-red-50/30 hover:bg-red-50 text-red-400 hover:text-red-600 flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-xs"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>

                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>

            {/* Right: Summary panel (col-span-5) */}
            <div className="lg:col-span-5">
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="bg-white border border-[#E9ECEF] rounded-[32px] p-7 shadow-xs space-y-6"
              >
                <h3 className="text-sm font-bold text-[#36454F] uppercase tracking-wider pb-3 border-b border-gray-100 flex items-center space-x-2 rtl:space-x-reverse text-start">
                  <ShoppingBag size={16} className="text-[#B2AC88]" />
                  <span>{t('checkout_page.order_summary')}</span>
                </h3>

                {/* Subtotal, Shipping, Grand Total summary breakdown */}
                <div className="space-y-3.5 text-start">
                  <div className="flex justify-between text-xs font-semibold text-gray-500 font-sans">
                    <span>{t('cart_page.subtotal')}</span>
                    <span>{subtotal.toLocaleString()} IQD</span>
                  </div>
                  <div className="flex justify-between text-xs font-semibold text-gray-500 font-sans">
                    <span>{t('checkout_page.shipping')}</span>
                    {shippingCost === 0 ? (
                      <span className="text-green-600 font-bold uppercase tracking-wider">{t('checkout_page.free')}</span>
                    ) : (
                      <span>{shippingCost.toLocaleString()} IQD</span>
                    )}
                  </div>

                  <div className="h-px bg-gray-150 w-full pt-1" />

                  <div className="flex justify-between text-sm font-bold text-[#36454F] pt-1.5 font-sans">
                    <span>{language === 'ar' ? 'السعر الإجمالي لجميع العناصر' : language === 'ku' ? 'کۆی گشتی نرخی بەرهەمەکان' : 'Total price for all the items'}</span>
                    <span className="text-base text-[#C08081]">{total.toLocaleString()} IQD</span>
                  </div>
                </div>



                {/* Proceed Checkout Button */}
                <button
                  onClick={onCheckout}
                  className="w-full py-4 bg-[#36454F] hover:bg-[#C08081] text-white text-xs font-bold uppercase tracking-widest rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center space-x-1.5 rtl:space-x-reverse active:scale-98 border-0"
                >
                  <span>{t('cart_page.checkout')}</span>
                  <ChevronRight size={13} className="rtl:rotate-180" />
                </button>
              </motion.div>
            </div>

          </div>
        )}

      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {itemToDelete && (
          <motion.div
            key="delete-modal"
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setItemToDelete(null)}
              className="absolute inset-0 bg-black/40 cursor-pointer"
            />
            {/* Modal Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="relative bg-white border border-[#E9ECEF] rounded-[32px] p-8 max-w-sm w-full text-center shadow-2xl font-sans text-brand-charcoal"
            >
              <div className="w-12 h-12 bg-red-50 border border-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-5">
                <Trash2 size={22} className="stroke-[1.5]" />
              </div>
              
              <h3 className="text-base font-bold text-[#36454F] uppercase tracking-wider mb-2">
                {language === 'ar' ? 'إزالة العنصر؟' : language === 'ku' ? 'سڕینەوەی بەرهەم؟' : 'Remove Item?'}
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed mb-6">
                {language === 'ar' 
                  ? `هل أنت متأكد من إزالة ${getLocalized(itemToDelete.name, language)} من السلة؟` 
                  : language === 'ku' 
                  ? `دڵنیایت لە سڕینەوەی ${getLocalized(itemToDelete.name, language)} لە سەبەتەکەتدا؟` 
                  : `Are you sure you want to remove ${getLocalized(itemToDelete.name, language)} from your cart?`}
              </p>

              <div className="flex space-x-3.5 rtl:space-x-reverse">
                <button
                  onClick={() => setItemToDelete(null)}
                  className="flex-1 py-3 bg-[#F4F4F6] hover:bg-gray-200 text-gray-600 text-[10px] font-bold uppercase tracking-wider rounded-full transition-all cursor-pointer border-0"
                >
                  {language === 'ar' ? 'إلغاء' : language === 'ku' ? 'پاشگەزبوونەوە' : 'Cancel'}
                </button>
                <button
                  onClick={() => {
                    onRemoveItem(itemToDelete.cartItemId || itemToDelete.id);
                    setItemToDelete(null);
                  }}
                  className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider rounded-full transition-all cursor-pointer shadow-md hover:shadow-lg border-0"
                >
                  {t('cart_page.remove')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
