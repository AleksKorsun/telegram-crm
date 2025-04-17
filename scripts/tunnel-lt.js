/**
 * Скрипт для создания HTTPS-туннеля к локальному серверу
 * Используется для тестирования Telegram WebApp
 * Использует localtunnel вместо ngrok
 */

const localtunnel = require('localtunnel');
const fs = require('fs');
const path = require('path');
const config = require('../config/config');

async function startTunnel() {
  try {
    console.log('Запуск HTTPS-туннеля для локального сервера...');
    console.log(`Локальный порт: ${config.server.port}`);
    
    // Запускаем localtunnel и получаем публичный URL
    const tunnel = await localtunnel({ 
      port: config.server.port,
      subdomain: 'telegram-crm' // Можно указать желаемый поддомен
    });
    
    console.log(`✅ HTTPS-туннель создан: ${tunnel.url}`);
    console.log(`Ваш CRM доступен по адресу: ${tunnel.url}/app`);
    
    // Обновляем конфигурацию
    const configPath = path.join(__dirname, '../config/config.js');
    let configContent = fs.readFileSync(configPath, 'utf8');
    
    // Заменяем URL в конфигурации
    const webViewUrl = `${tunnel.url}/app`;
    configContent = configContent.replace(
      /url: '.*?',(\s*\/\/\s*.*?\s*)?/,
      `url: '${webViewUrl}', // HTTPS URL для WebView в Telegram`
    );
    
    fs.writeFileSync(configPath, configContent);
    console.log(`✅ Конфигурация обновлена. WebView URL: ${webViewUrl}`);
    
    // Сохраняем URL в файл для удобства
    fs.writeFileSync(path.join(__dirname, '../.tunnel'), webViewUrl);
    
    console.log('\n🔔 Важно:');
    console.log('1. Перезапустите бота, чтобы применить новые настройки');
    console.log('2. URL туннеля может измениться при следующем запуске');
    console.log('3. Нажмите Ctrl+C, чтобы остановить туннель');
    
    // Обработка событий туннеля
    tunnel.on('close', () => {
      console.log('Туннель закрыт');
    });
    
    // Обработка завершения работы
    process.on('SIGINT', () => {
      console.log('\nЗакрытие туннеля...');
      tunnel.close();
      process.exit(0);
    });
    
  } catch (error) {
    console.error('Ошибка при создании туннеля:', error);
    process.exit(1);
  }
}

// Запускаем туннель
startTunnel();
