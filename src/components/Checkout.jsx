import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle, Truck, ShoppingBag, CreditCard } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.jsx';

const formatIraqiPhone = (value) => {
  let digits = value.replace(/\D/g, '');
  if (digits.startsWith('964')) {
    digits = digits.slice(3);
  }
  if (digits.startsWith('0')) {
    digits = digits.slice(1);
  }
  digits = digits.slice(0, 10);
  let formatted = '+964';
  if (digits.length > 0) {
    formatted += ' ' + digits.slice(0, 3);
  }
  if (digits.length > 3) {
    formatted += ' ' + digits.slice(3, 6);
  }
  if (digits.length > 6) {
    formatted += ' ' + digits.slice(6, 8);
  }
  if (digits.length > 8) {
    formatted += ' ' + digits.slice(8, 10);
  }
  return formatted;
};

const iraqProvinces = [
  'Baghdad',
  'Erbil',
  'Sulaymaniyah',
  'Duhok',
  'Kirkuk',
  'Basra',
  'Najaf',
  'Karbala',
  'Nineveh',
  'Babil',
  'Anbar',
  'Diyala',
  'Salah Al-Din',
  'Wasit',
  'Maysan',
  'Dhi Qar',
  'Muthanna',
  'Qadisiya',
  'Halabja'
];

export default function Checkout({ cart, onClearCart, onBackToHome, previousView = 'home' }) {
  const { t, language } = useLanguage();
  const isRTL = language === 'ar' || language === 'ku';

  const getBackLabel = () => {
    if (previousView === 'cart') return language === 'ar' ? 'العودة للسلة' : language === 'ku' ? 'گەڕانەوە بۆ سەبەتە' : 'Back to Your Cart';
    if (previousView === 'all_products') return language === 'ar' ? 'العودة للمنتجات' : language === 'ku' ? 'گەڕانەوە بۆ بەرهەمەکان' : 'Back to Products';
    if (previousView === 'wishlist') return language === 'ar' ? 'العودة للمفضلة' : language === 'ku' ? 'گەڕانەوە بۆ دڵخوازەکان' : 'Back to Wishlist';
    if (previousView === 'story') return language === 'ar' ? 'العودة لقصتنا' : language === 'ku' ? 'گەڕانەوە بۆ چیرۆکەکەمان' : 'Back to Our Story';
    if (previousView === 'contact') return language === 'ar' ? 'العودة للاتصال' : language === 'ku' ? 'گەڕانەوە بۆ پەیوەندی' : 'Back to Contact';
    return language === 'ar' ? 'العودة للمتجر' : language === 'ku' ? 'گەڕانەوە بۆ فرۆشگا' : 'Back to Store';
  };

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '+964',
    province: 'Baghdad',
    address: '',
    notes: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingCost = subtotal >= 45000 ? 0 : 4000;
  const total = subtotal + shippingCost;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      if (value.length < 4) {
        setFormData((prev) => ({ ...prev, phone: '+964' }));
      } else {
        setFormData((prev) => ({ ...prev, phone: formatIraqiPhone(value) }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) {
      newErrors.fullName = language === 'ar' ? 'الاسم الكامل مطلوب' : language === 'ku' ? 'ناوی تەواو پێویستە' : 'Full name is required';
    }
    const cleanPhone = formData.phone.replace(/\D/g, '');
    if (!formData.phone.trim() || formData.phone === '+964') {
      newErrors.phone = language === 'ar' ? 'رقم الهاتف مطلوب' : language === 'ku' ? 'ژمارەی تەلەفۆن پێویستە' : 'Phone number is required';
    } else if (!formData.phone.startsWith('+964') || cleanPhone.length !== 13) {
      newErrors.phone = language === 'ar' ? 'يجب أن يبدأ رقم الهاتف بـ +964 ويحتوي على 10 أرقام' : language === 'ku' ? 'ژمارەی تەلەفۆن دەبێت بە +964 دەستپێبکات و 10 ژمارە بێت' : 'Phone number must start with +964 and contain exactly 10 digits';
    }
    if (!formData.address.trim()) {
      newErrors.address = language === 'ar' ? 'عنوان التوصيل مطلوب' : language === 'ku' ? 'ناونیشانی گەیاندن پێویستە' : 'Delivery address is required';
    }
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      // Scroll to first error
      const firstErrorKey = Object.keys(validationErrors)[0];
      const element = document.getElementsByName(firstErrorKey)[0];
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.focus();
      }
      return;
    }

    setIsSubmitting(true);

    // Simulate backend checkout request
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setOrderNumber('HW-' + Math.floor(100000 + Math.random() * 900000));
      onClearCart(); // Empty the shopping bag
    }, 1500);
  };

  const tProvince = (prov) => {
    return prov;
  };

  if (isSuccess) {
    return (
      <div className="bg-gradient-to-b from-[#F5F5DC]/40 via-white/50 to-[#F5F5DC]/30 min-h-screen py-16 px-4 flex items-center justify-center font-sans select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, type: 'spring' }}
          className="bg-white border border-gray-100 rounded-3xl p-8 md:p-12 max-w-lg w-full text-center shadow-lg text-start"
        >
          <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-100 shadow-xs">
            <CheckCircle size={44} className="stroke-[1.5]" />
          </div>
          
          <h2 className="text-3xl font-black text-[#36454F] uppercase tracking-wide mb-2 text-center">{t('checkout_page.success_title')}</h2>
          <p className="text-xs font-bold text-[#B2AC88] tracking-wider uppercase mb-6 text-center">
            {language === 'ar' ? 'رمز الطلب: ' : language === 'ku' ? 'کۆدی داواکاری: ' : 'Order Code: '} {orderNumber}
          </p>
          
          <div className="bg-[#F5F5DC]/30 border border-[#B2AC88]/10 rounded-2xl p-5 mb-8 space-y-3.5 text-start">
            <div className="flex items-start space-x-3 rtl:space-x-reverse">
              <Truck size={18} className="text-[#B2AC88] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-[#36454F] uppercase tracking-wider">{language === 'ar' ? 'توصيل محلي سريع' : language === 'ku' ? 'گەیاندنی خێرای ناوخۆیی' : 'Fast Local Delivery'}</h4>
                <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                  {language === 'ar' 
                    ? `سيتم شحن جوارب هاوريشة الفاخرة خلال 24 ساعة. التوصيل المتوقع إلى ${tProvince(formData.province)} هو 2-3 أيام عمل.` 
                    : language === 'ku' 
                    ? `گۆرەوییە ناوازەکانی هاوڕێشە لە ماوەی ٢٤ کاتژمێردا دەنێردرێت. کاتی گەیاندنی خەمڵێنراو بۆ ${tProvince(formData.province)} ٢-٣ ڕۆژی کارکردنە.` 
                    : `Your premium Hawrisha socks will be dispatched within 24 hours. Estimated delivery to ${formData.province} is 2-3 working days.`}
                </p>
              </div>
            </div>
            
            <div className="h-px bg-[#B2AC88]/15" />
            
            <div className="flex items-start space-x-3 rtl:space-x-reverse text-start">
              <CreditCard size={18} className="text-[#B2AC88] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-[#36454F] uppercase tracking-wider">{t('checkout_page.payment_method')}</h4>
                <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                  {language === 'ar' 
                    ? `يرجى تجهيز المبلغ النقدي للدفع للمندوب عند الاستلام. المجموع: ${total.toLocaleString()} د.ع` 
                    : language === 'ku' 
                    ? `تکایە پارەی کاش ئامادە بکە بۆ دان بە گەیەنەر لە کاتی وەرگرتندا. کۆی گشتی: ${total.toLocaleString()} دینار` 
                    : `Please prepare cash to pay the courier upon receipt. Total: ${total.toLocaleString()} IQD`}
                </p>
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-400 max-w-sm mx-auto mb-8 leading-relaxed text-center font-sans">
            {language === 'ar' 
              ? `تم إرسال رسالة تأكيد نصية إلى الرقم ${formData.phone}. شكراً لتسوقك من جوارب هاوريشة!` 
              : language === 'ku' 
              ? `نامەیەکی دڵنیایی کورت بۆ ژمارەی ${formData.phone} نێردرا. سپاس بۆ کڕینت لە گۆرەوی هاوڕێشە!` 
              : `A confirmation SMS has been sent to ${formData.phone}. Thank you for shopping with Hawrisha Socks!`}
          </p>

          <button
            onClick={onBackToHome}
            className="w-full py-4 bg-[#36454F] hover:bg-[#B2AC88] text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-md transition-all duration-300 cursor-pointer active:scale-97 border-0"
          >
            {t('checkout_page.back_home')}
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-[#F5F5DC]/40 via-white/50 to-[#F5F5DC]/30 min-h-screen py-10 px-4 lg:px-16 xl:px-24 font-sans select-none">
      <div className="max-w-[1280px] mx-auto text-start">
        
        {/* Back navigation */}
        <button 
          onClick={onBackToHome}
          className="flex items-center space-x-1.5 rtl:space-x-reverse text-[10px] font-bold uppercase tracking-widest text-[#B2AC88] hover:text-[#36454F] transition-colors mb-6 cursor-pointer group border-0 bg-transparent py-0 px-0"
        >
          <ArrowLeft size={12} className="group-hover:-translate-x-0.5 rtl:group-hover:translate-x-0.5 transition-transform rtl:rotate-180" />
          <span>{getBackLabel()}</span>
        </button>

        <div className="border-b border-gray-100 pb-5 mb-10 text-start">
          <h1 className="text-4xl font-black text-[#36454F] tracking-tight uppercase leading-none">{t('checkout_page.title')}</h1>
          <p className="text-xs text-gray-450 mt-1.5 font-semibold">
            {language === 'ar' ? 'أكمل تفاصيل طلبك أدناه' : language === 'ku' ? 'زانیارییەکانی داواکارییەکەت لە خوارەوە پڕ بکەرەوە' : 'Complete your order details below'}
          </p>
        </div>

        {cart.length === 0 ? (
          <div className="text-center py-20 bg-white border border-gray-100 rounded-3xl max-w-lg mx-auto shadow-xs p-8 text-start">
            <div className="w-14 h-14 bg-gray-50 border border-gray-100 rounded-full flex items-center justify-center mx-auto mb-5 text-gray-300">
              <ShoppingBag size={22} />
            </div>
            <h3 className="text-md font-bold text-[#36454F] uppercase tracking-wider text-center">{t('cart_page.empty')}</h3>
            <p className="text-xs text-gray-400 mt-2 max-w-xs mx-auto leading-relaxed text-center">
              {language === 'ar' ? 'يرجى إضافة عناصر إلى سلتك قبل الذهاب إلى الدفع.' : language === 'ku' ? 'تکایە بەرهەم زیاد بکە بۆ سەبەتەکەت پێش ئەوەی بچیتە لاپەڕەی کۆتاییهێنان بە کڕین.' : 'Please add items to your cart before proceeding to checkout.'}
            </p>
            <button
              onClick={onBackToHome}
              className="mt-6 px-8 py-3 bg-[#36454F] hover:bg-[#B2AC88] text-white text-[10px] font-bold uppercase tracking-wider rounded-full transition-colors cursor-pointer border-0 mx-auto block"
            >
              {language === 'ar' ? 'استكشف المنتجات' : language === 'ku' ? 'بینینی بەرهەمەکان' : 'Explore Products'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:items-start text-start">
            
            {/* Left: Shipping Form */}
            <div className="lg:col-span-7 bg-white border border-gray-100 rounded-3xl p-6 md:p-8 shadow-xs">
              <h3 className="text-sm font-bold text-[#36454F] uppercase tracking-wider mb-6 pb-2 border-b border-gray-50 flex items-center space-x-2 rtl:space-x-reverse">
                <Truck size={16} className="text-[#B2AC88]" />
                <span>{t('checkout_page.shipping_address')}</span>
              </h3>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{language === 'ar' ? 'الاسم الكامل' : language === 'ku' ? 'ناوی تەواو' : 'Full Name'}</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder={language === 'ar' ? 'أدخل اسمك الأول والأخير' : language === 'ku' ? 'ناوی یەکەم و کۆتاییت بنووسە' : 'Enter your first and last name'}
                    className={`w-full px-4 py-3 bg-gray-50/50 border ${errors.fullName ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : 'border-gray-200 focus:border-[#B2AC88] focus:ring-[#B2AC88]/15'} rounded-xl focus:outline-none focus:ring-3 text-xs text-[#36454F] font-semibold transition-all`}
                  />
                  {errors.fullName && <p className="text-[10px] text-red-500 font-bold">{errors.fullName}</p>}
                </div>

                {/* Phone Number & Province */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{t('checkout_page.phone')}</label>
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder=""
                      className={`w-full px-4 py-3 bg-gray-50/50 border ${errors.phone ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : 'border-gray-200 focus:border-[#B2AC88] focus:ring-[#B2AC88]/15'} rounded-xl focus:outline-none focus:ring-3 text-xs text-[#36454F] font-semibold transition-all`}
                    />
                    {errors.phone && <p className="text-[10px] text-red-500 font-bold">{errors.phone}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{t('checkout_page.city')}</label>
                    <div className="relative">
                      <select
                        name="province"
                        value={formData.province}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 focus:border-[#B2AC88] focus:ring-3 focus:ring-[#B2AC88]/15 rounded-xl focus:outline-none text-xs text-[#36454F] font-semibold transition-all appearance-none cursor-pointer"
                      >
                        {iraqProvinces.map((prov) => (
                          <option key={prov} value={prov}>{tProvince(prov)}</option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 end-4 flex items-center text-gray-400">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Delivery Address */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{t('checkout_page.address')}</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder={language === 'ar' ? 'الحي، الشارع، رقم المنزل أو معالم مميزة قريبة' : language === 'ku' ? 'گەڕەک، شەقام، ژمارەی خانوو یان نیشانەی دیار لە نزیکت' : 'Neighborhood, Street, House number or nearby landmarks'}
                    className={`w-full px-4 py-3 bg-gray-50/50 border ${errors.address ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : 'border-gray-200 focus:border-[#B2AC88] focus:ring-[#B2AC88]/15'} rounded-xl focus:outline-none focus:ring-3 text-xs text-[#36454F] font-semibold transition-all`}
                  />
                  {errors.address && <p className="text-[10px] text-red-500 font-bold">{errors.address}</p>}
                </div>

                {/* Order Notes */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{t('checkout_page.order_notes')}</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder={language === 'ar' ? 'تعليمات خاصة بالمندوب، وقت التوصيل المفضل، إلخ.' : language === 'ku' ? 'ڕێنمایی تایبەت بۆ گەیەنەر، کاتی گەیاندنی دڵخواز، هتد.' : 'Special instructions for the courier, preferred delivery time, etc.'}
                    className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 focus:border-[#B2AC88] focus:ring-3 focus:ring-[#B2AC88]/15 rounded-xl focus:outline-none text-xs text-[#36454F] font-semibold transition-all resize-none"
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 mt-4 bg-[#36454F] hover:bg-[#B2AC88] text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-md transition-all duration-300 cursor-pointer flex items-center justify-center space-x-2 border-0"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{language === 'ar' ? 'جاري معالجة الطلب...' : language === 'ku' ? 'داواکارییەکە کارا دەکرێت...' : 'Processing Order...'}</span>
                    </>
                  ) : (
                    <span>{t('checkout_page.place_order')}</span>
                  )}
                </button>
              </form>
            </div>

            {/* Right: Order Summary */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-xs text-start">
                <h3 className="text-sm font-bold text-[#36454F] uppercase tracking-wider mb-6 pb-2 border-b border-gray-50 flex items-center space-x-2 rtl:space-x-reverse">
                  <ShoppingBag size={16} className="text-[#B2AC88]" />
                  <span>{t('checkout_page.order_summary')}</span>
                </h3>

                {/* Items List */}
                <div className="max-h-[300px] overflow-y-auto pr-1 rtl:pl-1 rtl:pr-0 space-y-3.5 mb-6">
                  {cart.map((item) => {
                    const imgUrl = item.image || item.image_url;
                    const finalImg = !imgUrl
                      ? '/categories/cat1.jpg'
                      : (imgUrl.startsWith('data:') || imgUrl.startsWith('/') ? imgUrl : `/uploads/${imgUrl}`);
                    
                    return (
                      <div key={item.id} className="flex space-x-3 rtl:space-x-reverse border border-gray-50 rounded-2xl p-2.5 bg-white text-start">
                        <div className="w-12 h-16 rounded-lg overflow-hidden bg-gray-50 border border-gray-100 shrink-0 flex items-center justify-center">
                          <img src={finalImg} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 flex flex-col justify-between py-0.5 min-w-0">
                          <div>
                            <h4 className="text-xs font-bold text-[#36454F] truncate">{item.name}</h4>
                            <p className="text-[10px] text-gray-400 font-semibold mt-0.5">
                              {language === 'ar' ? 'الكمية: ' : language === 'ku' ? 'بڕ: ' : 'Quantity: '} {item.quantity}
                            </p>
                          </div>
                          <p className="text-[11px] text-[#36454F] font-bold text-end font-sans">
                            {(item.price * item.quantity).toLocaleString()} IQD
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="h-px bg-gray-100 w-full mb-6" />

                {/* Price Breakdown */}
                <div className="space-y-2.5 mb-6 text-start">
                  <div className="flex justify-between text-xs font-semibold text-gray-500 font-sans">
                    <span>{t('cart_page.subtotal')}</span>
                    <span>{subtotal.toLocaleString()} IQD</span>
                  </div>
                  <div className="flex justify-between text-xs font-semibold text-gray-500 font-sans">
                    <span>{t('checkout_page.shipping')}</span>
                    {shippingCost === 0 ? (
                      <span className="text-green-600 font-bold">{t('checkout_page.free')}</span>
                    ) : (
                      <span>{shippingCost.toLocaleString()} IQD</span>
                    )}
                  </div>
                  
                  <div className="h-px bg-gray-100 w-full pt-1" />
                  
                  <div className="flex justify-between text-sm font-bold text-[#36454F] pt-2 font-sans">
                    <span>{language === 'ar' ? 'المجموع الكلي' : language === 'ku' ? 'کۆی گشتی کۆتایی' : 'Grand Total'}</span>
                    <span className="text-base text-[#B2AC88]">{total.toLocaleString()} IQD</span>
                  </div>
                </div>

                {/* Cash on Delivery Notice */}
                <div className="bg-[#36454F]/5 rounded-2xl p-4 flex items-start space-x-3 rtl:space-x-reverse border border-[#36454F]/5 text-start">
                  <Truck size={18} className="text-[#36454F] shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-[11px] font-bold text-[#36454F] uppercase tracking-wider">{t('checkout_page.cod')}</h5>
                    <p className="text-[10px] text-gray-500 mt-0.5 leading-relaxed font-sans">
                      {language === 'ar' 
                        ? 'يتم الدفع مباشرة للمندوب عند تسليم الطلب إلى باب منزلك.' 
                        : language === 'ku' 
                        ? 'پارەدان ڕاستەوخۆ دەبێت بۆ گەیەنەر کاتێک داواکارییەکەت دەگاتە بەردەم دەرگاکەت.' 
                        : 'Payment is made directly to the courier agent when your order is delivered to your door.'}
                    </p>
                  </div>
                </div>

              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
