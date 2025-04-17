/**
 * Основной файл Telegram-бота для интеграции с CRM
 * Автоматически создает проекты при создании новых топиков
 */

// Импортируем и запускаем бота
const { bot, startBot, sendNotification } = require('./telegram_bot');

// Запускаем бота
startBot();

// Экспортируем функцию отправки уведомлений для использования в API
module.exports = {
  sendNotification
};
