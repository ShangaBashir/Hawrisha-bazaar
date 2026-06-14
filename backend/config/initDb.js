const db = require('./db');

async function initializeDatabase() {
  try {
    console.log('Initializing database schema and seed data...');

    // 1. Create products table
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

    await addColumnSafely('products', 'style_length', 'VARCHAR(100) DEFAULT NULL');
    await addColumnSafely('products', 'stock', 'INT DEFAULT 0');
    await addColumnSafely('products', 'promotion', 'VARCHAR(100) DEFAULT NULL');
    await addColumnSafely('products', 'material', 'VARCHAR(100) DEFAULT NULL');
    await addColumnSafely('products', 'seasonal_type', 'VARCHAR(100) DEFAULT NULL');
    await addColumnSafely('products', 'size_collection', 'VARCHAR(100) DEFAULT NULL');
    await addColumnSafely('products', 'discount', 'INT DEFAULT 0');

    // 2. Create product_colors table
    await db.query(`
      CREATE TABLE IF NOT EXISTS product_colors (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT NOT NULL,
        color_class VARCHAR(100) NOT NULL,
        color_name VARCHAR(100) NOT NULL,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 3. Create categories table
    await db.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 4. Create badges table
    await db.query(`
      CREATE TABLE IF NOT EXISTS badges (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 5. Create colors table
    await db.query(`
      CREATE TABLE IF NOT EXISTS colors (
        id VARCHAR(50) PRIMARY KEY,
        class VARCHAR(100) NOT NULL,
        name VARCHAR(100) NOT NULL,
        family VARCHAR(50) NOT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 6. Create styles table
    await db.query(`
      CREATE TABLE IF NOT EXISTS styles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 7. Create materials table
    await db.query(`
      CREATE TABLE IF NOT EXISTS materials (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 8. Create seasons table
    await db.query(`
      CREATE TABLE IF NOT EXISTS seasons (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 9. Create sizes table
    await db.query(`
      CREATE TABLE IF NOT EXISTS sizes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 10. Create promotions table
    await db.query(`
      CREATE TABLE IF NOT EXISTS promotions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 11. Create users table
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

    // Add columns safely to existing database
    await addColumnSafely('users', 'role', "VARCHAR(50) DEFAULT 'customer'");
    await addColumnSafely('users', 'store_name', "VARCHAR(255) DEFAULT NULL");
    await addColumnSafely('products', 'vendor_id', "INT DEFAULT NULL");


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

    console.log('Database initialization completed successfully.');
  } catch (error) {
    console.error('Error during database initialization:', error);
  }
}

module.exports = initializeDatabase;
