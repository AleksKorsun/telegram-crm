/**
 * Маршруты API для отправки email
 */

const express = require('express');
const router = express.Router({ mergeParams: true });
const nodemailer = require('nodemailer');
const config = require('../../../config/config');
const Project = require('../models/Project');
const HistoryLog = require('../models/HistoryLog');

// Создание транспорта для отправки email
const createTransport = () => {
  if (!config.email.enabled) {
    throw new Error('Email отправка отключена в настройках');
  }
  
  return nodemailer.createTransport(config.email.smtp);
};

// Отправка email
router.post('/send', async (req, res) => {
  try {
    const projectId = req.params.projectId;
    const { to, subject, body } = req.body;
    
    if (!to || !subject || !body) {
      return res.status(400).json({ error: 'Необходимо указать to, subject и body' });
    }
    
    // Проверяем существование проекта
    const project = await Project.getById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Проект не найден' });
    }
    
    // Проверяем, включена ли отправка email
    if (!config.email.enabled) {
      return res.status(400).json({ error: 'Отправка email отключена в настройках' });
    }
    
    // Создаем транспорт
    const transporter = createTransport();
    
    // Отправляем email
    const info = await transporter.sendMail({
      from: config.email.from,
      to: to,
      subject: `[Проект: ${project.title}] ${subject}`,
      text: body,
      html: body.replace(/\n/g, '<br>')
    });
    
    // Добавляем запись в историю
    await HistoryLog.create(
      projectId,
      'email_sent',
      `Отправлено письмо: "${subject}" на адрес ${to}`
    );
    
    res.json({
      success: true,
      info: info.messageId,
      message: 'Email успешно отправлен'
    });
  } catch (error) {
    console.error('Ошибка при отправке email:', error);
    res.status(500).json({ error: 'Ошибка при отправке email', message: error.message });
  }
});

module.exports = router;
