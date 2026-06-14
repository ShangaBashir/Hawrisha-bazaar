const express = require('express');
const router = express.Router();
const db = require('../config/db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Image upload configuration using multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

// 1. GET ALL PRODUCTS
router.get('/', async (req, res) => {
  try {
    const [products] = await db.query(
      'SELECT p.*, u.store_name AS vendor_name FROM products p LEFT JOIN users u ON p.vendor_id = u.id ORDER BY p.id DESC'
    );
    
    // Fetch associated colors for each product
    for (let product of products) {
      const [colors] = await db.query('SELECT color_class, color_name FROM product_colors WHERE product_id = ?', [product.id]);
      product.colors = colors.map(c => c.color_class);
      product.colorNames = colors.map(c => c.color_name);
    }
    
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 1.5 GET PRODUCTS BY VENDOR EMAIL
router.get('/vendor', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ error: 'Email parameter is required.' });
    }

    const [users] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(404).json({ error: 'Vendor not found.' });
    }
    const vendorId = users[0].id;

    const [products] = await db.query(
      'SELECT p.*, u.store_name AS vendor_name FROM products p LEFT JOIN users u ON p.vendor_id = u.id WHERE p.vendor_id = ? ORDER BY p.id DESC',
      [vendorId]
    );
    
    for (let product of products) {
      const [colors] = await db.query('SELECT color_class, color_name FROM product_colors WHERE product_id = ?', [product.id]);
      product.colors = colors.map(c => c.color_class);
      product.colorNames = colors.map(c => c.color_name);
    }
    
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. CREATE A NEW PRODUCT
router.post('/', upload.single('image'), async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const { 
      name, price, category, colorFamily, badge, desc, colors, colorNames,
      styleLength, stock, promotion, material, seasonalType, sizeCollection, discount,
      vendorEmail
    } = req.body;
    
    if (!price || Number(price) < 250) {
      return res.status(400).json({ error: 'Price must be a valid Iraqi Dinar amount (minimum 250 IQD)' });
    }
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    let dbVendorId = null;
    if (vendorEmail) {
      const [vusers] = await connection.query('SELECT id FROM users WHERE email = ?', [vendorEmail]);
      if (vusers.length > 0) {
        dbVendorId = vusers[0].id;
      }
    }

    const [result] = await connection.query(
      `INSERT INTO products (
        name, price, category, color_family, badge, description, image_url,
        style_length, stock, promotion, material, seasonal_type, size_collection, discount, vendor_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name, price, category, colorFamily, badge, desc, imageUrl,
        styleLength || null, Number(stock) || 0, promotion || null, material || null, 
        seasonalType || null, sizeCollection || null, Number(discount) || 0, dbVendorId
      ]
    );

    const productId = result.insertId;

    // Parse and save color style class swatches
    const parsedColors = JSON.parse(colors || '[]');
    const parsedColorNames = JSON.parse(colorNames || '[]');
    
    for (let i = 0; i < parsedColors.length; i++) {
      await connection.query(
        'INSERT INTO product_colors (product_id, color_class, color_name) VALUES (?, ?, ?)',
        [productId, parsedColors[i], parsedColorNames[i] || '']
      );
    }

    await connection.commit();
    res.status(201).json({ id: productId, message: 'Product created successfully' });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ error: error.message });
  } finally {
    connection.release();
  }
});

// 3. UPDATE AN EXISTING PRODUCT
router.put('/:id', upload.single('image'), async (req, res) => {
  const { id } = req.params;
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const { 
      name, price, category, colorFamily, badge, desc, colors, colorNames,
      styleLength, stock, promotion, material, seasonalType, sizeCollection, discount,
      vendorEmail
    } = req.body;
    
    if (!price || Number(price) < 250) {
      return res.status(400).json({ error: 'Price must be a valid Iraqi Dinar amount (minimum 250 IQD)' });
    }

    if (vendorEmail) {
      const [u] = await connection.query('SELECT id, role FROM users WHERE email = ?', [vendorEmail]);
      if (u.length === 0) {
        return res.status(403).json({ error: 'Unauthorized user.' });
      }
      const user = u[0];
      if (user.role !== 'admin') {
        const [prod] = await connection.query('SELECT vendor_id FROM products WHERE id = ?', [id]);
        if (prod.length === 0 || prod[0].vendor_id !== user.id) {
          return res.status(403).json({ error: 'You do not own this product.' });
        }
      }
    }
    
    let updateQuery = `UPDATE products SET 
      name = ?, 
      price = ?, 
      category = ?, 
      color_family = ?, 
      badge = ?, 
      description = ?, 
      style_length = ?, 
      stock = ?, 
      promotion = ?, 
      material = ?, 
      seasonal_type = ?, 
      size_collection = ?, 
      discount = ?`;
    let queryParams = [
      name, price, category, colorFamily, badge, desc, 
      styleLength || null, Number(stock) || 0, promotion || null, material || null, 
      seasonalType || null, sizeCollection || null, Number(discount) || 0
    ];

    if (req.file) {
      const imageUrl = `/uploads/${req.file.filename}`;
      updateQuery += ', image_url = ?';
      queryParams.push(imageUrl);
    }

    updateQuery += ' WHERE id = ?';
    queryParams.push(id);

    await connection.query(updateQuery, queryParams);

    // Update color swatches
    if (colors && colorNames) {
      await connection.query('DELETE FROM product_colors WHERE product_id = ?', [id]);
      const parsedColors = JSON.parse(colors);
      const parsedColorNames = JSON.parse(colorNames);
      
      for (let i = 0; i < parsedColors.length; i++) {
        await connection.query(
          'INSERT INTO product_colors (product_id, color_class, color_name) VALUES (?, ?, ?)',
          [id, parsedColors[i], parsedColorNames[i] || '']
        );
      }
    }

    await connection.commit();
    res.json({ message: 'Product updated successfully' });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ error: error.message });
  } finally {
    connection.release();
  }
});

// 4. DELETE A PRODUCT
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const userEmail = req.body.vendorEmail || req.query.vendorEmail;
  try {
    if (userEmail) {
      const [u] = await db.query('SELECT id, role FROM users WHERE email = ?', [userEmail]);
      if (u.length === 0) {
        return res.status(403).json({ error: 'Unauthorized user.' });
      }
      const user = u[0];
      if (user.role !== 'admin') {
        const [prod] = await db.query('SELECT vendor_id FROM products WHERE id = ?', [id]);
        if (prod.length === 0 || prod[0].vendor_id !== user.id) {
          return res.status(403).json({ error: 'You do not own this product.' });
        }
      }
    }
    await db.query('DELETE FROM products WHERE id = ?', [id]);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
