import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { INITIAL_APPLIANCES, SYSTEM_CONFIG } from './constants.js';

import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = process.env.DATABASE_PATH || path.resolve(__dirname, '../../tracker.db');
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

export const db = new Database(dbPath);

// Enable WAL mode for high performance concurrent read/write
db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS appliances (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      location TEXT NOT NULL,
      rated_power REAL NOT NULL,
      min_power REAL NOT NULL,
      max_power REAL NOT NULL,
      power_factor REAL NOT NULL,
      is_on INTEGER DEFAULT 1,
      is_anomaly INTEGER DEFAULT 0,
      total_runtime_seconds INTEGER DEFAULT 0,
      total_energy_kwh REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS sensor_readings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      device_id TEXT NOT NULL,
      appliance_id TEXT NOT NULL,
      voltage REAL NOT NULL,
      current REAL NOT NULL,
      power_factor REAL NOT NULL,
      active_power REAL NOT NULL,
      apparent_power REAL NOT NULL,
      energy_delta_kwh REAL NOT NULL,
      status TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_readings_timestamp ON sensor_readings(timestamp);
    CREATE INDEX IF NOT EXISTS idx_readings_appliance ON sensor_readings(appliance_id, timestamp);

    CREATE TABLE IF NOT EXISTS hourly_analytics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date_hour TEXT NOT NULL, -- 'YYYY-MM-DD HH:00'
      appliance_id TEXT NOT NULL,
      total_energy_kwh REAL DEFAULT 0,
      avg_power_w REAL DEFAULT 0,
      peak_power_w REAL DEFAULT 0,
      cost REAL DEFAULT 0,
      carbon_kg REAL DEFAULT 0,
      UNIQUE(date_hour, appliance_id)
    );

    CREATE TABLE IF NOT EXISTS daily_analytics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL, -- 'YYYY-MM-DD'
      appliance_id TEXT NOT NULL,
      total_energy_kwh REAL DEFAULT 0,
      avg_power_w REAL DEFAULT 0,
      peak_power_w REAL DEFAULT 0,
      total_runtime_minutes INTEGER DEFAULT 0,
      cost REAL DEFAULT 0,
      carbon_kg REAL DEFAULT 0,
      UNIQUE(date, appliance_id)
    );

    CREATE TABLE IF NOT EXISTS alerts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      appliance_id TEXT NOT NULL,
      alert_type TEXT NOT NULL,
      severity TEXT NOT NULL, -- 'INFO', 'WARNING', 'CRITICAL'
      message TEXT NOT NULL,
      value REAL,
      threshold REAL,
      is_resolved INTEGER DEFAULT 0,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS schedules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      appliance_id TEXT NOT NULL,
      action TEXT NOT NULL, -- 'ON' or 'OFF'
      time TEXT NOT NULL, -- 'HH:MM'
      days TEXT NOT NULL, -- JSON array string
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Seed default settings if empty
  const getSetting = db.prepare('SELECT value FROM settings WHERE key = ?');
  if (!getSetting.get('tariff_per_kwh')) {
    db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').run('tariff_per_kwh', String(SYSTEM_CONFIG.DEFAULT_TARIFF));
  }
  if (!getSetting.get('carbon_factor')) {
    db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').run('carbon_factor', String(SYSTEM_CONFIG.DEFAULT_CARBON_FACTOR));
  }
  if (!getSetting.get('sim_speed')) {
    db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').run('sim_speed', '1');
  }

  // Seed appliances if empty
  const countAppliances = db.prepare('SELECT COUNT(*) as count FROM appliances').get().count;
  if (countAppliances === 0) {
    const insertAppliance = db.prepare(`
      INSERT INTO appliances (id, name, type, location, rated_power, min_power, max_power, power_factor, is_on, total_energy_kwh)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // Pre-calculate realistic base cumulative energy (e.g. today's consumption so far)
    const initialEnergyEstimates = {
      'AC001': 4.35,
      'FR001': 1.82,
      'TV001': 0.68,
      'PC001': 1.45,
      'LT001': 0.16,
      'FN001': 0.42,
      'WM001': 0.85,
      'GH001': 2.10
    };

    const insertTx = db.transaction((appliances) => {
      for (const app of appliances) {
        insertAppliance.run(
          app.id,
          app.name,
          app.type,
          app.location,
          app.ratedPower,
          app.minPower,
          app.maxPower,
          app.powerFactor,
          app.isOn ? 1 : 0,
          initialEnergyEstimates[app.id] || 0
        );
      }
    });

    insertTx(INITIAL_APPLIANCES);
    console.log(`[Database] Seeded ${INITIAL_APPLIANCES.length} virtual appliances.`);

    // Seed realistic 7-day historical daily analytics so charts are ready for demonstration immediately!
    seedHistoricalAnalytics();
    seedDefaultSchedules();
  }
}

function seedHistoricalAnalytics() {
  const insertDaily = db.prepare(`
    INSERT OR IGNORE INTO daily_analytics (date, appliance_id, total_energy_kwh, avg_power_w, peak_power_w, total_runtime_minutes, cost, carbon_kg)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const today = new Date();
  const tariff = SYSTEM_CONFIG.DEFAULT_TARIFF;
  const carbonFactor = SYSTEM_CONFIG.DEFAULT_CARBON_FACTOR;

  const baseConsumptions = {
    'AC001': { kwh: 5.6, avgW: 1100, peakW: 1750, mins: 310 },
    'FR001': { kwh: 2.1, avgW: 88, peakW: 210, mins: 1440 },
    'TV001': { kwh: 0.95, avgW: 115, peakW: 135, mins: 490 },
    'PC001': { kwh: 1.85, avgW: 180, peakW: 300, mins: 620 },
    'LT001': { kwh: 0.22, avgW: 18, peakW: 20, mins: 720 },
    'FN001': { kwh: 0.65, avgW: 65, peakW: 75, mins: 600 },
    'WM001': { kwh: 0.90, avgW: 450, peakW: 1650, mins: 120 },
    'GH001': { kwh: 2.40, avgW: 2200, peakW: 2250, mins: 65 }
  };

  const seedTx = db.transaction(() => {
    // Generate data for past 7 days
    for (let i = 7; i >= 1; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];

      for (const [appId, stats] of Object.entries(baseConsumptions)) {
        // Add random natural variance (+/- 10%)
        const factor = 0.9 + Math.random() * 0.2;
        const kwh = Number((stats.kwh * factor).toFixed(2));
        const cost = Number((kwh * tariff).toFixed(2));
        const carbon = Number((kwh * carbonFactor).toFixed(2));
        const peakW = Math.round(stats.peakW * (0.95 + Math.random() * 0.1));
        const avgW = Math.round(stats.avgW * factor);
        const mins = Math.round(stats.mins * factor);

        insertDaily.run(dateStr, appId, kwh, avgW, peakW, mins, cost, carbon);
      }
    }
  });

  seedTx();
  console.log('[Database] Seeded 7 days of realistic historical analytics for demonstration.');
}

function seedDefaultSchedules() {
  const insertSchedule = db.prepare(`
    INSERT INTO schedules (appliance_id, action, time, days, is_active)
    VALUES (?, ?, ?, ?, ?)
  `);

  insertSchedule.run('GH001', 'ON', '06:30', JSON.stringify(['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']), 1);
  insertSchedule.run('GH001', 'OFF', '07:30', JSON.stringify(['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']), 1);
  insertSchedule.run('AC001', 'OFF', '07:00', JSON.stringify(['MON', 'TUE', 'WED', 'THU', 'FRI']), 1);
  console.log('[Database] Seeded default automated conservation schedules.');
}
