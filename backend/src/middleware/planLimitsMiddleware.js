const Subscription = require('../models/Subscription');
const Court = require('../models/Court');

exports.checkPlanLimits = async (req, res, next) => {
  // Solo aplicar a dueños
  if (req.user.role !== 'owner') return next();

  try {
    const subscription = await Subscription.findOne({ owner: req.user.id });
    
    // Si no tiene suscripción activa
    if (!subscription || subscription.status !== 'active') {
      return res.status(403).json({
        status: 'error',
        message: 'Necesitas una suscripción activa para realizar esta acción'
      });
    }

    // Verificar límite de canchas al crear nueva
    if (req.method === 'POST' && req.originalUrl.includes('/api/courts')) {
      const courtCount = await Court.countDocuments({ owner: req.user.id, isActive: true });
      
      if (courtCount >= subscription.features.maxCourts) {
        return res.status(403).json({
          status: 'error',
          message: `Límite de ${subscription.features.maxCourts} canchas alcanzado. Actualiza tu plan para agregar más.`
        });
      }
    }

    // Verificar módulo de torneos
    if (req.originalUrl.includes('/api/tournaments') && !subscription.features.tournamentModule) {
      return res.status(403).json({
        status: 'error',
        message: 'El módulo de torneos no está incluido en tu plan actual'
      });
    }

    next();
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error verificando límites del plan'
    });
  }
};