FROM python:3.11-slim

WORKDIR /app

# Установка зависимостей
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Копирование кода
COPY . .

# Применяем миграции и создаём данные если БД пуста
CMD ["sh", "-c", "\
python -c \"from sqlalchemy import create_engine, text; from app.config import get_settings; settings = get_settings(); engine = create_engine(settings.DATABASE_URL); \
with engine.connect() as conn: result = conn.execute(text('SELECT COUNT(*) FROM users')).scalar(); print('DB has users' if result > 0 else 'DB is empty'); exit(0 if result > 0 else 1)\" 2>/dev/null || \
(alembic upgrade head && python seed_test_data.py); \
python -m app.main"]
