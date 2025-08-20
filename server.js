// backend/server.js

require('dotenv').config(); // Load environment variables from .env file

const express = require('express');
const cors = require('cors'); // Import cors
const app = express();
const path = require('path'); // Import path module

// Route imports - These MUST be declared before use
const authRoutes = require('./routes/authRoutes');
const performerRoutes = require('./routes/performerRoutes');
const hostRoutes = require('./routes/hostRoutes');
const adminRoutes = require('./routes/adminRoutes');
const gigRoutes = require('./routes/gigRoutes');
const gigRequestRoutes = require('./routes/gigRequestRoutes');
const chatRoutes = require('./routes/chatRoutes');
const bookingRoutes = require('./routes/bookingRoutes');

// Middleware
// CORS configuration with allowlist for local and production frontends
const envList = (process.env.CORS_ORIGINS || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

const allowedOrigins = [
    ...envList,
    process.env.FRONTEND_URL,
    process.env.FRONTEND_URL_2,
    'http://localhost:5173',
    'https://gigs-lk.vercel.app',
    'https://gigs-lk-git-giglk-main-yasassris-projects.vercel.app'
].filter(Boolean);

// Allow Vercel preview deployments for this project pattern
const allowedOriginPatterns = [
    /^https:\/\/gigs-lk.*\.vercel\.app$/
];

const corsOptions = {
    origin: (origin, callback) => {
        // Allow non-browser requests or same-origin (no origin header)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        if (allowedOriginPatterns.some(rx => rx.test(origin))) return callback(null, true);
        return callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Origin', 'Accept', 'Content-Type', 'Authorization', 'x-auth-token', 'X-Requested-With'],
    preflightContinue: false,
    optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
// Explicitly handle preflight across all routes
app.options('*', cors(corsOptions));
// Ensure credentials header is present when needed
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Credentials', 'true');
    next();
});
app.use(express.json()); // To parse JSON request bodies

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Main route
app.get('/', (req, res) => {
    res.send('Gigs.lk Backend is running!');
});

// Test endpoint to verify static file serving
app.get('/test-uploads', (req, res) => {
    res.json({
        message: 'Uploads directory test',
        uploadsPath: path.join(__dirname, 'uploads'),
        files: require('fs').readdirSync(path.join(__dirname, 'uploads')).slice(0, 5) // Show first 5 files
    });
});

// Route mounting
app.use('/api/auth', authRoutes);
app.use('/api/performers', performerRoutes);
app.use('/api/hosts', hostRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/gigs', gigRoutes);
app.use('/api/gig-requests', gigRequestRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/bookings', bookingRoutes);

const PORT = process.env.PORT || 5001;

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});