const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Booking = require('../models/Booking');
const Court = require('../models/Court');
const Tournament = require('../models/Tournament');

router.get('/stats', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const [myBookings, myTournaments] = await Promise.all([
      Booking.countDocuments({ user: userId }),
      Tournament.countDocuments({ 'participants.user': userId })
    ]);
    const upcomingBookings = await Booking.countDocuments({
      user: userId, date: { $gte: new Date() }, status: { $in: ['pending', 'confirmed'] }
    });
    res.json({ status: 'success', data: { stats: { myBookings, myTournaments, upcomingBookings } } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

module.exports = router;
