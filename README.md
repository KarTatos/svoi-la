# 🌴 СВОИ в LA

Приложение-помощник для русскоязычных иммигрантов в Лос-Анджелесе.

## Что внутри

- **USCIS справочник** — формы, документы с пояснениями на русском
- **AI чат** — отвечает по USCIS (с web search) и по базе мест (от пользователей)
- **Места от своих** — районы LA → категории → карточки с секретиками
- **Google вход** — для добавления мест
- **PWA** — устанавливается на телефон как приложение

---

## 🚀 Деплой за 30 минут

### Шаг 1: Supabase (база данных + авторизация)

1. Зайди на [supabase.com](https://supabase.com) → создай бесплатный аккаунт
2. Нажми "New Project" → назови `svoi-la`
3. Запомни **password** (понадобится)
4. Когда проект создан, зайди в **SQL Editor** → вставь содержимое файла `supabase-schema.sql` → нажми Run
5. Зайди в **Settings → API** → скопируй:
   - `Project URL` → это твой `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public key` → это твой `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Шаг 2: Google Auth

1. В Supabase зайди в **Authentication → Providers → Google**
2. Включи Google provider
3. Зайди в [Google Cloud Console](https://console.cloud.google.com):
   - Создай проект
   - APIs & Services → Credentials → Create OAuth Client ID
   - Type: Web Application
   - Authorized redirect URI: `https://YOUR_SUPABASE_PROJECT.supabase.co/auth/v1/callback`
4. Скопируй Client ID и Client Secret → вставь в Supabase Google provider
5. Нажми Save

### Шаг 3: Anthropic API ключ

1. Зайди на [console.anthropic.com](https://console.anthropic.com)
2. Создай аккаунт → зайди в API Keys → Create Key
3. Скопируй ключ — это твой `ANTHROPIC_API_KEY`

### Шаг 4: GitHub

1. Зайди на [github.com](https://github.com) → создай репозиторий `svoi-la`
2. В терминале на своём компьютере:

```bash
cd svoi-la
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/ТВОЙ_USERNAME/svoi-la.git
git push -u origin main
```

### Шаг 5: Vercel (деплой)

1. Зайди на [vercel.com](https://vercel.com) → войди через GitHub
2. Нажми "Import Project" → выбери репозиторий `svoi-la`
3. В **Environment Variables** добавь:
   - `NEXT_PUBLIC_SUPABASE_URL` = твой URL из шага 1
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = твой anon key из шага 1
   - `ANTHROPIC_API_KEY` = твой ключ из шага 3
4. Нажми Deploy
5. Через 1-2 минуты получишь ссылку типа `svoi-la.vercel.app`

### Шаг 6: Установка на телефон

**iPhone:**
1. Открой `svoi-la.vercel.app` в Safari
2. Нажми кнопку "Поделиться" (квадрат со стрелкой)
3. Выбери "На экран «Домой»"
4. Готово — приложение на главном экране!

**Android:**
1. Открой в Chrome
2. Меню (три точки) → "Добавить на главный экран"
3. Готово!

---

## 📁 Структура проекта

```
svoi-la/
├── public/
│   └── manifest.json          # PWA manifest
├── src/
│   ├── app/
│   │   ├── layout.js          # HTML layout, fonts, PWA meta
│   │   ├── page.js            # Main page
│   │   ├── globals.css        # Global styles
│   │   └── api/
│   │       └── chat/
│   │           └── route.js   # AI chat API (Claude + web search + Supabase)
│   ├── components/
│   │   └── SvoiApp.jsx        # Main app component (всё приложение)
│   └── lib/
│       └── supabase.js        # Supabase client + helpers
├── supabase-schema.sql        # Database tables (run in Supabase SQL Editor)
├── next.config.js
├── package.json
├── .env.example               # Template for environment variables
└── README.md
```

## 💰 Стоимость

| Сервис | Бесплатный план | Платный |
|--------|----------------|---------|
| Vercel | 100GB bandwidth | $20/мес |
| Supabase | 500MB DB, 50K auth | $25/мес |
| Anthropic | Pay per use | ~$1-5/день |
| Домен | — | $12/год |
| **Итого на старте** | **~$0-3/мес** | |

## 🔧 Локальная разработка

```bash
npm install
cp .env.example .env.local     # Заполни свои ключи
npm run dev                     # http://localhost:3000
```

## TypeScript + Supabase types

```bash
# one-time install (already in package.json devDependencies)
npm install

# generate typed DB schema from Supabase project
# requires Supabase CLI auth + project id
set SUPABASE_PROJECT_ID=YOUR_PROJECT_ID
npm run supabase:types

# static type check
npm run typecheck
```

Generated file: `src/lib/database.types.ts`  
Typed client: `src/lib/supabase-typed.ts`

## Sentry + structured logs

1. Create Sentry project for Next.js.
2. Set env vars:
   - `NEXT_PUBLIC_SENTRY_DSN`
   - `SENTRY_DSN`
   - `NEXT_PUBLIC_APP_ENV` (for example: `production`)
3. Redeploy app.

Structured logs are emitted as JSON via `src/lib/logger.js` from API routes.

## SQL migrations (ordered)

Use ordered migration files from [`sql/migrations`](./sql/migrations):

1. `001_housing_schema.sql`
2. `002_likes_polymorphic.sql`
3. `003_views_counters.sql`
4. `004_indexes.sql`
5. `005_places_lat_lng.sql`

Quick guide: [sql/migrations/README.md](./sql/migrations/README.md)
