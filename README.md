# Study Agent Bot

## Что тут есть
Пока только поднимается n8n + PG + worker. Также создаются таблицы users, deadlines при старте.

## Requirements

python ^3.10, uv

### Запуск

Если нет uv:
```
>>> make install-uv
```

Старт приложения:
```
>>> cp .env.example .env
>>> make run
```

Стартует на localhost:5678