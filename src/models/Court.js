const mongoose = require('mongoose');

const courtSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  description: String,
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  images: [String],
  pricePerHour: {
    type: Number,
    required: true
  },
  facilities: [{
    type: String,
    enum: ['vestuarios', 'duchas', 'bar', 'iluminacion', 'parking', 'wifi']
  }],
  courtType: {
    type: String,
    enum: ['cristal', 'hormigon', 'cesped artificial'],
    required: true
  },
  operatingHours: {
    open: String,
    close: String
  },
  isActive: {
    type: Boolean,
    default: false
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: Number,
    comment: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Court', courtSchema);