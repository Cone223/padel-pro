# 🎾 PadelFinder v2.0 — Plataforma de Gestión de Pádel

Plataforma profesional completa para gestión de canchas, reservas y torneos de pádel.

---

## 🚀 Instalación y ejecución

### Pre-requisitos
- Node.js v18+
- MongoDB (local o Atlas)
- npm o yarn

### 1. Backend

```bash
cd backend
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus valores (MongoDB URI, JWT_SECRET, etc.)

# (Opcional) Poblar con datos de prueba
npm run seed

# Modo desarrollo
npm run dev

# Producción
npm start
```

El backend corre en `http://localhost:5000`

### 2. Frontend

```bash
cd frontend
npm install

# Configurar .env
echo "VITE_API_URL=http://localhost:5000/api" > .env

# Modo desarrollo
npm run dev

# Build producción
npm run build
```

El frontend corre en `http://localhost:5173`

---

## 🔑 Credenciales de prueba (tras ejecutar seed)

| Rol   | Email                      | Contraseña  |
|-------|----------------------------|-------------|
| Admin | admin@padelfinder.com      | Admin1234!  |
| User  | juan@test.com              | Test1234!   |

---

## 📁 Estructura del proyecto

```
padel-pro/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Lógica de negocio
│   │   ├── models/          # Esquemas MongoDB
│   │   ├── routes/          # Rutas API
│   │   ├── middleware/      # Auth, protección
│   │   └── server.js        # Entry point
│   └── .env
└── frontend/
    ├── src/
    │   ├── pages/           # Páginas principales
    │   │   └── admin/       # Panel administración
    │   ├── components/      # Componentes reutilizables
    │   ├── context/         # Auth + Toast context
    │   └── services/        # API layer
    └── .env
```

---

## ⚙️ Stack tecnológico

| Capa       | Tecnología                  |
|------------|-----------------------------|
| Frontend   | React 18 + Vite             |
| Estilos    | Tailwind CSS v3             |
| Routing    | React Router v6             |
| HTTP       | Axios                       |
| Backend    | Node.js + Express           |
| Database   | MongoDB + Mongoose          |
| Auth       | JWT (jsonwebtoken)          |
| Passwords  | bcryptjs                    |
| Upload     | Multer                      |

---

## 🛡️ Roles del sistema

| Rol    | Permisos                                              |
|--------|-------------------------------------------------------|
| admin  | Control total: usuarios, canchas, reservas, torneos   |
| owner  | Gestionar sus propias canchas y ver reservas          |
| user   | Buscar canchas, reservar y participar en torneos      |

---

## 🌐 Deploy

### Frontend → Netlify / Vercel
```bash
cd frontend
npm run build
# Subir carpeta dist/
```
Variables de entorno en Netlify/Vercel:
- `VITE_API_URL=https://tu-api.railway.app/api`

### Backend → Railway / Render
Variables de entorno necesarias:
- `MONGODB_URI`
- `JWT_SECRET`
- `NODE_ENV=production`
- `FRONTEND_URL=https://tu-frontend.netlify.app`

---

## 📡 API Endpoints principales

```
POST   /api/auth/register         Registro de usuario
POST   /api/auth/login            Login
GET    /api/auth/profile          Perfil (🔒)

GET    /api/courts                Listar canchas
POST   /api/courts                Crear cancha (🔒 owner/admin)
PATCH  /api/courts/:id            Editar cancha (🔒)
DELETE /api/courts/:id            Eliminar (🔒)

GET    /api/bookings/availability  Disponibilidad
POST   /api/bookings              Crear reserva (🔒)
GET    /api/bookings/my-bookings  Mis reservas (🔒)
PATCH  /api/bookings/:id/cancel   Cancelar (🔒)

GET    /api/tournaments           Listar torneos
POST   /api/tournaments           Crear torneo (🔒 owner/admin)
POST   /api/tournaments/:id/join  Inscribirse (🔒)

GET    /api/admin/stats           Estadísticas (🔒 admin)
GET    /api/admin/users           Usuarios (🔒 admin)
GET    /api/admin/bookings        Todas las reservas (🔒 admin)
```
