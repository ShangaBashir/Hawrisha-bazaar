const db = require('./config/db');

(async () => {
  const connection = await db.getConnection();
  try {
    await connection.query('DROP TABLE IF EXISTS store_delivery_prices');
    await connection.query(`
      CREATE TABLE store_delivery_prices (
        id INT AUTO_INCREMENT PRIMARY KEY,
        store_id INT NOT NULL,
        city_name VARCHAR(255) NOT NULL,
        price DECIMAL(10, 2) NOT NULL DEFAULT 0,
        is_available BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_store_city (store_id, city_name),
        FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('Migration successful');
  } catch (e) {
    console.error(e);
  } finally {
    connection.release();
    process.exit();
  }
})();
