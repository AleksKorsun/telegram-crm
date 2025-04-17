/**
 * Маршруты API для работы с оборудованием
 */

const express = require('express');
const router = express.Router({ mergeParams: true });
const Equipment = require('../models/Equipment');
const Project = require('../models/Project');
const HistoryLog = require('../models/HistoryLog');

// Получение всего оборудования проекта
router.get('/', async (req, res) => {
  try {
    const projectId = req.params.projectId;
    
    // Проверяем существование проекта
    const project = await Project.getById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Проект не найден' });
    }
    
    const equipment = await Equipment.getByProjectId(projectId);
    res.json(equipment);
  } catch (error) {
    console.error('Ошибка при получении оборудования:', error);
    res.status(500).json({ error: 'Ошибка при получении оборудования' });
  }
});

// Добавление оборудования к проекту
router.post('/', async (req, res) => {
  try {
    const projectId = req.params.projectId;
    const { model, quantity, itemStatus, expectedDate, notes } = req.body;
    
    if (!model) {
      return res.status(400).json({ error: 'Необходимо указать model' });
    }
    
    // Проверяем существование проекта
    const project = await Project.getById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Проект не найден' });
    }
    
    // Создаем оборудование
    const equipment = await Equipment.create(projectId, {
      model,
      quantity: quantity || 1,
      itemStatus: itemStatus || 'Заказано',
      expectedDate,
      notes
    });
    
    // Добавляем запись в историю
    await HistoryLog.create(
      projectId,
      'equipment_added',
      `Добавлено оборудование: ${model}, количество: ${quantity || 1}`
    );
    
    res.status(201).json(equipment);
  } catch (error) {
    console.error('Ошибка при добавлении оборудования:', error);
    res.status(500).json({ error: 'Ошибка при добавлении оборудования' });
  }
});

// Получение оборудования по ID
router.get('/:id', async (req, res) => {
  try {
    const equipmentId = req.params.id;
    const equipment = await Equipment.getById(equipmentId);
    
    if (!equipment) {
      return res.status(404).json({ error: 'Оборудование не найдено' });
    }
    
    // Проверяем, принадлежит ли оборудование указанному проекту
    if (equipment.project_id != req.params.projectId) {
      return res.status(403).json({ error: 'Оборудование не принадлежит указанному проекту' });
    }
    
    res.json(equipment);
  } catch (error) {
    console.error('Ошибка при получении оборудования:', error);
    res.status(500).json({ error: 'Ошибка при получении оборудования' });
  }
});

// Обновление статуса оборудования
router.patch('/:id/status', async (req, res) => {
  try {
    const equipmentId = req.params.id;
    const projectId = req.params.projectId;
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ error: 'Необходимо указать status' });
    }
    
    // Получаем текущее оборудование
    const equipment = await Equipment.getById(equipmentId);
    if (!equipment) {
      return res.status(404).json({ error: 'Оборудование не найдено' });
    }
    
    // Проверяем, принадлежит ли оборудование указанному проекту
    if (equipment.project_id != projectId) {
      return res.status(403).json({ error: 'Оборудование не принадлежит указанному проекту' });
    }
    
    // Сохраняем старый статус для записи в историю
    const oldStatus = equipment.item_status;
    
    // Обновляем статус
    const updatedEquipment = await Equipment.updateStatus(equipmentId, status);
    
    // Добавляем запись в историю
    await HistoryLog.create(
      projectId,
      'equipment_status_change',
      `Статус оборудования "${equipment.model}" изменен с "${oldStatus}" на "${status}"`
    );
    
    res.json({
      success: true,
      updatedStatus: status,
      equipment: updatedEquipment
    });
  } catch (error) {
    console.error('Ошибка при обновлении статуса оборудования:', error);
    res.status(500).json({ error: 'Ошибка при обновлении статуса оборудования' });
  }
});

// Обновление оборудования
router.put('/:id', async (req, res) => {
  try {
    const equipmentId = req.params.id;
    const projectId = req.params.projectId;
    const { model, quantity, itemStatus, expectedDate, notes } = req.body;
    
    // Получаем текущее оборудование
    const equipment = await Equipment.getById(equipmentId);
    if (!equipment) {
      return res.status(404).json({ error: 'Оборудование не найдено' });
    }
    
    // Проверяем, принадлежит ли оборудование указанному проекту
    if (equipment.project_id != projectId) {
      return res.status(403).json({ error: 'Оборудование не принадлежит указанному проекту' });
    }
    
    // Обновляем оборудование
    const updatedEquipment = await Equipment.update(equipmentId, {
      model: model || equipment.model,
      quantity: quantity || equipment.quantity,
      itemStatus: itemStatus || equipment.item_status,
      expectedDate: expectedDate || equipment.expected_date,
      notes: notes || equipment.notes
    });
    
    // Добавляем запись в историю
    await HistoryLog.create(
      projectId,
      'equipment_update',
      `Обновлено оборудование: ${updatedEquipment.model}`
    );
    
    res.json(updatedEquipment);
  } catch (error) {
    console.error('Ошибка при обновлении оборудования:', error);
    res.status(500).json({ error: 'Ошибка при обновлении оборудования' });
  }
});

// Удаление оборудования
router.delete('/:id', async (req, res) => {
  try {
    const equipmentId = req.params.id;
    const projectId = req.params.projectId;
    
    // Получаем оборудование перед удалением
    const equipment = await Equipment.getById(equipmentId);
    if (!equipment) {
      return res.status(404).json({ error: 'Оборудование не найдено' });
    }
    
    // Проверяем, принадлежит ли оборудование указанному проекту
    if (equipment.project_id != projectId) {
      return res.status(403).json({ error: 'Оборудование не принадлежит указанному проекту' });
    }
    
    // Удаляем оборудование
    const deleted = await Equipment.delete(equipmentId);
    
    if (deleted) {
      // Добавляем запись в историю
      await HistoryLog.create(
        projectId,
        'equipment_deleted',
        `Удалено оборудование: ${equipment.model}`
      );
      
      res.json({ success: true, message: 'Оборудование успешно удалено' });
    } else {
      res.status(500).json({ error: 'Не удалось удалить оборудование' });
    }
  } catch (error) {
    console.error('Ошибка при удалении оборудования:', error);
    res.status(500).json({ error: 'Ошибка при удалении оборудования' });
  }
});

module.exports = router;
