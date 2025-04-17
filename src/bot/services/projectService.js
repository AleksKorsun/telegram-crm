/**
 * Сервис для работы с проектами через API
 */

const axios = require('axios');
const config = require('../../../config/config');

const API_BASE_URL = `http://${config.server.host}:${config.server.port}${config.server.apiPrefix}`;

/**
 * Создание нового проекта
 * @param {Object} projectData - Данные проекта
 * @returns {Promise<Object>} - Созданный проект
 */
async function createProject(projectData) {
  try {
    const response = await axios.post(`${API_BASE_URL}/projects`, projectData);
    return response.data;
  } catch (error) {
    console.error('Ошибка при создании проекта:', error.message);
    throw error;
  }
}

/**
 * Получение проекта по ID чата Telegram
 * @param {string} chatId - ID чата Telegram
 * @returns {Promise<Object|null>} - Проект или null, если не найден
 */
async function getProjectByChatId(chatId) {
  try {
    const response = await axios.get(`${API_BASE_URL}/projects/chat/${chatId}`);
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return null;
    }
    console.error('Ошибка при получении проекта по chatId:', error.message);
    throw error;
  }
}

/**
 * Получение проекта по ID
 * @param {number} projectId - ID проекта
 * @returns {Promise<Object>} - Проект
 */
async function getProjectById(projectId) {
  try {
    const response = await axios.get(`${API_BASE_URL}/projects/${projectId}`);
    return response.data;
  } catch (error) {
    console.error('Ошибка при получении проекта по ID:', error.message);
    throw error;
  }
}

/**
 * Обновление статуса проекта
 * @param {number} projectId - ID проекта
 * @param {string} status - Новый статус
 * @returns {Promise<Object>} - Обновленный проект
 */
async function updateProjectStatus(projectId, status) {
  try {
    const response = await axios.patch(`${API_BASE_URL}/projects/${projectId}/status`, { status });
    return response.data;
  } catch (error) {
    console.error('Ошибка при обновлении статуса проекта:', error.message);
    throw error;
  }
}

/**
 * Добавление оборудования к проекту
 * @param {number} projectId - ID проекта
 * @param {Object} equipmentData - Данные оборудования
 * @returns {Promise<Object>} - Добавленное оборудование
 */
async function addEquipment(projectId, equipmentData) {
  try {
    const response = await axios.post(`${API_BASE_URL}/projects/${projectId}/equipment`, equipmentData);
    return response.data;
  } catch (error) {
    console.error('Ошибка при добавлении оборудования:', error.message);
    throw error;
  }
}

/**
 * Добавление записи в историю проекта
 * @param {number} projectId - ID проекта
 * @param {string} actionType - Тип действия
 * @param {string} message - Сообщение
 * @returns {Promise<Object>} - Запись в истории
 */
async function addHistoryLog(projectId, actionType, message) {
  try {
    const response = await axios.post(`${API_BASE_URL}/projects/${projectId}/history`, {
      actionType,
      message
    });
    return response.data;
  } catch (error) {
    console.error('Ошибка при добавлении записи в историю:', error.message);
    throw error;
  }
}

module.exports = {
  createProject,
  getProjectByChatId,
  getProjectById,
  updateProjectStatus,
  addEquipment,
  addHistoryLog
};
