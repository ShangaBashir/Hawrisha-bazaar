const express = require('express');
const router = express.Router();
const db = require('../config/db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });
const uploadFields = upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'banner', maxCount: 1 }
]);

// Hash password helper
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Helper to check if requester is Admin
async function checkAdmin(email) {
  if (!email) return false;
  try {
    const [users] = await db.query('SELECT role FROM users WHERE email = ?', [email]);
    return users.length > 0 && users[0].role === 'admin';
  } catch (e) {
    return false;
  }
}

// 1. GET ACTIVE STORES (Public Directory)
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT s.*, COUNT(p.id) AS productCount 
      FROM stores s 
      LEFT JOIN products p ON p.store_id = s.id 
      WHERE s.status = 'Active' 
      GROUP BY s.id
      ORDER BY s.updated_at DESC
    `);
    
    const stores = rows.map(store => {
      try {
        store.social_links = store.social_links ? JSON.parse(store.social_links) : {};
      } catch (e) {
        store.social_links = {};
      }
      return store;
    });

    res.json({ success: true, vendors: stores });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 2. GET ALL STORES (Admin Dashboard)
router.get('/all', async (req, res) => {
  try {
    const adminEmail = req.query.adminEmail;
    if (!(await checkAdmin(adminEmail))) {
      return res.status(403).json({ success: false, message: 'Unauthorized. Admin access required.' });
    }
    const [rows] = await db.query(`
      SELECT s.*, COUNT(p.id) AS productCount 
      FROM stores s 
      LEFT JOIN products p ON p.store_id = s.id 
      GROUP BY s.id
      ORDER BY s.updated_at DESC
    `);

    const stores = rows.map(store => {
      try {
        store.social_links = store.social_links ? JSON.parse(store.social_links) : {};
      } catch (e) {
        store.social_links = {};
      }
      return store;
    });

    res.json({ success: true, stores });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 3. GET SINGLE STORE BY ID OR OWNER EMAIL
router.get('/detail', async (req, res) => {
  try {
    const { id, email } = req.query;
    let query = 'SELECT * FROM stores WHERE 1=1';
    let params = [];

    if (id) {
      query += ' AND id = ?';
      params.push(id);
    } else if (email) {
      query += ' AND email = ?';
      params.push(email);
    } else {
      return res.status(400).json({ success: false, message: 'ID or Email parameter is required.' });
    }

    const [rows] = await db.query(query, params);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Store not found.' });
    }

    const store = rows[0];
    try {
      store.social_links = store.social_links ? JSON.parse(store.social_links) : {};
    } catch (e) {
      store.social_links = {};
    }

    res.json({ success: true, store });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 4. CREATE A NEW STORE
router.post('/', uploadFields, async (req, res) => {
  try {
    const { name, description, owner_name, email, phone, city, address, social_links, adminEmail, password, commission_percentage } = req.body;
    const commPct = parseInt(commission_percentage) || 0;
    console.log("POST /api/stores - req.body:", { name, owner_name, email, phone, city, adminEmail, commPct });
    if (!(await checkAdmin(adminEmail))) {
      console.warn("POST /api/stores - Unauthorized adminEmail:", adminEmail);
      return res.status(403).json({ success: false, message: 'Unauthorized. Admin access required.' });
    }

    if (!password) {
      return res.status(400).json({ success: false, message: 'A login password for the vendor is required.' });
    }

    const cleanPhone = phone ? phone.replace(/\D/g, '') : '';
    if (!phone || !phone.startsWith('+964') || cleanPhone.length !== 13) {
      return res.status(400).json({
        success: false,
        message: 'Phone number must start with +964 and contain exactly 10 digits.'
      });
    }
    
    // Check if store already exists with this email or name
    const [existing] = await db.query('SELECT id FROM stores WHERE email = ? OR name = ?', [email, name]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'A store with this name or email already exists.' });
    }

    const logoUrl = req.files && req.files['logo'] ? `/uploads/${req.files['logo'][0].filename}` : null;
    const bannerUrl = req.files && req.files['banner'] ? `/uploads/${req.files['banner'][0].filename}` : null;

    const [result] = await db.query(
      `INSERT INTO stores (name, logo, banner, description, owner_name, email, phone, city, address, social_links, status, commission_percentage)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Active', ?)`,
      [name, logoUrl, bannerUrl, description || '', owner_name, email, phone, city || '', address || '', social_links || '{}', commPct]
    );

    const storeId = result.insertId;
    const hashedPw = hashPassword(password);

    // Create or update vendor user account with admin-set password
    const [existingUser] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      // User exists — update their role, password, and link to the new store
      await db.query(
        'UPDATE users SET role = ?, store_id = ?, store_name = ?, password = ? WHERE email = ?',
        ['vendor', storeId, name, hashedPw, email]
      );
    } else {
      // Create a new vendor user
      const [nameParts] = owner_name.split(' ');
      const firstName = owner_name.split(' ')[0] || owner_name;
      const lastName = owner_name.split(' ').slice(1).join(' ') || '-';
      await db.query(
        'INSERT INTO users (first_name, last_name, phone, email, password, role, store_id, store_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [firstName, lastName, phone, email, hashedPw, 'vendor', storeId, name]
      );
    }

    res.status(201).json({ success: true, id: storeId, message: 'Store created successfully' });
  } catch (error) {
    console.error("POST /api/stores - Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 5. UPDATE STORE DETAILS
router.put('/:id', uploadFields, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, owner_name, email, phone, city, address, social_links, adminEmail, password, commission_percentage } = req.body;
    const commPct = commission_percentage !== undefined ? parseInt(commission_percentage) || 0 : undefined;
    console.log("PUT /api/stores/:id - req.body:", { id, name, owner_name, email, phone, city, adminEmail, commPct });
    if (!(await checkAdmin(adminEmail))) {
      console.warn("PUT /api/stores/:id - Unauthorized adminEmail:", adminEmail);
      return res.status(403).json({ success: false, message: 'Unauthorized. Admin access required.' });
    }

    const logoUrl = req.files && req.files['logo'] ? `/uploads/${req.files['logo'][0].filename}` : null;
    const bannerUrl = req.files && req.files['banner'] ? `/uploads/${req.files['banner'][0].filename}` : null;

    const cleanPhone = phone ? phone.replace(/\D/g, '') : '';
    if (!phone || !phone.startsWith('+964') || cleanPhone.length !== 13) {
      return res.status(400).json({
        success: false,
        message: 'Phone number must start with +964 and contain exactly 10 digits.'
      });
    }

    let updateQuery = `UPDATE stores SET 
      name = ?, 
      description = ?, 
      owner_name = ?, 
      email = ?, 
      phone = ?,
      city = ?,
      address = ?, 
      social_links = ?`;
    let queryParams = [name, description || '', owner_name, email, phone, city || '', address || '', social_links || '{}'];

    if (logoUrl) {
      updateQuery += ', logo = ?';
      queryParams.push(logoUrl);
    }
    if (bannerUrl) {
      updateQuery += ', banner = ?';
      queryParams.push(bannerUrl);
    }
    if (commPct !== undefined) {
      updateQuery += ', commission_percentage = ?';
      queryParams.push(commPct);
    }

    updateQuery += ' WHERE id = ?';
    queryParams.push(id);

    await db.query(updateQuery, queryParams);

    // Update linked vendor user (name, store name, email)
    let userUpdateQuery = 'UPDATE users SET store_name = ?, first_name = ?, email = ?';
    let userParams = [name, owner_name.split(' ')[0] || owner_name, email];

    // If admin is changing the password, update it too
    if (password && password.trim() !== '') {
      userUpdateQuery += ', password = ?';
      userParams.push(hashPassword(password));
    }

    userUpdateQuery += ' WHERE store_id = ? AND role = ?';
    userParams.push(id, 'vendor');
    await db.query(userUpdateQuery, userParams);

    res.json({ success: true, message: 'Store details updated successfully' });
  } catch (error) {
    console.error("PUT /api/stores/:id - Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 6. UPDATE STORE STATUS (Admin only)
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminEmail } = req.body;
    if (!(await checkAdmin(adminEmail))) {
      return res.status(403).json({ success: false, message: 'Unauthorized. Admin access required.' });
    }

    if (!['Active', 'Pending', 'Suspended'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value.' });
    }

    await db.query('UPDATE stores SET status = ? WHERE id = ?', [status, id]);
    res.json({ success: true, message: `Store status updated to ${status} successfully` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 7. DELETE STORE (Admin only)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const adminEmail = req.query.adminEmail;
    if (!(await checkAdmin(adminEmail))) {
      return res.status(403).json({ success: false, message: 'Unauthorized. Admin access required.' });
    }

    // Remove vendor user linked to this store
    await db.query('DELETE FROM users WHERE store_id = ? AND role = ?', [id, 'vendor']);

    await db.query('DELETE FROM stores WHERE id = ?', [id]);
    await db.query('DELETE FROM products WHERE store_id = ?', [id]);

    res.json({ success: true, message: 'Store and its products deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 8. GET STORE DELIVERY PRICES
router.get('/:id/delivery', async (req, res) => {
  try {
    const { id } = req.params;
    const [prices] = await db.query('SELECT * FROM store_delivery_prices WHERE store_id = ?', [id]);
    res.json({ success: true, delivery_prices: prices });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 9. UPDATE STORE DELIVERY PRICES
router.post('/:id/delivery', async (req, res) => {
  try {
    const { id } = req.params;
    const { email, prices } = req.body;
    
    // Auth check: Vendor must own this store, or be admin
    const [users] = await db.query('SELECT role, store_id FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(403).json({ success: false, message: 'Unauthorized.' });
    }
    const user = users[0];
    if (user.role !== 'admin' && String(user.store_id) !== String(id)) {
      return res.status(403).json({ success: false, message: 'Unauthorized. You do not own this store.' });
    }

    // prices should be an array: [{ city_name: "Erbil", price: 3000, is_available: true }, ...]
    if (!Array.isArray(prices)) {
      return res.status(400).json({ success: false, message: 'Invalid prices data.' });
    }

    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      
      // Delete existing prices for this store
      await connection.query('DELETE FROM store_delivery_prices WHERE store_id = ?', [id]);
      
      // Insert new prices
      for (const p of prices) {
        if (!p.city_name || !p.city_name.trim()) continue;
        const pVal = Number(p.price) || 0;
        if (pVal < 0) throw new Error("Price cannot be negative.");
        const isAvail = p.is_available === undefined ? true : p.is_available;
        
        await connection.query(`
          INSERT INTO store_delivery_prices (store_id, city_name, price, is_available)
          VALUES (?, ?, ?, ?)
        `, [id, p.city_name.trim(), pVal, isAvail]);
      }

      await connection.commit();
      res.json({ success: true, message: 'Delivery prices updated successfully.' });
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("POST /api/stores/:id/delivery - Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
