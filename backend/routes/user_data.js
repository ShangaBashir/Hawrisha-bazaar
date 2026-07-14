const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /api/user_data/cart
router.get('/cart', async (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ success: false, message: 'Email required' });

  try {
    const [rows] = await db.query(
      `SELECT c.*, s.name AS vendor_name 
       FROM cart_items c 
       LEFT JOIN stores s ON c.store_id = s.id 
       WHERE c.user_email = ?`, 
      [email]
    );
    // Format to match frontend state
    const cart = rows.map(r => ({
      id: r.product_id,
      store_id: r.store_id,
      vendor_name: r.vendor_name,
      name: r.name,
      price: r.price,
      quantity: r.quantity,
      selectedColor: r.selected_color,
      selectedSize: r.selected_size,
      selectedStyle: r.selected_style
    }));
    res.json({ success: true, cart });
  } catch (err) {
    console.error('Error fetching cart:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/user_data/cart
// Replaces the entire cart for the user
router.post('/cart', async (req, res) => {
  const { email, cart } = req.body;
  if (!email) return res.status(400).json({ success: false, message: 'Email required' });

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // Delete existing cart
    await connection.query('DELETE FROM cart_items WHERE user_email = ?', [email]);

    // Insert new cart items
    if (cart && cart.length > 0) {
      for (const item of cart) {
        await connection.query(
          `INSERT INTO cart_items (user_email, product_id, store_id, name, price, quantity, selected_color, selected_size, selected_style)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [email, item.id, item.store_id || null, item.name, item.price, item.quantity, item.selectedColor || null, item.selectedSize || null, item.selectedStyle || null]
        );
      }
    }

    await connection.commit();
    res.json({ success: true, message: 'Cart updated successfully' });
  } catch (err) {
    await connection.rollback();
    console.error('Error saving cart:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  } finally {
    connection.release();
  }
});

// GET /api/user_data/wishlist
router.get('/wishlist', async (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ success: false, message: 'Email required' });

  try {
    const [rows] = await db.query('SELECT product_id FROM wishlist_items WHERE user_email = ?', [email]);
    const wishlist = rows.map(r => r.product_id);
    res.json({ success: true, wishlist });
  } catch (err) {
    console.error('Error fetching wishlist:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/user_data/wishlist
// Replaces the entire wishlist for the user
router.post('/wishlist', async (req, res) => {
  const { email, wishlist } = req.body;
  if (!email) return res.status(400).json({ success: false, message: 'Email required' });

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // Delete existing wishlist
    await connection.query('DELETE FROM wishlist_items WHERE user_email = ?', [email]);

    // Insert new wishlist items
    if (wishlist && wishlist.length > 0) {
      for (const productId of wishlist) {
        await connection.query(
          `INSERT INTO wishlist_items (user_email, product_id) VALUES (?, ?)`,
          [email, productId]
        );
      }
    }

    await connection.commit();
    res.json({ success: true, message: 'Wishlist updated successfully' });
  } catch (err) {
    await connection.rollback();
    console.error('Error saving wishlist:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  } finally {
    connection.release();
  }
});

// GET /api/user_data/addresses
// Retrieve all saved locations/addresses for a user email
router.get('/addresses', async (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ success: false, message: 'Email required' });

  try {
    const [rows] = await db.query('SELECT * FROM user_addresses WHERE user_email = ? ORDER BY id DESC', [email]);
    res.json({ success: true, addresses: rows });
  } catch (err) {
    console.error('Error fetching addresses:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/user_data/addresses
// Add/save a new address for a user email
router.post('/addresses', async (req, res) => {
  const { email, firstName, lastName, phone, secondaryPhone, cityName, streetAddress, latitude, longitude } = req.body;
  if (!email || !firstName || !lastName || !phone || !cityName || !streetAddress || latitude === undefined || longitude === undefined) {
    return res.status(400).json({ success: false, message: 'All required address fields must be provided' });
  }

  try {
    // Optional check: Avoid saving exact duplicates
    const [exists] = await db.query(
      `SELECT id FROM user_addresses 
       WHERE user_email = ? AND city_name = ? AND street_address = ? AND latitude = ? AND longitude = ?`,
      [email, cityName.trim(), streetAddress.trim(), parseFloat(latitude), parseFloat(longitude)]
    );

    if (exists.length > 0) {
      return res.json({ success: true, message: 'Address already exists', addressId: exists[0].id });
    }

    const [result] = await db.query(
      `INSERT INTO user_addresses (user_email, first_name, last_name, phone, secondary_phone, city_name, street_address, latitude, longitude)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [email, firstName.trim(), lastName.trim(), phone.trim(), secondaryPhone ? secondaryPhone.trim() : null, cityName.trim(), streetAddress.trim(), parseFloat(latitude), parseFloat(longitude)]
    );

    res.status(201).json({ success: true, message: 'Address saved successfully', addressId: result.insertId });
  } catch (err) {
    console.error('Error saving address:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
