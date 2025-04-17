/**
 * Маршруты API для работы с историей действий
 */

const express = require('express');
const router = express.Router({ mergeParams: true });
const HistoryLog = require('../models/HistoryLog');
const Project = require('../models/Project');

// Получение истории проекта
router.get('/', async (req, res) => {
  try {
    const projectId = req.params.projectId;
    
    // Проверяем существование проекта
    const project = await Project.getById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Проект не найден' });
    }
    
    const history = await HistoryLog.getByProjectId(projectId);
    res.json(history);
  } catch (error) {
    console.error('Ошибка при получении истории:', error);
    res.status(500).json({ error: 'Ошибка при получении истории' });
  }
});

// Добавление записи в историю
router.post('/', async (req, res) => {
  try {
    const projectId = req.params.projectId;
    const { actionType, message } = req.body;
    
    if (!actionType || !message) {
      return res.status(400).json({ error: 'Необходимо указать actionType и message' });
    }
    
    // Проверяем существование проекта
    const project = await Project.getById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Проект не найден' });
    }
    
    // Создаем запись в истории
    const historyLog = await HistoryLog.create(projectId, actionType, message);
    
    res.status(201).json(historyLog);
  } catch (error) {
    console.error('Ошибка при добавлении записи в историю:', error);
    res.status(500).json({ error: 'Ошибка при добавлении записи в историю' });
  }
});

// Получение записи истории по ID
router.get('/:id', async (req, res) => {
  try {
    const historyId = req.params.id;
    const historyLog = await HistoryLog.getById(historyId);
    
    if (!historyLog) {
      return res.status(404).json({ error: 'Запись истории не найдена' });
    }
    
    // Проверяем, принадлежит ли запись указанному проекту
    if (historyLog.project_id != req.params.projectId) {
      return res.status(403).json({ error: 'Запись истории не принадлежит указанному проекту' });
    }
    
    res.json(historyLog);
  } catch (error) {
    console.error('Ошибка при получении записи истории:', error);
    res.status(500).json({ error: 'Ошибка при получении записи истории' });
  }
});

// Получение истории по типу действия
router.get('/type/:actionType', async (req, res) => {
  try {
    const projectId = req.params.projectId;
    const actionType = req.params.actionType;
    
    // Проверяем существование проекта
    const project = await Project.getById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Проект не найден' });
    }
    
    const history = await HistoryLog.getByActionType(projectId, actionType);
    res.json(history);
  } catch (error) {
    console.error('Ошибка при получении истории по типу действия:', error);
    res.status(500).json({ error: 'Ошибка при получении истории по типу действия' });
  }
});

// Удаление записи истории
router.delete('/:id', async (req, res) => {
  try {
    const historyId = req.params.id;
    
    // Получаем запись истории перед удалением
    const historyLog = await HistoryLog.getById(historyId);
    if (!historyLog) {
      return res.status(404).json({ error: 'Запись истории не найдена' });
    }
    
    // Проверяем, принадлежит ли запись указанному проекту
    if (historyLog.project_id != req.params.projectId) {
      return res.status(403).json({ error: 'Запись истории не принадлежит указанному проекту' });
    }
    
    // Удаляем запись истории
    const deleted = await HistoryLog.delete(historyId);
    
    if (deleted) {
      res.json({ success: true, message: 'Запись истории успешно удалена' });
    } else {
      res.status(500).json({ error: 'Не удалось удалить запись истории' });
    }
  } catch (error) {
    console.error('Ошибка при удалении записи истории:', error);
    res.status(500).json({ error: 'Ошибка при удалении записи истории' });
  }
});

module.exports = router;
