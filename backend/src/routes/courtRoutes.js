const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/authMiddleware');
const ctrl = require('../controllers/courtController');

router.get('/', ctrl.getAllCourts);
router.get('/my-courts', protect, ctrl.getMyCourts);
router.get('/:id', ctrl.getCourt);
router.post('/', protect, restrictTo('admin', 'owner'), ctrl.uploadImages, ctrl.createCourt);
router.patch('/:id', protect, ctrl.uploadImages, ctrl.updateCourt);
router.delete('/:id', protect, ctrl.deleteCourt);

module.exports = router;
