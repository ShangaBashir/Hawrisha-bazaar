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
  
  // 'login', 'signup', 'forgot', 'verify', 'reset'
  const [authStep, setAuthStep] = useState(() => {
    const path = window.location.pathname;
    if (path === '/forgot-password') return 'forgot';
    if (path === '/verify-code') return 'verify';
    if (path === '/reset-password') return 'reset';
    if (path === '/signup' || window.location.search.includes('signup=true')) return 'signup';
    return 'login';
  });
  
  // Form inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('+964');
  const [role, setRole] = useState('customer'); // 'customer' or 'vendor'
  const [storeName, setStoreName] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  // Handle page refreshes on verify or reset without an email
  useEffect(() => {
    if ((authStep === 'verify' || authStep === 'reset') && !email) {
      setAuthStep('forgot');
    }
  }, [authStep, email]);

  // OTP State
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpTimer, setOtpTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const isRTL = language === 'ar' || language === 'ku';

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Update routing history manually (push state) to support paths /login, /forgot-password, /verify-code, /reset-password
  useEffect(() => {
    const pathMap = {
      'login': '/login',
      'signup': '/signup',
      'forgot': '/forgot-password',
      'verify': '/verify-code',
      'reset': '/reset-password'
    };
    window.history.pushState({}, '', pathMap[authStep]);
  }, [authStep]);

  // Clear fields when switching basic tabs
  useEffect(() => {
    if (authStep === 'login' || authStep === 'signup') {
      setPassword('');
      setConfirmPassword('');
      setFirstName('');
      setLastName('');
      setPhone('+964');
      setRole('customer');
      setStoreName('');
      setErrors({});
      setServerError('');
      setShowPassword(false);
      setShowConfirmPassword(false);
      setOtp(['', '', '', '', '', '']);
    }
  }, [authStep]);

  // OTP Timer logic
  useEffect(() => {
    let interval;
    if (authStep === 'verify' && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    } else if (otpTimer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [authStep, otpTimer]);

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

  const handleOtpChange = (index, value) => {
    setServerError('');
    if (value.length > 1) {
      // Handle paste
      const pasted = value.replace(/\D/g, '').slice(0, 6).split('');
      const newOtp = [...otp];
      for (let i = 0; i < pasted.length; i++) {
        if (index + i < 6) newOtp[index + i] = pasted[i];
      }
      setOtp(newOtp);
      const nextIndex = Math.min(index + pasted.length, 5);
      const nextInput = document.getElementById(`otp-${nextIndex}`);
      if (nextInput) nextInput.focus();
      return;
    }

    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleResendCode = () => {
    setServerError('');
    setIsLoading(true);
    fetch('/api/auth/resend-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Error resending code');
        setOtpTimer(60);
        setCanResend(false);
        setOtp(['', '', '', '', '', '']);
      })
      .catch((err) => setServerError(err.message))
      .finally(() => setIsLoading(false));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});
    setServerError('');

    const newErrors = {};

    if (authStep === 'forgot') {
      if (!email) {
        newErrors.email = language === 'ar' ? 'البريد الإلكتروني مطلوب.' : language === 'ku' ? 'ئیمەیڵ پێویستە.' : 'Email is required.';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        newErrors.email = language === 'ar' ? 'البريد الإلكتروني غير صالح' : language === 'ku' ? 'ئیمەیڵەکە دروست نییە' : 'Invalid email address';
      }
    } else if (authStep === 'verify') {
      const code = otp.join('');
      if (code.length < 6) {
        setServerError(t('ui.enter_6_digit'));
        return;
      }
    } else if (authStep === 'reset') {
      if (!password) {
        newErrors.password = language === 'ar' ? 'كلمة المرور الجديدة مطلوبة.' : language === 'ku' ? 'وشەی تێپەڕی نوێ پێویستە.' : 'New password is required.';
      } else if (password.length < 8) {
        newErrors.password = language === 'ar' ? 'يجب أن تتكون كلمة المرور من 8 أحرف على الأقل.' : language === 'ku' ? 'دەبێت وشەی تێپەڕ لانی کەم 8 پیت بێت.' : 'Password must be at least 8 characters.';
      }
      if (password !== confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match.';
      }
    } else if (authStep === 'signup') {
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
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        newErrors.email = language === 'ar' ? 'البريد الإلكتروني غير صالح' : language === 'ku' ? 'ئیمەیڵەکە دروست نییە' : 'Invalid email address';
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
      // login
      if (!email) {
        newErrors.email = language === 'ar' ? 'البريد الإلكتروني مطلوب.' : language === 'ku' ? 'ئیمەیڵ پێویستە.' : 'Email is required.';
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

    if (authStep === 'forgot') {
      endpoint = '/api/auth/forgot-password';
      payload = { email };
    } else if (authStep === 'verify') {
      endpoint = '/api/auth/verify-code';
      payload = { email, code: otp.join('') };
    } else if (authStep === 'reset') {
      endpoint = '/api/auth/reset-password';
      payload = { email, code: otp.join(''), newPassword: password };
    } else if (authStep === 'signup') {
      endpoint = '/api/auth/register';
      payload = { firstName, lastName, phone, email, password, role, storeName: role === 'vendor' ? storeName : null };
    }

    fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(async (res) => {
        let data = {};
        try {
          data = await res.json();
        } catch {
          if (!res.ok) {
            throw new Error(
              language === 'ar'
                ? 'تعذر الاتصال بالخادم. يرجى التأكد من تشغيل الخادم الخلفي.'
                : language === 'ku'
                ? 'پەیوەندی لەگەڵ سێرڤەر سەرکەوتوو نەبوو. تکایە دڵنیابەوە لە داگیرساندنی سێرڤەر.'
                : 'Cannot connect to backend server. Make sure the backend server is running.'
            );
          }
        }
        if (!res.ok) {
          throw new Error(data.message || t('ui.something_went_wrong'));
        }
        return data;
      })
      .then((data) => {
        setIsLoading(false);
        if (authStep === 'forgot') {
          setOtpTimer(60);
          setCanResend(false);
          setAuthStep('verify');
        } else if (authStep === 'verify') {
          setPassword('');
          setConfirmPassword('');
          setAuthStep('reset');
        } else if (authStep === 'reset') {
          setAuthStep('login');
          setServerError('');
        } else {
          // Success login or registration
          const resolvedFirst = data.firstName || firstName || email.split('@')[0];
          const resolvedLast = data.lastName || lastName || '';
          onLoginSuccess(
            resolvedFirst,
            resolvedLast,
            data.email || email,
            data.role || role,
            data.storeName || (role === 'vendor' ? storeName : null)
          );
        }
      })
      .catch((err) => {
        setIsLoading(false);
        const errMsg = err.message;
        
        if (authStep === 'login') {
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
    <div className="w-full flex justify-center items-center py-8 md:py-12 px-4 min-h-[calc(100vh-160px)]" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-md w-full bg-white rounded-3xl p-8 relative shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
        
        {/* Back / Close button */}
        <button
          onClick={() => {
            if (authStep === 'verify') {
              setAuthStep('forgot');
            } else if (authStep === 'reset') {
              setAuthStep('verify');
            } else if (authStep === 'forgot') {
              setAuthStep('login');
            } else {
              onCancel();
            }
          }}
          className={`absolute top-6 ${isRTL ? 'end-6' : 'start-6'} text-gray-400 hover:text-brand-charcoal transition-colors border-0 p-2 cursor-pointer bg-transparent rounded-full hover:bg-gray-50`}
        >
          <ArrowLeft size={20} className={isRTL ? 'rotate-180' : ''} />
        </button>

        {/* Header */}
        <div className="text-center mb-8 mt-4">
          <h2 className="text-2xl font-black text-[#36454F] tracking-tight uppercase">
            {authStep === 'signup' 
              ? t('login.sign_up') 
              : authStep === 'forgot'
              ? t('ui.forgot_password')
              : authStep === 'verify'
              ? t('ui.verify_code')
              : authStep === 'reset'
              ? t('ui.reset_password')
              : t('login.sign_in')}
          </h2>
          {authStep !== 'signup' && authStep !== 'login' && (
            <p className="text-xs text-gray-450 mt-2 font-medium">
              {authStep === 'forgot'
                ? t('ui.forgot_password_sub')
                : authStep === 'verify'
                ? t('ui.verify_code_sub')
                : authStep === 'reset'
                ? t('ui.reset_password_sub')
                : null}
            </p>
          )}
        </div>

        {/* Tab Switcher (Only in login/signup) */}
        {(authStep === 'login' || authStep === 'signup') && (
          <div className="flex p-1.5 bg-gray-50 rounded-[1.25rem] mb-8 border border-gray-100 shadow-inner">
            <button
              type="button"
              onClick={() => setAuthStep('login')}
              className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider rounded-xl transition-all border-0 cursor-pointer ${
                authStep === 'login' 
                  ? 'bg-[#36454F] text-white shadow-md' 
                  : 'text-gray-400 hover:text-brand-charcoal hover:bg-white/50'
              }`}
            >
              {t('login.sign_in')}
            </button>
            <button
              type="button"
              onClick={() => setAuthStep('signup')}
              className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider rounded-xl transition-all border-0 cursor-pointer ${
                authStep === 'signup' 
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

          {authStep === 'signup' && (
            <>
              {role === 'vendor' && (
                <div className="space-y-1.5">
                  <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">{t('login.store_name')}</label>
                  <div className="relative">
                    <Store className="absolute start-4 top-1/2 -translate-y-1/2 text-gray-350" size={16} />
                    <input
                      type="text"
                      value={storeName}
                      onChange={(e) => handleStoreNameChange(e.target.value)}
                      className={`w-full ps-11 pe-4 py-3.5 bg-gray-50 border rounded-2xl text-xs font-semibold focus:outline-none transition-all ${
                        errors.storeName ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-[#36454F] focus:bg-white'
                      }`}
                      placeholder={t('ui.store_name_ph')}
                    />
                  </div>
                  {errors.storeName && <p className="text-[11px] text-red-500 font-bold mt-1 px-1">{errors.storeName}</p>}
                </div>
              )}
              {/* First Name & Last Name */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
                    {t('login.first_name')}
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    autoComplete="off"
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
                    autoComplete="off"
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

          {/* Email Address (Login, Signup, Forgot) */}
          {(authStep === 'login' || authStep === 'signup' || authStep === 'forgot') && (
            <div className="space-y-1.5">
              <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
                {t('login.email')}
              </label>
              <div className="relative">
                <Mail className="absolute start-4 top-1/2 -translate-y-1/2 text-gray-350" size={16} />
                <input
                  type="text"
                  value={email}
                  autoComplete="off"
                  onChange={(e) => handleEmailChange(e.target.value)}
                  className={`w-full ps-11 pe-4 py-3.5 bg-gray-50 border rounded-2xl text-xs font-semibold focus:outline-none transition-all ${
                    errors.email 
                      ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500' 
                      : 'border-gray-200 focus:border-[#36454F] focus:bg-white'
                  }`}
                  placeholder=""
                  disabled={authStep === 'verify' || authStep === 'reset'}
                />
              </div>
              {errors.email && (
                <p className="text-[11px] text-red-500 font-bold mt-1 px-1">{errors.email}</p>
              )}
            </div>
          )}

          {/* Phone Number (Sign Up) */}
          {authStep === 'signup' && (
            <div className="space-y-1.5">
              <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
                {t('login.phone')}
              </label>
              <div className="relative">
                <Phone className="absolute start-4 top-1/2 -translate-y-1/2 text-gray-350" size={16} />
                <input
                  type="text"
                  value={phone}
                  autoComplete="off"
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

          {/* OTP Verification Boxes */}
          {authStep === 'verify' && (
            <div className="space-y-6">
              <div className="flex justify-between gap-2" dir="ltr">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    maxLength={6}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className="w-12 h-14 text-center text-xl font-bold bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-[#36454F] focus:bg-white focus:ring-1 focus:ring-[#36454F] transition-all"
                  />
                ))}
              </div>
              <div className="flex flex-col items-center justify-center space-y-3">
                <p className="text-xs text-gray-500 font-medium">
                  {t('ui.didnt_receive')}
                </p>
                {canResend ? (
                  <button
                    type="button"
                    onClick={handleResendCode}
                    className="text-xs font-bold text-[#36454F] hover:text-[#B2AC88] uppercase tracking-wider transition-colors bg-transparent border-none cursor-pointer"
                  >
                    {t('ui.resend_code')}
                  </button>
                ) : (
                  <p className="text-xs font-bold text-gray-400 tracking-wider">
                    {t('ui.resend_in', { seconds: otpTimer })}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Password */}
          {(authStep === 'login' || authStep === 'signup' || authStep === 'reset') && (
            <div className="space-y-1.5">
              <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
                {authStep === 'reset' ? t('ui.new_password') : t('login.password')}
              </label>
              <div className="relative">
                <Lock className="absolute start-4 top-1/2 -translate-y-1/2 text-gray-350" size={16} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  autoComplete="new-password"
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
              {authStep === 'login' && (
                <div className="flex justify-end mt-2">
                  <button
                    type="button"
                    onClick={() => setAuthStep('forgot')}
                    className="text-[10px] font-bold text-gray-400 hover:text-[#B2AC88] transition-colors border-0 p-0 cursor-pointer bg-transparent uppercase tracking-wider"
                  >
                    {language === 'ar' ? 'هل نسيت كلمة المرور؟' : language === 'ku' ? 'وشەی تێپەڕت بیرچووە؟' : 'Forgot Password?'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Confirm Password */}
          {authStep === 'reset' && (
            <div className="space-y-1.5">
              <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
                {t('ui.confirm_new_password')}
              </label>
              <div className="relative">
                <Lock className="absolute start-4 top-1/2 -translate-y-1/2 text-gray-350" size={16} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: '' }));
                  }}
                  className={`w-full ps-11 pe-12 py-3.5 bg-gray-50 border rounded-2xl text-xs font-semibold focus:outline-none transition-all ${
                    errors.confirmPassword 
                      ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500' 
                      : 'border-gray-200 focus:border-[#36454F] focus:bg-white'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute end-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-charcoal cursor-pointer border-0 bg-transparent"
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-[11px] text-red-500 font-bold mt-1 px-1">{errors.confirmPassword}</p>
              )}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || (authStep === 'verify' && otp.join('').length < 6)}
            className="w-full py-4 bg-[#36454F] hover:bg-[#B2AC88] text-white text-xs font-extrabold uppercase tracking-wider rounded-2xl transition-colors shadow-md mt-6 flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-70 disabled:pointer-events-none"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : authStep === 'forgot' ? (
              t('ui.send_verification_code')
            ) : authStep === 'verify' ? (
              t('ui.verify_code')
            ) : authStep === 'reset' ? (
              t('ui.reset_password')
            ) : authStep === 'signup' ? (
              t('login.btn_signup')
            ) : (
              t('login.btn_login')
            )}
          </button>
        </form>

        {/* Bottom switcher helper */}
        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          {authStep === 'forgot' || authStep === 'verify' || authStep === 'reset' ? (
            <button
              onClick={() => setAuthStep('login')}
              className="text-xs font-bold text-gray-400 hover:text-[#B2AC88] transition-colors border-0 bg-transparent cursor-pointer uppercase tracking-wider"
            >
              {t('ui.back_to_login')}
            </button>
          ) : (
            <p className="text-xs text-gray-450 font-medium select-none">
              {authStep === 'signup' ? t('login.have_account') : t('login.no_account')}{' '}
              <button
                onClick={() => setAuthStep(authStep === 'signup' ? 'login' : 'signup')}
                className="font-extrabold text-[#B2AC88] hover:text-[#36454F] transition-colors border-0 bg-transparent cursor-pointer ml-1 uppercase tracking-wider"
              >
                {authStep === 'signup' ? t('login.sign_in') : t('login.sign_up')}
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
