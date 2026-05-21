# LLM Project

Небольшой monorepo с двумя приложениями:

- `backend` - NestJS API, Prisma, авторизация и генерация текста.
- `frontend` - React + TypeScript + Vite клиент.

## Структура

```text
llm_project/
  backend/
    src/
    prisma/
    test/
    package.json
  frontend/
    src/
    package.json
  package.json
```

## Команды из корня проекта

```bash
npm run backend:dev
npm run frontend:dev
npm run backend:build
npm run frontend:build
npm run build
```

Backend по умолчанию запускается на `http://localhost:3000`.
Frontend по умолчанию запускается на `http://localhost:5173` и проксирует запросы `/ai` на backend.

Если зависимости нужно поставить заново:

```bash
npm run install:all
```
