const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'La reserva debe pertenecer a un usuario']
  },
  court: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Court',
    required: [true, 'La reserva debe ser para una cancha']
  },
  date: {
    type: Date,
    required: [true, 'La fecha de la reserva es requerida'],
    validate: {
      validator: function(date) {
        return date > new Date();
      },
      message: 'La fecha de reserva debe ser en el futuro'
    }
  },
  startTime: {
    type: String,
    required: [true, 'La hora de inicio es requerida'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)']
  },
  endTime: {
    type: String,
    required: [true, 'La hora de fin es requerida'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)']
  },
  duration: {
    type: Number,
    required: [true, 'La duración es requerida'],
    min: [1, 'La duración mínima es 1 hora'],
    max: [4, 'La duración máxima es 4 horas']
  },
  totalPrice: {
    type: Number,
    required: [true, 'El precio total es requerido'],
    min: [0, 'El precio no puede ser negativo']
  },
  status: {
    type: String,
    enum: {
      values: ['pending', 'confirmed', 'cancelled', 'completed'],
      message: 'El estado debe ser: pending, confirmed, cancelled o completed'
    },
    default: 'pending'
  },
  players: [{
    name: {
      type: String,
      required: [true, 'El nombre del jugador es requerido']
    },
    email: {
      type: String,
      validate: {
        validator: function(email) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        },
        message: 'Por favor proporciona un email válido'
      }
    }
  }],
  specialRequests: {
    type: String,
    maxlength: [500, 'Las solicitudes especiales no pueden tener más de 500 caracteres']
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending'
  },
  paymentIntentId: String,
  cancellationReason: String,
  cancelledAt: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices para mejor performance
bookingSchema.index({ court: 1, date: 1, startTime: 1 });
bookingSchema.index({ user: 1, createdAt: -1 });
bookingSchema.index({ status: 1 });

// Middleware para validar disponibilidad antes de guardar
bookingSchema.pre('save', async function(next) {
  if (this.isNew) {
    await this.validateAvailability();
  }
  next();
});

// Método de instancia para validar disponibilidad
bookingSchema.methods.validateAvailability = async function() {
  const existingBooking = await mongoose.model('Booking').findOne({
    court: this.court,
    date: {
      $eq: new Date(this.date.setHours(0, 0, 0, 0))
    },
    startTime: this.startTime,
    status: { $in: ['pending', 'confirmed'] }
  });

  if (existingBooking) {
    throw new Error('La cancha no está disponible en ese horario');
  }

  // Validar que esté dentro del horario de operación
  const court = await mongoose.model('Court').findById(this.court);
  if (court && court.operatingHours) {
    const [startHour, startMinute] = this.startTime.split(':').map(Number);
    const [endHour, endMinute] = this.endTime.split(':').map(Number);
    const [openHour, openMinute] = court.operatingHours.open.split(':').map(Number);
    const [closeHour, closeMinute] = court.operatingHours.close.split(':').map(Number);

    const bookingStart = startHour * 60 + startMinute;
    const bookingEnd = endHour * 60 + endMinute;
    const courtOpen = openHour * 60 + openMinute;
    const courtClose = closeHour * 60 + closeMinute;

    if (bookingStart < courtOpen || bookingEnd > courtClose) {
      throw new Error('La reserva está fuera del horario de operación de la cancha');
    }
  }
};

// Virtual para fecha y hora de inicio combinadas
bookingSchema.virtual('startDateTime').get(function() {
  const [hours, minutes] = this.startTime.split(':').map(Number);
  const startDate = new Date(this.date);
  startDate.setHours(hours, minutes, 0, 0);
  return startDate;
});

// Virtual para fecha y hora de fin combinadas
bookingSchema.virtual('endDateTime').get(function() {
  const [hours, minutes] = this.endTime.split(':').map(Number);
  const endDate = new Date(this.date);
  endDate.setHours(hours, minutes, 0, 0);
  return endDate;
});

// Método para verificar si se puede cancelar
bookingSchema.methods.canBeCancelled = function() {
  const now = new Date();
  const bookingStart = this.startDateTime;
  const hoursUntilBooking = (bookingStart - now) / (1000 * 60 * 60);
  
  return hoursUntilBooking > 2; // Se puede cancelar hasta 2 horas antes
};

// Método estático para obtener disponibilidad
bookingSchema.statics.getAvailability = async function(courtId, date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const bookings = await this.find({
    court: courtId,
    date: {
      $gte: startOfDay,
      $lte: endOfDay
    },
    status: { $in: ['confirmed', 'pending'] }
  }).select('startTime endTime');

  return bookings;
};

module.exports = mongoose.model('Booking', bookingSchema);