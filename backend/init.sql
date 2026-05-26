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
  ('IsWorking HQ', 'Europe/Madrid', 43.2630, -2.9350, 250),
  ('Cliente Ejemplo S.L.', 'Europe/Madrid', 40.4168, -3.7038, 200);

-- ========================
-- USERS
-- Todos con contraseña: isworking123
-- Hash bcrypt (cost 10) de "isworking123"
-- ========================

INSERT INTO users (company_id, name, email, password_hash, role, remote_allowed)
VALUES
  -- Superadmin
  (1, 'Super Admin', 'super@isworking.com',
   '$2b$10$7Wus1YJVYRvKEbAdI7BtvOj3tiTWEKFhKOqjpt/3xwzDnYvBa/IUG',
   'superadmin', true),

  -- Admin empresa 1
  (1, 'Laura Admin', 'admin@isworking.com',
   '$2b$10$7Wus1YJVYRvKEbAdI7BtvOj3tiTWEKFhKOqjpt/3xwzDnYvBa/IUG',
   'admin', true),

  -- Empleado empresa 1
  (1, 'Jon Empleado', 'empleado@isworking.com',
   '$2b$10$7Wus1YJVYRvKEbAdI7BtvOj3tiTWEKFhKOqjpt/3xwzDnYvBa/IUG',
   'employee', false);

-- ========================
-- SHIFT TEMPLATES
-- ========================

INSERT INTO shift_templates (company_id, name, type, start_time, end_time, break_start, break_end, has_break)
VALUES
  (1, 'Turno Mañana',  'morning',   '08:00', '16:00', '12:00', '12:30', true),
  (1, 'Turno Tarde',   'afternoon', '14:00', '22:00', '18:00', '18:30', true),
  (1, 'Turno Partido', 'split',     '09:00', '19:00', '14:00', '16:00', true);

-- ========================
-- SCHEDULES
-- ========================

INSERT INTO schedules (user_id, shift_template_id, work_date, status, created_by)
VALUES
  (3, 1, CURRENT_DATE, 'assigned', 2),
  (3, 1, CURRENT_DATE + 1, 'assigned', 2);

-- ========================
-- TIME RECORDS (hoy — empleado ya ha fichado entrada)
-- ========================

INSERT INTO time_records (user_id, schedule_id, type, mode, timestamp, latitude, longitude, accuracy)
VALUES
  (3, 1, 'entry', 'office', NOW() - INTERVAL '2 hours', 43.2632, -2.9352, 8.5);