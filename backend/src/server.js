const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/padelfinder',
      { useNewUrlParser: true, useUnifiedTopology: true }
    );
    console.log('✅ MongoDB conectado:', conn.connection.host);
  } catch (err) {
    console.error('❌ Error de conexión a MongoDB:', err.message);
    process.exit(1);
  }
};

connectDB();

app.use('/api/auth',        require('./routes/userRoutes'));
app.use('/api/courts',      require('./routes/courtRoutes'));
app.use('/api/bookings',    require('./routes/bookingRoutes'));
app.use('/api/tournaments', require('./routes/tournamentRoutes'));
app.use('/api/dashboard',   require('./routes/dashboardRoutes'));
app.use('/api/admin',       require('./routes/adminRoutes'));

app.get('/api', (req, res) => {
  res.json({ message: '🎾 PadelFinder API v2.0', status: 'running' });
});

app.all('*', (req, res) => {
  res.status(404).json({ status: 'error', message: `Ruta ${req.originalUrl} no encontrada` });
});

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    status: 'error',
    message: process.env.NODE_ENV === 'production' ? 'Error interno del servidor' : err.message
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('🚀 Servidor corriendo en puerto', PORT);
});

module.exports = app;
