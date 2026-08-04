/**
 * Reseed via the dashboard's own API workflow (NOT raw SQL inserts).
 * Run: node backend/reseed_via_dashboard.cjs
 *
 * - Recreates product categories through the same endpoint the "Add New
 *   Category" form uses (POST /api/settings/categories), trilingual.
 * - Recreates 10 stores through the "Add Store" endpoint (POST /api/stores).
 * - Recreates 2-3 products per store through the "Add New Product" endpoint
 *   (POST /api/products, multipart) with EVERY required field the dashboard
 *   validates: trilingual title + description, price, gender, style, material,
 *   seasonal type, size collection, color variant (image + per-size stock),
 *   badge, discount and store — exactly like a manual admin submission.
 *
 * Only the pre-clean (removing old rows) touches the DB directly; every
 * creation goes through the HTTP API so it obeys the real validation rules.
 */
const fs = require('fs');
const path = require('path');
const db = require('./config/db');

const BASE = process.env.API_BASE || 'http://localhost:5001';
const ADMIN_EMAIL = 'admin@hhawrisha.com';
const VENDOR_PASSWORD = '12345678';

async function api(pathname, opts = {}) {
  const res = await fetch(BASE + pathname, opts);
  const text = await res.text();
  let body; try { body = JSON.parse(text); } catch { body = text; }
  if (!res.ok) throw new Error(`${opts.method || 'GET'} ${pathname} -> ${res.status}: ${text}`);
  return body;
}
const jsonPost = (pathname, obj) =>
  api(pathname, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(obj) });

const tri = (en, ku, ar) => JSON.stringify({ en, ku: ku || en, ar: ar || en });
const englishOf = (nameField) => {
  try { return nameField.startsWith('{') ? (JSON.parse(nameField).en || nameField) : nameField; }
  catch { return nameField; }
};

// --- catalog definitions -------------------------------------------------
const CATEGORIES = [
  { en: 'Animals',   ku: 'ئاژەڵەکان',   ar: 'حيوانات' },
  { en: 'Fruits',    ku: 'میوەکان',      ar: 'فواكه' },
  { en: 'Patterns',  ku: 'نەخشەکان',     ar: 'أنماط' },
  { en: 'Cozy Crew', ku: 'کۆزی کرو',     ar: 'كوزي كرو' },
  { en: 'Sport',     ku: 'وەرزشی',       ar: 'رياضة' },
  { en: 'Luxury',    ku: 'خۆشگوزەرانی',  ar: 'فخامة' },
];

const storeNames = [
  "Golden Fleece Socks", "Cozy Steps Boutique", "Kurdish Weavers Co.",
  "Erbil Threads Market", "Velvet Comfort Haven", "Suli Sock Studio",
  "Alpine Warmth Footwear", "Retro Patterns Bazaar", "Vibrant Steps", "Luxury Comfort Lines"
];
const firstNames = ["Sarkawt", "Aram", "Darya", "Rebin", "Zhana", "Karwan", "Lavin", "Soran", "Shanga", "Dana"];
const lastNames  = ["Kurd", "Barzani", "Sulaimani", "Erbili", "Hawrami", "Zebari", "Jaf", "Doski", "Gorani", "Sorani"];
const citiesList = ["Erbil", "Sulaymaniyah", "Duhok", "Baghdad", "Basra", "Kirkuk"];
const sockPrefixes = ["Vintage", "Cozy", "Thermal", "Cloud", "Pastel", "Silk Blend", "Nordic", "Geometric"];
const sockTypes    = ["Crew Socks", "Ankle Socks", "Knee Highs", "Quarter Socks", "Wool Socks", "Dress Socks"];
const genders = ["Men", "Women", "Kids"]; // Unisex intentionally removed
const badges  = [["New"], ["Bestseller"], ["Sale"], []];
const productImages = ["bs1.jpg", "bs2.jpg", "bs3.jpg", "bs4.jpg"];

const imgDir = path.join(__dirname, '../public/bestsellers');
function imageBlob(name) {
  const buf = fs.readFileSync(path.join(imgDir, name));
  return new Blob([buf], { type: 'image/jpeg' });
}

async function cleanup() {
  console.log('Clearing existing products, stores, vendors and old categories...');
  await db.query('DELETE FROM product_colors');
  await db.query('DELETE FROM products');
  await db.query('DELETE FROM store_delivery_prices');
  await db.query('DELETE FROM stores');
  await db.query("DELETE FROM users WHERE role = 'vendor'");
  await db.query('ALTER TABLE products AUTO_INCREMENT = 1');
  await db.query('ALTER TABLE stores AUTO_INCREMENT = 1');
  // Remove old categories through the API so it mirrors the dashboard delete flow.
  const oldCats = await api('/api/settings/categories');
  for (const c of oldCats) await api(`/api/settings/categories/${c.id}`, { method: 'DELETE' });
}

async function main() {
  try {
    await cleanup();

    // 1) Categories — via the Add New Category endpoint (trilingual).
    console.log('Creating categories through /api/settings/categories ...');
    for (const c of CATEGORIES) await jsonPost('/api/settings/categories', { name: tri(c.en, c.ku, c.ar) });
    const categories = await api('/api/settings/categories');

    // 2) Attribute settings the product form references (must already exist).
    const styles    = await api('/api/settings/styles');
    const materials  = await api('/api/settings/materials');
    const seasons    = await api('/api/settings/seasons');
    const sizes      = await api('/api/settings/sizes');
    const colors     = await api('/api/settings/colors');
    for (const [label, arr] of [['styles', styles], ['materials', materials], ['seasons', seasons], ['sizes', sizes], ['colors', colors]]) {
      if (!arr.length) throw new Error(`No ${label} configured — cannot build valid products.`);
    }

    let productTotal = 0;

    // 3) Stores + products.
    for (let i = 0; i < 10; i++) {
      const storeName = storeNames[i];
      const city = citiesList[i % citiesList.length];
      const email = `demo_vendor_${i + 1}@hawrisha.com`;
      const phone = `+964${7701000000 + i}`; // +964 followed by exactly 10 digits

      const store = await jsonPost('/api/stores', {
        adminEmail: ADMIN_EMAIL,
        name: storeName,
        description: `Welcome to ${storeName}. Handcrafted socks for everyday comfort.`,
        owner_name: `${firstNames[i]} ${lastNames[i]}`,
        email,
        phone,
        city,
        address: `Main Street, ${city}`,
        social_links: '{}',
        password: VENDOR_PASSWORD,
        commission_percentage: 10,
      });
      const storeId = store.id;

      const productCount = (i % 2 === 0) ? 3 : 2;
      for (let p = 0; p < productCount; p++) {
        const k = i + p;
        const style    = styles[k % styles.length];
        const material = materials[k % materials.length];
        const season   = seasons[k % seasons.length];
        const size1    = sizes[k % sizes.length];
        const size2    = sizes[(k + 1) % sizes.length];
        const color    = colors[k % colors.length];
        const category = categories[k % categories.length];
        const gender   = genders[k % genders.length];
        const pfx = sockPrefixes[k % sockPrefixes.length];
        const typ = sockTypes[k % sockTypes.length];
        const price = (45 + (k % 12) * 5) * 100;
        const discount = (p === 0 && i % 3 === 0) ? 15 : 0;
        const imgName = productImages[k % productImages.length];

        const s1 = englishOf(size1.name);
        const s2 = englishOf(size2.name);
        const stockMap = { [s1]: 15 }; if (s2 !== s1) stockMap[s2] = 10;
        const colorVariant = {
          color: { id: color.id, class: color.class, name: color.name, family: color.family },
          image: `/bestsellers/${imgName}`,
          stock: stockMap,
        };
        const sizeColors = { [s1]: [color.class] }; if (s2 !== s1) sizeColors[s2] = [color.class];
        const sizeCollection = s2 !== s1 ? [size1.name, size2.name] : [size1.name];
        const totalStock = Object.values(stockMap).reduce((a, b) => a + b, 0);

        const fd = new FormData();
        fd.append('vendorEmail', ADMIN_EMAIL);
        fd.append('storeId', String(storeId));
        fd.append('name', tri(`${pfx} ${typ}`, `گۆرەوی ${pfx}`, `جوارب ${pfx}`));
        fd.append('price', String(price));
        fd.append('category', JSON.stringify([category.name]));
        fd.append('colorFamily', JSON.stringify([color.family]));
        fd.append('badge', JSON.stringify(badges[k % badges.length]));
        fd.append('desc', tri(
          `Premium ${pfx} ${typ} from ${storeName}. Ultra-soft, breathable cotton blend for all-day comfort.`,
          `گۆرەوی بەرزترین کوالیتی لە ${storeName}. نەرم و گونجاو بۆ ڕۆژانە.`,
          `جوارب فاخرة من ${storeName}. قطن ناعم ومريح طوال اليوم.`
        ));
        fd.append('colors', JSON.stringify([color.class]));
        fd.append('colorNames', JSON.stringify([color.name]));
        fd.append('styleLength', JSON.stringify([style.name]));
        fd.append('promotion', JSON.stringify([]));
        fd.append('material', JSON.stringify([material.name]));
        fd.append('seasonalType', JSON.stringify([season.name]));
        fd.append('sizeCollection', JSON.stringify(sizeCollection));
        fd.append('discount', String(discount));
        fd.append('gender', gender);
        fd.append('customAttributes', JSON.stringify({}));
        fd.append('colorVariants', JSON.stringify([colorVariant]));
        fd.append('stock', String(totalStock));
        fd.append('sizeColors', JSON.stringify(sizeColors));
        fd.append('image', imageBlob(imgName), imgName);

        await api('/api/products', { method: 'POST', body: fd });
        productTotal++;
      }
      console.log(`  ✓ ${storeName} (store #${storeId}) + ${productCount} products`);
    }

    console.log(`\nDone: ${CATEGORIES.length} categories, 10 stores, ${productTotal} products — all via the dashboard API.`);
    process.exit(0);
  } catch (err) {
    console.error('Reseed failed:', err.message);
    process.exit(1);
  }
}

main();
