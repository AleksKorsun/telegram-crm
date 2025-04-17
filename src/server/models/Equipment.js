/**
 * Модель оборудования
 */

const db = require('../db/database');

class Equipment {
  /**
   * Добавление нового оборудования к проекту
   * @param {number} projectId - ID проекта
   * @param {Object} equipmentData - Данные оборудования
   * @returns {Promise<Object>} - Добавленное оборудование
   */
  static async create(projectId, equipmentData) {
    const [id] = await db('equipment').insert({
      project_id: projectId,
      model: equipmentData.model,
      quantity: equipmentData.quantity || 1,
      item_status: equipmentData.itemStatus || 'Заказано',
      expected_date: equipmentData.expectedDate || null,
      notes: equipmentData.notes || null
    });
    
    return this.getById(id);
  }
  
  /**
   * Получение оборудования по ID
   * @param {number} id - ID оборудования
   * @returns {Promise<Object|null>} - Оборудование или null, если не найдено
   */
  static async getById(id) {
    return db('equipment').where({ id }).first();
  }
  
  /**
   * Получение всего оборудования проекта
   * @param {number} projectId - ID проекта
   * @returns {Promise<Array>} - Список оборудования
   */
  static async getByProjectId(projectId) {
    return db('equipment')
      .where({ project_id: projectId })
      .orderBy('created_at', 'desc');
  }
  
  /**
   * Обновление статуса оборудования
   * @param {number} id - ID оборудования
   * @param {string} status - Новый статус
   * @returns {Promise<Object>} - Обновленное оборудование
   */
  static async updateStatus(id, status) {
    await db('equipment')
      .where({ id })
      .update({
        item_status: status,
        updated_at: db.fn.now()
      });
    
    return this.getById(id);
  }
  
  /**
   * Обновление оборудования
   * @param {number} id - ID оборудования
   * @param {Object} equipmentData - Данные для обновления
   * @returns {Promise<Object>} - Обновленное оборудование
   */
  static async update(id, equipmentData) {
    await db('equipment')
      .where({ id })
      .update({
        model: equipmentData.model,
        quantity: equipmentData.quantity,
        item_status: equipmentData.itemStatus,
        expected_date: equipmentData.expectedDate,
        notes: equipmentData.notes,
        updated_at: db.fn.now()
      });
    
    return this.getById(id);
  }
  
  /**
   * Удаление оборудования
   * @param {number} id - ID оборудования
   * @returns {Promise<boolean>} - Результат удаления
   */
  static async delete(id) {
    const deleted = await db('equipment').where({ id }).delete();
    return deleted > 0;
  }
}

module.exports = Equipment;
