// backend/controllers/gigRequestController.js
const db = require('../config/db');

// Artist requests to join a gig
exports.requestGig = async (req, res) => {
  try {
    const { gigId } = req.params;
    const artistId = req.user.id;
    // Find gig and host
    const [gigRows] = await db.query('SELECT * FROM gigs WHERE id = ?', [gigId]);
    if (!gigRows.length) return res.status(404).json({ message: 'Gig not found' });
  const gig = gigRows[0];
  // Find performer internal ID from user ID
  const [performerRows] = await db.query('SELECT id FROM performers WHERE user_id = ?', [artistId]);
  if (!performerRows.length) return res.status(404).json({ message: 'Performer not found' });
  const performerId = performerRows[0].id;
  // Insert request using performerId
  await db.query('INSERT INTO gig_requests (gig_id, performer_id, status) VALUES (?, ?, ?)', [gigId, performerId, 'pending']);
    // Notify host
    const [hostRows] = await db.query('SELECT user_id FROM hosts WHERE id = ?', [gig.host_id]);
    if (!hostRows.length) return res.status(404).json({ message: 'Host not found' });
    const hostUserId = hostRows[0].user_id;
    // Get artist username
    const [artistRows] = await db.query('SELECT username FROM users WHERE id = ?', [artistId]);
    const artistName = artistRows.length ? artistRows[0].username : `Artist #${artistId}`;
    const notifText = `${artistName} requested to join your gig '${gig.title}'. Accept or reject?`;
    await db.query('INSERT INTO notifications (user_id, type, text, is_read) VALUES (?, ?, ?, 0)', [hostUserId, 'gig_request', notifText]);
    res.status(201).json({ message: 'Request sent and host notified.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Host responds to request
exports.respondToRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { response } = req.body; // 'accepted' or 'rejected'
    // Update request status
    const [result] = await db.query('UPDATE gig_requests SET status = ? WHERE id = ?', [response, requestId]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Request not found' });
    // Get artist_id, gig_id
    const [reqRows] = await db.query('SELECT artist_id, gig_id FROM gig_requests WHERE id = ?', [requestId]);
    if (!reqRows.length) return res.status(404).json({ message: 'Request not found' });
    const { artist_id, gig_id } = reqRows[0];
    // Get gig and host
    const [gigRows] = await db.query('SELECT title, host_id FROM gigs WHERE id = ?', [gig_id]);
    if (!gigRows.length) return res.status(404).json({ message: 'Gig not found' });
    const gig = gigRows[0];
    // Notify artist if accepted
    if (response === 'accepted') {
      const notifText = `Host confirmed you for the gig '${gig.title}'.`;
      await db.query('INSERT INTO notifications (user_id, type, text, is_read) VALUES (?, ?, ?, 0)', [artist_id, 'gig_request', notifText]);
    }
    res.json({ message: 'Response recorded.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
