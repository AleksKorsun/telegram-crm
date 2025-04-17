/**
 * API клиент для взаимодействия с сервером CRM
 */

const API = {
  // Базовый URL API
  baseUrl: '/api',
  
  /**
   * Выполнение GET-запроса
   * @param {string} endpoint - Конечная точка API
   * @returns {Promise<Object>} - Ответ от сервера
   */
  async get(endpoint) {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`);
      
      if (!response.ok) {
        throw new Error(`Ошибка HTTP: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Ошибка при GET-запросе к ${endpoint}:`, error);
      throw error;
    }
  },
  
  /**
   * Выполнение POST-запроса
   * @param {string} endpoint - Конечная точка API
   * @param {Object} data - Данные для отправки
   * @returns {Promise<Object>} - Ответ от сервера
   */
  async post(endpoint, data) {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error(`Ошибка HTTP: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Ошибка при POST-запросе к ${endpoint}:`, error);
      throw error;
    }
  },
  
  /**
   * Выполнение PUT-запроса
   * @param {string} endpoint - Конечная точка API
   * @param {Object} data - Данные для отправки
   * @returns {Promise<Object>} - Ответ от сервера
   */
  async put(endpoint, data) {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error(`Ошибка HTTP: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Ошибка при PUT-запросе к ${endpoint}:`, error);
      throw error;
    }
  },
  
  /**
   * Выполнение PATCH-запроса
   * @param {string} endpoint - Конечная точка API
   * @param {Object} data - Данные для отправки
   * @returns {Promise<Object>} - Ответ от сервера
   */
  async patch(endpoint, data) {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error(`Ошибка HTTP: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Ошибка при PATCH-запросе к ${endpoint}:`, error);
      throw error;
    }
  },
  
  /**
   * Выполнение DELETE-запроса
   * @param {string} endpoint - Конечная точка API
   * @returns {Promise<Object>} - Ответ от сервера
   */
  async delete(endpoint) {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error(`Ошибка HTTP: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Ошибка при DELETE-запросе к ${endpoint}:`, error);
      throw error;
    }
  },
  
  // Методы для работы с проектами
  projects: {
    /**
     * Получение проекта по ID
     * @param {number} projectId - ID проекта
     * @returns {Promise<Object>} - Данные проекта
     */
    async getById(projectId) {
      return API.get(`/projects/${projectId}`);
    },
    
    /**
     * Обновление статуса проекта
     * @param {number} projectId - ID проекта
     * @param {string} status - Новый статус
     * @returns {Promise<Object>} - Обновленный проект
     */
    async updateStatus(projectId, status) {
      return API.patch(`/projects/${projectId}/status`, { status });
    }
  },
  
  // Методы для работы с оборудованием
  equipment: {
    /**
     * Получение списка оборудования проекта
     * @param {number} projectId - ID проекта
     * @returns {Promise<Array>} - Список оборудования
     */
    async getByProjectId(projectId) {
      return API.get(`/projects/${projectId}/equipment`);
    },
    
    /**
     * Добавление оборудования к проекту
     * @param {number} projectId - ID проекта
     * @param {Object} equipmentData - Данные оборудования
     * @returns {Promise<Object>} - Добавленное оборудование
     */
    async add(projectId, equipmentData) {
      return API.post(`/projects/${projectId}/equipment`, equipmentData);
    },
    
    /**
     * Обновление оборудования
     * @param {number} projectId - ID проекта
     * @param {number} equipmentId - ID оборудования
     * @param {Object} equipmentData - Данные для обновления
     * @returns {Promise<Object>} - Обновленное оборудование
     */
    async update(projectId, equipmentId, equipmentData) {
      return API.put(`/projects/${projectId}/equipment/${equipmentId}`, equipmentData);
    },
    
    /**
     * Обновление статуса оборудования
     * @param {number} projectId - ID проекта
     * @param {number} equipmentId - ID оборудования
     * @param {string} status - Новый статус
     * @returns {Promise<Object>} - Обновленное оборудование
     */
    async updateStatus(projectId, equipmentId, status) {
      return API.patch(`/projects/${projectId}/equipment/${equipmentId}/status`, { status });
    },
    
    /**
     * Удаление оборудования
     * @param {number} projectId - ID проекта
     * @param {number} equipmentId - ID оборудования
     * @returns {Promise<Object>} - Результат удаления
     */
    async delete(projectId, equipmentId) {
      return API.delete(`/projects/${projectId}/equipment/${equipmentId}`);
    }
  },
  
  // Методы для работы с историей
  history: {
    /**
     * Получение истории проекта
     * @param {number} projectId - ID проекта
     * @returns {Promise<Array>} - История проекта
     */
    async getByProjectId(projectId) {
      return API.get(`/projects/${projectId}/history`);
    },
    
    /**
     * Добавление записи в историю
     * @param {number} projectId - ID проекта
     * @param {string} actionType - Тип действия
     * @param {string} message - Сообщение
     * @returns {Promise<Object>} - Добавленная запись
     */
    async add(projectId, actionType, message) {
      return API.post(`/projects/${projectId}/history`, { actionType, message });
    }
  },
  
  // Методы для работы с email
  email: {
    /**
     * Отправка email
     * @param {number} projectId - ID проекта
     * @param {string} to - Адрес получателя
     * @param {string} subject - Тема письма
     * @param {string} body - Текст письма
     * @returns {Promise<Object>} - Результат отправки
     */
    async send(projectId, to, subject, body) {
      return API.post(`/projects/${projectId}/email/send`, { to, subject, body });
    }
  }
};
