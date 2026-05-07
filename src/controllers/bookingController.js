const Booking = require('../models/Booking');
const Court = require('../models/Court');

exports.createBooking = async (req, res) => {
  try {
    const { courtId, date, startTime, endTime, duration, players, specialRequests } = req.body;
    const court = await Court.findById(courtId);
    if (!court || !court.isActive) {
      return res.status(404).json({ status: 'error', message: 'Cancha no disponible.' });
    }
    // Check for conflicts
    const existing = await Booking.findOne({
      court: courtId,
      date: new Date(date),
      status: { $in: ['pending', 'confirmed'] },
      $or: [
        { startTime: { $lt: endTime }, endTime: { $gt: startTime } }
      ]
    });
    if (existing) {
      return res.status(400).json({ status: 'error', message: 'Ya existe una reserva en ese horario.' });
    }
    const totalPrice = court.pricePerHour * duration;
    const booking = await Booking.create({
      user: req.user.id, court: courtId, date: new Date(date),
      startTime, endTime, duration, totalPrice, players, specialRequests
    });
    await booking.populate(['user', 'court']);
    res.status(201).json({ status: 'success', data: { booking } });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

exports.getMyBookings = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const filter = { user: req.user.id };
    if (status) filter.status = status;
    const skip = (page - 1) * limit;
    const [bookings, total] = await Promise.all([
      Booking.find(filter).populate('court', 'name address pricePerHour images').sort('-date').skip(skip).limit(Number(limit)),
      Booking.countDocuments(filter)
    ]);
    res.json({ status: 'success', data: { bookings, total } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.getBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('user', 'name email').populate('court', 'name address');
    if (!booking) return res.status(404).json({ status: 'error', message: 'Reserva no encontrada.' });
    if (booking.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ status: 'error', message: 'No tenés permiso.' });
    }
    res.json({ status: 'success', data: { booking } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ status: 'error', message: 'Reserva no encontrada.' });
    if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ status: 'error', message: 'No tenés permiso.' });
    }
    if (booking.status === 'cancelled') {
      return res.status(400).json({ status: 'error', message: 'La reserva ya está cancelada.' });
    }
    booking.status = 'cancelled';
    booking.cancellationReason = req.body.reason || 'Cancelado por el usuario';
    booking.cancelledAt = new Date();
    await booking.save({ validateBeforeSave: false });
    res.json({ status: 'success', data: { booking } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.getAvailability = async (req, res) => {
  try {
    const { courtId, date } = req.query;
    if (!courtId || !date) return res.status(400).json({ status: 'error', message: 'courtId y date son requeridos.' });
    const d = new Date(date);
    const bookings = await Booking.find({
      court: courtId,
      date: { $gte: new Date(d.setHours(0,0,0,0)), $lte: new Date(d.setHours(23,59,59,999)) },
      status: { $in: ['pending', 'confirmed'] }
    }).select('startTime endTime');
    res.json({ status: 'success', data: { bookings } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.getCourtBookings = async (req, res) => {
  try {
    const courts = await require('../models/Court').find({ owner: req.user.id }).select('_id');
    const courtIds = courts.map(c => c._id);
    const { status, page = 1, limit = 20 } = req.query;
    const filter = { court: { $in: courtIds } };
    if (status) filter.status = status;
    const skip = (page - 1) * limit;
    const [bookings, total] = await Promise.all([
      Booking.find(filter).populate('user', 'name email').populate('court', 'name').sort('-date').skip(skip).limit(Number(limit)),
      Booking.countDocuments(filter)
    ]);
    res.json({ status: 'success', data: { bookings, total } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
