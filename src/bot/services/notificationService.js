/**
 * Сервис для отправки уведомлений в Telegram
 */

const config = require('../../../config/config');

/**
 * Отправка уведомления в чат Telegram
 * @param {Object} bot - Экземпляр Telegram бота
 * @param {string} chatId - ID чата для отправки
 * @param {string} message - Текст сообщения
 * @returns {Promise<boolean>} - Результат отправки
 */
async function sendNotification(bot, chatId, message) {
  try {
    await bot.telegram.sendMessage(chatId, message);
    return true;
  } catch (error) {
    console.error(`Ошибка при отправке уведомления в чат ${chatId}:`, error.message);
    return false;
  }
}

/**
 * Отправка уведомления о создании проекта
 * @param {Object} bot - Экземпляр Telegram бота
 * @param {string} chatId - ID чата для отправки
 * @param {Object} project - Данные проекта
 * @returns {Promise<boolean>} - Результат отправки
 */
async function notifyProjectCreated(bot, chatId, project) {
  if (!config.telegram.notifications.projectCreated) {
    return false;
  }
  
  const message = `🆕 Создан новый проект: "${project.title}"\n` +
                 `ID: ${project.id}\n` +
                 `Статус: ${project.status}`;
  
  return sendNotification(bot, chatId, message);
}

/**
 * Отправка уведомления о добавлении оборудования
 * @param {Object} bot - Экземпляр Telegram бота
 * @param {string} chatId - ID чата для отправки
 * @param {Object} equipment - Данные оборудования
 * @param {Object} project - Данные проекта
 * @returns {Promise<boolean>} - Результат отправки
 */
async function notifyEquipmentAdded(bot, chatId, equipment, project) {
  if (!config.telegram.notifications.equipmentAdded) {
    return false;
  }
  
  const message = `➕ В проект "${project.title}" добавлено оборудование:\n` +
                 `Модель: ${equipment.model}\n` +
                 `Количество: ${equipment.quantity}\n` +
                 `Статус: ${equipment.itemStatus}`;
  
  return sendNotification(bot, chatId, message);
}

/**
 * Отправка уведомления об изменении статуса проекта
 * @param {Object} bot - Экземпляр Telegram бота
 * @param {string} chatId - ID чата для отправки
 * @param {Object} project - Данные проекта
 * @param {string} oldStatus - Предыдущий статус
 * @returns {Promise<boolean>} - Результат отправки
 */
async function notifyStatusChanged(bot, chatId, project, oldStatus) {
  if (!config.telegram.notifications.statusChanged) {
    return false;
  }
  
  const message = `🔄 Статус проекта "${project.title}" изменен:\n` +
                 `${oldStatus} ➡️ ${project.status}`;
  
  return sendNotification(bot, chatId, message);
}

/**
 * Отправка уведомления об отправке email
 * @param {Object} bot - Экземпляр Telegram бота
 * @param {string} chatId - ID чата для отправки
 * @param {Object} emailData - Данные письма
 * @param {Object} project - Данные проекта
 * @returns {Promise<boolean>} - Результат отправки
 */
async function notifyEmailSent(bot, chatId, emailData, project) {
  if (!config.telegram.notifications.emailSent) {
    return false;
  }
  
  const message = `📧 Из проекта "${project.title}" отправлено письмо:\n` +
                 `Кому: ${emailData.to}\n` +
                 `Тема: ${emailData.subject}`;
  
  return sendNotification(bot, chatId, message);
}

module.exports = {
  sendNotification,
  notifyProjectCreated,
  notifyEquipmentAdded,
  notifyStatusChanged,
  notifyEmailSent
};
