require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

// Database connection
const { initDatabase, getConnection } = require('./db/connection');

// Routes
const publicRoutes = require('./routes/public');
const adminRoutes = require('./routes/admin');

// Middleware
const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(morgan('combined'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Initialize database
initDatabase().then(() => {
  console.log('✓ Database connected');
}).catch(err => {
  console.error('✗ Database connection failed:', err.message);
});

// Routes
app.use('/api/v1/public', publicRoutes);
app.use('/api/v1/admin', adminRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✓ Server running on port ${PORT}`);
});

module.exports = app;