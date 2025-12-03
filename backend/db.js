// Simple SQLite database setup using better-sqlite3
const Database = require('better-sqlite3')
const path = require('path')

const dbPath = process.env.DB_PATH || path.join(__dirname, 'quickoptics.db')
const db = new Database(dbPath)

// Initialize tables
db.exec(`
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT,
    email TEXT UNIQUE NOT NULL,
    password TEXT,
    userType TEXT DEFAULT 'patient',
    verified INTEGER DEFAULT 0,
    paymentConfirmed INTEGER DEFAULT 0,
    paymentMethod TEXT,
    otp TEXT,
    otpExpires INTEGER,
    createdAt TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS clinics (
    id TEXT PRIMARY KEY,
    user_id TEXT UNIQUE NOT NULL,
    clinicName TEXT NOT NULL,
    licenseNumber TEXT,
    address TEXT,
    phone TEXT,
    website TEXT,
    licenseTier TEXT DEFAULT 'basic',
    maxPatients INTEGER DEFAULT 50,
    activePatients INTEGER DEFAULT 0,
    licenseExpires TEXT,
    createdAt TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS patient_licenses (
    id TEXT PRIMARY KEY,
    clinic_id TEXT NOT NULL,
    patient_id TEXT NOT NULL,
    licenseCode TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'active',
    assignedAt TEXT NOT NULL,
    expiresAt TEXT,
    notes TEXT,
    FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE CASCADE,
    FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS clinic_patients (
    id TEXT PRIMARY KEY,
    clinic_id TEXT NOT NULL,
    patient_id TEXT NOT NULL,
    assignedBy TEXT,
    assignedAt TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    notes TEXT,
    FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE CASCADE,
    FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(clinic_id, patient_id)
  );

  CREATE TABLE IF NOT EXISTS test_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    test_id TEXT UNIQUE NOT NULL,
    user_id TEXT,
    session_id TEXT,
    test_type TEXT NOT NULL,
    results_data TEXT NOT NULL,
    metadata TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS game_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    game_id TEXT UNIQUE NOT NULL,
    user_id TEXT,
    session_id TEXT,
    game_type TEXT NOT NULL,
    score INTEGER NOT NULL,
    level INTEGER DEFAULT 1,
    duration INTEGER DEFAULT 0,
    accuracy REAL DEFAULT 0,
    metadata TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS cvie_analyses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    analysis_id TEXT UNIQUE NOT NULL,
    user_id TEXT,
    session_id TEXT,
    analysis_data TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS payments (
    id TEXT PRIMARY KEY,
    userId TEXT,
    email TEXT,
    transactionId TEXT,
    method TEXT,
    amount INTEGER,
    status TEXT,
    createdAt TEXT NOT NULL,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS annotations (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    imageId TEXT NOT NULL,
    imageName TEXT NOT NULL,
    condition TEXT NOT NULL,
    severity TEXT DEFAULT 'mild',
    confidence REAL DEFAULT 1.0,
    notes TEXT,
    landmarks TEXT,
    timestamp TEXT NOT NULL,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS cloud_scores (
    id TEXT PRIMARY KEY,
    userId TEXT,
    scanId TEXT,
    features TEXT NOT NULL,
    predictions TEXT NOT NULL,
    confidence REAL NOT NULL,
    insights TEXT,
    modelVersion TEXT DEFAULT '1.0.0',
    timestamp TEXT NOT NULL,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS mobile_sessions (
    id TEXT PRIMARY KEY,
    userId TEXT,
    deviceInfo TEXT,
    userAgent TEXT,
    speechSupported INTEGER DEFAULT 0,
    lastActivity TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL
  );
`)

module.exports = db


