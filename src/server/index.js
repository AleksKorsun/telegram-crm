/**
 * Основной файл сервера для Telegram-CRM
 */

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const helmet = require('helmet');
const path = require('path');
const config = require('../../config/config');

// Импорт маршрутов API
const projectRoutes = require('./routes/projectRoutes');
const equipmentRoutes = require('./routes/equipmentRoutes');
const historyRoutes = require('./routes/historyRoutes');
const emailRoutes = require('./routes/emailRoutes');

// Инициализация приложения Express
const app = express();

// Middleware
app.use(helmet()); // Безопасность
app.use(cors()); // CORS для WebView
app.use(bodyParser.json()); // Парсинг JSON
app.use(morgan('dev')); // Логирование запросов

// Статические файлы для клиентского приложения
app.use(express.static(path.join(__dirname, '../client')));

// API маршруты
app.use(`${config.server.apiPrefix}/projects`, projectRoutes);
// Вложенные маршруты для оборудования и истории
app.use(`${config.server.apiPrefix}/projects/:projectId/equipment`, equipmentRoutes);
app.use(`${config.server.apiPrefix}/projects/:projectId/history`, historyRoutes);
app.use(`${config.server.apiPrefix}/projects/:projectId/email`, emailRoutes);

// Маршрут для WebView
app.get('/app', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

// Обработка ошибок
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Внутренняя ошибка сервера',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Запуск сервера
const PORT = config.server.port;
app.listen(PORT, () => {
  console.log(`Сервер запущен на http://${config.server.host}:${PORT}`);
  console.log(`API доступно по адресу: http://${config.server.host}:${PORT}${config.server.apiPrefix}`);
  console.log(`WebView доступен по адресу: http://${config.server.host}:${PORT}/app`);
});
