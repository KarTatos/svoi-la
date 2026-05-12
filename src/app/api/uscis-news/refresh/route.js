import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";

// USCIS RSS feeds — alerts + policy updates
const RSS_URLS = [
  "https://www.uscis.gov/news/rss-feed/23269", // News Alerts
  "https://www.uscis.gov/news/rss-feed/23268", // Policy & Regulations
];
const MAX_ITEMS = 15;

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || ""
  );
}

function getAnthropic() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || "" });
}

function parseRSS(xml) {
  const items = [];
  const itemBlocks = xml.match(/<item>([\s\S]*?)<\/item>/gi) || [];
  for (const block of itemBlocks.slice(0, MAX_ITEMS)) {
    const get = (tag) => {
      const m = block.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`, "i"))
        || block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
      return m ? m[1].trim() : "";
    };
    const title   = get("title");
    const link    = get("link");
    const guid    = get("guid") || link;
    const pubDate = get("pubDate");
    const desc    = get("description").replace(/<[^>]+>/g, "").trim();
    if (!title || !link) continue;
    items.push({
      guid,
      title_en:     title,
      summary_en:   desc.slice(0, 400),
      url:          link,
      published_at: pubDate ? new Date(pubDate).toISOString() : null,
    });
  }
  return items;
}

async function fetchAllFeeds() {
  const allItems = [];
  const seenGuids = new Set();

  for (const url of RSS_URLS) {
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0 LA-Guide-Bot/1.0" },
        next: { revalidate: 0 },
      });
      if (!res.ok) continue;
      const xml = await res.text();
      const items = parseRSS(xml);
      for (const item of items) {
        if (!seenGuids.has(item.guid)) {
          seenGuids.add(item.guid);
          allItems.push(item);
        }
      }
    } catch {
      // skip failed feed
    }
  }

  return allItems;
}

// Tags used in the prompt and UI
// "SKIP" means irrelevant — will be filtered out
const TAG_LABELS = {
  "Форма":    "📄 Форма",
  "Политика": "📋 Политика",
  "Сборы":    "💰 Сборы",
  "Сроки":    "⏱ Сроки",
  "Визы":     "🛂 Визы",
  "SKIP":     "SKIP",
};

async function processItems(items) {
  if (!items.length) return [];

  const payload = items.map((it, i) =>
    `${i + 1}. TITLE: ${it.title_en}\nSUMMARY: ${it.summary_en || "(no description)"}`
  ).join("\n\n");

  const msg = await getAnthropic().messages.create({
    model:      "claude-haiku-4-5-20251001",
    max_tokens: 3000,
    messages: [{
      role: "user",
      content: `Ты помощник для мигрантов в США. Тебе нужно обработать новости с сайта USCIS.

ЗАДАЧА:
1. Для каждой новости реши — РЕЛЕВАНТНА ли она для мигрантов (изменения форм, требований, виз, сборов, сроков обработки, политики USCIS).
2. НЕРЕЛЕВАНТНЫЕ новости (церемонии натурализации, награды сотрудникам, общие PR-объявления, новости про бюджет агентства) — пометь тегом "SKIP".
3. Для РЕЛЕВАНТНЫХ новостей: переведи на русский и присвой тег:
   - "Форма" — изменения в формах, требованиях к документам
   - "Политика" — изменения в правилах, политике, законах
   - "Сборы" — изменения в стоимости, сборах
   - "Сроки" — изменения в сроках обработки
   - "Визы" — визы, статусы, гринкарта, гражданство

Верни ТОЛЬКО JSON-массив без пояснений:
[{"title_ru":"...","summary_ru":"...","tag":"Форма|Политика|Сборы|Сроки|Визы|SKIP"}]

summary_ru — краткое и чёткое, не более 100 слов.

НОВОСТИ:
${payload}`,
    }],
  });

  try {
    const raw  = msg.content[0].text.trim();
    const json = raw.startsWith("[") ? raw : raw.slice(raw.indexOf("["), raw.lastIndexOf("]") + 1);
    const results = JSON.parse(json);
    return items
      .map((it, i) => ({
        ...it,
        title_ru:   results[i]?.title_ru   || it.title_en,
        summary_ru: results[i]?.summary_ru || it.summary_en,
        tag:        results[i]?.tag        || "Общее",
      }))
      .filter((it) => it.tag !== "SKIP");
  } catch {
    return items.map((it) => ({
      ...it,
      title_ru:   it.title_en,
      summary_ru: it.summary_en,
      tag:        "Общее",
    }));
  }
}

async function runRefresh() {
  const supabase = getSupabase();

  try {
    const items = await fetchAllFeeds();
    if (!items.length) return Response.json({ ok: true, inserted: 0, message: "No items in feeds" });

    const guids = items.map((i) => i.guid);
    const { data: existing } = await supabase
      .from("uscis_news")
      .select("guid")
      .in("guid", guids);
    const existingGuids = new Set((existing || []).map((r) => r.guid));
    const newItems = items.filter((i) => !existingGuids.has(i.guid));

    if (!newItems.length) {
      return Response.json({ ok: true, inserted: 0, message: "All items already stored" });
    }

    const processed = await processItems(newItems);
    if (!processed.length) {
      return Response.json({ ok: true, inserted: 0, message: "All new items were irrelevant" });
    }

    const { error: upsertErr } = await supabase
      .from("uscis_news")
      .upsert(processed, { onConflict: "guid" });
    if (upsertErr) throw upsertErr;

    await supabase.rpc("trim_uscis_news");

    return Response.json({ ok: true, inserted: processed.length });
  } catch (err) {
    console.error("[uscis-news/refresh] error:", err);
    return Response.json({ error: String(err.message) }, { status: 500 });
  }
}

export async function GET(req) {
  const auth = req.headers.get("authorization") || "";
  const cronSecret = process.env.CRON_SECRET || "";
  if (cronSecret && auth !== `Bearer ${cronSecret}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  return runRefresh();
}

export async function POST(req) {
  const secret = req.headers.get("x-refresh-secret") || "";
  if (secret !== (process.env.USCIS_REFRESH_SECRET || "")) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  return runRefresh();
}
