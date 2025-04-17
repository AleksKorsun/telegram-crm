/**
 * Конфигурация для Telegram-CRM
 */

// Определяем, работаем ли мы на Glitch или локально
const isGlitch = process.env.PROJECT_DOMAIN || false;
const projectDomain = isGlitch ? `https://${process.env.PROJECT_DOMAIN}.glitch.me` : 'http://localhost:3000';

module.exports = {
  // Настройки сервера
  server: {
    port: 3000,
    host: 'localhost',
    apiPrefix: '/api',
  },
  
  // Настройки базы данных
  database: {
    // SQLite для MVP
    client: 'sqlite3',
    connection: {
      filename: isGlitch ? '.data/telegram-crm.sqlite' : '/home/alex/telegram-crm/database/telegram-crm.sqlite'
    },
    useNullAsDefault: true,
    
    // Для будущего перехода на PostgreSQL
    // client: 'pg',
    // connection: {
    //   host: 'localhost',
    //   port: 5432,
    //   user: 'username',
    //   password: 'password',
    //   database: 'telegram_crm'
    // }
  },
  
  // Настройки Telegram бота
  telegram: {
    token: '7738846745:AAGW66wsQGJm_N9ZYAAKNrWsfSD5SaO5O1I', // Токен существующего бота
    webhook: {
      enabled: false, // true для production, false для разработки (использует polling)
      url: 'https://telegram-crm.loca.lt/app', // HTTPS URL для WebView в Telegram
      port: 8443
    },
    // Настройки уведомлений
    notifications: {
      projectCreated: true,
      equipmentAdded: true,
      statusChanged: true,
      emailSent: true
    }
  },
  
  // Настройки WebView
  webView: {
    url: `${projectDomain}/app`, // Автоматически определяется в зависимости от окружения
    allowedOrigins: ['https://t.me'] // Разрешенные источники для WebView
  },
  
  // Настройки для отправки email (опционально)
  email: {
    enabled: false,
    smtp: {
      host: 'smtp.example.com',
      port: 587,
      secure: false,
      auth: {
        user: 'user@example.com',
        pass: 'password'
      }
    },
    from: 'CRM <crm@example.com>'
  },
  
  // Предопределенные статусы
  statuses: {
    project: [
      'Новый',
      'Заказано оборудование',
      'Доставлено',
      'Монтаж',
      'Закрыто'
    ],
    equipment: [
      'Заказано',
      'В пути',
      'Доставлено',
      'Установлено',
      'Проблема'
    ]
  }
};
