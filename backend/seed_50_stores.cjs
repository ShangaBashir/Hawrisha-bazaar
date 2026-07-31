const db = require('./config/db');

const storeNames = [
  "Nordic Wool Co.", "Starlight Hosiery", "Velvet Thread Store", "Silk & Strands", "Cosmic Crew Market",
  "Breeze Footwear", "Luxe Loom", "Retro Thread Co.", "Alpine Hosiery", "Cotton Cloud Socks",
  "Urban Sock Studio", "Golden Fleece Market", "Neon Pulse Socks", "Pastel Threads", "Highland Wool Co.",
  "Earthy Threads", "Vibrant Step", "Summit Socks", "Royal Crest Hosiery", "Cozy Corner Socks",
  "Wildflower Socks", "Modern Mesh", "Heritage Weave", "Amber Glow Hosiery", "Kurdish Craft Socks",
  "Botanical Threads", "Glacier Footwear", "Velvet Cushion Co.", "Prism Sock Lab", "Serene Strands",
  "Bazaar Elite Socks", "Timberline Wool", "Oasis Comfort", "Horizon Hosiery", "Blossom Sock Boutique",
  "Cobalt Craft", "Sunburst Socks", "Featherweight Threads", "Moonlit Loom", "Chic Ankle Studio",
  "Zaros Mountain Socks", "Tigris Thread Co.", "Erbil Elegance", "Suli Sock Haven", "Duhok Loom & Weave",
  "Mesopotamia Socks", "Kurdish Artisan Footwear", "Golden Thread Bazaar", "Caspian Comfort", "Atlas Hosiery"
];

const firstNames = ["Sarkawt", "Aram", "Darya", "Rebin", "Zhana", "Karwan", "Lavin", "Soran", "Shanga", "Dana", "Hevia", "Goran", "Rawa", "Rozh", "Barzan", "Awat", "Breen", "Chiya", "Dilan", "Nadir"];
const lastNames = ["Kurd", "Barzani", "Sulaimani", "Erbili", "Hawrami", "Zebari", "Jaf", "Doski", "Gorani", "Sorani", "Baban", "Talabani", "Sindhi", "Berwari"];

const cities = ["Erbil", "Sulaymaniyah", "Duhok", "Baghdad", "Basra", "Kirkuk", "Halabja"];

const categories = ["Animals", "Cozy Crew", "Fruits", "Patterns", "Luxury", "Sport"];

const sockPrefixes = ["Vintage", "Cozy", "Thermal", "Cloud", "Pastel", "Silk Blend", "Nordic", "Geometric", "Embroidered", "Sport Cushion", "Velvet Soft", "Breatheable", "Heritage", "Alpine", "Urban", "Luxury"];
const sockTypes = ["Crew Socks", "Ankle Socks", "Knee Highs", "Quarter Socks", "Wool Socks", "Lounge Socks", "Dress Socks"];

const sampleImages = [
  "/bestsellers/bs1.jpg",
  "/bestsellers/bs2.jpg",
  "/bestsellers/bs3.jpg",
  "/bestsellers/bs4.jpg",
  "/categories/cat1.jpg",
  "/categories/cat2.jpg",
  "/categories/cat3.jpg",
  "/categories/cat4.jpg"
];

const colorClasses = ["bg-[#C08081]", "bg-[#B2AC88]", "bg-[#F5F5DC]", "bg-[#36454F]", "bg-rose-400", "bg-emerald-400", "bg-amber-400", "bg-indigo-400"];
const genders = ["Men", "Women", "Kids", "Unisex"];
const badgesList = ['[ "New" ]', '[ "Bestseller" ]', '[ "Sale" ]', '[]'];

// Hashed password for 12345678
const defaultHashedPassword = "ef797c8118f02dfb649607dd5d3f8c7623048c9c063d532cc95c5ed7a898a64f";

async function seed50Stores() {
  try {
    console.log("Starting 50 stores seeding...");

    let totalProductsCreated = 0;

    for (let i = 0; i < storeNames.length; i++) {
      const storeName = storeNames[i];
      const ownerFirst = firstNames[i % firstNames.length];
      const ownerLast = lastNames[i % lastNames.length];
      const ownerName = `${ownerFirst} ${ownerLast}`;
      const city = cities[i % cities.length];
      const email = `vendor_${i + 1}@hawrisha.com`;
      const phone = `+964 770 ${100 + i} ${2000 + i}`;
      const logo = sampleImages[i % sampleImages.length];
      const banner = "/carousel/slide1.jpg";
      const description = `Welcome to ${storeName}. We specialize in high quality handcrafted socks for everyday comfort.`;

      // 1. Create or Update Store
      const [existingStore] = await db.query('SELECT id FROM stores WHERE name = ? OR email = ?', [storeName, email]);

      let storeId;
      if (existingStore.length > 0) {
        storeId = existingStore[0].id;
        await db.query(
          `UPDATE stores SET logo=?, banner=?, description=?, owner_name=?, city=?, status='Active' WHERE id=?`,
          [logo, banner, description, ownerName, city, storeId]
        );
      } else {
        const [result] = await db.query(
          `INSERT INTO stores (name, logo, banner, description, owner_name, email, phone, city, address, status, commission_percentage)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Active', 10)`,
          [storeName, logo, banner, description, ownerName, email, phone, city, `Main Street, ${city}`]
        );
        storeId = result.insertId;
      }

      // 2. Create or Update Vendor User
      const [existingUser] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
      let vendorId;
      if (existingUser.length > 0) {
        vendorId = existingUser[0].id;
        await db.query(`UPDATE users SET role='vendor', store_name=?, store_id=? WHERE id=?`, [storeName, storeId, vendorId]);
      } else {
        const [uResult] = await db.query(
          `INSERT INTO users (first_name, last_name, phone, email, password, role, store_name, store_id)
           VALUES (?, ?, ?, ?, ?, 'vendor', ?, ?)`,
          [ownerFirst, ownerLast, phone, email, defaultHashedPassword, storeName, storeId]
        );
        vendorId = uResult.insertId;
      }

      // 3. Create 2 or 3 products for this store
      const productCount = (i % 2 === 0) ? 3 : 2;

      for (let p = 0; p < productCount; p++) {
        const prefix = sockPrefixes[(i * 3 + p) % sockPrefixes.length];
        const type = sockTypes[(i * 2 + p) % sockTypes.length];
        const pNameEn = `${prefix} ${type}`;
        const pNameKu = `گۆرەوی ${prefix}`;
        const pNameAr = `جوارب ${prefix}`;
        const pNameJson = JSON.stringify({ en: pNameEn, ku: pNameKu, ar: pNameAr });

        const price = (45 + ((i + p) % 12) * 5) * 100; // 4500 to 10000 IQD
        const category = categories[(i + p) % categories.length];
        const color = colorClasses[(i + p) % colorClasses.length];
        const badge = badgesList[(i + p) % badgesList.length];
        const pDescJson = JSON.stringify({
          en: `Premium ${pNameEn} brought to you by ${storeName}. Ultra soft cotton blend.`,
          ku: `گۆرەوی بەرزترین کوالیتی لەلایەن ${storeName}`,
          ar: `جوارب فاخرة من متجر ${storeName}`
        });
        const img = sampleImages[(i + p) % sampleImages.length];
        const gender = genders[(i + p) % genders.length];
        const discount = (p === 0 && i % 3 === 0) ? 15 : 0;

        await db.query(
          `INSERT INTO products (name, price, category, color_family, badge, description, image_url, stock, store_id, vendor_id, discount, gender, admin_share, store_share)
           VALUES (?, ?, ?, ?, ?, ?, ?, 50, ?, ?, ?, ?, ?, ?)`,
          [pNameJson, price, category, color, badge, pDescJson, img, storeId, vendorId, discount, gender, Math.round(price * 0.1), Math.round(price * 0.9)]
        );
        totalProductsCreated++;
      }
    }

    console.log(`Successfully created 50 stores and ${totalProductsCreated} total products!`);
    process.exit(0);
  } catch (err) {
    console.error("Error seeding 50 stores:", err);
    process.exit(1);
  }
}

seed50Stores();
