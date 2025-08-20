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
// Simple CORS configuration - allow all origins
app.use(cors({
    origin: true, // Allow all origins
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Origin', 'Accept', 'Content-Type', 'Authorization', 'x-auth-token', 'X-Requested-With']
}));
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