import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext.jsx';

const fallbackCategories = [
  {
    id: 'animals',
    name: 'Animals',
    productCount: 4,
    image: '/categories/cat1.jpg'
  },
  {
    id: 'fruits',
    name: 'Fruits',
    productCount: 2,
    image: '/categories/cat2.jpg'
  },
  {
    id: 'patterns',
    name: 'Patterns',
    productCount: 3,
    image: '/categories/cat3.jpg'
  },
  {
    id: 'cozy_crew',
    name: 'Cozy Crew',
    productCount: 3,
    image: '/categories/cat4.jpg'
  }
];

const parseJsonArray = (val) => {
  if (!val) return [];
  try {
    const parsed = JSON.parse(val);
    return Array.isArray(parsed) ? parsed : [val];
  } catch {
    return [val];
  }
};

export default function ProductGrid({ onCategorySelect }) {
  const { t, language, tCategory } = useLanguage();
  const [categoriesList, setCategoriesList] = useState([]);

  useEffect(() => {
    let active = true;
    
    Promise.all([
      fetch('/api/settings/categories').then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      }),
      fetch('/api/products').then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
    ])
      .then(([cats, prods]) => {
        if (active) {
          const fallbackImages = ['/categories/cat1.jpg', '/categories/cat2.jpg', '/categories/cat3.jpg', '/categories/cat4.jpg'];
          
          const compiled = cats.map((cat, index) => {
            const categoryProducts = prods.filter(p => parseJsonArray(p.category).includes(cat.name));
            const count = categoryProducts.length;
            
            let img;
            if (categoryProducts.length > 0 && categoryProducts[0].image_url) {
              const url = categoryProducts[0].image_url;
              img = url.startsWith('data:') || url.startsWith('/') ? url : `/uploads/${url}`;
            } else {
              img = fallbackImages[index % fallbackImages.length];
            }
            
            return {
              id: cat.id,
              name: cat.name,
              productCount: count,
              image: img
            };
          });
          
          setCategoriesList(compiled);
        }
      })
      .catch((err) => {
        console.warn('Failed to fetch dynamic categories, falling back to static list', err);
        if (active) {
          setCategoriesList(fallbackCategories);
        }
      });
      
    return () => { active = false; };
  }, []);

  return (
    <section className="container mx-auto px-4 lg:px-16 xl:px-32 py-16">
      {/* Categories Title with lines */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.3 }}
        transition={{ duration: 0.6 }}
        className="flex items-center justify-center mb-10"
      >
        <div className="h-px bg-gray-200 flex-grow max-w-[300px]"></div>
        <h2 className="text-xl md:text-2xl font-bold text-[#1a365d] mx-6 uppercase tracking-wider">{t('nav.categories')}</h2>
        <div className="h-px bg-gray-200 flex-grow max-w-[300px]"></div>
      </motion.div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {categoriesList.map((category, index) => (
          <motion.div 
            key={category.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.1 }}
            transition={{ duration: 0.5, delay: (index % 4) * 0.1 }}
            onClick={() => onCategorySelect(category.name)}
            className="group cursor-pointer"
          >
            {/* Category Image */}
            <div className="w-full aspect-[3/4] bg-slate-100 rounded-xl mb-4 relative overflow-hidden transition-transform duration-300 group-hover:scale-[1.02] border border-slate-200/50">
               {category.image ? (
                 <img src={category.image} alt={tCategory(category.name)} className="w-full h-full object-cover" />
               ) : (
                 <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-tr from-[#B2AC88]/20 to-[#F5F5DC]/40">
                    <span className="text-[#36454F]/40 font-bold text-xl tracking-widest uppercase">{tCategory(category.name)}</span>
                 </div>
               )}
            </div>
            
            {/* Category Details */}
            <div className="space-y-1 text-center">
              <h3 className="font-bold text-brand-charcoal text-lg uppercase tracking-wide group-hover:text-[#B2AC88] transition-colors">{tCategory(category.name)}</h3>
              <p className="text-xs text-gray-400 font-medium">{category.productCount} {language === 'ar' ? 'عناصر متوفرة' : language === 'ku' ? 'بەرهەم بەردەستە' : 'Items Available'}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Pagination Dots */}
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: false }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="flex items-center justify-center space-x-2.5 rtl:space-x-reverse mt-10"
      >
        <div className="w-2.5 h-2.5 rounded-full bg-[#C08081]"></div>
        {[...Array(6)].map((_, i) => (
          <div key={i} className="w-2.5 h-2.5 rounded-full border border-[#C08081]"></div>
        ))}
      </motion.div>

      {/* View All Button */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: false }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="flex justify-center mt-10"
      >
        <button 
          onClick={() => onCategorySelect('All')}
          className="px-10 py-2 border border-[#C08081] text-[#C08081] text-sm font-medium rounded-full hover:bg-[#36454F] hover:border-[#36454F] hover:text-white transition-all duration-300 cursor-pointer bg-transparent"
        >
          {language === 'ar' ? 'عرض الكل' : language === 'ku' ? 'پیشاندانی هەمووی' : 'View all'}
        </button>
      </motion.div>
    </section>
  );
}
