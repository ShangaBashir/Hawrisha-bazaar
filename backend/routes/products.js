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
const upload = multer({ 
  storage,
  limits: {
    fieldNameSize: 200,
    fieldSize: 25 * 1024 * 1024, // 25MB per field
    fields: 100,       // up to 100 non-file fields
    fileSize: 25 * 1024 * 1024, // 25MB per file
    files: 20,         // up to 20 files
    parts: 200         // total parts (files + fields)
  }
});

// Middleware that handles multer upload with any fields + error catching
const uploadFields = (req, res, next) => {
  upload.any()(req, res, (err) => {
    if (err) {
      console.error('Multer upload error:', err.message, err.code);
      return res.status(400).json({ error: `Upload error: ${err.message}`, code: err.code });
    }
    next();
  });
};

// 1. GET ALL PRODUCTS
router.get('/', async (req, res) => {
  try {
    const [products] = await db.query(
      `SELECT p.*, s.name AS vendor_name, s.status AS store_status 
       FROM products p 
       LEFT JOIN stores s ON p.store_id = s.id 
       WHERE s.status = 'Active' OR p.store_id IS NULL 
       ORDER BY p.updated_at DESC, p.id DESC`
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

    const [users] = await db.query('SELECT id, role, store_id FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(404).json({ error: 'Vendor not found.' });
    }
    const user = users[0];

    let query = '';
    let params = [];
    if (user.role === 'admin') {
      query = `SELECT p.*, s.name AS vendor_name 
               FROM products p 
               LEFT JOIN stores s ON p.store_id = s.id 
               ORDER BY p.updated_at DESC, p.id DESC`;
    } else {
      query = `SELECT p.*, s.name AS vendor_name 
               FROM products p 
               LEFT JOIN stores s ON p.store_id = s.id 
               WHERE p.store_id = ? 
               ORDER BY p.updated_at DESC, p.id DESC`;
      params.push(user.store_id || 0);
    }

    const [products] = await db.query(query, params);
    
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
router.post('/', uploadFields, async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const { 
      name, price, category, colorFamily, badge, desc, colors, colorNames,
      styleLength, stock, promotion, material, seasonalType, sizeCollection, sizeColors, discount,
      vendorEmail, storeId, gender, colorVariants
    } = req.body;
    
    console.log("POST /api/products - req.body:", { name, price, category, vendorEmail, storeId });
    
    if (!price || Number(price) < 250) {
      return res.status(400).json({ error: 'Price must be a valid Iraqi Dinar amount (minimum 250 IQD)' });
    }
    
    const imageFile = req.files && Array.isArray(req.files) ? req.files.find(f => f.fieldname === 'image') : null;
    let imageUrl = imageFile ? `/uploads/${imageFile.filename}` : null;

    let parsedVariants = [];
    try {
      parsedVariants = JSON.parse(colorVariants || '[]');
    } catch (e) {
      console.warn('Failed to parse colorVariants JSON:', e.message);
    }

    if (req.files && Array.isArray(req.files)) {
      parsedVariants.forEach((variant, index) => {
        const file = req.files.find(f => f.fieldname === `variant_image_${index}`);
        if (file) {
          variant.image = `/uploads/${file.filename}`;
        }
      });
    }

    if (!imageUrl && parsedVariants.length > 0 && parsedVariants[0].image) {
      imageUrl = parsedVariants[0].image;
    }

    let dbVendorId = null;
    let dbStoreId = null;
    if (vendorEmail) {
      const [vusers] = await connection.query('SELECT id, store_id FROM users WHERE email = ?', [vendorEmail]);
      if (vusers.length > 0) {
        dbVendorId = vusers[0].id;
        dbStoreId = vusers[0].store_id;
      }
    }
    if (storeId) {
      dbStoreId = Number(storeId) || null;
      const [susers] = await connection.query('SELECT id FROM users WHERE store_id = ? AND role = "vendor"', [dbStoreId]);
      if (susers.length > 0) {
        dbVendorId = susers[0].id;
      }
    }
    
    // Calculate commission
    let adminShare = 0;
    let storeShare = Number(price);
    if (dbStoreId) {
      const [storeRows] = await connection.query('SELECT commission_percentage FROM stores WHERE id = ?', [dbStoreId]);
      if (storeRows.length > 0) {
        const commPct = storeRows[0].commission_percentage || 0;
        adminShare = Math.round(Number(price) * (commPct / 100));
        storeShare = Number(price) - adminShare;
      }
    }

    console.log("POST /api/products - resolved dbStoreId:", dbStoreId, "dbVendorId:", dbVendorId, "adminShare:", adminShare, "storeShare:", storeShare);

    const [result] = await connection.query(
      `INSERT INTO products (
        name, price, category, color_family, badge, description, image_url,
        style_length, stock, promotion, material, seasonal_type, size_collection, size_colors, discount, vendor_id, store_id, extra_images, gender, admin_share, store_share, color_variants
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, ?, ?, ?, ?)`,
      [
        name, price, category, colorFamily, badge, desc, imageUrl,
        styleLength || null, Number(stock) || 0, promotion || null, material || null, 
        seasonalType || null, sizeCollection || null, sizeColors || null, Number(discount) || 0, dbVendorId, dbStoreId, gender || null, adminShare, storeShare, JSON.stringify(parsedVariants)
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
    console.error('POST /api/products ERROR:', error.message, error.code, error.sqlMessage);
    res.status(500).json({ error: error.message, code: error.code, sqlMessage: error.sqlMessage });
  } finally {
    connection.release();
  }
});

// 3. UPDATE AN EXISTING PRODUCT
router.put('/:id', uploadFields, async (req, res) => {
  const { id } = req.params;
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const { 
      name, price, category, colorFamily, badge, desc, colors, colorNames,
      styleLength, stock, promotion, material, seasonalType, sizeCollection, sizeColors, discount,
      vendorEmail, storeId, gender, colorVariants
    } = req.body;
    
    console.log("PUT /api/products/:id - req.body:", { id, name, price, category, vendorEmail, storeId });
    
    if (!price || Number(price) < 250) {
      return res.status(400).json({ error: 'Price must be a valid Iraqi Dinar amount (minimum 250 IQD)' });
    }

    let dbStoreId = undefined;
    let dbVendorId = undefined;
    if (vendorEmail) {
      const [u] = await connection.query('SELECT id, role, store_id FROM users WHERE email = ?', [vendorEmail]);
      if (u.length === 0) {
        return res.status(403).json({ error: 'Unauthorized user.' });
      }
      const user = u[0];
      if (user.role !== 'admin') {
        dbStoreId = user.store_id;
        const [prod] = await connection.query('SELECT vendor_id FROM products WHERE id = ?', [id]);
        if (prod.length === 0 || prod[0].vendor_id !== user.id) {
          return res.status(403).json({ error: 'You do not own this product.' });
        }
      } else {
        if (storeId !== undefined) {
          dbStoreId = storeId ? Number(storeId) : null;
          if (dbStoreId) {
            const [susers] = await connection.query('SELECT id FROM users WHERE store_id = ? AND role = "vendor"', [dbStoreId]);
            dbVendorId = susers.length > 0 ? susers[0].id : null;
          } else {
            dbVendorId = null;
          }
        }
      }
    }
    
    console.log("PUT /api/products/:id - resolved dbStoreId:", dbStoreId, "dbVendorId:", dbVendorId);
    
    const imageFile = req.files && Array.isArray(req.files) ? req.files.find(f => f.fieldname === 'image') : null;
    const mainImage = imageFile ? `/uploads/${imageFile.filename}` : null;

    let parsedVariants = [];
    try {
      parsedVariants = JSON.parse(colorVariants || '[]');
    } catch (e) {
      console.warn('Failed to parse colorVariants JSON:', e.message);
    }

    if (req.files && Array.isArray(req.files)) {
      parsedVariants.forEach((variant, index) => {
        const file = req.files.find(f => f.fieldname === `variant_image_${index}`);
        if (file) {
          variant.image = `/uploads/${file.filename}`;
        }
      });
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
      size_colors = ?,
      discount = ?,
      extra_images = NULL,
      gender = ?,
      color_variants = ?`;
    let queryParams = [
      name, price, category, colorFamily, badge, desc, 
      styleLength || null, Number(stock) || 0, promotion || null, material || null, 
      seasonalType || null, sizeCollection || null, sizeColors || null, Number(discount) || 0,
      gender || null, JSON.stringify(parsedVariants)
    ];

    if (mainImage) {
      updateQuery += ', image_url = ?';
      queryParams.push(mainImage);
    }
    if (dbStoreId !== undefined) {
      updateQuery += ', store_id = ?';
      queryParams.push(dbStoreId);
    }
    if (dbVendorId !== undefined) {
      updateQuery += ', vendor_id = ?';
      queryParams.push(dbVendorId);
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
