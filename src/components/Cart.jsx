import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, Truck, ChevronRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function Cart({ cart, onUpdateQuantity, onRemoveItem, onExplore, onCheckout, onBack, previousView = 'home' }) {
  const { t, language } = useLanguage();
  const [itemToDelete, setItemToDelete] = useState(null);
  
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingCost = subtotal >= 45000 ? 0 : 4000;
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
          <h1 className="text-4xl font-black text-[#36454F] tracking-tight uppercase leading-none">{t('cart_page.title')}</h1>
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
                      key={item.id} 
                      variants={itemVariants}
                      layout
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="flex space-x-4 rtl:space-x-reverse border border-[#E9ECEF] rounded-[24px] p-4 bg-white hover:shadow-sm transition-all duration-300 items-center justify-between"
                    >
                      <div className="flex space-x-4 rtl:space-x-reverse items-center min-w-0">
                        {/* Thumbnail */}
                        <div className="w-20 h-24 rounded-2xl overflow-hidden bg-[#F8F9FA] border border-[#E9ECEF] shrink-0 flex items-center justify-center">
                          <img src={finalImg} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        {/* Name and Price info */}
                        <div className="min-w-0 text-start">
                          <h4 className="font-bold text-[#36454F] text-sm truncate uppercase tracking-wider">{item.name}</h4>
                          <p className="text-xs text-gray-400 font-semibold mt-1">
                            {language === 'ar' ? 'سعر الوحدة: ' : language === 'ku' ? 'نرخی یەکە: ' : 'Unit Price: '} {item.price.toLocaleString()} IQD
                          </p>
                          <p className="text-xs font-bold text-[#C08081] mt-2.5">
                            {language === 'ar' ? 'السعر الإجمالي: ' : language === 'ku' ? 'نرخی گشتی: ' : 'Total Price: '} {(item.price * item.quantity).toLocaleString()} IQD
                          </p>
                        </div>
                      </div>

                      {/* Quantity Controls & Delete button */}
                      <div className="flex items-center space-x-4 rtl:space-x-reverse shrink-0">
                        {/* Quantity picker box */}
                        <div className="flex items-center space-x-3.5 rtl:space-x-reverse border border-[#E9ECEF] rounded-full px-3 py-1 bg-gray-50/50">
                          <button
                            onClick={() => onUpdateQuantity(item.id, -1)}
                            className="text-gray-400 hover:text-[#36454F] active:scale-75 transition-transform cursor-pointer border-0 bg-transparent"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="text-xs font-bold text-[#36454F] select-none min-w-[14px] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(item.id, 1)}
                            className="text-gray-400 hover:text-[#36454F] active:scale-75 transition-transform cursor-pointer border-0 bg-transparent"
                          >
                            <Plus size={12} />
                          </button>
                        </div>

                        {/* Remove from Cart */}
                        <button
                          onClick={() => setItemToDelete(item)}
                          className="w-9 h-9 rounded-full border border-red-50 hover:border-red-100 bg-red-50/30 hover:bg-red-50 text-red-400 hover:text-red-600 flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-xs"
                        >
                          <Trash2 size={14} />
                        </button>
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

                {/* Payment notice info */}
                <div className="bg-brand-beige/50 border border-gray-150 rounded-2xl p-4 flex items-start space-x-3 rtl:space-x-reverse text-start">
                  <Truck size={18} className="text-[#36454F] shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-[11px] font-bold text-[#36454F] uppercase tracking-wider">{t('checkout_page.cod')}</h5>
                    <p className="text-[10px] text-gray-500 mt-1 leading-relaxed">
                      {language === 'ar' 
                        ? 'يتم دفع جميع الطلبات في العراق عند الاستلام مباشرة إلى المندوب.' 
                        : language === 'ku' 
                        ? 'هەموو داواکارییەکان لە عێراقدا لە ڕێگەی پارەدان لە کاتی وەرگرتندا دەبێت ڕاستەوخۆ بۆ گەیەنەر لە کاتی وەرگرتندا.' 
                        : 'All orders in Iraq are paid via cash on delivery directly to the courier agent when received.'}
                    </p>
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
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setItemToDelete(null)}
              className="fixed inset-0 bg-black/40 z-50 cursor-pointer"
            />
            {/* Modal Panel */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                className="bg-white border border-[#E9ECEF] rounded-[32px] p-8 max-w-sm w-full text-center shadow-2xl font-sans text-brand-charcoal"
              >
                <div className="w-12 h-12 bg-red-50 border border-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-5">
                  <Trash2 size={22} className="stroke-[1.5]" />
                </div>
                
                <h3 className="text-base font-bold text-[#36454F] uppercase tracking-wider mb-2">
                  {language === 'ar' ? 'إزالة العنصر؟' : language === 'ku' ? 'سڕینەوەی بەرهەم؟' : 'Remove Item?'}
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed mb-6">
                  {language === 'ar' 
                    ? `هل أنت متأكد من إزالة ${itemToDelete.name} من السلة؟` 
                    : language === 'ku' 
                    ? `دڵنیایت لە سڕینەوەی ${itemToDelete.name} لە سەبەتەکەتدا؟` 
                    : `Are you sure you want to remove ${itemToDelete.name} from your cart?`}
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
                      onRemoveItem(itemToDelete.id);
                      setItemToDelete(null);
                    }}
                    className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider rounded-full transition-all cursor-pointer shadow-md hover:shadow-lg border-0"
                  >
                    {t('cart_page.remove')}
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
