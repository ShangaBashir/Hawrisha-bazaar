const express = require('express');
const router = express.Router();
const db = require('../config/db');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'test@gmail.com',
    pass: process.env.EMAIL_PASS || 'password'
  }
});

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

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

    // 2. Email format check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email address'
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
      lastName: lastName,
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

    // Fetch user
    const [users] = await db.query(
      'SELECT first_name, last_name, email, role, store_name, password FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password. Please verify your credentials.'
      });
    }

    const user = users[0];
    let isMatch = false;

    // Check if the stored password is a bcrypt hash
    if (user.password && (user.password.startsWith('$2a$') || user.password.startsWith('$2b$'))) {
      isMatch = await bcrypt.compare(password, user.password);
    } else {
      // Fallback to legacy SHA-256 hash
      const hashedPassword = hashPassword(password);
      isMatch = (hashedPassword === user.password);
    }

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password. Please verify your credentials.'
      });
    }

    return res.json({
      success: true,
      message: 'Logged in successfully!',
      firstName: user.first_name,
      lastName: user.last_name,
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

// 3. Forgot Password Route (OTP)
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

    const [users] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'No account found with this email' });
    }

    const userId = users[0].id;
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Invalidate previous codes
    await db.query('UPDATE password_reset_verifications SET used = TRUE WHERE user_id = ? AND used = FALSE', [userId]);

    await db.query(
      'INSERT INTO password_reset_verifications (user_id, email, verification_code, expires_at) VALUES (?, ?, ?, ?)',
      [userId, email, otp, expiresAt]
    );

    // Send Email
    try {
      const info = await transporter.sendMail({
        from: `"Hawrisha Bazaar" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Password Reset Verification Code',
        html: `<p>Your verification code is: <strong>${otp}</strong></p><p>This code expires in 10 minutes.</p>`
      });
      console.log(`[DEV MODE] OTP sent to ${email} is ${otp}. MessageId: ${info.messageId}`);
    } catch (err) {
      console.error('Email send error:', err);
      // Fallback: log to console if email fails
      console.log(`[DEV MODE] SMTP failed. OTP for ${email} is ${otp}`);
    }

    return res.json({ success: true, message: 'Verification code sent' });
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 3.1 Verify Code
router.post('/verify-code', async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) return res.status(400).json({ success: false, message: 'Email and code are required' });

    const [records] = await db.query(
      'SELECT * FROM password_reset_verifications WHERE email = ? AND used = FALSE ORDER BY created_at DESC LIMIT 1',
      [email]
    );

    if (records.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid or expired code' });
    }

    const record = records[0];

    if (record.attempts >= 5) {
      await db.query('UPDATE password_reset_verifications SET used = TRUE WHERE id = ?', [record.id]);
      return res.status(400).json({ success: false, message: 'Too many failed attempts. Please request a new code.' });
    }

    if (new Date() > new Date(record.expires_at)) {
      await db.query('UPDATE password_reset_verifications SET used = TRUE WHERE id = ?', [record.id]);
      return res.status(400).json({ success: false, message: 'Verification code has expired' });
    }

    if (record.verification_code !== code) {
      await db.query('UPDATE password_reset_verifications SET attempts = attempts + 1 WHERE id = ?', [record.id]);
      return res.status(400).json({ success: false, message: 'Incorrect verification code' });
    }

    return res.json({ success: true, message: 'Code verified successfully' });
  } catch (error) {
    console.error('Verify code error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 3.2 Resend Code
router.post('/resend-code', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

    const [users] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'No account found with this email' });
    }

    const userId = users[0].id;
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await db.query('UPDATE password_reset_verifications SET used = TRUE WHERE user_id = ? AND used = FALSE', [userId]);

    await db.query(
      'INSERT INTO password_reset_verifications (user_id, email, verification_code, expires_at) VALUES (?, ?, ?, ?)',
      [userId, email, otp, expiresAt]
    );

    // Send Email
    try {
      const info = await transporter.sendMail({
        from: `"Hawrisha Bazaar" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Password Reset Verification Code',
        html: `<p>Your verification code is: <strong>${otp}</strong></p><p>This code expires in 10 minutes.</p>`
      });
      console.log(`[DEV MODE] New OTP sent to ${email} is ${otp}. MessageId: ${info.messageId}`);
    } catch (err) {
      console.error('Email send error:', err);
      console.log(`[DEV MODE] SMTP failed. New OTP for ${email} is ${otp}`);
    }

    return res.json({ success: true, message: 'A new code has been sent' });
  } catch (error) {
    console.error('Resend code error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 3.3 Reset Password Route (Final Step)
router.post('/reset-password', async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required.'
      });
    }

    const [records] = await db.query(
      'SELECT * FROM password_reset_verifications WHERE email = ? AND verification_code = ? AND used = FALSE ORDER BY created_at DESC LIMIT 1',
      [email, code]
    );

    if (records.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid or expired session' });
    }

    const record = records[0];

    if (new Date() > new Date(record.expires_at)) {
      return res.status(400).json({ success: false, message: 'Verification code expired' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long.'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    await db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, record.user_id]);
    await db.query('UPDATE password_reset_verifications SET used = TRUE WHERE user_id = ?', [record.user_id]);

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

// 4.5 Update Profile Route
router.put('/profile', async (req, res) => {
  try {
    const { email, firstName, lastName, phone } = req.body;

    if (!email || !firstName || !lastName || !phone) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required.'
      });
    }

    const cleanPhone = phone.replace(/\D/g, '');
    if (!phone.startsWith('+964') || cleanPhone.length !== 13) {
      return res.status(400).json({
        success: false,
        message: 'Phone number must start with +964 and contain exactly 10 digits.'
      });
    }

    const [users] = await db.query(
      'SELECT id FROM users WHERE email = ?',
      [email.toLowerCase()]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found.'
      });
    }

    await db.query(
      'UPDATE users SET first_name = ?, last_name = ?, phone = ? WHERE id = ?',
      [firstName, lastName, phone, users[0].id]
    );

    return res.json({
      success: true,
      message: 'Profile updated successfully!',
      profile: {
        firstName,
        lastName,
        phone,
        email
      }
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while updating user profile.'
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

// 6. Contact Form Submission Route
router.post('/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    console.log('DEBUG: EMAIL_USER =', process.env.EMAIL_USER, 'EMAIL_PASS =', process.env.EMAIL_PASS ? '***' + process.env.EMAIL_PASS.slice(-4) : 'undefined');

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and message are required.'
      });
    }

    // 1. Save to Database
    await db.query(
      'INSERT INTO contact_messages (name, email, message) VALUES (?, ?, ?)',
      [name, email, message]
    );

    let emailSent = false;

    // 2. Attempt to Send Direct Email via Nodemailer (Gmail App Password)
    try {
      if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        await transporter.sendMail({
          from: `"Hawrisha Contact" <${process.env.EMAIL_USER}>`,
          to: 'hawrishaa@gmail.com',
          replyTo: email,
          subject: `Hawrisha Bazaar - Contact Message from ${name}`,
          text: `You have received a new contact message from Hawrisha Bazaar:\n\nName: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
          html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #36454F;">
              <h2 style="color: #B2AC88; border-bottom: 2px solid #B2AC88; padding-bottom: 8px;">Hawrisha Bazaar - New Contact Message</h2>
              <p><strong>From Name:</strong> ${name}</p>
              <p><strong>Reply Email:</strong> <a href="mailto:${email}">${email}</a></p>
              <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb; margin-top: 15px;">
                <p style="white-space: pre-wrap; font-size: 14px; color: #1f2937; margin: 0;">${message}</p>
              </div>
            </div>
          `
        });
        console.log('✅ Contact email successfully sent to hawrishaa@gmail.com via Nodemailer.');

        // Send confirmation receipt email copy to the customer as well
        await transporter.sendMail({
          from: `"Hawrisha Bazaar Support" <${process.env.EMAIL_USER}>`,
          to: email,
          subject: `Thank you for contacting Hawrisha Bazaar`,
          text: `Hello ${name},\n\nThank you for reaching out to Hawrisha Bazaar! We have received your message and our team will get back to you shortly.\n\nYour message:\n"${message}"\n\nBest regards,\nHawrisha Bazaar Team`,
          html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #36454F;">
              <h2 style="color: #B2AC88; border-bottom: 2px solid #B2AC88; padding-bottom: 8px;">Hawrisha Bazaar - Message Received</h2>
              <p>Hello <strong>${name}</strong>,</p>
              <p>Thank you for contacting us! We have received your message and will respond as soon as possible.</p>
              <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb; margin-top: 15px;">
                <p style="font-size: 12px; color: #6b7280; margin-bottom: 5px;">Your message summary:</p>
                <p style="white-space: pre-wrap; font-size: 14px; color: #1f2937; margin: 0;">${message}</p>
              </div>
              <p style="margin-top: 20px; font-size: 13px; color: #6b7280;">Warm regards,<br/>Hawrisha Bazaar Team</p>
            </div>
          `
        }).catch(err => console.warn('Customer confirmation email copy failed:', err.message));

        emailSent = true;
      }
    } catch (nodemailerErr) {
      console.warn('⚠️ Nodemailer send failed, trying FormSubmit fallback:', nodemailerErr.message);
    }

    // 3. Fallback to FormSubmit if Nodemailer failed
    if (!emailSent) {
      try {
        const response = await fetch('https://formsubmit.co/ajax/hawrishaa@gmail.com', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            name,
            email,
            message,
            _subject: `Hawrisha Bazaar - Contact Message from ${name}`
          })
        });
        if (response.ok) {
          console.log('✅ Contact email successfully forwarded via FormSubmit.');
          emailSent = true;
        }
      } catch (formSubmitErr) {
        console.warn('⚠️ FormSubmit fallback send failed:', formSubmitErr.message);
      }
    }

    return res.json({
      success: true,
      emailSent,
      message: 'Message sent successfully.'
    });
  } catch (error) {
    console.error('Error saving/sending contact message:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while saving your message. Please try again later.'
    });
  }
});

// 7. Get All Contact Messages (Admin Only)
router.get('/contact-messages', async (req, res) => {
  try {
    const [messages] = await db.query('SELECT * FROM contact_messages ORDER BY created_at DESC');
    return res.json({
      success: true,
      messages
    });
  } catch (error) {
    console.error('Error fetching contact messages:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while fetching contact messages.'
    });
  }
});

// 8. Delete Contact Message (Admin Only)
router.delete('/contact-messages/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM contact_messages WHERE id = ?', [id]);
    return res.json({
      success: true,
      message: 'Message deleted successfully.'
    });
  } catch (error) {
    console.error('Error deleting contact message:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while deleting the message.'
    });
  }
});

module.exports = router;
