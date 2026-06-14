import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, Mail, User, Eye, EyeOff, Phone } from 'lucide-react';
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

export default function LoginModal({ isOpen, onClose, onLoginSuccess }) {
  const { t, language } = useLanguage();
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('+964');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmClose, setShowConfirmClose] = useState(false);

  const isRTL = language === 'ar' || language === 'ku';

  const hasTypedContent = email !== '' || password !== '' || firstName !== '' || lastName !== '' || (phone !== '' && phone !== '+964');

  const handleAttemptClose = () => {
    if (hasTypedContent) {
      setShowConfirmClose(true);
    } else {
      onClose();
    }
  };

  const handleBackdropClick = () => {
    if (!hasTypedContent) {
      onClose();
    }
  };

  // Clear fields on close & disable body scrolling when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setEmail('');
      setPassword('');
      setFirstName('');
      setLastName('');
      setPhone('+964');
      setErrors({});
      setIsSignUp(false);
      setIsForgotMode(false);
      setShowPassword(false);
      setShowConfirmClose(false);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Clear fields when switching between Sign In, Sign Up, or Forgot Password
  useEffect(() => {
    setEmail('');
    setPassword('');
    setFirstName('');
    setLastName('');
    setPhone('+964');
    setErrors({});
    setShowPassword(false);
  }, [isSignUp, isForgotMode]);

  const handleEmailChange = (val) => {
    setEmail(val);
    if (errors.email) {
      setErrors(prev => ({ ...prev, email: '' }));
    }
  };

  const handlePasswordChange = (val) => {
    setPassword(val);
    if (errors.password) {
      setErrors(prev => ({ ...prev, password: '' }));
    }
  };

  const handleFirstNameChange = (val) => {
    setFirstName(val);
    if (errors.firstName) {
      setErrors(prev => ({ ...prev, firstName: '' }));
    }
  };

  const handleLastNameChange = (val) => {
    setLastName(val);
    if (errors.lastName) {
      setErrors(prev => ({ ...prev, lastName: '' }));
    }
  };

  const handlePhoneChange = (val) => {
    setPhone(val);
    if (errors.phone) {
      setErrors(prev => ({ ...prev, phone: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});

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
        newErrors.password = language === 'ar' ? 'يجب أن تتكون كلمة المرور من 8 أحرف على الأقل' : language === 'ku' ? 'وشەی تێپەڕ دەبێت لانی کەم ٨ پیت بێت' : 'Password must be at least 8 characters long';
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }

      setIsLoading(true);

      fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, phone, newPassword: password })
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
          alert(language === 'ar' ? 'تم إعادة تعيين كلمة المرور بنجاح! يرجى تسجيل الدخول.' : language === 'ku' ? 'وشەی تێپەڕ بە سەرکەوتوویی نوێکرایەوە! تکایە بچۆ ژوورەوە.' : 'Password reset successfully! Please log in.');
          setIsForgotMode(false);
        })
        .catch((err) => {
          setIsLoading(false);
          const errMsg = err.message;
          const catchErrors = {};
          if (errMsg.toLowerCase().includes("email") || errMsg.toLowerCase().includes("account") || errMsg.toLowerCase().includes("user")) {
            catchErrors.email = errMsg;
          } else if (errMsg.toLowerCase().includes("phone")) {
            catchErrors.phone = errMsg;
          } else if (errMsg.toLowerCase().includes("password")) {
            catchErrors.password = errMsg;
          } else {
            catchErrors.general = errMsg;
          }
          setErrors(catchErrors);
        });
      return;
    }

    if (!email) {
      newErrors.email = language === 'ar' ? 'البريد الإلكتروني مطلوب.' : language === 'ku' ? 'ئیمەیڵ پێویستە.' : 'Email is required.';
    } else if (!email.toLowerCase().endsWith('@gmail.com')) {
      newErrors.email = language === 'ar' ? 'يجب أن ينتهي البريد الإلكتروني بـ @gmail.com' : language === 'ku' ? 'ئیمەیڵ دەبێت بە @gmail.com کۆتایی بێت' : 'Email must end with @gmail.com';
    }

    if (!password) {
      newErrors.password = language === 'ar' ? 'كلمة المرور مطلوبة.' : language === 'ku' ? 'وشەی تێپەڕ پێویستە.' : 'Password is required.';
    } else if (password.length < 8) {
      newErrors.password = language === 'ar' ? 'يجب أن تتكون كلمة المرور من 8 أحرف على الأقل' : language === 'ku' ? 'وشەی تێپەڕ دەبێت لانی کەم ٨ پیت بێت' : 'Password must be at least 8 characters long';
    }

    if (isSignUp) {
      if (!firstName) {
        newErrors.firstName = language === 'ar' ? 'الاسم الأول مطلوب.' : language === 'ku' ? 'ناوی یەکەم پێویستە.' : 'First name is required.';
      }
      if (!lastName) {
        newErrors.lastName = language === 'ar' ? 'الاسم الأخير مطلوب.' : language === 'ku' ? 'ناوی کۆتایی پێویستە.' : 'Last name is required.';
      }
      
      const cleanPhone = phone.replace(/\D/g, '');
      if (!phone || phone === '+964') {
        newErrors.phone = language === 'ar' ? 'رقم الهاتف مطلوب.' : language === 'ku' ? 'ژمارەی تەلەفۆن پێویستە.' : 'Phone number is required.';
      } else if (!phone.startsWith('+964') || cleanPhone.length !== 13) {
        newErrors.phone = language === 'ar' ? 'يجب أن يبدأ رقم الهاتف بـ +964 ويحتوي على 10 أرقام' : language === 'ku' ? 'ژمارەی تەلەفۆن دەبێت بە +964 دەستپێبکات و 10 ژمارە بێت' : 'Phone number must start with +964 and contain exactly 10 digits.';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    const endpoint = isSignUp ? '/api/auth/register' : '/api/auth/login';
    const payload = isSignUp
      ? { firstName, lastName, phone, email, password }
      : { email, password };

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
        if (isSignUp) {
          onLoginSuccess(data.firstName || firstName);
          onClose();
        } else {
          onLoginSuccess(data.firstName || email.split('@')[0]);
          onClose();
        }
      })
      .catch((err) => {
        setIsLoading(false);
        const errMsg = err.message;
        const catchErrors = {};
        
        if (!isSignUp) {
          if (errMsg.toLowerCase().includes("no account") || errMsg.toLowerCase().includes("invalid email") || errMsg.toLowerCase().includes("not found") || errMsg.toLowerCase().includes("exist")) {
            catchErrors.email = language === 'ar'
              ? 'ليس لديك حساب، يرجى إنشاء حساب أولاً'
              : language === 'ku'
              ? 'هیچ حیسابێکت نییە، تکایە سەرەتا حیسابێک دروست بکە'
              : "you have have any account, create an account first";
          } else if (errMsg.toLowerCase().includes("password")) {
            catchErrors.password = language === 'ar' ? 'كلمة المرور غير صحيحة.' : language === 'ku' ? 'وشەی تێپەڕ هەڵەیە.' : 'Incorrect password.';
          } else {
            catchErrors.email = language === 'ar'
              ? 'ليس لديك حساب، يرجى إنشاء حساب أولاً'
              : language === 'ku'
              ? 'هیچ حیسابێکت نییە، تکایە سەرەتا حیسابێک دروست بکە'
              : "you have have any account, create an account first";
          }
        } else {
          if (errMsg.toLowerCase().includes("email") || errMsg.toLowerCase().includes("exists")) {
            catchErrors.email = errMsg;
          } else if (errMsg.toLowerCase().includes("phone")) {
            catchErrors.phone = errMsg;
          } else {
            catchErrors.general = errMsg;
          }
        }
        setErrors(catchErrors);
      });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={handleBackdropClick}
            className="fixed inset-0 bg-black z-[100] cursor-pointer"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="bg-white/95 backdrop-blur-md border border-[#E9ECEF] rounded-[32px] p-8 max-w-md w-full relative shadow-2xl font-sans text-brand-charcoal overflow-hidden"
            >
              {/* Decorative Accent Background Glow */}
              <div className={`absolute -top-24 ${isRTL ? '-left-24' : '-right-24'} w-48 h-48 bg-[#B2AC88]/10 rounded-full blur-2xl pointer-events-none`} />
              <div className={`absolute -bottom-24 ${isRTL ? '-right-24' : '-left-24'} w-48 h-48 bg-[#C08081]/10 rounded-full blur-2xl pointer-events-none`} />

              {/* Close Button */}
              <button
                onClick={handleAttemptClose}
                className="absolute top-6 end-6 w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 hover:text-brand-charcoal hover:bg-gray-50 transition-all cursor-pointer bg-transparent"
              >
                <X size={15} />
              </button>

              {/* Header Info */}
              <div className="text-center mb-6">
                <h3 className="text-xl font-black text-[#36454F] uppercase tracking-wider mt-4">
                  {isForgotMode 
                    ? (language === 'ar' ? 'إعادة تعيين كلمة المرور' : language === 'ku' ? 'نوێکردنەوەی وشەی تێپەڕ' : 'Reset Password')
                    : isSignUp ? t('login.sign_up') : t('login.sign_in')}
                </h3>
                <p className="text-[11px] text-gray-400 font-semibold mt-1">
                  {isForgotMode
                    ? (language === 'ar' ? 'أدخل البريد الإلكتروني ورقم الهاتف وكلمة المرور الجديدة لإعادة التعيين.' : language === 'ku' ? 'ئیمەیڵ و ژمارەی تەلەفۆن و وشەی تێپەڕی نوێ بنووسە بۆ گۆڕین.' : 'Enter your email, phone, and new password to reset your credentials.')
                    : isSignUp 
                    ? (language === 'ar' ? 'سجل للحصول على جوارب شخصيات فاخرة!' : language === 'ku' ? 'تۆمار بە بۆ دەستپێکردنی کڕینی گۆرەوی کەسایەتی بەرز!' : 'Sign up to start shopping premium character socks!')
                    : (language === 'ar' ? 'سجل دخولك للوصول إلى السلة وإتمام الدفع وتتبع تفاصيل طلبك.' : language === 'ku' ? 'بچۆ ژوورەوە بۆ گەیشتن بە سەبەتە، پارەدان و زانیاری بەدواداچوون.' : 'Log in to access your cart, checkout and tracking details.')}
                </p>
              </div>

              {/* Tabs Switcher */}
              {!isForgotMode && (
                <div className="flex border-b border-gray-100 mb-6 font-semibold text-xs">
                  <button
                    onClick={() => { setIsSignUp(false); }}
                    className={`flex-1 pb-3 uppercase tracking-wider transition-colors relative cursor-pointer border-0 bg-transparent ${
                      !isSignUp ? 'text-[#36454F] font-bold' : 'text-gray-400 hover:text-[#36454F]'
                    }`}
                  >
                    {t('login.sign_in')}
                    {!isSignUp && (
                      <motion.div
                        layoutId="activeTabUnderline"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#B2AC88]"
                      />
                    )}
                  </button>
                  <button
                    onClick={() => { setIsSignUp(true); }}
                    className={`flex-1 pb-3 uppercase tracking-wider transition-colors relative cursor-pointer border-0 bg-transparent ${
                      isSignUp ? 'text-[#36454F] font-bold' : 'text-gray-400 hover:text-[#36454F]'
                    }`}
                  >
                    {t('login.sign_up')}
                    {isSignUp && (
                      <motion.div
                        layoutId="activeTabUnderline"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#B2AC88]"
                      />
                    )}
                  </button>
                </div>
              )}

              {/* General Error Message */}
              {errors.general && (
                <div className="bg-red-50 border border-red-100 rounded-2xl p-3 mb-4 text-xs font-semibold text-red-500 text-center">
                  {errors.general}
                </div>
              )}

              {/* Auth Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {isForgotMode ? (
                  <>
                    {/* Email */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block text-start">{t('login.email')}</label>
                      <div className="relative">
                        <Mail size={14} className="absolute start-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="email"
                          placeholder=""
                          value={email}
                          onChange={(e) => handleEmailChange(e.target.value)}
                          className={`w-full ps-11 pe-4 py-3 bg-gray-50/50 border rounded-2xl text-xs font-medium focus:outline-none focus:bg-white transition-all text-[#36454F] ${errors.email ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100' : 'border-gray-150 focus:border-[#B2AC88]'}`}
                        />
                      </div>
                      {errors.email && (
                        <span className="text-[10px] text-red-500 font-bold mt-1 block text-start">{errors.email}</span>
                      )}
                    </div>

                    {/* Phone */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block text-start">{t('login.phone')}</label>
                      <div className="relative">
                        <Phone size={14} className="absolute start-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          placeholder=""
                          value={phone}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val.length < 4) {
                              handlePhoneChange('+964');
                            } else {
                              handlePhoneChange(formatIraqiPhone(val));
                            }
                          }}
                          className={`w-full ps-11 pe-4 py-3 bg-gray-50/50 border rounded-2xl text-xs font-medium focus:outline-none focus:bg-white transition-all text-[#36454F] ${errors.phone ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100' : 'border-gray-150 focus:border-[#B2AC88]'}`}
                        />
                      </div>
                      {errors.phone && (
                        <span className="text-[10px] text-red-500 font-bold mt-1 block text-start">{errors.phone}</span>
                      )}
                    </div>

                    {/* New Password */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block text-start">
                        {language === 'ar' ? 'كلمة المرور الجديدة' : language === 'ku' ? 'وشەی تێپەڕی نوێ' : 'New Password'}
                      </label>
                      <div className="relative">
                        <Lock size={14} className="absolute start-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          placeholder=""
                          value={password}
                          onChange={(e) => handlePasswordChange(e.target.value)}
                          className={`w-full ps-11 pe-11 py-3 bg-gray-50/50 border rounded-2xl text-xs font-medium focus:outline-none focus:bg-white transition-all text-[#36454F] ${errors.password ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100' : 'border-gray-150 focus:border-[#B2AC88]'}`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute end-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-charcoal cursor-pointer border-0 bg-transparent"
                        >
                          {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                      {errors.password && (
                        <span className="text-[10px] text-red-500 font-bold mt-1 block text-start">{errors.password}</span>
                      )}
                    </div>

                    {/* Submit Action Button */}
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3.5 bg-[#36454F] hover:bg-[#B2AC88] text-white text-[10px] font-bold uppercase tracking-wider rounded-2xl transition-colors cursor-pointer shadow-md flex items-center justify-center space-x-2 rtl:space-x-reverse disabled:opacity-50 disabled:cursor-not-allowed mt-2 border-0"
                    >
                      {isLoading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <span>{language === 'ar' ? 'إعادة تعيين كلمة المرور' : language === 'ku' ? 'نوێکردنەوەی وشەی تێپەڕ' : 'Reset Password'}</span>
                      )}
                    </button>

                    {/* Back to Login */}
                    <button
                      type="button"
                      onClick={() => setIsForgotMode(false)}
                      className="w-full text-center text-[10px] font-bold text-gray-400 hover:text-[#36454F] transition-colors cursor-pointer border-0 bg-transparent uppercase tracking-wider mt-2"
                    >
                      {language === 'ar' ? 'العودة لتسجيل الدخول' : language === 'ku' ? 'گەڕانەوە بۆ چوونەژوورەوە' : 'Back to Login'}
                    </button>
                  </>
                ) : (
                  <>
                    {isSignUp && (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block text-start">{t('login.first_name')}</label>
                            <div className="relative">
                              <User size={14} className="absolute start-4 top-1/2 -translate-y-1/2 text-gray-400" />
                              <input
                                type="text"
                                placeholder=""
                                value={firstName}
                                onChange={(e) => handleFirstNameChange(e.target.value)}
                                className={`w-full ps-11 pe-4 py-3 bg-gray-50/50 border rounded-2xl text-xs font-medium focus:outline-none focus:bg-white transition-all text-[#36454F] ${errors.firstName ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100' : 'border-gray-150 focus:border-[#B2AC88]'}`}
                              />
                            </div>
                            {errors.firstName && (
                              <span className="text-[10px] text-red-500 font-bold mt-1 block text-start">{errors.firstName}</span>
                            )}
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block text-start">{t('login.last_name')}</label>
                            <div className="relative">
                              <User size={14} className="absolute start-4 top-1/2 -translate-y-1/2 text-gray-400" />
                              <input
                                type="text"
                                placeholder=""
                                value={lastName}
                                onChange={(e) => handleLastNameChange(e.target.value)}
                                className={`w-full ps-11 pe-4 py-3 bg-gray-50/50 border rounded-2xl text-xs font-medium focus:outline-none focus:bg-white transition-all text-[#36454F] ${errors.lastName ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100' : 'border-gray-150 focus:border-[#B2AC88]'}`}
                              />
                            </div>
                            {errors.lastName && (
                              <span className="text-[10px] text-red-500 font-bold mt-1 block text-start">{errors.lastName}</span>
                            )}
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block text-start">{t('login.phone')}</label>
                          <div className="relative">
                            <Phone size={14} className="absolute start-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                              type="text"
                              placeholder=""
                              value={phone}
                              onChange={(e) => {
                                const val = e.target.value;
                                if (val.length < 4) {
                                  handlePhoneChange('+964');
                                } else {
                                  handlePhoneChange(formatIraqiPhone(val));
                                }
                              }}
                              className={`w-full ps-11 pe-4 py-3 bg-gray-50/50 border rounded-2xl text-xs font-medium focus:outline-none focus:bg-white transition-all text-[#36454F] ${errors.phone ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100' : 'border-gray-150 focus:border-[#B2AC88]'}`}
                            />
                          </div>
                          {errors.phone && (
                            <span className="text-[10px] text-red-500 font-bold mt-1 block text-start">{errors.phone}</span>
                          )}
                        </div>
                      </>
                    )}

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block text-start">{t('login.email')}</label>
                      <div className="relative">
                        <Mail size={14} className="absolute start-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="email"
                          placeholder=""
                          value={email}
                          onChange={(e) => handleEmailChange(e.target.value)}
                          className={`w-full ps-11 pe-4 py-3 bg-gray-50/50 border rounded-2xl text-xs font-medium focus:outline-none focus:bg-white transition-all text-[#36454F] ${errors.email ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100' : 'border-gray-150 focus:border-[#B2AC88]'}`}
                        />
                      </div>
                      {errors.email && (
                        <span className="text-[10px] text-red-500 font-bold mt-1 block text-start">{errors.email}</span>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block text-start">{t('login.password')}</label>
                      <div className="relative">
                        <Lock size={14} className="absolute start-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          placeholder=""
                          value={password}
                          onChange={(e) => handlePasswordChange(e.target.value)}
                          className={`w-full ps-11 pe-11 py-3 bg-gray-50/50 border rounded-2xl text-xs font-medium focus:outline-none focus:bg-white transition-all text-[#36454F] ${errors.password ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100' : 'border-gray-150 focus:border-[#B2AC88]'}`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute end-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-charcoal cursor-pointer border-0 bg-transparent"
                        >
                          {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                      {errors.password && (
                        <span className="text-[10px] text-red-500 font-bold mt-1 block text-start">{errors.password}</span>
                      )}
                      
                      {/* Forgot Password Link */}
                      {!isSignUp && (
                        <div className="flex justify-end pt-1">
                          <button
                            type="button"
                            onClick={() => setIsForgotMode(true)}
                            className="text-[9px] font-extrabold text-[#B2AC88] hover:text-[#36454F] transition-colors cursor-pointer border-0 bg-transparent uppercase tracking-wider"
                          >
                            {language === 'ar' ? 'هل نسيت كلمة المرور؟' : language === 'ku' ? 'وشەی تێپەڕت بیرچووە؟' : 'Forgot Password?'}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Submit Action Button */}
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3.5 bg-[#36454F] hover:bg-[#B2AC88] text-white text-[10px] font-bold uppercase tracking-wider rounded-2xl transition-colors cursor-pointer shadow-md flex items-center justify-center space-x-2 rtl:space-x-reverse disabled:opacity-50 disabled:cursor-not-allowed mt-2 border-0"
                    >
                      {isLoading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <span>{isSignUp ? (language === 'ar' ? 'إنشاء حساب وبدء التسوق' : language === 'ku' ? 'تۆمارکردن و دەستپێکردن' : 'Register & Start') : t('login.sign_in')}</span>
                      )}
                    </button>
                  </>
                )}
              </form>
            </motion.div>
          </div>

          {/* Confirm Close Modal overlay */}
          <AnimatePresence>
            {showConfirmClose && (
              <>
                {/* Confirm Backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.4 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowConfirmClose(false)}
                  className="fixed inset-0 bg-black/60 z-[110] cursor-pointer"
                />
                {/* Confirm Dialog */}
                <div className="fixed inset-0 z-[111] flex items-center justify-center p-4">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white border border-[#E9ECEF] rounded-[24px] p-6 max-w-sm w-full relative shadow-xl font-sans text-brand-charcoal text-center"
                  >
                    <h4 className="text-base font-black text-[#36454F] uppercase tracking-wider mb-2">
                      {t('login.confirm_title')}
                    </h4>
                    <p className="text-xs text-gray-400 font-semibold mb-6">
                      {t('login.confirm_desc')}
                    </p>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setShowConfirmClose(false)}
                        className="flex-1 py-2.5 border border-gray-200 hover:border-gray-300 text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer text-[#36454F] bg-transparent"
                      >
                        {t('login.confirm_no')}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowConfirmClose(false);
                          onClose();
                        }}
                        className="flex-1 py-2.5 bg-red-500 hover:bg-red-650 text-white text-[10px] font-bold uppercase tracking-wider rounded-xl transition-colors cursor-pointer border-0 shadow-xs"
                      >
                        {t('login.confirm_yes')}
                      </button>
                    </div>
                  </motion.div>
                </div>
              </>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  );
}

