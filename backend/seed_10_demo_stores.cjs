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
const genders = ["Men", "Women", "Unisex"];
const badgesList = ['[ "New" ]', '[ "Bestseller" ]', '[ "Sale" ]', '[]'];

const defaultHashedPassword = "ef797c8118f02dfb649607dd5d3f8c7623048c9c063d532cc95c5ed7a898a64f"; // 12345678

// Helper to seed standard delivery prices for a store
async function seedDeliveryPrices(storeId, baseCity) {
  const prices = [
    { city_name: '{"en": "Erbil", "ku": "Erbil", "ar": "Erbil"}', price: baseCity === 'Erbil' ? 3000 : 5000 },
    { city_name: '{"en": "Sulaymaniyah", "ku": "Sulaymaniyah", "ar": "Sulaymaniyah"}', price: baseCity === 'Sulaymaniyah' ? 3000 : 5000 },
    { city_name: '{"en": "Duhok", "ku": "Duhok", "ar": "Duhok"}', price: baseCity === 'Duhok' ? 3000 : 5000 },
    { city_name: '{"en": "Baghdad", "ku": "Baghdad", "ar": "Baghdad"}', price: 6000 },
    { city_name: '{"en": "Basra", "ku": "Basra", "ar": "Basra"}', price: 7000 }
  ];
  
  await db.query('DELETE FROM store_delivery_prices WHERE store_id = ?', [storeId]);
  
  for (const p of prices) {
    await db.query(`
      INSERT INTO store_delivery_prices (store_id, city_name, price, is_available)
      VALUES (?, ?, ?, 1)
    `, [storeId, p.city_name, p.price]);
  }
}

async function seed10Stores() {
  try {
    console.log("Starting 10 demo stores seeding...");
    
    // Make sure table exists
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

      const [existingUser] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
      let vendorId;
      if (existingUser.length > 0) {
        vendorId = existingUser[0].id;
        await db.query(`UPDATE users SET role='vendor', store_name=?, store_id=? WHERE id=?`, [storeName, storeId, vendorId]);
      } else {
        const [uResult] = await db.query(
          `INSERT INTO users (first_name, last_name, phone, email, password, role, store_name, store_id)
           VALUES (?, ?, ?, ?, ?, 'vendor', ?, ?)`,
          [firstNames[i], lastNames[i], phone, email, defaultHashedPassword, storeName, storeId]
        );
        vendorId = uResult.insertId;
      }

      // Seed delivery prices for this store
      await seedDeliveryPrices(storeId, city);

      // Create 2-3 products
      const productCount = (i % 2 === 0) ? 3 : 2;
      for (let p = 0; p < productCount; p++) {
        const pNameEn = `${sockPrefixes[(i + p) % sockPrefixes.length]} ${sockTypes[(i + p) % sockTypes.length]}`;
        const pNameKu = `گۆرەوی ${sockPrefixes[(i + p) % sockPrefixes.length]}`;
        const pNameAr = `جوارب ${sockPrefixes[(i + p) % sockPrefixes.length]}`;
        const pNameJson = JSON.stringify({ en: pNameEn, ku: pNameKu, ar: pNameAr });

        const price = (45 + ((i + p) % 12) * 5) * 100;
        const pDescJson = JSON.stringify({
          en: `Premium ${pNameEn} brought to you by ${storeName}. Ultra soft cotton blend.`,
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

    console.log(`Successfully created 10 stores, seeded delivery prices, and created ${totalProductsCreated} total products!`);
    process.exit(0);
  } catch (err) {
    console.error("Error seeding 10 demo stores:", err);
    process.exit(1);
  }
}

seed10Stores();
