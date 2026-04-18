// server/src/database.ts
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import fs from 'fs';

let db: any = null;

export async function initializeDatabase() {
  if (db) return db;

  // Убедимся, что папка data существует
  const dataDir = path.join(__dirname, '../data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  db = await open({
    filename: path.join(dataDir, 'database.sqlite'),
    driver: sqlite3.Database
  });

  // Создаём таблицы заново
  await db.exec(`
    DROP TABLE IF EXISTS results;
    DROP TABLE IF EXISTS tests;
    DROP TABLE IF EXISTS sections;
    DROP TABLE IF EXISTS disciplines;
    DROP TABLE IF EXISTS users;

    CREATE TABLE users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      telegram_id TEXT UNIQUE NOT NULL,
      first_name TEXT,
      last_name TEXT,
      username TEXT,
      faculty TEXT,
      course INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE disciplines (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      faculty TEXT NOT NULL,
      course INTEGER NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(name, faculty, course)
    );

    CREATE TABLE sections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      discipline_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (discipline_id) REFERENCES disciplines (id),
      UNIQUE(discipline_id, name)
    );

    CREATE TABLE tests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      discipline_id INTEGER NOT NULL,
      section_id INTEGER,
      title TEXT NOT NULL,
      description TEXT,
      faculty TEXT NOT NULL,
      course INTEGER NOT NULL,
      time_limit INTEGER DEFAULT 0,
      questions TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (discipline_id) REFERENCES disciplines (id),
      FOREIGN KEY (section_id) REFERENCES sections (id)
    );

    CREATE TABLE results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      test_id INTEGER NOT NULL,
      score INTEGER NOT NULL,
      max_score INTEGER NOT NULL,
      answers TEXT,
      time_spent INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (test_id) REFERENCES tests (id)
    );

    CREATE INDEX idx_users_telegram ON users(telegram_id);
    CREATE INDEX idx_disciplines_faculty_course ON disciplines(faculty, course);
    CREATE INDEX idx_tests_faculty_course ON tests(faculty, course);
    CREATE INDEX idx_results_user ON results(user_id);
  `);

  console.log('✅ База данных пересоздана');
  return db;
}

export async function getDb() {
  if (!db) {
    db = await initializeDatabase();
  }
  return db;
}