const Subscription = require('../models/Subscription');
const User = require('../models/User');

// @desc   Obtener suscripción del usuario
// @route  GET /api/subscriptions/my-subscription
// @access Private (Owner)
exports.getMySubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ owner: req.user.id })
      .populate('owner', 'name email businessName');

    if (!subscription) {
      return res.status(404).json({
        status: 'error',
        message: 'No se encontró suscripción para este usuario'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        subscription
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc   Actualizar plan de suscripción
// @route  PATCH /api/subscriptions/upgrade
// @access Private (Owner)
exports.upgradeSubscription = async (req, res) => {
  try {
    const { plan } = req.body;
    
    const validPlans = ['basic', 'pro', 'premium'];
    if (!validPlans.includes(plan)) {
      return res.status(400).json({
        status: 'error',
        message: 'Plan inválido'
      });
    }

    const subscription = await Subscription.findOne({ owner: req.user.id });
    
    if (!subscription) {
      return res.status(404).json({
        status: 'error',
        message: 'No se encontró suscripción'
      });
    }

    // Actualizar plan y features
    subscription.plan = plan;
    subscription.price = getPlanPrice(plan);
    subscription.features = getPlanFeatures(plan);
    
    await subscription.save();

    res.status(200).json({
      status: 'success',
      data: {
        subscription
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc   Cancelar suscripción
// @route  PATCH /api/subscriptions/cancel
// @access Private (Owner)
exports.cancelSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ owner: req.user.id });
    
    if (!subscription) {
      return res.status(404).json({
        status: 'error',
        message: 'No se encontró suscripción'
      });
    }

    subscription.status = 'canceled';
    subscription.cancelAtPeriodEnd = true;
    
    await subscription.save();

    res.status(200).json({
      status: 'success',
      message: 'Suscripción cancelada. Terminará al final del período actual.',
      data: {
        subscription
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc   Reactivar suscripción
// @route  PATCH /api/subscriptions/reactivate
// @access Private (Owner)
exports.reactivateSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ owner: req.user.id });
    
    if (!subscription) {
      return res.status(404).json({
        status: 'error',
        message: 'No se encontró suscripción'
      });
    }

    subscription.status = 'active';
    subscription.cancelAtPeriodEnd = false;
    
    await subscription.save();

    res.status(200).json({
      status: 'success',
      message: 'Suscripción reactivada exitosamente',
      data: {
        subscription
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Helper functions
function getPlanPrice(plan) {
  const prices = {
    basic: 2990,
    pro: 5990,
    premium: 9990
  };
  return prices[plan] || 2990;
}

function getPlanFeatures(plan) {
  const features = {
    basic: {
      maxCourts: 1,
      advancedAnalytics: false,
      tournamentModule: false,
      customBranding: false,
      prioritySupport: false
    },
    pro: {
      maxCourts: 3,
      advancedAnalytics: true,
      tournamentModule: true,
      customBranding: false,
      prioritySupport: true
    },
    premium: {
      maxCourts: 999,
      advancedAnalytics: true,
      tournamentModule: true,
      customBranding: true,
      prioritySupport: true
    }
  };
  return features[plan] || features.basic;
}