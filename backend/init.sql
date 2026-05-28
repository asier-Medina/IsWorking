-- Limpiar y recrear
CREATE DATABASE isworking;

CREATE TABLE IF NOT EXISTS companies (
  id               SERIAL PRIMARY KEY,
  name             VARCHAR(100) NOT NULL,
  timezone         VARCHAR(50)  DEFAULT 'Europe/Madrid',
  office_latitude  DECIMAL(9,6),
  office_longitude DECIMAL(9,6),
  office_radius_m  INTEGER      DEFAULT 200,
  active           BOOLEAN      DEFAULT true,
  created_at       TIMESTAMP    DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
  id             SERIAL PRIMARY KEY,
  company_id     INTEGER      REFERENCES companies(id) ON DELETE CASCADE,
  name           VARCHAR(100) NOT NULL,
  email          VARCHAR(150) UNIQUE NOT NULL,
  password_hash  VARCHAR(255) NOT NULL,
  role           VARCHAR(20)  DEFAULT 'employee'
                   CHECK (role IN ('superadmin', 'admin', 'employee')),
  remote_allowed BOOLEAN      DEFAULT false,
  active         BOOLEAN      DEFAULT true,
  created_at     TIMESTAMP    DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS shift_templates (
  id           SERIAL PRIMARY KEY,
  company_id   INTEGER     REFERENCES companies(id) ON DELETE CASCADE,
  name         VARCHAR(50) NOT NULL,
  type         VARCHAR(20) NOT NULL
                 CHECK (type IN ('morning', 'afternoon', 'split')),
  start_time   TIME        NOT NULL,
  end_time     TIME        NOT NULL,
  break_start  TIME,
  break_end    TIME,
  has_break    BOOLEAN     DEFAULT false
);

CREATE TABLE IF NOT EXISTS schedules (
  id                SERIAL PRIMARY KEY,
  user_id           INTEGER  REFERENCES users(id) ON DELETE CASCADE,
  shift_template_id INTEGER  REFERENCES shift_templates(id),
  work_date         DATE     NOT NULL,
  status            VARCHAR(20) DEFAULT 'assigned'
                      CHECK (status IN ('assigned', 'confirmed', 'absent')),
  created_by        INTEGER  REFERENCES users(id),
  created_at        TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS time_records (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER      REFERENCES users(id) ON DELETE CASCADE,
  schedule_id INTEGER      REFERENCES schedules(id),
  type        VARCHAR(20)  NOT NULL
                CHECK (type IN ('entry', 'break_start', 'break_end', 'exit')),
  mode        VARCHAR(20)  DEFAULT 'office'
                CHECK (mode IN ('office', 'remote')),
  timestamp   TIMESTAMPTZ  NOT NULL,
  latitude    DECIMAL(9,6),
  longitude   DECIMAL(9,6),
  accuracy    DECIMAL(6,2),
  synced      BOOLEAN      DEFAULT true,
  created_at  TIMESTAMP    DEFAULT NOW()
);

-- ========================
-- COMPANIES
-- ========================

INSERT INTO companies (name, timezone, office_latitude, office_longitude, office_radius_m)
VALUES
  ('IsWorking HQ',          'Europe/Madrid', 43.2630, -2.9350, 250),
  ('Tecnologías Bilbao S.L.','Europe/Madrid', 43.2569, -2.9230, 200),
  ('Logística Norte S.A.',  'Europe/Madrid', 43.3200, -1.9800, 300),
  ('Retail Moda S.L.',      'Europe/Madrid', 40.4168, -3.7038, 150);

-- ========================
-- USERS
-- Todos con contraseña: isworking123
-- Hash: $2b$10$lUJ0le4Lvv7HFpbgKKlPcuBpoTb6xLOAZ7Ojuqcec3EUM9UDN3Ery
-- ========================

INSERT INTO users (company_id, name, email, password_hash, role, remote_allowed)
VALUES
  -- ── IsWorking HQ ──────────────────────────────
  (1, 'Super Admin',     'super@isworking.com',
   '$2b$10$lUJ0le4Lvv7HFpbgKKlPcuBpoTb6xLOAZ7Ojuqcec3EUM9UDN3Ery',
   'superadmin', true),

  (1, 'Laura Admin',     'admin@isworking.com',
   '$2b$10$lUJ0le4Lvv7HFpbgKKlPcuBpoTb6xLOAZ7Ojuqcec3EUM9UDN3Ery',
   'admin', true),

  (1, 'Jon Empleado',    'empleado@isworking.com',
   '$2b$10$lUJ0le4Lvv7HFpbgKKlPcuBpoTb6xLOAZ7Ojuqcec3EUM9UDN3Ery',
   'employee', false),

  (1, 'Amaia Zubia',     'amaia@isworking.com',
   '$2b$10$lUJ0le4Lvv7HFpbgKKlPcuBpoTb6xLOAZ7Ojuqcec3EUM9UDN3Ery',
   'employee', true),

  (1, 'Mikel Gaztañaga', 'mikel@isworking.com',
   '$2b$10$lUJ0le4Lvv7HFpbgKKlPcuBpoTb6xLOAZ7Ojuqcec3EUM9UDN3Ery',
   'employee', true),

  -- ── Tecnologías Bilbao ────────────────────────
  (2, 'Ane Kortabarria',  'ane.admin@tecnobilbao.com',
   '$2b$10$lUJ0le4Lvv7HFpbgKKlPcuBpoTb6xLOAZ7Ojuqcec3EUM9UDN3Ery',
   'admin', true),

  (2, 'Gorka Etxeberria', 'gorka@tecnobilbao.com',
   '$2b$10$lUJ0le4Lvv7HFpbgKKlPcuBpoTb6xLOAZ7Ojuqcec3EUM9UDN3Ery',
   'employee', true),

  (2, 'Leire Urrutia',    'leire@tecnobilbao.com',
   '$2b$10$lUJ0le4Lvv7HFpbgKKlPcuBpoTb6xLOAZ7Ojuqcec3EUM9UDN3Ery',
   'employee', false),

  (2, 'Iñaki Mendizabal', 'inaki@tecnobilbao.com',
   '$2b$10$lUJ0le4Lvv7HFpbgKKlPcuBpoTb6xLOAZ7Ojuqcec3EUM9UDN3Ery',
   'employee', true),

  (2, 'Sara Arrizabalaga', 'sara@tecnobilbao.com',
   '$2b$10$lUJ0le4Lvv7HFpbgKKlPcuBpoTb6xLOAZ7Ojuqcec3EUM9UDN3Ery',
   'employee', false),

  -- ── Logística Norte ───────────────────────────
  (3, 'Carlos Perez',    'carlos.admin@lognorte.com',
   '$2b$10$lUJ0le4Lvv7HFpbgKKlPcuBpoTb6xLOAZ7Ojuqcec3EUM9UDN3Ery',
   'admin', false),

  (3, 'Marta Ruiz',      'marta@lognorte.com',
   '$2b$10$lUJ0le4Lvv7HFpbgKKlPcuBpoTb6xLOAZ7Ojuqcec3EUM9UDN3Ery',
   'employee', false),

  (3, 'Pablo Jimenez',   'pablo@lognorte.com',
   '$2b$10$lUJ0le4Lvv7HFpbgKKlPcuBpoTb6xLOAZ7Ojuqcec3EUM9UDN3Ery',
   'employee', false),

  (3, 'Elena Moreno',    'elena@lognorte.com',
   '$2b$10$lUJ0le4Lvv7HFpbgKKlPcuBpoTb6xLOAZ7Ojuqcec3EUM9UDN3Ery',
   'employee', false),

  -- ── Retail Moda ───────────────────────────────
  (4, 'Sofia Torres',    'sofia.admin@retailmoda.com',
   '$2b$10$lUJ0le4Lvv7HFpbgKKlPcuBpoTb6xLOAZ7Ojuqcec3EUM9UDN3Ery',
   'admin', false),

  (4, 'Diego Navarro',   'diego@retailmoda.com',
   '$2b$10$lUJ0le4Lvv7HFpbgKKlPcuBpoTb6xLOAZ7Ojuqcec3EUM9UDN3Ery',
   'employee', false),

  (4, 'Carmen Lopez',    'carmen@retailmoda.com',
   '$2b$10$lUJ0le4Lvv7HFpbgKKlPcuBpoTb6xLOAZ7Ojuqcec3EUM9UDN3Ery',
   'employee', false),

  (4, 'Raul Fernandez',  'raul@retailmoda.com',
   '$2b$10$lUJ0le4Lvv7HFpbgKKlPcuBpoTb6xLOAZ7Ojuqcec3EUM9UDN3Ery',
   'employee', false);

-- ========================
-- SHIFT TEMPLATES
-- ========================

-- IsWorking HQ (company 1)
INSERT INTO shift_templates (company_id, name, type, start_time, end_time, break_start, break_end, has_break)
VALUES
  (1, 'Turno Mañana',   'morning',   '08:00', '16:00', '12:00', '12:30', true),
  (1, 'Turno Tarde',    'afternoon', '14:00', '22:00', '18:00', '18:30', true),
  (1, 'Turno Partido',  'split',     '09:00', '19:00', '14:00', '16:00', true),

-- Tecnologías Bilbao (company 2)
  (2, 'Jornada Completa','morning',  '09:00', '18:00', '13:00', '14:00', true),
  (2, 'Media Jornada',  'morning',   '09:00', '13:00', NULL,    NULL,    false),
  (2, 'Turno Tarde',    'afternoon', '13:00', '21:00', '17:00', '17:30', true),

-- Logística Norte (company 3)
  (3, 'Turno Mañana',   'morning',   '06:00', '14:00', '10:00', '10:30', true),
  (3, 'Turno Tarde',    'afternoon', '14:00', '22:00', '18:00', '18:30', true),
  (3, 'Turno Noche',    'split',     '22:00', '06:00', '02:00', '02:30', true),

-- Retail Moda (company 4)
  (4, 'Apertura',       'morning',   '09:00', '15:00', NULL,    NULL,    false),
  (4, 'Cierre',         'afternoon', '15:00', '21:00', NULL,    NULL,    false),
  (4, 'Jornada Partida','split',     '10:00', '20:00', '14:00', '16:00', true);

-- ========================
-- SCHEDULES
-- ========================

-- IsWorking HQ — empleados
INSERT INTO schedules (user_id, shift_template_id, work_date, status, created_by)
VALUES
  -- Jon Empleado (id=3) — turno mañana esta semana
  (3, 1, CURRENT_DATE - 4, 'confirmed', 2),
  (3, 1, CURRENT_DATE - 3, 'confirmed', 2),
  (3, 1, CURRENT_DATE - 2, 'confirmed', 2),
  (3, 1, CURRENT_DATE - 1, 'confirmed', 2),
  (3, 1, CURRENT_DATE,     'confirmed', 2),
  (3, 1, CURRENT_DATE + 1, 'assigned',  2),
  (3, 1, CURRENT_DATE + 2, 'assigned',  2),

  -- Amaia Zubia (id=4) — turno partido
  (4, 3, CURRENT_DATE - 4, 'confirmed', 2),
  (4, 3, CURRENT_DATE - 3, 'confirmed', 2),
  (4, 3, CURRENT_DATE - 2, 'confirmed', 2),
  (4, 3, CURRENT_DATE - 1, 'absent',    2),
  (4, 3, CURRENT_DATE,     'confirmed', 2),
  (4, 3, CURRENT_DATE + 1, 'assigned',  2),

  -- Mikel Gaztañaga (id=5) — turno tarde
  (5, 2, CURRENT_DATE - 4, 'confirmed', 2),
  (5, 2, CURRENT_DATE - 3, 'confirmed', 2),
  (5, 2, CURRENT_DATE - 2, 'confirmed', 2),
  (5, 2, CURRENT_DATE - 1, 'confirmed', 2),
  (5, 2, CURRENT_DATE,     'confirmed', 2),

  -- Tecnologías Bilbao
  (7, 4, CURRENT_DATE - 4, 'confirmed', 6),
  (7, 4, CURRENT_DATE - 3, 'confirmed', 6),
  (7, 4, CURRENT_DATE - 2, 'confirmed', 6),
  (7, 4, CURRENT_DATE - 1, 'confirmed', 6),
  (7, 4, CURRENT_DATE,     'confirmed', 6),
  (7, 4, CURRENT_DATE + 1, 'assigned',  6),

  (8, 6, CURRENT_DATE - 4, 'confirmed', 6),
  (8, 6, CURRENT_DATE - 3, 'confirmed', 6),
  (8, 6, CURRENT_DATE - 2, 'absent',    6),
  (8, 6, CURRENT_DATE - 1, 'confirmed', 6),
  (8, 6, CURRENT_DATE,     'confirmed', 6),

  (9, 4, CURRENT_DATE - 2, 'confirmed', 6),
  (9, 4, CURRENT_DATE - 1, 'confirmed', 6),
  (9, 4, CURRENT_DATE,     'confirmed', 6),
  (9, 4, CURRENT_DATE + 1, 'assigned',  6),

  (10, 5, CURRENT_DATE - 1, 'confirmed', 6),
  (10, 5, CURRENT_DATE,     'confirmed', 6),

  -- Logística Norte
  (12, 7, CURRENT_DATE - 4, 'confirmed', 11),
  (12, 7, CURRENT_DATE - 3, 'confirmed', 11),
  (12, 7, CURRENT_DATE - 2, 'confirmed', 11),
  (12, 7, CURRENT_DATE - 1, 'confirmed', 11),
  (12, 7, CURRENT_DATE,     'confirmed', 11),

  (13, 8, CURRENT_DATE - 4, 'confirmed', 11),
  (13, 8, CURRENT_DATE - 3, 'confirmed', 11),
  (13, 8, CURRENT_DATE - 2, 'confirmed', 11),
  (13, 8, CURRENT_DATE - 1, 'absent',    11),
  (13, 8, CURRENT_DATE,     'confirmed', 11),

  (14, 9, CURRENT_DATE - 2, 'confirmed', 11),
  (14, 9, CURRENT_DATE - 1, 'confirmed', 11),
  (14, 9, CURRENT_DATE,     'confirmed', 11),

  -- Retail Moda
  (16, 10, CURRENT_DATE - 4, 'confirmed', 15),
  (16, 10, CURRENT_DATE - 3, 'confirmed', 15),
  (16, 10, CURRENT_DATE - 2, 'confirmed', 15),
  (16, 10, CURRENT_DATE - 1, 'confirmed', 15),
  (16, 10, CURRENT_DATE,     'confirmed', 15),

  (17, 11, CURRENT_DATE - 4, 'confirmed', 15),
  (17, 11, CURRENT_DATE - 3, 'absent',    15),
  (17, 11, CURRENT_DATE - 2, 'confirmed', 15),
  (17, 11, CURRENT_DATE - 1, 'confirmed', 15),
  (17, 11, CURRENT_DATE,     'confirmed', 15),

  (18, 12, CURRENT_DATE - 1, 'confirmed', 15),
  (18, 12, CURRENT_DATE,     'assigned',  15);

-- ========================
-- TIME RECORDS
-- Fichajes realistas de los últimos 5 días
-- ========================

-- ── Jon Empleado (id=3) — turno mañana 08:00-16:00 ──

INSERT INTO time_records (user_id, schedule_id, type, mode, timestamp, latitude, longitude, accuracy)
VALUES
  -- Hace 4 días
  (3, 1, 'entry',       'office', CURRENT_DATE - 4 + TIME '07:58:00', 43.2631, -2.9351, 6.0),
  (3, 1, 'break_start', 'office', CURRENT_DATE - 4 + TIME '12:01:00', 43.2631, -2.9351, 6.0),
  (3, 1, 'break_end',   'office', CURRENT_DATE - 4 + TIME '12:32:00', 43.2631, -2.9351, 6.0),
  (3, 1, 'exit',        'office', CURRENT_DATE - 4 + TIME '16:03:00', 43.2631, -2.9351, 6.0),

  -- Hace 3 días
  (3, 2, 'entry',       'office', CURRENT_DATE - 3 + TIME '08:02:00', 43.2631, -2.9351, 5.5),
  (3, 2, 'break_start', 'office', CURRENT_DATE - 3 + TIME '12:00:00', 43.2631, -2.9351, 5.5),
  (3, 2, 'break_end',   'office', CURRENT_DATE - 3 + TIME '12:30:00', 43.2631, -2.9351, 5.5),
  (3, 2, 'exit',        'office', CURRENT_DATE - 3 + TIME '16:01:00', 43.2631, -2.9351, 5.5),

  -- Hace 2 días
  (3, 3, 'entry',       'office', CURRENT_DATE - 2 + TIME '07:55:00', 43.2631, -2.9351, 7.0),
  (3, 3, 'break_start', 'office', CURRENT_DATE - 2 + TIME '11:58:00', 43.2631, -2.9351, 7.0),
  (3, 3, 'break_end',   'office', CURRENT_DATE - 2 + TIME '12:28:00', 43.2631, -2.9351, 7.0),
  (3, 3, 'exit',        'office', CURRENT_DATE - 2 + TIME '15:59:00', 43.2631, -2.9351, 7.0),

  -- Ayer
  (3, 4, 'entry',       'office', CURRENT_DATE - 1 + TIME '08:05:00', 43.2631, -2.9351, 5.0),
  (3, 4, 'break_start', 'office', CURRENT_DATE - 1 + TIME '12:03:00', 43.2631, -2.9351, 5.0),
  (3, 4, 'break_end',   'office', CURRENT_DATE - 1 + TIME '12:35:00', 43.2631, -2.9351, 5.0),
  (3, 4, 'exit',        'office', CURRENT_DATE - 1 + TIME '16:02:00', 43.2631, -2.9351, 5.0),

  -- Hoy — ya ha fichado entrada
  (3, 5, 'entry',       'office', CURRENT_DATE + TIME '07:59:00', 43.2631, -2.9351, 6.5),

-- ── Amaia Zubia (id=4) — turno partido — remote_allowed ──

  (4, 8,  'entry',       'remote', CURRENT_DATE - 4 + TIME '09:02:00', 43.2720, -2.9410, 12.0),
  (4, 8,  'break_start', 'remote', CURRENT_DATE - 4 + TIME '14:01:00', 43.2720, -2.9410, 12.0),
  (4, 8,  'break_end',   'remote', CURRENT_DATE - 4 + TIME '16:00:00', 43.2720, -2.9410, 12.0),
  (4, 8,  'exit',        'remote', CURRENT_DATE - 4 + TIME '19:02:00', 43.2720, -2.9410, 12.0),

  (4, 9,  'entry',       'office', CURRENT_DATE - 3 + TIME '09:00:00', 43.2630, -2.9350, 5.0),
  (4, 9,  'break_start', 'office', CURRENT_DATE - 3 + TIME '14:00:00', 43.2630, -2.9350, 5.0),
  (4, 9,  'break_end',   'office', CURRENT_DATE - 3 + TIME '16:00:00', 43.2630, -2.9350, 5.0),
  (4, 9,  'exit',        'office', CURRENT_DATE - 3 + TIME '19:00:00', 43.2630, -2.9350, 5.0),

  (4, 10, 'entry',       'remote', CURRENT_DATE - 2 + TIME '09:10:00', 43.2720, -2.9410, 10.0),
  (4, 10, 'break_start', 'remote', CURRENT_DATE - 2 + TIME '14:05:00', 43.2720, -2.9410, 10.0),
  (4, 10, 'break_end',   'remote', CURRENT_DATE - 2 + TIME '16:10:00', 43.2720, -2.9410, 10.0),
  (4, 10, 'exit',        'remote', CURRENT_DATE - 2 + TIME '19:08:00', 43.2720, -2.9410, 10.0),

  -- Ayer ausente — sin fichajes

  -- Hoy
  (4, 12, 'entry',       'remote', CURRENT_DATE + TIME '09:01:00', 43.2720, -2.9410, 11.0),
  (4, 12, 'break_start', 'remote', CURRENT_DATE + TIME '14:00:00', 43.2720, -2.9410, 11.0),
  (4, 12, 'break_end',   'remote', CURRENT_DATE + TIME '16:00:00', 43.2720, -2.9410, 11.0),

-- ── Mikel Gaztañaga (id=5) — turno tarde 14:00-22:00 ──

  (5, 15, 'entry',       'office', CURRENT_DATE - 4 + TIME '14:00:00', 43.2630, -2.9350, 5.0),
  (5, 15, 'break_start', 'office', CURRENT_DATE - 4 + TIME '18:00:00', 43.2630, -2.9350, 5.0),
  (5, 15, 'break_end',   'office', CURRENT_DATE - 4 + TIME '18:30:00', 43.2630, -2.9350, 5.0),
  (5, 15, 'exit',        'office', CURRENT_DATE - 4 + TIME '22:01:00', 43.2630, -2.9350, 5.0),

  (5, 16, 'entry',       'office', CURRENT_DATE - 3 + TIME '13:58:00', 43.2630, -2.9350, 5.0),
  (5, 16, 'break_start', 'office', CURRENT_DATE - 3 + TIME '18:02:00', 43.2630, -2.9350, 5.0),
  (5, 16, 'break_end',   'office', CURRENT_DATE - 3 + TIME '18:33:00', 43.2630, -2.9350, 5.0),
  (5, 16, 'exit',        'office', CURRENT_DATE - 3 + TIME '22:00:00', 43.2630, -2.9350, 5.0),

  (5, 17, 'entry',       'office', CURRENT_DATE - 2 + TIME '14:03:00', 43.2630, -2.9350, 5.0),
  (5, 17, 'break_start', 'office', CURRENT_DATE - 2 + TIME '18:01:00', 43.2630, -2.9350, 5.0),
  (5, 17, 'break_end',   'office', CURRENT_DATE - 2 + TIME '18:31:00', 43.2630, -2.9350, 5.0),
  (5, 17, 'exit',        'office', CURRENT_DATE - 2 + TIME '22:02:00', 43.2630, -2.9350, 5.0),

  (5, 18, 'entry',       'office', CURRENT_DATE - 1 + TIME '14:01:00', 43.2630, -2.9350, 5.0),
  (5, 18, 'break_start', 'office', CURRENT_DATE - 1 + TIME '18:00:00', 43.2630, -2.9350, 5.0),
  (5, 18, 'break_end',   'office', CURRENT_DATE - 1 + TIME '18:30:00', 43.2630, -2.9350, 5.0),
  (5, 18, 'exit',        'office', CURRENT_DATE - 1 + TIME '21:59:00', 43.2630, -2.9350, 5.0),

  (5, 19, 'entry',       'office', CURRENT_DATE + TIME '14:00:00', 43.2630, -2.9350, 5.0),

-- ── Gorka Etxeberria (id=7) — TecnoBilbao — jornada completa ──

  (7, 20, 'entry',       'office', CURRENT_DATE - 4 + TIME '09:01:00', 43.2569, -2.9230, 8.0),
  (7, 20, 'break_start', 'office', CURRENT_DATE - 4 + TIME '13:00:00', 43.2569, -2.9230, 8.0),
  (7, 20, 'break_end',   'office', CURRENT_DATE - 4 + TIME '14:00:00', 43.2569, -2.9230, 8.0),
  (7, 20, 'exit',        'office', CURRENT_DATE - 4 + TIME '18:02:00', 43.2569, -2.9230, 8.0),

  (7, 21, 'entry',       'remote', CURRENT_DATE - 3 + TIME '09:05:00', 43.2800, -2.9100, 15.0),
  (7, 21, 'break_start', 'remote', CURRENT_DATE - 3 + TIME '13:02:00', 43.2800, -2.9100, 15.0),
  (7, 21, 'break_end',   'remote', CURRENT_DATE - 3 + TIME '14:01:00', 43.2800, -2.9100, 15.0),
  (7, 21, 'exit',        'remote', CURRENT_DATE - 3 + TIME '18:00:00', 43.2800, -2.9100, 15.0),

  (7, 22, 'entry',       'office', CURRENT_DATE - 2 + TIME '08:59:00', 43.2569, -2.9230, 8.0),
  (7, 22, 'break_start', 'office', CURRENT_DATE - 2 + TIME '13:00:00', 43.2569, -2.9230, 8.0),
  (7, 22, 'break_end',   'office', CURRENT_DATE - 2 + TIME '14:00:00', 43.2569, -2.9230, 8.0),
  (7, 22, 'exit',        'office', CURRENT_DATE - 2 + TIME '18:01:00', 43.2569, -2.9230, 8.0),

  (7, 23, 'entry',       'office', CURRENT_DATE - 1 + TIME '09:00:00', 43.2569, -2.9230, 8.0),
  (7, 23, 'break_start', 'office', CURRENT_DATE - 1 + TIME '13:01:00', 43.2569, -2.9230, 8.0),
  (7, 23, 'break_end',   'office', CURRENT_DATE - 1 + TIME '14:02:00', 43.2569, -2.9230, 8.0),
  (7, 23, 'exit',        'office', CURRENT_DATE - 1 + TIME '18:03:00', 43.2569, -2.9230, 8.0),

  (7, 24, 'entry',       'office', CURRENT_DATE + TIME '09:02:00', 43.2569, -2.9230, 8.0),

-- ── Leire Urrutia (id=8) — TecnoBilbao — turno tarde ──

  (8, 25, 'entry',       'office', CURRENT_DATE - 4 + TIME '13:02:00', 43.2569, -2.9230, 6.0),
  (8, 25, 'break_start', 'office', CURRENT_DATE - 4 + TIME '17:00:00', 43.2569, -2.9230, 6.0),
  (8, 25, 'break_end',   'office', CURRENT_DATE - 4 + TIME '17:31:00', 43.2569, -2.9230, 6.0),
  (8, 25, 'exit',        'office', CURRENT_DATE - 4 + TIME '21:01:00', 43.2569, -2.9230, 6.0),

  (8, 26, 'entry',       'office', CURRENT_DATE - 3 + TIME '13:00:00', 43.2569, -2.9230, 6.0),
  (8, 26, 'break_start', 'office', CURRENT_DATE - 3 + TIME '17:01:00', 43.2569, -2.9230, 6.0),
  (8, 26, 'break_end',   'office', CURRENT_DATE - 3 + TIME '17:30:00', 43.2569, -2.9230, 6.0),
  (8, 26, 'exit',        'office', CURRENT_DATE - 3 + TIME '21:00:00', 43.2569, -2.9230, 6.0),

  -- Hace 2 días ausente

  (8, 28, 'entry',       'office', CURRENT_DATE - 1 + TIME '13:05:00', 43.2569, -2.9230, 6.0),
  (8, 28, 'break_start', 'office', CURRENT_DATE - 1 + TIME '17:03:00', 43.2569, -2.9230, 6.0),
  (8, 28, 'break_end',   'office', CURRENT_DATE - 1 + TIME '17:33:00', 43.2569, -2.9230, 6.0),
  (8, 28, 'exit',        'office', CURRENT_DATE - 1 + TIME '21:02:00', 43.2569, -2.9230, 6.0),

  (8, 29, 'entry',       'office', CURRENT_DATE + TIME '13:01:00', 43.2569, -2.9230, 6.0),

-- ── Marta Ruiz (id=12) — Logística Norte — turno mañana 06:00 ──

  (12, 37, 'entry',       'office', CURRENT_DATE - 4 + TIME '05:58:00', 43.3200, -1.9800, 9.0),
  (12, 37, 'break_start', 'office', CURRENT_DATE - 4 + TIME '10:00:00', 43.3200, -1.9800, 9.0),
  (12, 37, 'break_end',   'office', CURRENT_DATE - 4 + TIME '10:31:00', 43.3200, -1.9800, 9.0),
  (12, 37, 'exit',        'office', CURRENT_DATE - 4 + TIME '14:01:00', 43.3200, -1.9800, 9.0),

  (12, 38, 'entry',       'office', CURRENT_DATE - 3 + TIME '06:00:00', 43.3200, -1.9800, 9.0),
  (12, 38, 'break_start', 'office', CURRENT_DATE - 3 + TIME '10:02:00', 43.3200, -1.9800, 9.0),
  (12, 38, 'break_end',   'office', CURRENT_DATE - 3 + TIME '10:32:00', 43.3200, -1.9800, 9.0),
  (12, 38, 'exit',        'office', CURRENT_DATE - 3 + TIME '14:00:00', 43.3200, -1.9800, 9.0),

  (12, 39, 'entry',       'office', CURRENT_DATE - 2 + TIME '06:02:00', 43.3200, -1.9800, 9.0),
  (12, 39, 'break_start', 'office', CURRENT_DATE - 2 + TIME '10:01:00', 43.3200, -1.9800, 9.0),
  (12, 39, 'break_end',   'office', CURRENT_DATE - 2 + TIME '10:30:00', 43.3200, -1.9800, 9.0),
  (12, 39, 'exit',        'office', CURRENT_DATE - 2 + TIME '14:02:00', 43.3200, -1.9800, 9.0),

  (12, 40, 'entry',       'office', CURRENT_DATE - 1 + TIME '05:59:00', 43.3200, -1.9800, 9.0),
  (12, 40, 'break_start', 'office', CURRENT_DATE - 1 + TIME '10:00:00', 43.3200, -1.9800, 9.0),
  (12, 40, 'break_end',   'office', CURRENT_DATE - 1 + TIME '10:30:00', 43.3200, -1.9800, 9.0),
  (12, 40, 'exit',        'office', CURRENT_DATE - 1 + TIME '14:01:00', 43.3200, -1.9800, 9.0),

  (12, 41, 'entry',       'office', CURRENT_DATE + TIME '06:00:00', 43.3200, -1.9800, 9.0),

-- ── Diego Navarro (id=16) — Retail Moda — apertura ──

  (16, 48, 'entry',  'office', CURRENT_DATE - 4 + TIME '09:00:00', 40.4168, -3.7038, 7.0),
  (16, 48, 'exit',   'office', CURRENT_DATE - 4 + TIME '15:01:00', 40.4168, -3.7038, 7.0),

  (16, 49, 'entry',  'office', CURRENT_DATE - 3 + TIME '09:02:00', 40.4168, -3.7038, 7.0),
  (16, 49, 'exit',   'office', CURRENT_DATE - 3 + TIME '15:00:00', 40.4168, -3.7038, 7.0),

  (16, 50, 'entry',  'office', CURRENT_DATE - 2 + TIME '08:58:00', 40.4168, -3.7038, 7.0),
  (16, 50, 'exit',   'office', CURRENT_DATE - 2 + TIME '15:02:00', 40.4168, -3.7038, 7.0),

  (16, 51, 'entry',  'office', CURRENT_DATE - 1 + TIME '09:01:00', 40.4168, -3.7038, 7.0),
  (16, 51, 'exit',   'office', CURRENT_DATE - 1 + TIME '15:00:00', 40.4168, -3.7038, 7.0),

  (16, 52, 'entry',  'office', CURRENT_DATE + TIME '09:00:00', 40.4168, -3.7038, 7.0),

-- ── Carmen Lopez (id=17) — Retail Moda — cierre ──

  (17, 53, 'entry',  'office', CURRENT_DATE - 4 + TIME '15:00:00', 40.4168, -3.7038, 7.0),
  (17, 53, 'exit',   'office', CURRENT_DATE - 4 + TIME '21:02:00', 40.4168, -3.7038, 7.0),

  (17, 55, 'entry',  'office', CURRENT_DATE - 2 + TIME '15:01:00', 40.4168, -3.7038, 7.0),
  (17, 55, 'exit',   'office', CURRENT_DATE - 2 + TIME '21:00:00', 40.4168, -3.7038, 7.0),

  (17, 56, 'entry',  'office', CURRENT_DATE - 1 + TIME '15:03:00', 40.4168, -3.7038, 7.0),
  (17, 56, 'exit',   'office', CURRENT_DATE - 1 + TIME '21:01:00', 40.4168, -3.7038, 7.0),

  (17, 57, 'entry',  'office', CURRENT_DATE + TIME '15:00:00', 40.4168, -3.7038, 7.0);