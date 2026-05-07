const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const ctrl = require('../controllers/userController');

router.post('/register', ctrl.register);
router.post('/login', ctrl.login);
router.get('/profile', protect, ctrl.getProfile);
router.patch('/profile', protect, ctrl.updateProfile);
router.patch('/change-password', protect, ctrl.changePassword);

module.exports = router;
