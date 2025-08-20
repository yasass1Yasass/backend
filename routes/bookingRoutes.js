// backend/routes/bookingRoutes.js
const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

// POST /api/bookings - create booking and notify artist
router.post('/', bookingController.createBooking);

// GET /api/bookings/notifications?user_id= - get notifications for user
router.get('/notifications', bookingController.getNotifications);

module.exports = router;
