import { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../locales/translations';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem('lang') || 'en';
  });

  const setLanguage = (lang) => {
    setLanguageState(lang);
    localStorage.setItem('lang', lang);
  };

  useEffect(() => {
    // Set html lang and dir attributes
    const dir = (language === 'ar' || language === 'ku') ? 'rtl' : 'ltr';
    document.documentElement.dir = dir;
    document.documentElement.lang = language;
    
    // Add RTL class helper to body
    if (dir === 'rtl') {
      document.body.classList.add('rtl');
    } else {
      document.body.classList.remove('rtl');
    }
  }, [language]);

  const t = (key, params = {}) => {
    const keys = key.split('.');
    let value = translations[language];
    
    for (const k of keys) {
      if (value && value[k] !== undefined) {
        value = value[k];
      } else {
        // Fallback to English
        let fallbackValue = translations['en'];
        for (const fk of keys) {
          if (fallbackValue && fallbackValue[fk] !== undefined) {
            fallbackValue = fallbackValue[fk];
          } else {
            fallbackValue = key;
            break;
          }
        }
        value = fallbackValue;
        break;
      }
    }
    
    // Replace parameters e.g. {user} or {count}
    if (typeof value === 'string') {
      Object.keys(params).forEach(param => {
        value = value.replace(new RegExp(`{${param}}`, 'g'), params[param]);
      });
    }
    
    return value;
  };

  const getLocalizedValue = (val) => {
    if (!val) return '';
    const l = language ? language.toLowerCase() : 'en';
    const u = l.toUpperCase();
    if (typeof val === 'object' && val !== null) {
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

  // Helper to translate categories fetched from backend dynamically
  const tCategory = (categoryName) => {
    if (!categoryName) return '';
    const localized = getLocalizedValue(categoryName);
    const nameLower = localized.toLowerCase();
    if (nameLower === 'all') return t('categories_sect.all');
    if (nameLower === 'animals' || nameLower === 'animal' || nameLower === 'animall') return t('categories_sect.animals');
    if (nameLower === 'fruits' || nameLower === 'fruit') return t('categories_sect.fruits');
    if (nameLower === 'patterns' || nameLower === 'pattern') return t('categories_sect.patterns');
    if (nameLower === 'cozy crew') return t('categories_sect.cozy_crew');
    return localized;
  };

  // Helper to translate badges fetched from backend dynamically
  const tBadge = (badgeName) => {
    if (!badgeName) return '';
    const localized = getLocalizedValue(badgeName);
    const nameLower = localized.toLowerCase();
    if (nameLower === 'bestseller') return t('product.badge_bestseller');
    if (nameLower === 'new') return t('product.badge_new');
    if (nameLower === 'sale') return t('product.badge_sale');
    return localized;
  };

  // Helper to translate material names fetched from backend dynamically
  const tMaterial = (materialName) => {
    if (!materialName) return '';
    const localized = getLocalizedValue(materialName);
    const nameLower = localized.toLowerCase();
    if (nameLower.includes('cotton') || nameLower === 'combed cotton') return t('categories_sect.material_cotton');
    if (nameLower.includes('wool') || nameLower === 'merino wool') return t('categories_sect.material_wool');
    if (nameLower.includes('bamboo')) return t('categories_sect.material_bamboo');
    return localized;
  };

  // Helper to translate seasonal type fetched from backend dynamically
  const tSeason = (seasonName) => {
    if (!seasonName) return '';
    const localized = getLocalizedValue(seasonName);
    const nameLower = localized.toLowerCase();
    if (nameLower === 'all') return t('categories_sect.season_all');
    if (nameLower === 'winter') return t('categories_sect.season_winter');
    if (nameLower === 'summer') return t('categories_sect.season_summer');
    if (nameLower === 'spring/autumn' || nameLower === 'spring' || nameLower === 'autumn') return t('categories_sect.season_spring');
    return localized;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, tCategory, tBadge, tMaterial, tSeason, getLocalizedValue, getLocalized: getLocalizedValue }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
