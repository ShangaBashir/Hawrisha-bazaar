require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const productRoutes = require('./routes/products');
const settingsRoutes = require('./routes/settings');
const authRoutes = require('./routes/auth');
const storeRoutes = require('./routes/stores');
const orderRoutes = require('./routes/orders');
const userDataRoutes = require('./routes/user_data');
const locationRoutes = require('./routes/locations');
const initializeDatabase = require('./config/initDb');

const app = express();
const PORT = process.env.PORT || 5001;

// Initialize MySQL tables and default seeds
initializeDatabase();

app.use(cors());

// Only apply JSON/urlencoded parsers for non-multipart requests
// Multipart (file uploads) must be handled exclusively by multer
app.use((req, res, next) => {
  const ct = req.headers['content-type'] || '';
  if (ct.includes('multipart/form-data')) return next(); // skip - let multer handle
  express.json()(req, res, (err) => {
    if (err) return next(err);
    express.urlencoded({ extended: true })(req, res, next);
  });
});

// Serve static images stored on server
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/categories', express.static(path.join(__dirname, '../hawrisha-frontend/public/categories')));
app.use('/bestsellers', express.static(path.join(__dirname, '../hawrisha-frontend/public/bestsellers')));
app.use('/carousel', express.static(path.join(__dirname, '../hawrisha-frontend/public/carousel')));
app.use('/products', express.static(path.join(__dirname, '../hawrisha-frontend/public/products')));
app.use(express.static(path.join(__dirname, '../hawrisha-frontend/public')));

// Routes
app.use('/api/products', productRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/user_data', userDataRoutes);
app.use('/api/locations', locationRoutes);


// General healthcheck endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend service is online' });
});

// Serve static frontend files from Vite build
app.use(express.static(path.join(__dirname, '../dist')));

// Fallback to index.html for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Node Express Server active on port ${PORT}`);
});
