import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Calendar, ShoppingBag, ArrowLeft, LogOut, Loader2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function Account({ email, onBackToHome, onLogoutClick }) {
  const { t, language } = useLanguage();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const isRTL = language === 'ar' || language === 'ku';

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
  }, [email, language]);

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

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 font-sans text-brand-charcoal" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-10 pb-6 border-b border-gray-200/60">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#36454F] uppercase tracking-wider">
            {t('account_page.title')}
          </h1>
          <p className="text-xs sm:text-sm text-[#B2AC88] font-medium mt-1">
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
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-[#B2AC88]/15 border border-[#B2AC88]/30 flex items-center justify-center text-[#B2AC88]">
                <User size={24} />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#36454F] uppercase tracking-wide">
                  {t('account_page.details')}
                </h2>
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
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm h-full flex flex-col justify-between min-h-[400px]">
            <div>
              <div className="flex items-center gap-2.5 mb-6">
                <ShoppingBag size={20} className="text-[#36454F]" />
                <h2 className="text-base font-bold text-[#36454F] uppercase tracking-wide">
                  {t('account_page.orders')}
                </h2>
              </div>
              <div className="h-px bg-gray-100 mb-8" />
            </div>

            {/* Empty State */}
            <div className="flex-grow flex flex-col items-center justify-center text-center space-y-4 py-8">
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
            
            <div />
          </div>
        </div>
      </div>
    </div>
  );
}
