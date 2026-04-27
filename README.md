# StudyBot

AI-помощник для учёбы: извлекает дедлайны из Telegram-чатов, присылает напоминания, поддерживает голосовой ввод.

## Стек

- **Telegram Bot** — n8n workflows + LLM
- **Backend** — FastAPI (Python)
- **Frontend** — Next.js + Tailwind
- **БД** — PostgreSQL + pgvector
- **Reverse proxy** — Caddy
- **Туннель** — ngrok

## Структура

```
/app              — SQLAlchemy модели и конфиг (shared)
/alembic          — миграции БД
/flows            — n8n workflow JSON
/web
  /backend        — FastAPI API
  /frontend       — Next.js приложение
/scripts          — init-data.sh (pgvector, doc_chunks)
docker-compose.yml
Caddyfile
```

## Таблицы БД

| Таблица | Назначение |
|---|---|
| `users` | Зарегистрированные пользователи (tg_user_id) |
| `deadlines` | Дедлайны, привязанные к пользователю |
| `chat_messages` | История сообщений из чатов |
| `available_chats` | Чаты где есть бот |
| `chat_subscriptions` | Подписки юзеров на чаты (включены через UI) |
| `doc_chunks` | Векторные чанки для RAG |

## Быстрый старт

### Требования

- Docker + Docker Compose
- Python 3.10+ и uv
- ngrok аккаунт со статическим доменом

### 1. Переменные окружения

```bash
cp .env.example .env
```

Заполнить в `.env`:

```env
BOT_TOKEN=           # токен бота от @BotFather
JWT_SECRET=          # openssl rand -hex 32
NEXT_PUBLIC_BOT_NAME= # username бота без @
```

### 2. BotFather

- `/setdomain` → указать ngrok-домен (для Telegram Login Widget)
- `/setprivacy` → Disable (чтобы бот получал все сообщения в группах)

### 3. Запуск

```bash
# Применить миграции
make run

# Поднять веб-сервисы
docker compose up -d

# Запустить ngrok
ngrok http 80 --domain=your-domain.ngrok-free.dev

# Запустить Caddy
caddy run
```

### Caddyfile

```caddy
:80 {
    header ngrok-skip-browser-warning "true"

    handle /webhook/* {
        reverse_proxy localhost:5678
    }
    handle /webhook-test/* {
        reverse_proxy localhost:5678
    }
    handle /api/* {
        uri strip_prefix /api
        reverse_proxy localhost:8000
    }
    handle {
        reverse_proxy localhost:3000
    }
}
```

### Локальная разработка (без Docker)

```bash
# Backend
cd web/backend
uvicorn main:app --reload

# Frontend
cd web/frontend
echo "NEXT_PUBLIC_BOT_NAME=your_bot" > .env.local
npm install
npm run dev
```

## API эндпоинты

| Метод | Путь | Описание |
|---|---|---|
| POST | `/auth/telegram` | Авторизация через Telegram Login Widget |
| GET | `/auth/me` | Текущий пользователь |
| GET | `/deadlines` | Список дедлайнов |
| PATCH | `/deadlines/{id}` | Обновить статус дедлайна |
| DELETE | `/deadlines/{id}` | Удалить дедлайн |
| GET | `/chats/available` | Доступные чаты |
| GET | `/chats/subscriptions` | Подписки пользователя |
| POST | `/chats/subscriptions` | Подписаться на чат |
| DELETE | `/chats/subscriptions/{chat_id}` | Отписаться |
| GET | `/stats` | Статистика по дедлайнам |

## Как появляются данные

1. Бот добавляется в группу → первое сообщение от зарегистрированного юзера → n8n пишет в `available_chats`
2. Юзер логинится на сайте через Telegram → запись в `users`
3. Юзер включает тоггл на `/chats` → запись в `chat_subscriptions`
4. n8n получает сообщение из подписанного чата → LLM извлекает дедлайны → пишет в `deadlines`
5. Дашборд показывает дедлайны с цветовой индикацией срочности
