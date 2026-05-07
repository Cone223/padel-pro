const express = require('express');
const {
  getMySubscription,
  upgradeSubscription,
  cancelSubscription,
  reactivateSubscription
} = require('../controllers/subscriptionController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

// Todas las rutas están protegidas y solo para owners
router.use(protect);
router.use(restrictTo('owner'));

router.get('/my-subscription', getMySubscription);
router.patch('/upgrade', upgradeSubscription);
router.patch('/cancel', cancelSubscription);
router.patch('/reactivate', reactivateSubscription);

module.exports = router;