/**
 * Модуль для работы с базой данных
 */

const knex = require('knex');
const path = require('path');
const config = require('../../../config/config');

// Инициализация подключения к базе данных
const db = knex(config.database);

// Проверка подключения к базе данных
async function testConnection() {
  try {
    await db.raw('SELECT 1');
    console.log('Подключение к базе данных успешно установлено');
    return true;
  } catch (error) {
    console.error('Ошибка подключения к базе данных:', error.message);
    return false;
  }
}

// Вызываем проверку подключения при запуске
testConnection();

module.exports = db;
