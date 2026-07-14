import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Upload,
  DollarSign,
  FileText,
  Tag,
  Image as ImageIcon,
  AlertTriangle,
  Package,
  Settings,
  BarChart2,
  TrendingUp,
  AlertCircle,
  Layers,
  Store,
  ArrowLeft,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Link as LinkIcon,
  ShoppingBag,
  Eye,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  Check,
  User,
  ChevronDown,
} from "lucide-react";

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

const parseJsonArray = (val) => {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  try {
    const parsed = JSON.parse(val);
    return Array.isArray(parsed) ? parsed : [val];
  } catch {
    return [val];
  }
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

const BadgeIcon = ({ type }) => {
  if (type === "New") return <Tag size={12} className="text-blue-500" />;
  if (type === "Trending")
    return <TrendingUp size={12} className="text-orange-500" />;
  if (type === "Bestseller")
    return <CheckCircle size={12} className="text-emerald-500" />;
  if (type === "Sale")
    return <DollarSign size={12} className="text-red-500" />;
  return <Tag size={12} className="text-gray-400" />;
};

const MultiSelectDropdown = ({ 
  options, 
  selectedValues, 
  onChange, 
  placeholder, 
  error, 
  renderOption = (opt) => opt.name || opt, 
  valueKey = "name",
  icon: Icon
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOption = (value) => {
    if (selectedValues.includes(value)) {
      onChange(selectedValues.filter(v => v !== value));
    } else {
      onChange([...selectedValues, value]);
    }
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div 
        className={`w-full border px-4 py-2.5 rounded-xl text-sm bg-white shadow-xs cursor-pointer flex justify-between items-center transition-all ${
          error ? "border-red-400 bg-red-50/30 ring-2 ring-red-200" : "border-slate-200 hover:border-[#B2AC88]"
        }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2 truncate">
          {Icon && <Icon size={14} className="text-gray-400" />}
          <span className="truncate text-slate-700 font-medium">
             {selectedValues.length > 0 ? `${selectedValues.length} selected` : placeholder}
          </span>
        </div>
        <ChevronDown size={16} className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </div>
      
      <AnimatePresence>
        {isOpen && (
           <motion.div
             initial={{ opacity: 0, y: 5 }}
             animate={{ opacity: 1, y: 0 }}
             exit={{ opacity: 0, y: 5 }}
             transition={{ duration: 0.15 }}
             className="absolute z-50 w-full mt-2 bg-white border border-slate-100 rounded-xl shadow-xl max-h-60 overflow-y-auto"
           >
             {options.map((opt, i) => {
               const val = valueKey ? opt[valueKey] : opt;
               const isSelected = selectedValues.includes(val);
               return (
                 <div 
                   key={i} 
                   onClick={() => toggleOption(val)}
                   className="flex items-center px-4 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-0 transition-colors"
                 >
                   <div className={`w-5 h-5 rounded border flex items-center justify-center mr-3 transition-colors shrink-0 ${isSelected ? 'bg-[#36454F] border-[#36454F]' : 'border-slate-300'}`}>
                     {isSelected && <Check size={14} className="text-white" />}
                   </div>
                   <div className="text-sm text-slate-700 font-medium truncate">
                     {renderOption(opt)}
                   </div>
                 </div>
               );
             })}
           </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const getEnglishName = (val) => {
  if (!val) return "";
  let currentVal = val;
  for (let i = 0; i < 3; i++) {
    try {
      if (typeof currentVal !== 'string') break;
      const parsed = JSON.parse(currentVal);
      if (typeof parsed === 'object' && parsed !== null) {
        return parsed.en || parsed.EN || parsed.ku || parsed.KU || parsed.ar || parsed.AR || val;
      }
      currentVal = parsed;
    } catch {
      break;
    }
  }
  return currentVal;
};

const sortNewestFirst = (arr) => {
  if (!Array.isArray(arr)) return [];
  return [...arr].sort((a, b) => {
    const numA = Number(a.id);
    const numB = Number(b.id);
    if (!isNaN(numA) && !isNaN(numB)) {
      return numB - numA;
    }
    return String(b.id || "").localeCompare(String(a.id || ""));
  });
};

const LangTextInput = ({
  label,
  valueEn,
  valueKu,
  valueAr,
  onChangeEn,
  onChangeKu,
  onChangeAr,
  placeholder = "",
  required = false,
  type = "input",
  error = false,
  errorMessage = ""
}) => {
  return (
    <div className="space-y-3 bg-slate-50/50 p-4 rounded-2xl border border-slate-200">
      {label && (
        <span className="block text-base font-bold uppercase text-slate-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </span>
      )}
      <div className={type === "textarea" ? "space-y-4" : "grid grid-cols-3 gap-3"}>
        {/* English */}
        <div>
          <label className="text-sm uppercase font-bold text-slate-600 block mb-1">English</label>
          {type === "textarea" ? (
            <textarea
              rows="2"
              value={valueEn}
              onChange={(e) => onChangeEn(e.target.value)}
              placeholder=""
              className={`w-full border px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B2AC88]/20 focus:border-[#B2AC88] text-black bg-white transition-all resize-none font-medium ${
                error && !valueEn.trim() ? "border-red-400 bg-red-50/30" : "border-slate-200"
              }`}
            />
          ) : (
            <input
              type="text"
              value={valueEn}
              onChange={(e) => onChangeEn(e.target.value)}
              placeholder=""
              className={`w-full border px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B2AC88]/20 focus:border-[#B2AC88] text-black bg-white transition-all font-medium ${
                error && !valueEn.trim() ? "border-red-400 bg-red-50/30" : "border-slate-200"
              }`}
            />
          )}
        </div>

        {/* Kurdish */}
        <div>
          <label className="text-sm uppercase font-bold text-slate-600 block mb-1">کوردی</label>
          {type === "textarea" ? (
            <textarea
              rows="2"
              dir="rtl"
              value={valueKu}
              onChange={(e) => onChangeKu(e.target.value.replace(/[a-zA-Z]/g, ''))}
              placeholder=""
              className={`w-full border px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B2AC88]/20 focus:border-[#B2AC88] text-black bg-white transition-all resize-none font-medium ${
                error && !valueKu.trim() ? "border-red-400 bg-red-50/30" : "border-slate-200"
              }`}
            />
          ) : (
            <input
              type="text"
              dir="rtl"
              value={valueKu}
              onChange={(e) => onChangeKu(e.target.value.replace(/[a-zA-Z]/g, ''))}
              placeholder=""
              className={`w-full border px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B2AC88]/20 focus:border-[#B2AC88] text-black bg-white transition-all font-medium ${
                error && !valueKu.trim() ? "border-red-400 bg-red-50/30" : "border-slate-200"
              }`}
            />
          )}
        </div>

        {/* Arabic */}
        <div>
          <label className="text-sm uppercase font-bold text-slate-600 block mb-1">عرەبی</label>
          {type === "textarea" ? (
            <textarea
              rows="2"
              dir="rtl"
              value={valueAr}
              onChange={(e) => onChangeAr(e.target.value.replace(/[a-zA-Z]/g, ''))}
              placeholder=""
              className={`w-full border px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B2AC88]/20 focus:border-[#B2AC88] text-black bg-white transition-all resize-none font-medium ${
                error && !valueAr.trim() ? "border-red-400 bg-red-50/30" : "border-slate-200"
              }`}
            />
          ) : (
            <input
              type="text"
              dir="rtl"
              value={valueAr}
              onChange={(e) => onChangeAr(e.target.value.replace(/[a-zA-Z]/g, ''))}
              placeholder=""
              className={`w-full border px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B2AC88]/20 focus:border-[#B2AC88] text-black bg-white transition-all font-medium ${
                error && !valueAr.trim() ? "border-red-400 bg-red-50/30" : "border-slate-200"
              }`}
            />
          )}
        </div>
      </div>
      {error && (!valueEn.trim() || !valueKu.trim() || !valueAr.trim()) && (
        <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider mt-1.5 ml-1">
          {errorMessage || "All language inputs are required"}
        </p>
      )}
    </div>
  );
};


export default function AdminDashboard({ currentUserEmail, currentUserRole, currentUserStoreName, onBackToHome, onLogout, onViewProduct, onViewStore }) {
  const [activeTab, setActiveTab] = useState("inventory");
  const [storeFilter, setStoreFilter] = useState(null);
  const [products, setProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewOnly, setIsViewOnly] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const lastTouchedIdRef = useRef(null); // tracks most recently saved/updated product id

  // Multi-vendor States
  const [stores, setStores] = useState([]);
  const [orders, setOrders] = useState([]);
  const [vendorOrderTab, setVendorOrderTab] = useState("Pending");
  const [orderToConfirm, setOrderToConfirm] = useState(null);
  const [paymentToConfirm, setPaymentToConfirm] = useState(null);
  const [adminStats, setAdminStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalStores: 0,
    activeStores: 0,
    pendingStores: 0,
    suspendedStores: 0
  });
  const [vendorStats, setVendorStats] = useState({
    totalSales: 0,
    itemsSold: 0,
    totalOrders: 0,
    totalProducts: 0,
    productSales: []
  });
  const [storeInfo, setStoreInfo] = useState(null);
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);
  const [editingStore, setEditingStore] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [showDashboardLogoutConfirm, setShowDashboardLogoutConfirm] = useState(false);
  const [storeFormErrors, setStoreFormErrors] = useState({});
  const lastTouchedStoreIdRef = useRef(null);
  const [productStoreId, setProductStoreId] = useState("");
  const [selectedStoreFilter, setSelectedStoreFilter] = useState("");

  // Store form states
  const [storeNameEn, setStoreNameEn] = useState("");
  const [storeNameKu, setStoreNameKu] = useState("");
  const [storeNameAr, setStoreNameAr] = useState("");
  const [storeDescriptionEn, setStoreDescriptionEn] = useState("");
  const [storeDescriptionKu, setStoreDescriptionKu] = useState("");
  const [storeDescriptionAr, setStoreDescriptionAr] = useState("");
  const [storeOwnerName, setStoreOwnerName] = useState("");
  const [storeEmail, setStoreEmail] = useState("");
  const [storePhone, setStorePhone] = useState("+964");
  const [storeCityEn, setStoreCityEn] = useState("");
  const [storeCityKu, setStoreCityKu] = useState("");
  const [storeCityAr, setStoreCityAr] = useState("");
  const [storeAddress, setStoreAddress] = useState("");
  const [storePassword, setStorePassword] = useState("");
  const [showStorePassword, setShowStorePassword] = useState(false);
  const [storeCommission, setStoreCommission] = useState(0);
  const [storeSocialLinks, setStoreSocialLinks] = useState({
    facebook: "",
    instagram: "",
    tiktok: "",
  });
  const [storeLogoFile, setStoreLogoFile] = useState(null);
  const [storeLogoPreview, setStoreLogoPreview] = useState("");
  const [storeBannerFile, setStoreBannerFile] = useState(null);
  const [storeBannerPreview, setStoreBannerPreview] = useState("");

  // Settings configuration states (seeded with default fallbacks)
  const [categories, setCategories] = useState([
    { id: "animals", name: "Animals" },
    { id: "fruits", name: "Fruits" },
    { id: "patterns", name: "Patterns" },
    { id: "cozy_crew", name: "Cozy Crew" },
  ]);
  const [badges, setBadges] = useState([
    { id: "bestseller", name: "Bestseller" },
    { id: "new", name: "New" },
    { id: "sale", name: "Sale" },
  ]);
  const [colorsList, setColorsList] = useState([
    {
      id: "beige",
      class: "bg-[#F5F5DC]",
      name: "Classic Beige",
      family: "beige",
    },
    { id: "sage", class: "bg-[#B2AC88]", name: "Sage Green", family: "sage" },
    {
      id: "slate",
      class: "bg-[#36454F]",
      name: "Charcoal Slate",
      family: "slate",
    },
    { id: "rose", class: "bg-[#C08081]", name: "Dusk Rose", family: "rose" },
    {
      id: "yellow",
      class: "bg-yellow-400",
      name: "Lemon Yellow",
      family: "yellow",
    },
    {
      id: "green",
      class: "bg-emerald-600",
      name: "Avocado Green",
      family: "green",
    },
    {
      id: "purple",
      class: "bg-purple-400",
      name: "Soft Lavender",
      family: "purple",
    },
    {
      id: "orange",
      class: "bg-orange-500",
      name: "Citrus Orange",
      family: "orange",
    },
  ]);

  const [styles, setStyles] = useState([
    { id: "crew", name: "Crew" },
    { id: "ankle", name: "Ankle" },
    { id: "no_show", name: "No Show" },
    { id: "knee_high", name: "Knee High" },
  ]);
  const [materials, setMaterials] = useState([
    { id: "cotton", name: "Cotton" },
    { id: "bamboo", name: "Bamboo" },
    { id: "wool", name: "Wool" },
    { id: "polyester", name: "Polyester" },
  ]);
  const [seasons, setSeasons] = useState([
    { id: "winter", name: "Winter" },
    { id: "summer", name: "Summer" },
    { id: "spring", name: "Spring" },
    { id: "autumn", name: "Autumn" },
    { id: "all_season", name: "All Season" },
  ]);
  const [sizes, setSizes] = useState([
    { id: "one_size", name: "One Size" },
    { id: "35-38", name: "35-38" },
    { id: "39-42", name: "39-42" },
    { id: "43-46", name: "43-46" },
  ]);
  const [promotions, setPromotions] = useState([
    { id: "buy_2_get_1_free", name: "Buy 2 Get 1 Free" },
    { id: "new_season_promo", name: "New Season Promo" },
  ]);

  const [settingsSubTab, setSettingsSubTab] = useState("categories"); // 'categories', 'badges', 'colors', 'styles', 'materials', 'seasons', 'sizes', 'promotions'
  const [settingsPage, setSettingsPage] = useState(1);
  const [cancellationLimit, setCancellationLimit] = useState(15);
  const [citiesList, setCitiesList] = useState([]);
  const [newCityEn, setNewCityEn] = useState("");
  const [newCityKu, setNewCityKu] = useState("");
  const [newCityAr, setNewCityAr] = useState("");
  const [newCityLat, setNewCityLat] = useState("33.3152");
  const [newCityLng, setNewCityLng] = useState("44.3661");
  const [cityToDelete, setCityToDelete] = useState(null);

  // local form states for settings languages
  const [newCatEn, setNewCatEn] = useState("");
  const [newCatKu, setNewCatKu] = useState("");
  const [newCatAr, setNewCatAr] = useState("");

  const [newBadgeEn, setNewBadgeEn] = useState("");
  const [newBadgeKu, setNewBadgeKu] = useState("");
  const [newBadgeAr, setNewBadgeAr] = useState("");

  const [newColorEn, setNewColorEn] = useState("");
  const [newColorKu, setNewColorKu] = useState("");
  const [newColorAr, setNewColorAr] = useState("");

  const [newStyleEn, setNewStyleEn] = useState("");
  const [newStyleKu, setNewStyleKu] = useState("");
  const [newStyleAr, setNewStyleAr] = useState("");

  const [newMatEn, setNewMatEn] = useState("");
  const [newMatKu, setNewMatKu] = useState("");
  const [newMatAr, setNewMatAr] = useState("");

  const [newSeasonEn, setNewSeasonEn] = useState("");
  const [newSeasonKu, setNewSeasonKu] = useState("");
  const [newSeasonAr, setNewSeasonAr] = useState("");

  const [newSizeEn, setNewSizeEn] = useState("");
  const [newSizeKu, setNewSizeKu] = useState("");
  const [newSizeAr, setNewSizeAr] = useState("");

  const [newPromoEn, setNewPromoEn] = useState("");
  const [newPromoKu, setNewPromoKu] = useState("");
  const [newPromoAr, setNewPromoAr] = useState("");

  useEffect(() => {
    setSettingsPage(1);
  }, [settingsSubTab]);

  const renderSettingsPagination = (totalItems) => {
    const totalPages = Math.ceil(totalItems / 10);
    if (totalPages <= 1) return null;
    return (
      <div className="flex items-center justify-center space-x-2 mt-4 pt-4 border-t border-slate-100">
        <button
          onClick={() => setSettingsPage(prev => Math.max(1, prev - 1))}
          disabled={settingsPage === 1}
          className="p-1.5 rounded-lg border border-slate-200 text-slate-500 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        <div className="flex items-center space-x-1.5">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setSettingsPage(page)}
              className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center cursor-pointer transition-colors ${
                settingsPage === page 
                  ? 'bg-[#B2AC88] text-white' 
                  : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              {page}
            </button>
          ))}
        </div>
        <button
          onClick={() => setSettingsPage(prev => Math.min(totalPages, prev + 1))}
          disabled={settingsPage === totalPages}
          className="p-1.5 rounded-lg border border-slate-200 text-slate-500 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
        </button>
      </div>
    );
  };

  // Form Fields State
  const [nameEn, setNameEn] = useState("");
  const [nameKu, setNameKu] = useState("");
  const [nameAr, setNameAr] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState([]);
  const [badge, setBadge] = useState([]);
  const [descEn, setDescEn] = useState("");
  const [descKu, setDescKu] = useState("");
  const [descAr, setDescAr] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [sizeColors, setSizeColors] = useState({});

  const [styleLength, setStyleLength] = useState([]);
  const [stock, setStock] = useState(0);
  const [promotion, setPromotion] = useState([]);
  const [material, setMaterial] = useState([]);
  const [seasonalType, setSeasonalType] = useState([]);
  const [sizeCollection, setSizeCollection] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [gender, setGender] = useState("");
  const [dashboardPage, setDashboardPage] = useState(1);
  const [storesPage, setStoresPage] = useState(1);
  const [ordersPage, setOrdersPage] = useState(1);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [toastMessage, setToastMessage] = useState("");
  // Validation error state
  const [validationError, setValidationError] = useState("");
  const [showValidation, setShowValidation] = useState(false);
  // Product deletion confirm state
  const [productToDelete, setProductToDelete] = useState(null);
  // Generic settings confirm modal
  const [confirmModal, setConfirmModal] = useState({ open: false, message: '', onConfirm: null });
  const [showUnsavedChangesConfirm, setShowUnsavedChangesConfirm] = useState({ open: false, onConfirm: null });
  const [inUseModal, setInUseModal] = useState({ open: false, itemName: '', usedIn: [] });

  // Settings form helper states
  const [colorValue, setColorValue] = useState("#000000");

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  /**
   * Check if a setting item name is used in any product or order.
   * Returns array of human-readable location strings, or [] if safe to delete.
   * Fields checked per type:
   *   category  → product.category
   *   badge     → product.badge
   *   color     → product.colors  + order item selected_color
   *   style     → product.style_length
   *   material  → product.material
   *   season    → product.seasonal_type
   *   size      → product.size_collection
   *   promotion → product.promotion
   */
  const checkInUse = (type, itemName) => {
    const usedIn = [];
    const inProducts = products.filter((p) => {
      const cats   = parseJsonArray(p.category);
      const badges = parseJsonArray(p.badge);
      const styles = parseJsonArray(p.style_length);
      const mats   = parseJsonArray(p.material);
      const seas   = parseJsonArray(p.seasonal_type);
      const szs    = parseJsonArray(p.size_collection);
      const promos = parseJsonArray(p.promotion);
      const cols   = Array.isArray(p.colors) ? p.colors : [];
      if (type === 'category')  return cats.includes(itemName);
      if (type === 'badge')     return badges.includes(itemName);
      if (type === 'style')     return styles.includes(itemName);
      if (type === 'material')  return mats.includes(itemName);
      if (type === 'season')    return seas.includes(itemName);
      if (type === 'size')      return szs.includes(itemName);
      if (type === 'promotion') return promos.includes(itemName);
      if (type === 'color') {
        // colors stored as css class strings e.g. "bg-red-500"
        const colorObj = colorsList.find(c => c.name === itemName);
        return colorObj ? cols.includes(colorObj.class) : false;
      }
      return false;
    });
    if (inProducts.length > 0) {
      usedIn.push(`${inProducts.length} product${inProducts.length > 1 ? 's' : ''} (e.g. "${inProducts[0].name}")`);
    }
    if (type === 'color') {
      const inOrders = orders.filter(o => {
        const items = Array.isArray(o.items) ? o.items : [];
        return items.some(i => (i.selected_color || '').toLowerCase() === itemName.toLowerCase());
      });
      if (inOrders.length > 0) {
        usedIn.push(`${inOrders.length} order${inOrders.length > 1 ? 's' : ''}`);
      }
    }
    return usedIn;
  };

  /** Check if a specific product is referenced in any order */
  const checkProductInOrders = (product) => {
    const inOrders = orders.filter(o => {
      const items = Array.isArray(o.items) ? o.items : [];
      return items.some(i =>
        (i.product_id && String(i.product_id) === String(product.id)) ||
        (i.product_name && i.product_name === product.name)
      );
    });
    if (inOrders.length > 0) {
      return [`${inOrders.length} order${inOrders.length > 1 ? 's' : ''} (Order #${inOrders[0].order_number || inOrders[0].id})` ];
    }
    return [];
  };

  /** Check if a specific store is referenced in any order */
  const checkStoreInOrders = (store) => {
    const inOrders = orders.filter(o => {
      const items = Array.isArray(o.items) ? o.items : [];
      return items.some(i =>
        (i.store_id && String(i.store_id) === String(store.id)) ||
        (i.store_name && i.store_name === store.name)
      );
    });
    if (inOrders.length > 0) {
      return [`${inOrders.length} order${inOrders.length > 1 ? 's' : ''} (Order #${inOrders[0].order_number || inOrders[0].id})`];
    }
    return [];
  };

  const hasStoreChanges = () => {
    if (editingStore) {
      let origName = { en: "", ku: "", ar: "" };
      let origDesc = { en: "", ku: "", ar: "" };
      let origCity = { en: "", ku: "", ar: "" };
      try {
        if (editingStore.name && editingStore.name.startsWith("{")) origName = JSON.parse(editingStore.name);
        else origName.en = editingStore.name || "";
      } catch (e) {}
      try {
        if (editingStore.description && editingStore.description.startsWith("{")) origDesc = JSON.parse(editingStore.description);
        else origDesc.en = editingStore.description || "";
      } catch (e) {}
      try {
        if (editingStore.city && editingStore.city.startsWith("{")) origCity = JSON.parse(editingStore.city);
        else origCity.en = editingStore.city || "";
      } catch (e) {}

      const origSocial = typeof editingStore.social_links === 'string' ? (JSON.parse(editingStore.social_links) || {}) : (editingStore.social_links || {});
      const socialChanged = ['facebook', 'instagram', 'tiktok'].some(k => (storeSocialLinks[k] || "") !== (origSocial[k] || ""));
      return (
        storeNameEn !== (origName.en || "") ||
        storeNameKu !== (origName.ku || "") ||
        storeNameAr !== (origName.ar || "") ||
        storeDescriptionEn !== (origDesc.en || "") ||
        storeDescriptionKu !== (origDesc.ku || "") ||
        storeDescriptionAr !== (origDesc.ar || "") ||
        storeCityEn !== (origCity.en || "") ||
        storeCityKu !== (origCity.ku || "") ||
        storeCityAr !== (origCity.ar || "") ||
        storeOwnerName !== (editingStore.owner_name || "") ||
        storeEmail !== (editingStore.email || "") ||
        storePhone !== (editingStore.phone || "+964 ") ||
        storeAddress !== (editingStore.address || "") ||
        storePassword !== "" ||
        storeLogoFile !== null ||
        storeBannerFile !== null ||
        Number(storeCommission) !== Number(editingStore.commission_percentage || 0) ||
        socialChanged
      );
    } else {
      return (
        storeNameEn.trim() !== "" ||
        storeNameKu.trim() !== "" ||
        storeNameAr.trim() !== "" ||
        storeDescriptionEn.trim() !== "" ||
        storeDescriptionKu.trim() !== "" ||
        storeDescriptionAr.trim() !== "" ||
        storeCityEn.trim() !== "" ||
        storeCityKu.trim() !== "" ||
        storeCityAr.trim() !== "" ||
        storeOwnerName.trim() !== "" ||
        storeEmail.trim() !== "" ||
        (storePhone.replace(/\s+/g, '') !== '+964') ||
        storeAddress.trim() !== "" ||
        storePassword !== "" ||
        storeLogoFile !== null ||
        storeBannerFile !== null ||
        Object.values(storeSocialLinks).some(v => v && v.trim() !== "")
      );
    }
  };

  const hasProductChanges = () => {
    if (editingProduct) {
      let origName = { en: "", ku: "", ar: "" };
      let origDesc = { en: "", ku: "", ar: "" };
      try {
        if (editingProduct.name && editingProduct.name.startsWith("{")) origName = JSON.parse(editingProduct.name);
        else origName.en = editingProduct.name || "";
      } catch (e) {}
      try {
        if (editingProduct.description && editingProduct.description.startsWith("{")) origDesc = JSON.parse(editingProduct.description);
        else origDesc.en = editingProduct.description || "";
      } catch (e) {}

      const origCategory = parseJsonArray(editingProduct.category);
      const origBadge = parseJsonArray(editingProduct.badge);
      const origStyleLength = parseJsonArray(editingProduct.style_length);
      const origPromotion = parseJsonArray(editingProduct.promotion);
      const origMaterial = parseJsonArray(editingProduct.material);
      const origSeasonalType = parseJsonArray(editingProduct.seasonal_type);
      const origSizeCollection = parseJsonArray(editingProduct.size_collection);
      
      let origSizeColors = {};
      try {
        const parsed = JSON.parse(editingProduct.size_colors || '{}');
        if (typeof parsed === 'object' && !Array.isArray(parsed)) {
          Object.entries(parsed).forEach(([size, classes]) => {
            origSizeColors[size] = classes.map(cls => {
              const col = colorsList.find(c => c.class === cls);
              return col ? col.id : cls;
            });
          });
        }
      } catch(e) {}

      const areArraysEqual = (a, b) => {
        if (a.length !== b.length) return false;
        const sortedA = [...a].sort();
        const sortedB = [...b].sort();
        return sortedA.every((val, index) => val === sortedB[index]);
      };

      const areSizeColorsEqual = (objA, objB) => {
        const keysA = Object.keys(objA);
        const keysB = Object.keys(objB);
        if (keysA.length !== keysB.length) return false;
        for (let key of keysA) {
          const arrA = objA[key] || [];
          const arrB = objB[key] || [];
          if (!areArraysEqual(arrA, arrB)) return false;
        }
        return true;
      };

      return (
        nameEn !== (origName.en || "") ||
        nameKu !== (origName.ku || "") ||
        nameAr !== (origName.ar || "") ||
        String(price) !== String(editingProduct.price || "") ||
        String(productStoreId) !== String(editingProduct.store_id || "") ||
        descEn !== (origDesc.en || "") ||
        descKu !== (origDesc.ku || "") ||
        descAr !== (origDesc.ar || "") ||
        imageFile !== null ||
        !areArraysEqual(category, origCategory) ||
        !areArraysEqual(badge, origBadge) ||
        !areSizeColorsEqual(sizeColors, origSizeColors) ||
        !areArraysEqual(styleLength, origStyleLength) ||
        Number(stock) !== Number(editingProduct.stock || 0) ||
        !areArraysEqual(promotion, origPromotion) ||
        !areArraysEqual(material, origMaterial) ||
        !areArraysEqual(seasonalType, origSeasonalType) ||
        !areArraysEqual(sizeCollection, origSizeCollection) ||
        Number(discount) !== Number(editingProduct.discount || 0) ||
        gender !== (editingProduct.gender || "")
      );
    } else {
      return (
        nameEn.trim() !== "" ||
        nameKu.trim() !== "" ||
        nameAr.trim() !== "" ||
        price !== "" ||
        productStoreId !== "" ||
        category.length > 0 ||
        badge.length > 0 ||
        descEn.trim() !== "" ||
        descKu.trim() !== "" ||
        descAr.trim() !== "" ||
        imageFile !== null ||
        Object.keys(sizeColors).length > 0 ||
        styleLength.length > 0 ||
        Number(stock) !== 0 ||
        promotion.length > 0 ||
        material.length > 0 ||
        seasonalType.length > 0 ||
        sizeCollection.length > 0 ||
        Number(discount) !== 0 ||
        gender !== ""
      );
    }
  };

  const handleCloseProductModal = () => {
    if (!isViewOnly && hasProductChanges()) {
      setShowUnsavedChangesConfirm({
        open: true,
        onConfirm: () => {
          setIsModalOpen(false);
          setShowValidation(false);
        }
      });
    } else {
      setIsModalOpen(false);
      setShowValidation(false);
    }
  };

  const handleCloseStoreModal = () => {
    if (!isViewOnly && hasStoreChanges()) {
      setShowUnsavedChangesConfirm({
        open: true,
        onConfirm: () => {
          setIsStoreModalOpen(false);
          setEditingStore(null);
        }
      });
    } else {
      setIsStoreModalOpen(false);
      setEditingStore(null);
    }
  };

  // Fetch dynamic categories, badges, and colors configuration
  const fetchSettings = async () => {
    // 1. Categories
    try {
      const res = await fetch("/api/settings/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(sortNewestFirst(data));
      } else {
        throw new Error();
      }
    } catch {
      const localCats = localStorage.getItem("hawrisha_categories");
      if (localCats) {
        setCategories(sortNewestFirst(JSON.parse(localCats)));
      } else {
        const defaults = [
          { id: "animals", name: "Animals" },
          { id: "fruits", name: "Fruits" },
          { id: "patterns", name: "Patterns" },
          { id: "cozy_crew", name: "Cozy Crew" },
        ];
        setCategories(defaults);
        localStorage.setItem("hawrisha_categories", JSON.stringify(defaults));
      }
    }

    // 2. Badges
    try {
      const res = await fetch("/api/settings/badges");
      if (res.ok) {
        const data = await res.json();
        setBadges(sortNewestFirst(data));
      } else {
        throw new Error();
      }
    } catch {
      const localBadges = localStorage.getItem("hawrisha_badges");
      if (localBadges) {
        setBadges(sortNewestFirst(JSON.parse(localBadges)));
      } else {
        const defaults = [
          { id: "bestseller", name: "Bestseller" },
          { id: "new", name: "New" },
          { id: "sale", name: "Sale" },
        ];
        setBadges(defaults);
        localStorage.setItem("hawrisha_badges", JSON.stringify(defaults));
      }
    }

    // 3. Colors
    try {
      const res = await fetch("/api/settings/colors");
      if (res.ok) {
        const data = await res.json();
        setColorsList(sortNewestFirst(data));
      } else {
        throw new Error();
      }
    } catch {
      const localColors = localStorage.getItem("hawrisha_colors");
      if (localColors) {
        setColorsList(sortNewestFirst(JSON.parse(localColors)));
      } else {
        const defaults = [
          {
            id: "beige",
            class: "bg-[#F5F5DC]",
            name: "Classic Beige",
            family: "beige",
          },
          {
            id: "sage",
            class: "bg-[#B2AC88]",
            name: "Sage Green",
            family: "sage",
          },
          {
            id: "slate",
            class: "bg-[#36454F]",
            name: "Charcoal Slate",
            family: "slate",
          },
          {
            id: "rose",
            class: "bg-[#C08081]",
            name: "Dusk Rose",
            family: "rose",
          },
          {
            id: "yellow",
            class: "bg-yellow-400",
            name: "Lemon Yellow",
            family: "yellow",
          },
          {
            id: "green",
            class: "bg-emerald-600",
            name: "Avocado Green",
            family: "green",
          },
          {
            id: "purple",
            class: "bg-purple-400",
            name: "Soft Lavender",
            family: "purple",
          },
          {
            id: "orange",
            class: "bg-orange-500",
            name: "Citrus Orange",
            family: "orange",
          },
        ];
        setColorsList(defaults);
        localStorage.setItem("hawrisha_colors", JSON.stringify(defaults));
      }
    }

    // 4. Styles / Lengths
    try {
      const res = await fetch("/api/settings/styles");
      if (res.ok) {
        const data = await res.json();
        setStyles(sortNewestFirst(data));
      } else {
        throw new Error();
      }
    } catch {
      const localStyles = localStorage.getItem("hawrisha_styles");
      if (localStyles) {
        setStyles(sortNewestFirst(JSON.parse(localStyles)));
      } else {
        const defaults = [
          { id: "crew", name: "Crew" },
          { id: "ankle", name: "Ankle" },
          { id: "no_show", name: "No Show" },
          { id: "knee_high", name: "Knee High" },
        ];
        setStyles(defaults);
        localStorage.setItem("hawrisha_styles", JSON.stringify(defaults));
      }
    }

    // 5. Materials
    try {
      const res = await fetch("/api/settings/materials");
      if (res.ok) {
        const data = await res.json();
        setMaterials(sortNewestFirst(data));
      } else {
        throw new Error();
      }
    } catch {
      const localMaterials = localStorage.getItem("hawrisha_materials");
      if (localMaterials) {
        setMaterials(sortNewestFirst(JSON.parse(localMaterials)));
      } else {
        const defaults = [
          { id: "cotton", name: "Cotton" },
          { id: "bamboo", name: "Bamboo" },
          { id: "wool", name: "Wool" },
          { id: "polyester", name: "Polyester" },
        ];
        setMaterials(defaults);
        localStorage.setItem("hawrisha_materials", JSON.stringify(defaults));
      }
    }

    // 6. Seasonal Types
    try {
      const res = await fetch("/api/settings/seasons");
      if (res.ok) {
        const data = await res.json();
        setSeasons(sortNewestFirst(data));
      } else {
        throw new Error();
      }
    } catch {
      const localSeasons = localStorage.getItem("hawrisha_seasons");
      if (localSeasons) {
        setSeasons(sortNewestFirst(JSON.parse(localSeasons)));
      } else {
        const defaults = [
          { id: "winter", name: "Winter" },
          { id: "summer", name: "Summer" },
          { id: "spring", name: "Spring" },
          { id: "autumn", name: "Autumn" },
          { id: "all_season", name: "All Season" },
        ];
        setSeasons(defaults);
        localStorage.setItem("hawrisha_seasons", JSON.stringify(defaults));
      }
    }

    // 7. Size Collections
    try {
      const res = await fetch("/api/settings/sizes");
      if (res.ok) {
        const data = await res.json();
        setSizes(sortNewestFirst(data));
      } else {
        throw new Error();
      }
    } catch {
      const localSizes = localStorage.getItem("hawrisha_sizes");
      if (localSizes) {
        setSizes(sortNewestFirst(JSON.parse(localSizes)));
      } else {
        const defaults = [
          { id: "one_size", name: "One Size" },
          { id: "35-38", name: "35-38" },
          { id: "39-42", name: "39-42" },
          { id: "43-46", name: "43-46" },
        ];
        setSizes(defaults);
        localStorage.setItem("hawrisha_sizes", JSON.stringify(defaults));
      }
    }

    // 8. Promotions
    try {
      const res = await fetch("/api/settings/promotions");
      if (res.ok) {
        const data = await res.json();
        setPromotions(sortNewestFirst(data));
      } else {
        throw new Error();
      }
    } catch {
      const localPromos = localStorage.getItem("hawrisha_promotions");
      if (localPromos) {
        setPromotions(sortNewestFirst(JSON.parse(localPromos)));
      } else {
        const defaults = [
          { id: "buy_2_get_1_free", name: "Buy 2 Get 1 Free" },
          { id: "new_season_promo", name: "New Season Promo" },
        ];
        setPromotions(defaults);
        localStorage.setItem("hawrisha_promotions", JSON.stringify(defaults));
      }
    }

    // 9. System settings (cancellation limit)
    try {
      const res = await fetch("/api/settings/system-settings");
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.settings && data.settings.order_cancellation_limit_minutes) {
          setCancellationLimit(Number(data.settings.order_cancellation_limit_minutes));
        }
      }
    } catch (err) {
      console.error("Error fetching system settings:", err);
    }

    // 10. Cities List
    try {
      const res = await fetch("/api/settings/cities");
      if (res.ok) {
        const data = await res.json();
        setCitiesList(data);
      }
    } catch (err) {
      console.error("Error fetching cities:", err);
    }
  };

  // Fetch products from database
  const fetchProducts = () => {
    setLoading(true);
    const url = currentUserRole === "admin"
      ? "/api/products"
      : `/api/products/vendor?email=${encodeURIComponent(currentUserEmail)}`;

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error("API server offline");
        return res.json();
      })
      .then((data) => {
        // Sort newest (highest id) first, then pin lastTouchedId to very top if it's an update
        const touchedId = lastTouchedIdRef.current;
        const sorted = [...data].sort((a, b) => {
          if (touchedId) {
            if (String(a.id) === touchedId) return -1;
            if (String(b.id) === touchedId) return 1;
          }
          return Number(b.id) - Number(a.id);
        });
        setProducts(sorted);
        setLoading(false);
      })
      .catch((err) => {
        console.warn(
          "Backend offline, using fallback catalog data for display",
          err,
        );
        setProducts([
          {
            id: 2,
            name: "Tabby Cat Mock",
            price: 6250,
            category: "Animals",
            badge: "New",
            description:
              "Brighten your day with these lovable tabby kitten designs.",
            image_url: "/categories/cat2.jpg",
          },
          {
            id: 1,
            name: "Pet Lovers Mock",
            price: 6250,
            category: "Animals",
            badge: "Bestseller",
            description:
              "Express your passion for pets in cozy fashion. Knit with durable premium cotton.",
            image_url: "/categories/cat1.jpg",
          },
        ]);
        setLoading(false);
      });
  };

  const fetchStores = async () => {
    try {
      const res = await fetch(`/api/stores/all?adminEmail=${encodeURIComponent(currentUserEmail)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          const touchedStoreId = lastTouchedStoreIdRef.current;
          const sorted = [...data.stores].sort((a, b) => {
            if (touchedStoreId) {
              if (String(a.id) === touchedStoreId) return -1;
              if (String(b.id) === touchedStoreId) return 1;
            }
            return Number(b.id) - Number(a.id);
          });
          setStores(sorted);
        }
      }
    } catch (err) {
      console.error("Error fetching stores", err);
    }
  };

  const fetchAdminStats = async () => {
    try {
      const res = await fetch(`/api/orders/stats/admin?_t=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setAdminStats(data.stats);
        }
      }
    } catch (err) {
      console.error("Error fetching admin stats", err);
    }
  };

  const fetchVendorStats = async () => {
    try {
      const res = await fetch(`/api/orders/stats/vendor?email=${encodeURIComponent(currentUserEmail)}&_t=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setVendorStats(data.stats);
        }
      }
    } catch (err) {
      console.error("Error fetching vendor stats", err);
    }
  };

  const fetchVendorStoreInfo = async () => {
    try {
      const res = await fetch(`/api/stores/detail?email=${encodeURIComponent(currentUserEmail)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setStoreInfo(data.store);

          let parsedName = { en: "", ku: "", ar: "" };
          let parsedDesc = { en: "", ku: "", ar: "" };
          let parsedCity = { en: "", ku: "", ar: "" };
          try {
            if (data.store.name && data.store.name.startsWith("{")) parsedName = JSON.parse(data.store.name);
            else parsedName.en = data.store.name || "";
          } catch (e) {}
          try {
            if (data.store.description && data.store.description.startsWith("{")) parsedDesc = JSON.parse(data.store.description);
            else parsedDesc.en = data.store.description || "";
          } catch (e) {}
          try {
            if (data.store.city && data.store.city.startsWith("{")) parsedCity = JSON.parse(data.store.city);
            else parsedCity.en = data.store.city || "";
          } catch (e) {}

          setStoreNameEn(parsedName.en || "");
          setStoreNameKu(parsedName.ku || "");
          setStoreNameAr(parsedName.ar || "");
          setStoreDescriptionEn(parsedDesc.en || "");
          setStoreDescriptionKu(parsedDesc.ku || "");
          setStoreDescriptionAr(parsedDesc.ar || "");
          setStoreOwnerName(data.store.owner_name || "");
          setStoreEmail(data.store.email || "");
          setStorePhone(formatIraqiPhone(data.store.phone || ""));
          setStoreCityEn(parsedCity.en || "");
          setStoreCityKu(parsedCity.ku || "");
          setStoreCityAr(parsedCity.ar || "");
          setStoreAddress(data.store.address || "");
          setStoreLogoPreview(data.store.logo || "");
          setStoreBannerPreview(data.store.banner || "");
          try {
            const social = typeof data.store.social_links === "string"
              ? JSON.parse(data.store.social_links)
              : data.store.social_links || {};
            setStoreSocialLinks({
              facebook: social.facebook || "",
              instagram: social.instagram || "",
              twitter: social.twitter || "",
              website: social.website || ""
            });
          } catch (e) {
            setStoreSocialLinks({ facebook: "", instagram: "", twitter: "", website: "" });
          }
        }
      }
    } catch (err) {
      console.error("Error fetching store info", err);
    }
  };

  const fetchOrders = async () => {
    try {
      const url = currentUserRole === "admin"
        ? `/api/orders/admin?_t=${Date.now()}`
        : `/api/orders/vendor?email=${encodeURIComponent(currentUserEmail)}&_t=${Date.now()}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          if (currentUserRole === "admin") {
            const sortedOrders = [...(data.orders || [])].sort((a, b) => {
              const payA = a.payment_status === "Paid" ? 1 : 0;
              const payB = b.payment_status === "Paid" ? 1 : 0;
              if (payA !== payB) return payA - payB;
              return Number(b.id) - Number(a.id);
            });
            setOrders(sortedOrders);
          } else {
            // Group items by order_id to match admin structure
            const grouped = {};
            (data.items || []).forEach(item => {
              if (!grouped[item.order_id]) {
                grouped[item.order_id] = {
                  id: item.order_id,
                  order_number: item.order_number,
                  created_at: item.order_date,
                  full_name: item.full_name,
                  phone: item.phone,
                  province: item.province,
                  address: item.address,
                  status: item.status,
                  order_total: item.order_total,
                  payment_status: item.payment_status,
                  items: [],
                  vendor_total: 0
                };
              }
              grouped[item.order_id].items.push(item);
              grouped[item.order_id].vendor_total += (item.price * item.quantity);
            });
            const vendorOrders = Object.values(grouped).sort((a, b) => {
              const payA = a.payment_status === "Paid" ? 1 : 0;
              const payB = b.payment_status === "Paid" ? 1 : 0;
              if (payA !== payB) return payA - payB;
              return Number(b.id) - Number(a.id);
            });
            setOrders(vendorOrders);
          }
        }
      }
    } catch (err) {
      console.error("Error fetching orders", err);
    }
  };

  const handleUpdateStoreStatus = async (storeId, newStatus) => {
    try {
      const res = await fetch(`/api/stores/${storeId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, adminEmail: currentUserEmail }),
      });
      if (res.ok) {
        showToast(`Store status updated to ${newStatus}`);
        lastTouchedStoreIdRef.current = String(storeId);
        fetchStores();
        fetchAdminStats();
      } else {
        showToast("Failed to update store status");
      }
    } catch (err) {
      console.error(err);
      showToast("Error updating store status");
    }
  };

  const handleDeleteStore = async (storeId) => {
    try {
      const res = await fetch(`/api/stores/${storeId}?adminEmail=${encodeURIComponent(currentUserEmail)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        showToast("Store deleted successfully");
        fetchStores();
        fetchAdminStats();
      } else {
        showToast("Failed to delete store");
      }
    } catch (err) {
      console.error(err);
      showToast("Error deleting store");
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          email: currentUserEmail,
          role: currentUserRole
        }),
      });
      if (res.ok) {
        showToast(`Order status updated to ${newStatus}`);
        if (newStatus === "Paid") {
          setOrders(prevOrders => prevOrders.map(o => {
            if (Number(o.id) === Number(orderId)) {
              return {
                ...o,
                status: "Paid",
                payment_status: "Paid"
              };
            }
            return o;
          }));
          const order = orders.find(o => Number(o.id) === Number(orderId));
          if (order) {
            const amount = currentUserRole === "admin" 
              ? (Number(order.total) || 0) 
              : ((order.items || []).reduce((s, i) => s + ((Number(i.price) || 0) * (Number(i.quantity) || 0)), 0));
            if (currentUserRole === "admin") {
              setAdminStats(prev => ({
                ...prev,
                totalSales: (Number(prev.totalSales) || 0) + amount
              }));
            } else {
              setVendorStats(prev => ({
                ...prev,
                totalSales: (Number(prev.totalSales) || 0) + amount
              }));
            }
          }
        }
        fetchOrders();
        if (currentUserRole === "admin") {
          fetchAdminStats();
        } else {
          fetchVendorStats();
        }
      } else {
        showToast("Failed to update order status");
      }
    } catch (err) {
      console.error(err);
      showToast("Error updating order status");
    }
  };

  const handleUpdateOrderPaymentStatus = async (orderId, newPaymentStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/payment-status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payment_status: newPaymentStatus }),
      });
      if (res.ok) {
        showToast(`Payment status updated to ${newPaymentStatus}`);
        if (newPaymentStatus === "Paid") {
          setOrders(prevOrders => prevOrders.map(o => {
            if (Number(o.id) === Number(orderId)) {
              return {
                ...o,
                status: "Paid",
                payment_status: "Paid"
              };
            }
            return o;
          }));
          const order = orders.find(o => Number(o.id) === Number(orderId));
          if (order) {
            const amount = currentUserRole === "admin" 
              ? (Number(order.total) || 0) 
              : ((order.items || []).reduce((s, i) => s + ((Number(i.price) || 0) * (Number(i.quantity) || 0)), 0));
            if (currentUserRole === "admin") {
              setAdminStats(prev => ({
                ...prev,
                totalSales: (Number(prev.totalSales) || 0) + amount
              }));
            } else {
              setVendorStats(prev => ({
                ...prev,
                totalSales: (Number(prev.totalSales) || 0) + amount
              }));
            }
          }
        }
        fetchOrders();
        if (currentUserRole === "admin") {
          fetchAdminStats();
        } else {
          fetchVendorStats();
        }
      } else {
        showToast("Failed to update payment status");
      }
    } catch (err) {
      console.error(err);
      showToast("Error updating payment status");
    }
  };

  useEffect(() => {
    if (currentUserRole !== "admin" && currentUserRole !== "vendor") {
      onBackToHome();
      return;
    }
    fetchProducts();
    fetchSettings();
    if (currentUserRole === "admin") {
      fetchStores();
      fetchAdminStats();
      fetchOrders();
    } else if (currentUserRole === "vendor") {
      fetchVendorStats();
      fetchVendorStoreInfo();
      fetchOrders();
    }

    // Polling every 8 seconds for real-time synchronization
    const intervalId = setInterval(() => {
      fetchOrders();
      if (currentUserRole === "admin") {
        fetchAdminStats();
      } else if (currentUserRole === "vendor") {
        fetchVendorStats();
      }
    }, 3000);

    return () => clearInterval(intervalId);
  }, [currentUserRole, currentUserEmail]);

  const handleAddCity = async (e) => {
    e.preventDefault();
    if (!newCityEn.trim() || !newCityKu.trim() || !newCityAr.trim()) {
      showToast("Please provide the city name in all 3 languages.");
      return;
    }
    const trilingualName = JSON.stringify({ en: newCityEn.trim(), ku: newCityKu.trim(), ar: newCityAr.trim() });
    try {
      const res = await fetch("/api/settings/cities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trilingualName,
          latitude: parseFloat(newCityLat) || 33.3152,
          longitude: parseFloat(newCityLng) || 44.3661
        })
      });
      if (res.ok) {
        const data = await res.json();
        setCitiesList(prev => [...prev, data].sort((a, b) => {
          const nameA = a.name.startsWith('{') ? JSON.parse(a.name).en : a.name;
          const nameB = b.name.startsWith('{') ? JSON.parse(b.name).en : b.name;
          return nameA.localeCompare(nameB);
        }));
        setNewCityEn("");
        setNewCityKu("");
        setNewCityAr("");
        setNewCityLat("33.3152");
        setNewCityLng("44.3661");
        showToast("City added successfully!");
      } else {
        const err = await res.json();
        showToast(err.error || "Failed to add city.");
      }
    } catch (err) {
      console.error("Error adding city:", err);
      showToast("Error adding city.");
    }
  };

  const confirmDeleteCity = async () => {
    if (!cityToDelete) return;
    try {
      const res = await fetch(`/api/settings/cities/${cityToDelete}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setCitiesList(prev => prev.filter(c => c.id !== cityToDelete));
        showToast("City deleted successfully!");
      } else {
        showToast("Failed to delete city.");
      }
    } catch (err) {
      console.error("Error deleting city:", err);
      showToast("Error deleting city.");
    } finally {
      setCityToDelete(null);
    }
  };

  const handleSaveGeneralSettings = async () => {
    try {
      const res = await fetch("/api/settings/system-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: "order_cancellation_limit_minutes",
          value: String(cancellationLimit).trim()
        }),
      });
      if (res.ok) {
        showToast("Order cancellation limit updated successfully!");
        fetchSettings();
      } else {
        const error = await res.json();
        showToast(error.error || "Failed to update settings");
      }
    } catch {
      showToast("Error updating settings");
    }
  };

  // Settings Actions
  const handleAddCategory = async (catNameEn, catNameKu, catNameAr) => {
    if (!catNameEn.trim() || !catNameKu.trim() || !catNameAr.trim()) return;
    const combinedVal = JSON.stringify({ en: catNameEn.trim(), ku: catNameKu.trim(), ar: catNameAr.trim() });
    try {
      const res = await fetch("/api/settings/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: combinedVal }),
      });
      if (res.ok) {
        showToast("Category added successfully!");
        fetchSettings();
      } else {
        const error = await res.json();
        showToast(error.error || "Failed to add category");
      }
    } catch {
      const newCat = { id: Date.now().toString(), name: combinedVal };
      const updated = [...categories, newCat];
      setCategories(updated);
      localStorage.setItem("hawrisha_categories", JSON.stringify(updated));
      showToast("Category added successfully (offline mode)");
    }
  };

  const handleDeleteCategory = async (cat) => {
    const usedIn = checkInUse('category', cat.name);
    if (usedIn.length > 0) {
      setInUseModal({ open: true, itemName: cat.name, usedIn });
      return;
    }
    setConfirmModal({
      open: true,
      message: `Are you sure you want to delete "${getEnglishName(cat.name)}"?`,
      onConfirm: async () => {
        setConfirmModal({ open: false, message: '', onConfirm: null });
        const isNumber = /^\d+$/.test(cat.id);
        if (isNumber) {
          try {
            const res = await fetch(`/api/settings/categories/${cat.id}`, { method: "DELETE" });
            if (res.ok) {
              showToast("Category deleted successfully!");
              fetchSettings();
            } else {
              const errData = await res.json().catch(() => ({}));
              showToast(`Failed to delete category: ${errData.error || "Server error"}`);
            }
          } catch {
            const updated = categories.filter((c) => c.id !== cat.id);
            setCategories(updated);
            localStorage.setItem("hawrisha_categories", JSON.stringify(updated));
            showToast("Category deleted (offline fallback)");
          }
        } else {
          const updated = categories.filter((c) => c.id !== cat.id);
          setCategories(updated);
          localStorage.setItem("hawrisha_categories", JSON.stringify(updated));
          showToast("Category deleted successfully");
        }
      },
    });
  };


  const handleAddBadge = async (badgeNameEn, badgeNameKu, badgeNameAr) => {
    if (!badgeNameEn.trim() || !badgeNameKu.trim() || !badgeNameAr.trim()) return;
    const combinedVal = JSON.stringify({ en: badgeNameEn.trim(), ku: badgeNameKu.trim(), ar: badgeNameAr.trim() });
    try {
      const res = await fetch("/api/settings/badges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: combinedVal }),
      });
      if (res.ok) {
        showToast("Badge added successfully!");
        fetchSettings();
      } else {
        const error = await res.json();
        showToast(error.error || "Failed to add badge");
      }
    } catch {
      const newBadge = { id: Date.now().toString(), name: combinedVal };
      const updated = [...badges, newBadge];
      setBadges(updated);
      localStorage.setItem("hawrisha_badges", JSON.stringify(updated));
      showToast("Badge added successfully (offline mode)");
    }
  };

  const handleDeleteBadge = async (b) => {
    const usedIn = checkInUse('badge', b.name);
    if (usedIn.length > 0) {
      setInUseModal({ open: true, itemName: b.name, usedIn });
      return;
    }
    setConfirmModal({
      open: true,
      message: `Are you sure you want to delete "${getEnglishName(b.name)}"?`,
      onConfirm: async () => {
        setConfirmModal({ open: false, message: '', onConfirm: null });
        const isNumber = /^\d+$/.test(b.id);
        if (isNumber) {
          try {
            const res = await fetch(`/api/settings/badges/${b.id}`, { method: "DELETE" });
            if (res.ok) {
              showToast("Badge deleted successfully!");
              fetchSettings();
            } else {
              const errData = await res.json().catch(() => ({}));
              showToast(`Failed to delete badge: ${errData.error || "Server error"}`);
            }
          } catch {
            const updated = badges.filter((x) => x.id !== b.id);
            setBadges(updated);
            localStorage.setItem("hawrisha_badges", JSON.stringify(updated));
            showToast("Badge deleted (offline fallback)");
          }
        } else {
          const updated = badges.filter((x) => x.id !== b.id);
          setBadges(updated);
          localStorage.setItem("hawrisha_badges", JSON.stringify(updated));
          showToast("Badge deleted successfully");
        }
      }
    });
  };

  const handleAddColor = async ({
    nameEn,
    nameKu,
    nameAr,
    class: colClass,
    family: colFamily,
  }) => {
    if (!nameEn.trim() || !nameKu.trim() || !nameAr.trim() || !colClass.trim() || !colFamily.trim()) return;
    const combinedVal = JSON.stringify({ en: nameEn.trim(), ku: nameKu.trim(), ar: nameAr.trim() });
    const colorId = nameEn.trim().toLowerCase().replace(/\s+/g, "_");

    try {
      const res = await fetch("/api/settings/colors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: colorId,
          class: colClass.trim(),
          name: combinedVal,
          family: colFamily.trim(),
        }),
      });
      if (res.ok) {
        showToast("Color added successfully!");
        fetchSettings();
      } else {
        const error = await res.json();
        showToast(error.error || "Failed to add color");
      }
    } catch {
      const newColor = {
        id: colorId,
        class: colClass.trim(),
        name: combinedVal,
        family: colFamily.trim(),
      };
      const updated = [...colorsList, newColor];
      setColorsList(updated);
      localStorage.setItem("hawrisha_colors", JSON.stringify(updated));
      showToast("Color swatch added successfully (offline mode)");
    }
  };

  const handleDeleteColor = async (color) => {
    const usedIn = checkInUse('color', color.name);
    if (usedIn.length > 0) {
      setInUseModal({ open: true, itemName: color.name, usedIn });
      return;
    }
    setConfirmModal({
      open: true,
      message: `Are you sure you want to delete "${getEnglishName(color.name)}"?`,
      onConfirm: async () => {
        setConfirmModal({ open: false, message: '', onConfirm: null });
        try {
          const res = await fetch(`/api/settings/colors/${color.id}`, { method: "DELETE" });
          if (res.ok) {
            showToast("Color swatch deleted successfully!");
            fetchSettings();
          } else {
            const errData = await res.json().catch(() => ({}));
            showToast(`Failed to delete color: ${errData.error || "Server error"}`);
          }
        } catch {
          const updated = colorsList.filter((x) => x.id !== color.id);
          setColorsList(updated);
          localStorage.setItem("hawrisha_colors", JSON.stringify(updated));
          showToast("Color swatch deleted (offline fallback)");
        }
      }
    });
  };

  const handleAddStyle = async (nameEn, nameKu, nameAr) => {
    if (!nameEn.trim() || !nameKu.trim() || !nameAr.trim()) return;
    const combinedVal = JSON.stringify({ en: nameEn.trim(), ku: nameKu.trim(), ar: nameAr.trim() });
    try {
      const res = await fetch("/api/settings/styles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: combinedVal }),
      });
      if (res.ok) {
        showToast("Style option added successfully!");
        fetchSettings();
      } else {
        const error = await res.json();
        showToast(error.error || "Failed to add style");
      }
    } catch {
      const newStyle = { id: Date.now().toString(), name: combinedVal };
      const updated = [...styles, newStyle];
      setStyles(updated);
      localStorage.setItem("hawrisha_styles", JSON.stringify(updated));
      showToast("Style added successfully (offline mode)");
    }
  };

  const handleDeleteStyle = async (st) => {
    const usedIn = checkInUse('style', st.name);
    if (usedIn.length > 0) {
      setInUseModal({ open: true, itemName: st.name, usedIn });
      return;
    }
    setConfirmModal({
      open: true,
      message: `Are you sure you want to delete "${getEnglishName(st.name)}"?`,
      onConfirm: async () => {
        setConfirmModal({ open: false, message: '', onConfirm: null });
        const isNumber = /^\d+$/.test(st.id);
        if (isNumber) {
          try {
            const res = await fetch(`/api/settings/styles/${st.id}`, { method: "DELETE" });
            if (res.ok) {
              showToast("Style option deleted successfully!");
              fetchSettings();
            } else {
              const errData = await res.json().catch(() => ({}));
              showToast(`Failed to delete style: ${errData.error || "Server error"}`);
            }
          } catch {
            const updated = styles.filter((s) => s.id !== st.id);
            setStyles(updated);
            localStorage.setItem("hawrisha_styles", JSON.stringify(updated));
            showToast("Style deleted (offline fallback)");
          }
        } else {
          const updated = styles.filter((s) => s.id !== st.id);
          setStyles(updated);
          localStorage.setItem("hawrisha_styles", JSON.stringify(updated));
          showToast("Style deleted successfully");
        }
      }
    });
  };

  const handleAddMaterial = async (nameEn, nameKu, nameAr) => {
    if (!nameEn.trim() || !nameKu.trim() || !nameAr.trim()) return;
    const combinedVal = JSON.stringify({ en: nameEn.trim(), ku: nameKu.trim(), ar: nameAr.trim() });
    try {
      const res = await fetch("/api/settings/materials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: combinedVal }),
      });
      if (res.ok) {
        showToast("Material option added successfully!");
        fetchSettings();
      } else {
        const error = await res.json();
        showToast(error.error || "Failed to add material");
      }
    } catch {
      const newMat = { id: Date.now().toString(), name: combinedVal };
      const updated = [...materials, newMat];
      setMaterials(updated);
      localStorage.setItem("hawrisha_materials", JSON.stringify(updated));
      showToast("Material added successfully (offline mode)");
    }
  };

  const handleDeleteMaterial = async (mat) => {
    const usedIn = checkInUse('material', mat.name);
    if (usedIn.length > 0) {
      setInUseModal({ open: true, itemName: mat.name, usedIn });
      return;
    }
    setConfirmModal({
      open: true,
      message: `Are you sure you want to delete "${getEnglishName(mat.name)}"?`,
      onConfirm: async () => {
        setConfirmModal({ open: false, message: '', onConfirm: null });
        const isNumber = /^\d+$/.test(mat.id);
        if (isNumber) {
          try {
            const res = await fetch(`/api/settings/materials/${mat.id}`, { method: "DELETE" });
            if (res.ok) {
              showToast("Material option deleted successfully!");
              fetchSettings();
            } else {
              const errData = await res.json().catch(() => ({}));
              showToast(`Failed to delete material: ${errData.error || "Server error"}`);
            }
          } catch {
            const updated = materials.filter((m) => m.id !== mat.id);
            setMaterials(updated);
            localStorage.setItem("hawrisha_materials", JSON.stringify(updated));
            showToast("Material deleted (offline fallback)");
          }
        } else {
          const updated = materials.filter((m) => m.id !== mat.id);
          setMaterials(updated);
          localStorage.setItem("hawrisha_materials", JSON.stringify(updated));
          showToast("Material deleted successfully");
        }
      }
    });
  };

  const handleAddSeason = async (nameEn, nameKu, nameAr) => {
    if (!nameEn.trim() || !nameKu.trim() || !nameAr.trim()) return;
    const combinedVal = JSON.stringify({ en: nameEn.trim(), ku: nameKu.trim(), ar: nameAr.trim() });
    try {
      const res = await fetch("/api/settings/seasons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: combinedVal }),
      });
      if (res.ok) {
        showToast("Seasonal Type added successfully!");
        fetchSettings();
      } else {
        const error = await res.json();
        showToast(error.error || "Failed to add seasonal type");
      }
    } catch {
      const newSeason = { id: Date.now().toString(), name: combinedVal };
      const updated = [...seasons, newSeason];
      setSeasons(updated);
      localStorage.setItem("hawrisha_seasons", JSON.stringify(updated));
      showToast("Seasonal type added successfully (offline mode)");
    }
  };

  const handleDeleteSeason = async (seas) => {
    const usedIn = checkInUse('season', seas.name);
    if (usedIn.length > 0) {
      setInUseModal({ open: true, itemName: seas.name, usedIn });
      return;
    }
    setConfirmModal({
      open: true,
      message: `Are you sure you want to delete "${getEnglishName(seas.name)}"?`,
      onConfirm: async () => {
        setConfirmModal({ open: false, message: '', onConfirm: null });
        const isNumber = /^\d+$/.test(seas.id);
        if (isNumber) {
          try {
            const res = await fetch(`/api/settings/seasons/${seas.id}`, { method: "DELETE" });
            if (res.ok) {
              showToast("Seasonal Type deleted successfully!");
              fetchSettings();
            } else {
              const errData = await res.json().catch(() => ({}));
              showToast(`Failed to delete seasonal type: ${errData.error || "Server error"}`);
            }
          } catch {
            const updated = seasons.filter((s) => s.id !== seas.id);
            setSeasons(updated);
            localStorage.setItem("hawrisha_seasons", JSON.stringify(updated));
            showToast("Seasonal type deleted (offline fallback)");
          }
        } else {
          const updated = seasons.filter((s) => s.id !== seas.id);
          setSeasons(updated);
          localStorage.setItem("hawrisha_seasons", JSON.stringify(updated));
          showToast("Seasonal type deleted successfully");
        }
      }
    });
  };

  const handleAddSize = async (nameEn, nameKu, nameAr) => {
    if (!nameEn.trim() || !nameKu.trim() || !nameAr.trim()) return;
    const combinedVal = JSON.stringify({ en: nameEn.trim(), ku: nameKu.trim(), ar: nameAr.trim() });
    try {
      const res = await fetch("/api/settings/sizes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: combinedVal }),
      });
      if (res.ok) {
        showToast("Size Collection added successfully!");
        fetchSettings();
      } else {
        const error = await res.json();
        showToast(error.error || "Failed to add size collection");
      }
    } catch {
      const newSize = { id: Date.now().toString(), name: combinedVal };
      const updated = [...sizes, newSize];
      setSizes(updated);
      localStorage.setItem("hawrisha_sizes", JSON.stringify(updated));
      showToast("Size collection added successfully (offline mode)");
    }
  };

  const handleDeleteSize = async (sz) => {
    const usedIn = checkInUse('size', sz.name);
    if (usedIn.length > 0) {
      setInUseModal({ open: true, itemName: sz.name, usedIn });
      return;
    }
    setConfirmModal({
      open: true,
      message: `Are you sure you want to delete "${getEnglishName(sz.name)}"?`,
      onConfirm: async () => {
        setConfirmModal({ open: false, message: '', onConfirm: null });
        const isNumber = /^\d+$/.test(sz.id);
        if (isNumber) {
          try {
            const res = await fetch(`/api/settings/sizes/${sz.id}`, { method: "DELETE" });
            if (res.ok) {
              showToast("Size Collection deleted successfully!");
              fetchSettings();
            } else {
              const errData = await res.json().catch(() => ({}));
              showToast(`Failed to delete size collection: ${errData.error || "Server error"}`);
            }
          } catch {
            const updated = sizes.filter((s) => s.id !== sz.id);
            setSizes(updated);
            localStorage.setItem("hawrisha_sizes", JSON.stringify(updated));
            showToast("Size collection deleted (offline fallback)");
          }
        } else {
          const updated = sizes.filter((s) => s.id !== sz.id);
          setSizes(updated);
          localStorage.setItem("hawrisha_sizes", JSON.stringify(updated));
          showToast("Size collection deleted successfully");
        }
      }
    });
  };

  const handleAddPromotion = async (nameEn, nameKu, nameAr) => {
    if (!nameEn.trim() || !nameKu.trim() || !nameAr.trim()) return;
    const combinedVal = JSON.stringify({ en: nameEn.trim(), ku: nameKu.trim(), ar: nameAr.trim() });
    try {
      const res = await fetch("/api/settings/promotions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: combinedVal }),
      });
      if (res.ok) {
        showToast("Promotion added successfully!");
        fetchSettings();
      } else {
        const error = await res.json();
        showToast(error.error || "Failed to add promotion");
      }
    } catch {
      const newPromo = { id: Date.now().toString(), name: combinedVal };
      const updated = [...promotions, newPromo];
      setPromotions(updated);
      localStorage.setItem("hawrisha_promotions", JSON.stringify(updated));
      showToast("Promotion added successfully (offline mode)");
    }
  };

  const handleDeletePromotion = async (promo) => {
    const usedIn = checkInUse('promotion', promo.name);
    if (usedIn.length > 0) {
      setInUseModal({ open: true, itemName: promo.name, usedIn });
      return;
    }
    setConfirmModal({
      open: true,
      message: `Are you sure you want to delete "${getEnglishName(promo.name)}"?`,
      onConfirm: async () => {
        setConfirmModal({ open: false, message: '', onConfirm: null });
        const isNumber = /^\d+$/.test(promo.id);
        if (isNumber) {
          try {
            const res = await fetch(`/api/settings/promotions/${promo.id}`, { method: "DELETE" });
            if (res.ok) {
              showToast("Promotion deleted successfully!");
              fetchSettings();
            } else {
              const errData = await res.json().catch(() => ({}));
              showToast(`Failed to delete promotion: ${errData.error || "Server error"}`);
            }
          } catch {
            const updated = promotions.filter((p) => p.id !== promo.id);
            setPromotions(updated);
            localStorage.setItem("hawrisha_promotions", JSON.stringify(updated));
            showToast("Promotion deleted (offline fallback)");
          }
        } else {
          const updated = promotions.filter((p) => p.id !== promo.id);
          setPromotions(updated);
          localStorage.setItem("hawrisha_promotions", JSON.stringify(updated));
          showToast("Promotion deleted successfully");
        }
      }
    });
  };

  // Handle open add modal
  const handleOpenCreate = () => {
    setIsViewOnly(false);
    setEditingProduct(null);
    setNameEn("");
    setNameKu("");
    setNameAr("");
    setPrice("");
    setProductStoreId("");
    setCategory([]);
    setBadge([]);
    setDescEn("");
    setDescKu("");
    setDescAr("");
    setImageFile(null);
    setImagePreview("");
    setSizeColors({});

    // Clear new attributes
    setStyleLength([]);
    setStock(0);
    setPromotion([]);
    setMaterial([]);
    setSeasonalType([]);
    setSizeCollection([]);
    setDiscount(0);
    setGender("");
    setShowValidation(false);

    setIsModalOpen(true);
  };

  // Handle open edit modal
  const handleOpenEdit = (product) => {
    setIsViewOnly(false);
    setIsModalOpen(true);
    setEditingProduct(product);

    let parsedName = { en: "", ku: "", ar: "" };
    let parsedDesc = { en: "", ku: "", ar: "" };
    try {
      if (product.name && product.name.startsWith("{")) parsedName = JSON.parse(product.name);
      else parsedName.en = product.name || "";
    } catch (e) {}
    try {
      if (product.description && product.description.startsWith("{")) parsedDesc = JSON.parse(product.description);
      else parsedDesc.en = product.description || "";
    } catch (e) {}

    setNameEn(parsedName.en || "");
    setNameKu(parsedName.ku || "");
    setNameAr(parsedName.ar || "");
    setPrice(product.price || "");
    setProductStoreId(product.store_id || "");
    setCategory(parseJsonArray(product.category));
    setBadge(parseJsonArray(product.badge));
    setDescEn(parsedDesc.en || "");
    setDescKu(parsedDesc.ku || "");
    setDescAr(parsedDesc.ar || "");
    setImageFile(null);
    setImagePreview(product.image_url || "");

    // Populate sizeColors from product (stored as {size: [colorClass]} → convert to {size: [colorId]} for UI)
    try {
      const parsed = JSON.parse(product.size_colors || '{}');
      if (typeof parsed === 'object' && !Array.isArray(parsed)) {
        const idBased = {};
        Object.entries(parsed).forEach(([size, classes]) => {
          idBased[size] = classes.map(cls => {
            const col = colorsList.find(c => c.class === cls);
            return col ? col.id : cls;
          });
        });
        setSizeColors(idBased);
      } else {
        setSizeColors({});
      }
    } catch(e) {
      setSizeColors({});
    }

    // Populate new attributes
    setStyleLength(parseJsonArray(product.style_length));
    setStock(product.stock || 0);
    setPromotion(parseJsonArray(product.promotion));
    setMaterial(parseJsonArray(product.material));
    setSeasonalType(parseJsonArray(product.seasonal_type));
    setSizeCollection(parseJsonArray(product.size_collection));
    setDiscount(product.discount || 0);
    setGender(product.gender || "");


    setShowValidation(false);
    setIsModalOpen(true);
  };

  // Handle Image Selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };


  // Submit Handler (Create or Update)
  const handleSubmit = (e) => {
    e.preventDefault();

    if (isViewOnly) return;

    if (editingProduct && !hasProductChanges()) {
      showToast("No changes detected. Product was not updated.");
      setIsModalOpen(false);
      setEditingProduct(null);
      return;
    }

    // Custom Validation checks
    const emptyFields = [];
    if (!nameEn.trim() || !nameKu.trim() || !nameAr.trim()) emptyFields.push("Product Title in 3 languages");
    if (!price || Number(price) < 250)
      emptyFields.push(
        "Price (must be a valid Iraqi Dinar amount, e.g. 3000. Minimum 250 IQD)",
      );
    if (!descEn.trim() || !descKu.trim() || !descAr.trim()) emptyFields.push("Product Description in 3 languages");
    if (!editingProduct && !imageFile) {
      emptyFields.push("Product Image Upload");
    }
    if (sizeCollection.length === 0) {
      emptyFields.push("Size Collection (choose at least one)");
    } else {
      const missingColors = sizeCollection.some(size => !sizeColors[size] || sizeColors[size].length === 0);
      if (missingColors) {
        emptyFields.push("Assign at least one Color Style to each selected size");
      }
    }
    if (category.length === 0) {
      emptyFields.push("Category (choose at least one)");
    }
    if (styleLength.length === 0) {
      emptyFields.push("Style / Length (choose at least one)");
    }

    if (material.length === 0) {
      emptyFields.push("Material (choose at least one)");
    }
    if (seasonalType.length === 0) {
      emptyFields.push("Seasonal Type (choose at least one)");
    }
    if (currentUserRole === "admin" && !productStoreId) {
      emptyFields.push("Store (choose one)");
    }

    if (emptyFields.length > 0) {
      setShowValidation(true);
      return;
    }
    setShowValidation(false);

    setLoading(true);

    const allUniqueColorIds = [...new Set(Object.values(sizeColors).flat())];
    const activeColorObjects = colorsList.filter((c) =>
      allUniqueColorIds.includes(c.id),
    );
    const finalColors = activeColorObjects.map((c) => c.class);
    const finalColorNames = activeColorObjects.map((c) => c.name);
    const finalColorFamily =
      activeColorObjects.length > 0 ? activeColorObjects[0].family : "beige";

    const trilingualName = JSON.stringify({ en: nameEn.trim(), ku: nameKu.trim(), ar: nameAr.trim() });
    const trilingualDesc = JSON.stringify({ en: descEn.trim(), ku: descKu.trim(), ar: descAr.trim() });

    const formData = new FormData();
    formData.append("vendorEmail", currentUserEmail);
    formData.append("name", trilingualName);
    formData.append("price", price);
    formData.append("category", JSON.stringify(category));
    formData.append("colorFamily", finalColorFamily);
    formData.append("badge", JSON.stringify(badge));
    formData.append("desc", trilingualDesc);
    formData.append("colors", JSON.stringify(finalColors));
    formData.append("colorNames", JSON.stringify(finalColorNames));

    // Append new fields to form payload
    formData.append("styleLength", JSON.stringify(styleLength));
    formData.append("stock", stock);
    formData.append("promotion", JSON.stringify(promotion));
    formData.append("material", JSON.stringify(material));
    formData.append("seasonalType", JSON.stringify(seasonalType));
    formData.append("sizeCollection", JSON.stringify(sizeCollection));
    formData.append("discount", discount);
    formData.append("gender", gender || "");
    
    if (currentUserRole === "admin") {
      formData.append("storeId", productStoreId || "");
    }

    if (imageFile) {
      formData.append("image", imageFile);
    }

    // Convert sizeColors ids to classes for storage
    const sizeColorsMapped = {};
    Object.entries(sizeColors).forEach(([size, colorIds]) => {
      sizeColorsMapped[size] = colorIds.map(id => {
        const col = colorsList.find(c => c.id === id);
        return col ? col.class : id;
      });
    });
    formData.append("sizeColors", JSON.stringify(sizeColorsMapped));

    const url = editingProduct
      ? `/api/products/${editingProduct.id}`
      : "/api/products";
    const method = editingProduct ? "PUT" : "POST";

    fetch(url, {
      method,
      body: formData,
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to save product");
        return res.json();
      })
      .then((savedProduct) => {
        const savedId = savedProduct?.id ?? (editingProduct?.id ?? null);
        if (savedId) lastTouchedIdRef.current = String(savedId);
        showToast(
          editingProduct
            ? "Product updated successfully!"
            : "New product created successfully!",
        );
        setIsModalOpen(false);
        fetchProducts();
      })
      .catch((err) => {
        console.error(err);
        showToast("Error: Backend API is not active.");
        setLoading(false);
      });
  };

  // Custom Confirm Delete Handler
  const handleConfirmDelete = () => {
    if (!productToDelete) return;
    const id = productToDelete.id;

    fetch(`/api/products/${id}?vendorEmail=${encodeURIComponent(currentUserEmail)}`, {
      method: "DELETE",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to delete product");
        showToast("Product deleted successfully!");
        setProductToDelete(null);
        fetchProducts();
      })
      .catch((err) => {
        console.error(err);
        showToast("Error: Backend API is not active.");
        setProductToDelete(null);
      });
  };

  const handleVendorProfileSave = (e) => {
    e.preventDefault();
    if (!storeNameEn.trim() || !storeNameKu.trim() || !storeNameAr.trim() || !storeOwnerName || !storeEmail || !storePhone) {
      showToast("Please fill in all required fields.");
      return;
    }

    const cleanPhone = storePhone.replace(/\D/g, '');
    if (!storePhone.startsWith('+964') || cleanPhone.length !== 13) {
      showToast("Phone number must start with +964 and contain exactly 10 digits.");
      return;
    }

    const trilingualName = JSON.stringify({ en: storeNameEn.trim(), ku: storeNameKu.trim(), ar: storeNameAr.trim() });
    const trilingualDesc = JSON.stringify({ en: storeDescriptionEn.trim(), ku: storeDescriptionKu.trim(), ar: storeDescriptionAr.trim() });
    const trilingualCity = JSON.stringify({ en: storeCityEn.trim(), ku: storeCityKu.trim(), ar: storeCityAr.trim() });

    const formData = new FormData();
    formData.append("name", trilingualName);
    formData.append("description", trilingualDesc);
    formData.append("owner_name", storeOwnerName);
    formData.append("email", storeEmail);
    formData.append("phone", storePhone);
    formData.append("city", trilingualCity);
    formData.append("address", storeAddress);
    formData.append("social_links", JSON.stringify(storeSocialLinks));

    if (storeLogoFile) {
      formData.append("logo", storeLogoFile);
    }
    if (storeBannerFile) {
      formData.append("banner", storeBannerFile);
    }

    fetch(`/api/stores/${storeInfo.id}`, {
      method: "PUT",
      body: formData,
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to save store profile");
        return res.json();
      })
      .then((data) => {
        showToast("Store profile updated successfully!");
        fetchVendorStoreInfo();
      })
      .catch((err) => {
        console.error(err);
        showToast("Error updating store profile.");
      });
  };

  const handleStoreSubmit = (e) => {
    e.preventDefault();

    if (isViewOnly) return;

    if (editingStore && !hasStoreChanges()) {
      showToast("No changes detected. Store was not updated.");
      setIsStoreModalOpen(false);
      setEditingStore(null);
      return;
    }

    // --- Validate all required fields ---
    const errors = {};
    if (!storeNameEn.trim() || !storeNameKu.trim() || !storeNameAr.trim()) errors.storeName = 'Store name is required in 3 languages';
    if (!storeOwnerName.trim()) errors.storeOwnerName = 'Owner name is required';
    if (!storeEmail.trim()) errors.storeEmail = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(storeEmail.trim())) errors.storeEmail = 'Please enter a valid email address';
    
    const cleanPhone = storePhone.replace(/\D/g, '');
    if (!storePhone.trim() || storePhone === '+964') {
      errors.storePhone = 'Phone number is required';
    } else if (!storePhone.startsWith('+964') || cleanPhone.length !== 13) {
      errors.storePhone = 'Phone number must start with +964 and contain exactly 10 digits';
    }

    if (!storeCityEn.trim() || !storeCityKu.trim() || !storeCityAr.trim()) errors.storeCity = 'City is required in 3 languages';
    if (!storeAddress.trim()) errors.storeAddress = 'Address is required';
    if (!storeDescriptionEn.trim() || !storeDescriptionKu.trim() || !storeDescriptionAr.trim()) errors.storeDescription = 'Store description is required in 3 languages';
    
    if (!editingStore) {
      if (!storePassword.trim()) {
        errors.storePassword = 'Password is required for new stores';
      } else if (storePassword.length < 8) {
        errors.storePassword = 'Password must be at least 8 characters';
      }
    } else {
      if (storePassword && storePassword.length < 8) {
        errors.storePassword = 'Password must be at least 8 characters';
      }
    }

    if (!storeLogoFile && !storeLogoPreview) {
      errors.storeLogo = 'Store logo is required';
    }
    if (!storeBannerFile && !storeBannerPreview) {
      errors.storeBanner = 'Store banner is required';
    }

    if (Object.keys(errors).length > 0) {
      setStoreFormErrors(errors);
      return;
    }
    setStoreFormErrors({});

    const trilingualName = JSON.stringify({ en: storeNameEn.trim(), ku: storeNameKu.trim(), ar: storeNameAr.trim() });
    const trilingualDesc = JSON.stringify({ en: storeDescriptionEn.trim(), ku: storeDescriptionKu.trim(), ar: storeDescriptionAr.trim() });
    const trilingualCity = JSON.stringify({ en: storeCityEn.trim(), ku: storeCityKu.trim(), ar: storeCityAr.trim() });

    const formData = new FormData();
    formData.append("adminEmail", currentUserEmail);
    formData.append("name", trilingualName);
    formData.append("description", trilingualDesc);
    formData.append("owner_name", storeOwnerName.trim());
    formData.append("email", storeEmail.trim());
    formData.append("phone", storePhone);
    formData.append("city", trilingualCity);
    formData.append("address", storeAddress.trim());
    formData.append("social_links", JSON.stringify(storeSocialLinks));
    formData.append("commission_percentage", storeCommission);
    if (storePassword) formData.append("password", storePassword);

    if (storeLogoFile) formData.append("logo", storeLogoFile);
    if (storeBannerFile) formData.append("banner", storeBannerFile);

    const url = editingStore ? `/api/stores/${editingStore.id}` : "/api/stores";
    const method = editingStore ? "PUT" : "POST";

    fetch(url, { method, body: formData })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.message || "Something went wrong");
        }
        const savedId = data?.id ?? (editingStore?.id ?? null);
        if (savedId) {
          lastTouchedStoreIdRef.current = String(savedId);
        }
        showToast(editingStore ? "Store profile updated!" : "Store created successfully!");
        setIsStoreModalOpen(false);
        setEditingStore(null);
        fetchStores();
        fetchAdminStats();
      })
      .catch((err) => {
        console.error(err);
        showToast(err.message || "Error saving store.");
      });
  };

  const filteredProducts = storeFilter ? products.filter(p => p.store_id === storeFilter) : products;

  const totalItems = filteredProducts.length;

  const totalStock = filteredProducts.reduce(
    (acc, p) => acc + (Number(p.stock) || 0),
    0,
  );

  const outOfStockItems = filteredProducts.filter((p) => Number(p.stock) === 0).length;

  const totalSales = (() => {
    if (currentUserRole === "vendor") {
      return vendorStats.totalSales;
    }
    if (storeFilter && storeFilter !== "all") {
      return orders.reduce((sum, order) => {
        if (order.status === "Paid") {
          const storeItems = (order.items || []).filter(item => Number(item.store_id) === Number(storeFilter));
          const storeOrderTotal = storeItems.reduce((s, item) => s + (Number(item.price) || 0) * (Number(item.quantity) || 0), 0);
          return sum + storeOrderTotal;
        }
        return sum;
      }, 0);
    }
    return adminStats.totalSales;
  })();
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const safePage = Math.min(dashboardPage, totalPages);
  const paginatedProducts = filteredProducts.slice(
    (safePage - 1) * itemsPerPage,
    safePage * itemsPerPage,
  );

  const storesTotalPages = Math.ceil(stores.length / itemsPerPage) || 1;
  const safestoresPage = Math.min(storesPage, storesTotalPages);
  const paginatedStores = stores.slice(
    (safestoresPage - 1) * itemsPerPage,
    safestoresPage * itemsPerPage,
  );

  const displayedOrders = ((currentUserRole === "vendor" || currentUserRole === "admin")
    ? (vendorOrderTab === "All" ? [...orders] : orders.filter(o => o.status === vendorOrderTab))
    : [...orders]).sort((a, b) => {
      if (a.payment_status === 'Unpaid' && b.payment_status === 'Paid') return -1;
      if (a.payment_status === 'Paid' && b.payment_status === 'Unpaid') return 1;
      return 0;
    });

  const ordersTotalPages = Math.ceil(displayedOrders.length / itemsPerPage) || 1;
  const safeOrdersPage = Math.min(ordersPage, ordersTotalPages);
  const currentOrders = displayedOrders.slice(
    (safeOrdersPage - 1) * itemsPerPage,
    safeOrdersPage * itemsPerPage,
  );

  const handleSidebarTabClick = (tab) => {
    const formOpen = isModalOpen || isStoreModalOpen;
    const hasUnsaved = formOpen && ((isModalOpen && hasProductChanges()) || (isStoreModalOpen && hasStoreChanges()));

    if (hasUnsaved) {
      // Has unsaved data — ask before leaving
      setShowUnsavedChangesConfirm({
        open: true,
        onConfirm: () => {
          setIsModalOpen(false);
          setIsStoreModalOpen(false);
          setEditingProduct(null);
          setEditingStore(null);
          setShowValidation(false);
          setActiveTab(tab);
        }
      });
    } else {
      // No unsaved data — close any open form and navigate immediately
      setIsModalOpen(false);
      setIsStoreModalOpen(false);
      setEditingProduct(null);
      setEditingStore(null);
      setShowValidation(false);
      setActiveTab(tab);
    }
  };

  const handleBackToHome = () => {
    const hasUnsaved = (isModalOpen && hasProductChanges()) || (isStoreModalOpen && hasStoreChanges());
    if (hasUnsaved) {
      setShowUnsavedChangesConfirm({
        open: true,
        onConfirm: () => {
          setIsModalOpen(false);
          setIsStoreModalOpen(false);
          setEditingProduct(null);
          setEditingStore(null);
          onBackToHome();
        }
      });
    } else {
      onBackToHome();
    }
  };

  return (
    <div className="flex h-screen bg-[#f8fafc] text-slate-800 font-sans select-none overflow-hidden w-full">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-8 right-8 z-50 bg-[#36454F] text-white px-6 py-3.5 rounded-xl shadow-xl flex items-center space-x-3 border border-white/10"
          >
            <div className="w-2.5 h-2.5 rounded-full bg-[#B2AC88] animate-ping" />
            <span className="font-semibold text-sm tracking-wide">
              {toastMessage}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Premium Admin Sidebar */}
      <aside className="sticky top-0 h-screen hidden lg:flex flex-col w-64 bg-[#36454F] text-[#F5F5DC] border-r border-[#B2AC88]/20 p-6 select-none shrink-0 justify-between">
        <div className="space-y-8">
          {/* Logo Header */}
          <div className="border-b border-[#B2AC88]/15 pb-4">
            <h2 className="text-2xl font-serif italic font-bold text-[#B2AC88] tracking-widest uppercase">
              {currentUserRole === "admin" ? "HAWRISHA" : currentUserStoreName || "HAWRISHA"}
            </h2>
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#B2AC88]/60 mt-1 block">
              {currentUserRole === "admin" ? "Control Center" : "Vendor Dashboard"}
            </span>
          </div>

          {/* Navigation Links */}
          <div className="space-y-1.5">
            <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400 block mb-2 px-3">
              Management
            </span>
            {currentUserRole === "admin" ? (
              <>
                <button
                  onClick={() => handleSidebarTabClick("inventory")}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 font-bold text-xs uppercase tracking-wider rounded-xl transition-all border text-left cursor-pointer ${
                    activeTab === "inventory"
                      ? "bg-[#B2AC88]/15 text-[#B2AC88] border-[#B2AC88]/25"
                      : "text-[#F5F5DC]/55 border-transparent hover:text-[#F5F5DC]/80"
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Package size={16} />
                    <span>Inventory</span>
                  </div>
                </button>
                <button
                  onClick={() => handleSidebarTabClick("stores")}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 font-bold text-xs uppercase tracking-wider rounded-xl transition-all border text-left cursor-pointer ${
                    activeTab === "stores"
                      ? "bg-[#B2AC88]/15 text-[#B2AC88] border-[#B2AC88]/25"
                      : "text-[#F5F5DC]/55 border-transparent hover:text-[#F5F5DC]/80"
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Store size={16} />
                    <span>Stores</span>
                  </div>
                </button>
                <button
                  onClick={() => handleSidebarTabClick("category")}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 font-bold text-xs uppercase tracking-wider rounded-xl transition-all border text-left cursor-pointer ${
                    activeTab === "category"
                      ? "bg-[#B2AC88]/15 text-[#B2AC88] border-[#B2AC88]/25"
                      : "text-[#F5F5DC]/55 border-transparent hover:text-[#F5F5DC]/80"
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Layers size={16} />
                    <span>Category</span>
                  </div>
                </button>
                <button
                  onClick={() => handleSidebarTabClick("orders")}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 font-bold text-xs uppercase tracking-wider rounded-xl transition-all border text-left cursor-pointer ${
                    activeTab === "orders"
                      ? "bg-[#B2AC88]/15 text-[#B2AC88] border-[#B2AC88]/25"
                      : "text-[#F5F5DC]/55 border-transparent hover:text-[#F5F5DC]/80"
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <ShoppingBag size={16} />
                    <span>Orders</span>
                  </div>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => handleSidebarTabClick("inventory")}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 font-bold text-xs uppercase tracking-wider rounded-xl transition-all border text-left cursor-pointer ${
                    activeTab === "inventory"
                      ? "bg-[#B2AC88]/15 text-[#B2AC88] border-[#B2AC88]/25"
                      : "text-[#F5F5DC]/55 border-transparent hover:text-[#F5F5DC]/80"
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Package size={16} />
                    <span>My Products</span>
                  </div>
                </button>
                <button
                  onClick={() => handleSidebarTabClick("orders")}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 font-bold text-xs uppercase tracking-wider rounded-xl transition-all border text-left cursor-pointer ${
                    activeTab === "orders"
                      ? "bg-[#B2AC88]/15 text-[#B2AC88] border-[#B2AC88]/25"
                      : "text-[#F5F5DC]/55 border-transparent hover:text-[#F5F5DC]/80"
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <ShoppingBag size={16} />
                    <span>Orders</span>
                  </div>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Logout action only */}
        <div className="border-t border-[#B2AC88]/15 pt-4 space-y-2">
          {currentUserRole === "admin" && (
            <button
              onClick={() => handleSidebarTabClick("settings")}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 font-bold text-xs uppercase tracking-wider rounded-xl transition-all border text-left cursor-pointer ${
                activeTab === "settings"
                  ? "bg-[#B2AC88]/15 text-[#B2AC88] border-[#B2AC88]/25"
                  : "text-[#F5F5DC]/55 border-transparent hover:text-[#F5F5DC]/80"
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Settings size={16} />
                <span>Settings</span>
              </div>
            </button>
          )}
          {onLogout && (
            <button
              onClick={() => setShowDashboardLogoutConfirm(true)}
              className="w-full flex items-center space-x-2.5 px-3.5 py-2.5 font-bold text-xs uppercase tracking-wider rounded-xl text-left cursor-pointer transition-all border border-transparent text-red-400/70 hover:text-red-400 hover:bg-red-500/10"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              <span>Logout</span>
            </button>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto bg-[#f8fafc]">
        {/* Mobile Header Dashboard Banner */}
        <header className="lg:hidden flex items-center justify-between bg-[#36454F] text-[#F5F5DC] px-6 py-4 border-b border-[#B2AC88]/20 select-none shadow-xs w-full">
          <div className="flex items-center space-x-2">
            <button onClick={handleBackToHome} className="text-[#B2AC88] p-1">
              <ArrowLeft size={18} />
            </button>
            <div>
              <h2 className="text-md font-serif italic font-bold text-[#B2AC88] truncate max-w-[120px]">
                {currentUserRole === "admin" ? "HAWRISHA" : currentUserStoreName || "HAWRISHA"}
              </h2>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={activeTab}
              onChange={(e) => handleSidebarTabClick(e.target.value)}
              className="bg-[#36454F] text-[#B2AC88] border border-[#B2AC88]/30 rounded-lg text-xs font-bold px-2 py-1 outline-none cursor-pointer"
            >
              {currentUserRole === "admin" ? (
                <>
                  <option value="inventory">Inventory</option>
                  <option value="stores">Stores</option>
                  <option value="category">Category</option>
                  <option value="settings">Settings</option>
                  <option value="orders">Orders</option>
                </>
              ) : (
                <>
                  <option value="inventory">My Products</option>
                  <option value="orders">Orders</option>
                </>
              )}
            </select>
            <span className="bg-[#B2AC88] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              {products.length} items
            </span>
          </div>
        </header>

        {!isModalOpen && !isStoreModalOpen && (
          <div className={`p-6 lg:p-10 w-full mx-auto space-y-8 ${activeTab === "stores" ? "max-w-full px-4 lg:px-8" : "max-w-7xl"}`}>
            {activeTab === "inventory" && (
            <>
              {/* Dashboard Title & Quick Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
                <div>
                  <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#36454F] italic tracking-tight">
                    Products Inventory
                  </h1>
                  <p className="text-xs text-slate-400 mt-1 max-w-lg font-sans">
                    Review listed items, monitor categories, adjust pricing, and
                    add new inventory dynamically.
                  </p>
                </div>

                <button
                  onClick={handleOpenCreate}
                  className="px-6 py-3 bg-[#B2AC88] hover:bg-[#B2AC88]/90 text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center space-x-2 shadow-md cursor-pointer transition-colors active:scale-95 self-start sm:self-center"
                >
                  <Plus size={15} />
                  <span>Add New Product</span>
                </button>
              </div>

              {/* Stats Analytics Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Stat Card 1 – Total Items */}
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-[#B2AC88]/10 text-[#B2AC88] flex items-center justify-center shrink-0">
                    <Package size={22} />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Total Items
                    </span>
                    <h4 className="text-2xl font-bold text-[#36454F] mt-0.5">
                      {totalItems}
                    </h4>
                  </div>
                </div>

                {/* Stat Card 2 – Total Stock Available */}
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                    <Layers size={22} />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Pairs in Stock
                    </span>
                    <h4 className="text-2xl font-bold text-[#36454F] mt-0.5">
                      {totalStock.toLocaleString()}
                    </h4>
                  </div>
                </div>

                {/* Stat Card 3 – Low Stock Items */}
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs flex items-center space-x-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                      outOfStockItems > 0
                        ? "bg-red-50 text-red-500"
                        : "bg-green-50 text-green-500"
                    }`}
                  >
                    <AlertCircle size={22} />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Out of Stock
                    </span>
                    <h4
                      className={`text-2xl font-bold mt-0.5 ${
                        outOfStockItems > 0 ? "text-red-500" : "text-green-500"
                      }`}
                    >
                      {outOfStockItems}
                    </h4>
                  </div>
                </div>

                {/* Stat Card 4 – Total Sales */}
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
                    <TrendingUp size={22} />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Total Sales
                    </span>
                    <h4 className="text-2xl font-bold text-[#36454F] mt-0.5">
                      {totalSales.toLocaleString()}
                    </h4>
                  </div>
                </div>
              </div>

              {/* Products Table Card */}
              <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-2xs overflow-hidden">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                  <div className="flex items-center space-x-4">
                    <h3 className="font-bold text-xs uppercase tracking-wider text-gray-400">
                      Inventory Status
                    </h3>
                    {storeFilter && (
                      <button
                        onClick={() => setStoreFilter(null)}
                        className="text-[10px] uppercase font-bold tracking-wider text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-3 py-1 rounded-full transition-colors flex items-center space-x-1"
                      >
                        <span>Clear Filter</span>
                        <X size={12} />
                      </button>
                    )}
                  </div>
                </div>

                {loading ? (
                  <div className="py-24 text-center">
                    <div className="w-8 h-8 border-4 border-[#B2AC88] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-sm text-gray-500 font-semibold">
                      Loading catalog list...
                    </p>
                  </div>
                ) : products.length === 0 ? (
                  <div className="py-24 text-center">
                    <ImageIcon
                      className="mx-auto text-gray-300 mb-4 animate-pulse"
                      size={48}
                    />
                    <h4 className="text-md font-bold text-[#36454F] uppercase tracking-wider">
                      No Products Found
                    </h4>
                    <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto leading-relaxed">
                      Database is empty. Click "Add New Product" to populate
                      your inventory listings.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[700px]">
                      <thead>
                        <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest pb-3">
                          <th className="pb-3 pr-4 w-20">Preview</th>
                          <th className="pb-3 px-4">Title</th>
                          {currentUserRole === 'admin' && <th className="pb-3 px-4">Store</th>}
                          <th className="pb-3 px-4">Price</th>
                          {currentUserRole === 'admin' && <th className="pb-3 px-4">Comm. Split (Platform/Store)</th>}
                          <th className="pb-3 px-4">Stock</th>
                          <th className="pb-3 px-4">Badge / Label</th>
                          <th className="pb-3 pl-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100/60 text-sm">
                        {paginatedProducts.map((product) => (
                          <tr
                            key={product.id}
                            className="group hover:bg-slate-100 transition-colors"
                          >
                            <td className="py-4 pr-4">
                              {product.image_url ? (
                                <img
                                  src={
                                    product.image_url.startsWith("data:") ||
                                    product.image_url.startsWith("/")
                                      ? product.image_url
                                      : `/uploads/${product.image_url}`
                                  }
                                  alt=""
                                  className="w-12 h-16 object-cover rounded-xl border border-slate-100 bg-slate-50"
                                />
                              ) : (
                                <div className="w-12 h-16 bg-slate-100 rounded-xl flex items-center justify-center text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                                  No Pic
                                </div>
                              )}
                            </td>
                            <td className="py-4 px-4">
                              <span className="font-bold text-[#36454F] group-hover:text-[#B2AC88] transition-colors">
                                {getEnglishName(product.name)}
                              </span>
                            </td>
                            {currentUserRole === 'admin' && (
                              <td className="py-4 px-4 text-slate-500 font-semibold text-xs truncate max-w-[150px]" title={getEnglishName(product.vendor_name) || 'Admin'}>
                                {getEnglishName(product.vendor_name) || 'Admin'}
                              </td>
                            )}
                            <td className="py-4 px-4 font-bold text-[#36454F]">
                              {product.price.toLocaleString()} IQD
                            </td>
                            {currentUserRole === 'admin' && (() => {
                              const prodStore = stores.find(s => s.id === product.store_id);
                              const commPct = prodStore ? (prodStore.commission_percentage || 0) : 0;
                              const adminShare = product.admin_share > 0 ? product.admin_share : Math.round(product.price * (commPct / 100));
                              const storeShare = product.store_share > 0 ? product.store_share : (product.price - adminShare);
                              return (
                                <td className="py-4 px-4">
                                  {commPct > 0 ? (
                                    <div className="flex flex-col text-xs font-semibold">
                                      <span className="text-[#B2AC88]">Admin: {adminShare.toLocaleString()} IQD ({commPct}%)</span>
                                      <span className="text-slate-500">Store: {storeShare.toLocaleString()} IQD</span>
                                    </div>
                                  ) : (
                                    <span className="text-slate-400 text-xs">No commission set</span>
                                  )}
                                </td>
                              );
                            })()}
                            <td className="py-4 px-4 font-semibold text-xs text-[#36454F]">
                              {product.stock > 0 ? (
                                <span className="text-green-600 bg-green-50 px-2.5 py-1 rounded-full border border-green-100/50">
                                  {product.stock} pcs
                                </span>
                              ) : (
                                <span className="text-red-500 bg-red-50 px-2.5 py-1 rounded-full border border-red-100/50">
                                  Out of Stock
                                </span>
                              )}
                            </td>
                            <td className="py-4 px-4 whitespace-nowrap">
                              <div className="flex flex-wrap gap-1">
                                {parseJsonArray(product.badge).map((b, idx) => (
                                  <span
                                    key={idx}
                                    className="bg-[#B2AC88]/10 text-[#B2AC88] text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full"
                                  >
                                    {b}
                                  </span>
                                ))}
                                {parseJsonArray(product.badge).length === 0 && (
                                  <span className="text-slate-400 text-xs">-</span>
                                )}
                              </div>
                            </td>
                            <td className="py-4 pl-4 text-right space-x-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(product)}
                                className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-colors cursor-pointer"
                              >
                                <Edit2 size={15} />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const usedIn = checkProductInOrders(product);
                                  if (usedIn.length > 0) {
                                    setInUseModal({ open: true, itemName: product.name, usedIn });
                                  } else {
                                    setProductToDelete(product);
                                  }
                                }}
                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors cursor-pointer"
                              >
                                <Trash2 size={15} />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setIsViewOnly(true);
                                  setIsModalOpen(true);
                                  setEditingProduct(product);
                                  
                                  let parsedName = { en: "", ku: "", ar: "" };
                                  let parsedDesc = { en: "", ku: "", ar: "" };
                                  try {
                                    if (product.name && product.name.startsWith("{")) parsedName = JSON.parse(product.name);
                                    else parsedName.en = product.name || "";
                                  } catch (e) {}
                                  try {
                                    if (product.description && product.description.startsWith("{")) parsedDesc = JSON.parse(product.description);
                                    else parsedDesc.en = product.description || "";
                                  } catch (e) {}

                                  setNameEn(parsedName.en);
                                  setNameKu(parsedName.ku || "");
                                  setNameAr(parsedName.ar || "");
                                  setPrice(product.price || "");
                                  setProductStoreId(product.store_id || "");
                                  setCategory(parseJsonArray(product.category));
                                  setBadge(parseJsonArray(product.badge));
                                  setDescEn(parsedDesc.en);
                                  setDescKu(parsedDesc.ku || "");
                                  setDescAr(parsedDesc.ar || "");
                                  setImageFile(null);
                                  
                                  let previewUrl = "";
                                  if (product.image_url) {
                                    if (product.image_url.startsWith("http") || product.image_url.startsWith("data:") || product.image_url.startsWith("/")) {
                                      previewUrl = product.image_url;
                                    } else {
                                      previewUrl = "/uploads/" + product.image_url;
                                    }
                                  }
                                  setImagePreview(previewUrl);

                                  setStyleLength(parseJsonArray(product.style_length));
                                  setStock(product.stock || 0);
                                  setPromotion(parseJsonArray(product.promotion));
                                  setMaterial(parseJsonArray(product.material));
                                  setSeasonalType(parseJsonArray(product.seasonal_type));
                                  setSizeCollection(parseJsonArray(product.size_collection));
                                  setDiscount(product.discount || 0);
                                  setGender(product.gender || "");

                                  try {
                                    const mappedSizeColors = JSON.parse(product.size_colors || '{}');
                                    const idsSizeColors = {};
                                    Object.entries(mappedSizeColors).forEach(([size, colorClasses]) => {
                                      idsSizeColors[size] = colorClasses.map(cls => {
                                        const col = colorsList.find(c => c.class === cls);
                                        return col ? col.id : cls;
                                      });
                                    });
                                    setSizeColors(idsSizeColors);
                                  } catch (e) {
                                    setSizeColors({});
                                  }
                                  setShowValidation(false);
                                }}
                                title="View product details"
                                className="p-2 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-full transition-colors cursor-pointer"
                              >
                                <Eye size={15} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    
                    {/* Pagination Controls */}
                    <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-100 pt-5 mt-4 gap-4">
                      <span className="text-xs font-semibold text-slate-500 text-center sm:text-left">
                        Showing {(safePage - 1) * itemsPerPage + 1} to {Math.min(safePage * itemsPerPage, products.length)} of {products.length} items — Page {safePage} of {totalPages}
                      </span>
                      <div className="flex items-center space-x-1.5">
                        <button
                          type="button"
                          disabled={safePage === 1}
                          onClick={() => setDashboardPage((prev) => Math.max(1, prev - 1))}
                          className="px-3 py-1.5 border border-slate-200 text-slate-500 font-bold text-xs uppercase rounded-lg hover:bg-slate-50/80 disabled:opacity-40 disabled:hover:bg-transparent transition-all cursor-pointer disabled:cursor-not-allowed"
                        >
                          Prev
                        </button>

                        {[...Array(totalPages)].map((_, i) => {
                          const pageNum = i + 1;
                          const isActive = safePage === pageNum;
                          return (
                            <button
                              key={pageNum}
                              type="button"
                              onClick={() => setDashboardPage(pageNum)}
                              className={`w-8 h-8 flex items-center justify-center text-xs font-bold rounded-lg transition-all cursor-pointer border ${
                                isActive
                                  ? "bg-[#B2AC88] text-white border-[#B2AC88]"
                                  : "border-slate-200 text-slate-500 hover:bg-slate-50/80"
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}

                        <button
                          type="button"
                          disabled={safePage === totalPages}
                          onClick={() => setDashboardPage((prev) => Math.min(totalPages, prev + 1))}
                          className="px-3 py-1.5 border border-slate-200 text-slate-500 font-bold text-xs uppercase rounded-lg hover:bg-slate-50/80 disabled:opacity-40 disabled:hover:bg-transparent transition-all cursor-pointer disabled:cursor-not-allowed"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === "category" && (
            /* Category Management Panel */
            <div className="space-y-8">
              <div className="border-b border-slate-200 pb-5">
                <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#36454F] italic tracking-tight">
                  Category Settings
                </h1>
                <p className="text-xs text-slate-400 mt-1 max-w-lg font-sans">
                  Manage and configure every aspect of your store — from product
                  categories and labels to colors, sizes, and seasonal
                  collections.
                </p>
              </div>

              {/* Settings Sub-Tab Navigation */}
              <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3 mb-8">
                {[
                  { id: "categories", label: "Categories" },
                  { id: "badges", label: "Badges / Labels" },
                  { id: "colors", label: "Colors" },
                  { id: "styles", label: "Styles / Lengths" },
                  { id: "materials", label: "Materials" },
                  { id: "seasons", label: "Seasonal Types" },
                  { id: "sizes", label: "Size Collections" },
                  { id: "promotions", label: "Promotions" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setSettingsSubTab(tab.id)}
                    className={`px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all border cursor-pointer ${
                      settingsSubTab === tab.id
                        ? "bg-[#36454F] text-[#F5F5DC] border-[#36454F] shadow-sm"
                        : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-slate-800"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="w-full">
                {/* Category Subtab */}
                {settingsSubTab === "categories" && (
                  <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-2xs max-w-4xl mx-auto">
                    <h3 className="text-md font-bold text-[#36454F] mb-4 uppercase tracking-wider">
                      Product Categories
                    </h3>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleAddCategory(newCatEn, newCatKu, newCatAr);
                        setNewCatEn("");
                        setNewCatKu("");
                        setNewCatAr("");
                      }}
                      className="space-y-4 mb-6 pb-6 border-b border-slate-100"
                    >
                      <LangTextInput
                        label="New Category Name"
                        required
                        valueEn={newCatEn}
                        valueKu={newCatKu}
                        valueAr={newCatAr}
                        onChangeEn={setNewCatEn}
                        onChangeKu={setNewCatKu}
                        onChangeAr={setNewCatAr}
                        placeholder="Add custom category..."
                      />
                      <button
                        type="submit"
                        disabled={!newCatEn.trim() || !newCatKu.trim() || !newCatAr.trim()}
                        className="w-full py-2.5 bg-[#B2AC88] hover:bg-[#B2AC88]/90 text-white rounded-xl text-xs font-bold uppercase cursor-pointer transition-colors active:scale-95 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Add Category
                      </button>
                    </form>

                    <div className="divide-y divide-slate-100">
                      {categories.slice((settingsPage - 1) * 10, settingsPage * 10).map((cat) => {
                        let displayName = cat.name;
                        try {
                          if (cat.name && cat.name.startsWith("{")) {
                            const parsed = JSON.parse(cat.name);
                            displayName = parsed.en || cat.name;
                          }
                        } catch (e) {}
                        return (
                          <div
                            key={cat.id}
                            className="py-2.5 px-3 hover:bg-slate-100 rounded-xl flex items-center justify-between group transition-colors"
                          >
                            <span className="text-sm font-semibold text-slate-700">
                              {displayName}
                            </span>
                            <button
                              onClick={() => handleDeleteCategory(cat)}
                              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                    {renderSettingsPagination(categories.length)}
                  </div>
                )}

                {/* Badges Subtab */}
                {settingsSubTab === "badges" && (
                  <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-2xs max-w-4xl mx-auto">
                    <h3 className="text-md font-bold text-[#36454F] mb-4 uppercase tracking-wider">
                      Product Labels & Badges
                    </h3>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleAddBadge(newBadgeEn, newBadgeKu, newBadgeAr);
                        setNewBadgeEn("");
                        setNewBadgeKu("");
                        setNewBadgeAr("");
                      }}
                      className="space-y-4 mb-6 pb-6 border-b border-slate-100"
                    >
                      <LangTextInput
                        label="New Badge Name"
                        required
                        valueEn={newBadgeEn}
                        valueKu={newBadgeKu}
                        valueAr={newBadgeAr}
                        onChangeEn={setNewBadgeEn}
                        onChangeKu={setNewBadgeKu}
                        onChangeAr={setNewBadgeAr}
                        placeholder="Add custom badge label..."
                      />
                      <button
                        type="submit"
                        disabled={!newBadgeEn.trim() || !newBadgeKu.trim() || !newBadgeAr.trim()}
                        className="w-full py-2.5 bg-[#B2AC88] hover:bg-[#B2AC88]/90 text-white rounded-xl text-xs font-bold uppercase cursor-pointer transition-colors active:scale-95 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Add Badge
                      </button>
                    </form>

                    <div className="divide-y divide-slate-100">
                      {badges.slice((settingsPage - 1) * 10, settingsPage * 10).map((b) => {
                        let displayName = b.name;
                        try {
                          if (b.name && b.name.startsWith("{")) {
                            const parsed = JSON.parse(b.name);
                            displayName = parsed.en || b.name;
                          }
                        } catch (e) {}
                        return (
                          <div
                            key={b.id}
                            className="py-2.5 px-3 hover:bg-slate-100 rounded-xl flex items-center justify-between group transition-colors"
                          >
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                              {displayName}
                            </span>
                            <button
                              onClick={() => handleDeleteBadge(b)}
                              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                    {renderSettingsPagination(badges.length)}
                  </div>
                )}

                {/* Colors Subtab */}
                {settingsSubTab === "colors" && (
                  <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-2xs flex flex-col justify-between min-h-[500px] max-w-4xl mx-auto">
                    <div>
                      <h3 className="text-md font-bold text-[#36454F] mb-4 uppercase tracking-wider">
                        Color Swatch Collections
                      </h3>

                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (!newColorEn.trim()) return;

                          const words = newColorEn.trim().split(/\s+/);
                          const familyVal =
                            words.length > 0
                              ? words[words.length - 1].toLowerCase()
                              : "beige";

                          handleAddColor({
                            nameEn: newColorEn,
                            nameKu: newColorKu,
                            nameAr: newColorAr,
                            class: colorValue,
                            family: familyVal,
                          });

                          setNewColorEn("");
                          setNewColorKu("");
                          setNewColorAr("");
                          setColorValue("#000000");
                        }}
                        className="space-y-4 mb-5 bg-slate-50/50 p-4 rounded-2xl border border-slate-200"
                      >
                        <LangTextInput
                          label="Color Name"
                          required
                          valueEn={newColorEn}
                          valueKu={newColorKu}
                          valueAr={newColorAr}
                          onChangeEn={setNewColorEn}
                          onChangeKu={setNewColorKu}
                          onChangeAr={setNewColorAr}
                          placeholder="Color Name"
                        />
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                            Select Swatch Color
                          </label>
                          <div className="flex items-center space-x-3 bg-white p-2 rounded-xl border border-slate-200 shadow-xs">
                            <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-slate-200 flex-shrink-0">
                              <input
                                type="color"
                                value={colorValue}
                                onChange={(e) => setColorValue(e.target.value)}
                                className="absolute inset-0 w-full h-full p-0 border-0 cursor-pointer scale-150"
                              />
                            </div>
                            <input
                              type="text"
                              value={colorValue}
                              onChange={(e) => setColorValue(e.target.value)}
                              placeholder="#FFFFFF"
                              className="flex-1 border-0 p-0 text-xs font-mono font-bold focus:outline-none focus:ring-0 text-black bg-white"
                            />
                          </div>
                        </div>
                        <button
                          type="submit"
                          disabled={!newColorEn.trim() || !newColorKu.trim() || !newColorAr.trim()}
                          className="w-full py-2.5 bg-[#B2AC88] hover:bg-[#B2AC88]/90 text-white rounded-xl text-xs font-bold uppercase cursor-pointer transition-colors active:scale-95 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Add Color Swatch
                        </button>
                      </form>
                      <div className="w-full border-b border-slate-100 mb-6"></div>
                    </div>

                    <div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {colorsList.slice((settingsPage - 1) * 10, settingsPage * 10).map((color) => {
                          let displayName = color.name;
                          try {
                            if (color.name && color.name.startsWith("{")) {
                              const parsed = JSON.parse(color.name);
                              displayName = parsed.en || color.name;
                            }
                          } catch (e) {}
                          return (
                            <div
                              key={color.id}
                              className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-xl group hover:bg-slate-100 transition-all shadow-xs"
                            >
                              <div className="flex items-center space-x-2.5">
                                <span
                                  className={`w-5 h-5 rounded-full border border-gray-200/50 ${color.class && color.class.startsWith("bg-") ? color.class : ""}`}
                                  style={getColorStyle(color.class)}
                                />
                                <div>
                                  <p className="text-xs font-bold text-slate-700">
                                    {displayName}
                                  </p>
                                </div>
                              </div>
                              <button
                                onClick={() => handleDeleteColor(color)}
                                className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    {renderSettingsPagination(colorsList.length)}
                  </div>
                )}

                {/* Styles / Lengths Subtab */}
                {settingsSubTab === "styles" && (
                  <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-2xs max-w-4xl mx-auto">
                    <h3 className="text-md font-bold text-[#36454F] mb-4 uppercase tracking-wider">
                      Product Styles & Lengths
                    </h3>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleAddStyle(newStyleEn, newStyleKu, newStyleAr);
                        setNewStyleEn("");
                        setNewStyleKu("");
                        setNewStyleAr("");
                      }}
                      className="space-y-4 mb-6 pb-6 border-b border-slate-100"
                    >
                      <LangTextInput
                        label="New Style Name"
                        required
                        valueEn={newStyleEn}
                        valueKu={newStyleKu}
                        valueAr={newStyleAr}
                        onChangeEn={setNewStyleEn}
                        onChangeKu={setNewStyleKu}
                        onChangeAr={setNewStyleAr}
                        placeholder="Add custom style..."
                      />
                      <button
                        type="submit"
                        disabled={!newStyleEn.trim() || !newStyleKu.trim() || !newStyleAr.trim()}
                        className="w-full py-2.5 bg-[#B2AC88] hover:bg-[#B2AC88]/90 text-white rounded-xl text-xs font-bold uppercase cursor-pointer transition-colors active:scale-95 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Add Style Option
                      </button>
                    </form>

                    <div className="divide-y divide-slate-100">
                      {styles.slice((settingsPage - 1) * 10, settingsPage * 10).map((style) => {
                        let displayName = style.name;
                        try {
                          if (style.name && style.name.startsWith("{")) {
                            const parsed = JSON.parse(style.name);
                            displayName = parsed.en || style.name;
                          }
                        } catch (e) {}
                        return (
                          <div
                            key={style.id}
                            className="py-2.5 px-3 hover:bg-slate-100 rounded-xl flex items-center justify-between group transition-colors"
                          >
                            <span className="text-sm font-semibold text-slate-700">
                              {displayName}
                            </span>
                            <button
                              onClick={() => handleDeleteStyle(style)}
                              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                    {renderSettingsPagination(styles.length)}
                  </div>
                )}

                {/* Materials Subtab */}
                {settingsSubTab === "materials" && (
                  <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-2xs max-w-4xl mx-auto">
                    <h3 className="text-md font-bold text-[#36454F] mb-4 uppercase tracking-wider">
                      Product Materials
                    </h3>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleAddMaterial(newMatEn, newMatKu, newMatAr);
                        setNewMatEn("");
                        setNewMatKu("");
                        setNewMatAr("");
                      }}
                      className="space-y-4 mb-6 pb-6 border-b border-slate-100"
                    >
                      <LangTextInput
                        label="New Material Name"
                        required
                        valueEn={newMatEn}
                        valueKu={newMatKu}
                        valueAr={newMatAr}
                        onChangeEn={setNewMatEn}
                        onChangeKu={setNewMatKu}
                        onChangeAr={setNewMatAr}
                        placeholder="Add custom material..."
                      />
                      <button
                        type="submit"
                        disabled={!newMatEn.trim() || !newMatKu.trim() || !newMatAr.trim()}
                        className="w-full py-2.5 bg-[#B2AC88] hover:bg-[#B2AC88]/90 text-white rounded-xl text-xs font-bold uppercase cursor-pointer transition-colors active:scale-95 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Add Material
                      </button>
                    </form>

                    <div className="divide-y divide-slate-100">
                      {materials.slice((settingsPage - 1) * 10, settingsPage * 10).map((mat) => {
                        let displayName = mat.name;
                        try {
                          if (mat.name && mat.name.startsWith("{")) {
                            const parsed = JSON.parse(mat.name);
                            displayName = parsed.en || mat.name;
                          }
                        } catch (e) {}
                        return (
                          <div
                            key={mat.id}
                            className="py-2.5 px-3 hover:bg-slate-100 rounded-xl flex items-center justify-between group transition-colors"
                          >
                            <span className="text-sm font-semibold text-slate-700">
                              {displayName}
                            </span>
                            <button
                              onClick={() => handleDeleteMaterial(mat)}
                              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                    {renderSettingsPagination(materials.length)}
                  </div>
                )}

                {/* Seasons Subtab */}
                {settingsSubTab === "seasons" && (
                  <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-2xs max-w-4xl mx-auto">
                    <h3 className="text-md font-bold text-[#36454F] mb-4 uppercase tracking-wider">
                      Seasonal Types
                    </h3>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleAddSeason(newSeasonEn, newSeasonKu, newSeasonAr);
                        setNewSeasonEn("");
                        setNewSeasonKu("");
                        setNewSeasonAr("");
                      }}
                      className="space-y-4 mb-6 pb-6 border-b border-slate-100"
                    >
                      <LangTextInput
                        label="New Seasonal Type Name"
                        required
                        valueEn={newSeasonEn}
                        valueKu={newSeasonKu}
                        valueAr={newSeasonAr}
                        onChangeEn={setNewSeasonEn}
                        onChangeKu={setNewSeasonKu}
                        onChangeAr={setNewSeasonAr}
                        placeholder="Add custom season..."
                      />
                      <button
                        type="submit"
                        disabled={!newSeasonEn.trim() || !newSeasonKu.trim() || !newSeasonAr.trim()}
                        className="w-full py-2.5 bg-[#B2AC88] hover:bg-[#B2AC88]/90 text-white rounded-xl text-xs font-bold uppercase cursor-pointer transition-colors active:scale-95 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Add Seasonal Type
                      </button>
                    </form>

                    <div className="divide-y divide-slate-100">
                      {seasons.slice((settingsPage - 1) * 10, settingsPage * 10).map((sea) => {
                        let displayName = sea.name;
                        try {
                          if (sea.name && sea.name.startsWith("{")) {
                            const parsed = JSON.parse(sea.name);
                            displayName = parsed.en || sea.name;
                          }
                        } catch (e) {}
                        return (
                          <div
                            key={sea.id}
                            className="py-2.5 px-3 hover:bg-slate-100 rounded-xl flex items-center justify-between group transition-colors"
                          >
                            <span className="text-sm font-semibold text-slate-700">
                              {displayName}
                            </span>
                            <button
                              onClick={() => handleDeleteSeason(sea)}
                              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                    {renderSettingsPagination(seasons.length)}
                  </div>
                )}

                {/* Sizes Subtab */}
                {settingsSubTab === "sizes" && (
                  <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-2xs max-w-4xl mx-auto">
                    <h3 className="text-md font-bold text-[#36454F] mb-4 uppercase tracking-wider">
                      Size Collections
                    </h3>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleAddSize(newSizeEn, newSizeKu, newSizeAr);
                        setNewSizeEn("");
                        setNewSizeKu("");
                        setNewSizeAr("");
                      }}
                      className="space-y-4 mb-6 pb-6 border-b border-slate-100"
                    >
                      <LangTextInput
                        label="New Size Collection"
                        required
                        valueEn={newSizeEn}
                        valueKu={newSizeKu}
                        valueAr={newSizeAr}
                        onChangeEn={setNewSizeEn}
                        onChangeKu={setNewSizeKu}
                        onChangeAr={setNewSizeAr}
                        placeholder="Add custom size..."
                      />
                      <button
                        type="submit"
                        disabled={!newSizeEn.trim() || !newSizeKu.trim() || !newSizeAr.trim()}
                        className="w-full py-2.5 bg-[#B2AC88] hover:bg-[#B2AC88]/90 text-white rounded-xl text-xs font-bold uppercase cursor-pointer transition-colors active:scale-95 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Add Size
                      </button>
                    </form>

                    <div className="divide-y divide-slate-100">
                      {sizes.slice((settingsPage - 1) * 10, settingsPage * 10).map((sz) => {
                        let displayName = sz.name;
                        try {
                          if (sz.name && sz.name.startsWith("{")) {
                            const parsed = JSON.parse(sz.name);
                            displayName = parsed.en || sz.name;
                          }
                        } catch (e) {}
                        return (
                          <div
                            key={sz.id}
                            className="py-2.5 px-3 hover:bg-slate-100 rounded-xl flex items-center justify-between group transition-colors"
                          >
                            <span className="text-sm font-semibold text-slate-700">
                              {displayName}
                            </span>
                            <button
                              onClick={() => handleDeleteSize(sz)}
                              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                    {renderSettingsPagination(sizes.length)}
                  </div>
                )}

                {/* Promotions Subtab */}
                {settingsSubTab === "promotions" && (
                  <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-2xs max-w-4xl mx-auto">
                    <h3 className="text-md font-bold text-[#36454F] mb-4 uppercase tracking-wider">
                      Promotions & Discounts Campaign labels
                    </h3>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleAddPromotion(newPromoEn, newPromoKu, newPromoAr);
                        setNewPromoEn("");
                        setNewPromoKu("");
                        setNewPromoAr("");
                      }}
                      className="space-y-4 mb-6 pb-6 border-b border-slate-100"
                    >
                      <LangTextInput
                        label="New Promotion Campaign Label"
                        required
                        valueEn={newPromoEn}
                        valueKu={newPromoKu}
                        valueAr={newPromoAr}
                        onChangeEn={setNewPromoEn}
                        onChangeKu={setNewPromoKu}
                        onChangeAr={setNewPromoAr}
                        placeholder="Add custom promotion label..."
                      />
                      <button
                        type="submit"
                        disabled={!newPromoEn.trim() || !newPromoKu.trim() || !newPromoAr.trim()}
                        className="w-full py-2.5 bg-[#B2AC88] hover:bg-[#B2AC88]/90 text-white rounded-xl text-xs font-bold uppercase cursor-pointer transition-colors active:scale-95 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Add Promotion Campaign
                      </button>
                    </form>

                    <div className="divide-y divide-slate-100">
                      {promotions.slice((settingsPage - 1) * 10, settingsPage * 10).map((promo) => {
                        let displayName = promo.name;
                        try {
                          if (promo.name && promo.name.startsWith("{")) {
                            const parsed = JSON.parse(promo.name);
                            displayName = parsed.en || promo.name;
                          }
                        } catch (e) {}
                        return (
                          <div
                            key={promo.id}
                            className="py-2.5 px-3 hover:bg-slate-100 rounded-xl flex items-center justify-between group transition-colors"
                          >
                            <span className="text-sm font-semibold text-slate-700">
                              {displayName}
                            </span>
                            <button
                              onClick={() => handleDeletePromotion(promo)}
                              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                    {renderSettingsPagination(promotions.length)}
                  </div>
                )}

              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="space-y-8">
              <div className="border-b border-slate-200 pb-5">
                <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#36454F] italic tracking-tight">
                  System Settings
                </h1>
                <p className="text-xs text-slate-400 mt-1 max-w-lg font-sans">
                  Manage core settings of your platform.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
                {/* General Settings */}
                <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-2xs h-fit">
                  <h3 className="text-md font-bold text-[#36454F] mb-4 uppercase tracking-wider">
                    General Settings
                  </h3>
                  <div className="space-y-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Order Cancellation Time Limit (in minutes) *
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={cancellationLimit}
                        onChange={(e) => setCancellationLimit(e.target.value)}
                        className="w-full border border-slate-200 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B2AC88]/20 focus:border-[#B2AC88] text-black transition-all bg-white"
                        placeholder="e.g. 15"
                      />
                      <p className="text-[10px] text-slate-400 mt-1.5 font-semibold leading-relaxed">
                        Users will only be allowed to cancel their orders within this time limit after placing them.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleSaveGeneralSettings}
                      disabled={!cancellationLimit || Number(cancellationLimit) < 1}
                      className="w-full py-2.5 bg-[#B2AC88] hover:bg-[#B2AC88]/90 text-white rounded-xl text-xs font-bold uppercase cursor-pointer transition-colors active:scale-95 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Save Settings
                    </button>
                  </div>
                </div>

                {/* Cities List and Add */}
                <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-2xs flex flex-col">
                  <h3 className="text-md font-bold text-[#36454F] mb-4 uppercase tracking-wider">
                    Cities Management
                  </h3>
                  
                  {/* Add City Form */}
                  <form onSubmit={handleAddCity} className="space-y-4 mb-6 pb-6 border-b border-slate-100">
                    <div className="flex flex-col gap-4">
                      <TrilingualInput
                        label="City Name *"
                        valueEn={newCityEn}
                        valueKu={newCityKu}
                        valueAr={newCityAr}
                        onChangeEn={setNewCityEn}
                        onChangeKu={setNewCityKu}
                        onChangeAr={setNewCityAr}
                      />
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          className="py-2.5 px-6 bg-[#36454F] hover:bg-[#36454F]/90 text-white rounded-xl text-xs font-bold uppercase cursor-pointer transition-colors active:scale-95 shadow-sm sm:w-auto w-full"
                        >
                          Add City
                        </button>
                      </div>
                    </div>
                  </form>

                  {/* Cities List Table */}
                  <div className="overflow-x-auto max-h-[250px] overflow-y-auto pr-1">
                    {citiesList.length === 0 ? (
                      <p className="text-center text-xs text-slate-400 py-6 font-semibold">No cities registered yet.</p>
                    ) : (
                      <table className="w-full text-left text-xs font-sans">
                        <thead>
                          <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                            <th className="py-2.5">Name</th>
                            <th className="py-2.5 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {citiesList.map((city) => (
                            <tr key={city.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                              <td className="py-2.5 font-bold text-[#36454F]">
                                {city.name.startsWith('{') ? JSON.parse(city.name).en : city.name}
                              </td>
                              <td className="py-2.5 text-right">
                                <button
                                  type="button"
                                  onClick={() => setCityToDelete(city.id)}
                                  className="text-red-500 hover:text-red-750 font-bold cursor-pointer transition-colors"
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "stores" && (
            <div className="space-y-8">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
                <div>
                  <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#36454F] italic tracking-tight">
                    Stores Management
                  </h1>
                  <p className="text-xs text-slate-400 mt-1 max-w-lg font-sans">
                    Monitor registered socks stores, approve new vendors, edit store parameters, or delete stores.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEditingStore(null);
                    setStoreNameEn("");
                    setStoreNameKu("");
                    setStoreNameAr("");
                    setStoreDescriptionEn("");
                    setStoreDescriptionKu("");
                    setStoreDescriptionAr("");
                    setStoreOwnerName("");
                    setStoreEmail("");
                    setStorePhone("+964");
                    setStoreCityEn("");
                    setStoreCityKu("");
                    setStoreCityAr("");
                    setStoreAddress("");
                    setStorePassword("");
                    setShowStorePassword(false);
                    setIsViewOnly(false);
                    setStoreLogoFile(null);
                    setStoreBannerFile(null);
                    setStoreLogoPreview("");
                    setStoreBannerPreview("");
                    setStoreFormErrors({});
                    setIsStoreModalOpen(true);
                  }}
                  className="px-6 py-3 bg-[#B2AC88] hover:bg-[#B2AC88]/90 text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center space-x-2 shadow-md cursor-pointer transition-colors active:scale-95 self-start sm:self-center"
                >
                  <Plus size={15} />
                  <span>Create New Store</span>
                </button>
              </div>

              {/* Stores Analytics Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-[#B2AC88]/10 text-[#B2AC88] flex items-center justify-center shrink-0">
                    <Store size={22} />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Stores</span>
                    <h4 className="text-2xl font-bold text-[#36454F] mt-0.5">{adminStats.totalStores}</h4>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-green-50 text-green-500 flex items-center justify-center shrink-0">
                    <Store size={22} />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Active</span>
                    <h4 className="text-2xl font-bold text-green-500 mt-0.5">{adminStats.activeStores}</h4>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
                    <Store size={22} />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Pending</span>
                    <h4 className="text-2xl font-bold text-amber-500 mt-0.5">{adminStats.pendingStores}</h4>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-red-50 text-red-500 flex items-center justify-center shrink-0">
                    <Store size={22} />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Suspended</span>
                    <h4 className="text-2xl font-bold text-red-500 mt-0.5">{adminStats.suspendedStores || 0}</h4>
                  </div>
                </div>
              </div>

              {/* Stores Table */}
              <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-2xs">
                <h3 className="font-bold text-xs uppercase tracking-wider text-gray-400 mb-6">Registered Stores</h3>

                {stores.length === 0 ? (
                  <div className="py-24 text-center">
                    <Store className="mx-auto text-gray-300 mb-4" size={48} />
                    <h4 className="text-md font-bold text-[#36454F] uppercase tracking-wider">No Stores Found</h4>
                    <p className="text-xs text-gray-500 mt-1">Create a store to get started.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[900px]">
                      <thead>
                        <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          <th className="pb-3 pr-4 w-14">Logo</th>
                          <th className="pb-3 px-4">Store Name</th>
                          <th className="pb-3 px-4">Owner</th>
                          <th className="pb-3 px-4">Email</th>
                          <th className="pb-3 px-4">Phone</th>
                          <th className="pb-3 px-4">City</th>
                          <th className="pb-3 px-4">Products</th>
                          <th className="pb-3 px-4 text-center">Comm. %</th>
                          <th className="pb-3 px-4">Status</th>
                          <th className="pb-3 pl-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100/60 text-sm">
                        {paginatedStores.map((store) => (
                          <tr key={store.id} className="group hover:bg-slate-50 transition-colors">
                            {/* Logo */}
                            <td className="py-4 pr-4">
                              {store.logo ? (
                                <img
                                  src={store.logo.startsWith('/') ? store.logo : `/uploads/${store.logo}`}
                                  alt={getEnglishName(store.name)}
                                  className="w-10 h-10 object-cover rounded-xl border border-slate-100 bg-slate-50"
                                />
                              ) : (
                                <div className="w-10 h-10 bg-[#36454F] rounded-xl flex items-center justify-center text-[#F5F5DC] font-bold text-sm">
                                  {store.name ? getEnglishName(store.name).charAt(0).toUpperCase() : 'S'}
                                </div>
                              )}
                            </td>
                            {/* Store Name */}
                            <td className="py-4 px-4">
                              <span className="font-bold text-[#36454F] group-hover:text-[#B2AC88] transition-colors block">{getEnglishName(store.name)}</span>
                              <span className="text-[10px] text-slate-400 font-mono">ID #{store.id}</span>
                            </td>
                            {/* Owner */}
                            <td className="py-4 px-4 text-slate-600 font-semibold text-xs">{store.owner_name || '—'}</td>
                            {/* Email */}
                            <td className="py-4 px-4 text-slate-500 text-xs truncate max-w-[160px]">{store.email}</td>
                            {/* Phone */}
                            <td className="py-4 px-4 text-slate-500 text-xs font-mono">{store.phone || '—'}</td>
                            {/* City */}
                            <td className="py-4 px-4 text-slate-500 text-xs">{getEnglishName(store.city) || '—'}</td>
                            {/* Products count */}
                            <td className="py-4 px-4">
                              <span className="text-xs font-bold text-[#36454F] bg-[#B2AC88]/10 px-2.5 py-1 rounded-full">
                                {store.productCount ?? 0} items
                              </span>
                            </td>
                            {/* Commission */}
                            <td className="py-4 px-4 text-center">
                              <span className="text-xs font-bold text-slate-500">
                                {store.commission_percentage || 0}%
                              </span>
                            </td>
                            {/* Status badge + dropdown */}
                            <td className="py-4 px-4">
                              <select
                                value={store.status}
                                onChange={(e) => handleUpdateStoreStatus(store.id, e.target.value)}
                                className={`border text-[10px] font-bold px-2 py-1 rounded-lg outline-none cursor-pointer transition-colors ${
                                  store.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' :
                                  store.status === 'Pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                  'bg-red-50 text-red-700 border-red-200'
                                }`}
                              >
                                <option value="Active">Active</option>
                                <option value="Pending">Pending</option>
                                <option value="Suspended">Suspended</option>
                              </select>
                            </td>
                            {/* Actions */}
                            <td className="py-4 pl-4 text-right space-x-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => {
                                  setIsViewOnly(false);
                                  setEditingStore(store);

                                  let parsedName = { en: "", ku: "", ar: "" };
                                  let parsedDesc = { en: "", ku: "", ar: "" };
                                  let parsedCity = { en: "", ku: "", ar: "" };
                                  try {
                                    if (store.name && store.name.startsWith("{")) parsedName = JSON.parse(store.name);
                                    else parsedName.en = store.name || "";
                                  } catch (e) {}
                                  try {
                                    if (store.description && store.description.startsWith("{")) parsedDesc = JSON.parse(store.description);
                                    else parsedDesc.en = store.description || "";
                                  } catch (e) {}
                                  try {
                                    if (store.city && store.city.startsWith("{")) parsedCity = JSON.parse(store.city);
                                    else parsedCity.en = store.city || "";
                                  } catch (e) {}

                                  setStoreNameEn(parsedName.en || "");
                                  setStoreNameKu(parsedName.ku || "");
                                  setStoreNameAr(parsedName.ar || "");
                                  setStoreDescriptionEn(parsedDesc.en || "");
                                  setStoreDescriptionKu(parsedDesc.ku || "");
                                  setStoreDescriptionAr(parsedDesc.ar || "");
                                  setStoreOwnerName(store.owner_name || '');
                                  setStoreEmail(store.email || '');
                                  setStorePhone(formatIraqiPhone(store.phone || ''));
                                  setStoreCityEn(parsedCity.en || "");
                                  setStoreCityKu(parsedCity.ku || "");
                                  setStoreCityAr(parsedCity.ar || "");
                                  setStoreAddress(store.address || '');
                                  setStorePassword('');
                                  setShowStorePassword(false);
                                  setStoreCommission(store.commission_percentage || 0);
                                  setStoreLogoPreview(store.logo ? (store.logo.startsWith('/') || store.logo.startsWith('http') ? store.logo : `/uploads/${store.logo}`) : "");
                                  setStoreBannerPreview(store.banner ? (store.banner.startsWith('/') || store.banner.startsWith('http') ? store.banner : `/uploads/${store.banner}`) : "");
                                  const sl = store.social_links || {};
                                  setStoreSocialLinks({ facebook: sl.facebook || '', instagram: sl.instagram || '', tiktok: sl.tiktok || sl.twitter || '' });
                                  setStoreLogoFile(null);
                                  setStoreBannerFile(null);
                                  setStoreFormErrors({});
                                  setIsStoreModalOpen(true);
                                }}
                                className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-colors cursor-pointer"
                              >
                                <Edit2 size={15} />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const usedIn = checkStoreInOrders(store);
                                  if (usedIn.length > 0) {
                                    setInUseModal({ open: true, itemName: store.name, usedIn });
                                    return;
                                  }
                                  setConfirmModal({
                                    open: true,
                                    message: `Are you sure you want to delete store "${getEnglishName(store.name)}"? This will delete all products belonging to this store.`,
                                    onConfirm: () => {
                                      handleDeleteStore(store.id);
                                      setConfirmModal({ open: false, message: '', onConfirm: null });
                                    }
                                  });
                                }}
                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors cursor-pointer"
                              >
                                <Trash2 size={15} />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setStoreFilter(store.id);
                                  setActiveTab('inventory');
                                }}
                                className="p-2 text-slate-400 hover:text-purple-500 hover:bg-purple-50 rounded-full transition-colors cursor-pointer"
                                title="View Store Products"
                              >
                                <Package size={15} />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setIsViewOnly(true);
                                  setIsStoreModalOpen(true);
                                  setEditingStore(store);

                                  let parsedName = { en: "", ku: "", ar: "" };
                                  let parsedDesc = { en: "", ku: "", ar: "" };
                                  let parsedCity = { en: "", ku: "", ar: "" };
                                  try {
                                    if (store.name && store.name.startsWith("{")) parsedName = JSON.parse(store.name);
                                    else parsedName.en = store.name || "";
                                  } catch (e) {}
                                  try {
                                    if (store.description && store.description.startsWith("{")) parsedDesc = JSON.parse(store.description);
                                    else parsedDesc.en = store.description || "";
                                  } catch (e) {}
                                  try {
                                    if (store.city && store.city.startsWith("{")) parsedCity = JSON.parse(store.city);
                                    else parsedCity.en = store.city || "";
                                  } catch (e) {}

                                  setStoreNameEn(parsedName.en);
                                  setStoreNameKu(parsedName.ku || "");
                                  setStoreNameAr(parsedName.ar || "");
                                  
                                  setStoreDescriptionEn(parsedDesc.en);
                                  setStoreDescriptionKu(parsedDesc.ku || "");
                                  setStoreDescriptionAr(parsedDesc.ar || "");

                                  setStoreCityEn(parsedCity.en);
                                  setStoreCityKu(parsedCity.ku || "");
                                  setStoreCityAr(parsedCity.ar || "");

                                  setStoreOwnerName(store.owner_name || "");
                                  setStoreEmail(store.email || "");
                                  setStorePhone(store.phone || "+964 ");
                                  setStoreAddress(store.address || "");
                                  setStoreCommission(store.commission_percentage || 0);
                                  
                                  try {
                                    setStoreSocialLinks(typeof store.social_links === 'string' ? JSON.parse(store.social_links) : (store.social_links || { facebook: "", instagram: "", tiktok: "" }));
                                  } catch(e) {
                                    setStoreSocialLinks({ facebook: "", instagram: "", tiktok: "" });
                                  }
                                  
                                  setStorePassword("");
                                  setStoreLogoFile(null);
                                  setStoreBannerFile(null);
                                  
                                  setStoreLogoPreview(store.logo ? (store.logo.startsWith('/') || store.logo.startsWith('http') ? store.logo : `/uploads/${store.logo}`) : "");
                                  setStoreBannerPreview(store.banner ? (store.banner.startsWith('/') || store.banner.startsWith('http') ? store.banner : `/uploads/${store.banner}`) : "");
                                  
                                  setStoreFormErrors({});
                                }}
                                title="View store details"
                                className="p-2 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-full transition-colors cursor-pointer"
                              >
                                <Eye size={15} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Pagination Controls */}
                    <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-100 pt-5 mt-4 gap-4">
                      <span className="text-xs font-semibold text-slate-500 text-center sm:text-left">
                        Showing {(safestoresPage - 1) * itemsPerPage + 1} to {Math.min(safestoresPage * itemsPerPage, stores.length)} of {stores.length} stores — Page {safestoresPage} of {storesTotalPages}
                      </span>
                      <div className="flex items-center space-x-1.5">
                        <button
                          type="button"
                          disabled={safestoresPage === 1}
                          onClick={() => setStoresPage((prev) => Math.max(1, prev - 1))}
                          className="px-3 py-1.5 border border-slate-200 text-slate-500 font-bold text-xs uppercase rounded-lg hover:bg-slate-50/80 disabled:opacity-40 disabled:hover:bg-transparent transition-all cursor-pointer disabled:cursor-not-allowed"
                        >
                          Prev
                        </button>

                        {[...Array(storesTotalPages)].map((_, i) => {
                          const pageNum = i + 1;
                          const isActive = safestoresPage === pageNum;
                          return (
                            <button
                              key={pageNum}
                              type="button"
                              onClick={() => setStoresPage(pageNum)}
                              className={`w-8 h-8 flex items-center justify-center text-xs font-bold rounded-lg transition-all cursor-pointer border ${
                                isActive
                                  ? 'bg-[#B2AC88] text-white border-[#B2AC88]'
                                  : 'border-slate-200 text-slate-500 hover:bg-slate-50/80'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}

                        <button
                          type="button"
                          disabled={safestoresPage === storesTotalPages}
                          onClick={() => setStoresPage((prev) => Math.min(storesTotalPages, prev + 1))}
                          className="px-3 py-1.5 border border-slate-200 text-slate-500 font-bold text-xs uppercase rounded-lg hover:bg-slate-50/80 disabled:opacity-40 disabled:hover:bg-transparent transition-all cursor-pointer disabled:cursor-not-allowed"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}


          {activeTab === "analytics" && (
            <div className="space-y-8">
              {/* Header */}
              <div className="border-b border-slate-200 pb-5">
                <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#36454F] italic tracking-tight">
                  Sales Analytics
                </h1>
                <p className="text-xs text-slate-400 mt-1 max-w-lg font-sans">
                  Real-time analytics for your store. View sales statistics, items sold, and top-selling product performances.
                </p>
              </div>

              {/* Vendor Analytics Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
                    <TrendingUp size={22} />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Sales</span>
                    <h4 className="text-md font-bold text-emerald-600 mt-0.5 truncate">{(vendorStats.totalSales || 0).toLocaleString()} IQD</h4>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-[#B2AC88]/10 text-[#B2AC88] flex items-center justify-center shrink-0">
                    <ShoppingBag size={22} />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Items Sold</span>
                    <h4 className="text-2xl font-bold text-[#36454F] mt-0.5">{vendorStats.itemsSold || 0} pairs</h4>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                    <Package size={22} />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Orders</span>
                    <h4 className="text-2xl font-bold text-[#36454F] mt-0.5">{vendorStats.totalOrders || 0}</h4>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-500 flex items-center justify-center shrink-0">
                    <Layers size={22} />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">My Products</span>
                    <h4 className="text-2xl font-bold text-[#36454F] mt-0.5">{vendorStats.totalProducts || 0}</h4>
                  </div>
                </div>
              </div>

              {/* Product Sales Performance Table */}
              <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-2xs">
                <h3 className="font-bold text-xs uppercase tracking-wider text-gray-400 mb-6">Product Performance</h3>

                {(!vendorStats.productSales || vendorStats.productSales.length === 0) ? (
                  <div className="py-16 text-center text-gray-400">
                    <BarChart2 className="mx-auto mb-3" size={36} />
                    <p className="text-sm font-medium">No sales logged for this store yet.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[500px]">
                      <thead>
                        <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest pb-3">
                          <th className="pb-3 pr-4">Product Name</th>
                          <th className="pb-3 px-4 text-center">Pairs Sold</th>
                          <th className="pb-3 px-4 text-right">Revenue Generated</th>
                          <th className="pb-3 pl-4 text-right w-48">Share %</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-sm">
                        {vendorStats.productSales.map((ps, idx) => {
                          const totalRev = vendorStats.totalSales || 1;
                          const percent = Math.round(((ps.sales || 0) / totalRev) * 100);
                          return (
                            <tr key={idx} className="hover:bg-slate-50/50">
                              <td className="py-4 pr-4 font-semibold text-[#36454F]">{getEnglishName(ps.product_name)}</td>
                              <td className="py-4 px-4 text-center text-slate-600 font-bold">{ps.quantity}</td>
                              <td className="py-4 px-4 text-right text-emerald-600 font-bold">{(ps.sales || 0).toLocaleString()} IQD</td>
                              <td className="py-4 pl-4 text-right">
                                <div className="flex items-center justify-end space-x-2">
                                  <div className="w-24 bg-slate-100 h-2 rounded-full overflow-hidden hidden sm:block">
                                    <div className="bg-[#B2AC88] h-full" style={{ width: `${percent}%` }} />
                                  </div>
                                  <span className="font-bold text-xs text-slate-500 w-8">{percent}%</span>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "orders" && (
            <div className="space-y-8">
              {/* Header */}
              <div className="border-b border-slate-200 pb-5">
                <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#36454F] italic tracking-tight">
                  Store Orders
                </h1>
                <p className="text-xs text-slate-400 mt-1 max-w-lg font-sans">
                  Manage incoming socks orders, update order fulfillments, and review shipping details.
                </p>
              </div>

              {/* Orders Stats */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {/* Total Orders */}
                <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-2xs flex items-center space-x-3">
                  <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center shrink-0">
                    <ShoppingBag size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Total</p>
                    <h3 className="text-2xl font-black text-[#36454F] leading-none">{orders.length}</h3>
                  </div>
                </div>

                {/* Pending */}
                <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-2xs flex items-center space-x-3">
                  <div className="w-10 h-10 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center shrink-0">
                    <Clock size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Pending</p>
                    <h3 className="text-2xl font-black text-amber-500 leading-none">{orders.filter(o => o.status === 'Pending').length}</h3>
                  </div>
                </div>

                {/* Accepted */}
                <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-2xs flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center shrink-0">
                    <CheckCircle size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Accepted</p>
                    <h3 className="text-2xl font-black text-blue-500 leading-none">{orders.filter(o => o.status === 'Accepted').length}</h3>
                  </div>
                </div>

                {/* Cancelled */}
                <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-2xs flex items-center space-x-3">
                  <div className="w-10 h-10 bg-red-50 text-red-500 rounded-xl flex items-center justify-center shrink-0">
                    <XCircle size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Cancelled</p>
                    <h3 className="text-2xl font-black text-red-500 leading-none">{orders.filter(o => o.status === 'Cancelled').length}</h3>
                  </div>
                </div>

                {/* Paid */}
                <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-2xs flex items-center space-x-3">
                  <div className="w-10 h-10 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center shrink-0">
                    <Check size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Paid</p>
                    <h3 className="text-2xl font-black text-emerald-500 leading-none">{orders.filter(o => o.status === 'Paid').length}</h3>
                  </div>
                </div>

                {/* Returned */}
                <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-2xs flex items-center space-x-3">
                  <div className="w-10 h-10 bg-orange-50 text-orange-500 rounded-xl flex items-center justify-center shrink-0">
                    <AlertTriangle size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Returned</p>
                    <h3 className="text-2xl font-black text-orange-500 leading-none">{orders.filter(o => o.status === 'Returned').length}</h3>
                  </div>
                </div>
              </div>

              {/* Orders Table */}
              <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-2xs">
                {(currentUserRole === "vendor" || currentUserRole === "admin") && (
                  <div className="flex flex-wrap gap-2 border-b border-slate-100 pb-4 mb-6">
                    {["All", "Pending", "Accepted", "Delivered", "Paid", "Returned", "Cancelled"].map((tab) => {
                      const count = tab === "All" ? orders.length : orders.filter(o => o.status === tab).length;
                      const isActive = vendorOrderTab === tab;
                      return (
                        <button
                          key={tab}
                          onClick={() => {
                            setVendorOrderTab(tab);
                            setOrdersPage(1);
                          }}
                          className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                            isActive
                              ? tab === "Pending"   ? "bg-amber-500 text-white shadow-xs"   :
                                tab === "Accepted"  ? "bg-blue-500 text-white shadow-xs"    :
                                tab === "Delivered" ? "bg-teal-500 text-white shadow-xs"    :
                                tab === "Paid"      ? "bg-emerald-500 text-white shadow-xs" :
                                tab === "Returned"  ? "bg-orange-500 text-white shadow-xs"  :
                                tab === "Cancelled" ? "bg-red-500 text-white shadow-xs"     :
                                "bg-slate-700 text-white shadow-xs"
                              : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          {tab} ({count})
                        </button>
                      );
                    })}
                  </div>
                )}

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-gray-400">Orders Log</h3>
                </div>

                {currentOrders.length === 0 ? (
                  <div className="py-24 text-center text-gray-400">
                    <ShoppingBag className="mx-auto mb-4" size={48} />
                    <h4 className="text-md font-bold text-[#36454F] uppercase tracking-wider">No Orders Found</h4>
                    <p className="text-xs text-gray-500 mt-1">Orders will populate here once customers place them.</p>
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse min-w-[900px]">
                        <thead>
                          <tr className="border-b border-slate-200">
                            <th className="py-4 px-3 font-bold text-[10px] uppercase tracking-wider text-gray-400">Order</th>
                            <th className="py-4 px-3 font-bold text-[10px] uppercase tracking-wider text-gray-400">Date</th>
<th className="py-4 px-3 font-bold text-[10px] uppercase tracking-wider text-gray-400">Customer</th>
                            {currentUserRole === "admin" && (
                              <th className="py-4 px-3 font-bold text-[10px] uppercase tracking-wider text-gray-400">Stores</th>
                            )}
                            <th className="py-4 px-3 font-bold text-[10px] uppercase tracking-wider text-gray-400">Items</th>
                            <th className="py-4 px-3 font-bold text-[10px] uppercase tracking-wider text-gray-400">Total</th>
                            <th className="py-4 px-3 font-bold text-[10px] uppercase tracking-wider text-gray-400">Status</th>
                            {!["Pending", "Accepted", "Returned", "Cancelled"].includes(vendorOrderTab) && (
                              <th className="py-4 px-3 font-bold text-[10px] uppercase tracking-wider text-emerald-500 text-center">Paid</th>
                            )}
                            {!["Pending", "Accepted", "Paid", "Cancelled"].includes(vendorOrderTab) && (
                              <th className="py-4 px-3 font-bold text-[10px] uppercase tracking-wider text-orange-400 text-center">Returned</th>
                            )}
                            <th className="py-4 px-3 font-bold text-[10px] uppercase tracking-wider text-gray-400 text-center">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {currentOrders.map((order, idx) => {
                            const totalItems = order.items ? order.items.reduce((acc, item) => acc + (item.quantity || 1), 0) : 0;
                            const totalAmount = currentUserRole === "admin" ? order.total : order.vendor_total;
                            const uniqueStores = order.items ? Array.from(new Set(order.items.map(i => getEnglishName(i.store_name)).filter(Boolean))).join(', ') : '';
                            const isPaid     = order.status === 'Paid';
                            const isReturned = order.status === 'Returned';
                            const isDelivered = order.status === 'Delivered';

                            return (
                              <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="py-4 px-3">
                                  <span className="font-serif italic font-bold text-[#B2AC88] text-sm">#{order.order_number}</span>
                                </td>
                                <td className="py-4 px-3">
                                  <div className="flex items-center space-x-1.5 text-xs text-[#36454F] font-semibold">
                                    <Calendar size={13} className="text-slate-400" />
                                    <span>{new Date(order.created_at).toLocaleDateString()}</span>
                                  </div>
                                </td>
                                <td className="py-4 px-3">
                                  <div className="flex flex-col">
                                    <span className="text-xs font-bold text-[#36454F]">{order.full_name}</span>
                                    <span className="text-[10px] text-slate-400 truncate max-w-[110px]">{order.province}</span>
                                  </div>
                                </td>
                                {currentUserRole === "admin" && (
                                  <td className="py-4 px-3">
                                    <span className="text-xs text-slate-500 font-semibold">{uniqueStores || '-'}</span>
                                  </td>
                                )}
                                <td className="py-4 px-3">
                                  <div className="flex items-center space-x-2">
                                    <Package size={14} className="text-slate-400" />
                                    <span className="text-xs font-bold text-[#36454F]">{totalItems}</span>
                                  </div>
                                </td>
                                <td className="py-4 px-3">
                                  <span className="text-xs font-bold text-emerald-600">{(totalAmount || 0).toLocaleString()} IQD</span>
                                </td>

                                {/* Status Badge */}
                                <td className="py-4 px-3">
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                                    order.status === 'Pending'   ? 'bg-amber-50 text-amber-600 border-amber-200'    :
                                    order.status === 'Accepted'  ? 'bg-blue-50 text-blue-600 border-blue-200'       :
                                    order.status === 'Delivered' ? 'bg-teal-50 text-teal-600 border-teal-200'       :
                                    order.status === 'Paid'      ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                                    order.status === 'Returned'  ? 'bg-orange-50 text-orange-600 border-orange-200' :
                                    order.status === 'Cancelled' ? 'bg-red-50 text-red-600 border-red-200'          :
                                    'bg-slate-50 text-slate-600 border-slate-200'
                                  }`}>{order.status}</span>
                                </td>

                                {/* Paid column */}
                                {!["Pending", "Accepted", "Returned", "Cancelled"].includes(vendorOrderTab) && (
                                  <td className="py-4 px-3 text-center">
                                    {isPaid ? (
                                      <span className="inline-flex items-center justify-center w-6 h-6 bg-emerald-100 rounded-full">
                                        <Check size={13} className="text-emerald-600" />
                                      </span>
                                    ) : isDelivered && currentUserRole === "admin" ? (
                                      <button
                                        onClick={() => setOrderToConfirm({ id: order.id, order_number: order.order_number, newStatus: "Paid" })}
                                        className="px-2 py-0.5 bg-emerald-50 hover:bg-emerald-500 text-emerald-600 hover:text-white border border-emerald-200 hover:border-emerald-500 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                                      >
                                        Paid
                                      </button>
                                    ) : (
                                      <span className="text-slate-200">—</span>
                                    )}
                                  </td>
                                )}

                                {/* Returned column */}
                                {!["Pending", "Accepted", "Paid", "Cancelled"].includes(vendorOrderTab) && (
                                  <td className="py-4 px-3 text-center">
                                    {isReturned ? (
                                      <span className="inline-flex items-center justify-center w-6 h-6 bg-orange-100 rounded-full">
                                        <AlertTriangle size={13} className="text-orange-600" />
                                      </span>
                                    ) : isDelivered && currentUserRole === "admin" ? (
                                      <button
                                        onClick={() => setOrderToConfirm({ id: order.id, order_number: order.order_number, newStatus: "Returned" })}
                                        className="px-2 py-0.5 bg-orange-50 hover:bg-orange-500 text-orange-600 hover:text-white border border-orange-200 hover:border-orange-500 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                                      >
                                        Return
                                      </button>
                                    ) : (
                                      <span className="text-slate-200">—</span>
                                    )}
                                  </td>
                                )}

                                {/* Action column */}
                                <td className="py-4 px-3 text-center">
                                  <div className="flex items-center justify-center space-x-1.5">
                                    {/* PENDING → Accept or Cancel */}
                                    {order.status === "Pending" && (
                                      <>
                                        <button
                                          onClick={() => setOrderToConfirm({ id: order.id, order_number: order.order_number, newStatus: "Accepted" })}
                                          className="px-2 py-1 bg-blue-50 hover:bg-blue-500 text-blue-600 hover:text-white border border-blue-200 hover:border-blue-500 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                                        >
                                          Accept
                                        </button>
                                        <button
                                          onClick={() => setOrderToConfirm({ id: order.id, order_number: order.order_number, newStatus: "Cancelled" })}
                                          className="px-2 py-1 bg-red-50 hover:bg-red-500 text-red-600 hover:text-white border border-red-200 hover:border-red-500 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                                        >
                                          Cancel
                                        </button>
                                      </>
                                    )}
                                    {/* ACCEPTED → Deliver only (admin) */}
                                    {order.status === "Accepted" && currentUserRole === "admin" && (
                                      <button
                                        onClick={() => setOrderToConfirm({ id: order.id, order_number: order.order_number, newStatus: "Delivered" })}
                                        className="px-2 py-1 bg-teal-50 hover:bg-teal-500 text-teal-600 hover:text-white border border-teal-200 hover:border-teal-500 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                                      >
                                        Delivered
                                      </button>
                                    )}
                                    {/* DELIVERED → Paid/Returned handled in dedicated columns above */}
                                    {/* PAID / RETURNED / CANCELLED → terminal, no further actions */}
                                    {(isPaid || isReturned || order.status === "Cancelled") && !["Paid", "Returned", "Cancelled"].includes(vendorOrderTab) && (
                                      <span className="text-[10px] text-slate-300 font-medium italic">—</span>
                                    )}

                                    {/* Eye / View details always shown */}
                                    <button
                                      onClick={() => setExpandedOrder(order)}
                                      className="p-1.5 text-slate-400 hover:text-[#B2AC88] bg-slate-50 hover:bg-[#B2AC88]/10 rounded-lg transition-colors inline-flex"
                                      title="View Order Details"
                                    >
                                      <Eye size={15} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    {ordersTotalPages > 1 && (
                      <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-between">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Showing {(safeOrdersPage - 1) * itemsPerPage + 1} to {Math.min(safeOrdersPage * itemsPerPage, orders.length)} of {orders.length} orders — Page {safeOrdersPage} of {ordersTotalPages}
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            disabled={safeOrdersPage === 1}
                            onClick={() => setOrdersPage((prev) => Math.max(1, prev - 1))}
                            className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-500 hover:bg-slate-50 hover:text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            Prev
                          </button>
                          <div className="flex items-center space-x-1">
                            {[...Array(ordersTotalPages)].map((_, i) => {
                              const pageNum = i + 1;
                              const isActive = safeOrdersPage === pageNum;
                              return (
                                <button
                                  key={pageNum}
                                  onClick={() => setOrdersPage(pageNum)}
                                  className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center transition-colors ${
                                    isActive
                                      ? "bg-[#B2AC88] text-white"
                                      : "text-slate-500 hover:bg-slate-100"
                                  }`}
                                >
                                  {pageNum}
                                </button>
                              );
                            })}
                          </div>
                          <button
                            disabled={safeOrdersPage === ordersTotalPages}
                            onClick={() => setOrdersPage((prev) => Math.min(ordersTotalPages, prev + 1))}
                            className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-500 hover:bg-slate-50 hover:text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}


          {activeTab === "profile" && (
            <div className="space-y-8">
              {/* Header */}
              <div className="border-b border-slate-200 pb-5">
                <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#36454F] italic tracking-tight">
                  Store Profile
                </h1>
                <p className="text-xs text-slate-400 mt-1 max-w-lg font-sans">
                  Customize your storefront presence. Update your store logo, cover banner, description, and social handles.
                </p>
              </div>

              {/* Store Profile Form */}
              <form onSubmit={handleVendorProfileSave} className="bg-white border border-slate-100 rounded-2xl p-8 shadow-2xs space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <LangTextInput
                      label="Store Name"
                      required
                      valueEn={storeNameEn}
                      valueKu={storeNameKu}
                      valueAr={storeNameAr}
                      onChangeEn={setStoreNameEn}
                      onChangeKu={setStoreNameKu}
                      onChangeAr={setStoreNameAr}
                      placeholder="Store Name"
                    />
                  </div>

                  {/* Owner Name */}
                  <div className="flex flex-col space-y-2">
                    <label className="text-xs uppercase tracking-wider font-bold text-[#36454F]">Owner Name *</label>
                    <input
                      type="text"
                      required
                      value={storeOwnerName}
                      onChange={(e) => setStoreOwnerName(e.target.value)}
                      className="border border-slate-200 px-4 py-2.5 rounded-xl text-sm text-black placeholder:text-gray-400 focus:ring-2 focus:ring-[#B2AC88]/20 focus:border-[#B2AC88] outline-none"
                    />
                  </div>

                  {/* Email */}
                  <div className="flex flex-col space-y-2">
                    <label className="text-xs uppercase tracking-wider font-bold text-[#36454F]">Contact Email *</label>
                    <input
                      type="email"
                      required
                      value={storeEmail}
                      onChange={(e) => setStoreEmail(e.target.value)}
                      className="border border-slate-200 px-4 py-2.5 rounded-xl text-sm text-black placeholder:text-gray-400 focus:ring-2 focus:ring-[#B2AC88]/20 focus:border-[#B2AC88] outline-none bg-slate-50 cursor-not-allowed"
                      disabled
                    />
                  </div>

                  {/* Phone */}
                  <div className="flex flex-col space-y-2">
                    <label className="text-xs uppercase tracking-wider font-bold text-[#36454F]">Contact Phone *</label>
                    <input
                      type="text"
                      required
                      value={storePhone}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val.length < 4) {
                          setStorePhone('+964');
                        } else {
                          setStorePhone(formatIraqiPhone(val));
                        }
                      }}
                      className="border border-slate-200 px-4 py-2.5 rounded-xl text-sm text-black placeholder:text-gray-400 focus:ring-2 focus:ring-[#B2AC88]/20 focus:border-[#B2AC88] outline-none"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <div className="flex flex-col space-y-2">
                      <label className="text-xs uppercase tracking-wider font-bold text-[#36454F]">
                        Store City <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={citiesList.find(c => {
                          const parsed = c.name.startsWith('{') ? JSON.parse(c.name) : { en: c.name, ku: "", ar: "" };
                          return parsed.en === storeCityEn && parsed.ku === storeCityKu && parsed.ar === storeCityAr;
                        })?.id || ""}
                        onChange={(e) => {
                          const selectedCity = citiesList.find(c => c.id.toString() === e.target.value);
                          if (selectedCity) {
                            const parsed = selectedCity.name.startsWith('{') ? JSON.parse(selectedCity.name) : { en: selectedCity.name, ku: "", ar: "" };
                            setStoreCityEn(parsed.en || "");
                            setStoreCityKu(parsed.ku || "");
                            setStoreCityAr(parsed.ar || "");
                          } else {
                            setStoreCityEn("");
                            setStoreCityKu("");
                            setStoreCityAr("");
                          }
                        }}
                        className="w-full border border-slate-200 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B2AC88]/20 focus:border-[#B2AC88] transition-all bg-white text-[#36454F] appearance-none cursor-pointer"
                      >
                        <option value="">Select a City</option>
                        {citiesList.map(city => {
                          const parsed = city.name.startsWith('{') ? JSON.parse(city.name) : { en: city.name };
                          return <option key={city.id} value={city.id}>{parsed.en}</option>;
                        })}
                      </select>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="flex flex-col space-y-2 md:col-span-2">
                    <label className="text-xs uppercase tracking-wider font-bold text-[#36454F]">Store Address</label>
                    <input
                      type="text"
                      value={storeAddress}
                      onChange={(e) => setStoreAddress(e.target.value)}
                      className="border border-slate-200 px-4 py-2.5 rounded-xl text-sm text-black placeholder:text-gray-400 focus:ring-2 focus:ring-[#B2AC88]/20 focus:border-[#B2AC88] outline-none"
                    />
                  </div>

                  {/* Description */}
                  <div className="md:col-span-2">
                    <LangTextInput
                      label="Store Description"
                      required
                      type="textarea"
                      valueEn={storeDescriptionEn}
                      valueKu={storeDescriptionKu}
                      valueAr={storeDescriptionAr}
                      onChangeEn={setStoreDescriptionEn}
                      onChangeKu={setStoreDescriptionKu}
                      onChangeAr={setStoreDescriptionAr}
                      placeholder="Store Description"
                    />
                  </div>
                </div>

                {/* Social links */}
                <div className="border-t border-slate-100 pt-6 space-y-4">
                  <h3 className="text-xs uppercase tracking-wider font-bold text-slate-400">Social Media Links</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {['facebook', 'instagram', 'twitter', 'website'].map((platform) => (
                      <div key={platform} className="flex flex-col space-y-1">
                        <label className="text-[10px] uppercase font-bold text-[#36454F] tracking-wide">{platform}</label>
                        <div className="relative">
                          <LinkIcon size={14} className="absolute left-3 top-3 text-slate-400" />
                          <input
                            type="text"
                            placeholder={`Link to ${platform}...`}
                            value={storeSocialLinks[platform] || ""}
                            onChange={(e) => setStoreSocialLinks({ ...storeSocialLinks, [platform]: e.target.value })}
                            className="w-full border border-slate-200 pl-9 pr-4 py-2 rounded-xl text-sm text-black focus:ring-2 focus:ring-[#B2AC88]/20 focus:border-[#B2AC88] outline-none"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Store Files (Logo & Banner) */}
                <div className="border-t border-slate-100 pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Logo upload */}
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-wider font-bold text-[#36454F]">Store Logo</label>
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center shrink-0">
                        {storeLogoPreview ? (
                          <img src={storeLogoPreview} alt="Logo" className="w-full h-full object-cover" />
                        ) : (
                          <Store size={24} className="text-slate-300" />
                        )}
                      </div>
                      <label className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-600 tracking-wider transition-colors cursor-pointer active:scale-95 shadow-sm">
                        Upload Logo
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              setStoreLogoFile(file);
                              setStoreLogoPreview(URL.createObjectURL(file));
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>

                  {/* Banner upload */}
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-wider font-bold text-[#36454F]">Store Banner / Cover Image</label>
                    <div className="flex items-center space-x-4">
                      <div className="w-24 h-12 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center shrink-0">
                        {storeBannerPreview ? (
                          <img src={storeBannerPreview} alt="Banner" className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon size={24} className="text-slate-300" />
                        )}
                      </div>
                      <label className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-600 tracking-wider transition-colors cursor-pointer active:scale-95 shadow-sm">
                        Upload Cover
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              setStoreBannerFile(file);
                              setStoreBannerPreview(URL.createObjectURL(file));
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-6 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-3 bg-[#36454F] hover:bg-[#36454F]/95 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors cursor-pointer active:scale-95 shadow-md flex items-center space-x-2"
                  >
                    <Upload size={14} />
                    <span>Save Store Profile</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
        )}

      {/* Elegant Add/Edit Store Page */}
      <AnimatePresence>
        {isStoreModalOpen && (
          <div className="p-6 lg:p-10 max-w-5xl w-full mx-auto flex-grow">
            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              className="bg-white rounded-3xl p-8 lg:p-12 w-full shadow-xs border border-slate-100 relative"
            >
              <button
                onClick={handleCloseStoreModal}
                className="absolute top-6 right-6 py-2 text-gray-400 hover:text-[#36454F] hover:bg-gray-100 rounded-full transition-all flex items-center gap-1.5 px-4 cursor-pointer"
              >
                <ArrowLeft size={16} /> <span className="text-[10px] font-bold uppercase tracking-wider hidden sm:inline">Back</span>
              </button>

              <h2 className="text-3xl font-serif italic font-bold text-[#36454F] mb-6 border-b pb-4 border-gray-100">
                {editingStore ? "Edit Store Profile" : "Create New Store"}
              </h2>

              <form
                onSubmit={handleStoreSubmit}
                className="space-y-5"
              >
                <fieldset disabled={isViewOnly} className="space-y-5">
                {/* 1. Name & Owner */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <LangTextInput
                      label="Store Name"
                      required
                      valueEn={storeNameEn}
                      valueKu={storeNameKu}
                      valueAr={storeNameAr}
                      onChangeEn={setStoreNameEn}
                      onChangeKu={setStoreNameKu}
                      onChangeAr={setStoreNameAr}
                      placeholder="Store Name"
                      error={!!storeFormErrors.storeName}
                      errorMessage={storeFormErrors.storeName}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs font-bold uppercase text-gray-500 mb-2 block">Owner Name *</label>
                    <input
                      type="text"
                      value={storeOwnerName}
                      onChange={(e) => { setStoreOwnerName(e.target.value); setStoreFormErrors(p => ({...p, storeOwnerName: ''})); }}
                      className={`w-full border px-4 py-3 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-[#B2AC88]/20 focus:border-[#B2AC88] text-black transition-all bg-white font-medium ${storeFormErrors.storeOwnerName ? 'border-red-400 bg-red-50' : 'border-slate-200'}`}
                    />
                    {storeFormErrors.storeOwnerName && <p className="text-[11px] text-red-500 mt-1 font-semibold">{storeFormErrors.storeOwnerName}</p>}
                  </div>
                </div>

                {/* 2. Email & Phone */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase text-gray-500 mb-2 block">Owner Email *</label>
                    <input
                      type="email"
                      value={storeEmail}
                      onChange={(e) => { setStoreEmail(e.target.value); setStoreFormErrors(p => ({...p, storeEmail: ''})); }}
                      className={`w-full border px-4 py-3 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-[#B2AC88]/20 focus:border-[#B2AC88] text-black transition-all bg-white font-medium ${storeFormErrors.storeEmail ? 'border-red-400 bg-red-50' : 'border-slate-200'}`}
                    />
                    {storeFormErrors.storeEmail && <p className="text-[11px] text-red-500 mt-1 font-semibold">{storeFormErrors.storeEmail}</p>}
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase text-gray-500 mb-2 block">Owner Phone *</label>
                    <input
                      type="text"
                      value={storePhone}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val.length < 4) {
                          setStorePhone('+964');
                        } else {
                          setStorePhone(formatIraqiPhone(val));
                        }
                        setStoreFormErrors(p => ({...p, storePhone: ''}));
                      }}
                      className={`w-full border px-4 py-3 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-[#B2AC88]/20 focus:border-[#B2AC88] text-black transition-all bg-white font-medium ${storeFormErrors.storePhone ? 'border-red-400 bg-red-50' : 'border-slate-200'}`}
                    />
                    {storeFormErrors.storePhone && <p className="text-[11px] text-red-500 mt-1 font-semibold">{storeFormErrors.storePhone}</p>}
                  </div>
                </div>


                {/* 3. City & Address */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <div className="flex flex-col space-y-2">
                      <label className="text-xs uppercase tracking-wider font-bold text-[#36454F]">
                        Store City <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={citiesList.find(c => {
                          const parsed = c.name.startsWith('{') ? JSON.parse(c.name) : { en: c.name, ku: "", ar: "" };
                          return parsed.en === storeCityEn && parsed.ku === storeCityKu && parsed.ar === storeCityAr;
                        })?.id || ""}
                        onChange={(e) => {
                          const selectedCity = citiesList.find(c => c.id.toString() === e.target.value);
                          if (selectedCity) {
                            const parsed = selectedCity.name.startsWith('{') ? JSON.parse(selectedCity.name) : { en: selectedCity.name, ku: "", ar: "" };
                            setStoreCityEn(parsed.en || "");
                            setStoreCityKu(parsed.ku || "");
                            setStoreCityAr(parsed.ar || "");
                          } else {
                            setStoreCityEn("");
                            setStoreCityKu("");
                            setStoreCityAr("");
                          }
                        }}
                        className={`w-full border px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B2AC88]/20 focus:border-[#B2AC88] transition-all bg-white appearance-none cursor-pointer ${
                          storeFormErrors?.storeCity ? "border-red-500 text-red-500" : "border-slate-200 text-[#36454F]"
                        }`}
                      >
                        <option value="">Select a City</option>
                        {citiesList.map(city => {
                          const parsed = city.name.startsWith('{') ? JSON.parse(city.name) : { en: city.name };
                          return <option key={city.id} value={city.id}>{parsed.en}</option>;
                        })}
                      </select>
                      {storeFormErrors?.storeCity && <p className="text-[11px] text-red-500 mt-1 font-semibold">{storeFormErrors.storeCity}</p>}
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs font-bold uppercase text-gray-500 mb-2 block">Address *</label>
                    <textarea
                      rows={2}
                      value={storeAddress}
                      onChange={(e) => { setStoreAddress(e.target.value); setStoreFormErrors(p => ({...p, storeAddress: ''})); }}
                      className={`w-full border px-4 py-3 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-[#B2AC88]/20 focus:border-[#B2AC88] text-black transition-all bg-white font-medium resize-none ${storeFormErrors.storeAddress ? 'border-red-400 bg-red-50' : 'border-slate-200'}`}
                    />
                    {storeFormErrors.storeAddress && <p className="text-[11px] text-red-500 mt-1 font-semibold">{storeFormErrors.storeAddress}</p>}
                  </div>
                </div>

                {/* 4. Description */}
                <div>
                  <LangTextInput
                    label="Store Description"
                    required
                    type="textarea"
                    valueEn={storeDescriptionEn}
                    valueKu={storeDescriptionKu}
                    valueAr={storeDescriptionAr}
                    onChangeEn={setStoreDescriptionEn}
                    onChangeKu={setStoreDescriptionKu}
                    onChangeAr={setStoreDescriptionAr}
                    placeholder="Store Description"
                    error={!!storeFormErrors.storeDescription}
                    errorMessage={storeFormErrors.storeDescription}
                  />
                </div>

                {/* 5. Social Media — Facebook, Instagram, TikTok */}
                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase text-gray-500 block">Social Media Links</label>
                  <div className="grid grid-cols-1 gap-3">
                    {[{ key: 'facebook', label: 'Facebook Link' }, { key: 'instagram', label: 'Instagram Link' }, { key: 'tiktok', label: 'TikTok Link' }].map(({ key, label }) => (
                      <div key={key} className="relative">
                        <LinkIcon size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          placeholder={`${label}...`}
                          value={storeSocialLinks[key] || ""}
                          onChange={(e) => setStoreSocialLinks({ ...storeSocialLinks, [key]: e.target.value })}
                          className="w-full border border-slate-200 pl-9 pr-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B2AC88]/20 focus:border-[#B2AC88] text-black bg-white font-medium"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* 6. Vendor Login Password */}
                <div>
                  <label className="text-xs font-bold uppercase text-gray-500 mb-2 block">
                    Vendor Login Password {editingStore ? <span className="text-slate-400 normal-case font-normal">(leave blank to keep current)</span> : <span className="text-red-400">*</span>}
                  </label>
                  <div className="relative">
                    <input
                      type={showStorePassword ? "text" : "password"}
                      value={storePassword}
                      onChange={(e) => { setStorePassword(e.target.value); setStoreFormErrors(p => ({...p, storePassword: ''})); }}
                      className={`w-full border px-4 py-3 pr-12 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-[#B2AC88]/20 focus:border-[#B2AC88] text-black transition-all bg-white font-medium ${storeFormErrors.storePassword ? 'border-red-400 bg-red-50' : 'border-slate-200'}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowStorePassword(!showStorePassword)}
                      style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#36454F', display: 'flex', alignItems: 'center', zIndex: 10 }}
                    >
                      {showStorePassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      )}
                    </button>
                  </div>
                  {storeFormErrors.storePassword && <p className="text-[11px] text-red-500 mt-1 font-semibold">{storeFormErrors.storePassword}</p>}
                </div>

                {/* 7. Commission Percentage */}
                <div>
                  <label className="text-xs font-bold uppercase text-gray-500 mb-2 block">
                    Commission Percentage (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={storeCommission}
                    onChange={(e) => { 
                      const val = parseInt(e.target.value); 
                      setStoreCommission(isNaN(val) ? 0 : Math.min(100, Math.max(0, val))); 
                    }}
                    className={`w-full border px-4 py-3 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-[#B2AC88]/20 focus:border-[#B2AC88] text-black transition-all bg-white font-medium border-slate-200`}
                  />
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {/* Logo */}
                  <div>
                    <label className="text-xs font-bold uppercase text-gray-500 mb-2 block">Store Logo</label>
                    <div className="flex flex-col gap-2">
                      {storeLogoPreview ? (
                        <div className="relative group">
                          <img
                            src={storeLogoPreview}
                            alt="Logo"
                            onClick={() => setPreviewImage(storeLogoPreview)}
                            className="w-full h-36 object-contain bg-slate-50 rounded-xl border border-slate-200 cursor-pointer hover:opacity-90 transition-opacity"
                          />
                          <div className="absolute top-1.5 right-1.5 flex gap-1">
                            <label className="w-7 h-7 bg-white/90 rounded-lg flex items-center justify-center cursor-pointer shadow-sm hover:bg-white transition border border-slate-100">
                              <Edit2 size={12} className="text-slate-600" />
                              <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) { setStoreLogoFile(file); setStoreLogoPreview(URL.createObjectURL(file)); }
                              }} />
                            </label>
                            <button type="button" onClick={() => { setStoreLogoPreview(''); setStoreLogoFile(null); }}
                              className="w-7 h-7 bg-red-500/90 rounded-lg flex items-center justify-center cursor-pointer shadow-sm hover:bg-red-500 transition">
                              <Trash2 size={12} className="text-white" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <label className="w-full h-28 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center cursor-pointer hover:border-[#B2AC88] hover:bg-[#B2AC88]/5 transition-all">
                          <Store size={24} className="text-slate-300 mb-1" />
                          <span className="text-xs font-bold text-slate-400 uppercase">Browse Logo</span>
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) { setStoreLogoFile(file); setStoreLogoPreview(URL.createObjectURL(file)); }
                          }} />
                        </label>
                      )}
                    </div>
                    {storeFormErrors.storeLogo && <p className="text-[11px] text-red-500 mt-1 font-semibold">{storeFormErrors.storeLogo}</p>}
                  </div>

                  {/* Banner */}
                  <div>
                    <label className="text-xs font-bold uppercase text-gray-500 mb-2 block">Store Banner</label>
                    <div className="flex flex-col gap-2">
                      {storeBannerPreview ? (
                        <div className="relative group">
                          <img
                            src={storeBannerPreview}
                            alt="Banner"
                            onClick={() => setPreviewImage(storeBannerPreview)}
                            className="w-full h-36 object-contain bg-slate-50 rounded-xl border border-slate-200 cursor-pointer hover:opacity-90 transition-opacity"
                          />
                          <div className="absolute top-1.5 right-1.5 flex gap-1">
                            <label className="w-7 h-7 bg-white/90 rounded-lg flex items-center justify-center cursor-pointer shadow-sm hover:bg-white transition border border-slate-100">
                              <Edit2 size={12} className="text-slate-600" />
                              <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) { setStoreBannerFile(file); setStoreBannerPreview(URL.createObjectURL(file)); }
                              }} />
                            </label>
                            <button type="button" onClick={() => { setStoreBannerPreview(''); setStoreBannerFile(null); }}
                              className="w-7 h-7 bg-red-500/90 rounded-lg flex items-center justify-center cursor-pointer shadow-sm hover:bg-red-500 transition">
                              <Trash2 size={12} className="text-white" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <label className="w-full h-28 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center cursor-pointer hover:border-[#B2AC88] hover:bg-[#B2AC88]/5 transition-all">
                          <ImageIcon size={24} className="text-slate-300 mb-1" />
                          <span className="text-xs font-bold text-slate-400 uppercase">Browse Banner</span>
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) { setStoreBannerFile(file); setStoreBannerPreview(URL.createObjectURL(file)); }
                          }} />
                        </label>
                      )}
                    </div>
                    {storeFormErrors.storeBanner && <p className="text-[11px] text-red-500 mt-1 font-semibold">{storeFormErrors.storeBanner}</p>}
                  </div>
                </div>

                {/* Actions */}
                {!isViewOnly && (
                  <div className="flex gap-3 pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={handleCloseStoreModal}
                      className="flex-1 py-3.5 border border-gray-200 hover:bg-gray-50 text-[#36454F] font-bold text-sm uppercase tracking-wider rounded-xl transition-all cursor-pointer active:scale-95"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-3.5 bg-[#36454F] hover:bg-[#36454F]/90 text-white font-bold text-sm uppercase tracking-wider rounded-xl transition-all cursor-pointer active:scale-95 shadow-md flex items-center justify-center space-x-2"
                    >
                      <Upload size={14} />
                      <span>{editingStore ? "Save Changes" : "Create Store"}</span>
                    </button>
                  </div>
                )}
                </fieldset>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Full-screen image preview */}
      <AnimatePresence>
        {previewImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPreviewImage(null)}
            className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 cursor-zoom-out"
          >
            <motion.img
              initial={{ scale: 0.85 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.85 }}
              src={previewImage}
              alt="Preview"
              className="max-w-full max-h-full rounded-2xl object-contain shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-5 right-5 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-all"
            >
              <X size={20} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete City Confirmation Modal */}
      <AnimatePresence>
        {cityToDelete && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setCityToDelete(null)}
              className="fixed inset-0 bg-black z-[300] cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-3xl p-8 z-[301] shadow-2xl w-[90%] max-w-[400px]"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
                  <AlertCircle size={32} className="text-red-500" />
                </div>
                <h2 className="text-xl font-bold text-[#36454F] mb-3">Delete City</h2>
                <p className="text-sm text-slate-500 mb-8 leading-relaxed font-semibold">
                  Are you sure you want to delete this city? This action cannot be undone.
                </p>
                <div className="flex gap-3 w-full">
                  <button
                    type="button"
                    onClick={() => setCityToDelete(null)}
                    className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={confirmDeleteCity}
                    className="flex-1 py-3 px-4 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
                  >
                    Delete City
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Dashboard Logout Confirmation Modal */}
      <AnimatePresence>
        {showDashboardLogoutConfirm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDashboardLogoutConfirm(false)}
              className="fixed inset-0 bg-black z-[300] cursor-pointer"
            />
            <div className="fixed inset-0 flex items-center justify-center p-4 z-[310] pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.92, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: 20 }}
                transition={{ type: "spring", stiffness: 300, damping: 24 }}
                className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl pointer-events-auto text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mx-auto mb-5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                </div>
                <h3 className="text-xl font-bold text-[#36454F] uppercase tracking-wider">Sign Out</h3>
                <p className="text-sm text-gray-400 mt-2 leading-relaxed">Are you sure you want to logout from the dashboard?</p>
                <div className="grid grid-cols-2 gap-3 mt-8">
                  <button
                    onClick={() => setShowDashboardLogoutConfirm(false)}
                    className="py-3 bg-white border border-gray-200 hover:bg-gray-50 text-[#36454F] text-sm font-bold uppercase tracking-wider rounded-2xl transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => { setShowDashboardLogoutConfirm(false); onLogout && onLogout(); }}
                    className="py-3 bg-red-500 hover:bg-red-600 text-white text-sm font-bold uppercase tracking-wider rounded-2xl transition-all cursor-pointer shadow-sm"
                  >
                    Logout
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Unsaved Changes Confirmation Modal */}
      <AnimatePresence>
        {showUnsavedChangesConfirm.open && (
          <div className="fixed inset-0 z-[350] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowUnsavedChangesConfirm({ open: false, onConfirm: null })}
              className="fixed inset-0 bg-black z-[350] cursor-pointer"
            />
            <div className="fixed inset-0 flex items-center justify-center p-4 z-[360] pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.92, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: 20 }}
                transition={{ type: "spring", stiffness: 300, damping: 24 }}
                className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl pointer-events-auto text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center mx-auto mb-5 text-amber-500">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                </div>
                <h3 className="text-xl font-bold text-[#36454F] uppercase tracking-wider">Unsaved Changes</h3>
                <p className="text-sm text-gray-400 mt-2 leading-relaxed">You have unsaved changes. Are you sure you want to close?</p>
                <div className="grid grid-cols-2 gap-3 mt-8">
                  <button
                    onClick={() => setShowUnsavedChangesConfirm({ open: false, onConfirm: null })}
                    className="py-3 bg-white border border-gray-200 hover:bg-gray-50 text-[#36454F] text-sm font-bold uppercase tracking-wider rounded-2xl transition-all cursor-pointer"
                  >
                    No, stay
                  </button>
                  <button
                    onClick={() => {
                      const onConfirm = showUnsavedChangesConfirm.onConfirm;
                      setShowUnsavedChangesConfirm({ open: false, onConfirm: null });
                      if (onConfirm) onConfirm();
                    }}
                    className="py-3 bg-[#36454F] hover:bg-[#36454F]/90 text-white text-sm font-bold uppercase tracking-wider rounded-2xl transition-all cursor-pointer shadow-sm"
                  >
                    Yes, discard
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Cannot Delete — Item In Use Modal */}
      <AnimatePresence>
        {inUseModal.open && (
          <div className="fixed inset-0 z-[350] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setInUseModal({ open: false, itemName: '', usedIn: [] })}
              className="fixed inset-0 bg-black z-[350] cursor-pointer"
            />
            <div className="fixed inset-0 flex items-center justify-center p-4 z-[360] pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.92, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: 20 }}
                transition={{ type: "spring", stiffness: 300, damping: 24 }}
                className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl pointer-events-auto text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mx-auto mb-5 text-red-500">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-[#36454F] uppercase tracking-wider">Cannot Delete</h3>
                <p className="text-sm text-gray-500 mt-3 leading-relaxed">
                  <span className="font-semibold text-[#36454F]">"{inUseModal.itemName}"</span> is currently in use and cannot be deleted.
                </p>
                <button
                  onClick={() => setInUseModal({ open: false, itemName: '', usedIn: [] })}
                  className="w-full mt-7 py-3 bg-[#36454F] hover:bg-[#36454F]/90 text-white text-sm font-bold uppercase tracking-wider rounded-2xl transition-all cursor-pointer shadow-sm"
                >
                  Got it
                </button>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Accept/Cancel Confirmation Modal */}
      <AnimatePresence>
        {orderToConfirm && (
          <div className="fixed inset-0 z-55 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOrderToConfirm(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full relative shadow-2xl z-10 border border-slate-100/50"
            >
              <button
                onClick={() => setOrderToConfirm(null)}
                className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-all"
              >
                <X size={18} />
              </button>

              <div className="flex flex-col items-center text-center">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 ${
                  orderToConfirm.newStatus === "Accepted"  ? "bg-blue-50 text-blue-600"     :
                  orderToConfirm.newStatus === "Delivered" ? "bg-teal-50 text-teal-600"     :
                  orderToConfirm.newStatus === "Paid"      ? "bg-emerald-50 text-emerald-600" :
                  orderToConfirm.newStatus === "Returned"  ? "bg-orange-50 text-orange-600" :
                  "bg-red-50 text-red-600"
                }`}>
                  {orderToConfirm.newStatus === "Accepted"  ? <CheckCircle size={28} /> :
                   orderToConfirm.newStatus === "Delivered" ? <Package size={28} />     :
                   orderToConfirm.newStatus === "Paid"      ? <Check size={28} />        :
                   orderToConfirm.newStatus === "Returned"  ? <AlertTriangle size={28} /> :
                   <XCircle size={28} />}
                </div>

                <h3 className="text-lg font-bold text-[#36454F] font-sans">
                  {orderToConfirm.newStatus === "Accepted"  ? "Accept Order"        :
                   orderToConfirm.newStatus === "Delivered" ? "Mark as Delivered"   :
                   orderToConfirm.newStatus === "Paid"      ? "Mark as Paid"        :
                   orderToConfirm.newStatus === "Returned"  ? "Mark as Returned"    :
                   "Cancel Order"}
                </h3>
                
                <p className="text-xs text-slate-500 mt-2 leading-relaxed font-medium">
                  {orderToConfirm.newStatus === "Delivered" ? (
                    <>
                      Confirm the order <span className="font-mono text-[#B2AC88]">#{orderToConfirm.order_number}</span> has been physically delivered to the customer.
                    </>
                  ) : orderToConfirm.newStatus === "Paid" ? (
                    <>
                      Confirm that <strong className="text-emerald-600">cash was collected</strong> for order <span className="font-mono text-[#B2AC88]">#{orderToConfirm.order_number}</span>. Payment will be marked as <strong>Paid</strong>.
                    </>
                  ) : orderToConfirm.newStatus === "Returned" ? (
                    <>
                      Confirm that order <span className="font-mono text-[#B2AC88]">#{orderToConfirm.order_number}</span> was <strong className="text-orange-600">returned</strong> by the customer. Stock will be restored and payment stays <strong>Unpaid</strong>.
                    </>
                  ) : (
                    <>
                      Are you sure you want to <strong>{orderToConfirm.newStatus === "Accepted" ? "accept" : "cancel"}</strong> order <span className="font-mono text-[#B2AC88]">#{orderToConfirm.order_number}</span>?
                    </>
                  )}
                </p>

                <div className="grid grid-cols-2 gap-4 w-full mt-6">
                  <button
                    onClick={() => setOrderToConfirm(null)}
                    className="py-3 border border-slate-200 hover:bg-slate-50 text-[#36454F] text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer select-none text-center"
                  >
                    No, Go Back
                  </button>
                  <button
                    onClick={async () => {
                      const { id, newStatus } = orderToConfirm;
                      setOrderToConfirm(null);
                      await handleUpdateOrderStatus(id, newStatus);
                    }}
                    className={`py-3 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer select-none text-center shadow-sm active:scale-98 ${
                      orderToConfirm.newStatus === "Accepted"  ? "bg-blue-500 hover:bg-blue-600"       :
                      orderToConfirm.newStatus === "Delivered" ? "bg-teal-500 hover:bg-teal-600"       :
                      orderToConfirm.newStatus === "Paid"      ? "bg-emerald-500 hover:bg-emerald-600" :
                      orderToConfirm.newStatus === "Returned"  ? "bg-orange-500 hover:bg-orange-600"   :
                      "bg-red-500 hover:bg-red-600"
                    }`}
                  >
                    Yes, Confirm
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}


      </AnimatePresence>

      {/* Payment Status Confirmation Modal */}
      <AnimatePresence>
        {paymentToConfirm && (
          <div className="fixed inset-0 z-55 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPaymentToConfirm(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full relative shadow-2xl z-10 border border-slate-100/50"
            >
              <button
                onClick={() => setPaymentToConfirm(null)}
                className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-all"
              >
                <X size={18} />
              </button>

              <div className="flex flex-col items-center text-center">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 ${
                  paymentToConfirm.newPaymentStatus === "Paid" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                }`}>
                  {paymentToConfirm.newPaymentStatus === "Paid" ? <CheckCircle size={28} /> : <AlertTriangle size={28} />}
                </div>

                <h3 className="text-lg font-bold text-[#36454F] font-sans">
                  Change Payment Status
                </h3>
                
                <p className="text-xs text-slate-500 mt-2 leading-relaxed font-medium">
                  Are you sure you want to change order <span className="font-mono text-[#B2AC88]">#{paymentToConfirm.order_number}</span> payment status to <strong>{paymentToConfirm.newPaymentStatus}</strong>?
                </p>

                <div className="grid grid-cols-2 gap-4 w-full mt-6">
                  <button
                    onClick={() => setPaymentToConfirm(null)}
                    className="py-3 border border-slate-200 hover:bg-slate-50 text-[#36454F] text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer select-none text-center"
                  >
                    No, Go Back
                  </button>
                  <button
                    onClick={async () => {
                      const { id, newPaymentStatus } = paymentToConfirm;
                      setPaymentToConfirm(null);
                      await handleUpdateOrderPaymentStatus(id, newPaymentStatus);
                    }}
                    className={`py-3 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer select-none text-center shadow-sm active:scale-98 ${
                      paymentToConfirm.newPaymentStatus === "Paid"
                        ? "bg-emerald-500 hover:bg-emerald-600"
                        : "bg-amber-500 hover:bg-amber-600"
                    }`}
                  >
                    Yes, I'm Sure
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Elegant Add/Edit Product Page */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="p-6 lg:p-10 max-w-5xl w-full mx-auto flex-grow">
            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              className="bg-white rounded-3xl p-8 lg:p-12 w-full shadow-xs border border-slate-100 relative"
            >
              <button
                onClick={handleCloseProductModal}
                className="absolute top-6 right-6 py-2 text-gray-400 hover:text-[#36454F] hover:bg-gray-100 rounded-full transition-all flex items-center gap-1.5 px-4 cursor-pointer"
              >
                <ArrowLeft size={16} /> <span className="text-[10px] font-bold uppercase tracking-wider hidden sm:inline">Back</span>
              </button>

              <h2 className="text-2xl font-serif italic font-bold text-[#36454F] mb-6 border-b pb-4 border-gray-100">
                {editingProduct ? "Edit Catalog Product" : "Add New Product"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-5">
                <fieldset disabled={isViewOnly} className="space-y-5">
                {/* 1. Name Input */}
                <div>
                  <LangTextInput
                    label="Product Title"
                    required
                    valueEn={nameEn}
                    valueKu={nameKu}
                    valueAr={nameAr}
                    onChangeEn={setNameEn}
                    onChangeKu={setNameKu}
                    onChangeAr={setNameAr}
                    placeholder="Product Title"
                    error={showValidation && (!nameEn.trim() || !nameKu.trim() || !nameAr.trim())}
                    errorMessage="Product title is required in all 3 languages"
                  />
                </div>

                {/* 2. Store Input */}
                {currentUserRole === "admin" && (
                  <div>
                    <label className="flex items-center space-x-1.5 text-xs font-bold uppercase text-gray-400 mb-2">
                      <Store size={13} />
                      <span>Store *</span>
                    </label>
                    <select
                      value={productStoreId}
                      onChange={(e) => setProductStoreId(e.target.value)}
                      className={`w-full border px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B2AC88]/20 focus:border-[#B2AC88] text-black transition-all bg-white shadow-xs ${
                        showValidation && !productStoreId
                          ? "border-red-400 bg-red-50/30 ring-2 ring-red-200"
                          : "border-slate-200"
                      }`}
                    >
                      <option value="">Select a Store</option>
                      {stores.map(store => (
                        <option key={store.id} value={store.id}>{getEnglishName(store.name)}</option>
                      ))}
                    </select>
                    {showValidation && !productStoreId && (
                      <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider mt-1.5 ml-1">
                        Store is required
                      </p>
                    )}
                  </div>
                )}

                {/* 3. Category Input */}
                <div>
                  <label className="flex items-center space-x-1.5 text-xs font-bold uppercase text-gray-400 mb-2">
                    <SlidersHorizontal size={13} className="inline mr-1" />
                    <span>Category *</span>
                  </label>
                  <MultiSelectDropdown
                    options={categories}
                    selectedValues={category}
                    onChange={setCategory}
                    placeholder="Select Category"
                    error={showValidation && category.length === 0}
                    valueKey="name"
                    renderOption={(opt) => getEnglishName(opt.name)}
                  />
                  {showValidation && category.length === 0 && (
                    <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider mt-1.5 ml-1">
                      Select at least one category
                    </p>
                  )}
                </div>

                {/* 4. Price Input */}
                <div>
                  <label className="flex items-center space-x-1.5 text-xs font-bold uppercase text-gray-400 mb-2">
                    <DollarSign size={13} />
                    <span>Price (IQD) *</span>
                  </label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className={`w-full border px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B2AC88]/20 focus:border-[#B2AC88] text-black transition-all placeholder:text-gray-400 font-medium bg-white shadow-xs ${
                      showValidation && (!price || Number(price) < 250)
                        ? "border-red-400 bg-red-50/30 ring-2 ring-red-200"
                        : "border-slate-200"
                    }`}
                  />
                  {showValidation && (!price || Number(price) < 250) && (
                    <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider mt-1.5 ml-1">
                      Price must be at least 250 IQD
                    </p>
                  )}
                  {(() => {
                    const selectedStore = stores.find(s => String(s.id) === String(productStoreId));
                    const commPct = selectedStore ? (selectedStore.commission_percentage || 0) : 0;
                    const priceNum = Number(price);
                    if (commPct > 0 && priceNum >= 250) {
                      const adminShare = Math.round(priceNum * (commPct / 100));
                      const storeShare = priceNum - adminShare;
                      return (
                        <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs">
                          <p className="font-bold text-amber-700 uppercase tracking-wider mb-1">Commission Split ({commPct}%)</p>
                          <div className="flex justify-between">
                            <span className="text-[#B2AC88] font-bold">Platform (Admin): {adminShare.toLocaleString()} IQD</span>
                            <span className="text-slate-600 font-bold">Store: {storeShare.toLocaleString()} IQD</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>

                 {/* Gender Dropdown */}
                 <div>
                   <label className="flex items-center space-x-1.5 text-xs font-bold uppercase text-gray-400 mb-2">
                     <span>Gender</span>
                   </label>
                   <select
                     value={gender}
                     onChange={(e) => setGender(e.target.value)}
                     className="w-full border border-slate-200 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B2AC88]/20 focus:border-[#B2AC88] text-black transition-all bg-white shadow-xs"
                   >
                     <option value="">Gender</option>
                     <option value="Women">Women</option>
                     <option value="Men">Men</option>
                     <option value="Kids">Kids</option>
                   </select>
                 </div>

                {/* Extended Product Attributes Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="flex items-center space-x-1.5 text-xs font-bold uppercase text-gray-400 mb-2">
                      <span>Style / Length *</span>
                    </label>
                    <MultiSelectDropdown
                      options={styles}
                      selectedValues={styleLength}
                      onChange={setStyleLength}
                      placeholder="Select Style"
                      error={showValidation && styleLength.length === 0}
                      valueKey="name"
                      renderOption={(opt) => getEnglishName(opt.name)}
                    />
                    {showValidation && styleLength.length === 0 && (
                      <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider mt-1.5 ml-1">
                        Select at least one style
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="flex items-center space-x-1.5 text-xs font-bold uppercase text-gray-400 mb-2">
                      <span>Size Collection *</span>
                    </label>
                    <MultiSelectDropdown
                      options={sizes}
                      selectedValues={sizeCollection}
                      onChange={setSizeCollection}
                      placeholder="Select Sizes"
                      error={showValidation && sizeCollection.length === 0}
                      valueKey="name"
                      renderOption={(opt) => getEnglishName(opt.name)}
                    />
                    {showValidation && sizeCollection.length === 0 && (
                      <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider mt-1.5 ml-1">
                        Select at least one size
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="flex items-center space-x-1.5 text-xs font-bold uppercase text-gray-400 mb-2">
                      <span>Material *</span>
                    </label>
                    <MultiSelectDropdown
                      options={materials}
                      selectedValues={material}
                      onChange={setMaterial}
                      placeholder="Select Material"
                      error={showValidation && material.length === 0}
                      valueKey="name"
                      renderOption={(opt) => getEnglishName(opt.name)}
                    />
                    {showValidation && material.length === 0 && (
                      <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider mt-1.5 ml-1">
                        Select at least one material
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="flex items-center space-x-1.5 text-xs font-bold uppercase text-gray-400 mb-2">
                      <span>Seasonal Type *</span>
                    </label>
                    <MultiSelectDropdown
                      options={seasons}
                      selectedValues={seasonalType}
                      onChange={setSeasonalType}
                      placeholder="Select Seasons"
                      error={showValidation && seasonalType.length === 0}
                      valueKey="name"
                      renderOption={(opt) => getEnglishName(opt.name)}
                    />
                    {showValidation && seasonalType.length === 0 && (
                      <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider mt-1.5 ml-1">
                        Select at least one season
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="flex items-center space-x-1.5 text-xs font-bold uppercase text-gray-400 mb-2">
                      <span>Stock Inventory</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={stock}
                      onChange={(e) => setStock(Number(e.target.value))}
                      className="w-full border border-slate-200 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B2AC88]/20 focus:border-[#B2AC88] text-black transition-all placeholder:text-gray-400 font-medium bg-white shadow-xs"
                    />
                  </div>
                  <div>
                    <label className="flex items-center space-x-1.5 text-xs font-bold uppercase text-gray-400 mb-2">
                      <span>Discount (%)</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      placeholder="0"
                      value={discount}
                      onChange={(e) => setDiscount(Number(e.target.value))}
                      className="w-full border border-slate-200 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B2AC88]/20 focus:border-[#B2AC88] text-black transition-all placeholder:text-gray-400 font-medium bg-white shadow-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="flex items-center space-x-1.5 text-xs font-bold uppercase text-gray-400 mb-2">
                      <span>Label / Badge</span>
                    </label>
                    <MultiSelectDropdown
                      options={badges}
                      selectedValues={badge}
                      onChange={setBadge}
                      placeholder="Select Label/Badge"
                      error={false}
                      valueKey="name"
                      renderOption={(opt) => getEnglishName(opt.name)}
                    />
                  </div>
                  <div>
                    <label className="flex items-center space-x-1.5 text-xs font-bold uppercase text-gray-400 mb-2">
                      <span>Active Promotion</span>
                    </label>
                    <MultiSelectDropdown
                      options={promotions}
                      selectedValues={promotion}
                      onChange={setPromotion}
                      placeholder="Select Promotion"
                      error={false}
                      valueKey="name"
                      renderOption={(opt) => getEnglishName(opt.name)}
                    />
                  </div>
                </div>

                {/* 3. Per-Size Color Picker */}
                {sizeCollection.length > 0 && (
                  <div className="space-y-4">
                    <label className="flex items-center space-x-1.5 text-xs font-bold uppercase text-gray-400">
                      <span>Colors per Size *</span>
                    </label>
                    {showValidation && sizeCollection.some(size => !sizeColors[size] || sizeColors[size].length === 0) && (
                      <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider mt-1.5 ml-1">
                        Each size must have at least one color assigned
                      </p>
                    )}
                    <div className="space-y-3">
                      {sizeCollection.map(size => {
                        const assignedColorIds = sizeColors[size] || [];
                        return (
                          <div key={size} className={`border rounded-xl p-3 ${showValidation && assignedColorIds.length === 0 ? 'border-red-300 bg-red-50/30' : 'border-slate-200 bg-gray-50/30'}` }>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-bold text-[#36454F] uppercase tracking-wider">{size}</span>
                              <div className="flex gap-1">
                                {assignedColorIds.map(colorId => {
                                  const col = colorsList.find(c => c.id === colorId);
                                  if (!col) return null;
                                  return (
                                    <span key={colorId} title={col.name} className={`w-4 h-4 rounded-full border border-gray-300 ${col.class && col.class.startsWith('bg-') ? col.class : ''}`} style={getColorStyle(col.class)} />
                                  );
                                })}
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {colorsList.map(col => {
                                const isChecked = assignedColorIds.includes(col.id);
                                return (
                                  <button
                                    key={col.id}
                                    type="button"
                                    onClick={() => {
                                      setSizeColors(prev => {
                                        const current = prev[size] || [];
                                        const updated = isChecked
                                          ? current.filter(id => id !== col.id)
                                          : [...current, col.id];
                                        return { ...prev, [size]: updated };
                                      });
                                    }}
                                    className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                                      isChecked
                                        ? 'border-[#B2AC88] bg-[#B2AC88]/10 text-[#36454F]'
                                        : 'border-slate-200 bg-white text-gray-500 hover:border-[#B2AC88]/50'
                                    }`}
                                  >
                                    <span
                                      className={`w-3 h-3 rounded-full border border-gray-300 shrink-0 ${col.class && col.class.startsWith('bg-') ? col.class : ''}`}
                                      style={getColorStyle(col.class)}
                                    />
                                    {col.name}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <LangTextInput
                  label="Product Description"
                  required
                  type="textarea"
                  valueEn={descEn}
                  valueKu={descKu}
                  valueAr={descAr}
                  onChangeEn={setDescEn}
                  onChangeKu={setDescKu}
                  onChangeAr={setDescAr}
                  placeholder="Details about material comfort, weave, dimensions..."
                  error={showValidation && (!descEn.trim() || !descKu.trim() || !descAr.trim())}
                  errorMessage="Product description is required in all 3 languages"
                />

                {/* 5. Image Selector & Preview */}
                <div>
                  <label className="flex items-center space-x-1.5 text-xs font-bold uppercase text-gray-400 mb-2">
                    <Upload size={13} />
                    <span>Product Image Upload *</span>
                  </label>
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    {/* Upload Box */}
                    <label className={`w-full sm:w-1/2 flex flex-col items-center justify-center border border-dashed rounded-2xl p-4 cursor-pointer text-center group transition-colors ${
                      showValidation && !editingProduct && !imageFile
                        ? "border-red-400 bg-red-50/30 ring-2 ring-red-200"
                        : "border-slate-200 bg-gray-50/30 hover:border-[#B2AC88]"
                    }`}>
                      <Upload
                        size={24}
                        className="text-gray-400 group-hover:text-[#B2AC88] transition-colors mb-1.5"
                      />
                      <span className="text-xs font-bold text-[#36454F] group-hover:text-[#B2AC88] transition-colors">
                        Choose File
                      </span>
                      <span className="text-[10px] text-gray-400 mt-0.5">
                        JPG, PNG, WEBP
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>

                    {/* Preview Box */}
                    <div className="w-full sm:w-1/2 h-32 border border-slate-200 rounded-2xl flex items-center justify-center overflow-hidden bg-gray-50/50">
                      {imagePreview ? (
                        <img
                          src={imagePreview}
                          alt="Product Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center text-gray-300">
                          <ImageIcon size={28} />
                          <span className="text-[10px] uppercase font-bold tracking-widest mt-1">
                            Preview
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>


                {/* Submit Action */}
                {!isViewOnly && (
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-[#B2AC88] hover:bg-[#B2AC88]/90 disabled:bg-gray-200 text-white font-bold text-sm rounded-2xl mt-4 cursor-pointer transition-colors active:scale-[0.98] shadow-sm flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <span>
                        {editingProduct
                          ? "Update Product Listing"
                          : "Publish Product Listing"}
                      </span>
                    )}
                  </button>
                )}
                </fieldset>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      </main>

      {/* Custom Validation Error Alert Modal */}
      <AnimatePresence>
        {validationError && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setValidationError("")}
              className="absolute inset-0 bg-black/40 backdrop-blur-xs"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl p-6 max-w-sm w-full relative shadow-2xl z-10 border border-red-50 text-center flex flex-col items-center"
            >
              <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle size={24} />
              </div>

              <h3 className="text-md font-bold text-[#36454F] uppercase tracking-wider mb-2">
                Required Fields Empty
              </h3>

              <div className="text-xs text-gray-500 leading-relaxed mb-6 w-full text-left bg-gray-50/50 p-4 rounded-xl border border-gray-100 font-medium">
                Please fill in the following required inputs:
                <span className="text-red-500 font-bold block mt-2 whitespace-pre-line">
                  • {validationError}
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  setValidationError("");
                  setShowValidation(false);
                }}
                className="w-full py-3 bg-[#36454F] hover:bg-[#36454F]/90 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors cursor-pointer active:scale-95 text-center"
              >
                Okay, I'll fix it
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Custom Confirm Delete Modal */}
      <AnimatePresence>
        {productToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setProductToDelete(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-xs"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl p-6 max-w-sm w-full relative shadow-2xl z-10 border border-red-50 text-center flex flex-col items-center"
            >
              <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
                <Trash2 size={24} />
              </div>

              <h3 className="text-md font-bold text-[#36454F] uppercase tracking-wider mb-2">
                Confirm Deletion
              </h3>

              <p className="text-xs text-gray-500 leading-relaxed mb-6 font-medium">
                Are you sure you want to delete{" "}
                <span className="font-bold text-[#36454F]">
                  "{getEnglishName(productToDelete.name)}"
                </span>
                ? This action cannot be undone.
              </p>

              <div className="flex w-full gap-3">
                <button
                  type="button"
                  onClick={() => setProductToDelete(null)}
                  className="flex-1 py-3 border border-gray-200 hover:bg-gray-50 text-[#36454F] font-bold text-xs uppercase tracking-wider rounded-xl transition-colors cursor-pointer active:scale-95 text-center"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors cursor-pointer active:scale-95 text-center"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Generic Settings Confirm Modal */}
      <AnimatePresence>
        {confirmModal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmModal({ open: false, message: '', onConfirm: null })}
              className="absolute inset-0 bg-black/40 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl p-6 max-w-sm w-full relative shadow-2xl z-10 border border-red-50 text-center flex flex-col items-center"
            >
              <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
                <Trash2 size={24} />
              </div>
              <h3 className="text-md font-bold text-[#36454F] uppercase tracking-wider mb-2">
                Confirm Deletion
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed mb-6 font-medium">
                {confirmModal.message}
              </p>
              <div className="flex w-full gap-3">
                <button
                  type="button"
                  onClick={() => setConfirmModal({ open: false, message: '', onConfirm: null })}
                  className="flex-1 py-3 border border-gray-200 hover:bg-gray-50 text-[#36454F] font-bold text-xs uppercase tracking-wider rounded-xl transition-colors cursor-pointer active:scale-95"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmModal.onConfirm}
                  className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors cursor-pointer active:scale-95"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Order Details Modal */}
      <AnimatePresence>
        {expandedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setExpandedOrder(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-3xl relative shadow-2xl z-10 max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setExpandedOrder(null)}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>

              <div className="mb-6 pb-6 border-b border-slate-100">
                <div className="flex items-center gap-3 mb-2">
                  <span className="w-10 h-10 rounded-xl bg-[#B2AC88]/10 text-[#B2AC88] flex items-center justify-center">
                    <Package size={20} />
                  </span>
                  <div>
                    <h3 className="text-xl font-serif italic font-bold text-[#36454F]">
                      Order #{expandedOrder.order_number}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                      <Calendar size={12} />
                      <span>{new Date(expandedOrder.created_at).toLocaleDateString()}</span>
                      <span className="mx-1">•</span>
                      <span className="uppercase tracking-wider font-bold text-[#B2AC88]">{expandedOrder.status}</span>
                      {expandedOrder.status === "Accepted" && (
                        <>
                          <span className="mx-1">•</span>
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                            expandedOrder.payment_status === "Paid"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-amber-100 text-amber-800"
                          }`}>
                            {expandedOrder.payment_status || "Unpaid"}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {/* Customer Info */}
                <div className="space-y-4 bg-slate-50 p-5 rounded-2xl">
                  <h4 className="font-bold text-[10px] uppercase tracking-wider text-slate-400">Customer Details</h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <User size={16} className="text-slate-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-bold text-[#36454F]">{expandedOrder.full_name}</p>
                        <p className="text-xs text-slate-500">Recipient</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Phone size={16} className="text-slate-400 mt-0.5" />
                      <div>
                        <a href={`tel:${expandedOrder.phone}`} className="text-sm font-bold text-[#B2AC88] hover:underline">{expandedOrder.phone}</a>
                        <p className="text-xs text-slate-500">Contact</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin size={16} className="text-slate-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-[#36454F]">{expandedOrder.province}</p>
                        <p className="text-xs text-slate-500 leading-relaxed">{expandedOrder.address}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Summary */}
                <div className="space-y-4 bg-slate-50 p-5 rounded-2xl">
                  <h4 className="font-bold text-[10px] uppercase tracking-wider text-slate-400">Order Notes & Summary</h4>
                  {expandedOrder.notes ? (
                    <div className="bg-white p-3 rounded-xl border border-slate-100 mb-4">
                      <p className="text-xs text-slate-600 italic">"{expandedOrder.notes}"</p>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic mb-4">No notes provided.</p>
                  )}
                  
                  <div className="space-y-2 pt-2 border-t border-slate-200">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">{currentUserRole === "admin" ? "Total Items Price" : "Your Store's Total"}</span>
                      <span className="font-bold text-[#36454F]">{(currentUserRole === "admin" ? expandedOrder.total : expandedOrder.vendor_total)?.toLocaleString()} IQD</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h4 className="font-bold text-[10px] uppercase tracking-wider text-slate-400 mb-4 px-2">Items Included</h4>
                <div className="space-y-3">
                   {(expandedOrder.items || []).map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:border-slate-200 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="relative shrink-0">
                          {item.image_url ? (
                            <img
                              src={getProductImage(item.image_url)}
                              alt={getEnglishName(item.product_name)}
                              className="w-14 h-14 rounded-xl object-cover border border-slate-100 shadow-sm"
                            />
                          ) : (
                            <div className="w-14 h-14 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100 text-[#B2AC88]">
                              <Package size={18} />
                            </div>
                          )}
                          <span className="absolute -top-1.5 -right-1.5 bg-[#B2AC88] text-white text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm font-sans">
                            {item.quantity}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-extrabold text-[#36454F]">{getEnglishName(item.product_name)}</p>
                          <div className="flex flex-wrap gap-2 mt-1.5">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-50 px-2.5 py-1 rounded border border-slate-100">
                              QTY: <span className="text-slate-700 font-extrabold">{item.quantity}</span>
                            </span>
                            {item.store_name && currentUserRole === 'admin' && (
                              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-50 px-2.5 py-1 rounded border border-slate-100">
                                Store: <span className="text-[#B2AC88] font-extrabold">{getEnglishName(item.store_name)}</span>
                              </span>
                            )}
                            {item.selected_color && (
                              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-50 px-2.5 py-1 rounded flex items-center gap-1.5 border border-slate-100">
                                Color: {item.selected_color.startsWith('bg-[') ? (
                                  <span className="w-3 h-3 rounded-full inline-block border border-slate-300" style={getColorStyle(item.selected_color)}></span>
                                ) : (
                                  <span className="w-3 h-3 rounded-full inline-block border border-slate-200" style={{ backgroundColor: item.selected_color === 'White' ? '#FFFFFF' : item.selected_color === 'Black' ? '#000000' : item.selected_color }}></span>
                                )}
                                <span className="text-slate-700 normal-case font-extrabold">{item.selected_color_name || item.selected_color}</span>
                              </span>
                            )}
                            {item.selected_size && (
                              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-50 px-2.5 py-1 rounded border border-slate-100">Size: <span className="text-slate-700 font-extrabold">{item.selected_size}</span></span>
                            )}
                            {item.selected_style && (
                              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-50 px-2.5 py-1 rounded border border-slate-100">Style: <span className="text-slate-700 font-extrabold">{item.selected_style}</span></span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-emerald-600">{(item.price * item.quantity).toLocaleString()} IQD</p>
                        <p className="text-[10px] text-slate-400">{item.price.toLocaleString()} IQD each</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Inline fallback icon fix
const SlidersHorizontal = ({ size = 16, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <line x1="4" y1="21" x2="4" y2="14" />
    <line x1="4" y1="10" x2="4" y2="3" />
    <line x1="12" y1="21" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12" y2="3" />
    <line x1="20" y1="21" x2="20" y2="16" />
    <line x1="20" y1="12" x2="20" y2="3" />
    <line x1="2" y1="14" x2="6" y2="14" />
    <line x1="10" y1="8" x2="14" y2="8" />
    <line x1="18" y1="16" x2="22" y2="16" />
  </svg>
);
