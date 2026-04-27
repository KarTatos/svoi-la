import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";
import { logError, logInfo, requestMeta } from "@/lib/logger";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || "" });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || "", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "");

const RICH_PREFIX = "__LA_RICH_V1__";

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

async function fetchSupabaseDataFallback(query) {
  try {
    const q = normalizeText(query);
    const words = q.split(" ").filter((w) => w.length >= 3).slice(0, 4);
    if (!words.length) return { places: [], tips: [], events: [], housing: [] };

    const placeCond = words.map((w) => `name.ilike.%${w}%,tip.ilike.%${w}%,address.ilike.%${w}%,district.ilike.%${w}%,category.ilike.%${w}%`).join(",");
    const tipCond = words.map((w) => `title.ilike.%${w}%,text.ilike.%${w}%,category.ilike.%${w}%`).join(",");
    const eventCond = words.map((w) => `title.ilike.%${w}%,description.ilike.%${w}%,location.ilike.%${w}%,category.ilike.%${w}%`).join(",");
    const housingCond = words.map((w) => `title.ilike.%${w}%,address.ilike.%${w}%,district.ilike.%${w}%,type.ilike.%${w}%`).join(",");

    const [{ data: places }, { data: tips }, { data: events }, { data: housing }] = await Promise.all([
      supabase.from("places").select("*").or(placeCond).limit(30),
      supabase.from("tips").select("*").or(tipCond).limit(20),
      supabase.from("events").select("*").or(eventCond).limit(20),
      supabase.from("housing").select("*").or(housingCond).limit(20),
    ]);

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

    const systemPrompt = `Ты — AI-помощник приложения "Мы в LA".

Правила:
1. Никогда не используй слово "русскоязычные" или его формы.
2. Отвечай только по темам: USCIS/иммиграция, места в LA, события, советы, жильё, работа.
3. Если вопрос про места/события/советы, отвечай строго на основе данных приложения ниже.
4. Если данных недостаточно, честно скажи об этом и предложи добавить запись в соответствующий раздел.
5. Отвечай кратко, по делу, на русском.
6. Для USCIS добавляй дисклеймер: "Это информационная помощь, не юридическая консультация. Проверяйте актуальные правила на uscis.gov".
7. Use formal Russian style. No emojis.
8. Do not use markdown formatting. Do not use asterisks (*) in replies.
9. For each found record from app data, include a direct card link as plain text:
   app://place/<id>, app://tip/<id>, app://event/<id>, app://housing/<id>.${localDataBlock}`;

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
