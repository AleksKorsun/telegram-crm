/**
 * Маршруты API для работы с проектами
 */

const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const Equipment = require('../models/Equipment');
const HistoryLog = require('../models/HistoryLog');

// Получение всех проектов
router.get('/', async (req, res) => {
  try {
    const projects = await Project.getAll();
    res.json(projects);
  } catch (error) {
    console.error('Ошибка при получении проектов:', error);
    res.status(500).json({ error: 'Ошибка при получении проектов' });
  }
});

// Создание нового проекта
router.post('/', async (req, res) => {
  try {
    const { title, chatId, status } = req.body;
    
    if (!title || !chatId) {
      return res.status(400).json({ error: 'Необходимо указать title и chatId' });
    }
    
    // Проверяем, существует ли уже проект с таким chatId
    const existingProject = await Project.getByChatId(chatId);
    if (existingProject) {
      return res.status(409).json({ 
        error: 'Проект с таким chatId уже существует',
        project: existingProject
      });
    }
    
    const project = await Project.create({ title, chatId, status });
    
    // Добавляем запись в историю
    await HistoryLog.create(
      project.id,
      'create',
      `Создан новый проект "${project.title}"`
    );
    
    res.status(201).json(project);
  } catch (error) {
    console.error('Ошибка при создании проекта:', error);
    res.status(500).json({ error: 'Ошибка при создании проекта' });
  }
});

// Получение проекта по ID
router.get('/:id', async (req, res) => {
  try {
    const projectId = req.params.id;
    const project = await Project.getById(projectId);
    
    if (!project) {
      return res.status(404).json({ error: 'Проект не найден' });
    }
    
    // Получаем оборудование и историю проекта
    const equipmentList = await Equipment.getByProjectId(projectId);
    const history = await HistoryLog.getByProjectId(projectId);
    
    res.json({
      project,
      equipmentList,
      history
    });
  } catch (error) {
    console.error('Ошибка при получении проекта:', error);
    res.status(500).json({ error: 'Ошибка при получении проекта' });
  }
});

// Получение проекта по ID чата Telegram
router.get('/chat/:chatId', async (req, res) => {
  try {
    const chatId = req.params.chatId;
    const project = await Project.getByChatId(chatId);
    
    if (!project) {
      return res.status(404).json({ error: 'Проект не найден' });
    }
    
    res.json(project);
  } catch (error) {
    console.error('Ошибка при получении проекта по chatId:', error);
    res.status(500).json({ error: 'Ошибка при получении проекта' });
  }
});

// Обновление статуса проекта
router.patch('/:id/status', async (req, res) => {
  try {
    const projectId = req.params.id;
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ error: 'Необходимо указать status' });
    }
    
    // Получаем текущий проект
    const currentProject = await Project.getById(projectId);
    if (!currentProject) {
      return res.status(404).json({ error: 'Проект не найден' });
    }
    
    // Сохраняем старый статус для записи в историю
    const oldStatus = currentProject.status;
    
    // Обновляем статус
    const updatedProject = await Project.updateStatus(projectId, status);
    
    // Добавляем запись в историю
    await HistoryLog.create(
      projectId,
      'status_change',
      `Статус проекта изменен с "${oldStatus}" на "${status}"`
    );
    
    res.json({
      success: true,
      updatedStatus: status,
      project: updatedProject
    });
  } catch (error) {
    console.error('Ошибка при обновлении статуса проекта:', error);
    res.status(500).json({ error: 'Ошибка при обновлении статуса проекта' });
  }
});

// Обновление проекта
router.put('/:id', async (req, res) => {
  try {
    const projectId = req.params.id;
    const { title, status } = req.body;
    
    // Получаем текущий проект
    const currentProject = await Project.getById(projectId);
    if (!currentProject) {
      return res.status(404).json({ error: 'Проект не найден' });
    }
    
    // Обновляем проект
    const updatedProject = await Project.update(projectId, { title, status });
    
    // Добавляем запись в историю
    await HistoryLog.create(
      projectId,
      'update',
      `Проект обновлен: "${updatedProject.title}"`
    );
    
    res.json(updatedProject);
  } catch (error) {
    console.error('Ошибка при обновлении проекта:', error);
    res.status(500).json({ error: 'Ошибка при обновлении проекта' });
  }
});

// Удаление проекта
router.delete('/:id', async (req, res) => {
  try {
    const projectId = req.params.id;
    
    // Получаем проект перед удалением
    const project = await Project.getById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Проект не найден' });
    }
    
    // Удаляем проект
    const deleted = await Project.delete(projectId);
    
    if (deleted) {
      res.json({ success: true, message: 'Проект успешно удален' });
    } else {
      res.status(500).json({ error: 'Не удалось удалить проект' });
    }
  } catch (error) {
    console.error('Ошибка при удалении проекта:', error);
    res.status(500).json({ error: 'Ошибка при удалении проекта' });
  }
});

module.exports = router;
