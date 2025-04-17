/**
 * Модель проекта
 */

const db = require('../db/database');

class Project {
  /**
   * Создание нового проекта
   * @param {Object} projectData - Данные проекта
   * @returns {Promise<Object>} - Созданный проект
   */
  static async create(projectData) {
    const [id] = await db('projects').insert({
      title: projectData.title,
      chat_id: projectData.chatId,
      status: projectData.status || 'Новый'
    });
    
    return this.getById(id);
  }
  
  /**
   * Получение проекта по ID
   * @param {number} id - ID проекта
   * @returns {Promise<Object|null>} - Проект или null, если не найден
   */
  static async getById(id) {
    return db('projects').where({ id }).first();
  }
  
  /**
   * Получение проекта по ID чата Telegram
   * @param {string} chatId - ID чата Telegram
   * @returns {Promise<Object|null>} - Проект или null, если не найден
   */
  static async getByChatId(chatId) {
    return db('projects').where({ chat_id: chatId }).first();
  }
  
  /**
   * Получение всех проектов
   * @returns {Promise<Array>} - Список проектов
   */
  static async getAll() {
    return db('projects').orderBy('created_at', 'desc');
  }
  
  /**
   * Обновление статуса проекта
   * @param {number} id - ID проекта
   * @param {string} status - Новый статус
   * @returns {Promise<Object>} - Обновленный проект
   */
  static async updateStatus(id, status) {
    await db('projects')
      .where({ id })
      .update({
        status,
        updated_at: db.fn.now()
      });
    
    return this.getById(id);
  }
  
  /**
   * Обновление проекта
   * @param {number} id - ID проекта
   * @param {Object} projectData - Данные для обновления
   * @returns {Promise<Object>} - Обновленный проект
   */
  static async update(id, projectData) {
    await db('projects')
      .where({ id })
      .update({
        title: projectData.title,
        status: projectData.status,
        updated_at: db.fn.now()
      });
    
    return this.getById(id);
  }
  
  /**
   * Удаление проекта
   * @param {number} id - ID проекта
   * @returns {Promise<boolean>} - Результат удаления
   */
  static async delete(id) {
    const deleted = await db('projects').where({ id }).delete();
    return deleted > 0;
  }
}

module.exports = Project;
