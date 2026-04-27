# Refactor handoff — svoi-la

Этот файл описывает текущее состояние рефакторинга `SvoiApp.jsx` и что осталось сделать.
Если ты — следующий ассистент, который читает это: начни с раздела **Контекст**, потом
**Что осталось**, потом **Подводные камни**.

---

## Контекст

**Проект:** Next.js 14 (App Router) + Supabase + Anthropic + Sentry. PWA для русскоязычных
иммигрантов в Лос-Анджелесе. Деплой — Vercel.

**Главная боль:** `src/components/SvoiApp.jsx` был God-component на 3215 строк, 71 useState,
34 useEffect, 298 inline-стилей. Идёт поэтапный рефакторинг по плану из 9 шагов.

**Текущая ветка:** `refactor/svoiapp`. Прод (`main`) уже получил Шаги 1 и 2 через PR.

---

## Что сделано

| Шаг | Что | Статус | Файлы |
|---|---|---|---|
| 0 | Ветка, пакеты (`@tanstack/react-query`, `zustand`), `react-hooks/exhaustive-deps: error` | ✅ слито в main | `.eslintrc.json`, `package.json` |
| 1 | Хук `useSvoiRouter` — собрал 5 редирект-эффектов и `scr` state | ✅ слито в main | `src/hooks/useSvoiRouter.js` |
| 2 | Вынос `lib/maps.js` (Google Maps loader, geocode, autocomplete, кэш) и `lib/views.js` (трекинг просмотров) | ✅ слито в main | `src/lib/maps.js`, `src/lib/views.js` |
| 3 | Хук `useAppData` — забрал loadAllData, realtime-подписку, 5 useState (places/tips/events/housing/liked) | ✅ в ветке | `src/hooks/useAppData.js`, `src/lib/text.js` |
| Lint | `next/font/google` для Roboto, отключено правило `@next/next/no-img-element` | ✅ в ветке | `src/app/layout.js`, `.eslintrc.json` |
| Backlog Б | Sentry config, миграция 006 с INSERT админа, /api/chat без appData | ✅ в ветке | `next.config.js`, `sql/migrations/006_admin_email_access.sql`, `src/app/api/chat/route.js`, `src/components/SvoiApp.jsx` |

**Цифры:**
- `SvoiApp.jsx`: было **3215** строк → сейчас **~2790** (−425, −13%)
- `useState`: было **71** → **63** (−8)
- `useEffect`: было **34** → **27** (−7)

---

## Что нужно сделать ВРУЧНУЮ (sandbox не может)

1. **Удалить легаси SQL-файлы:**
   ```powershell
   cd R:\WORK4\LAHELP\4
   Remove-Item supabase-schema.sql, sql\add_views_counters.sql, sql\fix_likes_polymorphic.sql, sql\housing_schema.sql
   ```
   Это устаревшие версии того, что уже в `sql/migrations/`.

2. **Прогнать миграцию `006_admin_email_access.sql` в Supabase SQL Editor.**
   Файл идемпотентен. Без этого админка не работает на свежей БД.

3. **Запушить незакоммиченные изменения** (если ещё не):
   ```powershell
   git status      # посмотреть что не закоммичено
   git add ...     # стейджить нужные файлы
   git commit -m "..."
   git push origin refactor/svoiapp
   ```

---

## Что осталось — план рефакторинга (Шаги 4–9)

### Шаг 4 — React Query (опционально)

Заменить `useAppData` на `@tanstack/react-query`. Дает кэш, дедупликацию, фоновое
обновление, оптимистичные апдейты. **Частично перекрывается с Шагом 3** — можно пропустить.

**Время:** ~2 часа.

### Шаг 5 — Zustand для UI-state ⭐ (рекомендуется следующим)

Вытащить ~25 `useState` из `SvoiApp.jsx` в `src/store/uiStore.js`.

**Кандидаты:**
- `liked`, `favorites`, `likedTips`
- `tipsSearchInput/Applied`, `housingBedsFilter`, `placeSortField/Dir`
- `photoViewer/photoZoom`
- `mapP/showMapModal/mapPlaces/selectedMapPlace/mapLoading/mapError/routeInfo/routeLoading`
- `miniMapLoading/miniMapError/miniMapPlaces/miniSelectedPlaceId/miniRouteInfo/miniRouteLoading`
- `chat/inp/typing`
- `userCoords`

После: каждый экран сам подписывается через `useUiStore(s => s.liked)` вместо проброса
через 30 пропсов.

**Время:** 1.5–2 часа.

**Важно:** Zustand уже установлен (`zustand@^5.0.12`). Шаг 5 разблокирует Шаг 8.

### Шаг 6 — inline стили в константы

В `SvoiApp.jsx` 298 объектов `style={{ … }}`. Создать `src/components/svoi/styles.js` с
~30 каноническими константами (`cardStyle`, `chipStyle`, `btnPrimary`, `btnGhost`, …).

**Время:** ~2 часа.

### Шаг 7 — добить ESLint warnings

После Шагов 5 и 8 большинство `react-hooks/exhaustive-deps` warnings уйдут естественным
образом. Что останется — добивается в массивы зависимостей или через `useCallback`.

**Время:** ~1 час.

### Шаг 8 — вынести экраны в отдельные компоненты

В `SvoiApp.jsx` остался гигантский `return` с блоками `{scr === "..." && (<div>…</div>)}`
для всех 16 экранов. Часть уже вынесена в `src/components/svoi/screens/*.jsx`. Остаются:
`places-cat`, `place-item`, `district`, `tips`, `events`, `housing`, `housing-item`, `jobs`.

**Зависимость:** делается ПОСЛЕ Шага 5 (Zustand), иначе пропсов слишком много.

**Время:** 2–3 дня.

После Шага 8 `SvoiApp.jsx` должен стать ~150-строчным диспетчером:
```jsx
{scr === 'home' && <HomeScreen />}
{scr === 'places' && <PlacesScreen />}
{scr === 'place-item' && <PlaceItemScreen />}
…
```

### Шаг 9 — переезд на App Router (опционально)

Заменить `scr`-роутер на нативный Next.js роутер. Получаешь URL'ы вида
`/places/hollywood/restaurants` и share-ссылки на конкретное место.

**Время:** ~1 день. **Не блокер** — приложение и без этого нормальное.

---

## Backlog (вне основного плана)

### App Store-блокеры (если планируется выкладка)

1. **Sign in with Apple** — обязателен по гайдлайну 4.8, раз есть Sign in with Google.
   Без этого 100% rejection. Настраивается в Supabase Auth + Apple Developer.

2. **Capacitor wrapper** — обернуть Next.js в нативный iOS-проект. Установить
   `@capacitor/core`, `@capacitor/ios`, прогнать `npx cap init`/`add ios`/`build`.

3. **Privacy Manifest** — Apple с 2024 требует декларацию данных. У нас Sentry, Supabase
   Auth, Google Maps — все три попадают в декларацию.

### Качество кода / UX

1. **Заменить `alert()` и `confirm()` на тосты.** ~14 вызовов в `SvoiApp.jsx`. Apple
   ревьюер может прицепиться.

2. **Rate-limit на `/api/chat`.** Сейчас никакой защиты — кто-нибудь может за час
   спалить весь Anthropic-биллинг. Решение: `@upstash/ratelimit` + Upstash Redis,
   10 req/min на IP.

3. **next/image для 14 `<img>`.** Сейчас правило отключено через `.eslintrc.json` как
   временная мера. Нужно настроить `images.remotePatterns` в `next.config.js` для
   домена Supabase Storage и blob: URL'ов, потом заменять `<img>` на `<Image>` с
   правильными размерами.

4. **Доступность.** В `SvoiApp.jsx` 0 (ноль) `aria-label`, все клики на `<div onClick>`
   вместо `<button>`. Скринридер не работает.

5. **`.gitattributes`** — добавить `* text=auto eol=lf` для нормализации CRLF/LF
   (часть файлов в репо с BOM и CRLF).

### Безопасность

1. **Ротация ключей в `.env.local`.** Активные ключи Supabase service_role, Anthropic,
   Google Maps — могли утечь в логах ассистентов. Нужно ротировать в Supabase Dashboard,
   Anthropic Console, Google Cloud Console. Для Maps key обязательно поставить HTTP
   referrer restriction на свой Vercel-домен.

2. **`/api/views` POST** — доверяет `viewerKey` от клиента. Можно накручивать счётчик
   просмотров в цикле. Лечить: хешировать viewerKey на сервере как `sha256(ip + UA + secret)`.

3. **Sentry meta scrubbing.** `logError` пихает в Sentry всё, что пришло как `meta`,
   включая телефоны/телеграмы из housing. Нужен whitelist полей.

---

## Важные подводные камни

### Sandbox-окружение ассистента

- **Sandbox не может удалять файлы** (read-only mount). Все `rm` падают с
  `Operation not permitted`. Удалять — пользователь руками через PowerShell или GitHub Desktop.

- **Sandbox не может делать git-операции.** `.git/index.lock` создание запрещено. Все
  команды `git add/commit/push` пользователь делает сам через PowerShell или GitHub Desktop.

- **Sandbox видит stale-копию некоторых файлов.** Если что-то выглядит странно (typescript
  package.json кажется обрезанным и т.д.) — это глюк mount'а, не проблема файла. Use Read
  tool через Windows-путь `R:\WORK4\LAHELP\4\...`, а не bash через `/sessions/.../mnt/4`.

- **`mcp__workspace__bash` командами Read/Write/Edit могут расходиться** в редких случаях.
  Если bash-grep не находит то, что Read показывает — верь Read.

### ESLint правила

- `react-hooks/exhaustive-deps: "error"` — нельзя пропустить, build упадёт. **Vercel build
  падает на errors, на warnings — нет.** Все exhaustive-deps теперь errors.

- **Сеттеры из кастомных хуков** (`useSessionState`, `useAppData`) ESLint считает
  потенциально нестабильными и требует в deps. Для useState внутри кастомного хука это
  **на самом деле стабильно** — добавить в deps безопасно, лупа не будет.

- Правило `@next/next/no-img-element` отключено в `.eslintrc.json`. Это временно — пока
  не сделана миграция на `next/image`.

### useAppData

- Хук возвращает **и сеттеры тоже** (`setPlaces`, `setTips`, …) — это leaky abstraction.
  Сделано так потому, что в `SvoiApp.jsx` куча мест, которые делают оптимистичные апдейты
  массивов после CRUD. На Шаге 5 (Zustand) или 4 (React Query) это исправится.

- `reload` в хуке обёрнут в `useCallback(..., [])` — внутри только импорты и стабильные
  setters. ESLint не должен жаловаться.

- Realtime подписка debounced (260ms) и реагирует на 6 таблиц одной шиной.

### `/api/chat`

- **Больше не принимает `appData` от клиента.** Всегда читает из Supabase сам.
  Соответственно в `SvoiApp.jsx:handleSend` тело fetch стало просто
  `{ message, history }`.

- **Нет rate-limit'а.** Это backlog-пункт.

### admin_users

- Миграция `006_admin_email_access.sql` создаёт таблицу + INSERT'ит `kushnir4work@gmail.com`
  + politика «только админы видят список». На свежей БД нужно прогнать руками в SQL Editor.

- Функция `is_admin_user()` смотрит на `auth.jwt() ->> 'email'`. В SQL Editor (без JWT)
  она возвращает `false` — это нормально, не баг. Тестировать в реальном приложении.

---

## Структура репозитория

```
src/
├── app/
│   ├── layout.js              # next/font/google для Roboto
│   ├── page.js                # рендерит SvoiApp
│   ├── globals.css
│   ├── error.js               # Sentry error boundary
│   ├── global-error.js
│   ├── admin/page.js          # AdminPlaces (RLS-защищённая)
│   ├── privacy/page.js        # обязательная страница
│   ├── terms/page.js          # обязательная страница
│   └── api/
│       ├── chat/route.js      # AI-чат с Claude (без appData)
│       └── views/route.js     # трекинг просмотров
├── components/
│   ├── SvoiApp.jsx            # ⚠️ главный God-component, ~2790 строк
│   ├── AdminPlaces.jsx        # админка
│   └── svoi/
│       ├── config.jsx         # константы (DISTRICTS, PLACE_CATS, …)
│       ├── useCivicsTest.js
│       ├── layout/
│       │   ├── AppHeader.jsx
│       │   └── WeatherCard.jsx
│       ├── screens/
│       │   ├── HomeScreen.jsx
│       │   ├── ChatScreen.jsx
│       │   ├── ProfileScreen.jsx
│       │   ├── MyPlacesScreen.jsx
│       │   ├── SupportScreen.jsx
│       │   ├── PlacesDistrictsScreen.jsx
│       │   ├── DistrictCategoriesScreen.jsx
│       │   ├── UscisScreen.jsx
│       │   ├── UscisCategoryScreen.jsx
│       │   └── CivicsTestScreen.jsx
│       ├── forms/
│       │   ├── PlaceFormModal.jsx
│       │   ├── TipFormModal.jsx
│       │   └── EventCreateModal.jsx
│       └── modals/
│           ├── PhotoViewerModal.jsx
│           ├── PlacesMapModal.jsx
│           └── UscisPdfModal.jsx
├── hooks/
│   ├── useAuth.js             # Google OAuth через Supabase
│   ├── useSessionState.js     # state с persistence в sessionStorage
│   ├── useSvoiRouter.js       # ⭐ Шаг 1
│   ├── useAppData.js          # ⭐ Шаг 3 (loadAllData + realtime)
│   ├── useProfileWeather.js
│   ├── usePlaceForm.js
│   ├── useTipForm.js
│   └── useSupportRequests.js
└── lib/
    ├── supabase.js            # Supabase client + CRUD функции
    ├── supabase-typed.ts      # ⚠️ не используется, можно удалить
    ├── database.types.ts      # сгенерированные типы (тоже не используется в JS)
    ├── logger.js              # JSON-логи + Sentry
    ├── maps.js                # ⭐ Шаг 2 (Google Maps + geocode)
    ├── views.js               # ⭐ Шаг 2 (трекинг просмотров)
    └── text.js                # ⭐ Шаг 3 (normalizeAddressText)

sql/migrations/                # ⭐ единственный источник истины
├── 001_housing_schema.sql
├── 002_likes_polymorphic.sql
├── 003_views_counters.sql
├── 004_indexes.sql
├── 005_places_lat_lng.sql
├── 006_admin_email_access.sql # ⭐ обновлено: INSERT админа + select policy
├── 007_support_requests.sql
└── 008_admin_allowlist_backfill.sql # ⚠️ дубликат 006, можно удалить
```

---

## Workflow для следующих коммитов

1. Прежде всего — **прогнать smoke-test** локально (`npm run dev`).
   - Логин через Google
   - Открыть карточку места → счётчик views инкрементится
   - Кнопка «На карте» → открывается Google Maps
   - Чат → задать вопрос → должен прийти ответ
   - Форма «Добавить место» → автокомплит работает

2. **Маленькие коммиты, по одной теме каждый.** Не пихай несколько шагов в один коммит —
   если что-то сломается, откатить будет сложнее.

3. **Между шагами — мерж в `main`** через PR на GitHub. Это даёт save-point на проде и
   возможность отката.

4. **Vercel делает preview-деплой** для каждого пуша в `refactor/svoiapp`. Перед мержем
   проверь preview-URL на телефоне.

5. **Если build упал** на Vercel из-за `react-hooks/exhaustive-deps` — добавь в массив
   зависимостей или оберни в `useCallback`. **Не отключай правило**.

---

## Полезные команды

```powershell
cd R:\WORK4\LAHELP\4

# Локальная разработка
npm run dev          # http://localhost:3000

# Проверки перед коммитом
npm run lint         # ESLint
npm run typecheck    # TypeScript (проверяет .js/.jsx через allowJs)
npm run build        # полная сборка как на Vercel

# Git
git status
git add <files>
git commit -m "..."
git push origin refactor/svoiapp
```

---

## Что я бы сделал на твоём месте

**Если приоритет — App Store за месяц:**
1. Закрыть alert/confirm → toast (1 день)
2. Rate-limit на /api/chat (1 час)
3. next/image migration (1 день)
4. Capacitor + Sign in with Apple + Privacy Manifest (3–5 дней)
5. Подача в App Store, ревью 3–7 дней

**Если приоритет — поддержка кода:**
1. Шаг 5 (Zustand) — следующий по плану
2. Шаг 8 (выносим экраны) — после Zustand
3. Шаг 6 (inline стили) — параллельно с 5/8
4. Шаг 9 (App Router) — финальный штрих

**Не рекомендую:** мешать рефакторинг с App Store-подготовкой в одной ветке. Делай
отдельные ветки `refactor/...` и `release/...`, мерджи независимо.
