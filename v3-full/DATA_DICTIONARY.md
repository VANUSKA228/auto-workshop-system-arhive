# 📚 ПОЛНЫЙ СЛОВАРЬ ДАННЫХ — Auto Workshop System v3.0

**Документ для согласования между базистом, фронтенд-разработчиком и бэкенд-разработчиком**

**Версия:** 3.0 (Full)  
**Статус:** Полная спецификация всех страниц и данных

---

## 📄 СПИСОК ВСЕХ СТРАНИЦ

| № | Страница | URL | Роль | Статус |
|---|----------|-----|------|--------|
| 1 | Лендинг | `/` | Все | ⏳ В планах |
| 2 | Авторизация | `/login` | Все | ✅ Реализовано |
| 3 | Регистрация клиента | `/register` | Клиент | ✅ Реализовано |
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

**Статус:** ✅ Реализовано

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

**Статус:** ✅ Реализовано

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

### Данные для отображения:

```typescript
interface Order {
  id: number;
  client_id: number;
  master_id: number | null;
  workshop_id: number;
  workshop?: {
    id: number;
    name: string;
    city: string;
    address: string;
    phone: string;
  };
  car_brand: string;
  car_model: string;
  car_year: number;
  description: string | null;
  status: string;  // "new", "in_progress", "done"
  created_at: string;
  client?: {
    id: number;
    first_name: string;
    last_name: string;
    phone: string | null;
  };
  master?: {
    id: number;
    first_name: string;
    last_name: string;
  };
  order_services: {
    service_id: number;
    service: {
      id: number;
      name: string;
      price: number;
    };
  }[];
  worker?: {
    id: number;
    first_name: string;
    last_name: string;
  };
}
```

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

### Данные для отправки на backend:

```typescript
interface CreateOrderRequest {
  first_name?: string;    // string, required для мастера
  last_name?: string;     // string, required для мастера
  middle_name?: string;   // string, optional
  phone?: string;         // string, optional
  email?: string;         // string, email format, optional
  car_brand: string;      // string, required
  car_model: string;      // string, required
  car_year: number;       // integer, required
  description?: string;   // string, max 1000 chars
  workshop_id: number;    // integer, required, FK → workshops.id
  service_ids: number[];  // integer[], min 1 item, FK → services.id
}
```

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

### Данные для отправки на backend:

```typescript
interface PaymentRequest {
  order_id: number;   // integer, required, FK → orders.id
  amount: number;     // numeric, required
}
```

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

### Данные для отображения:

```typescript
interface Service {
  id: number;
  name: string;
  price: number;
}
```

### Данные для добавления/редактирования:

```typescript
interface ServiceCreateUpdate {
  name: string;   // string, required
  price: number;  // numeric, required
}
```

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

### Данные для отображения:

```typescript
interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  role: {
    id: number;
    name: string;
  };
  workshops: {
    id: number;
    name: string;
    city: string;
  }[];
}
```

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

### Данные для отображения:

```typescript
interface Worker {
  id: number;
  first_name: string;
  last_name: string;
  position: string;
  workshop_id: number;
  workshop: {
    id: number;
    name: string;
    city: string;
  };
}
```

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

### Данные для отображения:

```typescript
interface ReportSummary {
  total_orders: number;       // COUNT(orders.id)
  total_revenue: number;      // SUM(services.price)
  by_status: {
    status: string;
    count: number;
  }[];
  by_workshop: {
    workshop_id: number;
    workshop_name: string;
    orders_count: number;
    revenue: number;
  }[];
}
```

---

## 🔄 API ENDPOINTS (полный список)

### Авторизация

| Метод | Endpoint | Описание | Request | Response |
|-------|----------|----------|---------|----------|
| POST | `/auth/login` | Вход | `LoginRequest` | `LoginResponse` |
| POST | `/auth/register/client` | Регистрация клиента | `ClientRegisterRequest` | `LoginResponse` |
| POST | `/auth/register` | Создание пользователя (Admin) | `UserCreate` | `UserRead` |

### Пользователи

| Метод | Endpoint | Описание | Request | Response |
|-------|----------|----------|---------|----------|
| GET | `/users` | Список пользователей | - | `User[]` |
| GET | `/users/{id}` | Получение пользователя | - | `UserRead` |
| POST | `/users` | Создание пользователя (Admin) | `UserCreate` | `UserRead` |
| PUT | `/users/{id}` | Обновление пользователя | `UserUpdate` | `UserRead` |
| DELETE | `/users/{id}` | Удаление пользователя | - | - |

### Мастерские

| Метод | Endpoint | Описание | Request | Response |
|-------|----------|----------|---------|----------|
| GET | `/workshops` | Список мастерских (Auth) | - | `Workshop[]` |
| GET | `/workshops/public` | Публичный список | - | `Workshop[]` |
| GET | `/workshops/{id}` | Получение мастерской | - | `Workshop` |
| POST | `/workshops` | Создание (Admin) | `WorkshopCreate` | `Workshop` |
| PUT | `/workshops/{id}` | Обновление (Admin) | `WorkshopUpdate` | `Workshop` |
| DELETE | `/workshops/{id}` | Удаление (Admin) | - | - |

### Заявки

| Метод | Endpoint | Описание | Request | Response |
|-------|----------|----------|---------|----------|
| GET | `/orders` | Список заявок | - | `Order[]` |
| GET | `/orders/{id}` | Получение заявки | - | `Order` |
| POST | `/orders` | Создание заявки | `OrderCreate` | `Order` |
| PUT | `/orders/{id}` | Обновление заявки | `OrderUpdate` | `Order` |
| PATCH | `/orders/{id}/status` | Смена статуса | `{status: string}` | `Order` |
| DELETE | `/orders/{id}` | Удаление заявки | - | - |

### Услуги

| Метод | Endpoint | Описание | Request | Response |
|-------|----------|----------|---------|----------|
| GET | `/services` | Список услуг | - | `Service[]` |
| GET | `/services/{id}` | Получение услуги | - | `Service` |
| POST | `/services` | Создание (Admin) | `ServiceCreate` | `Service` |
| PUT | `/services/{id}` | Обновление (Admin) | `ServiceUpdate` | `Service` |
| DELETE | `/services/{id}` | Удаление (Admin) | - | - |

### Техники

| Метод | Endpoint | Описание | Request | Response |
|-------|----------|----------|---------|----------|
| GET | `/workers` | Список техников | - | `Worker[]` |
| GET | `/workers/workshop/{workshop_id}` | Техники мастерской | - | `Worker[]` |
| GET | `/workers/{id}` | Получение техника | - | `Worker` |
| POST | `/workers` | Создание (Admin/Master) | `WorkerCreate` | `Worker` |
| PUT | `/workers/{id}` | Обновление | `WorkerUpdate` | `Worker` |
| DELETE | `/workers/{id}` | Удаление | - | - |

### Платежи

| Метод | Endpoint | Описание | Request | Response |
|-------|----------|----------|---------|----------|
| GET | `/payments/{order_id}` | Платёж по заявке | - | `Payment` |
| POST | `/payments` | Создание платежа | `PaymentCreate` | `Payment` |

### Отчёты

| Метод | Endpoint | Описание | Request | Response |
|-------|----------|----------|---------|----------|
| GET | `/reports/summary` | Сводный отчёт | `?from=...&to=...&workshop_id=...` | `ReportSummary` |
| GET | `/reports/personal` | Персональный отчёт (Master) | `?from=...&to=...` | `ReportSummary` |

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
- ⏳ Все CRUD endpoints для пользователей, мастерских, заявок, услуг, техников
- ⏳ Endpoints для платежей и отчётов

### База данных:
- ✅ Таблицы: `roles`, `users`, `workshops`, `user_workshop_link`
- ✅ Таблицы: `services`, `orders`, `order_services`, `workers`, `payments`
- ✅ Миграции Alembic
- ✅ Индексы и ограничения

---

## 📝 ПРИМЕЧАНИЯ ДЛЯ СОГЛАСОВАНИЯ

### Для базиста:
- Проверить что все поля из форм есть в таблицах
- Добавить индексы на часто используемые поля (`users.email`, `orders.status`, `orders.created_at`)
- Проверить FOREIGN KEY constraints

### Для фронтенда:
- Реализовать валидацию всех полей согласно словарю
- Обработать все возможные ошибки от API
- Реализовать loading-состояния для кнопок

### Для бэкенда:
- Реализовать все endpoints согласно словарю
- Проверить что JWT содержит `user_id` и `role`
- Реализовать проверку прав доступа (role-based)

---

**Документ актуален на момент:** 2026-03-16  
**Версия:** 3.0 (Full)
