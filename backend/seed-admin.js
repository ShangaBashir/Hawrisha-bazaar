/**
 * Seed Admin Account
 * Run: node backend/seed-admin.js
 *
 * This creates the admin account in the database.
 * Admin credentials:
 *   Email:    admin@hhawrisha.com
 *   Password: Hawrisha@2024
 */

const db = require('./config/db');
const crypto = require('crypto');

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

async function seedAdmin() {
  const adminEmail    = 'admin@hhawrisha.com';
  const adminPassword = 'Hawrisha@2024';
  const hashedPw      = hashPassword(adminPassword);

  try {
    // Check if admin already exists
    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [adminEmail]);

    if (existing.length > 0) {
      // Update the password to make sure it's current
      await db.query('UPDATE users SET password = ?, role = ? WHERE email = ?', [hashedPw, 'admin', adminEmail]);
      console.log('✅ Admin account already exists — password refreshed.');
    } else {
      // Insert new admin (phone is a placeholder since it's required by schema)
      await db.query(
        'INSERT INTO users (first_name, last_name, phone, email, password, role, store_name) VALUES (?, ?, ?, ?, ?, ?, ?)',
        ['Admin', 'Hawrisha', '+9647700000000', adminEmail, hashedPw, 'admin', null]
      );
      console.log('✅ Admin account created successfully!');
    }

    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  Dashboard URL : http://localhost:5173/dashboard');
    console.log('  Email         : admin@hhawrisha.com');
    console.log('  Password      : Hawrisha@2024');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding admin:', err.message);
    process.exit(1);
  }
}

seedAdmin();
