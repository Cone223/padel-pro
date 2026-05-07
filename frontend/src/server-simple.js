const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Datos de demo
const demoCourts = [
  {
    _id: '1',
    name: 'Pádel Center Buenos Aires',
    description: 'Canchas profesionales con iluminación LED',
    pricePerHour: 2500,
    courtType: 'cristal',
    address: { city: 'Buenos Aires', street: 'Av. Corrientes 1234' },
    images: [],
    rating: 4.5,
    isActive: true,
    facilities: ['vestuarios', 'duchas', 'iluminacion']
  },
  {
    _id: '2',
    name: 'Pádel Premium Palermo', 
    description: 'Canchas de última generación en Palermo',
    pricePerHour: 3000,
    courtType: 'hormigon',
    address: { city: 'Buenos Aires', street: 'Honduras 4567' },
    images: [],
    rating: 4.8,
    isActive: true,
    facilities: ['vestuarios', 'bar', 'wifi']
  }
];

const demoTournaments = [
  {
    _id: '1',
    name: 'Torneo Inaugural PádelFinder',
    description: 'Primer torneo oficial',
    startDate: '2024-12-15T10:00:00',
    category: 'intermedio',
    entryFee: 5000,
    court: { name: 'Pádel Center Buenos Aires' },
    currentParticipants: 15,
    maxParticipants: 32
  }
];

// Rutas simples
app.get('/api', (req, res) => {
  res.json({ message: 'PadelFinder API funcionando' });
});

app.get('/api/courts', (req, res) => {
  res.json({
    status: 'success',
    data: { courts: demoCourts }
  });
});

app.get('/api/courts/:id', (req, res) => {
  const court = demoCourts.find(c => c._id === req.params.id);
  if (!court) {
    return res.status(404).json({ error: 'Cancha no encontrada' });
  }
  res.json({
    status: 'success', 
    data: { court }
  });
});

app.get('/api/tournaments', (req, res) => {
  res.json({
    status: 'success',
    data: { tournaments: demoTournaments }
  });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Servidor backend temporal corriendo en puerto ${PORT}`);
  console.log('API disponible en: http://localhost:5000/api');
});