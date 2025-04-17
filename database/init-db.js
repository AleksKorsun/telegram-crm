/**
 * Скрипт для инициализации базы данных
 */

const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const config = require('../config/config');

// Путь к файлу базы данных
const dbPath = path.resolve(__dirname, 'telegram-crm.sqlite');

// Создаем базу данных
const db = new sqlite3.Database(dbPath);

// Читаем SQL-схему
const schemaSQL = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');

console.log('Инициализация базы данных...');

// Выполняем SQL-запросы для создания таблиц
db.exec(schemaSQL, (err) => {
  if (err) {
    console.error('Ошибка при инициализации базы данных:', err.message);
    process.exit(1);
  }
  
  console.log('База данных успешно инициализирована!');
  console.log(`Файл базы данных: ${dbPath}`);
  
  // Закрываем соединение с базой данных
  db.close();
});
