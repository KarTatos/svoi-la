import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";
import { logError, logInfo, requestMeta } from "@/lib/logger";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || "" });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || "", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "");

const RICH_PREFIX = "__LA_RICH_V1__";
const CHAT_RATE_LIMIT = 10;
const CHAT_RATE_WINDOW_MS = 60_000;
const CHAT_RL_PREFIX = "chat:rl:";
const memoryRateBuckets = new Map();

const DISTRICT_ALIASES = {
  weho: ["weho", "west hollywood", "вест голливуд", "уэст голливуд"],
  hollywood: ["hollywood", "голливуд", "голивуд"],
  glendale: ["glendale", "глендейл"],
  dtla: ["dtla", "downtown la", "downtown", "даунтаун", "центр ла"],
  valley: ["valley", "studio city", "north hollywood", "долина", "студио сити", "норт холливуд", "норт голливуд"],
  silverlake: ["silver lake", "los feliz", "сильвер лейк", "лос фелиз"],
  westside: ["westside", "santa monica", "venice", "санта моника", "венис"],
  southbay: ["south bay", "manhattan beach", "hermosa beach", "redondo beach", "long beach", "саут бей", "манхэттен бич", "хермоса бич", "редондо бич", "лонг бич"],
  pasadena: ["pasadena", "пасадена"],
  midcity: ["mid-city", "midcity", "melrose", "мид сити", "мелроуз"],
};

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[ё]/g, "е")
    .replace(/\s+/g, " ")
    .trim();
}

function decodeRichText(raw) {
  if (typeof raw !== "string" || !raw.startsWith(RICH_PREFIX)) return { text: raw || "", photos: [], website: "" };
  try {
    const parsed = JSON.parse(raw.slice(RICH_PREFIX.length));
    return {
      text: parsed?.text || "",
      photos: Array.isArray(parsed?.photos) ? parsed.photos : [],
      website: parsed?.website || "",
    };
  } catch {
    return { text: raw || "", photos: [], website: "" };
  }
}

function classifyQuery(query) {
  const q = normalizeText(query);
  const uscisKeywords = [
    "uscis", "форма", "виза", "грин", "карта", "гражданство", "натурализац", "asylum",
    "убежищ", "ead", "i-", "n-", "ds-", "tps", "петици", "статус", "кейс", "receipt",
    "иммигра", "депортац", "пошлин", "ssn", "документ",
  ];
  const localKeywords = [
    "ресторан", "бар", "кафе", "кофе", "хайк", "поесть", "погулять", "куда", "мест",
    "район", "событи", "мероприяти", "совет", "жиль", "аренд", "работ", "вакан",
    "услуг", "уборк", "ремонт", "нян", "сантех", "электрик", "программист", "бухгалтер",
    "job", "vacancy", "service", "nanny", "cleaner", "plumber",
  ];
  const uScore = uscisKeywords.filter((k) => q.includes(k)).length;
  const lScore = localKeywords.filter((k) => q.includes(k)).length;
  if (uScore > lScore) return "uscis";
  if (lScore > uScore) return "local";
  return "general";
}

function detectDistrictFromQuery(query) {
  const q = normalizeText(query);
  for (const [districtId, aliases] of Object.entries(DISTRICT_ALIASES)) {
    if (aliases.some((alias) => q.includes(alias))) return districtId;
  }
  return null;
}

function scoreByQuery(item, query) {
  const q = normalizeText(query);
  if (!q) return 0;
  const hay = normalizeText(
    `${item.name || ""} ${item.title || ""} ${item.category || item.cat || ""} ${item.district || ""} ${item.address || ""} ${item.tip || ""} ${item.text || ""} ${item.desc || ""} ${item.location || ""}`,
  );
  if (!hay) return 0;
  const words = q.split(" ").filter((w) => w.length >= 2);
  let score = 0;
  for (const w of words) {
    if (hay.includes(w)) score += 1;
    if ((item.name || item.title || "").toLowerCase().includes(w)) score += 2;
    if ((item.district || "").toLowerCase().includes(w)) score += 2;
  }
  return score;
}

function formatPlaceLine(place) {
  return `- ${place.name} (${place.district || "unknown district"}, ${place.cat || place.category || "category"}) — ${place.tip || "без описания"} | Адрес: ${place.address || "не указан"} | link: app://place/${place.id}`;
}

function formatJobLine(item) {
  const price = item.price ? `$${item.price}` : "цена не указана";
  const contact = item.telegram ? `tg: @${String(item.telegram).replace(/^@/, "")}` : (item.phone ? `тел: ${item.phone}` : "контакт не указан");
  const type = item.type === "vacancy" ? "Вакансия" : "Услуга";
  return `- [${type}] ${item.title || "Без названия"} (${item.district || "LA"}) — ${price} | ${String(item.description || "").slice(0, 120)} | Контакт: ${contact} | link: app://job/${item.id}`;
}

function formatHousingLine(item) {
  const price = Number(item.minPrice || 0) > 0 ? `$${Number(item.minPrice).toLocaleString("en-US")}+` : "цена не указана";
  const area = item.district || "LA";
  const type = item.type || "жильё";
  const contact = item.telegram ? `tg: @${String(item.telegram).replace(/^@/, "")}` : (item.messageContact ? `sms: ${item.messageContact}` : "контакт не указан");
  return `- ${item.title || item.address || "Жильё"} (${type}, ${area}) — ${price} | Адрес: ${item.address || "не указан"} | Контакт: ${contact} | link: app://housing/${item.id}`;
}

const CATEGORY_ALIASES = {
  restaurants: ["ресторан", "поесть", "еда", "restaurant", "food"],
  bars: ["бар", "bar", "drink", "выпить"],
  coffee: ["кофе", "кофейня", "coffee", "cafe", "кафе"],
  hiking: ["хайк", "hiking", "trail", "природа", "погулять"],
  interesting: ["интересн", "interesting", "достопримечательн", "посмотреть"],
  music: ["музык", "concert", "концерт", "music"],
};

function detectCategoriesFromQuery(query) {
  const q = normalizeText(query);
  return Object.entries(CATEGORY_ALIASES)
    .filter(([, aliases]) => aliases.some((a) => q.includes(a)))
    .map(([id]) => id);
}

function getClientIp(request) {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) return String(xff.split(",")[0] || "").trim();
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return String(realIp).trim();
  const cfIp = request.headers.get("cf-connecting-ip");
  if (cfIp) return String(cfIp).trim();
  return "unknown";
}

async function runUpstashPipeline(commands) {
  const baseUrl = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL || "";
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN || "";
  if (!baseUrl || !token) return null;

  const res = await fetch(`${baseUrl}/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(commands),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`upstash_pipeline_http_${res.status}`);
  return res.json();
}

function parsePipelineResult(rows, index, fallback = 0) {
  const row = rows?.[index];
  if (!row) return fallback;
  const value = row?.result;
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

async function checkRateLimitUpstash(key) {
  const pipeline = await runUpstashPipeline([
    ["INCR", key],
    ["PEXPIRE", key, CHAT_RATE_WINDOW_MS, "NX"],
    ["PTTL", key],
  ]);
  if (!Array.isArray(pipeline)) throw new Error("upstash_bad_pipeline");
  const count = parsePipelineResult(pipeline, 0, 0);
  const ttlMs = parsePipelineResult(pipeline, 2, CHAT_RATE_WINDOW_MS);
  return {
    allowed: count <= CHAT_RATE_LIMIT,
    count,
    remaining: Math.max(0, CHAT_RATE_LIMIT - count),
    resetMs: Math.max(0, ttlMs),
    backend: "upstash",
  };
}

function checkRateLimitMemory(key) {
  const now = Date.now();
  const bucket = memoryRateBuckets.get(key);
  if (!bucket || now >= bucket.resetAt) {
    memoryRateBuckets.set(key, { count: 1, resetAt: now + CHAT_RATE_WINDOW_MS });
    return {
      allowed: true,
      count: 1,
      remaining: CHAT_RATE_LIMIT - 1,
      resetMs: CHAT_RATE_WINDOW_MS,
      backend: "memory",
    };
  }

  bucket.count += 1;
  return {
    allowed: bucket.count <= CHAT_RATE_LIMIT,
    count: bucket.count,
    remaining: Math.max(0, CHAT_RATE_LIMIT - bucket.count),
    resetMs: Math.max(0, bucket.resetAt - now),
    backend: "memory",
  };
}

async function checkChatRateLimit(request) {
  const ip = getClientIp(request);
  const key = `${CHAT_RL_PREFIX}${ip}`;
  try {
    const upstash = await checkRateLimitUpstash(key);
    return { ...upstash, ip };
  } catch {
    const fallback = checkRateLimitMemory(key);
    return { ...fallback, ip };
  }
}

async function fetchSupabaseDataFallback(query) {
  try {
    const q = normalizeText(query);
    const words = q.split(" ").filter((w) => w.length >= 3).slice(0, 4);
    const districtId = detectDistrictFromQuery(query);
    const categoryIds = detectCategoriesFromQuery(query);

    const placeCond = words.length
      ? words.map((w) => `name.ilike.%${w}%,tip.ilike.%${w}%,address.ilike.%${w}%,district.ilike.%${w}%,category.ilike.%${w}%`).join(",")
      : null;
    const tipCond = words.length
      ? words.map((w) => `title.ilike.%${w}%,text.ilike.%${w}%,category.ilike.%${w}%`).join(",")
      : null;
    const eventCond = words.length
      ? words.map((w) => `title.ilike.%${w}%,description.ilike.%${w}%,location.ilike.%${w}%,category.ilike.%${w}%`).join(",")
      : null;
    const housingCond = words.length
      ? words.map((w) => `title.ilike.%${w}%,address.ilike.%${w}%,district.ilike.%${w}%,type.ilike.%${w}%`).join(",")
      : null;
    const jobCond = words.length
      ? words.map((w) => `title.ilike.%${w}%,description.ilike.%${w}%,district.ilike.%${w}%,type.ilike.%${w}%`).join(",")
      : null;

    // Base text-search query
    const textPlacesQuery = placeCond
      ? supabase.from("places").select("*").or(placeCond).limit(30)
      : Promise.resolve({ data: [] });

    // District-specific query (English district id, bypasses translation issue)
    const districtPlacesQuery = districtId
      ? supabase.from("places").select("*").eq("district", districtId).limit(30)
      : Promise.resolve({ data: [] });

    // Category-specific query
    const categoryPlacesQuery = categoryIds.length
      ? supabase.from("places").select("*").in("category", categoryIds).limit(30)
      : Promise.resolve({ data: [] });

    const [
      { data: textPlaces },
      { data: districtPlaces },
      { data: categoryPlaces },
      { data: tipsFiltered },
      { data: tipsBase },
      { data: eventsFiltered },
      { data: eventsBase },
      { data: housingFiltered },
      { data: housingBase },
      { data: jobs },
    ] = await Promise.all([
      textPlacesQuery,
      districtPlacesQuery,
      categoryPlacesQuery,
      // Tips: keyword filter + always fallback baseline
      tipCond ? supabase.from("tips").select("*").or(tipCond).limit(20) : Promise.resolve({ data: [] }),
      supabase.from("tips").select("*").order("created_at", { ascending: false }).limit(15),
      // Events: keyword filter + always upcoming events
      eventCond ? supabase.from("events").select("*").or(eventCond).limit(20) : Promise.resolve({ data: [] }),
      supabase.from("events").select("*").order("date", { ascending: true }).limit(10),
      // Housing: keyword filter + always latest
      housingCond ? supabase.from("housing").select("*").or(housingCond).limit(20) : Promise.resolve({ data: [] }),
      supabase.from("housing").select("*").order("created_at", { ascending: false }).limit(10),
      // Jobs: always fetch latest — no keyword filter needed
      supabase.from("jobs").select("*").order("created_at", { ascending: false }).limit(20),
    ]);

    // Merge + deduplicate by id helper
    const mergeDedup = (...arrays) => {
      const seen = new Set();
      const result = [];
      for (const arr of arrays) {
        for (const item of arr || []) {
          if (!seen.has(item.id)) { seen.add(item.id); result.push(item); }
        }
      }
      return result;
    };

    const places = mergeDedup(textPlaces, districtPlaces, categoryPlaces);
    const tips = mergeDedup(tipsFiltered, tipsBase);
    const events = mergeDedup(eventsFiltered, eventsBase);
    const housing = mergeDedup(housingFiltered, housingBase);

    return {
      places: (places || []).map((p) => ({
        id: p.id,
        name: p.name || "",
        district: p.district || "",
        cat: p.category || "",
        address: p.address || "",
        tip: p.tip || "",
        likes: Number(p.likes_count || 0),
      })),
      tips: (tips || []).map((t) => {
        const rich = decodeRichText(t.text);
        return {
          id: t.id,
          title: t.title || "",
          category: t.category || "",
          text: rich.text || "",
        };
      }),
      events: (events || []).map((e) => {
        const rich = decodeRichText(e.description);
        return {
          id: e.id,
          title: e.title || "",
          category: e.category || "",
          location: e.location || "",
          date: e.date || "",
          desc: rich.text || "",
        };
      }),
      housing: (housing || []).map((h) => {
        const tags = Array.isArray(h.tags) ? h.tags : [];
        const tgTag = tags.find((t) => String(t).startsWith("contact_tg:")) || "";
        const msgTag = tags.find((t) => String(t).startsWith("contact_msg:")) || "";
        return {
          id: h.id,
          title: h.title || "",
          district: h.district || "",
          type: h.type || "",
          address: h.address || "",
          minPrice: Number(h.min_price || 0),
          telegram: String(tgTag).replace("contact_tg:", ""),
          messageContact: String(msgTag).replace("contact_msg:", ""),
        };
      }),
      jobs: (jobs || []).map((j) => ({
        id: j.id,
        title: j.title || "",
        type: j.type || "vacancy",
        district: j.district || "",
        description: j.description || "",
        price: j.price || "",
        schedule: j.schedule || "",
        telegram: j.telegram || "",
        phone: j.phone || "",
      })),
    };
  } catch (error) {
    logError("chat.fallback_query.error", error, { query: String(query || "").slice(0, 120) });
    return { places: [], tips: [], events: [], housing: [], jobs: [] };
  }
}

function buildLocalContext(message, data) {
  const districtId = detectDistrictFromQuery(message);

  let places = data.places.slice();
  if (districtId) places = places.filter((p) => normalizeText(p.district) === districtId);

  const scoredPlaces = places
    .map((p) => ({ ...p, _score: scoreByQuery(p, message) }))
    .sort((a, b) => b._score - a._score || b.likes - a.likes)
    .slice(0, 12);

  const fallbackPlaces = data.places
    .map((p) => ({ ...p, _score: scoreByQuery(p, message) }))
    .sort((a, b) => b._score - a._score || b.likes - a.likes)
    .slice(0, 12);

  const bestPlaces = scoredPlaces.length ? scoredPlaces : fallbackPlaces;

  const tips = data.tips
    .map((t) => ({ ...t, _score: scoreByQuery(t, message) }))
    .sort((a, b) => b._score - a._score)
    .slice(0, 6);

  const events = data.events
    .map((e) => ({ ...e, _score: scoreByQuery(e, message) }))
    .sort((a, b) => b._score - a._score)
    .slice(0, 6);

  const housing = data.housing
    .map((h) => ({ ...h, _score: scoreByQuery(h, message) }))
    .sort((a, b) => b._score - a._score)
    .slice(0, 8);

  const jobs = (data.jobs || [])
    .map((j) => ({ ...j, _score: scoreByQuery(j, message) }))
    .sort((a, b) => b._score - a._score)
    .slice(0, 10);

  const parts = [];
  if (bestPlaces.length) {
    parts.push(`Места (${bestPlaces.length}):\n${bestPlaces.map(formatPlaceLine).join("\n")}`);
  }
  if (tips.length) {
    parts.push(`Советы:\n${tips.map((t) => `- ${t.title} (${t.category}): ${String(t.text || "").slice(0, 180)} | link: app://tip/${t.id}`).join("\n")}`);
  }
  if (events.length) {
    parts.push(`События:\n${events.map((e) => `- ${e.title} (${e.category}) ${e.date ? `— ${e.date}` : ""} ${e.location ? `в ${e.location}` : ""}: ${String(e.desc || "").slice(0, 160)} | link: app://event/${e.id}`).join("\n")}`);
  }
  if (housing.length) {
    parts.push(`Жильё:\n${housing.map(formatHousingLine).join("\n")}`);
  }
  if (jobs.length) {
    parts.push(`Работа / Услуги:\n${jobs.map(formatJobLine).join("\n")}`);
  }

  return {
    hasData: parts.length > 0,
    context: parts.join("\n\n"),
    districtId,
  };
}

export async function POST(request) {
  const meta = requestMeta(request);
  try {
    const rl = await checkChatRateLimit(request);
    if (!rl.allowed) {
      logInfo("chat.rate_limit.hit", { ...meta, ip: rl.ip, backend: rl.backend, count: rl.count });
      return Response.json(
        { error: "Слишком много запросов. Попробуйте через минуту." },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil(rl.resetMs / 1000)),
            "X-RateLimit-Limit": String(CHAT_RATE_LIMIT),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(Math.ceil((Date.now() + rl.resetMs) / 1000)),
          },
        },
      );
    }

    const { message, history = [] } = await request.json();
    if (!message || typeof message !== "string") {
      logInfo("chat.bad_request", meta);
      return Response.json({ error: "Пустое сообщение" }, { status: 400 });
    }

    const queryType = classifyQuery(message);

    // Always fetch from Supabase server-side. We do not trust any client-supplied data.
    const data = await fetchSupabaseDataFallback(message);
    const localContext = buildLocalContext(message, data);
    const localDataBlock = localContext.hasData
      ? `\n\nДАННЫЕ ПРИЛОЖЕНИЯ (используй только их для рекомендаций):\n${localContext.context}`
      : "\n\nДАННЫЕ ПРИЛОЖЕНИЯ: подходящих записей не найдено.";

    const systemPrompt = `Ты — AI-помощник приложения "Мы в LA" для мигрантов в Лос-Анджелесе.

Правила:
1. Никогда не используй слово "русскоязычные" или его формы.
2. Отвечай только по темам: USCIS/иммиграция, места в LA, события, советы, жильё, работа/услуги.
3. Если вопрос про места/события/советы/работу/жильё — отвечай СТРОГО на основе данных приложения ниже. Перечисли ВСЕ подходящие записи.
4. Если данных недостаточно, честно скажи об этом.
5. Отвечай на русском языке. Понимай запросы на русском — "голивуд" = Hollywood, "рестораны" = restaurants, "бары" = bars, "работа" = jobs, "вакансии" = vacancies и т.д.
6. Для USCIS добавляй дисклеймер: "Это информационная помощь, не юридическая консультация. Проверяйте актуальные правила на uscis.gov".
7. ФОРМАТ ОТВЕТА — строго соблюдай:
   - Вступительное предложение (без эмодзи, без звёздочек, без заголовков с #).
   - Каждый пункт списка начинай с "- " (дефис и пробел).
   - В конце каждого пункта добавляй " | link: app://тип/id" — например " | link: app://event/abc123".
   - Дату пиши в самом тексте пункта (например: "19 сентября 2026").
   - Никаких **жирных**, _курсивов_, #заголовков.
8. Типы ссылок: места → app://place/id, советы → app://tip/id, события → app://event/id, жильё → app://housing/id, работа/услуги → app://job/id.
9. Если найдено несколько записей — перечисли все, не ограничивайся одной.${localDataBlock}`;

    const messages = [
      ...history
        .slice(-10)
        .filter((m) => m.role === "user" || m.role === "assistant")
        .map((m) => ({ role: m.role, content: m.text })),
      { role: "user", content: message },
    ];

    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system: systemPrompt,
      messages,
    });

    const text = response.content
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();

    return Response.json({ text: text || "Не удалось получить ответ.", queryType, localDataUsed: localContext.hasData });
  } catch (error) {
    logError("chat.unhandled", error, meta);
    const status = Number(error && typeof error === "object" ? error["status"] : 0);
    if (status === 401) return Response.json({ error: "Ошибка API ключа." }, { status: 500 });
    if (status === 429) return Response.json({ error: "Слишком много запросов. Подождите." }, { status: 429 });
    return Response.json({ error: "Ошибка сервера." }, { status: 500 });
  }
}
