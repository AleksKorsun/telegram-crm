/**
 * Скрипт для создания HTTPS-туннеля к локальному серверу
 * Используется для тестирования Telegram WebApp
 */

const ngrok = require('ngrok');
const fs = require('fs');
const path = require('path');
const config = require('../config/config');

async function startTunnel() {
  try {
    console.log('Запуск HTTPS-туннеля для локального сервера...');
    
    // Запускаем ngrok и получаем публичный URL
    const url = await ngrok.connect({
      addr: config.server.port,
      region: 'eu'
    });
    
    console.log(`✅ HTTPS-туннель создан: ${url}`);
    console.log(`Ваш CRM доступен по адресу: ${url}/app`);
    
    // Обновляем конфигурацию
    const configPath = path.join(__dirname, '../config/config.js');
    let configContent = fs.readFileSync(configPath, 'utf8');
    
    // Заменяем URL в конфигурации
    const webViewUrl = `${url}/app`;
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
    console.log('2. URL туннеля изменится при следующем запуске');
    console.log('3. Нажмите Ctrl+C, чтобы остановить туннель');
    
    // Обработка завершения работы
    process.on('SIGINT', async () => {
      console.log('\nЗакрытие туннеля...');
      await ngrok.kill();
      process.exit(0);
    });
    
  } catch (error) {
    console.error('Ошибка при создании туннеля:', error);
    process.exit(1);
  }
}

// Запускаем туннель
startTunnel();
