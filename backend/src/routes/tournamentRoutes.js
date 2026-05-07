const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/authMiddleware');
const ctrl = require('../controllers/tournamentController');

router.get('/', ctrl.getAllTournaments);
router.get('/:id', ctrl.getTournament);
router.use(protect);
router.post('/', restrictTo('admin', 'owner'), ctrl.createTournament);
router.patch('/:id', ctrl.updateTournament);
router.delete('/:id', ctrl.deleteTournament);
router.post('/:id/join', ctrl.joinTournament);
router.delete('/:id/leave', ctrl.leaveTournament);

module.exports = router;
