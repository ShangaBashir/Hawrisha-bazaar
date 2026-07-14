const db = require('./db');

async function initializeDatabase() {
  try {
    console.log('Initializing database schema and seed data...');

    // 1. Create stores table
    await db.query(`
      CREATE TABLE IF NOT EXISTS stores (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        logo VARCHAR(255) DEFAULT NULL,
        banner VARCHAR(255) DEFAULT NULL,
        description TEXT DEFAULT NULL,
        owner_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(50) NOT NULL,
        city VARCHAR(100) DEFAULT NULL,
        address TEXT DEFAULT NULL,
        social_links TEXT DEFAULT NULL,
        status VARCHAR(50) DEFAULT 'Pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 2. Create products table
    await db.query(`
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        price INT NOT NULL,
        category VARCHAR(100) NOT NULL,
        color_family VARCHAR(50),
        badge VARCHAR(100),
        description TEXT,
        image_url VARCHAR(255)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Helper to add column if it doesn't exist
    const addColumnSafely = async (tableName, columnName, definition) => {
      const [columns] = await db.query(
        `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
        [tableName, columnName]
      );
      if (columns.length === 0) {
        await db.query(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition}`);
        console.log(`Added column ${columnName} to table ${tableName}.`);
      }
    };

    await addColumnSafely('stores', 'city', 'VARCHAR(100) DEFAULT NULL');
    await addColumnSafely('stores', 'updated_at', 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');
    await addColumnSafely('products', 'style_length', 'VARCHAR(100) DEFAULT NULL');
    await addColumnSafely('products', 'stock', 'INT DEFAULT 0');
    await addColumnSafely('products', 'promotion', 'VARCHAR(100) DEFAULT NULL');
    await addColumnSafely('products', 'material', 'VARCHAR(100) DEFAULT NULL');
    await addColumnSafely('products', 'seasonal_type', 'VARCHAR(100) DEFAULT NULL');
    await addColumnSafely('products', 'size_collection', 'VARCHAR(100) DEFAULT NULL');
    await addColumnSafely('products', 'size_colors', 'TEXT DEFAULT NULL');
    await addColumnSafely('products', 'discount', 'INT DEFAULT 0');
    await addColumnSafely('products', 'extra_images', 'TEXT DEFAULT NULL');
    await addColumnSafely('products', 'vendor_id', 'INT DEFAULT NULL');
    await addColumnSafely('products', 'store_id', 'INT DEFAULT NULL');
    await addColumnSafely('products', 'updated_at', 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');
    await addColumnSafely('products', 'gender', 'VARCHAR(50) DEFAULT NULL');
    
    // Commission system
    await addColumnSafely('stores', 'commission_percentage', 'INT DEFAULT 0');
    await addColumnSafely('products', 'admin_share', 'INT DEFAULT 0');
    await addColumnSafely('products', 'store_share', 'INT DEFAULT 0');

    // 3. Create product_colors table
    await db.query(`
      CREATE TABLE IF NOT EXISTS product_colors (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT NOT NULL,
        color_class VARCHAR(100) NOT NULL,
        color_name VARCHAR(100) NOT NULL,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 4. Create categories table
    await db.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 5. Create badges table
    await db.query(`
      CREATE TABLE IF NOT EXISTS badges (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 6. Create colors table
    await db.query(`
      CREATE TABLE IF NOT EXISTS colors (
        id VARCHAR(50) PRIMARY KEY,
        class VARCHAR(100) NOT NULL,
        name VARCHAR(100) NOT NULL,
        family VARCHAR(50) NOT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 7. Create styles table
    await db.query(`
      CREATE TABLE IF NOT EXISTS styles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 8. Create materials table
    await db.query(`
      CREATE TABLE IF NOT EXISTS materials (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 9. Create seasons table
    await db.query(`
      CREATE TABLE IF NOT EXISTS seasons (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 10. Create sizes table
    await db.query(`
      CREATE TABLE IF NOT EXISTS sizes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 11. Create promotions table
    await db.query(`
      CREATE TABLE IF NOT EXISTS promotions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 12. Create users table
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        first_name VARCHAR(255) NOT NULL,
        last_name VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'customer',
        store_name VARCHAR(255) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await addColumnSafely('users', 'role', "VARCHAR(50) DEFAULT 'customer'");
    await addColumnSafely('users', 'store_name', "VARCHAR(255) DEFAULT NULL");
    await addColumnSafely('users', 'store_id', "INT DEFAULT NULL");

    // 13. Create orders table
    await db.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_number VARCHAR(100) UNIQUE NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        province VARCHAR(100) NOT NULL,
        address TEXT NOT NULL,
        notes TEXT DEFAULT NULL,
        subtotal INT NOT NULL,
        shipping_cost INT NOT NULL,
        total INT NOT NULL,
        status VARCHAR(50) DEFAULT 'Pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 14. Create order_items table
    await db.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        product_id INT NOT NULL,
        store_id INT NOT NULL,
        product_name VARCHAR(255) NOT NULL,
        price INT NOT NULL,
        quantity INT NOT NULL,
        selected_color VARCHAR(100) DEFAULT NULL,
        selected_size VARCHAR(100) DEFAULT NULL,
        selected_style VARCHAR(100) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await addColumnSafely('order_items', 'status', "VARCHAR(50) DEFAULT 'Pending'");
    await addColumnSafely('orders', 'secondary_phone', "VARCHAR(50) DEFAULT NULL");
    await addColumnSafely('orders', 'customer_email', "VARCHAR(255) DEFAULT NULL");
    await addColumnSafely('orders', 'latitude', "DECIMAL(10, 8) DEFAULT NULL");
    await addColumnSafely('orders', 'longitude', "DECIMAL(11, 8) DEFAULT NULL");
    await addColumnSafely('orders', 'payment_status', "VARCHAR(50) DEFAULT 'Unpaid'");
    await addColumnSafely('orders', 'delivered_at', "DATETIME NULL");

    // Migration to sync existing status values
    await db.query(`
      UPDATE order_items oi
      JOIN orders o ON oi.order_id = o.id
      SET oi.status = o.status
      WHERE oi.status IS NULL OR oi.status = ''
    `);

    // 15. Create cart_items table
    await db.query(`
      CREATE TABLE IF NOT EXISTS cart_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_email VARCHAR(255) NOT NULL,
        product_id INT NOT NULL,
        store_id INT DEFAULT NULL,
        name VARCHAR(255) NOT NULL,
        price INT NOT NULL,
        quantity INT NOT NULL,
        selected_color VARCHAR(100) DEFAULT NULL,
        selected_size VARCHAR(100) DEFAULT NULL,
        selected_style VARCHAR(100) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_cart_item (user_email, product_id, selected_color, selected_size, selected_style)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 16. Create wishlist_items table
    await db.query(`
      CREATE TABLE IF NOT EXISTS wishlist_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_email VARCHAR(255) NOT NULL,
        product_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_wishlist_item (user_email, product_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 17. Create password_reset_verifications table
    await db.query(`
      CREATE TABLE IF NOT EXISTS password_reset_verifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        email VARCHAR(255) NOT NULL,
        verification_code VARCHAR(10) NOT NULL,
        attempts INT DEFAULT 0,
        expires_at TIMESTAMP NOT NULL,
        used BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 18. Create system_settings table
    await db.query(`
      CREATE TABLE IF NOT EXISTS system_settings (
        setting_key VARCHAR(100) PRIMARY KEY,
        setting_value TEXT NOT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 19. Create cities table
    await db.query(`
      CREATE TABLE IF NOT EXISTS cities (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        latitude DECIMAL(10, 8) NOT NULL,
        longitude DECIMAL(11, 8) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 20. Create user_addresses table
    await db.query(`
      CREATE TABLE IF NOT EXISTS user_addresses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_email VARCHAR(255) NOT NULL,
        first_name VARCHAR(255) NOT NULL,
        last_name VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        secondary_phone VARCHAR(50) DEFAULT NULL,
        city_name VARCHAR(255) NOT NULL,
        street_address TEXT NOT NULL,
        latitude DECIMAL(10, 8) NOT NULL,
        longitude DECIMAL(11, 8) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 21. Create contact_messages table
    await db.query(`
      CREATE TABLE IF NOT EXISTS contact_messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Seed default cancellation limit (15 minutes) if empty
    await db.query(`
      INSERT IGNORE INTO system_settings (setting_key, setting_value) 
      VALUES ('order_cancellation_limit_minutes', '15');
    `);

    // Seed default cities if empty
    const [citiesCount] = await db.query('SELECT COUNT(*) as count FROM cities');
    if (citiesCount[0].count === 0) {
      const defaultCities = [
        { name: 'Baghdad', lat: 33.3152, lng: 44.3661 },
        { name: 'Erbil', lat: 36.1901, lng: 44.0093 },
        { name: 'Sulaymaniyah', lat: 35.5620, lng: 45.4372 },
        { name: 'Duhok', lat: 36.8665, lng: 42.9880 },
        { name: 'Kirkuk', lat: 35.4681, lng: 44.3922 },
        { name: 'Basra', lat: 30.5081, lng: 47.7979 },
        { name: 'Halabja', lat: 35.1777, lng: 45.9861 }
      ];
      for (const city of defaultCities) {
        await db.query('INSERT IGNORE INTO cities (name, latitude, longitude) VALUES (?, ?, ?)', [city.name, city.lat, city.lng]);
      }
      console.log('Seeded default cities.');
    }

    // Seed default categories if empty
    const [categories] = await db.query('SELECT COUNT(*) as count FROM categories');
    if (categories[0].count === 0) {
      const defaultCategories = ['Animals', 'Fruits', 'Patterns', 'Cozy Crew'];
      for (const cat of defaultCategories) {
        await db.query('INSERT IGNORE INTO categories (name) VALUES (?)', [cat]);
      }
      console.log('Seeded default categories.');
    }

    // Seed default badges if empty
    const [badges] = await db.query('SELECT COUNT(*) as count FROM badges');
    if (badges[0].count === 0) {
      const defaultBadges = ['Bestseller', 'New', 'Sale'];
      for (const badge of defaultBadges) {
        await db.query('INSERT IGNORE INTO badges (name) VALUES (?)', [badge]);
      }
      console.log('Seeded default badges.');
    }

    // Seed default colors if empty
    const [colors] = await db.query('SELECT COUNT(*) as count FROM colors');
    if (colors[0].count === 0) {
      const defaultColors = [
        { id: 'beige', class: 'bg-[#F5F5DC]', name: 'Classic Beige', family: 'beige' },
        { id: 'sage', class: 'bg-[#B2AC88]', name: 'Sage Green', family: 'sage' },
        { id: 'slate', class: 'bg-[#36454F]', name: 'Charcoal Slate', family: 'slate' },
        { id: 'rose', class: 'bg-[#C08081]', name: 'Dusk Rose', family: 'rose' },
        { id: 'yellow', class: 'bg-yellow-400', name: 'Lemon Yellow', family: 'yellow' },
        { id: 'green', class: 'bg-emerald-600', name: 'Avocado Green', family: 'green' },
        { id: 'purple', class: 'bg-purple-400', name: 'Soft Lavender', family: 'purple' },
        { id: 'orange', class: 'bg-orange-500', name: 'Citrus Orange', family: 'orange' }
      ];
      for (const color of defaultColors) {
        await db.query(
          'INSERT IGNORE INTO colors (id, class, name, family) VALUES (?, ?, ?, ?)',
          [color.id, color.class, color.name, color.family]
        );
      }
      console.log('Seeded default colors.');
    }

    // Seed default styles if empty
    const [styles] = await db.query('SELECT COUNT(*) as count FROM styles');
    if (styles[0].count === 0) {
      const defaultStyles = ['Crew', 'Ankle', 'No Show', 'Knee High'];
      for (const st of defaultStyles) {
        await db.query('INSERT IGNORE INTO styles (name) VALUES (?)', [st]);
      }
      console.log('Seeded default styles.');
    }

    // Seed default materials if empty
    const [materials] = await db.query('SELECT COUNT(*) as count FROM materials');
    if (materials[0].count === 0) {
      const defaultMaterials = ['Cotton', 'Bamboo', 'Wool', 'Polyester'];
      for (const mat of defaultMaterials) {
        await db.query('INSERT IGNORE INTO materials (name) VALUES (?)', [mat]);
      }
      console.log('Seeded default materials.');
    }

    // Seed default seasons if empty
    const [seasons] = await db.query('SELECT COUNT(*) as count FROM seasons');
    if (seasons[0].count === 0) {
      const defaultSeasons = ['Winter', 'Summer', 'Spring', 'Autumn', 'All Season'];
      for (const seas of defaultSeasons) {
        await db.query('INSERT IGNORE INTO seasons (name) VALUES (?)', [seas]);
      }
      console.log('Seeded default seasons.');
    }

    // Seed default sizes if empty
    const [sizes] = await db.query('SELECT COUNT(*) as count FROM sizes');
    if (sizes[0].count === 0) {
      const defaultSizes = ['One Size', '35-38', '39-42', '43-46'];
      for (const sz of defaultSizes) {
        await db.query('INSERT IGNORE INTO sizes (name) VALUES (?)', [sz]);
      }
      console.log('Seeded default sizes.');
    }

    // Seed default promotions if empty
    const [promotions] = await db.query('SELECT COUNT(*) as count FROM promotions');
    if (promotions[0].count === 0) {
      const defaultPromotions = ['Buy 2 Get 1 Free', 'New Season Promo'];
      for (const promo of defaultPromotions) {
        await db.query('INSERT IGNORE INTO promotions (name) VALUES (?)', [promo]);
      }
      console.log('Seeded default promotions.');
    }

    // Seed default stores if empty
    const [storesCount] = await db.query('SELECT COUNT(*) as count FROM stores');
    if (storesCount[0].count === 0) {
      await db.query(`
        INSERT INTO stores (name, logo, banner, description, owner_name, email, phone, address, social_links, status)
        VALUES 
        ('Cozy Socks Co.', '/categories/cat1.jpg', '/categories/cat2.jpg', 'Comfortable and warm crew socks for the cozy winter seasons.', 'Alice Smith', 'vendor1@gmail.com', '+964 770 123 4567', 'Sulaymaniyah, Iraq', '{"facebook": "#", "instagram": "#"}', 'Active'),
        ('Happy Feet', '/categories/cat3.jpg', '/categories/cat4.jpg', 'Cute and colorful character socks to bring joy to every step.', 'Bob Jones', 'vendor2@gmail.com', '+964 770 765 4321', 'Erbil, Iraq', '{"facebook": "#", "instagram": "#"}', 'Active')
      `);
      console.log('Seeded default stores.');
    }

    // Seed default users if empty
    const [usersCount] = await db.query('SELECT COUNT(*) as count FROM users');
    if (usersCount[0].count === 0) {
      const crypto = require('crypto');
      const hashPassword = (password) => crypto.createHash('sha256').update(password).digest('hex');
      const hashedPass = hashPassword('12345678');
      
      const [dbStores] = await db.query('SELECT id, name FROM stores');
      const cozyStoreId = dbStores.find(s => s.name === 'Cozy Socks Co.')?.id || null;
      const happyStoreId = dbStores.find(s => s.name === 'Happy Feet')?.id || null;

      await db.query(`
        INSERT INTO users (first_name, last_name, phone, email, password, role, store_name, store_id)
        VALUES 
        ('Admin', 'User', '+964 770 000 0000', 'admin@gmail.com', ?, 'admin', NULL, NULL),
        ('Alice', 'Smith', '+964 770 123 4567', 'vendor1@gmail.com', ?, 'vendor', 'Cozy Socks Co.', ?),
        ('Bob', 'Jones', '+964 770 765 4321', 'vendor2@gmail.com', ?, 'vendor', 'Happy Feet', ?)
      `, [hashedPass, hashedPass, cozyStoreId, hashedPass, happyStoreId]);
      console.log('Seeded default users.');
    }

    // Default products and orders seeding disabled to keep database clean
    console.log('Skipped seeding default mock products & orders.');

    console.log('Database initialization completed successfully.');
  } catch (error) {
    console.error('Error during database initialization:', error);
  }
}

module.exports = initializeDatabase;
