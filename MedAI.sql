SELECT * FROM med_users;
SELECT * FROM patients;
SELECT * FROM doctors;
SELECT * FROM diagnosis_history;
SELECT * FROM chat_room;
SELECT * FROM chat_users;
SELECT * FROM chat_messages;
SELECT * FROM medical_records;


UPDATE med_users
SET role = 'admin'
WHERE id = 6;

-- Таблица med_users
CREATE TABLE med_users (
    id SERIAL PRIMARY KEY,
    role VARCHAR(10) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'doctor', 'admin')),
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender CHAR(1) NOT NULL CHECK (gender IN ('M', 'F')),
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    wallet DECIMAL(10, 2) DEFAULT 0.00,
    avatar VARCHAR(255),
    ai_history_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Таблица patients
CREATE TABLE patients (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE REFERENCES med_users(id) ON DELETE CASCADE,
    phone VARCHAR(20),
    blood_type VARCHAR(3),
    allergies TEXT,
    chronic_conditions TEXT
);

-- Таблица doctors
CREATE TABLE doctors (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE REFERENCES med_users(id) ON DELETE CASCADE,
    specialization VARCHAR(100),
    experience_years INTEGER,
    bio TEXT,
    is_approved BOOLEAN DEFAULT FALSE,
    price DECIMAL(10, 2) NOT NULL DEFAULT 500.00
);

UPDATE doctors
SET is_approved = TRUE;


-- Таблица diagnosis_history
CREATE TABLE diagnosis_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES med_users(id) ON DELETE SET NULL,
    diagnosis_id VARCHAR(36) NOT NULL UNIQUE,
    symptoms TEXT NOT NULL,
    diagnosis_data JSON NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
UPDATE diagnosis_history
SET user_id = 7
WHERE user_id IS NULL;


-- Индексы для diagnosis_history
CREATE INDEX diagnosis_history_diagnosis_id_idx ON diagnosis_history (diagnosis_id);
CREATE INDEX diagnosis_history_user_id_idx ON diagnosis_history (user_id);

-- Таблица chat_room
CREATE TABLE chat_room (
    id SERIAL PRIMARY KEY,
    name_chat_room VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    is_locked BOOLEAN DEFAULT FALSE
);

-- Таблица chat_users
CREATE TABLE chat_users (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES med_users(id) ON DELETE CASCADE,
    chat_room_id INTEGER NOT NULL REFERENCES chat_room(id) ON DELETE CASCADE
);

-- Таблица chat_messages
CREATE TABLE chat_messages (
    id SERIAL PRIMARY KEY,
    chat_room_id INTEGER NOT NULL REFERENCES chat_room(id) ON DELETE CASCADE,
    sender_id INTEGER NOT NULL REFERENCES med_users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    sent_at TIMESTAMP DEFAULT NOW()
);

-- Таблица medical_records
CREATE TABLE medical_records (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id INTEGER NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    diagnosis TEXT NOT NULL,
    treatment TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

DROP TABLE IF EXISTS med_users CASCADE;
DROP TABLE IF EXISTS patients CASCADE;
DROP TABLE IF EXISTS doctors CASCADE;
DROP TABLE IF EXISTS diagnosis_history CASCADE;
DROP TABLE IF EXISTS chat_room CASCADE;
DROP TABLE IF EXISTS chat_users CASCADE;
DROP TABLE IF EXISTS chat_messages CASCADE;
DROP TABLE IF EXISTS medical_records CASCADE;