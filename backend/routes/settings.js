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

module.exports = router;
