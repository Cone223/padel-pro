const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/authMiddleware');
const admin = require('../controllers/adminController');

router.use(protect, restrictTo('admin'));

router.get('/stats', admin.getStats);
router.get('/users', admin.getUsers);
router.patch('/users/:id/toggle-status', admin.toggleUserStatus);
router.patch('/users/:id/role', admin.changeUserRole);
router.delete('/users/:id', admin.deleteUser);
router.get('/bookings', admin.getAllBookings);
router.patch('/bookings/:id/status', admin.updateBookingStatus);
router.get('/courts', admin.getAllCourts);
router.patch('/courts/:id/toggle', admin.toggleCourtStatus);
router.delete('/courts/:id', admin.deleteCourt);

module.exports = router;
