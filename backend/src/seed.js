const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Court = require('./models/Court');
const Tournament = require('./models/Tournament');

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/padelfinder');
  console.log('✅ MongoDB conectado');

  // Clear existing data
  await Promise.all([User.deleteMany(), Court.deleteMany(), Tournament.deleteMany()]);
  console.log('🗑  Base de datos limpiada');

  // Create admin user
  const admin = await User.create({
    name: 'Admin PadelFinder',
    email: 'admin@padelfinder.com',
    password: 'Admin1234!',
    role: 'admin',
    isActive: true,
  });
  console.log('👑 Admin creado: admin@padelfinder.com / Admin1234!');

  // Create test user
  const user1 = await User.create({
    name: 'Juan Pérez',
    email: 'juan@test.com',
    password: 'Test1234!',
    role: 'user',
    phone: '+54 9 11 1234-5678',
    isActive: true,
  });
  console.log('👤 Usuario de prueba: juan@test.com / Test1234!');

  // Create courts
  const courts = await Court.insertMany([
    {
      name: 'Cancha Central Premium',
      owner: admin._id,
      description: 'Nuestra cancha principal de cristal con iluminación LED profesional. Ideal para todos los niveles.',
      address: { street: 'Av. Libertador 1500', city: 'Buenos Aires', state: 'CABA' },
      pricePerHour: 2500,
      courtType: 'cristal',
      facilities: ['vestuarios', 'duchas', 'bar', 'iluminacion', 'parking'],
      operatingHours: { open: '08:00', close: '23:00' },
      isActive: true,
      rating: 4.8,
    },
    {
      name: 'Cancha Norte',
      owner: admin._id,
      description: 'Cancha de césped artificial con vista al parque. Perfecta para partidos nocturnos.',
      address: { street: 'Av. Cabildo 2340', city: 'Buenos Aires', state: 'CABA' },
      pricePerHour: 1800,
      courtType: 'cesped artificial',
      facilities: ['iluminacion', 'parking', 'vestuarios'],
      operatingHours: { open: '07:00', close: '22:00' },
      isActive: true,
      rating: 4.5,
    },
    {
      name: 'Club Palermo Pádel',
      owner: admin._id,
      description: 'Complejo deportivo en Palermo con 3 canchas de pádel. Clases para todos los niveles.',
      address: { street: 'Av. Santa Fe 4200', city: 'Buenos Aires', state: 'CABA' },
      pricePerHour: 3000,
      courtType: 'cristal',
      facilities: ['vestuarios', 'duchas', 'bar', 'iluminacion', 'parking', 'wifi'],
      operatingHours: { open: '06:00', close: '24:00' },
      isActive: true,
      rating: 4.9,
    },
  ]);
  console.log(`🎾 ${courts.length} canchas creadas`);

  // Create tournament
  const tournament = await Tournament.create({
    name: 'Copa PadelFinder 2024',
    organizer: admin._id,
    court: courts[0]._id,
    description: 'El gran torneo de apertura de la plataforma. ¡Demostrá tu nivel y ganate el trofeo!',
    startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    registrationDeadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
    maxParticipants: 16,
    currentParticipants: 0,
    category: 'intermedio',
    entryFee: 3000,
    prize: 'Trofeo + $50.000 en premios',
    isActive: true,
  });
  console.log('🏆 Torneo de prueba creado');

  console.log('\n✅ Seed completado exitosamente!');
  console.log('\n📋 CREDENCIALES:');
  console.log('   Admin → admin@padelfinder.com / Admin1234!');
  console.log('   User  → juan@test.com / Test1234!');
  process.exit(0);
};

seed().catch(err => { console.error('❌ Error en seed:', err); process.exit(1); });
