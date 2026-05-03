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
      { data: tips },
      { data: events },
      { data: housing },
    ] = await Promise.all([
      textPlacesQuery,
      districtPlacesQuery,
      categoryPlacesQuery,
      tipCond ? supabase.from("tips").select("*").or(tipCond).limit(20) : Promise.resolve({ data: [] }),
      eventCond ? supabase.from("events").select("*").or(eventCond).limit(20) : Promise.resolve({ data: [] }),
      housingCond ? supabase.from("housing").select("*").or(housingCond).limit(20) : Promise.resolve({ data: [] }),
    ]);

    // Merge places, deduplicate by id
    const seenIds = new Set();
    const places = [];
    for (const p of [...(textPlaces || []), ...(districtPlaces || []), ...(categoryPlaces || [])]) {
      if (!seenIds.has(p.id)) { seenIds.add(p.id); places.push(p); }
    }

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
    };
  } catch (error) {
    logError("chat.fallback_query.error", error, { query: String(query || "").slice(0, 120) });
    return { places: [], tips: [], events: [], housing: [] };
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
2. Отвечай только по темам: USCIS/иммиграция, места в LA, события, советы, жильё, работа.
3. Если вопрос про места/события/советы — отвечай СТРОГО на основе данных приложения ниже. Перечисли ВСЕ подходящие записи, не выбирай только одну.
4. Если данных недостаточно, честно скажи об этом и предложи добавить запись в соответствующий раздел.
5. Отвечай на русском языке. Понимай запросы на русском — "голивуд" = Hollywood, "рестораны" = restaurants, "бары" = bars и т.д.
6. Для USCIS добавляй дисклеймер: "Это информационная помощь, не юридическая консультация. Проверяйте актуальные правила на uscis.gov".
7. Пиши кратко и по делу. Без эмодзи. Без markdown-форматирования. Без звёздочек (*).
8. Для каждой записи из данных приложения обязательно добавляй ссылку: app://place/<id>, app://tip/<id>, app://event/<id>, app://housing/<id>.
9. Если найдено несколько мест — перечисли все, не ограничивайся одним.${localDataBlock}`;

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
