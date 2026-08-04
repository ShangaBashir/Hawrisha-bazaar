/**
 * Reset & Seed Stores
 * Run: node backend/reset_and_seed_stores.cjs
 *
 * Deletes ALL current stores and products (and their dependent rows + vendor
 * accounts), then creates 10 fresh stores, each with 2-3 products.
 */
const db = require('./config/db');

const storeNames = [
  "Golden Fleece Socks", "Cozy Steps Boutique", "Kurdish Weavers Co.",
  "Erbil Threads Market", "Velvet Comfort Haven", "Suli Sock Studio",
  "Alpine Warmth Footwear", "Retro Patterns Bazaar", "Vibrant Steps", "Luxury Comfort Lines"
];
const firstNames = ["Sarkawt", "Aram", "Darya", "Rebin", "Zhana", "Karwan", "Lavin", "Soran", "Shanga", "Dana"];
const lastNames = ["Kurd", "Barzani", "Sulaimani", "Erbili", "Hawrami", "Zebari", "Jaf", "Doski", "Gorani", "Sorani"];
const citiesList = ["Erbil", "Sulaymaniyah", "Duhok", "Baghdad", "Basra", "Kirkuk"];

const categories = ["Cozy Crew", "Luxury", "Sport", "Animals", "Patterns", "Fruits"];
const colorClasses = ["bg-[#C08081]", "bg-[#B2AC88]", "bg-[#F5F5DC]", "bg-[#36454F]", "bg-emerald-400", "bg-amber-400"];
const sockPrefixes = ["Vintage", "Cozy", "Thermal", "Cloud", "Pastel", "Silk Blend", "Nordic", "Geometric"];
const sockTypes = ["Crew Socks", "Ankle Socks", "Knee Highs", "Quarter Socks", "Wool Socks", "Dress Socks"];
const sampleImages = ["/bestsellers/bs1.jpg", "/bestsellers/bs2.jpg", "/bestsellers/bs3.jpg", "/bestsellers/bs4.jpg", "/categories/cat1.jpg", "/categories/cat2.jpg"];
const genders = ["Men", "Women", "Kids"]; // Unisex intentionally removed
const badgesList = ['[ "New" ]', '[ "Bestseller" ]', '[ "Sale" ]', '[]'];

const defaultHashedPassword = "ef797c8118f02dfb649607dd5d3f8c7623048c9c063d532cc95c5ed7a898a64f"; // 12345678

async function seedDeliveryPrices(storeId, baseCity) {
  const prices = [
    { city_name: '{"en": "Erbil", "ku": "Erbil", "ar": "Erbil"}', price: baseCity === 'Erbil' ? 3000 : 5000 },
    { city_name: '{"en": "Sulaymaniyah", "ku": "Sulaymaniyah", "ar": "Sulaymaniyah"}', price: baseCity === 'Sulaymaniyah' ? 3000 : 5000 },
    { city_name: '{"en": "Duhok", "ku": "Duhok", "ar": "Duhok"}', price: baseCity === 'Duhok' ? 3000 : 5000 },
    { city_name: '{"en": "Baghdad", "ku": "Baghdad", "ar": "Baghdad"}', price: 6000 },
    { city_name: '{"en": "Basra", "ku": "Basra", "ar": "Basra"}', price: 7000 }
  ];
  for (const p of prices) {
    await db.query(
      `INSERT INTO store_delivery_prices (store_id, city_name, price, is_available) VALUES (?, ?, ?, 1)`,
      [storeId, p.city_name, p.price]
    );
  }
}

async function resetData() {
  console.log("Clearing existing stores, products, and vendor accounts...");
  // Make sure the delivery-prices table exists before we touch it.
  await db.query(`
    CREATE TABLE IF NOT EXISTS store_delivery_prices (
      id INT AUTO_INCREMENT PRIMARY KEY,
      store_id INT NOT NULL,
      city_name TEXT NOT NULL,
      price INT NOT NULL DEFAULT 0,
      is_available BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // Delete children first to respect foreign keys.
  await db.query('DELETE FROM product_colors');
  await db.query('DELETE FROM products');
  await db.query('DELETE FROM store_delivery_prices');
  await db.query('DELETE FROM stores');
  await db.query("DELETE FROM users WHERE role = 'vendor'");

  // Reset auto-increment so the fresh data starts clean.
  await db.query('ALTER TABLE products AUTO_INCREMENT = 1');
  await db.query('ALTER TABLE stores AUTO_INCREMENT = 1');
  console.log("Reset complete.");
}

async function seed10Stores() {
  try {
    await resetData();
    console.log("Seeding 10 stores with 2-3 products each...");
    let totalProductsCreated = 0;

    for (let i = 0; i < 10; i++) {
      const storeName = storeNames[i];
      const ownerName = `${firstNames[i]} ${lastNames[i]}`;
      const city = citiesList[i % citiesList.length];
      const email = `demo_vendor_${i + 1}@hawrisha.com`;
      const phone = `+964 770 100 ${1000 + i}`;
      const logo = sampleImages[i % sampleImages.length];
      const banner = "/carousel/slide1.jpg";
      const description = `Welcome to ${storeName}. We specialize in high quality handcrafted socks for everyday comfort.`;

      const [result] = await db.query(
        `INSERT INTO stores (name, logo, banner, description, owner_name, email, phone, city, address, status, commission_percentage)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Active', 10)`,
        [storeName, logo, banner, description, ownerName, email, phone, city, `Main Street, ${city}`]
      );
      const storeId = result.insertId;

      const [uResult] = await db.query(
        `INSERT INTO users (first_name, last_name, phone, email, password, role, store_name, store_id)
         VALUES (?, ?, ?, ?, ?, 'vendor', ?, ?)`,
        [firstNames[i], lastNames[i], phone, email, defaultHashedPassword, storeName, storeId]
      );
      const vendorId = uResult.insertId;

      await seedDeliveryPrices(storeId, city);

      // 2 or 3 products per store.
      const productCount = (i % 2 === 0) ? 3 : 2;
      for (let p = 0; p < productCount; p++) {
        const pfx = sockPrefixes[(i + p) % sockPrefixes.length];
        const typ = sockTypes[(i + p) % sockTypes.length];
        const pNameJson = JSON.stringify({ en: `${pfx} ${typ}`, ku: `گۆرەوی ${pfx}`, ar: `جوارب ${pfx}` });
        const price = (45 + ((i + p) % 12) * 5) * 100;
        const pDescJson = JSON.stringify({
          en: `Premium ${pfx} ${typ} brought to you by ${storeName}. Ultra soft cotton blend.`,
          ku: `گۆرەوی بەرزترین کوالیتی لەلایەن ${storeName}`,
          ar: `جوارب فاخرة من متجر ${storeName}`
        });
        const discount = (p === 0 && i % 3 === 0) ? 15 : 0;

        await db.query(
          `INSERT INTO products (name, price, category, color_family, badge, description, image_url, stock, store_id, vendor_id, discount, gender, admin_share, store_share)
           VALUES (?, ?, ?, ?, ?, ?, ?, 50, ?, ?, ?, ?, ?, ?)`,
          [
            pNameJson, price, categories[(i + p) % categories.length], colorClasses[(i + p) % colorClasses.length],
            badgesList[(i + p) % badgesList.length], pDescJson, sampleImages[(i + p) % sampleImages.length],
            storeId, vendorId, discount, genders[(i + p) % genders.length], Math.round(price * 0.1), Math.round(price * 0.9)
          ]
        );
        totalProductsCreated++;
      }
    }

    console.log(`Done: created 10 stores and ${totalProductsCreated} products.`);
    process.exit(0);
  } catch (err) {
    console.error("Error resetting/seeding stores:", err);
    process.exit(1);
  }
}

seed10Stores();
