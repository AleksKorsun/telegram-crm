-- Схема базы данных для Telegram-CRM

-- Таблица проектов
CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    chat_id TEXT NOT NULL UNIQUE,
    status TEXT DEFAULT 'Новый',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица оборудования
CREATE TABLE IF NOT EXISTS equipment (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    model TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    item_status TEXT DEFAULT 'Заказано',
    expected_date TIMESTAMP NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE
);

-- Таблица истории действий
CREATE TABLE IF NOT EXISTS history_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    action_type TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE
);

-- Индексы для ускорения запросов
CREATE INDEX IF NOT EXISTS idx_equipment_project_id ON equipment (project_id);
CREATE INDEX IF NOT EXISTS idx_history_logs_project_id ON history_logs (project_id);
CREATE INDEX IF NOT EXISTS idx_projects_chat_id ON projects (chat_id);

-- Предопределенные статусы проектов (для справки)
-- 'Новый', 'Заказано оборудование', 'Доставлено', 'Монтаж', 'Закрыто'

-- Предопределенные статусы оборудования (для справки)
-- 'Заказано', 'В пути', 'Доставлено', 'Установлено', 'Проблема'
