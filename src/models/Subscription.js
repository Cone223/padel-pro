const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  plan: {
    type: String,
    enum: ['basic', 'pro', 'premium'],
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'canceled', 'past_due', 'incomplete'],
    default: 'incomplete'
  },
  stripeSubscriptionId: String,
  stripeCustomerId: String,
  currentPeriodStart: Date,
  currentPeriodEnd: Date,
  cancelAtPeriodEnd: {
    type: Boolean,
    default: false
  },
  price: {
    type: Number,
    required: true
  },
  features: {
    maxCourts: {
      type: Number,
      required: true
    },
    advancedAnalytics: {
      type: Boolean,
      default: false
    },
    tournamentModule: {
      type: Boolean,
      default: false
    },
    customBranding: {
      type: Boolean,
      default: false
    },
    prioritySupport: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true
});

// Índices para mejor performance
subscriptionSchema.index({ owner: 1 });
subscriptionSchema.index({ status: 1 });
subscriptionSchema.index({ currentPeriodEnd: 1 });

module.exports = mongoose.model('Subscription', subscriptionSchema);