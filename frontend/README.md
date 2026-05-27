<div align="center">

# IsWorking

**Sistema de control de jornada laboral con geolocalización**

[![MVP](https://img.shields.io/badge/MVP-44%2F44%20tests-27AE60?style=flat-square)](./DOCS/scripts/test_mvp.sh)
[![Stack](https://img.shields.io/badge/stack-Node.js%20·%20Express%20·%20PostgreSQL%20·%20MongoDB-1B3A5C?style=flat-square)]()
[![Frontend](https://img.shields.io/badge/frontend-React%2018%20·%20Vite-2E86AB?style=flat-square)]()
[![License](https://img.shields.io/badge/license-MIT-lightgrey?style=flat-square)]()

</div>

---

IsWorking es una aplicación web para registrar jornadas laborales con captura automática de GPS. Permite a empresas gestionar el fichaje de sus empleados en tiempo real, con soporte para trabajo presencial y remoto, gestión de turnos y horarios, y auditoría completa de todas las acciones registradas.

---

## Índice

- [Características](#características)
- [Arquitectura](#arquitectura)
- [Stack tecnológico](#stack-tecnológico)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Modelo de datos](#modelo-de-datos)
- [API REST](#api-rest)
- [Roles y permisos](#roles-y-permisos)
- [Instalación y arranque](#instalación-y-arranque)
- [Tests](#tests)
- [Variables de entorno](#variables-de-entorno)
- [Credenciales de prueba](#credenciales-de-prueba)

---

## Características

### Empleado
- Fichaje de entrada, inicio de pausa, fin de pausa y salida
- Captura GPS automática e irrenunciable en cada acción (el envío se bloquea sin permisos de ubicación)
- Recuperación del estado real del día al recargar (`GET /api/records/status`)
- Validación estricta de secuencia de fichajes — no se puede saltar pasos
- Modo offline: el fichaje se guarda localmente y se sincroniza al recuperar conexión (`POST /api/records/sync`)
- Historial filtrable por mes con coordenadas GPS, tipo y modalidad de cada registro

### Administrador de empresa
- Gestión de empleados: crear, activar y desactivar con protección contra autodesactivación
- Plantillas de turno: mañana, tarde y partido (con dos tramos horarios)
- Asignación de horarios por empleado y fecha con ciclo de estados: `pending → confirmed → completed`
- Visualización de todos los fichajes de la empresa con filtros por empleado, tipo y fecha
- Acceso a logs de auditoría: autenticación, acciones admin y fichajes con GPS

### Superadministrador
- Gestión global de empresas: crear empresa junto con su admin en una operación atómica
- Activar y desactivar empresa — la desactivación bloquea automáticamente a todos sus usuarios
- Visión global de todos los usuarios de la plataforma con capacidad de activación/desactivación
- Acceso completo a logs de auditoría de toda la plataforma

### Seguridad
- Autenticación con JWT en cookies HttpOnly (access token 15 min · refresh token 7 días)
- Renovación de sesión automática y transparente mediante interceptor en Axios
- Aislamiento estricto por empresa: los administradores solo acceden a sus propios datos
- Auditoría persistente en MongoDB de todos los eventos de autenticación y acción administrativa

---

## Arquitectura

```
┌─────────────────────────────────────────────┐
│           Frontend — React 18 + Vite         │
│              localhost:5173                  │
└──────────────────┬──────────────────────────┘
                   │ proxy /api → :3000
┌──────────────────▼──────────────────────────┐
│         Backend — Node.js + Express          │
│              localhost:3000                  │
│                                             │
│  Ruta → Middleware → Controlador             │
│       → Servicio → Modelo                   │
├──────────────────────────────────────────────┤
│  PostgreSQL 16          MongoDB 7            │
│  Datos transaccionales  Logs y auditoría     │
│  Sequelize ORM          Mongoose ODM         │
└──────────────────────────────────────────────┘
```

El backend sigue un patrón multicapa estricto. Ningún endpoint queda expuesto hasta que ambas bases de datos confirman conexión exitosa al arranque.

---

## Stack tecnológico

### Backend
| Tecnología | Rol |
|---|---|
| Node.js + Express | Runtime y framework HTTP |
| PostgreSQL 16 + Sequelize | Datos relacionales con integridad ACID |
| MongoDB 7 + Mongoose | Logs de auditoría y fichajes GPS |
| JWT + cookies HttpOnly | Autenticación stateless segura |
| bcrypt | Hashing de contraseñas |
| Docker Compose | Orquestación de infraestructura local |

### Frontend
| Tecnología | Rol |
|---|---|
| React 18 + Vite | UI reactiva y servidor de desarrollo |
| react-router-dom v7 | Enrutado de SPA |
| Axios | Cliente HTTP con interceptor de refresh automático |
| CSS variables (`--iw-*`) | Design system propio |

---

## Estructura del proyecto

```
isworking/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Recibe req/res, delega al service
│   │   ├── services/        # Lógica de negocio
│   │   ├── routes/          # Definición de endpoints
│   │   ├── middlewares/     # protect, isAdmin, errorHandler
│   │   ├── models/
│   │   │   ├── postgres/    # Company, User, ShiftTemplate, Schedule, TimeRecord
│   │   │   └── mongo/       # LogAuth, LogRecord, LogAdmin
│   │   └── config/          # postgres.js, mongo.js
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── pages/           # Dashboard, historial, admin, superadmin
│   │   ├── components/      # Clock, fichaje, tablas
│   │   └── services/        # Llamadas a la API
│   └── vite.config.js
└── DOCS/
    └── scripts/
        └── test_mvp.sh      # Batería de 44 pruebas automatizadas
```

---

## Modelo de datos

### PostgreSQL — tablas relacionales

| Tabla | Descripción |
|---|---|
| `companies` | Empresas con coordenadas de oficina y radio de geofencing |
| `users` | Usuarios con rol (`superadmin` / `admin` / `employee`) y estado activo |
| `shift_templates` | Plantillas de turno con franjas horarias (mañana / tarde / partido) |
| `schedules` | Asignación de turno a empleado por fecha — ciclo `pending → confirmed → completed` |
| `time_records` | Fichajes con timestamp, tipo de acción, modalidad y coordenadas GPS |

**Relaciones principales:**
- `Company` (1) → (N) `User` — la desactivación de empresa bloquea todos sus usuarios
- `User` (1) → (N) `Schedule` — histórico de planificaciones por empleado
- `User` (1) → (N) `TimeRecord` — cada fichaje queda vinculado al empleado que lo generó
- `ShiftTemplate` (1) → (N) `Schedule` — reutilización de plantillas en múltiples asignaciones

### MongoDB — colecciones documentales

| Colección | Eventos registrados |
|---|---|
| `logauths` | Login, logout, refresh, fallos de autenticación |
| `logrecords` | Cada fichaje con coordenadas GPS completas |
| `logadmins` | Crear usuario/empresa, activar/desactivar, asignar horario |

---

## API REST

### Autenticación
```
POST   /api/auth/login          # Login con email y contraseña
POST   /api/auth/logout         # Cierre de sesión
POST   /api/auth/refresh        # Renovación de access token
```

### Usuarios
```
GET    /api/users               # Admin → empresa propia · Superadmin → todos
POST   /api/users               # Crear empleado
PATCH  /api/users/:id           # Actualizar datos
PATCH  /api/users/:id/status    # Activar / desactivar
PATCH  /api/users/me/password   # Cambiar contraseña propia
```

### Empresas
```
GET    /api/companies                    # Listar empresas (superadmin)
POST   /api/companies                    # Crear empresa + admin (atómico)
PATCH  /api/companies/:id/activate       # Activar empresa
PATCH  /api/companies/:id/deactivate     # Desactivar empresa y usuarios
```

### Turnos y horarios
```
GET    /api/shift-templates              # Listar plantillas de turno
POST   /api/shift-templates             # Crear plantilla
GET    /api/schedules                   # Admin → empresa · Empleado → propios
POST   /api/schedules                   # Asignar turno a empleado
PATCH  /api/schedules/:id/status        # Cambiar estado del horario
```

### Fichajes
```
GET    /api/records                     # Admin → empresa · Empleado → propios
GET    /api/records/me                  # Historial del empleado autenticado
GET    /api/records/status              # Estado actual del día
POST   /api/records                     # Nuevo fichaje (requiere GPS)
POST   /api/records/sync                # Sincronizar fichajes offline
```

### Logs
```
GET    /api/logs/auth                   # Eventos de autenticación (admin+)
GET    /api/logs/admin                  # Acciones administrativas (admin+)
GET    /api/logs/records                # Fichajes con GPS (admin+)
```

---

## Roles y permisos

| Capacidad | Empleado | Admin | Superadmin |
|---|:---:|:---:|:---:|
| Fichar entrada / pausa / salida | ✓ | ✓ | ✓ |
| Ver historial propio | ✓ | ✓ | ✓ |
| Ver registros de empresa | — | ✓ | ✓ |
| Gestionar empleados | — | ✓ | ✓ |
| Gestionar turnos y horarios | — | ✓ | ✓ |
| Acceder a logs de auditoría | — | ✓ | ✓ |
| Gestionar empresas | — | — | ✓ |
| Ver todos los usuarios | — | — | ✓ |

---

## Instalación y arranque

### Requisitos previos
- Docker y Docker Compose v2
- Node.js LTS
- npm

### Backend

```bash
cd backend

# Copiar y configurar variables de entorno
cp .env.example .env

# Levantar backend + PostgreSQL + MongoDB
docker compose up --build
```

El servidor queda disponible en `http://localhost:3000`. La inicialización espera a que ambas bases de datos estén listas antes de abrir el puerto.

### Frontend

```bash
cd frontend

npm install
npm run dev
```

La aplicación queda disponible en `http://localhost:5173`. Las peticiones a `/api` se redirigen automáticamente al backend mediante el proxy de Vite.

---

## Tests

La batería de pruebas de integración cubre el 100% de los flujos críticos del MVP con peticiones HTTP reales contra el servidor en ejecución.

```bash
cd DOCS/scripts
chmod +x test_mvp.sh && ./test_mvp.sh
```

```
══════════════════════════════════════
RESUMEN
══════════════════════════════════════
Total pruebas: 44
Correctas:     44
Fallidas:      0
✅ MVP completamente funcional
```

### Cobertura por módulo

| Módulo | Pruebas |
|---|:---:|
| Health check | 1 |
| Autenticación (login · logout · refresh · bloqueos) | 5 |
| Usuarios (CRUD · activación · contraseña) | 9 |
| Empresas — superadmin (crear · activar · desactivar) | 6 |
| Turnos (crear · listar) | 2 |
| Horarios (asignar · estados · vistas por rol) | 4 |
| Fichajes (secuencia completa · status · historial) | 8 |
| Registros (filtrado por rol) | 2 |
| Logs MongoDB (acceso por rol) | 4 |
| Logout (los tres roles) | 3 |
| **Total** | **44** |

---

## Variables de entorno

Copia `backend/.env.example` como `backend/.env` y rellena los valores:

```env
# Servidor
PORT=3000
NODE_ENV=development

# PostgreSQL
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=isworking
POSTGRES_USER=isworking_user
POSTGRES_PASSWORD=your_password

# MongoDB
MONGO_URI=mongodb://localhost:27017/isworking_logs

# JWT
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d

# CORS
CLIENT_ORIGIN=http://localhost:5173
```

---

## Credenciales de prueba

| Rol | Email | Contraseña |
|---|---|---|
| Superadmin | `super@isworking.com` | `isworking123` |
| Admin | `admin@isworking.com` | `isworking123` |
| Empleado | `empleado@isworking.com` | `isworking123` |

> Las credenciales de los seeds solo deben usarse en entornos de desarrollo local. Nunca en producción.

---

## Roadmap

### Alta prioridad
- Edición de fichajes por parte del admin (correcciones manuales con trazabilidad)
- Alertas cuando un empleado lleva más de X horas sin fichar salida
- Validación de geofencing real en backend — la ubicación se guarda pero aún no se contrasta con el radio de la empresa
- Gestión de ausencias y vacaciones
- Dashboard con KPIs en tiempo real para el admin

### Media prioridad
- Exportación de registros a CSV/Excel por periodo
- Paginación server-side en tablas de registros y horarios
- Edición de empresa (coordenadas, radio, zona horaria)
- Recuperación de contraseña por email

### Baja prioridad
- App móvil nativa — el endpoint `POST /api/records/sync` ya está implementado en backend
- Soporte para múltiples pausas en el mismo día
- Informes mensuales automáticos por empleado
- Integración con Google Calendar y Outlook
- SSO / login con Google

---

## Contribución

El repositorio sigue **GitFlow adaptado**. Los commits directos sobre `main` están prohibidos.

```
main          → producción estable
dev           → integración backend
frontend      → integración frontend
feat/*        → desarrollo de módulos individuales
```

1. Crea tu rama desde `dev`: `git checkout -b feat/nombre`
2. Desarrolla y prueba localmente con `test_mvp.sh`
3. Abre una PR hacia `dev` con descripción del cambio
4. Tras revisión, se mergea a `dev` y eventualmente a `main`

---

<div align="center">

Proyecto final de bootcamp FullStack theBridge · IsWorking · 2025

</div>