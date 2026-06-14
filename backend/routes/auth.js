const express = require('express');
const router = express.Router();
const db = require('../config/db');
const crypto = require('crypto');

// Helper to hash password
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// 1. Register Route
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, phone, email, password, role, storeName } = req.body;

    // 1. Basic validation
    if (!firstName || !lastName || !phone || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required.'
      });
    }

    // 1.5 Phone format validation (+964 and 10 digits)
    const cleanPhone = phone.replace(/\D/g, '');
    if (!phone.startsWith('+964') || cleanPhone.length !== 13) {
      return res.status(400).json({
        success: false,
        message: 'Phone number must start with +964 and contain exactly 10 digits.'
      });
    }

    // 2. Email ending check
    if (!email.toLowerCase().endsWith('@gmail.com')) {
      return res.status(400).json({
        success: false,
        message: 'Email address must end with @gmail.com'
      });
    }

    // 3. Password length check
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long.'
      });
    }

    // Vendor store validation
    if (role === 'vendor' && !storeName) {
      return res.status(400).json({
        success: false,
        message: 'Store Name is required for vendors.'
      });
    }

    // 4. Check if user already exists
    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.'
      });
    }

    // Check if store name is already taken
    if (role === 'vendor') {
      const [existingStore] = await db.query('SELECT id FROM users WHERE store_name = ?', [storeName]);
      if (existingStore.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'An account with this Store Name already exists.'
        });
      }
    }

    // 5. Hash password and insert
    const hashedPassword = hashPassword(password);
    await db.query(
      'INSERT INTO users (first_name, last_name, phone, email, password, role, store_name) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [firstName, lastName, phone, email, hashedPassword, role || 'customer', role === 'vendor' ? storeName : null]
    );

    return res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      firstName: firstName,
      email: email,
      role: role || 'customer',
      storeName: role === 'vendor' ? storeName : null
    });
  } catch (error) {
    console.error('Error during registration:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while creating your account. Please try again later.'
    });
  }
});

// 2. Login Route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.'
      });
    }

    // Hash the input password to compare with DB
    const hashedPassword = hashPassword(password);

    // Fetch user
    const [users] = await db.query(
      'SELECT first_name, email, role, store_name FROM users WHERE email = ? AND password = ?',
      [email, hashedPassword]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password. Please verify your credentials.'
      });
    }

    const user = users[0];
    return res.json({
      success: true,
      message: 'Logged in successfully!',
      firstName: user.first_name,
      email: user.email,
      role: user.role,
      storeName: user.store_name
    });
  } catch (error) {
    console.error('Error during login:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred during sign in. Please try again later.'
    });
  }
});

// 3. Reset Password Route
router.post('/reset-password', async (req, res) => {
  try {
    const { email, phone, newPassword } = req.body;

    if (!email || !phone || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required.'
      });
    }

    // Check if user exists with matching email and phone
    const [users] = await db.query(
      'SELECT id FROM users WHERE email = ? AND phone = ?',
      [email.toLowerCase(), phone]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email and phone number.'
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long.'
      });
    }

    const hashedPassword = hashPassword(newPassword);
    await db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, users[0].id]);

    return res.json({
      success: true,
      message: 'Password reset successfully!'
    });
  } catch (error) {
    console.error('Error during password reset:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred during password reset. Please try again later.'
    });
  }
});

// 4. Get Profile Route
router.get('/profile', async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email parameter is required.'
      });
    }

    const [users] = await db.query(
      'SELECT first_name, last_name, phone, email, role, store_name, created_at FROM users WHERE email = ?',
      [email.toLowerCase()]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found.'
      });
    }

    const user = users[0];
    return res.json({
      success: true,
      profile: {
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        email: user.email,
        role: user.role,
        storeName: user.store_name,
        createdAt: user.created_at
      }
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while fetching user profile.'
    });
  }
});

// 5. Get All Vendors Route (Multivendor Directory)
router.get('/vendors', async (req, res) => {
  try {
    const [vendors] = await db.query(`
      SELECT u.id, u.first_name, u.last_name, u.store_name, u.email, u.phone, u.created_at, COUNT(p.id) AS product_count 
      FROM users u 
      LEFT JOIN products p ON p.vendor_id = u.id 
      WHERE u.role = 'vendor' AND u.store_name IS NOT NULL
      GROUP BY u.id
      ORDER BY u.store_name ASC
    `);

    return res.json({
      success: true,
      vendors: vendors.map(v => ({
        id: v.id,
        firstName: v.first_name,
        lastName: v.last_name,
        storeName: v.store_name,
        email: v.email,
        phone: v.phone,
        createdAt: v.created_at,
        productCount: v.product_count
      }))
    });
  } catch (error) {
    console.error('Error fetching vendors:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while fetching vendors.'
    });
  }
});

module.exports = router;
