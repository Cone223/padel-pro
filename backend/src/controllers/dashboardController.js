const Booking = require('../models/Booking');
const Court = require('../models/Court');
const User = require('../models/User');
const Tournament = require('../models/Tournament');

// @desc    Obtener estadísticas del dashboard
// @route   GET /api/dashboard/stats
// @access  Private
exports.getDashboardStats = async (req, res) => {
  try {
    const { period = 'month' } = req.query; // day, week, month, year
    let dateFilter = {};
    
    // Configurar filtro de fecha según el período
    const now = new Date();
    switch (period) {
      case 'day':
        dateFilter = {
          createdAt: {
            $gte: new Date(now.setHours(0, 0, 0, 0)),
            $lte: new Date(now.setHours(23, 59, 59, 999))
          }
        };
        break;
      case 'week':
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        dateFilter = { createdAt: { $gte: startOfWeek } };
        break;
      case 'month':
        dateFilter = {
          createdAt: {
            $gte: new Date(now.getFullYear(), now.getMonth(), 1),
            $lte: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
          }
        };
        break;
      case 'year':
        dateFilter = {
          createdAt: {
            $gte: new Date(now.getFullYear(), 0, 1),
            $lte: new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999)
          }
        };
        break;
    }

    let stats = {};

    if (req.user.role === 'admin') {
      // Estadísticas para administrador
      stats = await getAdminStats(dateFilter, period);
    } else if (req.user.role === 'owner') {
      // Estadísticas para dueño
      stats = await getOwnerStats(req.user.id, dateFilter, period);
    } else {
      // Estadísticas para usuario normal
      stats = await getUserStats(req.user.id, dateFilter, period);
    }

    res.status(200).json({
      status: 'success',
      data: {
        stats,
        period
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message,
    });
  }
};

// @desc    Obtener gráficos de ingresos
// @route   GET /api/dashboard/revenue-chart
// @access  Private (Owner/Admin)
exports.getRevenueChart = async (req, res) => {
  try {
    const { months = 6 } = req.query;
    
    let revenueData = [];
    const userRole = req.user.role;

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);

      let filter = {
        status: 'completed',
        createdAt: { $gte: startOfMonth, $lte: endOfMonth }
      };

      // Filtrar por dueño si no es admin
      if (userRole === 'owner') {
        const ownerCourts = await Court.find({ owner: req.user.id }).select('_id');
        const courtIds = ownerCourts.map(court => court._id);
        filter.court = { $in: courtIds };
      }

      const monthlyBookings = await Booking.find(filter);
      const monthlyRevenue = monthlyBookings.reduce((sum, booking) => sum + booking.totalPrice, 0);

      revenueData.push({
        month: date.toLocaleString('es-ES', { month: 'short', year: 'numeric' }),
        revenue: monthlyRevenue,
        bookings: monthlyBookings.length
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        revenueChart: revenueData
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message,
    });
  }
};

// @desc    Obtener actividades recientes
// @route   GET /api/dashboard/activities
// @access  Private
exports.getRecentActivities = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    let activities = [];

    if (req.user.role === 'admin') {
      activities = await getAdminActivities(limit);
    } else if (req.user.role === 'owner') {
      activities = await getOwnerActivities(req.user.id, limit);
    } else {
      activities = await getUserActivities(req.user.id, limit);
    }

    res.status(200).json({
      status: 'success',
      data: {
        activities
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message,
    });
  }
};

// Funciones helper para estadísticas
async function getAdminStats(dateFilter, period) {
  const [
    totalUsers,
    totalCourts,
    totalBookings,
    pendingBookings,
    totalRevenue,
    activeTournaments,
    newUsers,
    newCourts
  ] = await Promise.all([
    User.countDocuments(),
    Court.countDocuments({ isActive: true }),
    Booking.countDocuments(),
    Booking.countDocuments({ status: 'pending' }),
    Booking.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]),
    Tournament.countDocuments({ isActive: true }),
    User.countDocuments(dateFilter),
    Court.countDocuments({ ...dateFilter, isActive: true })
  ]);

  return {
    totalUsers,
    totalCourts,
    totalBookings,
    pendingBookings,
    totalRevenue: totalRevenue[0]?.total || 0,
    activeTournaments,
    newUsers,
    newCourts,
    bookingStatus: await getBookingStatusStats(),
    userGrowth: await getUserGrowthStats(period)
  };
}

async function getOwnerStats(ownerId, dateFilter, period) {
  const ownerCourts = await Court.find({ owner: ownerId }).select('_id');
  const courtIds = ownerCourts.map(court => court._id);

  const [
    totalCourts,
    totalBookings,
    pendingBookings,
    completedBookings,
    totalRevenue,
    monthlyRevenue,
    courtBookings
  ] = await Promise.all([
    Court.countDocuments({ owner: ownerId, isActive: true }),
    Booking.countDocuments({ court: { $in: courtIds } }),
    Booking.countDocuments({ court: { $in: courtIds }, status: 'pending' }),
    Booking.countDocuments({ court: { $in: courtIds }, status: 'completed' }),
    Booking.aggregate([
      { $match: { court: { $in: courtIds }, status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]),
    Booking.aggregate([
      { 
        $match: { 
          court: { $in: courtIds }, 
          status: 'completed',
          createdAt: dateFilter.createdAt 
        } 
      },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]),
    Booking.aggregate([
      { $match: { court: { $in: courtIds }, status: 'completed' } },
      { 
        $group: { 
          _id: '$court', 
          count: { $sum: 1 },
          revenue: { $sum: '$totalPrice' }
        } 
      },
      { $lookup: { from: 'courts', localField: '_id', foreignField: '_id', as: 'court' } },
      { $unwind: '$court' },
      { $project: { courtName: '$court.name', bookings: '$count', revenue: 1 } }
    ])
  ]);

  return {
    totalCourts,
    totalBookings,
    pendingBookings,
    completedBookings,
    totalRevenue: totalRevenue[0]?.total || 0,
    monthlyRevenue: monthlyRevenue[0]?.total || 0,
    courtBookings,
    bookingStatus: await getBookingStatusStats(courtIds),
    popularCourts: courtBookings.slice(0, 5)
  };
}

async function getUserStats(userId, dateFilter, period) {
  const [
    totalBookings,
    upcomingBookings,
    completedBookings,
    totalSpent,
    favoriteCourt
  ] = await Promise.all([
    Booking.countDocuments({ user: userId }),
    Booking.countDocuments({ user: userId, status: { $in: ['pending', 'confirmed'] } }),
    Booking.countDocuments({ user: userId, status: 'completed' }),
    Booking.aggregate([
      { $match: { user: userId, status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]),
    Booking.aggregate([
      { $match: { user: userId, status: 'completed' } },
      { $group: { _id: '$court', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 },
      { $lookup: { from: 'courts', localField: '_id', foreignField: '_id', as: 'court' } },
      { $unwind: '$court' },
      { $project: { courtName: '$court.name', bookings: '$count' } }
    ])
  ]);

  return {
    totalBookings,
    upcomingBookings,
    completedBookings,
    totalSpent: totalSpent[0]?.total || 0,
    favoriteCourt: favoriteCourt[0] || null,
    bookingHistory: await getUserBookingHistory(userId, period)
  };
}

async function getBookingStatusStats(courtIds = null) {
  const match = courtIds ? { court: { $in: courtIds } } : {};
  
  const statusStats = await Booking.aggregate([
    { $match: match },
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);

  return {
    pending: statusStats.find(s => s._id === 'pending')?.count || 0,
    confirmed: statusStats.find(s => s._id === 'confirmed')?.count || 0,
    completed: statusStats.find(s => s._id === 'completed')?.count || 0,
    cancelled: statusStats.find(s => s._id === 'cancelled')?.count || 0
  };
}

async function getUserGrowthStats(period) {
  const growth = await User.aggregate([
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
    { $limit: 12 }
  ]);

  return growth;
}

async function getUserBookingHistory(userId, period) {
  const history = await Booking.find({ user: userId })
    .populate('court', 'name')
    .sort({ date: -1 })
    .limit(10)
    .select('date startTime endTime status totalPrice court');

  return history;
}

async function getAdminActivities(limit) {
  const [recentBookings, recentUsers, recentCourts] = await Promise.all([
    Booking.find()
      .populate('user', 'name')
      .populate('court', 'name')
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('createdAt status totalPrice user court'),
    User.find().sort({ createdAt: -1 }).limit(limit).select('name email createdAt role'),
    Court.find().sort({ createdAt: -1 }).limit(limit).populate('owner', 'name').select('name owner createdAt')
  ]);

  const activities = [
    ...recentBookings.map(booking => ({
      type: 'booking',
      message: `Nueva reserva de ${booking.user.name} en ${booking.court.name}`,
      timestamp: booking.createdAt,
      metadata: { status: booking.status, amount: booking.totalPrice }
    })),
    ...recentUsers.map(user => ({
      type: 'user',
      message: `Nuevo usuario registrado: ${user.name} (${user.role})`,
      timestamp: user.createdAt,
      metadata: { email: user.email, role: user.role }
    })),
    ...recentCourts.map(court => ({
      type: 'court',
      message: `Nueva cancha registrada: ${court.name} por ${court.owner.name}`,
      timestamp: court.createdAt,
      metadata: { owner: court.owner.name }
    }))
  ];

  return activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, limit);
}

async function getOwnerActivities(ownerId, limit) {
  const ownerCourts = await Court.find({ owner: ownerId }).select('_id');
  const courtIds = ownerCourts.map(court => court._id);

  const recentBookings = await Booking.find({ court: { $in: courtIds } })
    .populate('user', 'name')
    .populate('court', 'name')
    .sort({ createdAt: -1 })
    .limit(limit)
    .select('createdAt status totalPrice user court');

  return recentBookings.map(booking => ({
    type: 'booking',
    message: `Nueva reserva de ${booking.user.name} en ${booking.court.name}`,
    timestamp: booking.createdAt,
    metadata: { status: booking.status, amount: booking.totalPrice }
  }));
}

async function getUserActivities(userId, limit) {
  const recentBookings = await Booking.find({ user: userId })
    .populate('court', 'name')
    .sort({ createdAt: -1 })
    .limit(limit)
    .select('createdAt status totalPrice court');

  return recentBookings.map(booking => ({
    type: 'booking',
    message: `Reserva en ${booking.court.name} - ${booking.status}`,
    timestamp: booking.createdAt,
    metadata: { status: booking.status, amount: booking.totalPrice }
  }));
}