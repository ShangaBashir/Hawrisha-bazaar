require('dotenv').config();
const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'hawrisha',
};

const locationsData = [
  { name: 'Kurdistan Region', type: 'Region', children: [
    { name: 'Erbil', type: 'Governorate', children: ['Erbil City', 'Shaqlawa', 'Soran', 'Koya', 'Choman'] },
    { name: 'Sulaymaniyah', type: 'Governorate', children: ['Sulaymaniyah City', 'Halabja', 'Ranya', 'Kalar', 'Chamchamal'] },
    { name: 'Duhok', type: 'Governorate', children: ['Duhok City', 'Zakho', 'Amedi', 'Akre', 'Shekhan'] }
  ]},
  { name: 'Rest of Iraq', type: 'Region', children: [
    { name: 'Baghdad', type: 'Governorate', children: ['Baghdad City'] },
    { name: 'Basra', type: 'Governorate', children: ['Basra City'] },
    { name: 'Nineveh', type: 'Governorate', children: ['Mosul'] },
    { name: 'Kirkuk', type: 'Governorate', children: ['Kirkuk City'] },
    { name: 'Anbar', type: 'Governorate', children: ['Ramadi', 'Fallujah'] },
    { name: 'Najaf', type: 'Governorate', children: ['Najaf City'] },
    { name: 'Karbala', type: 'Governorate', children: ['Karbala City'] },
    { name: 'Babil', type: 'Governorate', children: ['Hillah'] },
    { name: 'Wasit', type: 'Governorate', children: ['Kut'] },
    { name: 'Diyala', type: 'Governorate', children: ['Baqubah'] },
    { name: 'Salah al-Din', type: 'Governorate', children: ['Tikrit', 'Samarra'] },
    { name: 'Dhi Qar', type: 'Governorate', children: ['Nasiriyah'] },
    { name: 'Maysan', type: 'Governorate', children: ['Amarah'] },
    { name: 'Muthanna', type: 'Governorate', children: ['Samawah'] },
    { name: 'Qadisiyyah', type: 'Governorate', children: ['Diwaniyah'] }
  ]}
];

async function migrate() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected to DB');

    await connection.query(`
      CREATE TABLE IF NOT EXISTS locations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        type ENUM('Region', 'Governorate', 'City') NOT NULL,
        parent_id INT DEFAULT NULL,
        FOREIGN KEY (parent_id) REFERENCES locations(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS store_delivery_prices (
        id INT AUTO_INCREMENT PRIMARY KEY,
        store_id INT NOT NULL,
        location_id INT NOT NULL,
        price DECIMAL(10, 2) NOT NULL DEFAULT 0,
        is_available BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_store_location (store_id, location_id),
        FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
        FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('Tables created.');

    const [existing] = await connection.query('SELECT COUNT(*) as cnt FROM locations');
    if (existing[0].cnt === 0) {
      console.log('Seeding locations...');
      for (const region of locationsData) {
        const [rRes] = await connection.query('INSERT INTO locations (name, type) VALUES (?, ?)', [
          JSON.stringify({ en: region.name, ku: region.name, ar: region.name }), 'Region'
        ]);
        const regionId = rRes.insertId;

        for (const gov of region.children) {
          const [gRes] = await connection.query('INSERT INTO locations (name, type, parent_id) VALUES (?, ?, ?)', [
            JSON.stringify({ en: gov.name, ku: gov.name, ar: gov.name }), 'Governorate', regionId
          ]);
          const govId = gRes.insertId;

          for (const city of gov.children) {
            await connection.query('INSERT INTO locations (name, type, parent_id) VALUES (?, ?, ?)', [
              JSON.stringify({ en: city, ku: city, ar: city }), 'City', govId
            ]);
          }
        }
      }
      console.log('Seeding done.');
    } else {
      console.log('Locations already seeded.');
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

migrate();
