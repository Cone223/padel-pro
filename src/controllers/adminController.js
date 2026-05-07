const User = require('../models/User');
const Court = require('../models/Court');
const Booking = require('../models/Booking');
const Tournament = require('../models/Tournament');

// GET /api/admin/stats
exports.getStats = async (req, res) => {
  try {
    const [totalUsers, totalCourts, totalBookings, totalTournaments, revenueAgg] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Court.countDocuments(),
      Booking.countDocuments(),
      Tournament.countDocuments(),
      Booking.aggregate([
        { $match: { status: { $in: ['confirmed', 'completed'] } } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } }
      ])
    ]);
    const totalRevenue = revenueAgg[0]?.total || 0;

    // Monthly revenue for chart (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const monthlyRevenue = await Booking.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo }, status: { $in: ['confirmed', 'completed'] } } },
      { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, revenue: { $sum: '$totalPrice' }, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json({
      status: 'success',
      data: { totalUsers, totalCourts, totalBookings, totalTournaments, totalRevenue, monthlyRevenue }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// GET /api/admin/users
exports.getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role } = req.query;
    const filter = {};
    if (search) filter.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }];
    if (role) filter.role = role;
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      User.find(filter).sort('-createdAt').skip(skip).limit(Number(limit)),
      User.countDocuments(filter)
    ]);
    res.json({ status: 'success', data: { users, total, page: Number(page), pages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// PATCH /api/admin/users/:id/toggle-status
exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ status: 'error', message: 'Usuario no encontrado.' });
    if (user.role === 'admin') return res.status(400).json({ status: 'error', message: 'No podés modificar a un admin.' });
    user.isActive = !user.isActive;
    await user.save({ validateBeforeSave: false });
    res.json({ status: 'success', data: { user } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// DELETE /api/admin/users/:id
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ status: 'error', message: 'Usuario no encontrado.' });
    if (user.role === 'admin') return res.status(400).json({ status: 'error', message: 'No podés eliminar a un admin.' });
    await User.findByIdAndDelete(req.params.id);
    res.json({ status: 'success', message: 'Usuario eliminado correctamente.' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// PATCH /api/admin/users/:id/role
exports.changeUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['user', 'owner'].includes(role)) {
      return res.status(400).json({ status: 'error', message: 'Rol inválido.' });
    }
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    if (!user) return res.status(404).json({ status: 'error', message: 'Usuario no encontrado.' });
    res.json({ status: 'success', data: { user } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// GET /api/admin/bookings
exports.getAllBookings = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, date, userId } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (userId) filter.user = userId;
    if (date) {
      const d = new Date(date);
      filter.date = { $gte: new Date(d.setHours(0,0,0,0)), $lte: new Date(d.setHours(23,59,59,999)) };
    }
    const skip = (page - 1) * limit;
    const [bookings, total] = await Promise.all([
      Booking.find(filter)
        .populate('user', 'name email')
        .populate('court', 'name address')
        .sort('-createdAt').skip(skip).limit(Number(limit)),
      Booking.countDocuments(filter)
    ]);
    res.json({ status: 'success', data: { bookings, total, page: Number(page), pages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// PATCH /api/admin/bookings/:id/status
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findByIdAndUpdate(req.params.id, { status }, { new: true })
      .populate('user', 'name email')
      .populate('court', 'name');
    if (!booking) return res.status(404).json({ status: 'error', message: 'Reserva no encontrada.' });
    res.json({ status: 'success', data: { booking } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// GET /api/admin/courts
exports.getAllCourts = async (req, res) => {
  try {
    const courts = await Court.find().populate('owner', 'name email').sort('-createdAt');
    res.json({ status: 'success', data: { courts } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// PATCH /api/admin/courts/:id/toggle
exports.toggleCourtStatus = async (req, res) => {
  try {
    const court = await Court.findById(req.params.id);
    if (!court) return res.status(404).json({ status: 'error', message: 'Cancha no encontrada.' });
    court.isActive = !court.isActive;
    await court.save();
    res.json({ status: 'success', data: { court } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// DELETE /api/admin/courts/:id
exports.deleteCourt = async (req, res) => {
  try {
    const court = await Court.findByIdAndDelete(req.params.id);
    if (!court) return res.status(404).json({ status: 'error', message: 'Cancha no encontrada.' });
    res.json({ status: 'success', message: 'Cancha eliminada correctamente.' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
