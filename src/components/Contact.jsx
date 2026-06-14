import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, 
  Phone, 
  Send, 
  Plus, 
  Minus, 
  CheckCircle2, 
  HelpCircle
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function Contact() {
  const { t, language } = useLanguage();
  const isRTL = language === 'ar' || language === 'ku';

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // FAQ State
  const [activeFaq, setActiveFaq] = useState(null);

  const faqs = [
    {
      question: t('contact_page.faq1_q'),
      answer: t('contact_page.faq1_a')
    },
    {
      question: t('contact_page.faq2_q'),
      answer: t('contact_page.faq2_a')
    },
    {
      question: t('contact_page.faq3_q'),
      answer: t('contact_page.faq3_a')
    },
    {
      question: t('contact_page.faq4_q'),
      answer: t('contact_page.faq4_a')
    }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = language === 'ar' ? 'الاسم الكامل مطلوب' : language === 'ku' ? 'ناوی تەواو پێویستە' : 'Full name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = language === 'ar' ? 'البريد الإلكتروني مطلوب' : language === 'ku' ? 'ئیمەیڵ پێویستە' : 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = language === 'ar' ? 'يرجى إدخال بريد إلكتروني صحيح' : language === 'ku' ? 'تکایە ئیمەیڵێکی دروست بنووسە' : 'Please enter a valid email address';
    }
    if (!formData.message.trim()) {
      newErrors.message = language === 'ar' ? 'لا يمكن أن تكون الرسالة فارغة' : language === 'ku' ? 'پەیامەکە نابێت بەتاڵ بێت' : 'Message cannot be empty';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    // Simulate API request delay
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
      // Reset success state after a few seconds
      setTimeout(() => {
        setIsSuccess(false);
      }, 5000);
    }, 1800);
  };

  const toggleFaq = (index) => {
    setActiveFaq(prev => (prev === index ? null : index));
  };

  // Variants for staggered entrance animation
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', damping: 20 } }
  };

  return (
    <div className="py-16 bg-brand-beige min-h-screen font-sans selection:bg-[#B2AC88]/30">
      <div className="container mx-auto px-4 max-w-5xl">
        
        {/* Header section */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-start"
        >
          <span className="text-[11px] font-bold text-[#C08081] uppercase tracking-[0.2em] mb-2.5 block">
            {language === 'ar' ? 'تواصل معنا' : language === 'ku' ? 'پەیوەندی' : 'CONTACT'}
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-[#36454F] tracking-tight mb-4">
            {language === 'ar' ? (
              <>كن على <span className="text-[#C08081]">اتصال</span></>
            ) : language === 'ku' ? (
              <>پەیوەندیمان پێوە <span className="text-[#C08081]">بکە</span></>
            ) : (
              <>Get in <span className="text-[#C08081]">Touch</span></>
            )}
          </h1>
          <p className="text-gray-500 max-w-xl text-sm md:text-base leading-relaxed">
            {t('contact_page.subtitle')}
          </p>
        </motion.div>

        {/* Contact info and Form split grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16 items-start"
        >
          {/* Info cards (Col spans 5) */}
          <motion.div 
            variants={itemVariants} 
            className="lg:col-span-5 flex flex-col space-y-4"
          >
            {/* Email Card */}
            <div className="bg-[#F8F9FA] border border-[#E9ECEF] rounded-[24px] p-6 flex items-start space-x-4 rtl:space-x-reverse">
              <div className="w-12 h-12 rounded-2xl bg-[#C08081]/10 flex items-center justify-center text-[#C08081] shrink-0">
                <Mail size={20} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#36454F] uppercase tracking-wider mb-2">
                  {language === 'ar' ? 'أرسل لنا بريداً إلكترونياً' : language === 'ku' ? 'ئیمەیڵمان بۆ بنێرە' : 'Email Us'}
                </h4>
                <p className="text-xs text-gray-500 font-semibold hover:text-[#C08081] transition-colors leading-relaxed">
                  <a href="mailto:info@hawrishasocks.com">info@hawrishasocks.com</a>
                </p>
                <p className="text-xs text-gray-500 font-semibold hover:text-[#C08081] transition-colors leading-relaxed">
                  <a href="mailto:support@hawrishasocks.com">support@hawrishasocks.com</a>
                </p>
              </div>
            </div>

            {/* Call & Chat Card */}
            <div className="bg-[#F8F9FA] border border-[#E9ECEF] rounded-[24px] p-6 flex items-start space-x-4 rtl:space-x-reverse">
              <div className="w-12 h-12 rounded-2xl bg-[#B2AC88]/10 flex items-center justify-center text-[#B2AC88] shrink-0">
                <Phone size={20} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#36454F] uppercase tracking-wider mb-2">
                  {language === 'ar' ? 'اتصل وتحدث معنا' : language === 'ku' ? 'پەیوەندی و چات' : 'Call & Chat'}
                </h4>
                <p className="text-xs text-gray-500 font-semibold hover:text-[#B2AC88] transition-colors leading-relaxed">
                  <a href="tel:+9647500000000">+964 750 000 00 00</a>
                </p>
              </div>
            </div>
          </motion.div>

          {/* Form column (Col spans 7) */}
          <motion.div 
            variants={itemVariants}
            className="lg:col-span-7 bg-white border border-[#E9ECEF] rounded-[32px] p-8 md:p-10 shadow-xs relative overflow-hidden"
          >
            <AnimatePresence mode="wait">
              {!isSuccess ? (
                <motion.form 
                  key="contact-form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleSubmit} 
                  className="space-y-6"
                >
                  {/* Name */}
                  <div className="flex flex-col space-y-1.5">
                    <label className="text-xs font-bold text-[#36454F] uppercase tracking-wider">
                      {t('contact_page.name')}
                    </label>
                    <input 
                      type="text" 
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder={t('contact_page.name')}
                      className={`w-full px-4 py-3.5 text-xs rounded-xl bg-[#F4F4F6] text-[#36454F] placeholder-gray-400 border transition-all duration-200 focus:outline-none focus:bg-white ${
                        errors.name ? 'border-red-300' : 'border-transparent focus:border-[#C08081]'
                      }`}
                    />
                    {errors.name && (
                      <span className="text-[10px] text-red-500 font-semibold">{errors.name}</span>
                    )}
                  </div>

                  {/* Email */}
                  <div className="flex flex-col space-y-1.5">
                    <label className="text-xs font-bold text-[#36454F] uppercase tracking-wider">
                      {t('contact_page.email')}
                    </label>
                    <input 
                      type="email" 
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder=""
                      className={`w-full px-4 py-3.5 text-xs rounded-xl bg-[#F4F4F6] text-[#36454F] placeholder-gray-400 border transition-all duration-200 focus:outline-none focus:bg-white ${
                        errors.email ? 'border-red-300' : 'border-transparent focus:border-[#C08081]'
                      }`}
                    />
                    {errors.email && (
                      <span className="text-[10px] text-red-500 font-semibold">{errors.email}</span>
                    )}
                  </div>

                  {/* Message */}
                  <div className="flex flex-col space-y-1.5">
                    <label className="text-xs font-bold text-[#36454F] uppercase tracking-wider">
                      {t('contact_page.message')}
                    </label>
                    <textarea 
                      name="message"
                      rows={5}
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder={language === 'ar' ? 'ما الذي يدور في ذهنك؟' : language === 'ku' ? 'چی لە مێشکتدایە؟' : "What's on your mind?"}
                      className={`w-full px-4 py-3.5 text-xs rounded-xl bg-[#F4F4F6] text-[#36454F] placeholder-gray-400 border transition-all duration-200 focus:outline-none focus:bg-white resize-none ${
                        errors.message ? 'border-red-300' : 'border-transparent focus:border-[#C08081]'
                      }`}
                    ></textarea>
                    {errors.message && (
                      <span className="text-[10px] text-red-500 font-semibold">{errors.message}</span>
                    )}
                  </div>

                  {/* Submit button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-4 px-6 bg-[#36454F] hover:bg-[#C08081] disabled:bg-gray-400 disabled:cursor-not-allowed text-white text-[11px] font-bold uppercase tracking-[0.2em] rounded-xl transition-all shadow-md hover:shadow-lg cursor-pointer flex items-center justify-center space-x-2 rtl:space-x-reverse active:scale-98 border-0"
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 rtl:mr-0 rtl:ml-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>{t('contact_page.sending')}</span>
                        </>
                      ) : (
                        <>
                          <span>{t('contact_page.send')}</span>
                          <Send size={12} className="relative top-[0.5px] rtl:rotate-180" />
                        </>
                      )}
                    </button>
                  </div>
                </motion.form>
              ) : (
                <motion.div 
                  key="success-message"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  transition={{ type: 'spring', damping: 20 }}
                  className="flex flex-col items-center justify-center text-center py-16 px-4"
                >
                  <motion.div 
                    initial={{ scale: 0.5 }}
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center text-green-500 mb-6 border border-green-100"
                  >
                    <CheckCircle2 size={36} />
                  </motion.div>
                  
                  <h4 className="text-xl font-bold text-[#36454F] uppercase tracking-wider mb-2">
                    {language === 'ar' ? 'تم إرسال الرسالة بنجاح' : language === 'ku' ? 'پەیامەکە بە سەرکەوتوویی نێردرا' : 'Message Sent Successfully'}
                  </h4>
                  <p className="text-xs text-gray-500 max-w-sm leading-relaxed mb-6">
                    {t('contact_page.success')}
                  </p>
                  
                  <button
                    onClick={() => setIsSuccess(false)}
                    className="px-6 py-3 bg-[#F4F4F6] hover:bg-gray-200 text-[#36454F] text-[10px] font-bold uppercase tracking-wider rounded-xl transition-colors cursor-pointer border-0"
                  >
                    {language === 'ar' ? 'إرسال رسالة أخرى' : language === 'ku' ? 'پەیامێکی تر بنێرە' : 'Send Another Message'}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>

        {/* FAQs section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto"
        >
          <div className="text-center mb-10">
            <div className="w-10 h-10 rounded-full bg-[#B2AC88]/10 flex items-center justify-center text-[#B2AC88] mx-auto mb-3.5">
              <HelpCircle size={20} />
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-[#36454F] uppercase tracking-wider">
              {t('contact_page.faq_title')}
            </h3>
            <p className="text-xs text-gray-400 mt-2">
              {language === 'ar' ? 'تصفح الإجابات السريعة على استفساراتك' : language === 'ku' ? 'وەڵامە خێراکان بۆ پرسیارە باوەکان ببینە' : 'Browse quick answers to our most popular inquiries'}
            </p>
          </div>

          <div className="space-y-3.5">
            {faqs.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div 
                  key={idx} 
                  className="bg-white border border-[#E9ECEF] rounded-[20px] overflow-hidden shadow-xs hover:shadow-sm transition-shadow duration-300"
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full flex items-center justify-between p-5 text-start text-[#36454F] select-none hover:bg-gray-50/40 transition-colors border-0 bg-transparent"
                  >
                    <span className="text-xs font-bold uppercase tracking-wider pr-4 rtl:pr-0 rtl:pl-4">{faq.question}</span>
                    <span className="text-gray-400 shrink-0">
                      {isOpen ? <Minus size={16} /> : <Plus size={16} />}
                    </span>
                  </button>
                  
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                      >
                        <div className="px-5 pb-5 text-xs text-gray-500 leading-relaxed border-t border-gray-50/50 pt-3 text-start">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </motion.div>

      </div>
    </div>
  );
}
