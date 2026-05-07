const Tournament = require('../models/Tournament');

exports.getAllTournaments = async (req, res) => {
  try {
    const { category, status } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (status === 'active') filter.isActive = true;
    const tournaments = await Tournament.find(filter)
      .populate('organizer', 'name email')
      .populate('court', 'name address')
      .sort('startDate');
    res.json({ status: 'success', data: { tournaments } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.getTournament = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id)
      .populate('organizer', 'name email')
      .populate('court', 'name address')
      .populate('participants.user', 'name email');
    if (!tournament) return res.status(404).json({ status: 'error', message: 'Torneo no encontrado.' });
    res.json({ status: 'success', data: { tournament } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.createTournament = async (req, res) => {
  try {
    const tournament = await Tournament.create({ ...req.body, organizer: req.user.id, isActive: true });
    res.status(201).json({ status: 'success', data: { tournament } });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

exports.updateTournament = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament) return res.status(404).json({ status: 'error', message: 'Torneo no encontrado.' });
    if (tournament.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ status: 'error', message: 'No tenés permiso.' });
    }
    const updated = await Tournament.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json({ status: 'success', data: { tournament: updated } });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

exports.deleteTournament = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament) return res.status(404).json({ status: 'error', message: 'Torneo no encontrado.' });
    if (tournament.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ status: 'error', message: 'No tenés permiso.' });
    }
    await Tournament.findByIdAndDelete(req.params.id);
    res.json({ status: 'success', message: 'Torneo eliminado correctamente.' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.joinTournament = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament) return res.status(404).json({ status: 'error', message: 'Torneo no encontrado.' });
    if (!tournament.isActive) return res.status(400).json({ status: 'error', message: 'El torneo no está activo.' });
    if (tournament.currentParticipants >= tournament.maxParticipants) {
      return res.status(400).json({ status: 'error', message: 'El torneo está lleno.' });
    }
    const alreadyJoined = tournament.participants.some(p => p.user?.toString() === req.user.id);
    if (alreadyJoined) return res.status(400).json({ status: 'error', message: 'Ya estás inscripto en este torneo.' });
    tournament.participants.push({ user: req.user.id, partner: req.body.partner });
    tournament.currentParticipants += 1;
    await tournament.save();
    res.json({ status: 'success', data: { tournament } });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

exports.leaveTournament = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament) return res.status(404).json({ status: 'error', message: 'Torneo no encontrado.' });
    const idx = tournament.participants.findIndex(p => p.user?.toString() === req.user.id);
    if (idx === -1) return res.status(400).json({ status: 'error', message: 'No estás inscripto en este torneo.' });
    tournament.participants.splice(idx, 1);
    tournament.currentParticipants = Math.max(0, tournament.currentParticipants - 1);
    await tournament.save();
    res.json({ status: 'success', message: 'Te desinscribiste del torneo correctamente.' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
