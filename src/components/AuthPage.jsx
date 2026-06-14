import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Phone, Eye, EyeOff, ArrowLeft, Loader2, Store } from 'lucide-react';
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

export default function AuthPage({ onLoginSuccess, onCancel }) {
  const { t, language } = useLanguage();
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotMode, setIsForgotMode] = useState(false);
  
  // Form inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('+964');
  const [role, setRole] = useState('customer'); // 'customer' or 'vendor'
  const [storeName, setStoreName] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const isRTL = language === 'ar' || language === 'ku';

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Clear fields when switching tabs
  useEffect(() => {
    setEmail('');
    setPassword('');
    setFirstName('');
    setLastName('');
    setPhone('+964');
    setRole('customer');
    setStoreName('');
    setErrors({});
    setServerError('');
    setShowPassword(false);
  }, [isSignUp, isForgotMode]);

  const handleEmailChange = (val) => {
    setEmail(val);
    if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
    setServerError('');
  };

  const handlePasswordChange = (val) => {
    setPassword(val);
    if (errors.password) setErrors(prev => ({ ...prev, password: '' }));
    setServerError('');
  };

  const handleFirstNameChange = (val) => {
    setFirstName(val);
    if (errors.firstName) setErrors(prev => ({ ...prev, firstName: '' }));
    setServerError('');
  };

  const handleLastNameChange = (val) => {
    setLastName(val);
    if (errors.lastName) setErrors(prev => ({ ...prev, lastName: '' }));
    setServerError('');
  };

  const handlePhoneChange = (val) => {
    setPhone(val);
    if (errors.phone) setErrors(prev => ({ ...prev, phone: '' }));
    setServerError('');
  };

  const handleStoreNameChange = (val) => {
    setStoreName(val);
    if (errors.storeName) setErrors(prev => ({ ...prev, storeName: '' }));
    setServerError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});
    setServerError('');

    const newErrors = {};

    if (isForgotMode) {
      if (!email) {
        newErrors.email = language === 'ar' ? 'البريد الإلكتروني مطلوب.' : language === 'ku' ? 'ئیمەیڵ پێویستە.' : 'Email is required.';
      } else if (!email.toLowerCase().endsWith('@gmail.com')) {
        newErrors.email = language === 'ar' ? 'يجب أن ينتهي البريد الإلكتروني بـ @gmail.com' : language === 'ku' ? 'ئیمەیڵ دەبێت بە @gmail.com کۆتایی بێت' : 'Email must end with @gmail.com';
      }

      const cleanPhone = phone.replace(/\D/g, '');
      if (!phone || phone === '+964') {
        newErrors.phone = language === 'ar' ? 'رقم الهاتف مطلوب.' : language === 'ku' ? 'ژمارەی تەلەفۆن پێویستە.' : 'Phone number is required.';
      } else if (!phone.startsWith('+964') || cleanPhone.length !== 13) {
        newErrors.phone = language === 'ar' ? 'يجب أن يبدأ رقم الهاتف بـ +964 ويحتوي على 10 أرقام' : language === 'ku' ? 'ژمارەی تەلەفۆن دەبێت بە +964 دەستپێبکات و 10 ژمارە بێت' : 'Phone number must start with +964 and contain exactly 10 digits.';
      }

      if (!password) {
        newErrors.password = language === 'ar' ? 'كلمة المرور الجديدة مطلوبة.' : language === 'ku' ? 'وشەی تێپەڕی نوێ پێویستە.' : 'New password is required.';
      } else if (password.length < 8) {
        newErrors.password = language === 'ar' ? 'يجب أن تتكون كلمة المرور من 8 أحرف على الأقل.' : language === 'ku' ? 'دەبێت وشەی تێپەڕ لانی کەم 8 پیت بێت.' : 'Password must be at least 8 characters.';
      }
    } else if (isSignUp) {
      if (!firstName.trim()) {
        newErrors.firstName = language === 'ar' ? 'الاسم الأول مطلوب.' : language === 'ku' ? 'ناوی یەکەم پێویستە.' : 'First name is required.';
      }
      if (!lastName.trim()) {
        newErrors.lastName = language === 'ar' ? 'الاسم الأخير مطلوب.' : language === 'ku' ? 'ناوی کۆتایی پێویستە.' : 'Last name is required.';
      }

      const cleanPhone = phone.replace(/\D/g, '');
      if (!phone || phone === '+964') {
        newErrors.phone = language === 'ar' ? 'رقم الهاتف مطلوب.' : language === 'ku' ? 'ژمارەی تەلەفۆن پێویستە.' : 'Phone number is required.';
      } else if (!phone.startsWith('+964') || cleanPhone.length !== 13) {
        newErrors.phone = language === 'ar' ? 'يجب أن يبدأ رقم الهاتف بـ +964 ويحتوي على 10 أرقام' : language === 'ku' ? 'ژمارەی تەلەفۆن دەبێت بە +964 دەستپێبکات و 10 ژمارە بێت' : 'Phone number must start with +964 and contain exactly 10 digits.';
      }

      if (!email) {
        newErrors.email = language === 'ar' ? 'البريد الإلكتروني مطلوب.' : language === 'ku' ? 'ئیمەیڵ پێویستە.' : 'Email is required.';
      } else if (!email.toLowerCase().endsWith('@gmail.com')) {
        newErrors.email = language === 'ar' ? 'يجب أن ينتهي البريد الإلكتروني بـ @gmail.com' : language === 'ku' ? 'ئیمەیڵ دەبێت بە @gmail.com کۆتایی بێت' : 'Email must end with @gmail.com';
      }

      if (!password) {
        newErrors.password = language === 'ar' ? 'كلمة المرور مطلوبة.' : language === 'ku' ? 'وشەی تێپەڕ پێویستە.' : 'Password is required.';
      } else if (password.length < 8) {
        newErrors.password = language === 'ar' ? 'يجب أن تتكون كلمة المرور من 8 أحرف على الأقل.' : language === 'ku' ? 'دەبێت وشەی تێپەڕ لانی کەم 8 پیت بێت.' : 'Password must be at least 8 characters.';
      }

      if (role === 'vendor' && !storeName.trim()) {
        newErrors.storeName = language === 'ar' ? 'اسم المتجر مطلوب للتجار.' : language === 'ku' ? 'ناوی فرۆشگا پێویستە بۆ فرۆشیاران.' : 'Store Name is required for vendors.';
      }
    } else {
      // Sign In mode
      if (!email) {
        newErrors.email = language === 'ar' ? 'البريد الإلكتروني مطلوب.' : language === 'ku' ? 'ئیمەیڵ پێویستە.' : 'Email is required.';
      } else if (!email.toLowerCase().endsWith('@gmail.com')) {
        newErrors.email = language === 'ar' ? 'يجب أن ينتهي البريد الإلكتروني بـ @gmail.com' : language === 'ku' ? 'ئیمەیڵ دەبێت بە @gmail.com کۆتایی بێت' : 'Email must end with @gmail.com';
      }
      if (!password) {
        newErrors.password = language === 'ar' ? 'كلمة المرور مطلوبة.' : language === 'ku' ? 'وشەی تێپەڕ پێویستە.' : 'Password is required.';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    let endpoint = '/api/auth/login';
    let payload = { email, password };

    if (isForgotMode) {
      endpoint = '/api/auth/reset-password';
      payload = { email, phone, newPassword: password };
    } else if (isSignUp) {
      endpoint = '/api/auth/register';
      payload = { firstName, lastName, phone, email, password, role, storeName: role === 'vendor' ? storeName : null };
    }

    fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || 'Something went wrong.');
        }
        return data;
      })
      .then((data) => {
        setIsLoading(false);
        if (isForgotMode) {
          setIsForgotMode(false);
          setIsSignUp(false);
          setServerError('');
        } else {
          // Success login or registration
          onLoginSuccess(
            data.firstName || firstName || email.split('@')[0], 
            data.email || email,
            data.role || role,
            data.storeName || (role === 'vendor' ? storeName : null)
          );
        }
      })
      .catch((err) => {
        setIsLoading(false);
        const errMsg = err.message;
        
        if (!isSignUp && !isForgotMode) {
          if (errMsg.toLowerCase().includes("no account") || errMsg.toLowerCase().includes("invalid email") || errMsg.toLowerCase().includes("not found") || errMsg.toLowerCase().includes("exist")) {
            setErrors({
              email: language === 'ar'
                ? 'ليس لديك حساب، يرجى إنشاء حساب أولاً'
                : language === 'ku'
                ? 'هیچ حیسابێکت نییە، تکایە سەرەتا حیسابێک دروست بکە'
                : 'You do not have an account, please create an account first.'
            });
            return;
          }
          if (errMsg.toLowerCase().includes("password")) {
            setErrors({
              password: language === 'ar'
                ? 'كلمة المرور غير صحيحة.'
                : language === 'ku'
                ? 'وشەی تێپەڕی نادروست.'
                : 'Incorrect password.'
            });
            return;
          }
        }
        setServerError(errMsg);
      });
  };

  return (
    <div className="min-h-[85vh] bg-[#F7F6F0] py-16 px-4 flex items-center justify-center font-sans text-brand-charcoal" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="w-full max-w-lg bg-white rounded-[32px] border border-gray-150 shadow-2xl p-8 sm:p-10 relative overflow-hidden">
        
        {/* Back Button */}
        <button
          onClick={onCancel}
          className="absolute top-6 start-6 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-[#B2AC88] transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} className={isRTL ? 'rotate-180' : ''} />
          {t('wishlist_page.back_shop')}
        </button>

        {/* Logo Icon and Brand Header */}
        <div className="flex flex-col items-center justify-center mt-6 mb-8 select-none" dir="ltr">
          <div className="flex items-center gap-[2px] text-[#1a365d] mb-2">
            <span className="text-xl font-black tracking-[0.06em] uppercase">HAWRISHA</span>
            <span className="text-xl font-extrabold tracking-[0.35em] uppercase text-[#B2AC88]">SOCKS</span>
          </div>
          <p className="text-[10px] tracking-widest text-gray-400 uppercase font-bold">
            {isForgotMode 
              ? (language === 'ar' ? 'إعادة تعيين كلمة المرور' : language === 'ku' ? 'دووبارە ڕێکخستنەوەی وشەی تێپەڕ' : 'Reset Password') 
              : isSignUp 
              ? t('login.sign_up') 
              : t('login.sign_in')}
          </p>
        </div>

        {/* Tab Headers (Hidden in Forgot Password Mode) */}
        {!isForgotMode && (
          <div className="grid grid-cols-2 gap-2 border border-gray-100 rounded-2xl p-1 mb-8 bg-gray-50/50">
            <button
              onClick={() => setIsSignUp(false)}
              className={`py-3 text-xs font-extrabold tracking-wider uppercase rounded-xl transition-all cursor-pointer ${
                !isSignUp 
                  ? 'bg-[#36454F] text-white shadow-md' 
                  : 'text-gray-400 hover:text-brand-charcoal hover:bg-white/50'
              }`}
            >
              {t('login.sign_in')}
            </button>
            <button
              onClick={() => setIsSignUp(true)}
              className={`py-3 text-xs font-extrabold tracking-wider uppercase rounded-xl transition-all cursor-pointer ${
                isSignUp 
                  ? 'bg-[#36454F] text-white shadow-md' 
                  : 'text-gray-400 hover:text-brand-charcoal hover:bg-white/50'
              }`}
            >
              {t('login.sign_up')}
            </button>
          </div>
        )}

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {serverError && (
            <div className="p-4 bg-red-50 border border-red-150 rounded-2xl flex items-center space-x-3 rtl:space-x-reverse text-red-650 text-xs font-semibold leading-relaxed">
              <div className="w-1.5 h-1.5 rounded-full bg-red-550 shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          {isSignUp && !isForgotMode && (
            <>
              {/* Role Toggle Button */}
              <div className="space-y-2">
                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
                  {t('login.role_label')}
                </label>
                <div className="grid grid-cols-2 gap-3.5">
                  <button
                    type="button"
                    onClick={() => setRole('customer')}
                    className={`py-3 px-4 rounded-2xl border text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      role === 'customer'
                        ? 'border-[#36454F] bg-[#36454F]/5 text-[#36454F]'
                        : 'border-gray-200 bg-white text-gray-400 hover:border-gray-300'
                    }`}
                  >
                    <User size={14} />
                    {t('login.role_customer')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('vendor')}
                    className={`py-3 px-4 rounded-2xl border text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      role === 'vendor'
                        ? 'border-[#B2AC88] bg-[#B2AC88]/10 text-[#B2AC88]'
                        : 'border-gray-200 bg-white text-gray-400 hover:border-gray-300'
                    }`}
                  >
                    <Store size={14} />
                    {t('login.role_vendor')}
                  </button>
                </div>
              </div>

              {/* Store Name Input (if Vendor) */}
              <AnimatePresence>
                {role === 'vendor' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-1.5 overflow-hidden"
                  >
                    <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
                      {t('login.store_name')}
                    </label>
                    <div className="relative">
                      <Store className="absolute start-4 top-1/2 -translate-y-1/2 text-gray-350" size={16} />
                      <input
                        type="text"
                        value={storeName}
                        onChange={(e) => handleStoreNameChange(e.target.value)}
                        className={`w-full ps-11 pe-4 py-3.5 bg-gray-50 border rounded-2xl text-xs font-semibold focus:outline-none transition-all ${
                          errors.storeName 
                            ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500' 
                            : 'border-gray-200 focus:border-[#B2AC88] focus:bg-white'
                        }`}
                        placeholder={language === 'ar' ? 'مثال: متجر الجوارب الخاص بي' : language === 'ku' ? 'نموونە: فرۆشگای من' : 'e.g. My Socks Shop'}
                      />
                    </div>
                    {errors.storeName && (
                      <p className="text-[11px] text-red-500 font-bold mt-1 px-1">{errors.storeName}</p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* First Name & Last Name */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
                    {t('login.first_name')}
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => handleFirstNameChange(e.target.value)}
                    className={`w-full px-4 py-3.5 bg-gray-50 border rounded-2xl text-xs font-semibold focus:outline-none transition-all ${
                      errors.firstName 
                        ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500' 
                        : 'border-gray-200 focus:border-[#36454F] focus:bg-white'
                    }`}
                  />
                  {errors.firstName && (
                    <p className="text-[11px] text-red-500 font-bold mt-1 px-1">{errors.firstName}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
                    {t('login.last_name')}
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => handleLastNameChange(e.target.value)}
                    className={`w-full px-4 py-3.5 bg-gray-50 border rounded-2xl text-xs font-semibold focus:outline-none transition-all ${
                      errors.lastName 
                        ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500' 
                        : 'border-gray-200 focus:border-[#36454F] focus:bg-white'
                    }`}
                  />
                  {errors.lastName && (
                    <p className="text-[11px] text-red-500 font-bold mt-1 px-1">{errors.lastName}</p>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Email Address */}
          <div className="space-y-1.5">
            <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
              {t('login.email')}
            </label>
            <div className="relative">
              <Mail className="absolute start-4 top-1/2 -translate-y-1/2 text-gray-350" size={16} />
              <input
                type="text"
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                className={`w-full ps-11 pe-4 py-3.5 bg-gray-50 border rounded-2xl text-xs font-semibold focus:outline-none transition-all ${
                  errors.email 
                    ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500' 
                    : 'border-gray-200 focus:border-[#36454F] focus:bg-white'
                }`}
                placeholder="username@gmail.com"
              />
            </div>
            {errors.email && (
              <p className="text-[11px] text-red-500 font-bold mt-1 px-1">{errors.email}</p>
            )}
          </div>

          {/* Phone Number (Sign Up or Forgot Password) */}
          {(isSignUp || isForgotMode) && (
            <div className="space-y-1.5">
              <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
                {t('login.phone')}
              </label>
              <div className="relative">
                <Phone className="absolute start-4 top-1/2 -translate-y-1/2 text-gray-350" size={16} />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => handlePhoneChange(formatIraqiPhone(e.target.value))}
                  className={`w-full ps-11 pe-4 py-3.5 bg-gray-50 border rounded-2xl text-xs font-semibold focus:outline-none transition-all ${
                    errors.phone 
                      ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500' 
                      : 'border-gray-200 focus:border-[#36454F] focus:bg-white'
                  }`}
                  placeholder="+964 770 123 45 67"
                  dir="ltr"
                />
              </div>
              {errors.phone && (
                <p className="text-[11px] text-red-500 font-bold mt-1 px-1">{errors.phone}</p>
              )}
            </div>
          )}

          {/* Password */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                {isForgotMode 
                  ? (language === 'ar' ? 'كلمة المرور الجديدة' : language === 'ku' ? 'وشەی تێپەڕی نوێ' : 'New Password') 
                  : t('login.password')}
              </label>
              {!isSignUp && !isForgotMode && (
                <button
                  type="button"
                  onClick={() => setIsForgotMode(true)}
                  className="text-[10px] font-bold text-gray-400 hover:text-[#B2AC88] transition-colors border-0 p-0 cursor-pointer bg-transparent uppercase tracking-wider"
                >
                  {language === 'ar' ? 'هل نسيت كلمة المرور؟' : language === 'ku' ? 'وشەی تێپەڕت بیرچووە؟' : 'Forgot Password?'}
                </button>
              )}
            </div>
            <div className="relative">
              <Lock className="absolute start-4 top-1/2 -translate-y-1/2 text-gray-350" size={16} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                className={`w-full ps-11 pe-12 py-3.5 bg-gray-50 border rounded-2xl text-xs font-semibold focus:outline-none transition-all ${
                  errors.password 
                    ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500' 
                    : 'border-gray-200 focus:border-[#36454F] focus:bg-white'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute end-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-charcoal cursor-pointer border-0 bg-transparent"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-[11px] text-red-500 font-bold mt-1 px-1">{errors.password}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-[#36454F] hover:bg-[#B2AC88] text-white text-xs font-extrabold uppercase tracking-wider rounded-2xl transition-colors shadow-md mt-6 flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-70 disabled:pointer-events-none"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : isForgotMode ? (
              language === 'ar' ? 'تحديث كلمة المرور' : language === 'ku' ? 'نوێکردنەوەی وشەی تێپەڕ' : 'Reset Password'
            ) : isSignUp ? (
              t('login.btn_signup')
            ) : (
              t('login.btn_login')
            )}
          </button>
        </form>

        {/* Bottom switcher helper */}
        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          {isForgotMode ? (
            <button
              onClick={() => {
                setIsForgotMode(false);
                setIsSignUp(false);
              }}
              className="text-xs font-bold text-gray-400 hover:text-[#B2AC88] transition-colors border-0 bg-transparent cursor-pointer uppercase tracking-wider"
            >
              {language === 'ar' ? 'العودة لتسجيل الدخول' : language === 'ku' ? 'گەڕانەوە بۆ چوونە ژوورەوە' : 'Back to Login'}
            </button>
          ) : (
            <p className="text-xs text-gray-450 font-medium select-none">
              {isSignUp ? t('login.have_account') : t('login.no_account')}{' '}
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="font-extrabold text-[#B2AC88] hover:text-[#36454F] transition-colors border-0 bg-transparent cursor-pointer ml-1 uppercase tracking-wider"
              >
                {isSignUp ? t('login.sign_in') : t('login.sign_up')}
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
