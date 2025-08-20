// backend/controllers/bookingController.js
const db = require('../config/db');

// Create a booking and notify the artist
exports.createBooking = async (req, res) => {
  try {
    const { artist_id, host_id, event_date, event_time, event_location, notes } = req.body;
    if (!artist_id || !host_id || !event_date || !event_time || !event_location) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    let connection;
    try {
      connection = await db.getConnection();
      await connection.beginTransaction();
      
      // Insert booking
      const [bookingResult] = await connection.execute(
        'INSERT INTO bookings (artist_id, host_id, event_date, event_time, event_location, notes) VALUES (?, ?, ?, ?, ?, ?)',
        [artist_id, host_id, event_date, event_time, event_location, notes || '']
      );
      console.log('Booking inserted:', bookingResult);
      
      const bookingId = bookingResult.insertId;
      
      // Create notification matching the trigger format
      const notificationTitle = 'New booking received';
      const notificationMessage = `You were booked${
        event_date ? ` for ${event_date}` : ''
      }${
        event_location ? ` at ${event_location}` : ''
      }.`;
      
      const [notifResult] = await connection.execute(
        `INSERT INTO notifications (
          user_id, type, actor_user_id, booking_id, title, message, is_read, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [artist_id, 'booking', host_id, bookingId, notificationTitle, notificationMessage, 0]
      );
      
      console.log('Notification inserted for artist_id:', artist_id, notifResult);
      
      await connection.commit();
      res.status(201).json({ message: 'Booking created and artist notified' });
      
    } catch (error) {
      if (connection) {
        await connection.rollback();
      }
      console.error('Transaction failed:', error);
      res.status(500).json({ message: 'Booking creation failed', error: error.message });
    } finally {
      if (connection) {
        connection.release();
      }
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get notifications for a user (artist or host)
exports.getNotifications = async (req, res) => {
  try {
    const { user_id } = req.query;
    if (!user_id) return res.status(400).json({ message: 'Missing user_id' });
    const [rows] = await db.execute(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC',
      [user_id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
