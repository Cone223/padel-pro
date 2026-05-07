const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'https://padel-pro-one.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {

    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error('CORS not allowed'));
  },
  credentials: true
}));

app.options('*', cors());

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

const connectDB = async () => {
  try {

    const conn = await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/padelfinder'
    );

    console.log('✅ MongoDB conectado:', conn.connection.host);

  } catch (err) {

    console.error('❌ Error Mongo:', err.message);
    process.exit(1);

  }
};

connectDB();

app.use('/api/auth', require('./routes/userRoutes'));
app.use('/api/courts', require('./routes/courtRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/tournaments', require('./routes/tournamentRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

app.get('/api', (req, res) => {
  res.json({
    message: '🎾 PadelFinder API',
    status: 'running'
  });
});

app.all('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Ruta ${req.originalUrl} no encontrada`
  });
});

app.use((err, req, res, next) => {

  console.error(err);

  res.status(err.status || 500).json({
    status: 'error',
    message: err.message
  });

});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('🚀 Servidor corriendo en puerto', PORT);
});

module.exports = app;
