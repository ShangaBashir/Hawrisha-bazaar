import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Phone, Calendar, ShoppingBag, ArrowLeft, LogOut, Loader2, Package, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Edit2, X, Save, Check, Trash2 } from 'lucide-react';
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

const getColorStyle = (colorClass) => {
  if (!colorClass) return {};
  if (colorClass.startsWith("bg-[#") && colorClass.endsWith("]")) {
    return { backgroundColor: colorClass.slice(4, -1) };
  }
  if (colorClass.startsWith("#")) {
    return { backgroundColor: colorClass };
  }
  return {};
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

const getProductImage = (imgUrl) => {
  if (!imgUrl) return null;
  if (imgUrl.startsWith('data:') || imgUrl.startsWith('http://') || imgUrl.startsWith('https://')) {
    return imgUrl;
  }
  if (imgUrl.startsWith('/')) {
    return imgUrl;
  }
  return `/uploads/${imgUrl}`;
};

export default function Account({ email, onBackToHome, onLogoutClick, onViewChange }) {
  const { t, language } = useLanguage();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState(null);
  
  // Edit Profile States
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ firstName: '', lastName: '', phone: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [editError, setEditError] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const isRTL = language === 'ar' || language === 'ku';

  const [ordersPage, setOrdersPage] = useState(0);
  const [cancellationLimitMinutes, setCancellationLimitMinutes] = useState(15);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [cancellingOrderId, setCancellingOrderId] = useState(null);
  const [alertModal, setAlertModal] = useState({ isOpen: false, message: '', isSuccess: false });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetch('/api/settings/system-settings')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.settings && data.settings.order_cancellation_limit_minutes) {
          setCancellationLimitMinutes(Number(data.settings.order_cancellation_limit_minutes));
        }
      })
      .catch(err => console.error('Error fetching settings:', err));
  }, []);

  const fetchCustomerOrders = (showLoading = true) => {
    if (!email) return;
    if (showLoading) setOrdersLoading(true);
    fetch(`/api/orders/customer?email=${encodeURIComponent(email)}&_t=${Date.now()}`)
      .then(async (res) => {
        const data = await res.json();
        if (data.success) {
          setOrders(data.orders || []);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (showLoading) setOrdersLoading(false);
      });
  };

  const handleCancelOrder = (orderId) => {
    setCancellingOrderId(orderId);
  };

  const confirmCancelOrder = async (orderId) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/customer-cancel`, {
        method: 'POST',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAlertModal({
          isOpen: true,
          message: language === 'ar' ? 'تم إلغاء الطلب بنجاح.' : language === 'ku' ? 'داواکارییەکە بە سەرکەوتوویی هەڵوەشێنرایەوە.' : 'Order cancelled successfully.',
          isSuccess: true
        });
        fetchCustomerOrders(false);
      } else {
        setAlertModal({
          isOpen: true,
          message: data.message || (language === 'ar' ? 'فشل إلغاء الطلب.' : language === 'ku' ? 'هەڵوەشاندنەوەی داواکارییەکە سەرکەوتوو نەبوو.' : 'Failed to cancel order.'),
          isSuccess: false
        });
      }
    } catch (err) {
      console.error(err);
      setAlertModal({
        isOpen: true,
        message: language === 'ar' ? 'حدث خطأ أثناء إلغاء الطلب.' : language === 'ku' ? 'هەڵەیەک ڕوويدا لە کاتی هەڵوەشاندنەوەی داواکارییەکە.' : 'An error occurred while cancelling the order.',
        isSuccess: false
      });
    }
  };

  useEffect(() => {
    if (!email) {
      setError(language === 'ar' ? 'البريد الإلكتروني مفقود.' : language === 'ku' ? 'ئیمەیڵ دەستنیشان نەکراوە.' : 'Email is missing.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    fetch(`/api/auth/profile?email=${encodeURIComponent(email)}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || 'Failed to load profile.');
        }
        return data;
      })
      .then((data) => {
        if (data.success && data.profile) {
          setProfile(data.profile);
        } else {
          throw new Error('Failed to parse profile data.');
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching profile:', err);
        setError(err.message || 'An error occurred while loading profile.');
        setIsLoading(false);
      });

    // Initial fetch
    fetchCustomerOrders(true);

    // Setup real-time polling every 8 seconds
    const intervalId = setInterval(() => {
      fetchCustomerOrders(false);
    }, 8000);

    return () => clearInterval(intervalId);
  }, [email, language]);

  const handleEditClick = () => {
    setEditForm({
      firstName: profile.firstName || '',
      lastName: profile.lastName || '',
      phone: formatIraqiPhone(profile.phone || '')
    });
    setEditError('');
    setShowConfirm(false);
    setSaveSuccess(false);
    setIsEditing(true);
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setEditError('');

    const cleanPhone = editForm.phone.replace(/\D/g, '');
    if (!editForm.phone || editForm.phone === '+964') {
      setEditError(language === 'ar' ? 'رقم الهاتف مطلوب.' : language === 'ku' ? 'ژمارەی تەلەفۆن پێویستە.' : 'Phone number is required.');
      return;
    } else if (!editForm.phone.startsWith('+964') || cleanPhone.length !== 13) {
      setEditError(language === 'ar' ? 'يجب أن يبدأ رقم الهاتف بـ +964 ويحتوي على 10 أرقام' : language === 'ku' ? 'ژمارەی تەلەفۆن دەبێت بە +964 دەستپێبکات و 10 ژمارە بێت' : 'Phone number must start with +964 and contain exactly 10 digits.');
      return;
    }

    setShowConfirm(true);
  };

  const confirmAndSaveProfile = async () => {
    setEditError('');
    setIsSaving(true);
    
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: profile.email,
          firstName: editForm.firstName,
          lastName: editForm.lastName,
          phone: editForm.phone
        })
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Failed to update profile.');
      }
      
      setProfile({ ...profile, ...data.profile });
      localStorage.setItem('currentUser', data.profile.firstName);
      localStorage.setItem('currentUserLastName', data.profile.lastName);

      setSaveSuccess(true);
      setShowConfirm(false);

      setTimeout(() => {
        setIsEditing(false);
        setSaveSuccess(false);
      }, 1500);
      
    } catch (err) {
      setEditError(err.message || 'An error occurred while saving.');
      setShowConfirm(false);
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(language === 'ar' ? 'ar-EG' : language === 'ku' ? 'ku-Arab' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Pending':   return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Accepted':  return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Shipped':   return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Delivered': return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'Sold':      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Cancelled': return 'bg-red-50 text-red-600 border-red-200';
      default:          return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  const getStatusLabel = (status) => {
    if (language === 'ar') {
      const map = { Pending: 'قيد الانتظار', Accepted: 'تم القبول — قيد التحضير', Shipped: 'تم الشحن', Delivered: 'تم التسليم ✓', Sold: 'مُباع', Cancelled: 'ملغي' };
      return map[status] || status;
    }
    if (language === 'ku') {
      const map = { Pending: 'چاوەڕوانە', Accepted: 'قبوڵکرا — ئامادەدەکرێت', Shipped: 'نێردرا', Delivered: 'گەیاند ✓', Sold: 'فرۆشرا', Cancelled: 'هەڵوەشاندەوە' };
      return map[status] || status;
    }
    // English
    const map = {
      Pending:   '⏳ Awaiting Confirmation',
      Accepted:  '📦 Packed & Ready',
      Shipped:   '🚚 Out for Delivery',
      Delivered: '✅ Delivered',
      Sold:      '✓ Sold',
      Cancelled: '✗ Cancelled',
    };
    return map[status] || status;
  };


  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 text-[#B2AC88] animate-spin" />
        <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest animate-pulse">
          {language === 'ar' ? 'جاري تحميل الملف الشخصي...' : language === 'ku' ? 'بارکردنی زانیارییەکان...' : 'Loading Profile...'}
        </p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-[60vh] max-w-md mx-auto px-4 flex flex-col items-center justify-center text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center border border-red-100">
          <User className="text-red-400" size={24} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-[#36454F] uppercase tracking-wider">
            {language === 'ar' ? 'فشل تحميل الحساب' : language === 'ku' ? 'شکستهێنان لە بارکردنی حیساب' : 'Failed to Load Account'}
          </h3>
          <p className="text-xs text-gray-400 mt-2 leading-relaxed">
            {error || (language === 'ar' ? 'تعذر جلب تفاصيل ملفك الشخصي.' : language === 'ku' ? 'زانیارییەکانی حیسابەکەت دەستنەکەوت.' : 'Could not retrieve your profile details.')}
          </p>
        </div>
        <button
          onClick={onBackToHome}
          className="px-6 py-2.5 bg-[#36454F] hover:bg-[#B2AC88] text-white text-[10px] font-bold uppercase tracking-wider rounded-full transition-colors cursor-pointer"
        >
          {t('wishlist_page.back_shop')}
        </button>
      </div>
    );
  }

  const ordersPerPage = 8;
  const totalPages = Math.ceil(orders.length / ordersPerPage);
  const paginatedOrders = orders.slice(ordersPage * ordersPerPage, (ordersPage + 1) * ordersPerPage);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 font-sans text-brand-charcoal" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-10 pb-6 border-b border-gray-200/60">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#36454F] uppercase tracking-wider">
            {t('account_page.title')}
          </h1>
          <p className="text-3xl sm:text-5xl text-[#B2AC88] font-black mt-2 tracking-wide">
            {t('account_page.welcome', { name: profile.firstName })}
          </p>
        </div>
        <button
          onClick={onBackToHome}
          className="flex items-center self-start sm:self-center gap-2 text-xs font-bold uppercase tracking-wider text-[#36454F] hover:text-[#B2AC88] transition-colors cursor-pointer border border-gray-200 hover:border-[#B2AC88]/30 px-4 py-2 rounded-full bg-white shadow-xs"
        >
          <ArrowLeft size={14} className={isRTL ? 'rotate-180' : ''} />
          {t('wishlist_page.back_shop')}
        </button>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Profile Details */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
            <div className="flex items-center gap-4 relative">
              <div className="w-14 h-14 rounded-full bg-[#B2AC88]/15 border border-[#B2AC88]/30 flex items-center justify-center text-[#B2AC88]">
                <User size={24} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-[#36454F] uppercase tracking-wide">
                    {t('account_page.details')}
                  </h2>
                  <button 
                    onClick={handleEditClick}
                    className="p-1.5 text-gray-400 hover:text-[#B2AC88] bg-gray-50 hover:bg-[#B2AC88]/10 rounded-full transition-colors cursor-pointer"
                    title={language === 'ar' ? 'تعديل الملف الشخصي' : language === 'ku' ? 'دەستکاریکردنی زانیارییەکان' : 'Edit Profile'}
                  >
                    <Edit2 size={16} />
                  </button>
                </div>
                <p className="text-[10px] text-gray-400 font-semibold tracking-wider uppercase mt-0.5">
                  HAWRISHA MEMBER
                </p>
              </div>
            </div>

            <div className="h-px bg-gray-100" />

            {/* Profile Info Cards */}
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <User size={16} className="text-[#B2AC88] shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                    {t('account_page.first_name')}
                  </p>
                  <p className="text-xs font-semibold text-[#36454F] truncate mt-0.5">
                    {profile.firstName}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <User size={16} className="text-[#B2AC88] shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                    {t('account_page.last_name')}
                  </p>
                  <p className="text-xs font-semibold text-[#36454F] truncate mt-0.5">
                    {profile.lastName}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone size={16} className="text-[#B2AC88] shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                    {t('account_page.phone')}
                  </p>
                  <p className="text-xs font-semibold text-[#36454F] truncate mt-0.5" dir="ltr">
                    {profile.phone}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail size={16} className="text-[#B2AC88] shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                    {t('account_page.email')}
                  </p>
                  <p className="text-xs font-semibold text-[#36454F] truncate mt-0.5">
                    {profile.email}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar size={16} className="text-[#B2AC88] shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                    {language === 'ar' ? 'تاريخ الانضمام' : language === 'ku' ? 'ڕێکەوتی بەشداربوون' : 'Member Since'}
                  </p>
                  <p className="text-xs font-semibold text-[#36454F] truncate mt-0.5">
                    {formatDate(profile.createdAt)}
                  </p>
                </div>
              </div>
            </div>

            <div className="h-px bg-gray-100" />

            {/* Go to Dashboard button for Admins & Vendors */}
            {profile.role === 'admin' && (
              <button
                onClick={() => onViewChange('admin')}
                className="w-full py-3 bg-[#B2AC88] hover:bg-[#36454F] text-white text-xs font-bold uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer hover:shadow-md active:scale-98"
              >
                Admin Dashboard
              </button>
            )}

            {/* Logout Button */}
            <button
              onClick={onLogoutClick}
              className="w-full py-3 bg-[#36454F] hover:bg-red-500 text-white hover:text-white text-xs font-bold uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer hover:shadow-md active:scale-98"
            >
              <LogOut size={14} />
              {t('account_page.logout')}
            </button>
          </div>
        </div>

        {/* Right Side: Order History */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2.5 mb-6">
              <ShoppingBag size={20} className="text-[#36454F]" />
              <h2 className="text-base font-bold text-[#36454F] uppercase tracking-wide">
                {t('account_page.orders')}
              </h2>
              {orders.length > 0 && (
                <span className="ml-2 bg-[#B2AC88] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {orders.length}
                </span>
              )}
            </div>
            <div className="h-px bg-gray-100 mb-6" />

            {ordersLoading ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-3">
                <Loader2 className="w-6 h-6 text-[#B2AC88] animate-spin" />
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest">
                  {language === 'ar' ? 'جاري تحميل الطلبات...' : language === 'ku' ? 'بارکردنی داواکارییەکان...' : 'Loading Orders...'}
                </p>
              </div>
            ) : orders.length === 0 ? (
              /* Empty State */
              <div className="flex flex-col items-center justify-center text-center space-y-4 py-8">
                <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100">
                  <ShoppingBag className="text-gray-300" size={24} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#36454F] uppercase tracking-wider">
                    {language === 'ar' ? 'لا توجد طلبات بعد' : language === 'ku' ? 'هیچ داواکارییەک نییە' : 'No Orders Yet'}
                  </h4>
                  <p className="text-xs text-gray-400 mt-2 max-w-sm leading-relaxed">
                    {t('account_page.no_orders')}
                  </p>
                </div>
                <button
                  onClick={onBackToHome}
                  className="px-6 py-2.5 bg-[#B2AC88] hover:bg-[#36454F] text-white text-[10px] font-bold uppercase tracking-wider rounded-full transition-colors cursor-pointer"
                >
                  {t('wishlist_page.back_shop')}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {paginatedOrders.map((order) => (
                  <motion.div
                    key={order.id}
                    layout
                    className="border border-gray-100 rounded-2xl overflow-hidden"
                  >
                    {/* Order Header */}
                    <button
                      type="button"
                      onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                      className="w-full text-start px-5 py-4 bg-gray-50/80 flex items-center justify-between gap-3 cursor-pointer hover:bg-gray-100/50 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-wrap">
                        <div className="flex items-center gap-2">
                          <Package size={14} className="text-[#B2AC88] shrink-0" />
                          <span className="text-xs font-black text-[#B2AC88] tracking-wider font-sans">
                            #{order.order_number}
                          </span>
                        </div>
                        <span className="text-[10px] text-gray-400 font-semibold">
                          {formatDate(order.created_at)}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${getStatusStyle(order.status)}`}>
                          {getStatusLabel(order.status)}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs font-bold text-[#36454F] font-sans">
                          {Number(order.total).toLocaleString()} IQD
                        </span>
                        {expandedOrder === order.id ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
                      </div>
                    </button>

                    {/* Order Items (collapsible) */}
                    <AnimatePresence>
                      {expandedOrder === order.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-5 py-4 space-y-3 border-t border-gray-100">
                            {/* Delivery Info */}
                            <div className="grid grid-cols-3 gap-3 mb-4">
                              <div>
                                <span className="uppercase tracking-wider text-gray-400 font-black text-xs mb-1 block">
                                  {language === 'ar' ? 'المنطقة' : language === 'ku' ? 'پارێزگا' : 'Province'}
                                </span>
                                <span className="text-sm font-extrabold text-[#36454F]">{order.province}</span>
                              </div>
                              <div>
                                <span className="uppercase tracking-wider text-gray-400 font-black text-xs mb-1 block">
                                  {language === 'ar' ? 'العنوان' : language === 'ku' ? 'ناونیشان' : 'Address'}
                                </span>
                                <span className="text-sm font-extrabold text-[#36454F]">{order.address}</span>
                              </div>
                              <div>
                                <span className="uppercase tracking-wider text-gray-400 font-black text-xs mb-1 block">
                                  {language === 'ar' ? 'المتجر' : language === 'ku' ? 'فرۆشگا' : 'Store'}
                                </span>
                                {order.items && order.items[0] ? (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const rawStoreName = order.items[0].store_name || `Store #${order.items[0].store_id}`;
                                      const storeName = getLocalized(rawStoreName, 'en');
                                      const slug = storeName.toLowerCase().replace(/\s+/g, '-');
                                      window.history.pushState(null, '', `/store/${slug}`);
                                      onViewChange('stores');
                                    }}
                                    className="text-sm font-black text-[#B2AC88] hover:text-[#36454F] hover:underline cursor-pointer block text-left transition-colors border-0 p-0 bg-transparent font-sans"
                                  >
                                    {getLocalized(order.items[0].store_name, language) || `Store #${order.items[0].store_id}`}
                                  </button>
                                ) : (
                                  <span className="text-sm font-extrabold text-[#B2AC88]">
                                    —
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Items */}
                            <div className="h-px bg-gray-100" />
                            <div className="space-y-3 pt-3">
                              {(order.items || []).map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between gap-4 py-2.5 border-b border-gray-50 last:border-b-0">
                                  <div className="flex items-center gap-3.5 flex-1 min-w-0">
                                    {/* Item Image */}
                                    {item.image_url ? (
                                      <img
                                        src={getProductImage(item.image_url)}
                                        alt={getLocalized(item.product_name, language)}
                                        className="w-16 h-16 rounded-xl object-cover border border-gray-100 shrink-0 shadow-sm"
                                      />
                                    ) : (
                                      <div className="w-16 h-16 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100 shrink-0 text-gray-400">
                                        <Package size={20} />
                                      </div>
                                    )}
                                    {/* Item Info */}
                                    <div className="min-w-0">
                                      <p className="text-sm md:text-base font-extrabold text-[#36454F] leading-tight truncate">
                                        {getLocalized(item.product_name, language)}
                                      </p>
                                      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mt-2 text-sm font-bold text-gray-600">
                                        <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-md text-xs font-black">
                                          {language === 'ar' ? 'الكمية: ' : language === 'ku' ? 'بڕ: ' : 'Qty: '}{item.quantity}
                                        </span>
                                        {item.selected_color && (
                                          <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-1 rounded-md border border-gray-100/80 text-xs font-black">
                                            <span className="text-gray-400 font-semibold">{language === 'ar' ? 'اللون' : language === 'ku' ? 'ڕەنگ' : 'Color'}:</span>
                                            {item.selected_color.startsWith('bg-[') ? (
                                              <span className="flex items-center gap-1.5">
                                                <span className="w-3.5 h-3.5 rounded-full border border-gray-300 shadow-sm" style={getColorStyle(item.selected_color)} />
                                                <span className="text-gray-700">{item.selected_color_name || item.selected_color}</span>
                                              </span>
                                            ) : (
                                              <span className="text-gray-700">{item.selected_color_name || item.selected_color}</span>
                                            )}
                                          </span>
                                        )}
                                        {item.selected_size && (
                                          <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-1 rounded-md border border-gray-100/80 text-xs font-black">
                                            <span className="text-gray-400 font-semibold">{language === 'ar' ? 'المقاس' : language === 'ku' ? 'قەبارە' : 'Size'}:</span>
                                            <span className="text-gray-700">{item.selected_size}</span>
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="text-right shrink-0">
                                    <p className="text-sm md:text-base font-extrabold text-[#36454F] font-sans">
                                      {(item.price * item.quantity).toLocaleString()} IQD
                                    </p>
                                    <p className="text-xs text-gray-400 font-bold mt-0.5">
                                      {item.price.toLocaleString()} IQD
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Total row */}
                            <div className="h-px bg-gray-100" />
                            <div className="flex justify-between items-center pt-1">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                {language === 'ar' ? 'الإجمالي' : language === 'ku' ? 'کۆی گشتی' : 'Total'}
                              </span>
                              <span className="text-sm font-black text-[#B2AC88] font-sans">
                                {Number(order.total).toLocaleString()} IQD
                              </span>
                            </div>

                            {/* Cancellation section */}
                            {(() => {
                              if (order.status !== 'Pending') return null;
                              
                              const orderTime = new Date(order.created_at).getTime();
                              const limitMs = cancellationLimitMinutes * 60 * 1000;
                              const timeRemainingMs = (orderTime + limitMs) - currentTime;
                              const isWithinLimit = timeRemainingMs > 0;

                              if (isWithinLimit) {
                                const minutesLeft = Math.floor(timeRemainingMs / 60000);
                                const secondsLeft = Math.floor((timeRemainingMs % 60000) / 1000);
                                const countdownStr = `${minutesLeft}:${secondsLeft.toString().padStart(2, '0')}`;

                                return (
                                  <div className="mt-4 pt-3 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-red-50/40 p-3 rounded-xl border border-red-100/50">
                                    <span className="text-[11px] font-bold text-red-600">
                                      {language === 'ar' 
                                        ? `ينتهي وقت الإلغاء خلال: ${countdownStr}` 
                                        : language === 'ku' 
                                        ? `کاتی هەڵوەشاندنەوە کۆتایی دێت لە: ${countdownStr}` 
                                        : `Cancellation window closes in: ${countdownStr}`}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => handleCancelOrder(order.id)}
                                      className="px-4 py-1.5 bg-red-500 hover:bg-red-600 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                                    >
                                      {language === 'ar' ? 'إلغاء الطلب' : language === 'ku' ? 'هەڵوەشاندنەوەی داواکاری' : 'Cancel Order'}
                                    </button>
                                  </div>
                                );
                              } else {
                                return (
                                  <div className="mt-4 pt-3 border-t border-gray-100 text-center bg-gray-50/50 p-2.5 rounded-xl border border-gray-100">
                                    <span className="text-[11px] font-bold text-gray-400">
                                      {language === 'ar' 
                                        ? 'لقد انتهت فترة الإلغاء.' 
                                        : language === 'ku' 
                                        ? 'ماوەی هەڵوەشاندنەوە بەسەرچوو.' 
                                        : 'The cancellation period has expired.'}
                                    </span>
                                  </div>
                                );
                              }
                            })()}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}

                {/* Pagination Controls */}
                {orders.length > ordersPerPage && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    className="flex flex-col items-center justify-center space-y-4 mt-8"
                  >
                    <div className="text-xs text-gray-500 font-medium font-sans select-none">
                      {language === 'ar'
                        ? `عرض ${ordersPage * ordersPerPage + 1} إلى ${Math.min(orders.length, (ordersPage + 1) * ordersPerPage)} من ${orders.length} طلبات — صفحة ${ordersPage + 1} من ${totalPages}`
                        : language === 'ku'
                          ? `پیشاندانی ${ordersPage * ordersPerPage + 1} بۆ ${Math.min(orders.length, (ordersPage + 1) * ordersPerPage)} لە ${orders.length} داواکاری — لاپەڕە ${ordersPage + 1} لە ${totalPages}`
                          : `Showing ${ordersPage * ordersPerPage + 1} to ${Math.min(orders.length, (ordersPage + 1) * ordersPerPage)} of ${orders.length} orders — Page ${ordersPage + 1} of ${totalPages}`}
                    </div>
                    
                    <div className="flex items-center justify-center space-x-4">
                      {/* Prev Button */}
                      <button
                        type="button"
                        disabled={ordersPage === 0}
                        onClick={() => {
                          setOrdersPage(prev => Math.max(0, prev - 1));
                        }}
                        className="p-1.5 border border-[#B2AC88] text-[#B2AC88] hover:bg-[#B2AC88]/10 disabled:opacity-30 disabled:cursor-not-allowed rounded-full transition-all cursor-pointer flex items-center justify-center"
                        aria-label="Previous Page"
                      >
                        <ChevronLeft size={16} />
                      </button>

                      {/* Dots */}
                      <div className="flex items-center space-x-2.5">
                        {[...Array(totalPages)].map((_, i) => {
                          const isActive = ordersPage === i;
                          return (
                            <button
                              key={i}
                              onClick={() => {
                                setOrdersPage(i);
                              }}
                              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                                isActive 
                                  ? 'bg-[#B2AC88] scale-110 shadow-xs' 
                                  : 'border border-[#B2AC88] bg-transparent hover:bg-[#B2AC88]/15'
                              }`}
                              aria-label={`Go to page ${i + 1}`}
                            />
                          );
                        })}
                      </div>

                      {/* Next Button */}
                      <button
                        type="button"
                        disabled={ordersPage === totalPages - 1}
                        onClick={() => {
                          setOrdersPage(prev => Math.min(totalPages - 1, prev + 1));
                        }}
                        className="p-1.5 border border-[#B2AC88] text-[#B2AC88] hover:bg-[#B2AC88]/10 disabled:opacity-30 disabled:cursor-not-allowed rounded-full transition-all cursor-pointer flex items-center justify-center"
                        aria-label="Next Page"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {isEditing && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => { setIsEditing(false); setShowConfirm(false); setSaveSuccess(false); }}
              className="fixed inset-0 bg-black z-50 cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            >
              <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl pointer-events-auto max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-black text-[#36454F] uppercase tracking-wide">
                    {language === 'ar' ? 'تعديل الملف الشخصي' : language === 'ku' ? 'دەستکاریکردنی زانیارییەکان' : 'Edit Profile'}
                  </h3>
                  <button
                    onClick={() => { setIsEditing(false); setShowConfirm(false); setSaveSuccess(false); }}
                    className="p-2 text-gray-400 hover:text-red-500 bg-gray-50 hover:bg-red-50 rounded-full transition-colors cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>

                {saveSuccess ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-100 text-emerald-500">
                      <Check size={28} className="stroke-[3]" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-[#36454F] uppercase tracking-wider">
                        {language === 'ar' ? 'تم التحديث!' : language === 'ku' ? 'نوێکرایەوە!' : 'Updated!'}
                      </h4>
                      <p className="text-xs text-gray-400 mt-2 font-semibold">
                        {language === 'ar' ? 'تم تحديث الملف الشخصي بنجاح.' : language === 'ku' ? 'پڕۆفایلەکەت بە سەرکەوتوویی نوێکرایەوە.' : 'Profile has been updated successfully.'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSaveProfile} className="space-y-4">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5 block">
                        {t('account_page.first_name')}
                      </label>
                      <input
                        type="text"
                        value={editForm.firstName}
                        onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                        required
                        disabled={showConfirm}
                        className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 focus:border-[#B2AC88] focus:ring-2 focus:ring-[#B2AC88]/20 rounded-xl focus:outline-none text-xs text-[#36454F] font-semibold transition-all disabled:opacity-60"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5 block">
                        {t('account_page.last_name')}
                      </label>
                      <input
                        type="text"
                        value={editForm.lastName}
                        onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                        required
                        disabled={showConfirm}
                        className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 focus:border-[#B2AC88] focus:ring-2 focus:ring-[#B2AC88]/20 rounded-xl focus:outline-none text-xs text-[#36454F] font-semibold transition-all disabled:opacity-60"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5 block">
                        {t('account_page.phone')}
                      </label>
                      <input
                        type="text"
                        value={editForm.phone}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val.length < 4) {
                            setEditForm({ ...editForm, phone: '+964' });
                          } else {
                            setEditForm({ ...editForm, phone: formatIraqiPhone(val) });
                          }
                        }}
                        required
                        disabled={showConfirm}
                        className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 focus:border-[#B2AC88] focus:ring-2 focus:ring-[#B2AC88]/20 rounded-xl focus:outline-none text-xs text-[#36454F] font-semibold transition-all disabled:opacity-60"
                        dir="ltr"
                      />
                      <p className="text-[10px] text-gray-400 mt-1">
                        {language === 'ar' ? 'يجب أن يبدأ بـ +964 ويحتوي على 10 أرقام.' : language === 'ku' ? 'دەبێت بە +964 دەستپێبکات و 10 ژمارە بێت.' : 'Must start with +964 and contain exactly 10 digits.'}
                      </p>
                    </div>

                    {editError && (
                      <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-500 text-xs font-semibold leading-relaxed">
                        {editError}
                      </div>
                    )}

                    {showConfirm ? (
                      <div className="p-4 bg-gray-50/70 border border-gray-100 rounded-2xl space-y-3 mt-3">
                        <p className="text-xs text-gray-500 font-bold text-center">
                          {language === 'ar' ? 'هل أنت متأكد من حفظ التغييرات؟' : language === 'ku' ? 'دڵنیایت لە پاشەکەوتکردنی گۆڕانکارییەکان؟' : 'Are you sure you want to save the changes?'}
                        </p>
                        <div className="flex gap-2.5">
                          <button
                            type="button"
                            onClick={confirmAndSaveProfile}
                            disabled={isSaving}
                            className="flex-1 py-3 bg-[#B2AC88] hover:bg-[#36454F] disabled:bg-gray-200 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 border-0"
                          >
                            {isSaving ? <Loader2 className="animate-spin" size={14} /> : <Check size={14} />}
                            <span>{language === 'ar' ? 'نعم، حفظ' : language === 'ku' ? 'بەڵێ، پاشەکەوت' : 'Yes, Save'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowConfirm(false)}
                            disabled={isSaving}
                            className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-500 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer border-0"
                          >
                            {language === 'ar' ? 'إلغاء' : language === 'ku' ? 'نەخێر' : 'Cancel'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="submit"
                        disabled={isSaving}
                        className="w-full py-4 mt-2 bg-[#B2AC88] hover:bg-[#36454F] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md transition-all duration-300 cursor-pointer flex items-center justify-center space-x-2 border-0"
                      >
                        <Save size={16} />
                        <span>{language === 'ar' ? 'حفظ التغييرات' : language === 'ku' ? 'پاشەکەوتکردنی گۆڕانکارییەکان' : 'Save Changes'}</span>
                      </button>
                    )}
                  </form>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Custom Order Cancellation Confirmation Modal */}
      <AnimatePresence>
        {cancellingOrderId && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setCancellingOrderId(null)}
              className="fixed inset-0 bg-black/60 z-[250] cursor-pointer backdrop-blur-xs"
            />
            {/* Dialog */}
            <div className="fixed inset-0 flex items-center justify-center p-4 z-[260] pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: "spring", duration: 0.3 }}
                className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-gray-100 shadow-2xl pointer-events-auto text-center font-sans text-brand-charcoal"
                dir={language === 'ar' || language === 'ku' ? 'rtl' : 'ltr'}
              >
                <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center border border-red-100 mx-auto mb-5 text-red-500">
                  <Trash2 size={24} />
                </div>
                
                <h3 className="text-lg font-bold text-[#36454F] uppercase tracking-wider">
                  {language === 'ar' ? 'إلغاء الطلب؟' : language === 'ku' ? 'هەڵوەشاندنەوەی داواکاری؟' : 'Cancel Order?'}
                </h3>
                <p className="text-xs text-gray-500 mt-3 max-w-xs mx-auto leading-relaxed font-semibold">
                  {language === 'ar' 
                    ? 'هل أنت متأكد من أنك تريد إلغاء هذا الطلب واسترجاع العناصر إلى المتجر؟' 
                    : language === 'ku' 
                    ? 'دڵنیایت دەتەوێت ئەم داواکارییە هەڵوەشێنیتەوە و کاڵاکان بگەڕێنیتەوە؟' 
                    : 'Are you sure you want to cancel this order? This action will restore the stock of items.'}
                </p>

                <div className="mt-8 flex gap-3">
                  <button
                    onClick={() => setCancellingOrderId(null)}
                    className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-500 text-xs font-bold uppercase tracking-wider rounded-2xl transition-all cursor-pointer border-0"
                  >
                    {language === 'ar' ? 'لا، تراجع' : language === 'ku' ? 'نەخێر، پاشگەزبوونەوە' : 'No, Keep'}
                  </button>
                  <button
                    onClick={() => {
                      const orderId = cancellingOrderId;
                      setCancellingOrderId(null);
                      confirmCancelOrder(orderId);
                    }}
                    className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white text-xs font-bold uppercase tracking-wider rounded-2xl transition-all cursor-pointer border-0 shadow-md shadow-red-200"
                  >
                    {language === 'ar' ? 'نعم، إلغاء' : language === 'ku' ? 'بەڵێ، هەڵوەشێنەوە' : 'Yes, Cancel'}
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Custom Alert/Status Modal */}
      <AnimatePresence>
        {alertModal.isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setAlertModal(prev => ({ ...prev, isOpen: false }))}
              className="fixed inset-0 bg-black/60 z-[250] cursor-pointer backdrop-blur-xs"
            />
            {/* Dialog */}
            <div className="fixed inset-0 flex items-center justify-center p-4 z-[260] pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: "spring", duration: 0.3 }}
                className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-gray-100 shadow-2xl pointer-events-auto text-center font-sans text-brand-charcoal"
                dir={language === 'ar' || language === 'ku' ? 'rtl' : 'ltr'}
              >
                <div className={`w-14 h-14 rounded-full flex items-center justify-center border mx-auto mb-5 ${
                  alertModal.isSuccess ? 'bg-emerald-50 border-emerald-100 text-emerald-500' : 'bg-red-50 border-red-100 text-red-500'
                }`}>
                  {alertModal.isSuccess ? <Check size={24} /> : <X size={24} />}
                </div>
                
                <h3 className="text-lg font-bold text-[#36454F] uppercase tracking-wider">
                  {alertModal.isSuccess 
                    ? (language === 'ar' ? 'تم بنجاح' : language === 'ku' ? 'سەرکەوتوو بوو' : 'Success') 
                    : (language === 'ar' ? 'فشل العملية' : language === 'ku' ? 'کردارەکە سەرکەوتوو نەبوو' : 'Failed')}
                </h3>
                <p className="text-xs text-gray-500 mt-3 max-w-xs mx-auto leading-relaxed font-semibold">
                  {alertModal.message}
                </p>

                <div className="mt-8">
                  <button
                    onClick={() => setAlertModal(prev => ({ ...prev, isOpen: false }))}
                    className={`w-full py-3 text-white text-xs font-bold uppercase tracking-wider rounded-2xl transition-all cursor-pointer border-0 shadow-md ${
                      alertModal.isSuccess ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200' : 'bg-red-500 hover:bg-red-600 shadow-red-200'
                    }`}
                  >
                    {language === 'ar' ? 'حسناً' : language === 'ku' ? 'باشە' : 'OK'}
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
