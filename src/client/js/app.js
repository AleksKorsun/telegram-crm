/**
 * Основной файл клиентской части Telegram CRM
 */

// Инициализация Telegram WebApp
const tg = window.Telegram.WebApp;
tg.expand(); // Раскрываем WebApp на весь экран

// Используем тему Telegram
document.documentElement.style.setProperty('--telegram-primary', tg.themeParams.button_color || '#2AABEE');
document.documentElement.style.setProperty('--telegram-text', tg.themeParams.text_color || '#000000');
document.documentElement.style.setProperty('--telegram-bg', tg.themeParams.bg_color || '#F0F2F5');

// Получаем ID проекта из URL
const urlParams = new URLSearchParams(window.location.search);
const projectId = urlParams.get('projectId');
const topicName = urlParams.get('topicName'); // Получаем название топика из URL если есть

// Статусы проекта и оборудования
const PROJECT_STATUSES = [
  'Новый',
  'Заказано оборудование',
  'Доставлено',
  'Монтаж',
  'Закрыто'
];

const EQUIPMENT_STATUSES = [
  'Заказано',
  'В пути',
  'Доставлено',
  'Установлено',
  'Проблема'
];

// Получение CSS-класса для статуса проекта
function getProjectStatusClass(status) {
  switch (status) {
    case 'Новый': return 'status-new bg-secondary';
    case 'Заказано оборудование': return 'status-ordered bg-primary';
    case 'Доставлено': return 'status-delivered bg-warning';
    case 'Монтаж': return 'status-installation bg-orange';
    case 'Закрыто': return 'status-completed bg-success';
    default: return 'bg-secondary';
  }
}

// Получение CSS-класса для статуса оборудования
function getEquipmentStatusClass(status) {
  switch (status) {
    case 'Заказано': return 'status-ordered';
    case 'В пути': return 'status-in-transit';
    case 'Доставлено': return 'status-delivered';
    case 'Установлено': return 'status-installed';
    case 'Проблема': return 'status-issue';
    default: return 'status-ordered';
  }
}

// Форматирование даты
function formatDate(dateString) {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Форматирование даты для input[type="date"]
function formatDateForInput(dateString) {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
}

// Загрузка данных проекта
async function loadProject() {
  try {
    if (!projectId) {
      showError('ID проекта не указан в URL');
      return;
    }
    
    // Если есть название топика, показываем его сразу
    if (topicName) {
      document.getElementById('project-title').textContent = topicName;
      document.title = topicName;
    }
    
    // Получаем данные проекта
    const data = await API.projects.getById(projectId);
    
    // Отображаем данные проекта
    displayProject(data.project);
    
    // Отображаем оборудование
    displayEquipment(data.equipmentList);
    
    // Отображаем историю
    displayHistory(data.history);
    
    // Заполняем выпадающие списки статусов
    populateStatusDropdowns();
    
  } catch (error) {
    showError('Ошибка при загрузке данных проекта: ' + error.message);
  }
}

// Отображение данных проекта
function displayProject(project) {
  // Если есть название топика в URL, используем его вместо названия проекта
  const projectTitle = topicName || project.title;
  document.title = projectTitle; // Обновляем заголовок страницы
  document.getElementById('project-title').textContent = projectTitle;
  document.getElementById('project-id').textContent = `ID: ${project.id}`;
  
  const statusElement = document.getElementById('project-status');
  statusElement.textContent = project.status;
  statusElement.className = `badge rounded-pill ${getProjectStatusClass(project.status)}`;
}

// Отображение списка оборудования
function displayEquipment(equipmentList) {
  const tableBody = document.getElementById('equipment-table-body');
  tableBody.innerHTML = '';
  
  if (!equipmentList || equipmentList.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="5" class="text-center">Нет оборудования</td></tr>';
    return;
  }
  
  equipmentList.forEach(item => {
    const row = document.createElement('tr');
    row.dataset.id = item.id;
    
    row.innerHTML = `
      <td>${item.model}</td>
      <td>${item.quantity}</td>
      <td><span class="equipment-status ${getEquipmentStatusClass(item.item_status)}">${item.item_status}</span></td>
      <td>${item.expected_date ? formatDate(item.expected_date) : '-'}</td>
      <td>
        <button class="btn btn-sm btn-outline-primary edit-equipment-btn" data-id="${item.id}">
          <i class="bi bi-pencil"></i>
        </button>
        <button class="btn btn-sm btn-outline-danger delete-equipment-btn" data-id="${item.id}">
          <i class="bi bi-trash"></i>
        </button>
      </td>
    `;
    
    tableBody.appendChild(row);
  });
  
  // Добавляем обработчики событий для кнопок редактирования и удаления
  document.querySelectorAll('.edit-equipment-btn').forEach(btn => {
    btn.addEventListener('click', () => openEditEquipmentModal(btn.dataset.id));
  });
  
  document.querySelectorAll('.delete-equipment-btn').forEach(btn => {
    btn.addEventListener('click', () => deleteEquipment(btn.dataset.id));
  });
}

// Отображение истории проекта
function displayHistory(history) {
  const timeline = document.getElementById('history-timeline');
  timeline.innerHTML = '';
  
  if (!history || history.length === 0) {
    timeline.innerHTML = '<div class="text-center">Нет записей в истории</div>';
    return;
  }
  
  history.forEach(item => {
    const historyItem = document.createElement('div');
    historyItem.className = 'timeline-item';
    
    historyItem.innerHTML = `
      <div class="timeline-date">${formatDate(item.created_at)}</div>
      <div class="timeline-content">
        <div class="timeline-type">${getActionTypeLabel(item.action_type)}</div>
        <div class="timeline-message">${item.message}</div>
      </div>
    `;
    
    timeline.appendChild(historyItem);
  });
}

// Получение читаемого названия типа действия
function getActionTypeLabel(actionType) {
  const types = {
    'create': 'Создание',
    'update': 'Обновление',
    'status_change': 'Изменение статуса',
    'equipment_added': 'Добавление оборудования',
    'equipment_update': 'Обновление оборудования',
    'equipment_status_change': 'Изменение статуса оборудования',
    'equipment_deleted': 'Удаление оборудования',
    'email_sent': 'Отправка email'
  };
  
  return types[actionType] || actionType;
}

// Заполнение выпадающих списков статусов
function populateStatusDropdowns() {
  // Статусы проекта
  const projectStatusDropdown = document.getElementById('status-dropdown-menu');
  projectStatusDropdown.innerHTML = '';
  
  PROJECT_STATUSES.forEach(status => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.className = 'dropdown-item';
    a.href = '#';
    a.textContent = status;
    a.addEventListener('click', () => updateProjectStatus(status));
    
    li.appendChild(a);
    projectStatusDropdown.appendChild(li);
  });
  
  // Статусы оборудования для добавления
  const equipmentStatusSelect = document.getElementById('equipment-status');
  equipmentStatusSelect.innerHTML = '';
  
  EQUIPMENT_STATUSES.forEach(status => {
    const option = document.createElement('option');
    option.value = status;
    option.textContent = status;
    equipmentStatusSelect.appendChild(option);
  });
  
  // Статусы оборудования для редактирования
  const editEquipmentStatusSelect = document.getElementById('edit-equipment-status');
  editEquipmentStatusSelect.innerHTML = '';
  
  EQUIPMENT_STATUSES.forEach(status => {
    const option = document.createElement('option');
    option.value = status;
    option.textContent = status;
    editEquipmentStatusSelect.appendChild(option);
  });
}

// Обновление статуса проекта
async function updateProjectStatus(status) {
  try {
    const result = await API.projects.updateStatus(projectId, status);
    
    if (result.success) {
      // Обновляем отображение статуса
      const statusElement = document.getElementById('project-status');
      statusElement.textContent = status;
      statusElement.className = `badge rounded-pill ${getProjectStatusClass(status)}`;
      
      // Перезагружаем историю
      const data = await API.projects.getById(projectId);
      displayHistory(data.history);
      
      showSuccess(`Статус проекта изменен на "${status}"`);
    }
  } catch (error) {
    showError('Ошибка при обновлении статуса проекта: ' + error.message);
  }
}

// Открытие модального окна для добавления оборудования
function openAddEquipmentModal() {
  // Сбрасываем форму
  document.getElementById('add-equipment-form').reset();
  
  // Открываем модальное окно
  const modal = new bootstrap.Modal(document.getElementById('add-equipment-modal'));
  modal.show();
}

// Добавление оборудования
async function addEquipment() {
  try {
    const model = document.getElementById('equipment-model').value;
    const quantity = parseInt(document.getElementById('equipment-quantity').value);
    const itemStatus = document.getElementById('equipment-status').value;
    const expectedDate = document.getElementById('equipment-date').value;
    const notes = document.getElementById('equipment-notes').value;
    
    if (!model) {
      showError('Необходимо указать модель оборудования');
      return;
    }
    
    const equipmentData = {
      model,
      quantity,
      itemStatus,
      expectedDate: expectedDate || null,
      notes: notes || null
    };
    
    // Отправляем запрос на добавление оборудования
    await API.equipment.add(projectId, equipmentData);
    
    // Закрываем модальное окно
    const modal = bootstrap.Modal.getInstance(document.getElementById('add-equipment-modal'));
    modal.hide();
    
    // Перезагружаем данные проекта
    await loadProject();
    
    showSuccess('Оборудование успешно добавлено');
  } catch (error) {
    showError('Ошибка при добавлении оборудования: ' + error.message);
  }
}

// Открытие модального окна для редактирования оборудования
async function openEditEquipmentModal(equipmentId) {
  try {
    // Получаем данные оборудования
    const equipmentList = await API.equipment.getByProjectId(projectId);
    const equipment = equipmentList.find(item => item.id == equipmentId);
    
    if (!equipment) {
      showError('Оборудование не найдено');
      return;
    }
    
    // Заполняем форму данными
    document.getElementById('edit-equipment-id').value = equipment.id;
    document.getElementById('edit-equipment-model').value = equipment.model;
    document.getElementById('edit-equipment-quantity').value = equipment.quantity;
    document.getElementById('edit-equipment-status').value = equipment.item_status;
    document.getElementById('edit-equipment-date').value = equipment.expected_date ? formatDateForInput(equipment.expected_date) : '';
    document.getElementById('edit-equipment-notes').value = equipment.notes || '';
    
    // Открываем модальное окно
    const modal = new bootstrap.Modal(document.getElementById('edit-equipment-modal'));
    modal.show();
  } catch (error) {
    showError('Ошибка при загрузке данных оборудования: ' + error.message);
  }
}

// Обновление оборудования
async function updateEquipment() {
  try {
    const equipmentId = document.getElementById('edit-equipment-id').value;
    const model = document.getElementById('edit-equipment-model').value;
    const quantity = parseInt(document.getElementById('edit-equipment-quantity').value);
    const itemStatus = document.getElementById('edit-equipment-status').value;
    const expectedDate = document.getElementById('edit-equipment-date').value;
    const notes = document.getElementById('edit-equipment-notes').value;
    
    if (!model) {
      showError('Необходимо указать модель оборудования');
      return;
    }
    
    const equipmentData = {
      model,
      quantity,
      itemStatus,
      expectedDate: expectedDate || null,
      notes: notes || null
    };
    
    // Отправляем запрос на обновление оборудования
    await API.equipment.update(projectId, equipmentId, equipmentData);
    
    // Закрываем модальное окно
    const modal = bootstrap.Modal.getInstance(document.getElementById('edit-equipment-modal'));
    modal.hide();
    
    // Перезагружаем данные проекта
    await loadProject();
    
    showSuccess('Оборудование успешно обновлено');
  } catch (error) {
    showError('Ошибка при обновлении оборудования: ' + error.message);
  }
}

// Удаление оборудования
async function deleteEquipment(equipmentId) {
  if (!confirm('Вы уверены, что хотите удалить это оборудование?')) {
    return;
  }
  
  try {
    // Отправляем запрос на удаление оборудования
    await API.equipment.delete(projectId, equipmentId);
    
    // Перезагружаем данные проекта
    await loadProject();
    
    showSuccess('Оборудование успешно удалено');
  } catch (error) {
    showError('Ошибка при удалении оборудования: ' + error.message);
  }
}

// Отправка email
async function sendEmail(event) {
  event.preventDefault();
  
  try {
    const to = document.getElementById('email-to').value;
    const subject = document.getElementById('email-subject').value;
    const body = document.getElementById('email-body').value;
    
    if (!to || !subject || !body) {
      showError('Необходимо заполнить все поля формы');
      return;
    }
    
    // Отправляем запрос на отправку email
    const result = await API.email.send(projectId, to, subject, body);
    
    if (result.success) {
      // Сбрасываем форму
      document.getElementById('email-form').reset();
      
      // Перезагружаем историю
      const data = await API.projects.getById(projectId);
      displayHistory(data.history);
      
      showSuccess('Email успешно отправлен');
    }
  } catch (error) {
    showError('Ошибка при отправке email: ' + error.message);
  }
}

// Отображение сообщения об ошибке
function showError(message) {
  alert(`Ошибка: ${message}`);
}

// Отображение сообщения об успешном действии
function showSuccess(message) {
  alert(`Успех: ${message}`);
}

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
  // Загружаем данные проекта
  loadProject();
  
  // Добавляем обработчики событий
  document.getElementById('add-equipment-btn').addEventListener('click', openAddEquipmentModal);
  document.getElementById('save-equipment-btn').addEventListener('click', addEquipment);
  document.getElementById('update-equipment-btn').addEventListener('click', updateEquipment);
  document.getElementById('email-form').addEventListener('submit', sendEmail);
});
