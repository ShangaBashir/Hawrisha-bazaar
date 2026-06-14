import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Heart, ShoppingBag, ArrowLeft, X, Plus, Minus, Check, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.jsx';

const getColorStyle = (colorClass) => {
  if (!colorClass) return {};
  if (colorClass.startsWith('bg-[#') && colorClass.endsWith(']')) {
    return { backgroundColor: colorClass.slice(4, -1) };
  }
  if (colorClass.startsWith('#')) {
    return { backgroundColor: colorClass };
  }
  return {};
};

const parseJsonArray = (val) => {
  if (!val) return [];
  try {
    const parsed = JSON.parse(val);
    return Array.isArray(parsed) ? parsed : [val];
  } catch {
    return [val];
  }
};

const productsData = [
  {
    id: 1,
    name: 'Pet Lovers',
    price: 6250,
    category: 'Animals',
    colorFamily: 'slate',
    colors: ['bg-[#36454F]', 'bg-[#F5F5DC]', 'bg-[#60A5FA]', 'bg-[#B2AC88]'],
    colorNames: ['Charcoal Slate', 'Classic Beige', 'Soft Sky Blue', 'Sage Green'],
    extraColors: '+15',
    image: '',
    badge: 'Bestseller',
    desc: 'Express your passion for pets in cozy fashion. Knit with durable premium combed cotton, these socks deliver all-day comfort and a breathable stretch ideal for everyday walks.'
  },
  {
    id: 2,
    name: 'Tabby Cat',
    price: 6250,
    category: 'Animals',
    colorFamily: 'orange',
    colors: ['bg-orange-500', 'bg-[#36454F]', 'bg-[#F5F5DC]', 'bg-[#60A5FA]'],
    colorNames: ['Citrus Orange', 'Charcoal Slate', 'Classic Beige', 'Soft Sky Blue'],
    extraColors: '+15',
    image: '',
    badge: 'New',
    desc: 'Brighten your day with these lovable tabby kitten designs. Perfect for cat enthusiasts, utilizing soft combed cotton for a premium lightweight and sweat-wicking texture.'
  },
  {
    id: 3,
    name: 'Kangaroo Crew',
    price: 5000,
    category: 'Animals',
    colorFamily: 'beige',
    colors: ['bg-[#F5F5DC]', 'bg-[#36454F]', 'bg-[#60A5FA]'],
    colorNames: ['Classic Beige', 'Charcoal Slate', 'Soft Sky Blue'],
    extraColors: '+15',
    image: '',
    badge: 'Sale',
    desc: 'Jump into premium comfort with our dynamic Kangaroo socks. Double-looped heel cushion supports high impact steps, keeping your feet padded and comfortable.'
  },
  {
    id: 4,
    name: 'Sweet Ribbons',
    price: 6250,
    category: 'Patterns',
    colorFamily: 'sage',
    colors: ['bg-[#B2AC88]', 'bg-[#36454F]', 'bg-[#F5F5DC]', 'bg-[#60A5FA]'],
    colorNames: ['Sage Green', 'Charcoal Slate', 'Classic Beige', 'Soft Sky Blue'],
    extraColors: '+12',
    image: '',
    badge: '',
    desc: 'Delicate pattern styling that adds a sweet touch to any aesthetic. Designed with standard rib arches to sit comfortably around the calf without binding.'
  },
  {
    id: 5,
    name: 'Abstract Faces',
    price: 6250,
    category: 'Patterns',
    colorFamily: 'rose',
    colors: ['bg-[#B2AC88]', 'bg-[#36454F]', 'bg-[#B2AC88]'],
    colorNames: ['Dusk Rose', 'Charcoal Slate', 'Sage Green'],
    extraColors: '+8',
    image: '',
    badge: 'Bestseller',
    desc: 'Make a bold statement with artist-inspired abstract faces. Knitted with combed yarns for high detailed resolution and rich, long-lasting wash durability.'
  },
  {
    id: 6,
    name: 'Cat Patterns',
    price: 6250,
    category: 'Animals',
    colorFamily: 'beige',
    colors: ['bg-[#F5F5DC]', 'bg-[#B2AC88]', 'bg-[#36454F]'],
    colorNames: ['Classic Beige', 'Dusk Rose', 'Charcoal Slate'],
    extraColors: '+10',
    image: '',
    badge: 'New',
    desc: 'A delightful assortment of repeating kitten patterns. Standard crew length looks fantastic paired with casual sneakers or boots.'
  },
  {
    id: 7,
    name: 'Tropical Flamingo',
    price: 7000,
    category: 'Patterns',
    colorFamily: 'rose',
    colors: ['bg-[#B2AC88]', 'bg-[#B2AC88]', 'bg-sky-400'],
    colorNames: ['Dusk Rose', 'Sage Green', 'Sky Blue'],
    extraColors: '+18',
    image: '',
    badge: 'Bestseller',
    desc: 'Evoke year-round vacation vibes with our tropical flamingo graphics. Offers supportive seamless toes and high elastic ankle bands.'
  },
  {
    id: 8,
    name: 'Sunny Lemon',
    price: 5500,
    category: 'Fruits',
    colorFamily: 'yellow',
    colors: ['bg-yellow-400', 'bg-[#36454F]', 'bg-[#F5F5DC]'],
    colorNames: ['Lemon Yellow', 'Charcoal Slate', 'Classic Beige'],
    extraColors: '+6',
    image: '',
    bgFallback: 'bg-yellow-100/60',
    badge: 'Sale',
    desc: 'A splash of sunshine for your wardrobe! Designed with seamless toe closures to eliminate pressure seams and keep active steps cheerful.'
  },
  {
    id: 9,
    name: 'Comfy Lavender',
    price: 4500,
    category: 'Cozy Crew',
    colorFamily: 'purple',
    colors: ['bg-purple-400', 'bg-violet-600', 'bg-gray-100'],
    colorNames: ['Soft Lavender', 'Deep Violet', 'Cloud Gray'],
    extraColors: '+4',
    image: '',
    bgFallback: 'bg-purple-100/60',
    badge: '',
    desc: 'Sink into luxurious relaxation with our extra-cushion lavender collection. Designed with organic wool blending to provide breathable warming wraps.'
  },
  {
    id: 10,
    name: 'Winter Snowflake',
    price: 8000,
    category: 'Cozy Crew',
    colorFamily: 'sky',
    colors: ['bg-sky-100', 'bg-blue-600', 'bg-white'],
    colorNames: ['Snow Sky Blue', 'Royal Blue', 'Pure White'],
    extraColors: '+14',
    image: '',
    bgFallback: 'bg-sky-200/60',
    badge: 'New',
    desc: 'Stay warm even in sub-zero climates with extra brushed-nap loops. Excellent thermoregulatory layers featuring festive holiday patterns.'
  },
  {
    id: 11,
    name: 'Retro Stripes',
    price: 6000,
    category: 'Patterns',
    colorFamily: 'red',
    colors: ['bg-red-400', 'bg-amber-400', 'bg-[#36454F]'],
    colorNames: ['Coral Red', 'Amber Yellow', 'Charcoal Slate'],
    extraColors: '+20',
    image: '',
    bgFallback: 'bg-amber-100/60',
    badge: '',
    desc: 'Vintage varsity stripes that pair beautifully with athleisure wear. Offers medium arch compressions to reduce foot fatigue.'
  },
  {
    id: 12,
    name: 'Avocado Smile',
    price: 5500,
    category: 'Fruits',
    colorFamily: 'green',
    colors: ['bg-emerald-600', 'bg-yellow-300', 'bg-[#36454F]'],
    colorNames: ['Avocado Green', 'Lemon Yellow', 'Charcoal Slate'],
    extraColors: '+8',
    image: '',
    bgFallback: 'bg-emerald-100/60',
    badge: 'New',
    desc: 'Start your mornings with positive, smiling avocado prints. Made with breathable mesh panels to keep sweat low and comfort exceptionally high.'
  }
];


const colorFilters = [
  { name: 'rose', class: 'bg-[#C08081]' },
  { name: 'sage', class: 'bg-[#B2AC88]' },
  { name: 'beige', class: 'bg-[#F5F5DC]' },
  { name: 'slate', class: 'bg-[#36454F]' },
  { name: 'yellow', class: 'bg-yellow-400' },
  { name: 'green', class: 'bg-emerald-600' },
  { name: 'purple', class: 'bg-purple-400' },
  { name: 'orange', class: 'bg-orange-500' }
];

export default function AllProducts({ onAddToCart, onRemoveFromCart, onBackToHome, initialCategory = 'All', likedProducts = [], onToggleWishlist, initialViewingProduct = null, cart = [], initialSearchTerm = '', previousView = 'home', isLoggedIn, onLoginRequired }) {
  const { t, language } = useLanguage();
  const isRTL = language === 'ar' || language === 'ku';

  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [sortOrder, setSortOrder] = useState('featured');
  const [priceRange, setPriceRange] = useState([0, 15000]);

  const getBackLabel = () => {
    if (previousView === 'wishlist') {
      return language === 'ar' ? 'العودة للمفضلة' : language === 'ku' ? 'گەڕانەوە بۆ لیستی دڵخوازەکان' : 'Back to Wishlist';
    }
    if (previousView === 'cart') {
      return language === 'ar' ? 'العودة للسلة' : language === 'ku' ? 'گەڕانەوە بۆ سەبەتە' : 'Back to Your Cart';
    }
    if (previousView === 'story') {
      return language === 'ar' ? 'العودة لقصتنا' : language === 'ku' ? 'گەڕانەوە بۆ چیرۆکی ئێمە' : 'Back to Our Story';
    }
    if (previousView === 'contact') {
      return language === 'ar' ? 'العودة للتواصل' : language === 'ku' ? 'گەڕانەوە بۆ پەیوەندی' : 'Back to Contact';
    }
    if (previousView === 'checkout') {
      return language === 'ar' ? 'العودة لتأكيد الطلب' : language === 'ku' ? 'گەڕانەوە بۆ پارەدان' : 'Back to Checkout';
    }
    return t('checkout_page.back_home') || 'Back to Home';
  };// Navigation & Filtering States
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stylesList, setStylesList] = useState([]);
  const [materialsList, setMaterialsList] = useState([]);
  const [seasonsList, setSeasonsList] = useState([]);
  const [sizesList, setSizesList] = useState([]);
  const [colorsList, setColorsList] = useState([]);

  const uniqueColorFilters = useMemo(() => {
    if (colorsList.length === 0) {
      return colorFilters;
    }
    const families = [];
    const seen = new Set();
    colorsList.forEach(col => {
      const fam = col.family.toLowerCase();
      if (!seen.has(fam)) {
        seen.add(fam);
        families.push({
          name: fam,
          class: col.class
        });
      }
    });
    return families;
  }, [colorsList]);

  const [selectedStyles, setSelectedStyles] = useState([]);
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [selectedSeasons, setSelectedSeasons] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewingProduct, setViewingProduct] = useState(initialViewingProduct);
  const [prevInitialProduct, setPrevInitialProduct] = useState(initialViewingProduct);

  if (initialViewingProduct !== prevInitialProduct) {
    setPrevInitialProduct(initialViewingProduct);
    setViewingProduct(initialViewingProduct);
  }
  
  // Fetch products from database
  useEffect(() => {
    let active = true;
    fetch('/api/products')
      .then((res) => {
        if (!res.ok) throw new Error('API server offline');
        return res.json();
      })
      .then((data) => {
        if (active) {
          setProducts(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.warn('Backend API server offline, falling back to static catalog productsData', err);
        if (active) {
          setProducts(productsData);
          setLoading(false);
        }
      });
    return () => { active = false; };
  }, []);

  // Fetch categories from settings
  useEffect(() => {
    let active = true;
    fetch('/api/settings/categories')
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        if (active) {
          setCategories(data);
        }
      })
      .catch((err) => {
        console.warn('Failed to fetch categories, using default fallback', err);
        if (active) {
          setCategories([
            { id: 'animals', name: 'Animals' },
            { id: 'fruits', name: 'Fruits' },
            { id: 'patterns', name: 'Patterns' },
            { id: 'cozy_crew', name: 'Cozy Crew' }
          ]);
        }
      });
    return () => { active = false; };
  }, []);

  // Fetch styles, materials, seasons, sizes, colors lists
  useEffect(() => {
    let active = true;

    // Fetch Styles
    fetch('/api/settings/styles')
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => { if (active) setStylesList(data); })
      .catch(() => {
        if (active) setStylesList([
          { id: 'crew', name: 'Crew' },
          { id: 'ankle', name: 'Ankle' },
          { id: 'no_show', name: 'No Show' },
          { id: 'knee_high', name: 'Knee High' }
        ]);
      });

    // Fetch Materials
    fetch('/api/settings/materials')
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => { if (active) setMaterialsList(data); })
      .catch(() => {
        if (active) setMaterialsList([
          { id: 'cotton', name: 'Cotton' },
          { id: 'bamboo', name: 'Bamboo' },
          { id: 'wool', name: 'Wool' },
          { id: 'polyester', name: 'Polyester' }
        ]);
      });

    // Fetch Seasons
    fetch('/api/settings/seasons')
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => { if (active) setSeasonsList(data); })
      .catch(() => {
        if (active) setSeasonsList([
          { id: 'winter', name: 'Winter' },
          { id: 'summer', name: 'Summer' },
          { id: 'spring', name: 'Spring' },
          { id: 'autumn', name: 'Autumn' },
          { id: 'all_season', name: 'All Season' }
        ]);
      });

    // Fetch Sizes
    fetch('/api/settings/sizes')
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => { if (active) setSizesList(data); })
      .catch(() => {
        if (active) setSizesList([
          { id: 'one_size', name: 'One Size' },
          { id: '35-38', name: '35-38' },
          { id: '39-42', name: '39-42' },
          { id: '43-46', name: '43-46' }
        ]);
      });

    // Fetch Colors
    fetch('/api/settings/colors')
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => { if (active) setColorsList(data); })
      .catch(() => {
        if (active) setColorsList([
          { id: 'beige', class: 'bg-[#F5F5DC]', name: 'Classic Beige', family: 'beige' },
          { id: 'sage', class: 'bg-[#B2AC88]', name: 'Sage Green', family: 'sage' },
          { id: 'slate', class: 'bg-[#36454F]', name: 'Charcoal Slate', family: 'slate' },
          { id: 'rose', class: 'bg-[#C08081]', name: 'Dusk Rose', family: 'rose' },
          { id: 'yellow', class: 'bg-yellow-400', name: 'Lemon Yellow', family: 'yellow' },
          { id: 'green', class: 'bg-emerald-600', name: 'Avocado Green', family: 'green' },
          { id: 'purple', class: 'bg-purple-400', name: 'Soft Lavender', family: 'purple' },
          { id: 'orange', class: 'bg-orange-500', name: 'Citrus Orange', family: 'orange' }
        ]);
      });

    return () => { active = false; };
  }, []);

  // Memoized category counts calculated dynamically
  const categoryCounts = useMemo(() => {
    const counts = { All: products.length };
    if (likedProducts.length > 0) {
      counts['Wishlist'] = likedProducts.length;
    }
    categories.forEach(cat => {
      counts[cat.name] = products.filter(p => p.category === cat.name).length;
    });
    return counts;
  }, [products, categories, likedProducts]);

  // Scroll to top when entering or leaving product detail view
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [viewingProduct]);

  useEffect(() => {
    setSearchTerm(initialSearchTerm);
  }, [initialSearchTerm]);
  const [selectedCategories, setSelectedCategories] = useState(
    initialCategory === 'All' ? [] : [initialCategory]
  );
  const [prevInitialCategory, setPrevInitialCategory] = useState(initialCategory);

  if (initialCategory !== prevInitialCategory) {
    setPrevInitialCategory(initialCategory);
    if (initialCategory === 'All') {
      setSelectedCategories([]);
    } else {
      setSelectedCategories([initialCategory]);
    }
  }
  
  const [showFilters, setShowFilters] = useState(true);
  const [onlyDiscounted, setOnlyDiscounted] = useState(false);
  const [maxPriceFilter, setMaxPriceFilter] = useState(15000);
  const [hasSetDefaultPrice, setHasSetDefaultPrice] = useState(false);
  const [selectedColors, setSelectedColors] = useState([]);
  const [sortBy, setSortBy] = useState('Featured');
  
  const [collapsedSections, setCollapsedSections] = useState({
    offers: false,
    categories: false,
    price: false,
    color: false,
    size: false,
    style: false,
    material: false,
    season: false,
  });

  const toggleSection = (section) => {
    setCollapsedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const maxPriceOfProducts = useMemo(() => {
    if (products.length === 0) return 15000;
    return Math.max(...products.map(p => Number(p.price) || 0), 250);
  }, [products]);

  useEffect(() => {
    if (products.length > 0 && !hasSetDefaultPrice) {
      setMaxPriceFilter(maxPriceOfProducts);
      setHasSetDefaultPrice(true);
    }
  }, [products, maxPriceOfProducts, hasSetDefaultPrice]);
  
  const [toastMessage, setToastMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(0);

  // Product Detail Page configurations
  const [detailColorIndex, setDetailColorIndex] = useState(0);
  const [detailQuantity, setDetailQuantity] = useState(1);
  const [isDetailRemovedBlue, setIsDetailRemovedBlue] = useState(false);

  useEffect(() => {
    setIsDetailRemovedBlue(false);
  }, [viewingProduct]);

  // Handle Toast notification for cart additions
  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(''), 2500);
  };

  const handleAddToCartClick = (product, e) => {
    e.stopPropagation();
    if (!isLoggedIn) {
      if (onLoginRequired) onLoginRequired();
      return;
    }
    const finalPrice = product.discount > 0 
      ? Math.round(product.price * (1 - product.discount / 100))
      : product.price;
    onAddToCart({ ...product, price: finalPrice });
    showToast(`Added ${product.name} to your cart!`);
  };

  const handleRemoveFromCartClick = (product, e) => {
    e.stopPropagation();
    if (onRemoveFromCart) {
      onRemoveFromCart(product.id);
      showToast(`Removed ${product.name} from your cart!`);
    }
  };

  const handleToggleWishlistClick = (product, e) => {
    e.stopPropagation();
    const isLiked = likedProducts.includes(product.id);
    onToggleWishlist(product.id);
    if (isLiked) {
      showToast(`Removed ${product.name} from your wishlist!`);
    } else {
      showToast(`Added ${product.name} to your wishlist!`);
    }
  };

  // Reset Filters
  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategories([]);
    setOnlyDiscounted(false);
    setMaxPriceFilter(maxPriceOfProducts);
    setSelectedColors([]);
    setSortBy('Featured');
    setSelectedStyles([]);
    setSelectedMaterials([]);
    setSelectedSeasons([]);
    setSelectedSizes([]);
  };

  // Memoized Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategories.length === 0 || 
          selectedCategories.some(cat => 
            cat === 'Wishlist' 
              ? likedProducts.includes(product.id) 
              : parseJsonArray(product.category).includes(cat)
          );
        const matchesDiscount = !onlyDiscounted || (Number(product.discount) > 0);
        const matchesPrice = product.price <= maxPriceFilter;
        // Find all families for this product's colors
        const productFamilies = [];
        const mainFamily = product.colorFamily || product.color_family;
        if (mainFamily) {
          productFamilies.push(mainFamily.toLowerCase());
        }
        
        // Also map each of the product's individual color classes to their families
        if (product.colors && Array.isArray(product.colors)) {
          product.colors.forEach(colClass => {
            const match = colorsList.find(c => c.class === colClass);
            if (match && match.family) {
              const fam = match.family.toLowerCase();
              if (!productFamilies.includes(fam)) {
                productFamilies.push(fam);
              }
            } else {
              // Fallback match to static color swatches if not in colorsList yet
              const staticMatch = [
                { class: 'bg-[#F5F5DC]', family: 'beige' },
                { class: 'bg-[#B2AC88]', family: 'sage' },
                { class: 'bg-[#36454F]', family: 'slate' },
                { class: 'bg-[#C08081]', family: 'rose' },
                { class: 'bg-yellow-400', family: 'yellow' },
                { class: 'bg-emerald-600', family: 'green' },
                { class: 'bg-purple-400', family: 'purple' },
                { class: 'bg-orange-500', family: 'orange' }
              ].find(c => c.class === colClass);
              if (staticMatch && !productFamilies.includes(staticMatch.family)) {
                productFamilies.push(staticMatch.family);
              }
            }
          });
        }

        const matchesColor = selectedColors.length === 0 || 
          selectedColors.some(selCol => productFamilies.includes(selCol.toLowerCase()));

        const matchesStyle = selectedStyles.length === 0 || 
          parseJsonArray(product.style_length).some(st => selectedStyles.includes(st));

        const matchesMaterial = selectedMaterials.length === 0 || 
          parseJsonArray(product.material).some(mat => selectedMaterials.includes(mat));

        const matchesSeason = selectedSeasons.length === 0 || 
          parseJsonArray(product.seasonal_type).some(seas => selectedSeasons.includes(seas));

        const matchesSize = selectedSizes.length === 0 || 
          parseJsonArray(product.size_collection).some(sz => selectedSizes.includes(sz));

        return matchesSearch && matchesCategory && matchesPrice && matchesColor && matchesStyle && matchesMaterial && matchesSeason && matchesSize && matchesDiscount;
      })
      .sort((a, b) => {
        if (sortBy === 'Price: Low to High') {
          return a.price - b.price;
        }
        if (sortBy === 'Price: High to Low') {
          return b.price - a.price;
        }
        if (sortBy === 'Bestseller') {
          const isBestsellerA = parseJsonArray(a.badge).includes('Bestseller') ? 1 : 0;
          const isBestsellerB = parseJsonArray(b.badge).includes('Bestseller') ? 1 : 0;
          return isBestsellerB - isBestsellerA;
        }
        if (sortBy === 'Newest Arrivals') {
          const aIsNew = parseJsonArray(a.badge).includes('New') ? 1 : 0;
          const bIsNew = parseJsonArray(b.badge).includes('New') ? 1 : 0;
          if (bIsNew !== aIsNew) return bIsNew - aIsNew;
          return Number(b.id) - Number(a.id);
        }
        return 0;
      });
  }, [products, searchTerm, selectedCategories, maxPriceFilter, selectedColors, sortBy, likedProducts, selectedStyles, selectedMaterials, selectedSeasons, selectedSizes, colorsList, onlyDiscounted]);

  // Reset page when any filter updates
  useEffect(() => {
    setCurrentPage(0);
  }, [searchTerm, selectedCategories, maxPriceFilter, selectedColors, sortBy, selectedStyles, selectedMaterials, selectedSeasons, selectedSizes, colorsList, onlyDiscounted]);

  // Memoized page count
  const pageCount = useMemo(() => {
    return Math.ceil(filteredProducts.length / 12);
  }, [filteredProducts]);

  // Paginated Products
  const paginatedProducts = useMemo(() => {
    if (filteredProducts.length <= 12) {
      return filteredProducts;
    }
    const start = currentPage * 12;
    const end = start + 12;
    return filteredProducts.slice(start, end);
  }, [filteredProducts, currentPage]);

  const hasActiveFilters = onlyDiscounted || selectedCategories.length > 0 || maxPriceFilter < maxPriceOfProducts || selectedColors.length > 0 || searchTerm !== '' || selectedStyles.length > 0 || selectedMaterials.length > 0 || selectedSeasons.length > 0 || selectedSizes.length > 0;

  // Trigger entering product detail state
  const handleCardClick = (product) => {
    setViewingProduct(product);
    setDetailColorIndex(0);
    setDetailQuantity(1);
    setIsDetailRemovedBlue(false);
  };

  // Perform multiple dynamic additions to shopping bag or removal
  const handleDetailAdd = () => {
    if (!isLoggedIn) {
      if (onLoginRequired) onLoginRequired();
      return;
    }
    const isDetailInCart = cart.some(item => item.id === viewingProduct.id);
    if (isDetailInCart) {
      if (onRemoveFromCart) {
        onRemoveFromCart(viewingProduct.id);
      }
      setIsDetailRemovedBlue(true);
      showToast(`Removed ${viewingProduct.name} from cart!`);
    } else {
      const finalPrice = viewingProduct.discount > 0 
        ? Math.round(viewingProduct.price * (1 - viewingProduct.discount / 100))
        : viewingProduct.price;
      onAddToCart({ ...viewingProduct, price: finalPrice }, detailQuantity);
      setIsDetailRemovedBlue(false);
      const colorLabel = viewingProduct.colorNames ? viewingProduct.colorNames[detailColorIndex] : 'selected color';
      showToast(`Added ${detailQuantity}x ${viewingProduct.name} (${colorLabel}) to cart!`);
    }
  };

  return (
    <div className="bg-gradient-to-b from-[#F5F5DC]/40 via-white/50 to-[#F5F5DC]/30 min-h-screen py-10 px-4 lg:px-16 xl:px-24 relative select-none">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 350, damping: 22 }}
            className="fixed bottom-8 right-8 z-50 bg-[#36454F] text-white px-6 py-3.5 rounded-xl shadow-xl flex items-center space-x-3 border border-white/10"
          >
            <div className="w-2.5 h-2.5 rounded-full bg-[#B2AC88] animate-ping" />
            <span className="font-semibold text-sm tracking-wide">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-[1440px] mx-auto">
        <AnimatePresence mode="wait">
          {!viewingProduct ? (
            /* Catalog Page view */
            <motion.div
              key="catalog"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
            >
              {/* Luxury Banner Header */}
              {/* Clean Header & Filters Bar */}
              <div className="mb-10">
                {/* Title Row */}
                <motion.div
                  initial={{ opacity: 0, y: -24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8"
                >
                  <div>
                    <h1 className="text-5xl font-black text-[#36454F] tracking-tight uppercase leading-none">{t('nav.all_products')}</h1>
                  </div>

                  {/* Search input - clean minimal style */}
                  <motion.div
                    initial={{ opacity: 0, x: isRTL ? -24 : 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
                    className="relative w-full md:w-80"
                  >
                    <input
                      type="text"
                      placeholder={t('product.search_catalog')}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2.5 bg-white border border-gray-200 focus:border-[#B2AC88] rounded-full focus:outline-none focus:ring-2 focus:ring-[#B2AC88]/15 text-sm text-[#36454F] transition-all placeholder:text-gray-400 shadow-xs font-semibold`}
                    />
                    <Search className={`absolute ${isRTL ? 'right-3.5' : 'left-3.5'} top-3.5 text-gray-400`} size={14} />
                  </motion.div>
                </motion.div>

                {/* Filters Controls Bar */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: 0.2, ease: 'easeOut' }}
                  className="flex flex-wrap items-center justify-between gap-4 border-t border-b border-gray-100 py-3.5"
                >
                  <div className="flex items-center space-x-4 rtl:space-x-reverse">
                    {/* Hide Filters Button */}
                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className="px-5 py-2 border border-gray-200 hover:border-gray-300 text-[10px] font-bold uppercase tracking-wider rounded-full hover:bg-gray-50 transition-all cursor-pointer shadow-xs text-[#36454F] bg-white"
                    >
                      {showFilters 
                        ? (language === 'ar' ? 'إخفاء الفلاتر' : language === 'ku' ? 'شاردنەوەی فلتەرەکان' : 'Hide filters')
                        : (language === 'ar' ? 'عرض الفلاتر' : language === 'ku' ? 'پیشاندانی فلتەرەکان' : 'Show filters')}
                    </button>

                  </div>

                  {/* Active filter badges / pills */}
                  <div className="flex flex-wrap gap-2 items-center">
                    {selectedCategories.map(cat => (
                      <span key={cat} className="flex items-center space-x-1.5 px-3 py-1 bg-gray-100 border border-gray-200 text-gray-600 text-[10px] font-bold rounded-full">
                        <span>{language === 'ar' ? 'التصنيف' : language === 'ku' ? 'پۆلێن' : 'Category'}: {cat}</span>
                        <X size={10} className="cursor-pointer text-gray-400 hover:text-gray-600" onClick={() => setSelectedCategories(prev => prev.filter(x => x !== cat))} />
                      </span>
                    ))}
                    {onlyDiscounted && (
                      <span className="flex items-center space-x-1.5 px-3 py-1 bg-gray-100 border border-gray-200 text-gray-600 text-[10px] font-bold rounded-full">
                        <span>{language === 'ar' ? 'العروض: تخفيضات' : language === 'ku' ? 'پێشنیارەکان: داشکاندن' : 'Offers: Discount'}</span>
                        <X size={10} className="cursor-pointer text-gray-400 hover:text-gray-600" onClick={() => setOnlyDiscounted(false)} />
                      </span>
                    )}
                    {maxPriceFilter < maxPriceOfProducts && (
                      <span className="flex items-center space-x-1.5 px-3 py-1 bg-gray-100 border border-gray-200 text-gray-600 text-[10px] font-bold rounded-full">
                        <span>{language === 'ar' ? `أقل من ${maxPriceFilter.toLocaleString()} د.ع` : language === 'ku' ? `کەمتر لە ${maxPriceFilter.toLocaleString()} دینار` : `Under ${maxPriceFilter.toLocaleString()} IQD`}</span>
                        <X size={10} className="cursor-pointer text-gray-400 hover:text-gray-600" onClick={() => setMaxPriceFilter(maxPriceOfProducts)} />
                      </span>
                    )}
                    {selectedColors.length > 0 && (
                      <span className="flex items-center space-x-1.5 px-3 py-1 bg-gray-100 border border-gray-200 text-gray-600 text-[10px] font-bold rounded-full">
                        <span>{language === 'ar' ? 'الألوان' : language === 'ku' ? 'ڕەنگەکان' : 'Colors'} ({selectedColors.length})</span>
                        <X size={10} className="cursor-pointer text-gray-400 hover:text-gray-600" onClick={() => setSelectedColors([])} />
                      </span>
                    )}
                    {searchTerm !== '' && (
                      <span className="flex items-center space-x-1.5 px-3 py-1 bg-gray-100 border border-gray-200 text-gray-600 text-[10px] font-bold rounded-full">
                        <span>{language === 'ar' ? 'البحث' : language === 'ku' ? 'گەڕان' : 'Search'}: "{searchTerm}"</span>
                        <X size={10} className="cursor-pointer text-gray-400 hover:text-gray-600" onClick={() => setSearchTerm('')} />
                      </span>
                    )}
                    {selectedStyles.map(st => (
                      <span key={st} className="flex items-center space-x-1.5 px-3 py-1 bg-gray-100 border border-gray-200 text-gray-600 text-[10px] font-bold rounded-full">
                        <span>{language === 'ar' ? 'الموديل' : language === 'ku' ? 'شێواز' : 'Style'}: {st}</span>
                        <X size={10} className="cursor-pointer text-gray-400 hover:text-gray-600" onClick={() => setSelectedStyles(prev => prev.filter(x => x !== st))} />
                      </span>
                    ))}
                    {selectedMaterials.map(mat => (
                      <span key={mat} className="flex items-center space-x-1.5 px-3 py-1 bg-gray-100 border border-gray-200 text-gray-600 text-[10px] font-bold rounded-full">
                        <span>{language === 'ar' ? 'المادة' : language === 'ku' ? 'کەرەستە' : 'Material'}: {mat}</span>
                        <X size={10} className="cursor-pointer text-gray-400 hover:text-gray-600" onClick={() => setSelectedMaterials(prev => prev.filter(x => x !== mat))} />
                      </span>
                    ))}
                    {selectedSeasons.map(seas => (
                      <span key={seas} className="flex items-center space-x-1.5 px-3 py-1 bg-gray-100 border border-gray-200 text-gray-600 text-[10px] font-bold rounded-full">
                        <span>{language === 'ar' ? 'الموسم' : language === 'ku' ? 'وەرز' : 'Season'}: {seas}</span>
                        <X size={10} className="cursor-pointer text-gray-400 hover:text-gray-600" onClick={() => setSelectedSeasons(prev => prev.filter(x => x !== seas))} />
                      </span>
                    ))}
                    {selectedSizes.map(sz => (
                      <span key={sz} className="flex items-center space-x-1.5 px-3 py-1 bg-gray-100 border border-gray-200 text-gray-600 text-[10px] font-bold rounded-full">
                        <span>{language === 'ar' ? 'المقاس' : language === 'ku' ? 'قەبارە' : 'Size'}: {sz}</span>
                        <X size={10} className="cursor-pointer text-gray-400 hover:text-gray-600" onClick={() => setSelectedSizes(prev => prev.filter(x => x !== sz))} />
                      </span>
                    ))}
                    {hasActiveFilters && (
                      <button 
                        onClick={handleResetFilters}
                        className="text-[10px] font-bold uppercase tracking-wider text-[#B2AC88] hover:text-[#36454F] cursor-pointer ml-1.5"
                      >
                        {t('product.clear_all')}
                      </button>
                    )}
                    
                    <div className="flex items-center space-x-2 px-4 py-2 border border-gray-200 hover:border-gray-300 rounded-full hover:bg-gray-50 transition-all cursor-pointer shadow-xs text-[#36454F] bg-white ml-2 rtl:space-x-reverse rtl:mr-2 rtl:ml-0">
                      <span className="shrink-0 text-gray-400 text-xs font-semibold select-none">{t('product.sort_title')}:</span>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="bg-transparent border-0 py-0 pr-6 rtl:pl-6 rtl:pr-0 text-xs font-bold text-[#36454F] focus:outline-none cursor-pointer"
                      >
                        <option value="Featured">{language === 'ar' ? 'المميز' : language === 'ku' ? 'تایبەتمەند' : 'Featured'}</option>
                        <option value="Newest Arrivals">{t('product.sort_newest')}</option>
                        <option value="Bestseller">{t('product.badge_bestseller')}</option>
                        <option value="Price: Low to High">{t('product.sort_price_low')}</option>
                        <option value="Price: High to Low">{t('product.sort_price_high')}</option>
                      </select>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Sidebar + Grid Layout */}
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar Sticky Filter Panel */}
                <AnimatePresence initial={false}>
                  {showFilters && (
                    <motion.aside 
                      initial={{ opacity: 0, width: 0, marginRight: 0 }}
                      animate={{ opacity: 1, width: 256, marginRight: 32 }}
                      exit={{ opacity: 0, width: 0, marginRight: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="w-full lg:w-64 shrink-0 self-start lg:sticky lg:top-28 z-20 overflow-hidden"
                    >
                      <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-xs flex flex-col space-y-6">
                        {/* All Products Button */}
                        <div className="space-y-1">
                          <button
                            onClick={handleResetFilters}
                            className={`flex items-center justify-between w-full text-xs font-bold py-2.5 px-3.5 rounded-full transition-all cursor-pointer text-left ${
                              !hasActiveFilters
                                ? 'bg-[#B2AC88]/20 hover:bg-[#B2AC88]/30 text-[#B2AC88] font-black border border-[#B2AC88]/40 shadow-xs'
                                : 'bg-gray-50 hover:bg-gray-100 text-[#36454F] border border-gray-200/60 shadow-2xs'
                            }`}
                          >
                            <span>All</span>
                            <span className={`text-[10px] font-bold ${
                              !hasActiveFilters ? 'text-[#B2AC88]' : 'text-gray-400'
                            }`}>{products.length}</span>
                          </button>
                        </div>

                        {/* Discount / Offers Section */}
                        <div className="space-y-2">
                          <div 
                            onClick={() => toggleSection('offers')} 
                            className="flex items-center justify-between cursor-pointer group select-none"
                          >
                            <h4 className="text-[11px] font-bold text-[#36454F] uppercase tracking-widest">Offers</h4>
                            <div className="flex items-center space-x-2">
                              {onlyDiscounted && (
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOnlyDiscounted(false);
                                  }}
                                  className="text-[10px] font-bold uppercase tracking-wider text-[#B2AC88] hover:text-[#36454F] cursor-pointer"
                                >
                                  Clear
                                </button>
                              )}
                              <ChevronDown 
                                size={13} 
                                className={`text-gray-400 group-hover:text-[#36454F] transition-transform duration-200 ${
                                  collapsedSections.offers ? '-rotate-90' : 'rotate-0'
                                }`} 
                              />
                            </div>
                          </div>
                          {!collapsedSections.offers && (
                            <div className="flex flex-col space-y-2">
                              <label className="flex items-center space-x-2.5 text-xs font-semibold text-[#36454F] py-0.5 cursor-pointer select-none">
                                <input 
                                  type="checkbox" 
                                  checked={onlyDiscounted}
                                  onChange={(e) => setOnlyDiscounted(e.target.checked)}
                                  className="w-4 h-4 rounded border-gray-300 text-[#B2AC88] focus:ring-[#B2AC88]" 
                                />
                                <span>Discount</span>
                              </label>
                            </div>
                          )}
                        </div>

                        {/* Categories Section */}
                        <div className="space-y-2 pt-1">
                          <div 
                            onClick={() => toggleSection('categories')} 
                            className="flex items-center justify-between cursor-pointer group select-none"
                          >
                            <h4 className="text-[11px] font-bold text-[#36454F] uppercase tracking-widest">Categories</h4>
                            <div className="flex items-center space-x-2">
                              {selectedCategories.length > 0 && (
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedCategories([]);
                                  }}
                                  className="text-[10px] font-bold uppercase tracking-wider text-[#B2AC88] hover:text-[#36454F] cursor-pointer"
                                >
                                  Clear
                                </button>
                              )}
                              <ChevronDown 
                                size={13} 
                                className={`text-gray-400 group-hover:text-[#36454F] transition-transform duration-200 ${
                                  collapsedSections.categories ? '-rotate-90' : 'rotate-0'
                                }`} 
                              />
                            </div>
                          </div>
                          {!collapsedSections.categories && (
                            <div className="flex flex-col space-y-2 max-h-48 overflow-y-auto pr-1">
                              {categories.map((cat) => (
                                <label key={cat.id} className="flex items-center space-x-2.5 text-xs font-semibold text-[#36454F] py-0.5 cursor-pointer select-none">
                                  <input 
                                    type="checkbox" 
                                    checked={selectedCategories.includes(cat.name)}
                                    onChange={() => {
                                      if (selectedCategories.includes(cat.name)) {
                                        setSelectedCategories(selectedCategories.filter(c => c !== cat.name));
                                      } else {
                                        setSelectedCategories([...selectedCategories, cat.name]);
                                      }
                                    }}
                                    className="w-4 h-4 rounded border-gray-300 text-[#B2AC88] focus:ring-[#B2AC88]" 
                                  />
                                  <span>{cat.name}</span>
                                </label>
                              ))}
                              {likedProducts.length > 0 && (
                                <label className="flex items-center space-x-2.5 text-xs font-semibold text-[#36454F] py-0.5 cursor-pointer select-none border-t border-gray-50 pt-2 mt-1">
                                  <input 
                                    type="checkbox" 
                                    checked={selectedCategories.includes('Wishlist')}
                                    onChange={() => {
                                      if (selectedCategories.includes('Wishlist')) {
                                        setSelectedCategories(selectedCategories.filter(c => c !== 'Wishlist'));
                                      } else {
                                        setSelectedCategories([...selectedCategories, 'Wishlist']);
                                      }
                                    }}
                                    className="w-4 h-4 rounded border-gray-300 text-[#B2AC88] focus:ring-[#B2AC88]" 
                                  />
                                  <span>Wishlist</span>
                                </label>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Price Range Slider Section */}
                        <div className="space-y-2">
                          <div 
                            onClick={() => toggleSection('price')} 
                            className="flex items-center justify-between cursor-pointer group select-none"
                          >
                            <h4 className="text-[11px] font-bold text-[#36454F] uppercase tracking-widest">Price</h4>
                            <div className="flex items-center space-x-2">
                              {maxPriceFilter < maxPriceOfProducts && (
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setMaxPriceFilter(maxPriceOfProducts);
                                  }}
                                  className="text-[10px] font-bold uppercase tracking-wider text-[#B2AC88] hover:text-[#36454F] cursor-pointer"
                                >
                                  Clear
                                </button>
                              )}
                              <ChevronDown 
                                size={13} 
                                className={`text-gray-400 group-hover:text-[#36454F] transition-transform duration-200 ${
                                  collapsedSections.price ? '-rotate-90' : 'rotate-0'
                                }`} 
                              />
                            </div>
                          </div>
                          {!collapsedSections.price && (
                            <div className="space-y-2">
                              <input 
                                type="range" 
                                min="250" 
                                max={maxPriceOfProducts} 
                                step="250"
                                value={maxPriceFilter}
                                onChange={(e) => setMaxPriceFilter(Number(e.target.value))}
                                className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#B2AC88] m-0 p-0"
                              />
                              <div className="flex justify-between text-[10px] font-bold text-gray-400">
                                <span>250 IQD</span>
                                <span className="text-[#36454F] font-bold bg-[#B2AC88]/10 px-2 py-0.5 rounded-md">{maxPriceFilter.toLocaleString()} IQD</span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Checkbox Color Filters Section */}
                        <div className="space-y-2">
                          <div 
                            onClick={() => toggleSection('color')} 
                            className="flex items-center justify-between cursor-pointer group select-none"
                          >
                            <h4 className="text-[11px] font-bold text-[#36454F] uppercase tracking-widest">Color</h4>
                            <div className="flex items-center space-x-2">
                              {selectedColors.length > 0 && (
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedColors([]);
                                  }}
                                  className="text-[10px] font-bold uppercase tracking-wider text-[#B2AC88] hover:text-[#36454F] cursor-pointer"
                                >
                                  Clear
                                </button>
                              )}
                              <ChevronDown 
                                size={13} 
                                className={`text-gray-400 group-hover:text-[#36454F] transition-transform duration-200 ${
                                  collapsedSections.color ? '-rotate-90' : 'rotate-0'
                                }`} 
                              />
                            </div>
                          </div>
                          {!collapsedSections.color && (
                            <div className="flex flex-col space-y-2 max-h-48 overflow-y-auto pr-1">
                              {uniqueColorFilters.map((color) => (
                                <label key={color.name} className="flex items-center space-x-2.5 text-xs font-semibold text-[#36454F] py-0.5 cursor-pointer select-none">
                                  <input 
                                    type="checkbox" 
                                    checked={selectedColors.includes(color.name)}
                                    onChange={() => {
                                      if (selectedColors.includes(color.name)) {
                                        setSelectedColors(selectedColors.filter(c => c !== color.name));
                                      } else {
                                        setSelectedColors([...selectedColors, color.name]);
                                      }
                                    }}
                                    className="w-4 h-4 rounded border-gray-300 text-[#B2AC88] focus:ring-[#B2AC88]" 
                                  />
                                  <span 
                                    className={`w-3 h-3 rounded-full border border-gray-200/50 ${color.class}`} 
                                    style={getColorStyle(color.class)}
                                  />
                                  <span className="capitalize">{color.name}</span>
                                </label>
                              ))}
                            </div>
                          )}
                        </div>

                         {/* Size Collection Section */}
                        {sizesList.length > 0 && (
                          <div className="space-y-2">
                            <div 
                              onClick={() => toggleSection('size')} 
                              className="flex items-center justify-between cursor-pointer group select-none"
                            >
                              <h4 className="text-[11px] font-bold text-[#36454F] uppercase tracking-widest">Size Collection</h4>
                              <div className="flex items-center space-x-2">
                                {selectedSizes.length > 0 && (
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedSizes([]);
                                    }}
                                    className="text-[10px] font-bold uppercase tracking-wider text-[#B2AC88] hover:text-[#36454F] cursor-pointer"
                                  >
                                    Clear
                                  </button>
                                )}
                                <ChevronDown 
                                  size={13} 
                                  className={`text-gray-400 group-hover:text-[#36454F] transition-transform duration-200 ${
                                    collapsedSections.size ? '-rotate-90' : 'rotate-0'
                                  }`} 
                                />
                              </div>
                            </div>
                            {!collapsedSections.size && (
                              <div className="flex flex-col space-y-2 max-h-48 overflow-y-auto pr-1">
                                {sizesList.map((sz) => (
                                  <label key={sz.id} className="flex items-center space-x-2.5 text-xs font-semibold text-[#36454F] py-0.5 cursor-pointer select-none">
                                    <input 
                                      type="checkbox" 
                                      checked={selectedSizes.includes(sz.name)}
                                      onChange={() => {
                                        if (selectedSizes.includes(sz.name)) {
                                          setSelectedSizes(selectedSizes.filter(x => x !== sz.name));
                                        } else {
                                          setSelectedSizes([...selectedSizes, sz.name]);
                                        }
                                      }}
                                      className="w-4 h-4 rounded border-gray-300 text-[#B2AC88] focus:ring-[#B2AC88]" 
                                    />
                                    <span>{sz.name}</span>
                                  </label>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Styles / Lengths Section */}
                        {stylesList.length > 0 && (
                          <div className="space-y-2">
                            <div 
                              onClick={() => toggleSection('style')} 
                              className="flex items-center justify-between cursor-pointer group select-none"
                            >
                              <h4 className="text-[11px] font-bold text-[#36454F] uppercase tracking-widest">Style / Length</h4>
                              <div className="flex items-center space-x-2">
                                {selectedStyles.length > 0 && (
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedStyles([]);
                                    }}
                                    className="text-[10px] font-bold uppercase tracking-wider text-[#B2AC88] hover:text-[#36454F] cursor-pointer"
                                  >
                                    Clear
                                  </button>
                                )}
                                <ChevronDown 
                                  size={13} 
                                  className={`text-gray-400 group-hover:text-[#36454F] transition-transform duration-200 ${
                                    collapsedSections.style ? '-rotate-90' : 'rotate-0'
                                  }`} 
                                />
                              </div>
                            </div>
                            {!collapsedSections.style && (
                              <div className="flex flex-col space-y-2 max-h-48 overflow-y-auto pr-1">
                                {stylesList.map((st) => (
                                  <label key={st.id} className="flex items-center space-x-2.5 text-xs font-semibold text-[#36454F] py-0.5 cursor-pointer select-none">
                                    <input 
                                      type="checkbox" 
                                      checked={selectedStyles.includes(st.name)}
                                      onChange={() => {
                                        if (selectedStyles.includes(st.name)) {
                                          setSelectedStyles(selectedStyles.filter(x => x !== st.name));
                                        } else {
                                          setSelectedStyles([...selectedStyles, st.name]);
                                        }
                                      }}
                                      className="w-4 h-4 rounded border-gray-300 text-[#B2AC88] focus:ring-[#B2AC88]" 
                                    />
                                    <span>{st.name}</span>
                                  </label>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Materials Section */}
                        {materialsList.length > 0 && (
                          <div className="space-y-2">
                            <div 
                              onClick={() => toggleSection('material')} 
                              className="flex items-center justify-between cursor-pointer group select-none"
                            >
                              <h4 className="text-[11px] font-bold text-[#36454F] uppercase tracking-widest">Material</h4>
                              <div className="flex items-center space-x-2">
                                {selectedMaterials.length > 0 && (
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedMaterials([]);
                                    }}
                                    className="text-[10px] font-bold uppercase tracking-wider text-[#B2AC88] hover:text-[#36454F] cursor-pointer"
                                  >
                                    Clear
                                  </button>
                                )}
                                <ChevronDown 
                                  size={13} 
                                  className={`text-gray-400 group-hover:text-[#36454F] transition-transform duration-200 ${
                                    collapsedSections.material ? '-rotate-90' : 'rotate-0'
                                  }`} 
                                />
                              </div>
                            </div>
                            {!collapsedSections.material && (
                              <div className="flex flex-col space-y-2 max-h-48 overflow-y-auto pr-1">
                                {materialsList.map((mat) => (
                                  <label key={mat.id} className="flex items-center space-x-2.5 text-xs font-semibold text-[#36454F] py-0.5 cursor-pointer select-none">
                                    <input 
                                      type="checkbox" 
                                      checked={selectedMaterials.includes(mat.name)}
                                      onChange={() => {
                                        if (selectedMaterials.includes(mat.name)) {
                                          setSelectedMaterials(selectedMaterials.filter(x => x !== mat.name));
                                        } else {
                                          setSelectedMaterials([...selectedMaterials, mat.name]);
                                        }
                                      }}
                                      className="w-4 h-4 rounded border-gray-300 text-[#B2AC88] focus:ring-[#B2AC88]" 
                                    />
                                    <span>{mat.name}</span>
                                  </label>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Seasonal Type Section */}
                        {seasonsList.length > 0 && (
                          <div className="space-y-2">
                            <div 
                              onClick={() => toggleSection('season')} 
                              className="flex items-center justify-between cursor-pointer group select-none"
                            >
                              <h4 className="text-[11px] font-bold text-[#36454F] uppercase tracking-widest">Seasonal Type</h4>
                              <div className="flex items-center space-x-2">
                                {selectedSeasons.length > 0 && (
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedSeasons([]);
                                    }}
                                    className="text-[10px] font-bold uppercase tracking-wider text-[#B2AC88] hover:text-[#36454F] cursor-pointer"
                                  >
                                    Clear
                                  </button>
                                )}
                                <ChevronDown 
                                  size={13} 
                                  className={`text-gray-400 group-hover:text-[#36454F] transition-transform duration-200 ${
                                    collapsedSections.season ? '-rotate-90' : 'rotate-0'
                                  }`} 
                                />
                              </div>
                            </div>
                            {!collapsedSections.season && (
                              <div className="flex flex-col space-y-2 max-h-48 overflow-y-auto pr-1">
                                {seasonsList.map((seas) => (
                                  <label key={seas.id} className="flex items-center space-x-2.5 text-xs font-semibold text-[#36454F] py-0.5 cursor-pointer select-none">
                                    <input 
                                      type="checkbox" 
                                      checked={selectedSeasons.includes(seas.name)}
                                      onChange={() => {
                                        if (selectedSeasons.includes(seas.name)) {
                                          setSelectedSeasons(selectedSeasons.filter(x => x !== seas.name));
                                        } else {
                                          setSelectedSeasons([...selectedSeasons, seas.name]);
                                        }
                                      }}
                                      className="w-4 h-4 rounded border-gray-300 text-[#B2AC88] focus:ring-[#B2AC88]" 
                                    />
                                    <span>{seas.name}</span>
                                  </label>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                      </div>
                    </motion.aside>
                  )}
                </AnimatePresence>

                {/* Right Area - Grid Content */}
                <div className="flex-1 flex flex-col space-y-6">
                  {loading ? (
                    <div className="py-24 text-center">
                      <div className="w-8 h-8 border-4 border-[#B2AC88] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                      <p className="text-sm text-gray-500 font-semibold">Loading product catalog...</p>
                    </div>
                  ) : (
                    <>
                      <motion.div 
                        key={currentPage}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.35, ease: 'easeOut' }}
                        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
                      >
                        <AnimatePresence mode="popLayout">
                          {paginatedProducts.map((product, index) => {
                            return (
                              <motion.div
                                key={product.id}
                                custom={index}
                                variants={{
                                  hidden: { opacity: 0, y: 50, scale: 0.95 },
                                  visible: (i) => ({
                                    opacity: 1,
                                    y: 0,
                                    scale: 1,
                                    transition: {
                                      duration: 0.5,
                                      ease: [0.25, 0.46, 0.45, 0.94],
                                      delay: (i % 4) * 0.07
                                    }
                                  })
                                }}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: false, amount: 0.08 }}
                                whileHover={{ y: -5, boxShadow: '0 16px 40px rgba(0,0,0,0.10)' }}
                                exit={{ opacity: 0, y: -16, scale: 0.95, transition: { duration: 0.22 } }}
                                onClick={() => handleCardClick(product)}
                                className="group cursor-pointer flex flex-col bg-white border border-gray-100 p-3 rounded-3xl transition-colors duration-300 relative overflow-hidden"
                              >
                                 {/* Product Corner Badges */}
                                 <div className="absolute top-5 left-5 z-10 flex flex-col items-start gap-1">
                                   {product.discount > 0 && (
                                     <div className="text-[8px] font-bold uppercase tracking-widest px-2.5 py-1 bg-red-500 text-white rounded-full shadow-xs">
                                       {product.discount}% OFF
                                     </div>
                                   )}
                                   {parseJsonArray(product.badge).map((b) => (
                                     <div 
                                       key={b}
                                       className={`text-[8px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full shadow-xs ${
                                         b === 'New' ? 'bg-[#B2AC88] text-white' :
                                         b === 'Bestseller' ? 'bg-[#36454F] text-white' : 'bg-[#C08081] text-white'
                                       }`}
                                     >
                                       {b}
                                     </div>
                                   ))}
                                 </div>

                                 {/* Action Buttons always visible top-right */}
                                 <div className="absolute top-5 right-5 z-10 flex flex-col space-y-2">
                                   <button 
                                     onClick={(e) => { 
                                       e.stopPropagation(); 
                                       handleToggleWishlistClick(product, e);
                                     }}
                                     className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-xs border border-gray-50 transition-all hover:scale-105 cursor-pointer"
                                   >
                                     <Heart 
                                       size={13} 
                                       className={likedProducts.includes(product.id) ? "fill-red-500 text-red-500" : "text-gray-400 hover:text-red-500"} 
                                     />
                                   </button>
                                   <button 
                                     onClick={(e) => {
                                       e.stopPropagation();
                                       if (cart.some(item => item.id === product.id)) {
                                         handleRemoveFromCartClick(product, e);
                                       } else {
                                         handleAddToCartClick(product, e);
                                       }
                                     }}
                                     className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-xs border border-gray-50 transition-all hover:scale-105 cursor-pointer"
                                   >
                                     <ShoppingBag 
                                       size={13} 
                                       className={cart.some(item => item.id === product.id) ? "fill-[#C08081] text-[#C08081]" : "text-gray-400 hover:text-[#C08081]"}
                                     />
                                   </button>
                                 </div>

                                {/* Product Image Box */}
                                <div className="w-full aspect-[3/4] rounded-2xl mb-4 relative overflow-hidden flex items-center justify-center transition-all bg-[#f9fafb] border border-gray-100/50">
                                  {(product.image || product.image_url) ? (
                                    <img 
                                      src={product.image || product.image_url} 
                                      alt={product.name} 
                                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103" 
                                    />
                                  ) : (
                                    <span className="text-gray-300 font-serif text-md tracking-widest uppercase rotate-[-25deg] select-none opacity-80 font-bold">
                                      {parseJsonArray(product.category).join(', ')}
                                    </span>
                                  )}
                                </div>

                                {/* Product Details Centered */}
                                <div className="space-y-1 text-center pb-2">
                                  <h3 className="font-bold text-[#36454F] text-[15px] group-hover:text-[#B2AC88] transition-colors">
                                    {product.name}
                                  </h3>
                                  <p className="text-xs font-semibold text-gray-400">
                                    {product.discount > 0 ? (
                                      <span className="flex items-center justify-center space-x-1.5">
                                        <span className="line-through text-gray-300">
                                          {product.price.toLocaleString()} IQD
                                        </span>
                                        <span className="text-[#36454F] font-bold">
                                          {Math.round(product.price * (1 - product.discount / 100)).toLocaleString()} IQD
                                        </span>
                                      </span>
                                    ) : (
                                      <span>{product.price.toLocaleString()} IQD</span>
                                    )}
                                  </p>
                                </div>
                              </motion.div>
                            );
                          })}
                        </AnimatePresence>
                      </motion.div>

                      {/* Pagination Controls */}
                      {filteredProducts.length > 12 && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: false, amount: 0.5 }}
                          transition={{ duration: 0.4, ease: 'easeOut' }}
                          className="flex items-center justify-center space-x-4 mt-10"
                        >
                          {/* Prev Button */}
                          <button
                            type="button"
                            disabled={currentPage === 0}
                            onClick={() => {
                              setCurrentPage(prev => Math.max(0, prev - 1));
                              window.scrollTo(0, 0);
                            }}
                            className="p-1.5 border border-[#C08081] text-[#C08081] hover:bg-[#C08081]/10 disabled:opacity-30 disabled:cursor-not-allowed rounded-full transition-all cursor-pointer flex items-center justify-center"
                            aria-label="Previous Page"
                          >
                            <ChevronLeft size={16} />
                          </button>

                          {/* Dots */}
                          <div className="flex items-center space-x-2.5">
                            {[...Array(pageCount)].map((_, i) => {
                              const isActive = currentPage === i;
                              return (
                                <button
                                  key={i}
                                  onClick={() => {
                                    setCurrentPage(i);
                                    window.scrollTo(0, 0);
                                  }}
                                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                                    isActive 
                                      ? 'bg-[#C08081] scale-110 shadow-xs' 
                                      : 'border border-[#C08081] bg-transparent hover:bg-[#C08081]/15'
                                  }`}
                                  aria-label={`Go to page ${i + 1}`}
                                />
                              );
                            })}
                          </div>

                          {/* Next Button */}
                          <button
                            type="button"
                            disabled={currentPage === pageCount - 1}
                            onClick={() => {
                              setCurrentPage(prev => Math.min(pageCount - 1, prev + 1));
                              window.scrollTo(0, 0);
                            }}
                            className="p-1.5 border border-[#C08081] text-[#C08081] hover:bg-[#C08081]/10 disabled:opacity-30 disabled:cursor-not-allowed rounded-full transition-all cursor-pointer flex items-center justify-center"
                            aria-label="Next Page"
                          >
                            <ChevronRight size={16} />
                          </button>
                        </motion.div>
                      )}

                      {/* Empty Search State */}
                      {filteredProducts.length === 0 && (
                        <motion.div 
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex flex-col items-center justify-center py-24 text-center bg-white/60 backdrop-blur-md rounded-3xl border border-gray-100"
                        >
                          <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-xs border border-gray-100 mb-4">
                             <Search className="text-gray-400" size={24} />
                          </div>
                          <h3 className="text-md font-bold text-[#36454F] uppercase tracking-wider">No products found</h3>
                          <p className="text-xs text-gray-500 mt-1 max-w-xs leading-relaxed">
                            We couldn't find any socks matching your search criteria. Try modifying your filters or clear all values.
                          </p>
                          <button 
                            onClick={handleResetFilters}
                            className="mt-6 px-6 py-2.5 bg-[#B2AC88] hover:bg-[#36454F] text-white text-[10px] font-bold uppercase tracking-wider rounded-full transition-colors cursor-pointer shadow-sm active:scale-95"
                          >
                            Clear All Filters
                          </button>
                        </motion.div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          ) : (
            /* Premium Animated Product Detail Screen */
            <motion.div
              key="detail"
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -60 }}
              transition={{ type: "spring", stiffness: 350, damping: 26 }}
              className="bg-white border border-gray-100 rounded-3xl p-6 md:p-12 shadow-md relative overflow-hidden font-sans text-brand-charcoal"
            >
              
              {/* Top back navigation */}
              <button
                onClick={() => {
                  if (initialViewingProduct) {
                    onBackToHome();
                  } else {
                    setViewingProduct(null);
                  }
                }}
                className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-[#B2AC88] hover:text-[#36454F] transition-colors mb-8 cursor-pointer group"
              >
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform duration-300" />
                <span>
                  {initialViewingProduct
                    ? (previousView === 'wishlist' ? 'Back to Wishlist' : previousView === 'cart' ? 'Back to Your Cart' : previousView === 'story' ? 'Back to Our Story' : previousView === 'contact' ? 'Back to Contact' : 'Back to Home')
                    : 'Back to Catalog'}
                </span>
              </button>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                
                {/* Left Side: Dynamic Image Gallery */}
                <div className="lg:col-span-5 flex flex-col items-center">
                  <motion.div 
                    layoutId={`img-box-${viewingProduct.id}`}
                    className={`w-full aspect-[3/4] rounded-2xl relative shadow-md flex items-center justify-center border border-gray-50 overflow-hidden ${
                      (viewingProduct.image || viewingProduct.image_url) ? 'bg-gray-50' : (viewingProduct.bgFallback || 'bg-brand-beige')
                    }`}
                  >
                    {/* Glowing highlight ring based on selected active color */}
                    <div className="absolute inset-0 border-[6px] border-white/95 rounded-2xl pointer-events-none z-10" />

                    {(viewingProduct.image || viewingProduct.image_url) ? (
                      <img 
                        src={viewingProduct.image || viewingProduct.image_url} 
                        alt={viewingProduct.name} 
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" 
                      />
                    ) : (
                      <span className="text-[#36454F]/20 font-serif text-3xl font-bold tracking-widest uppercase rotate-[-20deg]">
                        {viewingProduct.category}
                      </span>
                    )}

                    {viewingProduct.badge && (
                      <span className="absolute top-4 left-4 z-10 text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 bg-[#36454F] text-white rounded-full">
                        {viewingProduct.badge}
                      </span>
                    )}
                  </motion.div>

                  {/* Thumbnail Previews */}
                  <div className="flex space-x-3 mt-4 w-full">
                    {[...Array(3)].map((_, index) => (
                      <div 
                        key={index}
                        className={`w-1/3 aspect-[4/3] rounded-lg border-2 flex items-center justify-center overflow-hidden cursor-pointer bg-gray-50 ${
                          index === 0 ? 'border-[#B2AC88]' : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {(viewingProduct.image || viewingProduct.image_url) ? (
                          <img src={viewingProduct.image || viewingProduct.image_url} alt="" className="w-full h-full object-cover opacity-80" />
                        ) : (
                          <span className="text-[10px] font-bold text-gray-300">Angle {index+1}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Side: Product Details & Purchase Form */}
                <div className="lg:col-span-7 flex flex-col">
                  
                  {/* Category & Product Name */}
                  <span className="text-xs font-bold text-[#B2AC88] uppercase tracking-widest mb-1.5">{viewingProduct.category} socks</span>
                  <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#1a365d] italic leading-tight mb-2">
                    {viewingProduct.name}
                  </h2>

                  {/* Localized Price with Discount Support */}
                  <div className="flex items-center space-x-3 mb-6">
                    {viewingProduct.discount > 0 ? (
                      <>
                        <span className="text-2xl font-bold text-[#36454F]">
                          {Math.round(viewingProduct.price * (1 - viewingProduct.discount / 100)).toLocaleString()} IQD
                        </span>
                        <span className="text-sm font-semibold line-through text-gray-400">
                          {viewingProduct.price.toLocaleString()} IQD
                        </span>
                        <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                          {viewingProduct.discount}% OFF
                        </span>
                      </>
                    ) : (
                      <span className="text-2xl font-bold text-[#36454F]">
                        {viewingProduct.price.toLocaleString()} IQD
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-500 leading-relaxed max-w-xl mb-6">
                    {viewingProduct.description || viewingProduct.desc || ''}
                  </p>

                  {/* Specifications Grid */}
                  <div className="grid grid-cols-2 gap-4 border border-gray-150 bg-gray-50/50 p-4 rounded-2xl mb-6 text-xs text-[#36454F] font-sans">
                    <div>
                      <span className="text-gray-400 font-medium block">Style / Length</span>
                      <span className="font-bold">{parseJsonArray(viewingProduct.style_length).join(', ') || 'Standard'}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 font-medium block">Material</span>
                      <span className="font-bold">{parseJsonArray(viewingProduct.material).join(', ') || 'Cotton blend'}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 font-medium block">Seasonal Type</span>
                      <span className="font-bold">{parseJsonArray(viewingProduct.seasonal_type).join(', ') || 'All Season'}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 font-medium block">Size Collection</span>
                      <span className="font-bold">{parseJsonArray(viewingProduct.size_collection).join(', ') || 'One Size'}</span>
                    </div>
                    {parseJsonArray(viewingProduct.promotion).filter(p => p !== 'None' && p !== '').length > 0 && (
                      <div className="col-span-2 bg-[#B2AC88]/10 p-2.5 rounded-xl border border-[#B2AC88]/20 flex items-center justify-between mt-1">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-[#B2AC88]">Active Promo</span>
                        <span className="font-bold text-[#36454F]">
                          {parseJsonArray(viewingProduct.promotion).filter(p => p !== 'None' && p !== '').join(', ')}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="h-px bg-gray-100 w-full mb-6" />

                  {/* Form fields */}
                  <div className="space-y-6">
                    
                    {/* Swatch Selector */}
                    <div>
                      <div className="flex justify-between text-xs font-bold uppercase tracking-wider mb-2.5">
                        <span className="text-gray-400">Select Color Family</span>
                        <span className="text-[#36454F] font-semibold">
                          {viewingProduct.colorNames ? viewingProduct.colorNames[detailColorIndex] : `Color option ${detailColorIndex + 1}`}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3.5">
                        {viewingProduct.colors.map((colorClass, idx) => (
                          <button
                            key={idx}
                            onClick={() => setDetailColorIndex(idx)}
                            style={getColorStyle(colorClass)}
                            className={`w-8 h-8 rounded-full border cursor-pointer hover:scale-110 active:scale-90 transition-transform relative flex items-center justify-center ${colorClass.startsWith('#') ? '' : colorClass} ${
                              detailColorIndex === idx 
                                ? 'ring-2 ring-offset-2 ring-[#B2AC88] border-transparent' 
                                : 'border-gray-200'
                            }`}
                          >
                            {detailColorIndex === idx && <Check size={14} className="text-white mix-blend-difference" />}
                          </button>
                        ))}
                      </div>
                    </div>


                    {/* Stock Alert Warning Status */}
                    <div>
                      {viewingProduct.stock !== undefined && (
                        viewingProduct.stock === 0 ? (
                          <div className="bg-red-50 border border-red-200/40 text-red-650 rounded-2xl p-4 text-xs font-bold flex items-center space-x-2.5 font-sans">
                            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                            <span>Out of Stock - Temporarily Unavailable</span>
                          </div>
                        ) : viewingProduct.stock <= 5 ? (
                          <div className="bg-amber-50 border border-amber-200/40 text-amber-700 rounded-2xl p-4 text-xs font-bold flex items-center space-x-2.5 font-sans">
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
                            <span>Only {viewingProduct.stock} pairs left in stock! Order soon.</span>
                          </div>
                        ) : (
                          <div className="bg-green-50 border border-green-200/40 text-green-700 rounded-2xl p-4 text-xs font-bold flex items-center space-x-2.5 font-sans">
                            <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                            <span>In Stock (Ready to dispatch)</span>
                          </div>
                        )
                      )}
                    </div>

                    {/* Quantity & CTA Addition */}
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 pt-2">
                      
                      {/* Quantity counter */}
                      <div className="flex items-center justify-between border border-gray-200 rounded-full w-32 p-1 shrink-0 bg-white">
                        <button
                          type="button"
                          disabled={viewingProduct.stock === 0}
                          onClick={() => setDetailQuantity(prev => Math.max(1, prev - 1))}
                          className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 cursor-pointer transition-colors active:scale-90 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="font-bold text-sm text-[#36454F] select-none min-w-[20px] text-center">
                          {viewingProduct.stock === 0 ? 0 : detailQuantity}
                        </span>
                        <button
                          type="button"
                          disabled={viewingProduct.stock === 0 || detailQuantity >= (viewingProduct.stock || 10)}
                          onClick={() => setDetailQuantity(prev => Math.min(viewingProduct.stock || 10, prev + 1))}
                          className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 cursor-pointer transition-colors active:scale-90 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      {/* Add to Bag CTA Button */}
                      {(() => {
                        const isDetailInCart = cart.some(item => item.id === viewingProduct.id);
                        let buttonBgClass = '';
                        let buttonText = 'Add to Cart';

                        if (viewingProduct.stock === 0) {
                          buttonBgClass = 'bg-gray-200 border border-gray-300 text-gray-400 cursor-not-allowed shadow-none hover:bg-gray-200';
                          buttonText = 'Out of Stock';
                        } else if (isDetailInCart) {
                          buttonBgClass = 'bg-[#B2AC88] hover:bg-[#B2AC88]';
                          buttonText = 'Added to Cart';
                        } else if (isDetailRemovedBlue) {
                          buttonBgClass = 'bg-blue-600 hover:bg-[#B2AC88]';
                        } else {
                          buttonBgClass = 'bg-[#36454F] hover:bg-[#B2AC88]';
                        }

                        return (
                          <motion.button
                            type="button"
                            disabled={viewingProduct.stock === 0}
                            onClick={handleDetailAdd}
                            whileHover={viewingProduct.stock === 0 ? {} : { scale: 1.03 }}
                            whileTap={viewingProduct.stock === 0 ? {} : { scale: 0.97 }}
                            className={`flex-grow py-3.5 px-8 text-white font-bold text-xs uppercase tracking-wider rounded-full shadow-md flex items-center justify-center space-x-2.5 cursor-pointer transition-all duration-300 ${buttonBgClass}`}
                          >
                            <ShoppingBag size={16} />
                            <span>{buttonText}</span>
                          </motion.button>
                        );
                      })()}

                      {/* Toggle Wishlist Heart Button */}
                      <button
                        type="button"
                        onClick={() => onToggleWishlist(viewingProduct.id)}
                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer shrink-0 hover:scale-105 active:scale-95 ${
                          likedProducts.includes(viewingProduct.id)
                            ? 'bg-[#C08081] border border-[#C08081] text-white hover:bg-[#C08081]/90 shadow-sm'
                            : 'bg-white border border-gray-200 text-gray-450 hover:border-[#C08081] hover:bg-[#C08081]/5'
                        }`}
                      >
                        <Heart 
                          size={18} 
                          className={likedProducts.includes(viewingProduct.id) ? "fill-white text-white" : "text-gray-450 hover:text-[#C08081]"}
                        />
                      </button>
                    </div>

                  </div>



                </div>

              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
