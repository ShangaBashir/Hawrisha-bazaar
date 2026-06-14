import { useState, useEffect } from "react";
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

const parseJsonArray = (val) => {
  if (!val) return [];
  try {
    const parsed = JSON.parse(val);
    return Array.isArray(parsed) ? parsed : [val];
  } catch {
    return [val];
  }
};

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("inventory"); // 'inventory' or 'settings'
  const [products, setProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(false);

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

  // Form Fields State
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState([]);
  const [badge, setBadge] = useState([]);
  const [desc, setDesc] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [selectedColors, setSelectedColors] = useState([]);

  const [styleLength, setStyleLength] = useState([]);
  const [stock, setStock] = useState(0);
  const [promotion, setPromotion] = useState([]);
  const [material, setMaterial] = useState([]);
  const [seasonalType, setSeasonalType] = useState([]);
  const [sizeCollection, setSizeCollection] = useState([]);
  const [discount, setDiscount] = useState(0);

  // Toast message state
  const [toastMessage, setToastMessage] = useState("");
  // Validation error state
  const [validationError, setValidationError] = useState("");
  const [showValidation, setShowValidation] = useState(false);
  // Product deletion confirm state
  const [productToDelete, setProductToDelete] = useState(null);

  // Settings form helper states
  const [colorValue, setColorValue] = useState("#000000");

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  // Fetch dynamic categories, badges, and colors configuration
  const fetchSettings = async () => {
    // 1. Categories
    try {
      const res = await fetch("/api/settings/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      } else {
        throw new Error();
      }
    } catch {
      const localCats = localStorage.getItem("hawrisha_categories");
      if (localCats) {
        setCategories(JSON.parse(localCats));
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
        setBadges(data);
      } else {
        throw new Error();
      }
    } catch {
      const localBadges = localStorage.getItem("hawrisha_badges");
      if (localBadges) {
        setBadges(JSON.parse(localBadges));
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
        setColorsList(data);
      } else {
        throw new Error();
      }
    } catch {
      const localColors = localStorage.getItem("hawrisha_colors");
      if (localColors) {
        setColorsList(JSON.parse(localColors));
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
        setStyles(data);
      } else {
        throw new Error();
      }
    } catch {
      const localStyles = localStorage.getItem("hawrisha_styles");
      if (localStyles) {
        setStyles(JSON.parse(localStyles));
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
        setMaterials(data);
      } else {
        throw new Error();
      }
    } catch {
      const localMaterials = localStorage.getItem("hawrisha_materials");
      if (localMaterials) {
        setMaterials(JSON.parse(localMaterials));
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
        setSeasons(data);
      } else {
        throw new Error();
      }
    } catch {
      const localSeasons = localStorage.getItem("hawrisha_seasons");
      if (localSeasons) {
        setSeasons(JSON.parse(localSeasons));
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
        setSizes(data);
      } else {
        throw new Error();
      }
    } catch {
      const localSizes = localStorage.getItem("hawrisha_sizes");
      if (localSizes) {
        setSizes(JSON.parse(localSizes));
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
        setPromotions(data);
      } else {
        throw new Error();
      }
    } catch {
      const localPromos = localStorage.getItem("hawrisha_promotions");
      if (localPromos) {
        setPromotions(JSON.parse(localPromos));
      } else {
        const defaults = [
          { id: "buy_2_get_1_free", name: "Buy 2 Get 1 Free" },
          { id: "new_season_promo", name: "New Season Promo" },
        ];
        setPromotions(defaults);
        localStorage.setItem("hawrisha_promotions", JSON.stringify(defaults));
      }
    }
  };

  // Fetch products from database
  const fetchProducts = () => {
    setLoading(true);
    fetch("/api/products")
      .then((res) => {
        if (!res.ok) throw new Error("API server offline");
        return res.json();
      })
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.warn(
          "Backend offline, using fallback catalog data for display",
          err,
        );
        setProducts([
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
        ]);
        setLoading(false);
      });
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
      fetchSettings();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Settings Actions
  const handleAddCategory = async (catName) => {
    if (!catName || !catName.trim()) return;
    try {
      const res = await fetch("/api/settings/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: catName.trim() }),
      });
      if (res.ok) {
        showToast("Category added successfully!");
        fetchSettings();
      } else {
        const error = await res.json();
        showToast(error.error || "Failed to add category");
      }
    } catch {
      const newCat = { id: Date.now().toString(), name: catName.trim() };
      const updated = [...categories, newCat];
      setCategories(updated);
      localStorage.setItem("hawrisha_categories", JSON.stringify(updated));
      showToast("Category added successfully (offline mode)");
    }
  };

  const handleDeleteCategory = async (cat) => {
    const isNumber = /^\d+$/.test(cat.id);
    if (isNumber) {
      try {
        const res = await fetch(`/api/settings/categories/${cat.id}`, {
          method: "DELETE",
        });
        if (res.ok) {
          showToast("Category deleted successfully!");
          fetchSettings();
        } else {
          const errData = await res.json().catch(() => ({}));
          showToast(
            `Failed to delete category: ${errData.error || "Server error"}`,
          );
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
  };

  const handleAddBadge = async (badgeName) => {
    if (!badgeName || !badgeName.trim()) return;
    try {
      const res = await fetch("/api/settings/badges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: badgeName.trim() }),
      });
      if (res.ok) {
        showToast("Badge added successfully!");
        fetchSettings();
      } else {
        const error = await res.json();
        showToast(error.error || "Failed to add badge");
      }
    } catch {
      const newBadge = { id: Date.now().toString(), name: badgeName.trim() };
      const updated = [...badges, newBadge];
      setBadges(updated);
      localStorage.setItem("hawrisha_badges", JSON.stringify(updated));
      showToast("Badge added successfully (offline mode)");
    }
  };

  const handleDeleteBadge = async (b) => {
    const isNumber = /^\d+$/.test(b.id);
    if (isNumber) {
      try {
        const res = await fetch(`/api/settings/badges/${b.id}`, {
          method: "DELETE",
        });
        if (res.ok) {
          showToast("Badge deleted successfully!");
          fetchSettings();
        } else {
          const errData = await res.json().catch(() => ({}));
          showToast(
            `Failed to delete badge: ${errData.error || "Server error"}`,
          );
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
  };

  const handleAddColor = async ({
    name: colName,
    class: colClass,
    family: colFamily,
  }) => {
    if (!colName.trim() || !colClass.trim() || !colFamily.trim()) return;
    const colorId = colName.trim().toLowerCase().replace(/\s+/g, "_");

    try {
      const res = await fetch("/api/settings/colors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: colorId,
          class: colClass.trim(),
          name: colName.trim(),
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
        name: colName.trim(),
        family: colFamily.trim(),
      };
      const updated = [...colorsList, newColor];
      setColorsList(updated);
      localStorage.setItem("hawrisha_colors", JSON.stringify(updated));
      showToast("Color swatch added successfully (offline mode)");
    }
  };

  const handleDeleteColor = async (color) => {
    try {
      const res = await fetch(`/api/settings/colors/${color.id}`, {
        method: "DELETE",
      });
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
  };

  const handleAddStyle = async (nameVal) => {
    if (!nameVal || !nameVal.trim()) return;
    try {
      const res = await fetch("/api/settings/styles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: nameVal.trim() }),
      });
      if (res.ok) {
        showToast("Style option added successfully!");
        fetchSettings();
      } else {
        const error = await res.json();
        showToast(error.error || "Failed to add style");
      }
    } catch {
      const newStyle = { id: Date.now().toString(), name: nameVal.trim() };
      const updated = [...styles, newStyle];
      setStyles(updated);
      localStorage.setItem("hawrisha_styles", JSON.stringify(updated));
      showToast("Style added successfully (offline mode)");
    }
  };

  const handleDeleteStyle = async (st) => {
    const isNumber = /^\d+$/.test(st.id);
    if (isNumber) {
      try {
        const res = await fetch(`/api/settings/styles/${st.id}`, {
          method: "DELETE",
        });
        if (res.ok) {
          showToast("Style option deleted successfully!");
          fetchSettings();
        } else {
          const errData = await res.json().catch(() => ({}));
          showToast(
            `Failed to delete style: ${errData.error || "Server error"}`,
          );
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
  };

  const handleAddMaterial = async (nameVal) => {
    if (!nameVal || !nameVal.trim()) return;
    try {
      const res = await fetch("/api/settings/materials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: nameVal.trim() }),
      });
      if (res.ok) {
        showToast("Material option added successfully!");
        fetchSettings();
      } else {
        const error = await res.json();
        showToast(error.error || "Failed to add material");
      }
    } catch {
      const newMat = { id: Date.now().toString(), name: nameVal.trim() };
      const updated = [...materials, newMat];
      setMaterials(updated);
      localStorage.setItem("hawrisha_materials", JSON.stringify(updated));
      showToast("Material added successfully (offline mode)");
    }
  };

  const handleDeleteMaterial = async (mat) => {
    const isNumber = /^\d+$/.test(mat.id);
    if (isNumber) {
      try {
        const res = await fetch(`/api/settings/materials/${mat.id}`, {
          method: "DELETE",
        });
        if (res.ok) {
          showToast("Material option deleted successfully!");
          fetchSettings();
        } else {
          const errData = await res.json().catch(() => ({}));
          showToast(
            `Failed to delete material: ${errData.error || "Server error"}`,
          );
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
  };

  const handleAddSeason = async (nameVal) => {
    if (!nameVal || !nameVal.trim()) return;
    try {
      const res = await fetch("/api/settings/seasons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: nameVal.trim() }),
      });
      if (res.ok) {
        showToast("Seasonal Type added successfully!");
        fetchSettings();
      } else {
        const error = await res.json();
        showToast(error.error || "Failed to add seasonal type");
      }
    } catch {
      const newSeason = { id: Date.now().toString(), name: nameVal.trim() };
      const updated = [...seasons, newSeason];
      setSeasons(updated);
      localStorage.setItem("hawrisha_seasons", JSON.stringify(updated));
      showToast("Seasonal type added successfully (offline mode)");
    }
  };

  const handleDeleteSeason = async (seas) => {
    const isNumber = /^\d+$/.test(seas.id);
    if (isNumber) {
      try {
        const res = await fetch(`/api/settings/seasons/${seas.id}`, {
          method: "DELETE",
        });
        if (res.ok) {
          showToast("Seasonal Type deleted successfully!");
          fetchSettings();
        } else {
          const errData = await res.json().catch(() => ({}));
          showToast(
            `Failed to delete seasonal type: ${errData.error || "Server error"}`,
          );
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
  };

  const handleAddSize = async (nameVal) => {
    if (!nameVal || !nameVal.trim()) return;
    try {
      const res = await fetch("/api/settings/sizes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: nameVal.trim() }),
      });
      if (res.ok) {
        showToast("Size Collection added successfully!");
        fetchSettings();
      } else {
        const error = await res.json();
        showToast(error.error || "Failed to add size collection");
      }
    } catch {
      const newSize = { id: Date.now().toString(), name: nameVal.trim() };
      const updated = [...sizes, newSize];
      setSizes(updated);
      localStorage.setItem("hawrisha_sizes", JSON.stringify(updated));
      showToast("Size collection added successfully (offline mode)");
    }
  };

  const handleDeleteSize = async (sz) => {
    const isNumber = /^\d+$/.test(sz.id);
    if (isNumber) {
      try {
        const res = await fetch(`/api/settings/sizes/${sz.id}`, {
          method: "DELETE",
        });
        if (res.ok) {
          showToast("Size Collection deleted successfully!");
          fetchSettings();
        } else {
          const errData = await res.json().catch(() => ({}));
          showToast(
            `Failed to delete size collection: ${errData.error || "Server error"}`,
          );
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
  };

  const handleAddPromotion = async (nameVal) => {
    if (!nameVal || !nameVal.trim()) return;
    try {
      const res = await fetch("/api/settings/promotions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: nameVal.trim() }),
      });
      if (res.ok) {
        showToast("Promotion added successfully!");
        fetchSettings();
      } else {
        const error = await res.json();
        showToast(error.error || "Failed to add promotion");
      }
    } catch {
      const newPromo = { id: Date.now().toString(), name: nameVal.trim() };
      const updated = [...promotions, newPromo];
      setPromotions(updated);
      localStorage.setItem("hawrisha_promotions", JSON.stringify(updated));
      showToast("Promotion added successfully (offline mode)");
    }
  };

  const handleDeletePromotion = async (promo) => {
    const isNumber = /^\d+$/.test(promo.id);
    if (isNumber) {
      try {
        const res = await fetch(`/api/settings/promotions/${promo.id}`, {
          method: "DELETE",
        });
        if (res.ok) {
          showToast("Promotion deleted successfully!");
          fetchSettings();
        } else {
          const errData = await res.json().catch(() => ({}));
          showToast(
            `Failed to delete promotion: ${errData.error || "Server error"}`,
          );
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
  };

  // Handle open add modal
  const handleOpenCreate = () => {
    setEditingProduct(null);
    setName("");
    setPrice("");
    setCategory([]);
    setBadge([]);
    setDesc("");
    setImageFile(null);
    setImagePreview("");
    setSelectedColors([]);

    // Clear new attributes
    setStyleLength([]);
    setStock(0);
    setPromotion([]);
    setMaterial([]);
    setSeasonalType([]);
    setSizeCollection([]);
    setDiscount(0);
    setShowValidation(false);

    setIsModalOpen(true);
  };

  // Handle open edit modal
  const handleOpenEdit = (product) => {
    setEditingProduct(product);
    setName(product.name || "");
    setPrice(product.price || "");
    setCategory(parseJsonArray(product.category));
    setBadge(parseJsonArray(product.badge));
    setDesc(product.description || "");
    setImageFile(null);
    setImagePreview(product.image_url || "");

    // Populate new attributes
    setStyleLength(parseJsonArray(product.style_length));
    setStock(product.stock || 0);
    setPromotion(parseJsonArray(product.promotion));
    setMaterial(parseJsonArray(product.material));
    setSeasonalType(parseJsonArray(product.seasonal_type));
    setSizeCollection(parseJsonArray(product.size_collection));
    setDiscount(product.discount || 0);

    // Map classes to selected ids
    if (product.colors && Array.isArray(product.colors)) {
      const selectedIds = colorsList
        .filter((ac) => product.colors.includes(ac.class))
        .map((ac) => ac.id);
      setSelectedColors(selectedIds);
    } else {
      setSelectedColors([]);
    }

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

    // Custom Validation checks
    const emptyFields = [];
    if (!name.trim()) emptyFields.push("Product Title");
    if (!price || Number(price) < 250)
      emptyFields.push(
        "Price (must be a valid Iraqi Dinar amount, e.g. 3000. Minimum 250 IQD)",
      );
    if (!desc.trim()) emptyFields.push("Product Description");
    if (!editingProduct && !imageFile) {
      emptyFields.push("Product Image Upload");
    }
    if (selectedColors.length === 0) {
      emptyFields.push("At least one Color Style");
    }
    if (category.length === 0) {
      emptyFields.push("Category (choose at least one)");
    }
    if (styleLength.length === 0) {
      emptyFields.push("Style / Length (choose at least one)");
    }
    if (sizeCollection.length === 0) {
      emptyFields.push("Size Collection (choose at least one)");
    }
    if (material.length === 0) {
      emptyFields.push("Material (choose at least one)");
    }
    if (seasonalType.length === 0) {
      emptyFields.push("Seasonal Type (choose at least one)");
    }

    if (emptyFields.length > 0) {
      setValidationError(emptyFields.join("\n• "));
      setShowValidation(true);
      return;
    }
    setShowValidation(false);

    setLoading(true);

    const activeColorObjects = colorsList.filter((c) =>
      selectedColors.includes(c.id),
    );
    const finalColors = activeColorObjects.map((c) => c.class);
    const finalColorNames = activeColorObjects.map((c) => c.name);
    const finalColorFamily =
      activeColorObjects.length > 0 ? activeColorObjects[0].family : "beige";

    const formData = new FormData();
    formData.append("name", name);
    formData.append("price", price);
    formData.append("category", JSON.stringify(category));
    formData.append("colorFamily", finalColorFamily);
    formData.append("badge", JSON.stringify(badge));
    formData.append("desc", desc);
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

    if (imageFile) {
      formData.append("image", imageFile);
    }

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
      .then(() => {
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

    fetch(`/api/products/${id}`, {
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

  const totalItems = products.length;

  const totalStock = products.reduce(
    (acc, p) => acc + (Number(p.stock) || 0),
    0,
  );

  const outOfStockItems = products.filter((p) => Number(p.stock) === 0).length;

  const totalSales = products.reduce(
    (acc, p) => acc + (Number(p.sales) || 0),
    0,
  );

  return (
    <div className="flex min-h-screen bg-[#f8fafc] text-slate-800 font-sans select-none overflow-hidden w-full">
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
      <aside className="hidden lg:flex flex-col w-64 bg-[#36454F] text-[#F5F5DC] border-r border-[#B2AC88]/20 p-6 select-none shrink-0 justify-between">
        <div className="space-y-8">
          {/* Logo Header */}
          <div className="border-b border-[#B2AC88]/15 pb-4">
            <h2 className="text-2xl font-serif italic font-bold text-[#B2AC88] tracking-widest">
              HAWRISHA
            </h2>
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#B2AC88]/60 mt-1 block">
              Control Center
            </span>
          </div>

          {/* Navigation Links */}
          <div className="space-y-1.5">
            <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400 block mb-2 px-3">
              Management
            </span>
            <button
              onClick={() => setActiveTab("inventory")}
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
              <span className="bg-[#B2AC88] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                {products.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`w-full flex items-center space-x-2.5 px-3.5 py-2.5 font-bold text-xs uppercase tracking-wider rounded-xl text-left cursor-pointer transition-all border ${
                activeTab === "settings"
                  ? "bg-[#B2AC88]/15 text-[#B2AC88] border-[#B2AC88]/25"
                  : "text-[#F5F5DC]/55 border-transparent hover:text-[#F5F5DC]/80"
              }`}
            >
              <Settings size={16} />
              <span>Settings</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-screen overflow-y-auto bg-[#f8fafc]">
        {/* Mobile Header Dashboard Banner */}
        <header className="lg:hidden flex items-center justify-between bg-[#36454F] text-[#F5F5DC] px-6 py-4 border-b border-[#B2AC88]/20 select-none shadow-xs w-full">
          <div>
            <h2 className="text-xl font-serif italic font-bold text-[#B2AC88]">
              HAWRISHA
            </h2>
            <span className="text-[9px] uppercase tracking-wider font-semibold opacity-70">
              Admin Center
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() =>
                setActiveTab(
                  activeTab === "inventory" ? "settings" : "inventory",
                )
              }
              className="p-1 bg-[#B2AC88]/20 text-[#B2AC88] rounded-lg"
            >
              <Settings size={18} />
            </button>
            <span className="bg-[#B2AC88] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              {products.length} items
            </span>
          </div>
        </header>

        {/* Main Section Inner */}
        <div className="p-6 lg:p-10 max-w-7xl w-full mx-auto space-y-8">
          {activeTab === "inventory" ? (
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
                  <h3 className="font-bold text-xs uppercase tracking-wider text-gray-400">
                    Inventory Status
                  </h3>
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
                          <th className="pb-3 px-4">Category</th>
                          <th className="pb-3 px-4">Price</th>
                          <th className="pb-3 px-4">Stock</th>
                          <th className="pb-3 px-4">Discount</th>
                          <th className="pb-3 px-4">Description</th>
                          <th className="pb-3 pl-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100/60 text-sm">
                        {products.map((product) => (
                          <tr
                            key={product.id}
                            className="group hover:bg-slate-50/50 transition-colors"
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
                                {product.name}
                              </span>
                              {parseJsonArray(product.badge).map((b, idx) => (
                                <span
                                  key={idx}
                                  className="ml-2 bg-[#B2AC88]/10 text-[#B2AC88] text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full"
                                >
                                  {b}
                                </span>
                              ))}
                            </td>
                            <td className="py-4 px-4 text-slate-500 font-semibold text-xs uppercase tracking-wide">
                              {parseJsonArray(product.category).join(", ")}
                            </td>
                            <td className="py-4 px-4 font-bold text-[#36454F]">
                              {product.price.toLocaleString()} IQD
                            </td>
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
                            <td className="py-4 px-4 font-semibold text-xs text-[#36454F]">
                              {product.discount > 0 ? (
                                <span className="text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100/50">
                                  {product.discount}% Off
                                </span>
                              ) : (
                                <span className="text-slate-400 font-normal">
                                  -
                                </span>
                              )}
                            </td>
                            <td
                              className="py-4 px-4 text-slate-400 truncate max-w-[200px]"
                              title={product.description || ""}
                            >
                              {product.description ||
                                "No description provided."}
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
                                onClick={() => setProductToDelete(product)}
                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors cursor-pointer"
                              >
                                <Trash2 size={15} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* System Settings Management Panel */
            <div className="space-y-8">
              <div className="border-b border-slate-200 pb-5">
                <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#36454F] italic tracking-tight">
                  System Settings
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
                  <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-2xs max-w-xl mx-auto">
                    <h3 className="text-md font-bold text-[#36454F] mb-4 uppercase tracking-wider">
                      Product Categories
                    </h3>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const val = e.target.categoryInput.value;
                        handleAddCategory(val);
                        e.target.categoryInput.value = "";
                      }}
                      className="flex gap-2.5 mb-4"
                    >
                      <input
                        name="categoryInput"
                        type="text"
                        placeholder="Add custom category..."
                        className="flex-1 border border-slate-200 px-4 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B2AC88]/20 focus:border-[#B2AC88] text-black transition-all placeholder:text-gray-400 bg-white font-medium shadow-xs"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-[#B2AC88] hover:bg-[#B2AC88]/90 text-white rounded-xl text-xs font-bold uppercase cursor-pointer transition-colors active:scale-95 shadow-sm"
                      >
                        Add
                      </button>
                    </form>

                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 pr-1">
                      {categories.map((cat) => (
                        <div
                          key={cat.id}
                          className="py-2.5 flex items-center justify-between group"
                        >
                          <span className="text-sm font-semibold text-slate-700">
                            {cat.name}
                          </span>
                          <button
                            onClick={() => handleDeleteCategory(cat)}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Badges Subtab */}
                {settingsSubTab === "badges" && (
                  <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-2xs max-w-xl mx-auto">
                    <h3 className="text-md font-bold text-[#36454F] mb-4 uppercase tracking-wider">
                      Product Labels & Badges
                    </h3>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const val = e.target.badgeInput.value;
                        handleAddBadge(val);
                        e.target.badgeInput.value = "";
                      }}
                      className="flex gap-2.5 mb-4"
                    >
                      <input
                        name="badgeInput"
                        type="text"
                        placeholder="Add custom badge label..."
                        className="flex-1 border border-slate-200 px-4 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B2AC88]/20 focus:border-[#B2AC88] text-black transition-all placeholder:text-gray-400 bg-white font-medium shadow-xs"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-[#B2AC88] hover:bg-[#B2AC88]/90 text-white rounded-xl text-xs font-bold uppercase cursor-pointer transition-colors active:scale-95 shadow-sm"
                      >
                        Add
                      </button>
                    </form>

                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 pr-1">
                      {badges.map((b) => (
                        <div
                          key={b.id}
                          className="py-2.5 flex items-center justify-between group"
                        >
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                            {b.name}
                          </span>
                          <button
                            onClick={() => handleDeleteBadge(b)}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Colors Subtab */}
                {settingsSubTab === "colors" && (
                  <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-2xs flex flex-col justify-between min-h-[500px] max-w-xl mx-auto">
                    <div>
                      <h3 className="text-md font-bold text-[#36454F] mb-4 uppercase tracking-wider">
                        Color Swatch Collections
                      </h3>

                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          const nameVal = e.target.colorName.value;
                          if (!nameVal.trim()) return;

                          const words = nameVal.trim().split(/\s+/);
                          const familyVal =
                            words.length > 0
                              ? words[words.length - 1].toLowerCase()
                              : "beige";

                          handleAddColor({
                            name: nameVal,
                            class: colorValue,
                            family: familyVal,
                          });

                          e.target.colorName.value = "";
                          setColorValue("#000000");
                        }}
                        className="space-y-3.5 mb-5 bg-slate-50/50 p-4 rounded-2xl border border-slate-200"
                      >
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                            Color Name
                          </label>
                          <input
                            required
                            name="colorName"
                            type="text"
                            placeholder="Black"
                            className="w-full border border-slate-200 px-4 py-2 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#B2AC88]/20 focus:border-[#B2AC88] text-black transition-all bg-white font-medium placeholder:text-gray-400 shadow-xs"
                          />
                        </div>
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
                          className="w-full py-2 bg-[#B2AC88] hover:bg-[#B2AC88]/90 text-white rounded-xl text-xs font-bold uppercase cursor-pointer transition-colors active:scale-95 shadow-sm"
                        >
                          Add Color Swatch
                        </button>
                      </form>
                    </div>

                    <div className="flex-grow overflow-y-auto pr-1 max-h-80">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {colorsList.map((color) => (
                          <div
                            key={color.id}
                            className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-xl group hover:border-[#B2AC88] transition-all shadow-xs"
                          >
                            <div className="flex items-center space-x-2.5">
                              <span
                                className={`w-5 h-5 rounded-full border border-gray-200/50 ${color.class && color.class.startsWith("bg-") ? color.class : ""}`}
                                style={getColorStyle(color.class)}
                              />
                              <div>
                                <p className="text-xs font-bold text-slate-700">
                                  {color.name}
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
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Styles / Lengths Subtab */}
                {settingsSubTab === "styles" && (
                  <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-2xs max-w-xl mx-auto">
                    <h3 className="text-md font-bold text-[#36454F] mb-4 uppercase tracking-wider">
                      Product Styles & Lengths
                    </h3>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const val = e.target.styleInput.value;
                        handleAddStyle(val);
                        e.target.styleInput.value = "";
                      }}
                      className="flex gap-2.5 mb-4"
                    >
                      <input
                        name="styleInput"
                        type="text"
                        placeholder="Add custom style..."
                        className="flex-1 border border-slate-200 px-4 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B2AC88]/20 focus:border-[#B2AC88] text-black transition-all placeholder:text-gray-400 bg-white font-medium shadow-xs"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-[#B2AC88] hover:bg-[#B2AC88]/90 text-white rounded-xl text-xs font-bold uppercase cursor-pointer transition-colors active:scale-95 shadow-sm"
                      >
                        Add
                      </button>
                    </form>

                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 pr-1">
                      {styles.map((st) => (
                        <div
                          key={st.id}
                          className="py-2.5 flex items-center justify-between group"
                        >
                          <span className="text-sm font-semibold text-slate-700">
                            {st.name}
                          </span>
                          <button
                            onClick={() => handleDeleteStyle(st)}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Materials Subtab */}
                {settingsSubTab === "materials" && (
                  <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-2xs max-w-xl mx-auto">
                    <h3 className="text-md font-bold text-[#36454F] mb-4 uppercase tracking-wider">
                      Product Materials
                    </h3>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const val = e.target.materialInput.value;
                        handleAddMaterial(val);
                        e.target.materialInput.value = "";
                      }}
                      className="flex gap-2.5 mb-4"
                    >
                      <input
                        name="materialInput"
                        type="text"
                        placeholder="Add custom material..."
                        className="flex-1 border border-slate-200 px-4 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B2AC88]/20 focus:border-[#B2AC88] text-black transition-all placeholder:text-gray-400 bg-white font-medium shadow-xs"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-[#B2AC88] hover:bg-[#B2AC88]/90 text-white rounded-xl text-xs font-bold uppercase cursor-pointer transition-colors active:scale-95 shadow-sm"
                      >
                        Add
                      </button>
                    </form>

                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 pr-1">
                      {materials.map((mat) => (
                        <div
                          key={mat.id}
                          className="py-2.5 flex items-center justify-between group"
                        >
                          <span className="text-sm font-semibold text-slate-700">
                            {mat.name}
                          </span>
                          <button
                            onClick={() => handleDeleteMaterial(mat)}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Seasons Subtab */}
                {settingsSubTab === "seasons" && (
                  <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-2xs max-w-xl mx-auto">
                    <h3 className="text-md font-bold text-[#36454F] mb-4 uppercase tracking-wider">
                      Seasonal Types
                    </h3>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const val = e.target.seasonInput.value;
                        handleAddSeason(val);
                        e.target.seasonInput.value = "";
                      }}
                      className="flex gap-2.5 mb-4"
                    >
                      <input
                        name="seasonInput"
                        type="text"
                        placeholder="Add custom seasonal type..."
                        className="flex-1 border border-slate-200 px-4 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B2AC88]/20 focus:border-[#B2AC88] text-black transition-all placeholder:text-gray-400 bg-white font-medium shadow-xs"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-[#B2AC88] hover:bg-[#B2AC88]/90 text-white rounded-xl text-xs font-bold uppercase cursor-pointer transition-colors active:scale-95 shadow-sm"
                      >
                        Add
                      </button>
                    </form>

                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 pr-1">
                      {seasons.map((seas) => (
                        <div
                          key={seas.id}
                          className="py-2.5 flex items-center justify-between group"
                        >
                          <span className="text-sm font-semibold text-slate-700">
                            {seas.name}
                          </span>
                          <button
                            onClick={() => handleDeleteSeason(seas)}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sizes Subtab */}
                {settingsSubTab === "sizes" && (
                  <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-2xs max-w-xl mx-auto">
                    <h3 className="text-md font-bold text-[#36454F] mb-4 uppercase tracking-wider">
                      Size Collections
                    </h3>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const val = e.target.sizeInput.value;
                        handleAddSize(val);
                        e.target.sizeInput.value = "";
                      }}
                      className="flex gap-2.5 mb-4"
                    >
                      <input
                        name="sizeInput"
                        type="text"
                        placeholder="Add custom size..."
                        className="flex-1 border border-slate-200 px-4 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B2AC88]/20 focus:border-[#B2AC88] text-black transition-all placeholder:text-gray-400 bg-white font-medium shadow-xs"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-[#B2AC88] hover:bg-[#B2AC88]/90 text-white rounded-xl text-xs font-bold uppercase cursor-pointer transition-colors active:scale-95 shadow-sm"
                      >
                        Add
                      </button>
                    </form>

                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 pr-1">
                      {sizes.map((sz) => (
                        <div
                          key={sz.id}
                          className="py-2.5 flex items-center justify-between group"
                        >
                          <span className="text-sm font-semibold text-slate-700">
                            {sz.name}
                          </span>
                          <button
                            onClick={() => handleDeleteSize(sz)}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Promotions Subtab */}
                {settingsSubTab === "promotions" && (
                  <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-2xs max-w-xl mx-auto">
                    <h3 className="text-md font-bold text-[#36454F] mb-4 uppercase tracking-wider">
                      Promotions & Discounts Campaign labels
                    </h3>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const val = e.target.promoInput.value;
                        handleAddPromotion(val);
                        e.target.promoInput.value = "";
                      }}
                      className="flex gap-2.5 mb-4"
                    >
                      <input
                        name="promoInput"
                        type="text"
                        placeholder="Add custom promotion label..."
                        className="flex-1 border border-slate-200 px-4 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B2AC88]/20 focus:border-[#B2AC88] text-black transition-all placeholder:text-gray-400 bg-white font-medium shadow-xs"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-[#B2AC88] hover:bg-[#B2AC88]/90 text-white rounded-xl text-xs font-bold uppercase cursor-pointer transition-colors active:scale-95 shadow-sm"
                      >
                        Add
                      </button>
                    </form>

                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 pr-1">
                      {promotions.map((promo) => (
                        <div
                          key={promo.id}
                          className="py-2.5 flex items-center justify-between group"
                        >
                          <span className="text-sm font-semibold text-slate-700">
                            {promo.name}
                          </span>
                          <button
                            onClick={() => handleDeletePromotion(promo)}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Elegant Add/Edit Product Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-xs"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl p-8 max-w-xl w-full max-h-[90vh] overflow-y-auto relative shadow-2xl z-10"
            >
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setShowValidation(false);
                }}
                className="absolute top-6 right-6 p-1.5 text-gray-400 hover:text-[#36454F] hover:bg-gray-100 rounded-full transition-all"
              >
                <X size={20} />
              </button>

              <h2 className="text-2xl font-serif italic font-bold text-[#36454F] mb-6 border-b pb-4 border-gray-100">
                {editingProduct ? "Edit Catalog Product" : "Add New Product"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* 1. Name Input */}
                <div>
                  <label className="flex items-center space-x-1.5 text-xs font-bold uppercase text-gray-400 mb-2">
                    <Tag size={13} />
                    <span>Product Title</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Comfy Stripe Socks"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border border-slate-200 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B2AC88]/20 focus:border-[#B2AC88] text-black transition-all placeholder:text-gray-400 font-medium bg-white shadow-xs"
                  />
                </div>

                {/* 2. Price and Category Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="flex items-center space-x-1.5 text-xs font-bold uppercase text-gray-400 mb-2">
                      <DollarSign size={13} />
                      <span>Price (IQD)</span>
                    </label>
                    <input
                      type="number"
                      placeholder="6250"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full border border-slate-200 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B2AC88]/20 focus:border-[#B2AC88] text-black transition-all placeholder:text-gray-400 font-medium bg-white shadow-xs"
                    />
                  </div>
                  <div>
                    <label className="flex items-center space-x-1.5 text-xs font-bold uppercase text-gray-400 mb-2">
                      <SlidersHorizontal size={13} className="inline mr-1" />
                      <span>Category</span>
                    </label>
                    <div
                      className={`flex flex-wrap gap-2 max-h-32 overflow-y-auto border p-3.5 rounded-xl bg-white shadow-xs transition-colors ${
                        showValidation && category.length === 0
                          ? "border-red-400 bg-red-50/30 ring-2 ring-red-200"
                          : "border-slate-200"
                      }`}
                    >
                      {showValidation && category.length === 0 && (
                        <p className="w-full text-[10px] font-bold text-red-500 uppercase tracking-wider mb-1">
                          Select at least one
                        </p>
                      )}
                      {categories.map((cat) => {
                        const isSelected = category.includes(cat.name);
                        return (
                          <button
                            type="button"
                            key={cat.id}
                            onClick={() => {
                              setCategory((prev) =>
                                prev.includes(cat.name)
                                  ? prev.filter((c) => c !== cat.name)
                                  : [...prev, cat.name],
                              );
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                              isSelected
                                ? "bg-[#36454F] text-[#F5F5DC] border-[#36454F]"
                                : "bg-slate-50 text-slate-650 border-slate-200 hover:bg-slate-100"
                            }`}
                          >
                            {cat.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Extended Product Attributes Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="flex items-center space-x-1.5 text-xs font-bold uppercase text-gray-400 mb-2">
                      <span>Style / Length</span>
                    </label>
                    <div
                      className={`flex flex-wrap gap-2 max-h-32 overflow-y-auto border p-3 rounded-xl bg-white shadow-xs transition-colors ${
                        showValidation && styleLength.length === 0
                          ? "border-red-400 bg-red-50/30 ring-2 ring-red-200"
                          : "border-slate-200"
                      }`}
                    >
                      {showValidation && styleLength.length === 0 && (
                        <p className="w-full text-[10px] font-bold text-red-500 uppercase tracking-wider mb-1">
                          Select at least one
                        </p>
                      )}
                      {styles.map((st) => {
                        const isSelected = styleLength.includes(st.name);
                        return (
                          <button
                            type="button"
                            key={st.id}
                            onClick={() => {
                              setStyleLength((prev) =>
                                prev.includes(st.name)
                                  ? prev.filter((s) => s !== st.name)
                                  : [...prev, st.name],
                              );
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                              isSelected
                                ? "bg-[#36454F] text-[#F5F5DC] border-[#36454F]"
                                : "bg-slate-50 text-slate-650 border-slate-200 hover:bg-slate-100"
                            }`}
                          >
                            {st.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <label className="flex items-center space-x-1.5 text-xs font-bold uppercase text-gray-400 mb-2">
                      <span>Size Collection</span>
                    </label>
                    <div
                      className={`flex flex-wrap gap-2 max-h-32 overflow-y-auto border p-3 rounded-xl bg-white shadow-xs transition-colors ${
                        showValidation && sizeCollection.length === 0
                          ? "border-red-400 bg-red-50/30 ring-2 ring-red-200"
                          : "border-slate-200"
                      }`}
                    >
                      {showValidation && sizeCollection.length === 0 && (
                        <p className="w-full text-[10px] font-bold text-red-500 uppercase tracking-wider mb-1">
                          Select at least one
                        </p>
                      )}
                      {sizes.map((sz) => {
                        const isSelected = sizeCollection.includes(sz.name);
                        return (
                          <button
                            type="button"
                            key={sz.id}
                            onClick={() => {
                              setSizeCollection((prev) =>
                                prev.includes(sz.name)
                                  ? prev.filter((s) => s !== sz.name)
                                  : [...prev, sz.name],
                              );
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                              isSelected
                                ? "bg-[#36454F] text-[#F5F5DC] border-[#36454F]"
                                : "bg-slate-50 text-slate-650 border-slate-200 hover:bg-slate-100"
                            }`}
                          >
                            {sz.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="flex items-center space-x-1.5 text-xs font-bold uppercase text-gray-400 mb-2">
                      <span>Material</span>
                    </label>
                    <div
                      className={`flex flex-wrap gap-2 max-h-32 overflow-y-auto border p-3 rounded-xl bg-white shadow-xs transition-colors ${
                        showValidation && material.length === 0
                          ? "border-red-400 bg-red-50/30 ring-2 ring-red-200"
                          : "border-slate-200"
                      }`}
                    >
                      {showValidation && material.length === 0 && (
                        <p className="w-full text-[10px] font-bold text-red-500 uppercase tracking-wider mb-1">
                          Select at least one
                        </p>
                      )}
                      {materials.map((mat) => {
                        const isSelected = material.includes(mat.name);
                        return (
                          <button
                            type="button"
                            key={mat.id}
                            onClick={() => {
                              setMaterial((prev) =>
                                prev.includes(mat.name)
                                  ? prev.filter((m) => m !== mat.name)
                                  : [...prev, mat.name],
                              );
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                              isSelected
                                ? "bg-[#36454F] text-[#F5F5DC] border-[#36454F]"
                                : "bg-slate-50 text-slate-650 border-slate-200 hover:bg-slate-100"
                            }`}
                          >
                            {mat.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <label className="flex items-center space-x-1.5 text-xs font-bold uppercase text-gray-400 mb-2">
                      <span>Seasonal Type</span>
                    </label>
                    <div
                      className={`flex flex-wrap gap-2 max-h-32 overflow-y-auto border p-3 rounded-xl bg-white shadow-xs transition-colors ${
                        showValidation && seasonalType.length === 0
                          ? "border-red-400 bg-red-50/30 ring-2 ring-red-200"
                          : "border-slate-200"
                      }`}
                    >
                      {showValidation && seasonalType.length === 0 && (
                        <p className="w-full text-[10px] font-bold text-red-500 uppercase tracking-wider mb-1">
                          Select at least one
                        </p>
                      )}
                      {seasons.map((seas) => {
                        const isSelected = seasonalType.includes(seas.name);
                        return (
                          <button
                            type="button"
                            key={seas.id}
                            onClick={() => {
                              setSeasonalType((prev) =>
                                prev.includes(seas.name)
                                  ? prev.filter((s) => s !== seas.name)
                                  : [...prev, seas.name],
                              );
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                              isSelected
                                ? "bg-[#36454F] text-[#F5F5DC] border-[#36454F]"
                                : "bg-slate-50 text-slate-650 border-slate-200 hover:bg-slate-100"
                            }`}
                          >
                            {seas.name}
                          </button>
                        );
                      })}
                    </div>
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
                    <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto border border-slate-200 p-3 rounded-xl bg-white shadow-xs">
                      {badges.map((b) => {
                        const isSelected = badge.includes(b.name);
                        return (
                          <button
                            type="button"
                            key={b.id}
                            onClick={() => {
                              setBadge((prev) =>
                                prev.includes(b.name)
                                  ? prev.filter((x) => x !== b.name)
                                  : [...prev, b.name],
                              );
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                              isSelected
                                ? "bg-[#36454F] text-[#F5F5DC] border-[#36454F]"
                                : "bg-slate-50 text-slate-650 border-slate-200 hover:bg-slate-100"
                            }`}
                          >
                            {b.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <label className="flex items-center space-x-1.5 text-xs font-bold uppercase text-gray-400 mb-2">
                      <span>Active Promotion</span>
                    </label>
                    <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto border border-slate-200 p-3 rounded-xl bg-white shadow-xs">
                      {promotions.map((p) => {
                        const isSelected = promotion.includes(p.name);
                        return (
                          <button
                            type="button"
                            key={p.id}
                            onClick={() => {
                              setPromotion((prev) =>
                                prev.includes(p.name)
                                  ? prev.filter((x) => x !== p.name)
                                  : [...prev, p.name],
                              );
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                              isSelected
                                ? "bg-[#36454F] text-[#F5F5DC] border-[#36454F]"
                                : "bg-slate-50 text-slate-650 border-slate-200 hover:bg-slate-100"
                            }`}
                          >
                            {p.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* 3. Colors Input Grid */}
                <div className="grid grid-cols-1 gap-5">
                  <div>
                    <label className="flex items-center space-x-1.5 text-xs font-bold uppercase text-gray-400 mb-2">
                      <span>Select Color Styles</span>
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50 p-4 rounded-2xl border border-slate-200 max-h-48 overflow-y-auto shadow-xs">
                      {colorsList.map((color) => {
                        const isSelected = selectedColors.includes(color.id);
                        return (
                          <button
                            key={color.id}
                            type="button"
                            onClick={() => {
                              if (isSelected) {
                                setSelectedColors(
                                  selectedColors.filter((c) => c !== color.id),
                                );
                              } else {
                                setSelectedColors([
                                  ...selectedColors,
                                  color.id,
                                ]);
                              }
                            }}
                            className={`flex items-center space-x-2.5 p-2.5 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                              isSelected
                                ? "bg-white border-[#B2AC88] shadow-sm text-slate-800"
                                : "bg-white/50 border-slate-200 hover:border-slate-300 hover:bg-white text-slate-400"
                            }`}
                          >
                            <span
                              className={`w-4 h-4 rounded-full border border-gray-200/50 ${color.class && color.class.startsWith("bg-") ? color.class : ""}`}
                              style={getColorStyle(color.class)}
                            />
                            <span
                              className={
                                isSelected
                                  ? "text-[#36454F] font-bold"
                                  : "text-gray-400"
                              }
                            >
                              {color.name}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* 4. Description Input */}
                <div>
                  <label className="flex items-center space-x-1.5 text-xs font-bold uppercase text-gray-400 mb-2">
                    <FileText size={13} />
                    <span>Product Description</span>
                  </label>
                  <textarea
                    rows="3"
                    placeholder="Details about material comfort, weave, dimensions..."
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    className="w-full border border-slate-200 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B2AC88]/20 focus:border-[#B2AC88] text-black transition-all placeholder:text-gray-400 resize-none font-medium bg-white shadow-xs"
                  />
                </div>

                {/* 5. Image Selector & Preview */}
                <div>
                  <label className="flex items-center space-x-1.5 text-xs font-bold uppercase text-gray-400 mb-2">
                    <Upload size={13} />
                    <span>Product Image Upload</span>
                  </label>
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    {/* Upload Box */}
                    <label className="w-full sm:w-1/2 flex flex-col items-center justify-center border border-dashed border-slate-200 hover:border-[#B2AC88] rounded-2xl p-4 cursor-pointer text-center group transition-colors bg-gray-50/30">
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
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
                  "{productToDelete.name}"
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
