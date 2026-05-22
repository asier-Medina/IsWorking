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

-- =========================
-- COMPANIES
-- =========================

INSERT INTO companies 
(name, timezone, office_latitude, office_longitude, office_radius_m)
VALUES
('IsWorking Bilbao HQ', 'Europe/Madrid', 43.2630, -2.9350, 250),
('IsWorking Madrid Office', 'Europe/Madrid', 40.4168, -3.7038, 200);

-- =========================
-- USERS
-- =========================

INSERT INTO users
(company_id, name, email, password_hash, role, remote_allowed)
VALUES
(1, 'Asier Medina', 'asier@isworking.com', '12345', 'superadmin', true),
(1, 'Laura Gómez', 'laura@isworking.com', '$2b$10$hash2', 'admin', true),
(1, 'Jon Etxeberria', 'jon@isworking.com', '$2b$10$hash3', 'employee', false),
(1, 'Marta Ruiz', 'marta@isworking.com', '$2b$10$hash4', 'employee', true),

(2, 'Carlos Pérez', 'carlos@isworking.com', '$2b$10$hash5', 'admin', true),
(2, 'Ana Torres', 'ana@isworking.com', '$2b$10$hash6', 'employee', false);

-- =========================
-- SHIFT TEMPLATES
-- =========================

INSERT INTO shift_templates
(company_id, name, type, start_time, end_time, break_start, break_end, has_break)
VALUES
(1, 'Turno Mañana', 'morning', '08:00', '16:00', '12:00', '12:30', true),
(1, 'Turno Tarde', 'afternoon', '14:00', '22:00', '18:00', '18:30', true),
(1, 'Turno Partido', 'split', '09:00', '19:00', '14:00', '16:00', true),

(2, 'Mañana Madrid', 'morning', '07:00', '15:00', '11:00', '11:20', true),
(2, 'Tarde Madrid', 'afternoon', '15:00', '23:00', '19:00', '19:20', true);

-- =========================
-- SCHEDULES
-- =========================

INSERT INTO schedules
(user_id, shift_template_id, work_date, status, created_by)
VALUES
(3, 1, '2026-05-19', 'assigned', 2),
(4, 2, '2026-05-19', 'confirmed', 2),
(3, 1, '2026-05-20', 'assigned', 2),
(4, 3, '2026-05-20', 'assigned', 2),

(6, 4, '2026-05-19', 'confirmed', 5);

-- =========================
-- TIME RECORDS
-- =========================

INSERT INTO time_records
(user_id, schedule_id, type, mode, timestamp, latitude, longitude, accuracy)
VALUES

-- Jon - oficina
(3, 1, 'entry', 'office', '2026-05-19 07:58:10+02', 43.2632, -2.9352, 8.50),
(3, 1, 'break_start', 'office', '2026-05-19 12:01:22+02', 43.2631, -2.9350, 6.20),
(3, 1, 'break_end', 'office', '2026-05-19 12:29:55+02', 43.2631, -2.9351, 5.90),
(3, 1, 'exit', 'office', '2026-05-19 16:03:41+02', 43.2633, -2.9353, 7.00),

-- Marta - remoto
(4, 2, 'entry', 'remote', '2026-05-19 13:55:02+02', 43.2700, -2.9400, 15.30),
(4, 2, 'break_start', 'remote', '2026-05-19 18:02:11+02', 43.2701, -2.9402, 12.80),
(4, 2, 'break_end', 'remote', '2026-05-19 18:28:43+02', 43.2700, -2.9401, 11.40),
(4, 2, 'exit', 'remote', '2026-05-19 22:01:17+02', 43.2702, -2.9400, 10.50),

-- Ana - Madrid
(6, 5, 'entry', 'office', '2026-05-19 06:59:01+02', 40.4169, -3.7039, 4.80),
(6, 5, 'break_start', 'office', '2026-05-19 11:03:15+02', 40.4170, -3.7040, 5.10),
(6, 5, 'break_end', 'office', '2026-05-19 11:19:48+02', 40.4168, -3.7038, 4.50),
(6, 5, 'exit', 'office', '2026-05-19 15:02:22+02', 40.4169, -3.7037, 4.70);