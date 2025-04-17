/**
 * Конфигурация для Telegram-CRM
 */

// Определяем, работаем ли мы на Glitch или локально
const isGlitch = !!process.env.PROJECT_DOMAIN;
const projectDomain = isGlitch ? `https://${process.env.PROJECT_DOMAIN}.glitch.me` : 'http://localhost:3000';

module.exports = {
  // Настройки сервера
  server: {
    port: isGlitch ? process.env.PORT : 3000,
    host: isGlitch ? '0.0.0.0' : 'localhost',
    apiPrefix: '/api',
  },
  
  // Настройки базы данных
  database: {
    client: 'sqlite3',
    connection: {
      // 👇 Правильный путь к базе на Glitch
      filename: isGlitch
        ? '/app/database/telegram-crm.sqlite'
        : '/home/alex/telegram-crm/database/telegram-crm.sqlite'
    },
    useNullAsDefault: true,
  },
  
  // Настройки Telegram бота
  telegram: {
    token: '7738846745:AAGW66wsQGJm_N9ZYAAKNrWsfSD5SaO5O1I',
    webhook: {
      enabled: false,
      url: `${projectDomain}/app`,
      port: 8443
    },
    notifications: {
      projectCreated: true,
      equipmentAdded: true,
      statusChanged: true,
      emailSent: true
    }
  },
  
  // WebView
  webView: {
    url: `${projectDomain}/app`,
    allowedOrigins: ['https://t.me']
  },
  
  // Email
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
  
  // Статусы
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

