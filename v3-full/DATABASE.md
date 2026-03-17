# 🗄️ База данных и работа с ней

Документация по структуре базы данных, ORM моделям и миграциям.

---

## 📊 Общая структура

Проект использует **PostgreSQL 15** + **SQLAlchemy 2.0** (ORM) + **Alembic** (миграции).

### Файлы конфигурации:

| Файл | Описание |
|------|----------|
| [`backend/app/config.py`](#backendappconfigpy) | Настройки подключения (DATABASE_URL) |
| [`backend/app/database.py`](#backendappdatabasepy) | Движок SQLAlchemy, сессии |
| `backend/.env.example` | Пример переменных окружения |
| `backend/alembic.ini` | Конфигурация Alembic |
| `backend/alembic/env.py` | Окружение для миграций |

---

## 🗂️ ORM Модели (таблицы БД)

### 1. **roles** — Роли пользователей
**Файл:** `backend/app/models/role.py`

```python
roles
├── id (PK)
└── name  # client, master, admin
```

### 2. **users** — Пользователи системы
**Файл:** `backend/app/models/user.py`

```python
users
├── id (PK)
├── first_name
├── last_name
├── email (UNIQUE)
├── password_hash
├── role_id (FK → roles)
├── phone
└── is_active
```

### 3. **workshops** — Мастерские
**Файл:** `backend/app/models/workshop.py`

```python
workshops
├── id (PK)
├── name
├── city
├── address
└── phone
```

### 4. **user_workshop_link** — M2M связь (пользователи ↔ мастерские)
**Файл:** `backend/app/models/workshop.py`

```python
user_workshop_link
├── user_id (FK → users)
├── workshop_id (FK → workshops)
└── role_in_workshop
```

### 5. **services** — Услуги (справочник)
**Файл:** `backend/app/models/service.py`

```python
services
├── id (PK)
├── name
└── price
```

### 6. **orders** — Заявки
**Файл:** `backend/app/models/order.py`

```python
orders
├── id (PK)
├── client_id (FK → users)
├── master_id (FK → users)
├── workshop_id (FK → workshops)
├── worker_id (FK → workers)
├── car_brand
├── car_model
├── car_year
├── description
└── status  # new, in_progress, done
```

### 7. **order_services** — Услуги в заявках (M2M)
**Файл:** `backend/app/models/order.py`

```python
order_services
├── order_id (FK → orders)
└── service_id (FK → services)
```

### 8. **workers** — Техники/работники
**Файл:** `backend/app/models/worker.py`

```python
workers
├── id (PK)
├── first_name
├── last_name
├── position
└── workshop_id (FK → workshops)
```

### 9. **payments** — Платежи
**Файл:** `backend/app/models/payment.py`

```python
payments
├── id (PK)
├── order_id (FK → orders)
├── amount
└── status
```

---

## 📁 Полная структура файлов

```
auto-workshop-system-main/
├── backend/
│   ├── app/
│   │   ├── config.py                      ⚙️ Настройки БД
│   │   ├── database.py                    🔌 Подключение SQLAlchemy
│   │   └── models/
│   │       ├── __init__.py
│   │       ├── role.py                    📋 roles
│   │       ├── user.py                    👥 users
│   │       ├── workshop.py                🏭 workshops + user_workshop_link
│   │       ├── order.py                   📝 orders + order_services
│   │       ├── service.py                 🔧 services
│   │       ├── worker.py                  👷 workers
│   │       └── payment.py                 💳 payments
│   ├── alembic/
│   │   ├── env.py                         🔄 Настройки миграций
│   │   └── versions/
│   │       ├── 001_initial_schema.py
│   │       ├── 002_seed_roles_admin.py
│   │       ├── 003_workshops_and_links.py
│   │       ├── 004_seed_workshops_and_base_users.py
│   │       ├── 005_workers_and_order_worker.py
│   │       ├── 006_workshop_addresses_and_user_workshop_m2m.py
│   │       ├── 007_fix_admin_is_active.py
│   │       └── 008_update_order_statuses_and_workshop.py
│   ├── alembic.ini                        📜 Конфиг Alembic
│   ├── seed_test_data.py                  🌱 Начальные данные
│   └── .env.example                       📝 Пример DATABASE_URL
├── docker-compose.yml                     🐳 Запуск PostgreSQL
└── README.md                              📖 Главная документация
```

---

## 🔌 Подключение к БД

### **1. Конфигурация (`backend/app/config.py`)**

```python
import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://postgres:secret@localhost:5432/autoservice"
    # ... другие настройки
```

### **2. Движок SQLAlchemy (`backend/app/database.py`)**

```python
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

settings = get_settings()

# Engine — пул соединений
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,  # Проверка соединения
    echo=False,  # Логирование SQL
)

# SessionLocal — фабрика сессий
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base — базовый класс для ORM моделей
Base = declarative_base()

def get_db():
    """Dependency для FastAPI — возвращает сессию БД"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

---

## 🔄 Миграции Alembic

### **Список миграций:**

| № | Файл | Что создаёт |
|---|------|-------------|
| 001 | `001_initial_schema.py` | roles, users, services, orders, order_services, payments |
| 002 | `002_seed_roles_admin.py` | 3 роли + админ (admin@autoservice.ru) |
| 003 | `003_workshops_and_links.py` | workshops + users.workshop_id |
| 004 | `004_seed_workshops_and_base_users.py` | 7 мастерских + пользователи |
| 005 | `005_workers_and_order_worker.py` | workers + orders.worker_id |
| 006 | `006_workshop_addresses_and_user_workshop_m2m.py` | Адреса + M2M связь |
| 007 | `007_fix_admin_is_active.py` | is_active=true для админа |
| 008 | `008_update_order_statuses_and_workshop.py` | Статусы заявок |

### **Применение миграций:**

```bash
# Автоматически при запуске Docker
docker-compose up --build

# Вручную
cd backend
alembic upgrade head
```

---

## 🌱 Seed скрипт (начальные данные)

**Файл:** `backend/seed_test_data.py`

Создаёт при первом запуске:
- ✅ 7 мастерских (по городам)
- ✅ 15 услуг
- ✅ 11 техников
- ✅ 7 мастеров смены
- ✅ 12 клиентов
- ✅ ~100 заявок (для демонстрации)

### **Запуск:**
```bash
docker exec auto-workshop-system-main-backend-1 python seed_test_data.py
```

---

## 🔍 Ключевые особенности

### **1. M2M связь (пользователи ↔ мастерские)**

```python
# backend/app/models/workshop.py
user_workshop_link = Table(
    "user_workshop_link",
    Base.metadata,
    Column("user_id", ForeignKey("users.id")),
    Column("workshop_id", ForeignKey("workshops.id")),
    Column("role_in_workshop", String)
)

# Пример запроса
db.execute(
    text("SELECT workshop_id FROM user_workshop_link WHERE user_id = :uid"),
    {"uid": user.id}
)
```

### **2. Статусы заявок**

```python
# backend/app/models/order.py
status = Column(String(30), nullable=False, default="new")
# Варианты: new, in_progress, done
```

### **3. Привязка техников к мастерским**

```python
# backend/app/routers/workers.py
@router.get("/workshop/{workshop_id}")
def list_workers_by_workshop(workshop_id: int, ...):
    """Возвращает техников ТОЛЬКО из этой мастерской"""
    workers = db.query(Worker).filter(
        Worker.workshop_id == workshop_id
    ).all()
    return workers
```

---

## 🐳 Docker и БД

### **docker-compose.yml**

```yaml
db:
  image: postgres:15
  environment:
    POSTGRES_DB: autoservice
    POSTGRES_USER: postgres
    POSTGRES_PASSWORD: secret
  volumes:
    - postgres_data:/var/lib/postgresql/data
  ports:
    - "5432:5432"
```

### **backend/Dockerfile**

```dockerfile
# Инициализация БД при первом запуске
CMD ["sh", "-c", "\
python -c \"from sqlalchemy import create_engine, text; \
from app.config import get_settings; \
settings = get_settings(); \
engine = create_engine(settings.DATABASE_URL); \
with engine.connect() as conn: \
    result = conn.execute(text('SELECT COUNT(*) FROM users')).scalar(); \
    print('DB has users' if result > 0 else 'DB is empty'); \
    exit(0 if result > 0 else 1)\" 2>/dev/null || \
(alembic upgrade head && python seed_test_data.py); \
python -m app.main"]
```

---

## 📊 Схема базы данных

```
┌─────────────────────────────────────────────────────────┐
│                    БАЗА ДАННЫХ                          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  roles                    ┌── user_workshop_link ──┐   │
│  ├── id (PK)              │  ├── user_id (FK)      │   │
│  └── name                 │  └── workshop_id (FK)  │   │
│                           └──────────────────────────┘   │
│  users                          │                         │
│  ├── id (PK)                    │                         │
│  ├── first_name                 │                         │
│  ├── last_name                  │                         │
│  ├── email                      │                         │
│  ├── password_hash              │                         │
│  ├── role_id (FK → roles)       │                         │
│  ├── is_active                  │                         │
│  └── phone                      │                         │
│                                 │                         │
│  workshops                      │                         │
│  ├── id (PK) ───────────────────┘                         │
│  ├── name                                                 │
│  ├── city                                                 │
│  ├── address                                              │
│  └── phone                                                │
│                                                         │
│  services                                               │
│  ├── id (PK)                                            │
│  ├── name                                               │
│  └── price                                              │
│                                                         │
│  orders                                                 │
│  ├── id (PK)                                            │
│  ├── client_id (FK → users)                             │
│  ├── master_id (FK → users)                             │
│  ├── workshop_id (FK → workshops)                       │
│  ├── worker_id (FK → workers)                           │
│  ├── car_brand                                          │
│  ├── car_model                                          │
│  ├── car_year                                           │
│  ├── description                                        │
│  └── status (new/in_progress/done)                      │
│                                                         │
│  order_services                                         │
│  ├── order_id (FK → orders)                             │
│  └── service_id (FK → services)                         │
│                                                         │
│  workers                                                │
│  ├── id (PK)                                            │
│  ├── first_name                                         │
│  ├── last_name                                          │
│  ├── position                                           │
│  └── workshop_id (FK → workshops)                       │
│                                                         │
│  payments                                               │
│  ├── id (PK)                                            │
│  ├── order_id (FK → orders)                             │
│  ├── amount                                             │
│  └── status                                             │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🔗 Ссылки

- [Главная README.md](README.md) — общая документация
- [GitHub репозиторий](https://github.com/VANUSKA228/auto-workshop-system) — исходный код
