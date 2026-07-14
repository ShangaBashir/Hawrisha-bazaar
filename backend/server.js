const express = require('express');
const cors = require('cors');
const path = require('path');
const productRoutes = require('./routes/products');
const settingsRoutes = require('./routes/settings');
const authRoutes = require('./routes/auth');
const storeRoutes = require('./routes/stores');
const orderRoutes = require('./routes/orders');
const userDataRoutes = require('./routes/user_data');
const initializeDatabase = require('./config/initDb');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

// Initialize MySQL tables and default seeds
initializeDatabase();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static images stored on server
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/products', productRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/user_data', userDataRoutes);


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
