const express = require('express');
const router = express.Router();
const db = require('../config/db');

// --- 1. CATEGORIES CRUD ---

// Get all categories
router.get('/categories', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM categories ORDER BY name ASC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add new category
router.post('/categories', async (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Category name is required' });
  }
  try {
    const [result] = await db.query('INSERT INTO categories (name) VALUES (?)', [name.trim()]);
    res.status(201).json({ id: result.insertId, name: name.trim() });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Category already exists' });
    }
    res.status(500).json({ error: error.message });
  }
});

// Delete a category
router.delete('/categories/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // Optional check: are there products using this category?
    // We won't block it, or we can just let it delete.
    await db.query('DELETE FROM categories WHERE id = ?', [id]);
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a category
router.put('/categories/:id', async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Category name is required' });
  }
  try {
    await db.query('UPDATE categories SET name = ? WHERE id = ?', [name.trim(), id]);
    res.json({ id, name: name.trim() });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Category already exists' });
    }
    res.status(500).json({ error: error.message });
  }
});


// --- 2. BADGES CRUD ---

// Get all badges
router.get('/badges', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM badges ORDER BY name ASC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add new badge
router.post('/badges', async (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Badge name is required' });
  }
  try {
    const [result] = await db.query('INSERT INTO badges (name) VALUES (?)', [name.trim()]);
    res.status(201).json({ id: result.insertId, name: name.trim() });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Badge already exists' });
    }
    res.status(500).json({ error: error.message });
  }
});

// Delete a badge
router.delete('/badges/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM badges WHERE id = ?', [id]);
    res.json({ message: 'Badge deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a badge
router.put('/badges/:id', async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: 'Badge name is required' });
  try {
    await db.query('UPDATE badges SET name = ? WHERE id = ?', [name.trim(), id]);
    res.json({ id, name: name.trim() });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return res.status(400).json({ error: 'Badge already exists' });
    res.status(500).json({ error: error.message });
  }
});


// --- 3. COLORS CRUD ---

// Get all colors
router.get('/colors', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM colors ORDER BY name ASC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add new color
router.post('/colors', async (req, res) => {
  const { id, class: colorClass, name, family } = req.body;
  if (!id || !colorClass || !name || !family) {
    return res.status(400).json({ error: 'Color ID, CSS class, Name, and Family are required' });
  }
  try {
    await db.query(
      'INSERT INTO colors (id, class, name, family) VALUES (?, ?, ?, ?)',
      [id.trim().toLowerCase(), colorClass.trim(), name.trim(), family.trim().toLowerCase()]
    );
    res.status(201).json({ id, class: colorClass, name, family });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Color ID already exists' });
    }
    res.status(500).json({ error: error.message });
  }
});

// Delete a color
router.delete('/colors/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM colors WHERE id = ?', [id]);
    res.json({ message: 'Color deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a color
router.put('/colors/:id', async (req, res) => {
  const { id: oldId } = req.params;
  const { id, class: colorClass, name, family } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Color Name is required' });
  }
  const targetId = (id || oldId).trim().toLowerCase();
  const targetClass = colorClass ? colorClass.trim() : 'bg-[#000000]';
  const targetFamily = (family && family.trim()) ? family.trim().toLowerCase() : 'black';
  try {
    const [result] = await db.query(
      'UPDATE colors SET class = ?, name = ?, family = ? WHERE id = ? OR id = ?',
      [targetClass, name.trim(), targetFamily, oldId, targetId]
    );
    if (result.affectedRows === 0) {
      await db.query(
        'INSERT INTO colors (id, class, name, family) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE class = ?, name = ?, family = ?',
        [targetId, targetClass, name.trim(), targetFamily, targetClass, name.trim(), targetFamily]
      );
    }
    res.json({ id: targetId, class: targetClass, name: name.trim(), family: targetFamily });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return res.status(400).json({ error: 'Color ID already exists' });
    res.status(500).json({ error: error.message });
  }
});

// --- 4. STYLES CRUD ---
router.get('/styles', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM styles ORDER BY name ASC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/styles', async (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Style name is required' });
  }
  try {
    const [result] = await db.query('INSERT INTO styles (name) VALUES (?)', [name.trim()]);
    res.status(201).json({ id: result.insertId, name: name.trim() });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Style already exists' });
    }
    res.status(500).json({ error: error.message });
  }
});

router.delete('/styles/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM styles WHERE id = ?', [id]);
    res.json({ message: 'Style deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/styles/:id', async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: 'Style name is required' });
  try {
    await db.query('UPDATE styles SET name = ? WHERE id = ?', [name.trim(), id]);
    res.json({ id, name: name.trim() });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return res.status(400).json({ error: 'Style already exists' });
    res.status(500).json({ error: error.message });
  }
});


// --- 5. MATERIALS CRUD ---
router.get('/materials', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM materials ORDER BY name ASC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/materials', async (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Material name is required' });
  }
  try {
    const [result] = await db.query('INSERT INTO materials (name) VALUES (?)', [name.trim()]);
    res.status(201).json({ id: result.insertId, name: name.trim() });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Material already exists' });
    }
    res.status(500).json({ error: error.message });
  }
});

router.delete('/materials/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM materials WHERE id = ?', [id]);
    res.json({ message: 'Material deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/materials/:id', async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: 'Material name is required' });
  try {
    await db.query('UPDATE materials SET name = ? WHERE id = ?', [name.trim(), id]);
    res.json({ id, name: name.trim() });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return res.status(400).json({ error: 'Material already exists' });
    res.status(500).json({ error: error.message });
  }
});


// --- 6. SEASONS CRUD ---
router.get('/seasons', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM seasons ORDER BY name ASC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/seasons', async (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Season name is required' });
  }
  try {
    const [result] = await db.query('INSERT INTO seasons (name) VALUES (?)', [name.trim()]);
    res.status(201).json({ id: result.insertId, name: name.trim() });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Season already exists' });
    }
    res.status(500).json({ error: error.message });
  }
});

router.delete('/seasons/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM seasons WHERE id = ?', [id]);
    res.json({ message: 'Season deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/seasons/:id', async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: 'Season name is required' });
  try {
    await db.query('UPDATE seasons SET name = ? WHERE id = ?', [name.trim(), id]);
    res.json({ id, name: name.trim() });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return res.status(400).json({ error: 'Season already exists' });
    res.status(500).json({ error: error.message });
  }
});


// --- 7. SIZES CRUD ---
router.get('/sizes', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM sizes ORDER BY name ASC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/sizes', async (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Size name is required' });
  }
  try {
    const [result] = await db.query('INSERT INTO sizes (name) VALUES (?)', [name.trim()]);
    res.status(201).json({ id: result.insertId, name: name.trim() });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Size already exists' });
    }
    res.status(500).json({ error: error.message });
  }
});

router.delete('/sizes/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM sizes WHERE id = ?', [id]);
    res.json({ message: 'Size deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/sizes/:id', async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: 'Size name is required' });
  try {
    await db.query('UPDATE sizes SET name = ? WHERE id = ?', [name.trim(), id]);
    res.json({ id, name: name.trim() });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return res.status(400).json({ error: 'Size already exists' });
    res.status(500).json({ error: error.message });
  }
});


// --- 8. PROMOTIONS CRUD ---
router.get('/promotions', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM promotions ORDER BY name ASC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/promotions', async (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Promotion name is required' });
  }
  try {
    const [result] = await db.query('INSERT INTO promotions (name) VALUES (?)', [name.trim()]);
    res.status(201).json({ id: result.insertId, name: name.trim() });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Promotion already exists' });
    }
    res.status(500).json({ error: error.message });
  }
});

router.delete('/promotions/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM promotions WHERE id = ?', [id]);
    res.json({ message: 'Promotion deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/promotions/:id', async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: 'Promotion name is required' });
  try {
    await db.query('UPDATE promotions SET name = ? WHERE id = ?', [name.trim(), id]);
    res.json({ id, name: name.trim() });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return res.status(400).json({ error: 'Promotion already exists' });
    res.status(500).json({ error: error.message });
  }
});

// --- 10. DESIGNS CRUD ---
router.get('/designs', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM designs ORDER BY name ASC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/designs', async (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: 'Design name is required' });
  try {
    const [result] = await db.query('INSERT INTO designs (name) VALUES (?)', [typeof name === 'string' ? name.trim() : JSON.stringify(name)]);
    res.json({ id: result.insertId, name });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return res.status(400).json({ error: 'Design already exists' });
    res.status(500).json({ error: error.message });
  }
});

router.delete('/designs/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM designs WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/designs/:id', async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Design name is required' });
  try {
    const nameVal = typeof name === 'string' ? name.trim() : JSON.stringify(name);
    await db.query('UPDATE designs SET name = ? WHERE id = ?', [nameVal, id]);
    res.json({ id, name });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- 11. SPORT TYPES CRUD ---
router.get('/sport-types', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM sport_types ORDER BY name ASC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/sport-types', async (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: 'Sport type name is required' });
  try {
    const [result] = await db.query('INSERT INTO sport_types (name) VALUES (?)', [typeof name === 'string' ? name.trim() : JSON.stringify(name)]);
    res.json({ id: result.insertId, name });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return res.status(400).json({ error: 'Sport type already exists' });
    res.status(500).json({ error: error.message });
  }
});

router.delete('/sport-types/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM sport_types WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/sport-types/:id', async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Sport type name is required' });
  try {
    const nameVal = typeof name === 'string' ? name.trim() : JSON.stringify(name);
    await db.query('UPDATE sport_types SET name = ? WHERE id = ?', [nameVal, id]);
    res.json({ id, name });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- 12. SYSTEM SETTINGS ---
// Get all system settings
router.get('/system-settings', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM system_settings');
    const settings = {};
    rows.forEach(r => {
      settings[r.setting_key] = r.setting_value;
    });
    res.json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update/create a system setting
router.post('/system-settings', async (req, res) => {
  const { key, value } = req.body;
  if (!key) {
    return res.status(400).json({ error: 'Setting key is required' });
  }
  try {
    await db.query(
      'INSERT INTO system_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?',
      [key, String(value), String(value)]
    );
    res.json({ success: true, message: `Setting ${key} updated successfully` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- 10. CITIES CRUD ---

// Get all cities
router.get('/cities', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM cities ORDER BY id DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const fallbackCoordinates = {
  baghdad: { lat: 33.3152, lng: 44.3661 },
  erbil: { lat: 36.1901, lng: 44.0093 },
  sulaymaniyah: { lat: 35.5620, lng: 45.4372 },
  duhok: { lat: 36.8665, lng: 42.9880 },
  kirkuk: { lat: 35.4681, lng: 44.3922 },
  basra: { lat: 30.5081, lng: 47.7979 },
  halabja: { lat: 35.1777, lng: 45.9861 },
  najaf: { lat: 31.9961, lng: 44.3250 },
  karbala: { lat: 32.6160, lng: 44.0248 },
  mosul: { lat: 36.3489, lng: 43.1577 },
  nineveh: { lat: 36.3489, lng: 43.1577 },
  hillah: { lat: 32.4847, lng: 44.4239 },
  babil: { lat: 32.4847, lng: 44.4239 },
  ramadi: { lat: 33.4216, lng: 43.3032 },
  anbar: { lat: 33.4216, lng: 43.3032 },
  baqubah: { lat: 33.7431, lng: 44.6497 },
  diyala: { lat: 33.7431, lng: 44.6497 },
  tikrit: { lat: 34.6074, lng: 43.6782 },
  "salah al-din": { lat: 34.6074, lng: 43.6782 },
  kut: { lat: 32.5021, lng: 45.8177 },
  wasit: { lat: 32.5021, lng: 45.8177 },
  amarah: { lat: 31.8411, lng: 47.1450 },
  maysan: { lat: 31.8411, lng: 47.1450 },
  nasiriyah: { lat: 31.0579, lng: 46.2574 },
  "dhi qar": { lat: 31.0579, lng: 46.2574 },
  samawah: { lat: 31.3120, lng: 45.2808 },
  muthanna: { lat: 31.3120, lng: 45.2808 },
  diwaniyah: { lat: 31.9904, lng: 44.9250 },
  qadisiya: { lat: 31.9904, lng: 44.9250 },
  akre: { lat: 36.7411, lng: 43.8933 }
};

const geocodeCity = async (cityName) => {
  const normalized = cityName.trim().toLowerCase();
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cityName)},Iraq&format=json&limit=1`,
      {
        headers: { 'User-Agent': 'Hawrisha-Socks-App' }
      }
    );
    if (response.ok) {
      const data = await response.json();
      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon)
        };
      }
    }
  } catch (err) {
    console.warn(`Nominatim geocoding failed for ${cityName}, using fallback:`, err.message);
  }

  if (fallbackCoordinates[normalized]) {
    return fallbackCoordinates[normalized];
  }
  return { lat: 33.3152, lng: 44.3661 };
};

// Add new city
router.post('/cities', async (req, res) => {
  const { name, latitude, longitude } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'City name is required' });
  }
  
  let lat = parseFloat(latitude);
  let lng = parseFloat(longitude);
  
  if (isNaN(lat) || isNaN(lng)) {
    const coords = await geocodeCity(name);
    lat = coords.lat;
    lng = coords.lng;
  }
  
  try {
    const [result] = await db.query(
      'INSERT INTO cities (name, latitude, longitude) VALUES (?, ?, ?)',
      [name.trim(), lat, lng]
    );
    res.status(201).json({ id: result.insertId, name: name.trim(), latitude: lat, longitude: lng });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'City already exists' });
    }
    res.status(500).json({ error: error.message });
  }
});

// Edit a city
router.put('/cities/:id', async (req, res) => {
  const { id } = req.params;
  const { name, latitude, longitude } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'City name is required' });
  }
  
  let lat = parseFloat(latitude);
  let lng = parseFloat(longitude);
  
  if (isNaN(lat) || isNaN(lng)) {
    const coords = await geocodeCity(name);
    lat = coords.lat;
    lng = coords.lng;
  }
  
  try {
    await db.query(
      'UPDATE cities SET name = ?, latitude = ?, longitude = ? WHERE id = ?',
      [name.trim(), lat, lng, id]
    );
    res.json({ id: parseInt(id), name: name.trim(), latitude: lat, longitude: lng });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a city
router.delete('/cities/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM cities WHERE id = ?', [id]);
    res.json({ message: 'City deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
