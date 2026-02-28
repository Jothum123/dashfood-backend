const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const app = express();

// Middleware
const allowedOrigins = [
    process.env.FRONTEND_URL,
    'http://localhost:5173',
    'http://localhost:3000'
].filter(Boolean);

app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());

// Log incoming requests
app.use((req, res, next) => {
    console.log(`[API] ${req.method} ${req.url}`);
    next();
});

// API Auth Middleware
const { validateApiKey } = require('./middleware/apiKeyMiddleware');

// Route Modules
const orderRoutes = require('./routes/orderRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const webhookRoutes = require('./routes/webhookRoutes');
const merchantRoutes = require('./routes/merchantRoutes');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require("./routes/admin.routes");

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes); // Uber Manager Replica Layer
app.use('/webhooks', webhookRoutes);

// Health Check
app.get('/health', (req, res) => {
    res.json({ status: 'live', system: 'dashfood-merchant-core' });
});

module.exports = { app, validateApiKey };
