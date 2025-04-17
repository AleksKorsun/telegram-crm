/**
 * Интеграция Telegram бота с CRM системой
 * Основан на существующем боте из /home/alex/projects/alex_bot/alex_bot.py
 * Автоматически создает проекты при создании новых топиков и добавляет кнопку CRM
 */

const { Telegraf, Markup } = require('telegraf');
const axios = require('axios');
const config = require('../../config/config');
const fs = require('fs');
const path = require('path');

// Используем токен из существующего бота
const BOT_TOKEN = "7738846745:AAGW66wsQGJm_N9ZYAAKNrWsfSD5SaO5O1I";

// API URL для взаимодействия с сервером CRM
const API_BASE_URL = `http://${config.server.host}:${config.server.port}${config.server.apiPrefix}`;

// Инициализация бота
const bot = new Telegraf(BOT_TOKEN);

// Включаем отладочную информацию
bot.use((ctx, next) => {
  console.log('Получено событие:', ctx.updateType);
  if (ctx.updateType === 'message') {
    console.log('Тип сообщения:', ctx.message.message_thread_id ? `топик (${ctx.message.message_thread_id})` : 'обычное');
    if (ctx.message.forum_topic_created) {
      console.log('Создан новый топик:', ctx.message.forum_topic_created.name);
    }
  }
  return next();
});

// Включаем поддержку топиков в группах
bot.telegram.getMyCommands().then(commands => {
  console.log('Текущие команды бота:', commands);
});

// Проверяем информацию о боте
bot.telegram.getMe().then(botInfo => {
  console.log('Информация о боте:', botInfo);
});

// Логирование сообщений (как в оригинальном боте)
const logMessage = (username, message) => {
  console.log(`📩 [${username}] -> ${message}`);
  
  // Сохраняем сообщения в файл (как в оригинальном боте)
  const logDir = path.join(__dirname, '../../logs');
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  
  const logFile = path.join(logDir, 'messages.jsonl');
  fs.appendFileSync(
    logFile, 
    `{"user": "${username}", "text": "${message.replace(/"/g, '\\"')}"}\n`, 
    'utf-8'
  );
};

// Получение проекта по ID чата
const getProjectByChatId = async (chatId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/projects/chat/${chatId}`);
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return null;
    }
    console.error('Ошибка при получении проекта:', error.message);
    throw error;
  }
};

// Создание нового проекта
const createProject = async (title, chatId) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/projects`, {
      title,
      chatId,
      status: 'Новый'
    });
    return response.data;
  } catch (error) {
    console.error('Ошибка при создании проекта:', error.message);
    throw error;
  }
};

// Обработчик приветствия, когда бота добавляют в группу
bot.on('new_chat_members', (ctx) => {
  // Проверяем, что добавили именно нашего бота
  const botWasAdded = ctx.message.new_chat_members.some(member => member.id === ctx.botInfo.id);
  
  if (botWasAdded) {
    ctx.reply(
      'Привет! Я бот для управления проектами через Telegram.\n\n' +
      'Просто создайте новый топик в этой группе, и я автоматически создам для него проект в CRM и добавлю кнопку для доступа к нему.'
    );
  }
});

// Обрабатываем все сообщения, связанные с топиками
bot.on('message', async (ctx) => {
  // Проверяем, есть ли в сообщении информация о создании топика
  if (ctx.message && ctx.message.forum_topic_created) {
    console.log('Обнаружено создание топика через message');
    await handleNewTopic(ctx);
  }
});

// Дополнительный обработчик для создания топика
bot.on('message_thread_started', async (ctx) => {
  console.log('Обнаружено создание топика через message_thread_started');
  await handleNewTopic(ctx);
});

// Функция обработки нового топика
async function handleNewTopic(ctx) {
  try {
    // Получаем данные о топике
    const topicId = ctx.message.message_thread_id.toString();
    const chatId = ctx.chat.id.toString();
    const topicName = ctx.message.forum_topic_created ? ctx.message.forum_topic_created.name : `Топик ${topicId}`;
    const username = ctx.from.username || ctx.from.first_name;
    
    logMessage(username, `Создан новый топик: ${topicName}`);
    
    // Формируем уникальный ID для чата+топика
    const uniqueChatId = `${chatId}_${topicId}`;
    
    // Проверяем, существует ли уже проект для этого топика
    const existingProject = await getProjectByChatId(uniqueChatId);
    
    if (existingProject) {
      // Если проект уже существует, просто показываем кнопку CRM
      // Добавляем название топика в URL для отображения в заголовке CRM
      const encodedTopicName = encodeURIComponent(topicName);
      const crmUrl = `${config.webView.url}?projectId=${existingProject.id}&topicName=${encodedTopicName}`;
      
      ctx.reply(
        `Проект "${existingProject.title}" уже существует.`,
        {
          message_thread_id: topicId,
          reply_markup: {
            inline_keyboard: [
              [{ text: 'Открыть CRM', url: crmUrl }]
            ]
          }
        }
      );
    } else {
      // Создаем новый проект для топика
      const newProject = await createProject(topicName, uniqueChatId);
      
      // Формируем URL для перехода в CRM
      // Добавляем название топика в URL для отображения в заголовке CRM
      const encodedTopicName = encodeURIComponent(topicName);
      const crmUrl = `${config.webView.url}?projectId=${newProject.id}&topicName=${encodedTopicName}`;
      
      // Отправляем сообщение с кнопкой для открытия WebView
      // Используем прямой формат кнопки для большей совместимости
      ctx.reply(
        `✅ Создан новый проект: "${topicName}"`,
        {
          message_thread_id: topicId,
          reply_markup: {
            inline_keyboard: [
              [{ text: 'Открыть CRM', url: crmUrl }]
            ]
          }
        }
      );
    }
  } catch (error) {
    console.error('Ошибка при обработке нового топика:', error);
    if (ctx.message && ctx.message.message_thread_id) {
      ctx.reply(
        'Произошла ошибка при создании проекта для этого топика. Пожалуйста, попробуйте позже.',
        { message_thread_id: ctx.message.message_thread_id }
      );
    }
  }
}

// Обработчик текстовых сообщений (для совместимости с оригинальным ботом)
bot.on('text', async (ctx) => {
  const username = ctx.from.username || ctx.from.first_name;
  const message = ctx.message.text;
  
  logMessage(username, message);
  
  // Не отвечаем на обычные сообщения, чтобы не спамить в чате
});

// Функция для отправки уведомлений в чат
const sendNotification = async (chatId, message, topicId = null) => {
  try {
    const options = topicId ? { message_thread_id: topicId } : {};
    await bot.telegram.sendMessage(chatId, message, options);
    return true;
  } catch (error) {
    console.error(`Ошибка при отправке уведомления в чат ${chatId}:`, error);
    return false;
  }
};

// Экспортируем функцию отправки уведомлений для использования в API
bot.sendNotification = sendNotification;

// Запуск бота
const startBot = () => {
  if (config.telegram.webhook.enabled) {
    // Режим webhook для production
    bot.launch({
      webhook: {
        domain: config.telegram.webhook.url,
        port: config.telegram.webhook.port
      }
    });
    console.log(`Бот запущен в режиме webhook на порту ${config.telegram.webhook.port}`);
  } else {
    // Режим long polling для разработки
    bot.launch();
    console.log('🤖 Бот запущен и ждёт сообщений...');
  }
  
  // Обработка остановки приложения
  process.once('SIGINT', () => bot.stop('SIGINT'));
  process.once('SIGTERM', () => bot.stop('SIGTERM'));
};

module.exports = {
  bot,
  startBot,
  sendNotification
};
