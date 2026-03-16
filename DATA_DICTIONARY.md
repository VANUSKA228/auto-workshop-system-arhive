# 📚 СЛОВАРЬ ДАННЫХ — Auto Workshop System v1.0

**Документ для согласования между базистом, фронтенд-разработчиком и бэкенд-разработчиком**

**Версия:** 1.0 (auth-only)  
**Статус:** Реализована авторизация и регистрация клиента

---

## 📄 СПИСОК ВСЕХ СТРАНИЦ (ПЛАН)

| № | Страница | URL | Роль | Статус реализации |
|---|----------|-----|------|-------------------|
| 1 | Лендинг | `/` | Все | ⏳ В планах |
| 2 | **Авторизация** | `/login` | Все | ✅ **РЕАЛИЗОВАНО** |
| 3 | **Регистрация клиента** | `/register` | Клиент | ✅ **РЕАЛИЗОВАНО** |
| 4 | Мои заявки | `/app/orders` | Все | ⏳ В планах |
| 5 | Создание заявки | `/app/orders/new` | Клиент, Мастер | ⏳ В планах |
| 6 | Оплата | `/app/payment` | Клиент | ⏳ В планах |
| 7 | Услуги | `/app/services` | Все | ⏳ В планах |
| 8 | Пользователи | `/app/users` | Admin | ⏳ В планах |
| 9 | Техники | `/app/workers` | Master, Admin | ⏳ В планах |
| 10 | Отчёты | `/app/reports` | Master, Admin | ⏳ В планах |

---

## 🗄️ СТРУКТУРА БАЗЫ ДАННЫХ

### Таблица: `roles`

| Поле | Тип | Описание | Значения | Ограничения |
|------|-----|----------|----------|-------------|
| `id` | INTEGER | ID роли | 1, 2, 3 | PK, AUTO INCREMENT |
| `name` | VARCHAR(50) | Название роли | "client", "master", "admin" | UNIQUE, NOT NULL |

**Используется в:**
- Frontend: Проверка прав доступа (role-based routing)
- Backend: `role_required()` decorator
- Связь: `users.role_id` → FK

**Статус:** ✅ Реализовано

---

### Таблица: `users`

| Поле | Тип | Описание | Пример | Ограничения |
|------|-----|----------|--------|-------------|
| `id` | INTEGER | ID пользователя | 1, 2, 3... | PK, AUTO INCREMENT |
| `first_name` | VARCHAR(100) | Имя | "Иван" | NOT NULL |
| `last_name` | VARCHAR(100) | Фамилия | "Иванов" | NOT NULL |
| `middle_name` | VARCHAR(100) | Отчество | "Иванович" | NULL |
| `email` | VARCHAR(255) | Email | "ivan@mail.ru" | UNIQUE, NOT NULL, INDEX |
| `phone` | VARCHAR(20) | Телефон | "+79991234567" | NULL |
| `password_hash` | VARCHAR(255) | Хэш пароля (bcrypt) | "$2b$12$..." | NOT NULL |
| `role_id` | INTEGER | ID роли | 1, 2, 3 | FK → roles(id), NOT NULL |
| `is_active` | BOOLEAN | Активен ли | TRUE, FALSE | DEFAULT TRUE |
| `created_at` | TIMESTAMP | Дата создания | 2024-01-01 12:00:00 | DEFAULT NOW() |

**Используется в:**
- Frontend: Отображение имени в Navbar, проверка роли
- Backend: Авторизация, JWT payload
- Связи: `orders.client_id`, `orders.master_id`, `user_workshop_link.user_id`

**Статус:** ✅ Реализовано

---

### Таблица: `workshops`

| Поле | Тип | Описание | Пример | Ограничения |
|------|-----|----------|--------|-------------|
| `id` | INTEGER | ID мастерской | 1, 2, 3... | PK, AUTO INCREMENT |
| `name` | VARCHAR(100) | Название | "Центральная" | NOT NULL |
| `city` | VARCHAR(100) | Город | "Москва" | NOT NULL |
| `address` | VARCHAR(255) | Адрес | "ул. Ленина, 10" | NULL |
| `phone` | VARCHAR(20) | Телефон | "+74951234567" | NULL |

**Используется в:**
- Frontend: Выбор мастерской в формах, фильтр в заявках
- Backend: Фильтрация по мастерской
- Связи: `orders.workshop_id`, `user_workshop_link.workshop_id`, `workers.workshop_id`

**Статус:** ✅ Реализовано

---

### Таблица: `user_workshop_link` (M2M)

| Поле | Тип | Описание | Пример | Ограничения |
|------|-----|----------|--------|-------------|
| `user_id` | INTEGER | ID пользователя | 1, 2, 3... | FK → users(id), PK |
| `workshop_id` | INTEGER | ID мастерской | 1, 2, 3... | FK → workshops(id), PK |
| `role_in_workshop` | VARCHAR(50) | Роль в мастерской | "master", "client" | NULL |

**Используется в:**
- Frontend: Отображение доступных мастерских для пользователя
- Backend: Проверка прав на мастерскую
- Связь: M2M между users и workshops

**Статус:** ✅ Реализовано

---

### Таблица: `services`

| Поле | Тип | Описание | Пример | Ограничения |
|------|-----|----------|--------|-------------|
| `id` | INTEGER | ID услуги | 1, 2, 3... | PK, AUTO INCREMENT |
| `name` | VARCHAR(100) | Название услуги | "Замена масла" | NOT NULL |
| `price` | NUMERIC(10,2) | Цена (₽) | 1500.00 | NOT NULL |

**Используется в:**
- Frontend: Выбор услуг в форме заявки, отображение списка услуг
- Backend: Расчёт стоимости заказа
- Связи: `order_services.service_id`

**Статус:** ⏳ Будет в следующей версии

---

### Таблица: `orders`

| Поле | Тип | Описание | Пример | Ограничения |
|------|-----|----------|--------|-------------|
| `id` | INTEGER | ID заявки | 1, 2, 3... | PK, AUTO INCREMENT |
| `client_id` | INTEGER | ID клиента | 5, 6, 7... | FK → users(id), NOT NULL |
| `master_id` | INTEGER | ID мастера | 2, 3, 4... | FK → users(id), NULL |
| `workshop_id` | INTEGER | ID мастерской | 1, 2, 3... | FK → workshops(id), NOT NULL |
| `worker_id` | INTEGER | ID техника | 1, 2, 3... | FK → workers(id), NULL |
| `car_brand` | VARCHAR(50) | Марка авто | "Toyota" | NOT NULL |
| `car_model` | VARCHAR(50) | Модель авто | "Camry" | NOT NULL |
| `car_year` | INTEGER | Год авто | 2020 | NOT NULL |
| `description` | TEXT | Описание проблемы | "Стук в подвеске" | NULL |
| `status` | VARCHAR(30) | Статус | "new", "in_progress", "done" | DEFAULT 'new', NOT NULL |
| `created_at` | TIMESTAMP | Дата создания | 2024-01-01 12:00:00 | DEFAULT NOW() |

**Используется в:**
- Frontend: Таблица заявок, форма создания/редактирования
- Backend: CRUD операции, фильтрация по статусу/мастерской
- Связи: `order_services.order_id`, `payments.order_id`

**Статус:** ⏳ Будет в следующей версии

---

### Таблица: `order_services` (M2M)

| Поле | Тип | Описание | Пример | Ограничения |
|------|-----|----------|--------|-------------|
| `order_id` | INTEGER | ID заявки | 1, 2, 3... | FK → orders(id), PK |
| `service_id` | INTEGER | ID услуги | 1, 2, 3... | FK → services(id), PK |

**Используется в:**
- Frontend: Отображение выбранных услуг в заявке
- Backend: Расчёт общей стоимости
- Связь: M2M между orders и services

**Статус:** ⏳ Будет в следующей версии

---

### Таблица: `workers`

| Поле | Тип | Описание | Пример | Ограничения |
|------|-----|----------|--------|-------------|
| `id` | INTEGER | ID техника | 1, 2, 3... | PK, AUTO INCREMENT |
| `first_name` | VARCHAR(100) | Имя | "Алексей" | NOT NULL |
| `last_name` | VARCHAR(100) | Фамилия | "Петров" | NOT NULL |
| `position` | VARCHAR(100) | Должность | "Техник" | NOT NULL |
| `workshop_id` | INTEGER | ID мастерской | 1, 2, 3... | FK → workshops(id), NOT NULL |

**Используется в:**
- Frontend: Выбор техника в форме, список техников мастерской
- Backend: Фильтрация по мастерской, назначение на заявку
- Связи: `orders.worker_id`

**Статус:** ⏳ Будет в следующей версии

---

### Таблица: `payments`

| Поле | Тип | Описание | Пример | Ограничения |
|------|-----|----------|--------|-------------|
| `id` | INTEGER | ID платежа | 1, 2, 3... | PK, AUTO INCREMENT |
| `order_id` | INTEGER | ID заявки | 1, 2, 3... | FK → orders(id), NOT NULL |
| `amount` | NUMERIC(10,2) | Сумма (₽) | 5000.00 | NOT NULL |
| `status` | VARCHAR(30) | Статус | "pending", "paid", "refunded" | DEFAULT 'pending' |
| `created_at` | TIMESTAMP | Дата оплаты | 2024-01-01 12:00:00 | DEFAULT NOW() |

**Используется в:**
- Frontend: Страница оплаты, отображение статуса
- Backend: Обработка платежей, отчёты
- Связи: `orders.id` → FK

**Статус:** ⏳ Будет в следующей версии

---

## 📄 СТРАНИЦА 1: Лендинг (`/`)

**Статус:** ⏳ В планах

### Интерактивные элементы:

| Элемент | Тип | Данные | Взаимодействие |
|---------|-----|--------|----------------|
| **Кнопка "Войти"** | Link | - | Переход на `/login` |
| **Кнопка "Регистрация"** | Link | - | Переход на `/register` |
| **Информация о сервисе** | Text | - | Статичный контент |

---

## 📄 СТРАНИЦА 2: Авторизация (`/login`)

**Статус:** ✅ РЕАЛИЗОВАНО

### 🎯 Доступные роли:

**Войти могут ВСЕ 3 роли:**
| Роль | Email | Пароль |
|------|-------|--------|
| **Admin** | `admin@autoservice.ru` | `admin123` |
| **Master** | `master.moscow1@autoservice.ru` | `master123` |
| **Client** | `client1.moscow@autoservice.ru` | `client123` |

### Интерактивные элементы:

| Элемент | Тип | Данные | Валидация | Взаимодействие с БД |
|---------|-----|--------|-----------|---------------------|
| **Email** | Input (text) | `string` | - Формат email<br>- Обязательное поле | Поиск в `users.email` |
| **Пароль** | Input (password) | `string` | - Минимум 6 символов<br>- Обязательное поле | Сравнение хэша с `users.password_hash` |
| **Кнопка "Войти"** | Button | - | - | POST `/auth/login` → JWT токен |
| **Кнопка "Зарегистрироваться"** | Button | - | - | Переход на `/register` |

### Данные для отправки на backend:

```typescript
interface LoginRequest {
  email: string;      // string, email format, required
  password: string;   // string, min 6 chars, required
}
```

### Данные получаемые от backend:

```typescript
interface LoginResponse {
  token: string;      // JWT токен
  user: {
    id: number;       // ID пользователя из БД
    name: string;     // ФИО сокращённо
    role: string;     // "client", "master", "admin"
  };
  token_type: string; // "bearer"
}
```

---

## 📄 СТРАНИЦА 3: Регистрация клиента (`/register`)

**Статус:** ✅ РЕАЛИЗОВАНО

### 🎯 Кто может зарегистрироваться:

**Самостоятельная регистрация доступна ТОЛЬКО для роли:**
| Роль | Регистрация |
|------|-------------|
| **Client** | ✅ Самостоятельно через `/register` |
| **Master** | ❌ Создаётся администратором (будет в v2.0) |
| **Admin** | ❌ Создаётся при миграции БД |

### Интерактивные элементы:

| Элемент | Тип | Данные | Валидация | Взаимодействие с БД |
|---------|-----|--------|-----------|---------------------|
| **Имя** | Input (text) | `string` | - Обязательное поле | Сохранение в `users.first_name` |
| **Фамилия** | Input (text) | `string` | - Обязательное поле | Сохранение в `users.last_name` |
| **Email** | Input (email) | `string` | - Формат email<br>- Обязательное поле<br>- Уникальность | Проверка уникальности в `users.email` |
| **Телефон** | Input (tel) | `string` | - Опциональное поле | Сохранение в `users.phone` |
| **Автосервис** | Select | `number` | - Обязательное поле | GET `/workshops/public` → `workshops.id` |
| **Пароль** | Input (password) | `string` | - Минимум 6 символов<br>- Обязательное поле | Хэширование → `users.password_hash` |
| **Подтверждение пароля** | Input (password) | `string` | - Совпадение с паролем<br>- Обязательное поле | Не сохраняется в БД |
| **Кнопка "Зарегистрироваться"** | Button | - | - | POST `/auth/register/client` → JWT токен |
| **Кнопка "Войти"** | Link | - | - | Переход на `/login` |

### Данные для отправки на backend:

```typescript
interface ClientRegisterRequest {
  first_name: string;     // string, required
  last_name: string;      // string, required
  email: string;          // string, email format, required, unique
  phone?: string;         // string, optional
  password: string;       // string, min 6 chars, required
  workshop_id: number;    // integer, required, FK → workshops.id
}
```

---

## 📄 СТРАНИЦА 4: Мои заявки (`/app/orders`)

**Статус:** ⏳ В планах

### Интерактивные элементы:

| Элемент | Тип | Данные | Валидация | Взаимодействие с БД |
|---------|-----|--------|-----------|---------------------|
| **Таблица заявок** | Table | `Order[]` | - | GET `/orders` |
| **Поиск** | Input | `string` | - | Фильтрация по `orders.description`, `orders.car_brand` |
| **Фильтр по статусу** | Select | `string` | - | Фильтрация по `orders.status` |
| **Фильтр по мастерской** | Select | `number` | - | Фильтрация по `orders.workshop_id` |
| **Фильтр по дате (от)** | DateInput | `date` | - | Фильтрация по `orders.created_at >= date` |
| **Фильтр по дате (до)** | DateInput | `date` | - | Фильтрация по `orders.created_at <= date` |
| **Кнопка "+ Создать заявку"** | Link | - | - | Переход на `/app/orders/new` |
| **Кнопка "Редактировать"** | Button | `order_id` | - | Открывает модальное окно, PUT `/orders/{id}` |
| **Кнопка "Сменить статус"** | Button | `order_id` | - | Открывает модальное окно, PATCH `/orders/{id}/status` |
| **Кнопка "Контакты"** | Button | `order_id` | - | Открывает модальное окно с контактами |
| **Кнопка "Удалить"** | Button | `order_id` | - | DELETE `/orders/{id}` |

---

## 📄 СТРАНИЦА 5: Создание заявки (`/app/orders/new`)

**Статус:** ⏳ В планах

### Интерактивные элементы:

| Элемент | Тип | Данные | Валидация | Взаимодействие с БД |
|---------|-----|--------|-----------|---------------------|
| **Имя клиента** | Input (text) | `string` | - Обязательное (для мастера) | `users.first_name` |
| **Фамилия клиента** | Input (text) | `string` | - Обязательное (для мастера) | `users.last_name` |
| **Email клиента** | Input (email) | `string` | - Формат email (для мастера) | `users.email` |
| **Телефон клиента** | Input (tel) | `string` | - Опционально | `users.phone` |
| **Марка авто** | Input (text) | `string` | - Обязательное | `orders.car_brand` |
| **Модель авто** | Input (text) | `string` | - Обязательное | `orders.car_model` |
| **Год авто** | Input (number) | `number` | - 1900...текущий год | `orders.car_year` |
| **Описание проблемы** | Textarea | `string` | - Макс 1000 символов | `orders.description` |
| **Мастерская** | Select | `number` | - Обязательное | GET `/workshops` → `workshops.id` |
| **Услуги** | Checkbox[] | `number[]` | - Минимум 1 услуга | GET `/services` → `order_services.service_id` |
| **Кнопка "Сохранить"** | Button | - | - | POST `/orders` (мастер) или с переходом на оплату (клиент) |
| **Кнопка "Отмена"** | Link | - | - | Переход на `/app/orders` |

---

## 📄 СТРАНИЦА 6: Оплата (`/app/payment`)

**Статус:** ⏳ В планах

### Интерактивные элементы:

| Элемент | Тип | Данные | Валидация | Взаимодействие с БД |
|---------|-----|--------|-----------|---------------------|
| **Сумма к оплате** | Text | `number` | - | GET `/orders/{id}` → расчёт услуг |
| **Номер карты** | Input (text) | `string` | - 16 цифр | Не сохраняется (заглушка) |
| **Срок действия** | Input (text) | `string` | - MM/YY | Не сохраняется (заглушка) |
| **CVV** | Input (password) | `string` | - 3 цифры | Не сохраняется (заглушка) |
| **Кнопка "Оплатить"** | Button | - | - | POST `/payments` → `payments.status = "paid"` |
| **Кнопка "Отмена"** | Link | - | - | Переход на `/app/orders` |

---

## 📄 СТРАНИЦА 7: Услуги (`/app/services`)

**Статус:** ⏳ В планах

### Интерактивные элементы:

| Элемент | Тип | Данные | Валидация | Взаимодействие с БД |
|---------|-----|--------|-----------|---------------------|
| **Таблица услуг** | Table | `Service[]` | - | GET `/services` |
| **Кнопка "Добавить услугу"** | Button | - | - | Открывает модальное окно (только Admin) |
| **Кнопка "Редактировать"** | Button | `service_id` | - | Открывает модальное окно (только Admin), PUT `/services/{id}` |
| **Кнопка "Удалить"** | Button | `service_id` | - | DELETE `/services/{id}` (только Admin) |

---

## 📄 СТРАНИЦА 8: Пользователи (`/app/users`)

**Статус:** ⏳ В планах (только Admin)

### Интерактивные элементы:

| Элемент | Тип | Данные | Валидация | Взаимодействие с БД |
|---------|-----|--------|-----------|---------------------|
| **Таблица пользователей** | Table | `User[]` | - | GET `/users` |
| **Фильтр по роли** | Select | `string` | - | Фильтрация по `users.role_id` |
| **Фильтр по мастерской** | Select | `number` | - | Фильтрация через `user_workshop_link.workshop_id` |
| **Кнопка "Добавить пользователя"** | Button | - | - | Открывает модальное окно, POST `/users` |
| **Кнопка "Редактировать"** | Button | `user_id` | - | Открывает модальное окно, PUT `/users/{id}` |
| **Кнопка "Удалить"** | Button | `user_id` | - | DELETE `/users/{id}` |

---

## 📄 СТРАНИЦА 9: Техники (`/app/workers`)

**Статус:** ⏳ В планах (Master, Admin)

### Интерактивные элементы:

| Элемент | Тип | Данные | Валидация | Взаимодействие с БД |
|---------|-----|--------|-----------|---------------------|
| **Таблица техников** | Table | `Worker[]` | - | GET `/workers/workshop/{workshop_id}` |
| **Фильтр по мастерской** | Select | `number` | - | Фильтрация по `workers.workshop_id` |
| **Кнопка "Добавить техника"** | Button | - | - | Открывает модальное окно, POST `/workers` |
| **Кнопка "Редактировать"** | Button | `worker_id` | - | Открывает модальное окно, PUT `/workers/{id}` |
| **Кнопка "Удалить"** | Button | `worker_id` | - | DELETE `/workers/{id}` |

---

## 📄 СТРАНИЦА 10: Отчёты (`/app/reports`)

**Статус:** ⏳ В планах (Master, Admin)

### Интерактивные элементы:

| Элемент | Тип | Данные | Валидация | Взаимодействие с БД |
|---------|-----|--------|-----------|---------------------|
| **Период (от)** | DateInput | `date` | - | Фильтрация по `orders.created_at >= date` |
| **Период (до)** | DateInput | `date` | - | Фильтрация по `orders.created_at <= date` |
| **Мастерская** | Select | `number` | - | Фильтрация по `orders.workshop_id` |
| **Кнопка "Сформировать"** | Button | - | - | GET `/reports/summary?from=...&to=...&workshop_id=...` |
| **Таблица отчёта** | Table | `ReportData[]` | - | Агрегация данных из `orders`, `order_services` |

---

## 🔄 API ENDPOINTS

### Реализовано (✅):

| Метод | Endpoint | Описание | Статус |
|-------|----------|----------|--------|
| POST | `/auth/login` | Вход в систему | ✅ |
| POST | `/auth/register/client` | Регистрация клиента | ✅ |
| GET | `/workshops/public` | Публичный список мастерских | ✅ |

### В планах (⏳):

| Метод | Endpoint | Описание |
|-------|----------|----------|
| GET | `/users` | Список пользователей |
| POST | `/users` | Создание пользователя |
| PUT | `/users/{id}` | Обновление пользователя |
| DELETE | `/users/{id}` | Удаление пользователя |
| GET | `/workshops` | Список мастерских (Auth) |
| POST | `/workshops` | Создание мастерской |
| PUT | `/workshops/{id}` | Обновление мастерской |
| DELETE | `/workshops/{id}` | Удаление мастерской |
| GET | `/orders` | Список заявок |
| POST | `/orders` | Создание заявки |
| PUT | `/orders/{id}` | Обновление заявки |
| PATCH | `/orders/{id}/status` | Смена статуса |
| DELETE | `/orders/{id}` | Удаление заявки |
| GET | `/services` | Список услуг |
| POST | `/services` | Создание услуги |
| PUT | `/services/{id}` | Обновление услуги |
| DELETE | `/services/{id}` | Удаление услуги |
| GET | `/workers` | Список техников |
| POST | `/workers` | Создание техника |
| PUT | `/workers/{id}` | Обновление техника |
| DELETE | `/workers/{id}` | Удаление техника |
| POST | `/payments` | Создание платежа |
| GET | `/reports/summary` | Сводный отчёт |
| GET | `/reports/personal` | Персональный отчёт |

---

## ✅ ЧЕК-ЛИСТ СООТВЕТСТВИЯ

### Фронтенд:
- ✅ Страница `/login` — форма авторизации
- ✅ Страница `/register` — форма регистрации клиента
- ⏳ Страница `/app/orders` — таблица заявок
- ⏳ Страница `/app/orders/new` — создание заявки
- ⏳ Страница `/app/payment` — оплата
- ⏳ Страница `/app/services` — управление услугами
- ⏳ Страница `/app/users` — управление пользователями (Admin)
- ⏳ Страница `/app/workers` — управление техниками
- ⏳ Страница `/app/reports` — отчёты

### Backend:
- ✅ POST `/auth/login` — вход
- ✅ POST `/auth/register/client` — регистрация клиента
- ✅ GET `/workshops/public` — список мастерских
- ⏳ Все CRUD endpoints для пользователей, мастерских, заявок, услуг, техников
- ⏳ Endpoints для платежей и отчётов

### База данных:
- ✅ Таблицы: `roles`, `users`, `workshops`, `user_workshop_link`
- ⏳ Таблицы: `services`, `orders`, `order_services`, `workers`, `payments`
- ✅ Миграции Alembic
- ✅ Индексы и ограничения

---

## 📝 ПРИМЕЧАНИЯ ДЛЯ СОГЛАСОВАНИЯ

### Для базиста:
- ✅ Проверить что все поля из форм авторизации/регистрации есть в таблицах
- ✅ Добавить индекс на `users.email` для ускорения поиска при логине
- ✅ Проверить UNIQUE constraint на `users.email`
- ⏳ Добавить таблицы для заявок, услуг, техников, платежей

### Для фронтенда:
- ✅ Реализовать валидацию всех полей авторизации/регистрации
- ✅ Обработать ошибку "Email уже занят"
- ✅ Добавить loading-состояние для кнопок
- ⏳ Реализовать остальные страницы согласно словарю

### Для бэкенда:
- ✅ Проверить что JWT токен содержит `user_id` и `role`
- ✅ Убедиться что пароль хэшируется перед сохранением
- ✅ Проверить обработку дубликатов email
- ⏳ Реализовать все endpoints согласно словарю

---

## 📈 ПЛАН РАЗРАБОТКИ

### Версия 1.0 (текущая):
- ✅ Авторизация
- ✅ Регистрация клиента

### Версия 2.0 (следующая):
- ⏳ Страница заявок (`/app/orders`)
- ⏳ Создание заявки (`/app/orders/new`)
- ⏳ Управление услугами

### Версия 3.0 (полная):
- ⏳ Страница оплаты
- ⏳ Управление пользователями (Admin)
- ⏳ Управление техниками
- ⏳ Отчёты

---

**Документ актуален на момент:** 2026-03-16  
**Версия:** 1.0 (auth-only)
