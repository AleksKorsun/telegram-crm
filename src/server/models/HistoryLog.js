/**
 * Модель истории действий
 */

const db = require('../db/database');

class HistoryLog {
  /**
   * Добавление новой записи в историю
   * @param {number} projectId - ID проекта
   * @param {string} actionType - Тип действия
   * @param {string} message - Сообщение
   * @returns {Promise<Object>} - Созданная запись
   */
  static async create(projectId, actionType, message) {
    const [id] = await db('history_logs').insert({
      project_id: projectId,
      action_type: actionType,
      message: message
    });
    
    return this.getById(id);
  }
  
  /**
   * Получение записи по ID
   * @param {number} id - ID записи
   * @returns {Promise<Object|null>} - Запись или null, если не найдена
   */
  static async getById(id) {
    return db('history_logs').where({ id }).first();
  }
  
  /**
   * Получение всей истории проекта
   * @param {number} projectId - ID проекта
   * @returns {Promise<Array>} - Список записей истории
   */
  static async getByProjectId(projectId) {
    return db('history_logs')
      .where({ project_id: projectId })
      .orderBy('created_at', 'desc');
  }
  
  /**
   * Получение истории по типу действия
   * @param {number} projectId - ID проекта
   * @param {string} actionType - Тип действия
   * @returns {Promise<Array>} - Список записей истории
   */
  static async getByActionType(projectId, actionType) {
    return db('history_logs')
      .where({
        project_id: projectId,
        action_type: actionType
      })
      .orderBy('created_at', 'desc');
  }
  
  /**
   * Удаление записи
   * @param {number} id - ID записи
   * @returns {Promise<boolean>} - Результат удаления
   */
  static async delete(id) {
    const deleted = await db('history_logs').where({ id }).delete();
    return deleted > 0;
  }
  
  /**
   * Удаление всей истории проекта
   * @param {number} projectId - ID проекта
   * @returns {Promise<number>} - Количество удаленных записей
   */
  static async deleteAllForProject(projectId) {
    return db('history_logs').where({ project_id: projectId }).delete();
  }
}

module.exports = HistoryLog;
