/**
 * Reseed via the dashboard's own API workflow (NOT raw SQL inserts).
 * Run: node backend/reseed_via_dashboard.cjs
 *
 * - Recreates 12 stores through the "Add Store" endpoint (POST /api/stores),
 *   each with a trilingual name/description, an uploaded logo + banner, a
 *   vendor login, a commission rate and a full Delivery Management price list.
 * - Recreates 1-2 products per store through the "Add New Product" endpoint
 *   (POST /api/products, multipart) with EVERY field the dashboard validates:
 *   trilingual title + description, price, gender, style, material, seasonal
 *   type, design, sport type, badge, discount, store, plus 4 sizes and 5
 *   colour variants (each with its own image and per-size stock).
 *
 * Product categories are left untouched — they were already created through
 * the dashboard's Add New Category form and are referenced here by name.
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

const SIZES_PER_PRODUCT = 4;  // requirement: more than 2
const COLORS_PER_PRODUCT = 5; // requirement: more than 3

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
  try { return String(nameField).startsWith('{') ? (JSON.parse(nameField).en || nameField) : nameField; }
  catch { return nameField; }
};

// --- catalog definitions -------------------------------------------------
// 12 stores, each trilingual. ku/ar are real translations, not copies.
const STORES = [
  { en: 'Golden Fleece Socks',   ku: 'گۆرەوی خوری زێڕین',   ar: 'جوارب الصوف الذهبي',   owner: ['Sarkawt', 'Kurd'] },
  { en: 'Cozy Steps Boutique',   ku: 'بوتیکی هەنگاوی گەرم', ar: 'بوتيك الخطوات الدافئة', owner: ['Aram', 'Barzani'] },
  { en: 'Kurdish Weavers Co.',   ku: 'کۆمپانیای چنراوی کورد', ar: 'شركة النساجين الكرد', owner: ['Darya', 'Sulaimani'] },
  { en: 'Erbil Threads Market',  ku: 'بازاڕی دەزووی هەولێر', ar: 'سوق خيوط أربيل',      owner: ['Rebin', 'Erbili'] },
  { en: 'Velvet Comfort Haven',  ku: 'پەناگەی ئاسوودەیی قەتیفە', ar: 'ملاذ الراحة المخملية', owner: ['Zhana', 'Hawrami'] },
  { en: 'Suli Sock Studio',      ku: 'ستودیۆی گۆرەوی سلێمانی', ar: 'استوديو جوارب السليمانية', owner: ['Karwan', 'Zebari'] },
  { en: 'Alpine Warmth Footwear', ku: 'پێڵاوی گەرمی چیایی', ar: 'أحذية الدفء الجبلي',   owner: ['Lavin', 'Jaf'] },
  { en: 'Retro Patterns Bazaar', ku: 'بازاڕی نەخشی کۆن',    ar: 'بازار الأنماط الكلاسيكية', owner: ['Soran', 'Doski'] },
  { en: 'Vibrant Steps',         ku: 'هەنگاوی ڕەنگین',      ar: 'خطوات نابضة بالحياة',  owner: ['Shanga', 'Gorani'] },
  { en: 'Luxury Comfort Lines',  ku: 'هێڵی ئاسوودەیی لوکس', ar: 'خطوط الراحة الفاخرة',  owner: ['Dana', 'Sorani'] },
  { en: 'Duhok Wool House',      ku: 'ماڵی خوری دهۆک',      ar: 'بيت الصوف دهوك',       owner: ['Hemin', 'Duhoki'] },
  { en: 'Zagros Sock Craft',     ku: 'دەستکردی گۆرەوی زاگرۆس', ar: 'حرفة جوارب زاغروس', owner: ['Nali', 'Mukri'] },
];

const citiesList = ['Erbil', 'Sulaymaniyah', 'Duhok', 'Baghdad', 'Basra', 'Kirkuk'];

// Product name parts, each trilingual so titles read naturally in every language.
const PREFIXES = [
  { en: 'Vintage',    ku: 'کۆنەکار',  ar: 'كلاسيكي' },
  { en: 'Cozy',       ku: 'گەرم',     ar: 'دافئ' },
  { en: 'Thermal',    ku: 'گەرمگر',   ar: 'حراري' },
  { en: 'Cloud',      ku: 'هەور',     ar: 'سحابي' },
  { en: 'Pastel',     ku: 'ڕەنگ کاڵ', ar: 'باستيل' },
  { en: 'Silk Blend', ku: 'تێکەڵی ئاوریشم', ar: 'مزيج حريري' },
  { en: 'Nordic',     ku: 'نۆردیک',   ar: 'نورديك' },
  { en: 'Geometric',  ku: 'هەندەسی',  ar: 'هندسي' },
];
const TYPES = [
  { en: 'Crew Socks',    ku: 'گۆرەوی ناوەند', ar: 'جوارب متوسطة' },
  { en: 'Ankle Socks',   ku: 'گۆرەوی کورت',   ar: 'جوارب قصيرة' },
  { en: 'Knee Highs',    ku: 'گۆرەوی درێژ',   ar: 'جوارب طويلة' },
  { en: 'Quarter Socks', ku: 'گۆرەوی چارەک',  ar: 'جوارب ربعية' },
  { en: 'Wool Socks',    ku: 'گۆرەوی خوری',   ar: 'جوارب صوفية' },
  { en: 'Dress Socks',   ku: 'گۆرەوی فەرمی',  ar: 'جوارب رسمية' },
];

const genders = ['Men', 'Women', 'Kids']; // Unisex intentionally removed
const badges = [['New'], ['Bestseller'], ['Sale'], []];
const productImages = ['bs1.jpg', 'bs2.jpg', 'bs3.jpg', 'bs4.jpg'];

const imgDir = path.join(__dirname, '../public/bestsellers');
function imageBlob(name) {
  const buf = fs.readFileSync(path.join(imgDir, name));
  return new Blob([buf], { type: 'image/jpeg' });
}

async function cleanup() {
  console.log('Clearing existing products, stores and vendor accounts...');
  await db.query('DELETE FROM product_colors');
  await db.query('DELETE FROM products');
  await db.query('DELETE FROM store_delivery_prices');
  await db.query('DELETE FROM stores');
  await db.query("DELETE FROM users WHERE role = 'vendor'");
  await db.query('ALTER TABLE products AUTO_INCREMENT = 1');
  await db.query('ALTER TABLE stores AUTO_INCREMENT = 1');
}

async function main() {
  try {
    await cleanup();

    // Attribute settings the product form references (must already exist,
    // created through the dashboard's Category Settings tabs).
    const categories = await api('/api/settings/categories');
    const styles     = await api('/api/settings/styles');
    const materials  = await api('/api/settings/materials');
    const seasons    = await api('/api/settings/seasons');
    const sizes      = await api('/api/settings/sizes');
    const colors     = await api('/api/settings/colors');
    const designs    = await api('/api/settings/designs');
    const sportTypes = await api('/api/settings/sport-types');
    const cityList   = await api('/api/settings/cities');

    for (const [label, arr] of [['categories', categories], ['styles', styles], ['materials', materials],
                                ['seasons', seasons], ['sizes', sizes], ['colors', colors]]) {
      if (!arr.length) throw new Error(`No ${label} configured — cannot build valid products.`);
    }
    if (sizes.length < SIZES_PER_PRODUCT) {
      throw new Error(`Only ${sizes.length} sizes configured, need at least ${SIZES_PER_PRODUCT}.`);
    }
    if (colors.length < COLORS_PER_PRODUCT) {
      throw new Error(`Only ${colors.length} colors configured, need at least ${COLORS_PER_PRODUCT}.`);
    }

    let productTotal = 0;

    for (let i = 0; i < STORES.length; i++) {
      const s = STORES[i];
      const city = citiesList[i % citiesList.length];
      const email = `demo_vendor_${i + 1}@hawrisha.com`;
      const phone = `+964${7701000000 + i}`; // +964 followed by exactly 10 digits
      const logoName = productImages[i % productImages.length];

      // Store creation goes through the multipart Add Store form so the logo
      // and banner are uploaded exactly like a manual admin submission.
      const storeFd = new FormData();
      storeFd.append('adminEmail', ADMIN_EMAIL);
      storeFd.append('name', tri(s.en, s.ku, s.ar));
      storeFd.append('description', tri(
        `Welcome to ${s.en}. Handcrafted socks for everyday comfort.`,
        `بەخێربێیت بۆ ${s.ku}. گۆرەوی دەستکرد بۆ ئاسوودەیی ڕۆژانە.`,
        `مرحباً بك في ${s.ar}. جوارب مصنوعة يدوياً لراحة يومية.`
      ));
      storeFd.append('owner_name', `${s.owner[0]} ${s.owner[1]}`);
      storeFd.append('email', email);
      storeFd.append('phone', phone);
      storeFd.append('city', city);
      storeFd.append('address', `Main Street, ${city}`);
      storeFd.append('social_links', JSON.stringify({
        instagram: `https://instagram.com/${s.en.toLowerCase().replace(/[^a-z]+/g, '_')}`,
tiktok: `https://www.tiktok.com/@${s.en.toLowerCase().replace(/[^a-z]+/g, '_')}`,
      }));
      storeFd.append('password', VENDOR_PASSWORD);
      storeFd.append('commission_percentage', String(8 + (i % 4) * 2)); // 8/10/12/14 %
      storeFd.append('logo', imageBlob(logoName), logoName);
      storeFd.append('banner', imageBlob(productImages[(i + 1) % productImages.length]), 'banner.jpg');

      const store = await api('/api/stores', { method: 'POST', body: storeFd });
      const storeId = store.id;

      // Delivery Management: the checkout city dropdown reads from this.
      if (cityList.length) {
        const prices = cityList.map((c, idx) => ({
          city_name: c.name,
          price: 3000 + (idx % 5) * 1000, // 3000–7000 IQD
          is_available: true,
        }));
        await jsonPost(`/api/stores/${storeId}/delivery`, { email: ADMIN_EMAIL, prices });
      }

      const productCount = (i % 2 === 0) ? 2 : 1;
      for (let p = 0; p < productCount; p++) {
        const k = i + p;
        const style    = styles[k % styles.length];
        const material = materials[k % materials.length];
        const season   = seasons[k % seasons.length];
        const category = categories[k % categories.length];
        const gender   = genders[k % genders.length];
        const pfx = PREFIXES[k % PREFIXES.length];
        const typ = TYPES[k % TYPES.length];
        const price = (45 + (k % 12) * 5) * 100;
        const discount = (p === 0 && i % 3 === 0) ? 15 : 0;
        const imgName = productImages[k % productImages.length];

        // 4 distinct sizes and 5 distinct colours, rotated per product.
        const chosenSizes = Array.from({ length: SIZES_PER_PRODUCT },
          (_, n) => sizes[(k + n) % sizes.length]);
        const chosenColors = Array.from({ length: COLORS_PER_PRODUCT },
          (_, n) => colors[(k * 2 + n) % colors.length]);

        const sizeNamesEn = chosenSizes.map(sz => englishOf(sz.name));
        // Every colour is stocked in every size, so each variant carries a
        // full per-size stock map and each size lists all colours.
        const colorVariants = chosenColors.map((col, n) => ({
          color: { id: col.id, class: col.class, name: col.name, family: col.family },
          image: `/bestsellers/${productImages[(k + n) % productImages.length]}`,
          stock: Object.fromEntries(sizeNamesEn.map((sn, m) => [sn, 8 + ((n + m) % 5) * 3])),
        }));
        const sizeColors = Object.fromEntries(
          sizeNamesEn.map(sn => [sn, chosenColors.map(c => c.class)])
        );
        const totalStock = colorVariants.reduce(
          (sum, v) => sum + Object.values(v.stock).reduce((a, b) => a + b, 0), 0);

        const fd = new FormData();
        fd.append('vendorEmail', ADMIN_EMAIL);
        fd.append('storeId', String(storeId));
        fd.append('name', tri(
          `${pfx.en} ${typ.en}`,
          `${typ.ku} ${pfx.ku}`,
          `${typ.ar} ${pfx.ar}`
        ));
        fd.append('price', String(price));
        fd.append('category', JSON.stringify([category.name]));
        fd.append('colorFamily', JSON.stringify([...new Set(chosenColors.map(c => c.family))]));
        fd.append('badge', JSON.stringify(badges[k % badges.length]));
        fd.append('desc', tri(
          `Premium ${pfx.en} ${typ.en} from ${s.en}. Ultra-soft, breathable cotton blend for all-day comfort.`,
          `${typ.ku}ی ${pfx.ku} لە ${s.ku}. زۆر نەرم و هەناسەدەر بۆ ئاسوودەیی درێژخایەن.`,
          `${typ.ar} ${pfx.ar} من ${s.ar}. قطن فائق النعومة وقابل للتنفس لراحة طوال اليوم.`
        ));
        fd.append('colors', JSON.stringify(chosenColors.map(c => c.class)));
        fd.append('colorNames', JSON.stringify(chosenColors.map(c => c.name)));
        fd.append('styleLength', JSON.stringify([style.name]));
        fd.append('promotion', JSON.stringify([]));
        fd.append('material', JSON.stringify([material.name]));
        fd.append('seasonalType', JSON.stringify([season.name]));
        fd.append('sizeCollection', JSON.stringify(chosenSizes.map(sz => sz.name)));
        fd.append('discount', String(discount));
        fd.append('gender', gender);
        fd.append('customAttributes', JSON.stringify({}));
        fd.append('colorVariants', JSON.stringify(colorVariants));
        fd.append('stock', String(totalStock));
        fd.append('sizeColors', JSON.stringify(sizeColors));
        if (designs.length) fd.append('design', JSON.stringify([designs[k % designs.length].name]));
        if (sportTypes.length) fd.append('sportType', JSON.stringify([sportTypes[k % sportTypes.length].name]));
        fd.append('image', imageBlob(imgName), imgName);

        await api('/api/products', { method: 'POST', body: fd });
        productTotal++;
      }
      console.log(`  ✓ ${s.en} (store #${storeId}) + ${productCount} product(s)`);
    }

    console.log(`\nDone: ${STORES.length} stores, ${productTotal} products — all via the dashboard API.`);
    console.log(`Each product carries ${SIZES_PER_PRODUCT} sizes and ${COLORS_PER_PRODUCT} colour variants.`);
    process.exit(0);
  } catch (err) {
    console.error('Reseed failed:', err.message);
    process.exit(1);
  }
}

main();
