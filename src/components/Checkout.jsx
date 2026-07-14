import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle, Truck, ShoppingBag, CreditCard, AlertCircle, Search } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.jsx';

const getLocalized = (val, lang) => {
  if (!val) return '';
  const l = lang ? lang.toLowerCase() : 'en';
  const u = l.toUpperCase();
  if (typeof val === 'object') {
    return val[l] || val[u] || val['en'] || val['EN'] || val['ku'] || val['ku'] || val['ar'] || val['AR'] || '';
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

const getCheckoutColorStyle = (colorVal) => {
  if (!colorVal) return {};
  if (colorVal.startsWith('bg-[#') && colorVal.endsWith(']')) {
    return { backgroundColor: colorVal.slice(4, -1) };
  }
  if (colorVal.startsWith('#')) {
    return { backgroundColor: colorVal };
  }
  return {};
};

export default function Checkout({ cart, onClearCart, onBackToHome, onViewAccount, previousView = 'home', currentUser, currentUserLastName, currentUserEmail }) {
  const { t, language } = useLanguage();
  const isLoggedIn = !!currentUserEmail;

  const getBackLabel = () => {
    if (previousView === 'cart') return language === 'ar' ? 'العودة للسلة' : language === 'ku' ? 'گەڕانەوە بۆ سەبەتە' : 'Back to Your Cart';
    if (previousView === 'all_products') return language === 'ar' ? 'العودة للمنتجات' : language === 'ku' ? 'گەڕانەوە بۆ بەرهەمەکان' : 'Back to Products';
    if (previousView === 'wishlist') return language === 'ar' ? 'العودة للمفضلة' : language === 'ku' ? 'گەڕانەوە بۆ دڵخوازەکان' : 'Back to Wishlist';
    if (previousView === 'story') return language === 'ar' ? 'العودة لقصتنا' : language === 'ku' ? 'گەڕانەوە بۆ چیرۆکەکەمان' : 'Back to Our Story';
    if (previousView === 'contact') return language === 'ar' ? 'العودة للاتصال' : language === 'ku' ? 'گەڕانەوە بۆ پەیوەندی' : 'Back to Contact';
    return language === 'ar' ? 'العودة للمتجر' : language === 'ku' ? 'گەڕانەوە بۆ فرۆشگا' : 'Back to Store';
  };

  const [dbCities, setDbCities] = useState([]);
  const [colorsList, setColorsList] = useState([]);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);

  const [isMapScriptLoaded, setIsMapScriptLoaded] = useState(false);
  const [mapCoords, setMapCoords] = useState({ lat: 33.3152, lng: 44.3661 });

  const [mapInstance, setMapInstance] = useState(null);
  const [markerInstance, setMarkerInstance] = useState(null);

  const [mapSearchQuery, setMapSearchQuery] = useState('');
  const [mapSearchResults, setMapSearchResults] = useState([]);
  const [isSearchingMap, setIsSearchingMap] = useState(false);

  const [formData, setFormData] = useState({
    firstName: typeof currentUser === 'string' ? currentUser : currentUser?.name || '',
    lastName: typeof currentUserLastName === 'string' ? currentUserLastName : '',
    phone: '+964',
    secondaryPhone: '',
    province: '',
    address: '',
    notes: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  // Fetch Cities and Colors list from DB
  useEffect(() => {
    fetch('/api/settings/cities')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setDbCities(data);
        }
      })
      .catch(err => console.error('Error fetching cities:', err));

    fetch('/api/settings/colors')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setColorsList(data);
      })
      .catch(err => console.error('Error fetching colors:', err));
  }, []);

  // Fetch User profile to populate basic info initially
  useEffect(() => {
    if (currentUserEmail) {
      fetch(`/api/auth/profile?email=${encodeURIComponent(currentUserEmail)}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.profile) {
            setFormData(prev => ({
              ...prev,
              firstName: prev.firstName || data.profile.firstName || '',
              lastName: prev.lastName || data.profile.lastName || '',
              phone: formatIraqiPhone(data.profile.phone || '+964')
            }));
          }
        })
        .catch(err => console.error('Error fetching profile for checkout:', err));
    }
  }, [currentUserEmail]);

  // Fetch Saved Addresses
  const fetchAddresses = () => {
    if (currentUserEmail) {
      fetch(`/api/user_data/addresses?email=${encodeURIComponent(currentUserEmail)}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && Array.isArray(data.addresses)) {
            setSavedAddresses(data.addresses);
            if (data.addresses.length > 0) {
              const firstAddr = data.addresses[0];
              setSelectedAddressId(firstAddr.id);
              setIsAddingNewAddress(false);
              setFormData({
                firstName: firstAddr.first_name,
                lastName: firstAddr.last_name,
                phone: firstAddr.phone,
                secondaryPhone: firstAddr.secondary_phone || '',
                province: firstAddr.city_name,
                address: firstAddr.street_address,
                notes: ''
              });
              setMapCoords({ lat: parseFloat(firstAddr.latitude), lng: parseFloat(firstAddr.longitude) });
            } else {
              setIsAddingNewAddress(true);
            }
          } else {
            setIsAddingNewAddress(true);
          }
        })
        .catch(err => {
          console.error('Error fetching saved addresses:', err);
          setIsAddingNewAddress(true);
        });
    } else {
      setIsAddingNewAddress(true);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, [currentUserEmail, dbCities]);

  // Dynamic Leaflet asset loading
  useEffect(() => {
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }
    
    if (!window.L) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.async = true;
      script.onload = () => {
        setIsMapScriptLoaded(true);
      };
      document.head.appendChild(script);
    } else {
      setIsMapScriptLoaded(true);
    }
  }, []);

  // Reverse geocoding utility
  const reverseGeocode = (lat, lng) => {
    fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`)
      .then(res => res.json())
      .then(data => {
        if (data && data.display_name) {
          setFormData(prev => ({
            ...prev,
            address: data.display_name
          }));
        }
      })
      .catch(err => console.error('Reverse geocoding error:', err));
  };

  // Leaflet map initialization
  useEffect(() => {
    if (!isMapScriptLoaded || !window.L || !isAddingNewAddress) return;
    
    const selectedCityObj = dbCities.find(c => c.name === formData.province);
    const centerLat = selectedCityObj ? parseFloat(selectedCityObj.latitude) : mapCoords.lat || 33.3152;
    const centerLng = selectedCityObj ? parseFloat(selectedCityObj.longitude) : mapCoords.lng || 44.3661;

    const container = document.getElementById('checkout-map');
    if (!container) return;

    if (container._leaflet_id) {
      container._leaflet_id = null;
    }

    const map = window.L.map('checkout-map').setView([centerLat, centerLng], 12);
    
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(map);
    
    const marker = window.L.marker([centerLat, centerLng], { draggable: true }).addTo(map);
    
    setMapInstance(map);
    setMarkerInstance(marker);

    marker.on('dragend', () => {
      const position = marker.getLatLng();
      const coords = { lat: position.lat, lng: position.lng };
      setMapCoords(coords);
      reverseGeocode(coords.lat, coords.lng);
    });
    
    map.on('click', (e) => {
      marker.setLatLng(e.latlng);
      const coords = { lat: e.latlng.lat, lng: e.latlng.lng };
      setMapCoords(coords);
      reverseGeocode(coords.lat, coords.lng);
    });

    setTimeout(() => {
      map.invalidateSize();
    }, 100);

    return () => {
      map.remove();
      setMapInstance(null);
      setMarkerInstance(null);
    };
  }, [isMapScriptLoaded, isAddingNewAddress, formData.province, dbCities]);

  const handleMapSearch = (query) => {
    if (!query.trim()) {
      setMapSearchResults([]);
      return;
    }
    setIsSearchingMap(true);
    fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)},Iraq&format=json&limit=5`)
      .then(res => res.json())
      .then(data => {
        setMapSearchResults(data || []);
        setIsSearchingMap(false);
      })
      .catch(err => {
        console.error('Map search error:', err);
        setIsSearchingMap(false);
      });
  };

  const handleSelectSearchResult = (result) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    
    setMapCoords({ lat, lng });
    
    if (mapInstance) {
      mapInstance.setView([lat, lng], 16);
    }
    if (markerInstance) {
      markerInstance.setLatLng([lat, lng]);
    }
    
    setFormData(prev => ({
      ...prev,
      address: result.display_name
    }));
    
    setMapSearchResults([]);
    setMapSearchQuery('');
  };

  const handleSelectAddress = (addr) => {
    setSelectedAddressId(addr.id);
    setIsAddingNewAddress(false);
    setFormData({
      firstName: addr.first_name,
      lastName: addr.last_name,
      phone: addr.phone,
      secondaryPhone: addr.secondary_phone || '',
      province: addr.city_name,
      address: addr.street_address,
      notes: ''
    });
    setMapCoords({ lat: parseFloat(addr.latitude), lng: parseFloat(addr.longitude) });
  };

  const handleAddNewAddressClick = () => {
    setSelectedAddressId(null);
    setIsAddingNewAddress(true);
    setFormData({
      firstName: typeof currentUser === 'string' ? currentUser : currentUser?.name || '',
      lastName: typeof currentUserLastName === 'string' ? currentUserLastName : '',
      phone: '+964',
      secondaryPhone: '',
      province: '',
      address: '',
      notes: ''
    });
    setMapCoords({
      lat: 33.3152,
      lng: 44.3661
    });
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const parsePromo = (val) => {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    try { const p = JSON.parse(val); return Array.isArray(p) ? p : [val]; } catch { return [val]; }
  };
  const hasFreeDelivery = cart.some(item => parsePromo(item.promotion).some(p => p && p.toLowerCase().includes('free delivery')));
  const shippingCost = hasFreeDelivery ? 0 : 4000;
  const total = subtotal + shippingCost;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone' || name === 'secondaryPhone') {
      if (value.length < 4) {
        setFormData((prev) => ({ ...prev, [name]: '+964' }));
      } else {
        setFormData((prev) => ({ ...prev, [name]: formatIraqiPhone(value) }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    if (name === 'province') {
      const selectedCityObj = dbCities.find(c => c.name === value);
      if (selectedCityObj) {
        setMapCoords({ lat: parseFloat(selectedCityObj.latitude), lng: parseFloat(selectedCityObj.longitude) });
      }
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) {
      newErrors.firstName = language === 'ar' ? 'الاسم الأول مطلوب' : language === 'ku' ? 'ناوی یەکەم پێویستە' : 'First name is required';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = language === 'ar' ? 'الاسم الأخير مطلوب' : language === 'ku' ? 'ناوی کۆتایی پێویستە' : 'Last name is required';
    }
    const cleanPhone = formData.phone.replace(/\D/g, '');
    if (!formData.phone.trim() || formData.phone === '+964') {
      newErrors.phone = language === 'ar' ? 'رقم الهاتف مطلوب' : language === 'ku' ? 'ژمارەی تەلەفۆن پێویستە' : 'Phone number is required';
    } else if (!formData.phone.startsWith('+964') || cleanPhone.length !== 13) {
      newErrors.phone = language === 'ar' ? 'يجب أن يبدأ رقم الهاتف بـ +964 ويحتوي على 10 أرقام' : language === 'ku' ? 'ژمارەی تەلەفۆن دەبێت بە +964 دەستپێبکات و 10 ژمارە بێت' : 'Phone number must start with +964 and contain exactly 10 digits';
    }

    if (formData.secondaryPhone && formData.secondaryPhone !== '+964') {
      const cleanSecPhone = formData.secondaryPhone.replace(/\D/g, '');
      if (!formData.secondaryPhone.startsWith('+964') || cleanSecPhone.length !== 13) {
        newErrors.secondaryPhone = language === 'ar' ? 'رقم الهاتف الثاني غير صالح' : language === 'ku' ? 'ژمارەی تەلەفۆني دووەم نادروستە' : 'Secondary phone number is invalid';
      }
    }
    if (!formData.address.trim()) {
      newErrors.address = language === 'ar' ? 'عنوان التوصيل مطلوب' : language === 'ku' ? 'ناونیشانی گەیاندن پێویستە' : 'Delivery address is required';
    }
    if (!formData.province) {
      newErrors.province = language === 'ar' ? 'يرجى اختيار المدينة' : language === 'ku' ? 'تکایە شارەکەت هەڵبژێرە' : 'Please select your city';
    }
    return newErrors;
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      const firstErrorKey = Object.keys(validationErrors)[0];
      const element = document.getElementsByName(firstErrorKey)[0];
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.focus();
      }
      return;
    }
    setShowConfirm(true);
  };

  const confirmOrder = () => {
    setShowConfirm(false);
    setIsSubmitting(true);

    fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fullName: `${formData.firstName} ${formData.lastName}`.trim(),
        phone: formData.phone,
        secondaryPhone: formData.secondaryPhone,
        province: formData.province,
        address: formData.address,
        notes: formData.notes,
        cart: cart,
        subtotal: subtotal,
        shippingCost: shippingCost,
        total: total,
        customerEmail: currentUserEmail || null,
        latitude: mapCoords.lat,
        longitude: mapCoords.lng
      })
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || 'Failed to place order.');
        }
        return data;
      })
      .then((data) => {
        setIsSubmitting(false);
        setIsSuccess(true);
        setOrderNumber(data.orderNumber);
        onClearCart();
      })
      .catch((err) => {
        console.error('Order submission error:', err);
        setErrors((prev) => ({ ...prev, submit: err.message || 'An error occurred. Please try again.' }));
        setIsSubmitting(false);
      });
  };

  const getColorName = (item) => {
    if (item.selectedColorName) return item.selectedColorName;
    const found = colorsList.find(c => c.class === item.selectedColor || c.id === item.selectedColor);
    if (found) return found.name;
    if (item.selectedColor && item.selectedColor.startsWith('bg-[#') && item.selectedColor.endsWith(']')) {
      return item.selectedColor.slice(5, -1).toUpperCase();
    }
    return item.selectedColor || '';
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
                    ? `سيصل طلبك في أقرب وقت ممكن. شكراً لصبرك.` 
                    : language === 'ku' 
                    ? `داواکارییەکەت لە زووترین کاتدا دەگات. سوپاس بۆ ئارامگریت.` 
                    : `It will arrive as soon as possible. Thank you for your patience.`}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              if (onViewAccount) onViewAccount();
              else onBackToHome();
            }}
            className="w-full py-4 bg-[#36454F] hover:bg-[#B2AC88] text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-md transition-all duration-300 cursor-pointer active:scale-97 border-0"
          >
            {language === 'ar' ? 'عرض طلباتي' : language === 'ku' ? 'بینینی داواکارییەکانم' : 'VIEW MY ORDERS'}
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-[#F5F5DC]/40 via-white/50 to-[#F5F5DC]/30 min-h-screen py-10 px-4 lg:px-16 xl:px-24 font-sans select-none">
      {/* Order Confirmation Modal */}
      <AnimatePresence>
        {showConfirm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowConfirm(false)}
              className="fixed inset-0 bg-black z-[200] cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 20, stiffness: 260 }}
              className="fixed inset-0 z-[201] flex items-center justify-center px-4"
            >
              <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-gray-100 text-center">
                <div className="w-16 h-16 bg-[#B2AC88]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle size={32} className="text-[#B2AC88]" />
                </div>
                <h3 className="text-xl font-black text-[#36454F] uppercase tracking-wide mb-2">
                  {language === 'ar' ? 'تأكيد الطلب' : language === 'ku' ? 'پشتڕاستکردنەوەی داواکاری' : 'Confirm Order'}
                </h3>
                <p className="text-xs text-gray-500 font-semibold mb-2">
                  {language === 'ar' ? 'هل أنت متأكد أنك تريد تقديم هذا الطلب؟' : language === 'ku' ? 'ئایا دڵنیایت کە دەتەوێت ئەم داواکارییە پێشکەش بکەیت؟' : 'Are you sure you want to place this order?'}
                </p>
                <p className="text-sm font-bold text-[#B2AC88] mb-6">
                  {total.toLocaleString()} IQD
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowConfirm(false)}
                    className="flex-1 py-3 border border-gray-200 text-[#36454F] text-xs font-bold uppercase tracking-wider rounded-full hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    {language === 'ar' ? 'إلغاء' : language === 'ku' ? 'پاشگەزبوونەوە' : 'Cancel'}
                  </button>
                  <button
                    onClick={confirmOrder}
                    className="flex-1 py-3 bg-[#36454F] hover:bg-[#B2AC88] text-white text-xs font-bold uppercase tracking-wider rounded-full transition-colors cursor-pointer"
                  >
                    {language === 'ar' ? 'تأكيد' : language === 'ku' ? 'دڵنیابوونەوە' : 'Confirm'}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
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
            
            {/* Left: Shipping Form / Saved Addresses */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Saved Addresses Section */}
              {isLoggedIn && savedAddresses.length > 0 && (
                <div className="bg-white border border-gray-100 rounded-3xl p-6 md:p-8 shadow-xs text-start">
                  <h3 className="text-sm font-bold text-[#36454F] uppercase tracking-wider mb-4 pb-2 border-b border-gray-50 flex items-center justify-between">
                    <span>{language === 'ar' ? 'العناوين المحفوظة' : language === 'ku' ? 'ناونیشانە پاشەکەوتکراوەکان' : 'Saved Addresses'}</span>
                    {!isAddingNewAddress && (
                      <span className="text-[10px] text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded-full uppercase">
                        {language === 'ar' ? 'تم الاختيار' : language === 'ku' ? 'هەڵبژێردراوە' : 'Selected'}
                      </span>
                    )}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {savedAddresses.map((addr) => {
                      const isSelected = selectedAddressId === addr.id && !isAddingNewAddress;
                      return (
                        <div
                          key={addr.id}
                          onClick={() => handleSelectAddress(addr)}
                          className={`p-4 border rounded-2xl cursor-pointer transition-all ${
                            isSelected
                              ? 'border-[#B2AC88] bg-[#B2AC88]/5 ring-2 ring-[#B2AC88]/10'
                              : 'border-gray-200 hover:border-gray-300 bg-white'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <h4 className="text-xs font-black text-[#36454F] truncate">
                              {addr.first_name} {addr.last_name}
                            </h4>
                            {isSelected && (
                              <span className="w-2 h-2 rounded-full bg-[#B2AC88]" />
                            )}
                          </div>
                          <p className="text-[10px] text-gray-500 font-bold tracking-wide mt-1.5">{addr.phone}</p>
                          <p className="text-[11px] text-[#36454F] font-bold uppercase mt-2">
                            {addr.city_name}
                          </p>
                          <p className="text-[11px] text-gray-400 font-semibold mt-1 truncate">
                            {addr.street_address}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={handleAddNewAddressClick}
                      className="px-6 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-[#36454F] text-[10px] font-extrabold uppercase tracking-wider rounded-full transition-all cursor-pointer border-0"
                    >
                      + {language === 'ar' ? 'إضافة عنوان جديد' : language === 'ku' ? 'زیادکردنی ناونیشانی نوێ' : 'Add New Address'}
                    </button>
                  </div>
                </div>
              )}

              {/* Add New Address Form Panel */}
              {(!isLoggedIn || savedAddresses.length === 0 || isAddingNewAddress) && (
                <div className="bg-white border border-gray-100 rounded-3xl p-6 md:p-8 shadow-xs text-start">
                  <h3 className="text-sm font-bold text-[#36454F] uppercase tracking-wider mb-6 pb-2 border-b border-gray-50 flex items-center justify-between">
                    <span className="flex items-center space-x-2 rtl:space-x-reverse">
                      <Truck size={16} className="text-[#B2AC88]" />
                      <span>{t('checkout_page.shipping_address')}</span>
                    </span>
                    {isLoggedIn && savedAddresses.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          if (savedAddresses.length > 0) {
                            handleSelectAddress(savedAddresses[0]);
                          }
                        }}
                        className="text-[10px] text-[#B2AC88] hover:text-[#36454F] font-bold uppercase transition-colors border-0 bg-transparent cursor-pointer"
                      >
                        {language === 'ar' ? 'العودة' : language === 'ku' ? 'گەڕانەوە' : 'Cancel'}
                      </button>
                    )}
                  </h3>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* First Name & Last Name */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{language === 'ar' ? 'الاسم الأول' : language === 'ku' ? 'ناوی یەکەم' : 'First Name'}</label>
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          placeholder={language === 'ar' ? 'الاسم الأول' : language === 'ku' ? 'ناوی یەکەم' : 'First name'}
                          className={`w-full px-4 py-3 bg-gray-50/50 border ${errors.firstName ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : 'border-gray-200 focus:border-[#B2AC88] focus:ring-[#B2AC88]/15'} rounded-xl focus:outline-none focus:ring-3 text-xs text-[#36454F] font-semibold transition-all`}
                        />
                        {errors.firstName && <p className="text-[10px] text-red-500 font-bold">{errors.firstName}</p>}
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{language === 'ar' ? 'الاسم الأخير' : language === 'ku' ? 'ناوی کۆتایی' : 'Last Name'}</label>
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          placeholder={language === 'ar' ? 'الاسم الأخير' : language === 'ku' ? 'ناوی کۆتایی' : 'Last name'}
                          className={`w-full px-4 py-3 bg-gray-50/50 border ${errors.lastName ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : 'border-gray-200 focus:border-[#B2AC88] focus:ring-[#B2AC88]/15'} rounded-xl focus:outline-none focus:ring-3 text-xs text-[#36454F] font-semibold transition-all`}
                        />
                        {errors.lastName && <p className="text-[10px] text-red-500 font-bold">{errors.lastName}</p>}
                      </div>
                    </div>

                    {/* Phone Number & Secondary Phone */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{t('checkout_page.phone')}</label>
                        <input
                          type="text"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 bg-gray-50/50 border ${errors.phone ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : 'border-gray-200 focus:border-[#B2AC88] focus:ring-[#B2AC88]/15'} rounded-xl focus:outline-none focus:ring-3 text-xs text-[#36454F] font-semibold transition-all`}
                        />
                        {errors.phone && <p className="text-[10px] text-red-500 font-bold">{errors.phone}</p>}
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{language === 'ar' ? 'رقم الهاتف 2 (اختياري)' : language === 'ku' ? 'ژمارەی تەلەفۆن ٢ (ئارەزوومەندانە)' : 'Secondary Phone (Optional)'}</label>
                        <input
                          type="text"
                          name="secondaryPhone"
                          value={formData.secondaryPhone}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 bg-gray-50/50 border ${errors.secondaryPhone ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : 'border-gray-200 focus:border-[#B2AC88] focus:ring-[#B2AC88]/15'} rounded-xl focus:outline-none focus:ring-3 text-xs text-[#36454F] font-semibold transition-all`}
                        />
                        {errors.secondaryPhone && <p className="text-[10px] text-red-500 font-bold">{errors.secondaryPhone}</p>}
                      </div>
                    </div>

                    {/* Province Selector */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{t('checkout_page.city')}</label>
                      <div className="relative">
                        <select
                          name="province"
                          value={formData.province}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 bg-gray-50/50 border ${errors.province ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : 'border-gray-200 focus:border-[#B2AC88] focus:ring-[#B2AC88]/15'} rounded-xl focus:outline-none focus:ring-3 text-xs text-[#36454F] font-semibold transition-all appearance-none cursor-pointer`}
                        >
                          <option value="">{language === 'ar' ? 'اختر محافظتك' : language === 'ku' ? 'شارەکەت هەڵبژێرە' : 'Select your city'}</option>
                          {dbCities.map((city) => (
                            <option key={city.id} value={city.name}>{city.name}</option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 end-4 flex items-center text-gray-400">
                          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                          </svg>
                        </div>
                      </div>
                      {errors.province && <p className="text-[10px] text-red-500 font-bold">{errors.province}</p>}
                    </div>

                    {/* Leaflet Map & Search Box */}
                    {formData.province && (
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                          {language === 'ar' ? 'ابحث عن موقعك أو حدده على الخريطة' : language === 'ku' ? 'گەڕان بۆ ناونیشانەکەت یان دیاریکردنی لەسەر نەخشەکە' : 'Search or Pin your exact location on the map'}
                        </label>
                        
                        {/* Real-time map location search */}
                        <div className="relative">
                          <div className="relative flex items-center">
                            <Search size={16} className="absolute start-4 text-gray-400" />
                            <input
                              type="text"
                              value={mapSearchQuery}
                              onChange={(e) => {
                                setMapSearchQuery(e.target.value);
                                handleMapSearch(e.target.value);
                              }}
                              placeholder={language === 'ar' ? 'ابحث عن الشارع، الحي، أو المعالم...' : language === 'ku' ? 'گەڕان بۆ شەقام، گەڕەک یان نیشانەیەک...' : 'Search street, neighborhood, landmarks...'}
                              className="w-full ps-11 pe-4 py-3 bg-gray-50/50 border border-gray-250 focus:border-[#B2AC88] focus:ring-3 focus:ring-[#B2AC88]/15 rounded-xl focus:outline-none text-xs text-[#36454F] font-semibold transition-all shadow-2xs"
                            />
                            {isSearchingMap && (
                              <div className="absolute end-4 w-4 h-4 border-2 border-[#B2AC88] border-t-transparent rounded-full animate-spin" />
                            )}
                          </div>

                          {/* Search Results Dropdown */}
                          {mapSearchResults.length > 0 && (
                            <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-100 rounded-2xl shadow-lg z-[210] max-h-[200px] overflow-y-auto divide-y divide-gray-50">
                              {mapSearchResults.map((result) => (
                                <div
                                  key={result.place_id}
                                  onClick={() => handleSelectSearchResult(result)}
                                  className="px-4 py-2.5 hover:bg-gray-50 cursor-pointer text-xs font-semibold text-[#36454F] transition-colors"
                                >
                                  {result.display_name}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Map div */}
                        <div 
                          id="checkout-map" 
                          className="h-[300px] w-full rounded-2xl border border-gray-200 overflow-hidden shadow-2xs z-10"
                        />
                        <p className="text-[9px] text-gray-400 font-bold italic">
                          * {language === 'ar' ? 'يمكنك سحب العلامة الزرقاء أو النقر على الخريطة لتغيير الموقع' : language === 'ku' ? 'دەتوانیت نیشانە شینەکە ڕابکێشیت یان کلیک لەسەر نەخشەکە بکەیت بۆ گۆڕینی شوێن' : 'You can drag the blue marker or click on the map to shift the location pin.'}
                        </p>
                      </div>
                    )}

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

                    {errors.submit && (
                      <div className="p-3 bg-red-50 border border-red-150 rounded-xl text-red-650 text-xs font-semibold leading-relaxed mb-4">
                        {errors.submit}
                      </div>
                    )}

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
              )}

              {/* Submit Saved Address directly if visible */}
              {isLoggedIn && savedAddresses.length > 0 && !isAddingNewAddress && (
                <div className="bg-white border border-gray-100 rounded-3xl p-6 md:p-8 shadow-xs text-start">
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="w-full py-4 bg-[#36454F] hover:bg-[#B2AC88] text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-md transition-all duration-300 cursor-pointer border-0 flex items-center justify-center font-bold"
                  >
                    <span>{t('checkout_page.place_order')}</span>
                  </button>
                </div>
              )}

            </div>

            {/* Right: Order Summary */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-xs text-start">
                <h3 className="text-base font-extrabold text-[#36454F] uppercase tracking-wider mb-6 pb-2 border-b border-gray-50 flex items-center space-x-2 rtl:space-x-reverse">
                  <ShoppingBag size={18} className="text-[#B2AC88]" />
                  <span>{t('checkout_page.order_summary')}</span>
                </h3>

                {/* Items List */}
                <div className="space-y-4 mb-6">
                  {cart.map((item) => {
                    const imgUrl = item.image || item.image_url;
                    const finalImg = !imgUrl
                      ? '/categories/cat1.jpg'
                      : (imgUrl.startsWith('data:') || imgUrl.startsWith('/') ? imgUrl : `/uploads/${imgUrl}`);
                    
                    return (
                      <div key={item.cartItemId || item.id} className="flex space-x-4 rtl:space-x-reverse border border-gray-100 rounded-2xl p-3.5 bg-white text-start shadow-xs">
                        <div className="w-16 h-20 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 shrink-0 flex items-center justify-center">
                          <img src={finalImg} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 flex flex-col justify-between py-0.5 min-w-0">
                          <div>
                            <h4 className="text-sm font-extrabold text-[#36454F] truncate">{getLocalized(item.name, language)}</h4>
                            <p className="text-[10px] sm:text-xs text-gray-500 font-bold uppercase tracking-widest mt-0.5">
                              {language === 'ar' ? 'المتجر: ' : language === 'ku' ? 'فرۆشگا: ' : 'Store: '} {getLocalized(item.vendor_name, language) || 'HAWRISHA'}
                            </p>
                            {/* Promotion Badge */}
                            {(() => {
                              const promos = parsePromo(item.promotion).filter(p => p && p !== 'None' && p !== '');
                              if (promos.length === 0) return null;
                              return (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {promos.map((promo, idx) => (
                                    <span key={idx} className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-[#B2AC88]/10 border border-[#B2AC88]/20 rounded-full text-[9px] font-bold text-[#B2AC88] uppercase tracking-wider">
                                      <span className="w-1.5 h-1.5 rounded-full bg-[#B2AC88] shrink-0" />
                                      {promo}
                                    </span>
                                  ))}
                                </div>
                              );
                            })()}
                            <p className="text-xs font-bold text-gray-500 mt-1">
                              {language === 'ar' ? 'الكمية: ' : language === 'ku' ? 'بڕ: ' : 'Quantity: '} {item.quantity}
                            </p>
                            {/* Selected Options */}
                            {(item.selectedColor || item.selectedStyle || item.selectedSize) && (
                              <div className="flex flex-col gap-1.5 mt-2">
                                {item.selectedColor && (
                                  <div className="flex items-center space-x-1.5 rtl:space-x-reverse bg-gray-50 border border-gray-100 rounded px-2.5 py-0.5 w-fit">
                                    <span className="text-gray-400 font-normal text-xs">{language === 'ar' ? 'اللون: ' : language === 'ku' ? 'ڕەنگ: ' : 'Color: '}</span>
                                    <span 
                                      className={`w-3.5 h-3.5 rounded-full border border-gray-250 shrink-0 ${item.selectedColor?.startsWith('bg-') && !item.selectedColor?.includes('[') ? item.selectedColor : ''}`} 
                                      style={getCheckoutColorStyle(item.selectedColor)}
                                    />
                                    <span className="text-xs font-black text-[#36454F]">
                                      {getColorName(item)}
                                    </span>
                                  </div>
                                )}
                                {item.selectedStyle && (
                                  <div className="bg-gray-50 border border-gray-100 rounded px-2.5 py-0.5 text-xs font-black text-[#36454F] w-fit">
                                    <span className="text-gray-400 font-normal">{language === 'ar' ? 'النوع: ' : language === 'ku' ? 'جۆر: ' : 'Style: '}</span>
                                    {item.selectedStyle}
                                  </div>
                                )}
                                {item.selectedSize && (
                                  <div className="bg-gray-50 border border-gray-100 rounded px-2.5 py-0.5 text-xs font-black text-[#36454F] w-fit">
                                    <span className="text-gray-400 font-normal">{language === 'ar' ? 'المقاس: ' : language === 'ku' ? 'قەبارە: ' : 'Size: '}</span>
                                    {item.selectedSize}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col items-end mt-1.5">
                            {item.discount > 0 ? (
                              <div className="flex flex-col items-end">
                                <p className="text-[10px] text-gray-400 font-medium text-end">
                                  {language === 'ar' ? 'سعر الوحدة: ' : language === 'ku' ? 'نرخی یەکە: ' : 'Unit Price: '} 
                                  <span className="line-through mx-1">{Math.round(item.price / (1 - item.discount / 100)).toLocaleString()}</span>
                                  <span className="text-red-500 font-bold">({item.discount}% OFF)</span>
                                </p>
                                <p className="text-sm text-[#36454F] font-black text-end font-sans mt-0.5">
                                  {(item.price * item.quantity).toLocaleString()} IQD
                                </p>
                              </div>
                            ) : (
                              <>
                                <p className="text-[10px] text-gray-405 font-medium text-end">
                                  {language === 'ar' ? 'سعر الوحدة: ' : language === 'ku' ? 'نرخی یەکە: ' : 'Unit Price: '} {item.price.toLocaleString()} IQD
                                </p>
                                <p className="text-sm text-[#36454F] font-black text-end font-sans mt-0.5">
                                  {(item.price * item.quantity).toLocaleString()} IQD
                                </p>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="h-px bg-gray-100 w-full mb-6" />

                {/* Price Breakdown */}
                <div className="space-y-3 mb-6 text-start">
                  <div className="flex justify-between text-sm font-bold text-gray-600 font-sans">
                    <span>{t('cart_page.subtotal')}</span>
                    <span>{subtotal.toLocaleString()} IQD</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-gray-600 font-sans">
                    <span>{t('checkout_page.shipping')}</span>
                    {shippingCost === 0 ? (
                      <span className="text-green-600 font-black">{t('checkout_page.free')}</span>
                    ) : (
                      <span>{shippingCost.toLocaleString()} IQD</span>
                    )}
                  </div>
                  
                  <div className="h-px bg-gray-100 w-full pt-1" />
                  
                  <div className="flex justify-between text-base font-extrabold text-[#36454F] pt-2 font-sans">
                    <span>{language === 'ar' ? 'المجموع الكلي' : language === 'ku' ? 'کۆی گشتی کۆتایی' : 'Grand Total'}</span>
                    <span className="text-lg font-black text-[#B2AC88]">{total.toLocaleString()} IQD</span>
                  </div>
                </div>

                {/* Cash on Delivery Notice */}
                <div className="bg-[#36454F]/5 rounded-2xl p-5 flex items-start space-x-3.5 rtl:space-x-reverse border border-[#36454F]/5 text-start">
                  <Truck size={22} className="text-[#36454F] shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-black text-[#36454F] uppercase tracking-wider">{t('checkout_page.cod')}</h5>
                    <p className="text-[11px] text-gray-500 font-bold mt-1 leading-relaxed font-sans">
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
