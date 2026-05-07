const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/authMiddleware');
const ctrl = require('../controllers/bookingController');

router.get('/availability', ctrl.getAvailability);
router.use(protect);
router.post('/', ctrl.createBooking);
router.get('/my-bookings', ctrl.getMyBookings);
router.get('/court-bookings', restrictTo('owner', 'admin'), ctrl.getCourtBookings);
router.get('/:id', ctrl.getBooking);
router.patch('/:id/cancel', ctrl.cancelBooking);

module.exports = router;
