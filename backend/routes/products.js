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
    const [products] = await db.query('SELECT * FROM products ORDER BY id DESC');
    
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

// 2. CREATE A NEW PRODUCT
router.post('/', upload.single('image'), async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const { 
      name, price, category, colorFamily, badge, desc, colors, colorNames,
      styleLength, stock, promotion, material, seasonalType, sizeCollection, discount 
    } = req.body;
    
    if (!price || Number(price) < 250) {
      return res.status(400).json({ error: 'Price must be a valid Iraqi Dinar amount (minimum 250 IQD)' });
    }
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const [result] = await connection.query(
      `INSERT INTO products (
        name, price, category, color_family, badge, description, image_url,
        style_length, stock, promotion, material, seasonal_type, size_collection, discount
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name, price, category, colorFamily, badge, desc, imageUrl,
        styleLength || null, Number(stock) || 0, promotion || null, material || null, 
        seasonalType || null, sizeCollection || null, Number(discount) || 0
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
      styleLength, stock, promotion, material, seasonalType, sizeCollection, discount 
    } = req.body;
    
    if (!price || Number(price) < 250) {
      return res.status(400).json({ error: 'Price must be a valid Iraqi Dinar amount (minimum 250 IQD)' });
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
  try {
    await db.query('DELETE FROM products WHERE id = ?', [id]);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
