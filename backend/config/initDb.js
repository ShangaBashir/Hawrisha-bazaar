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
    await addColumnSafely('products', 'color_variants', 'LONGTEXT DEFAULT NULL');
    
    // Commission system
    await addColumnSafely('stores', 'commission_percentage', 'INT DEFAULT 0');
    await addColumnSafely('products', 'admin_share', 'INT DEFAULT 0');
    await addColumnSafely('products', 'store_share', 'INT DEFAULT 0');

    // Expand product column types to TEXT to support JSON arrays without truncation
    const modifyColumnType = async (tableName, columnName, definition) => {
      try {
        await db.query(`ALTER TABLE ${tableName} MODIFY COLUMN ${columnName} ${definition}`);
      } catch (e) {
        console.warn(`Could not modify ${columnName} on ${tableName}:`, e.message);
      }
    };

    // Widen a settings table's `name` column to TEXT so long trilingual JSON
    // values are never truncated. A TEXT column cannot sit in a full-length
    // UNIQUE index, so we drop the old unique index first and re-add it with a
    // key-length prefix (still enforces uniqueness for the routes' duplicate
    // checks). Idempotent: safe to run on every boot.
    const modifyNameToText = async (tableName) => {
      try {
        const [fullLenIdx] = await db.query(
          `SELECT DISTINCT INDEX_NAME FROM INFORMATION_SCHEMA.STATISTICS
           WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?
             AND COLUMN_NAME = 'name' AND SUB_PART IS NULL AND INDEX_NAME <> 'PRIMARY'`,
          [tableName]
        );
        for (const row of fullLenIdx) {
          await db.query(`ALTER TABLE ${tableName} DROP INDEX \`${row.INDEX_NAME}\``);
        }
        await db.query(`ALTER TABLE ${tableName} MODIFY COLUMN name TEXT NOT NULL`);
        const [existing] = await db.query(
          `SELECT COUNT(*) AS c FROM INFORMATION_SCHEMA.STATISTICS
           WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND INDEX_NAME = 'uniq_name'`,
          [tableName]
        );
        if (existing[0].c === 0) {
          await db.query(`ALTER TABLE ${tableName} ADD UNIQUE KEY uniq_name (name(191))`);
        }
      } catch (e) {
        console.warn(`Could not convert name->TEXT on ${tableName}:`, e.message);
      }
    };

    await modifyColumnType('products', 'category', 'TEXT DEFAULT NULL');
    await modifyColumnType('products', 'color_family', 'TEXT DEFAULT NULL');
    await modifyColumnType('products', 'badge', 'TEXT DEFAULT NULL');
    await modifyColumnType('products', 'style_length', 'TEXT DEFAULT NULL');
    await modifyColumnType('products', 'promotion', 'TEXT DEFAULT NULL');
    await modifyColumnType('products', 'material', 'TEXT DEFAULT NULL');
    await modifyColumnType('products', 'seasonal_type', 'TEXT DEFAULT NULL');
    await modifyColumnType('products', 'size_collection', 'TEXT DEFAULT NULL');

    await modifyColumnType('colors', 'name', 'TEXT DEFAULT NULL');
    // These 7 tables have a UNIQUE name index, so they need the index-aware path.
    await modifyNameToText('categories');
    await modifyNameToText('badges');
    await modifyNameToText('styles');
    await modifyNameToText('materials');
    await modifyNameToText('seasons');
    await modifyNameToText('sizes');
    await modifyNameToText('promotions');

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

    // 11b. Create designs table
    await db.query(`
      CREATE TABLE IF NOT EXISTS designs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name TEXT NOT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 11c. Create sport_types table
    await db.query(`
      CREATE TABLE IF NOT EXISTS sport_types (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name TEXT NOT NULL
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

    // 22. Create store_earnings table (tracks per-order money split when order is Paid)
    await db.query(`
      CREATE TABLE IF NOT EXISTS store_earnings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        store_id INT NOT NULL,
        order_items_total INT NOT NULL COMMENT 'Sum of item price * qty for this store in this order',
        commission_percentage DECIMAL(5,2) NOT NULL DEFAULT 10.00,
        admin_commission INT NOT NULL DEFAULT 0,
        store_payout INT NOT NULL DEFAULT 0,
        paid_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 23. Create store_delivery_prices table
    await db.query(`
      CREATE TABLE IF NOT EXISTS store_delivery_prices (
        id INT AUTO_INCREMENT PRIMARY KEY,
        store_id INT NOT NULL,
        city_name TEXT NOT NULL,
        price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        is_available TINYINT(1) DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE
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





    // Seed default users if empty
    const [usersCount] = await db.query('SELECT COUNT(*) as count FROM users');
    if (usersCount[0].count === 0) {
      const crypto = require('crypto');
      const hashPassword = (password) => crypto.createHash('sha256').update(password).digest('hex');
      const hashedPass = hashPassword('12345678');
      
      await db.query(`
        INSERT INTO users (first_name, last_name, phone, email, password, role, store_name, store_id)
        VALUES 
        ('Admin', 'User', '+964 770 000 0000', 'admin@gmail.com', ?, 'admin', NULL, NULL)
      `, [hashedPass]);
      console.log('Seeded default Admin user.');
    }



    console.log('Database initialization completed successfully.');
  } catch (error) {
    console.error('Error during database initialization:', error);
  }
}

module.exports = initializeDatabase;
