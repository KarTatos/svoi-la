// Supabase Edge Function — USCIS News Refresh
// Runs daily via pg_cron. Fetches USCIS RSS, translates with Claude, saves to Supabase.
// Deploy: supabase functions deploy refresh-uscis-news

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Anthropic from "https://esm.sh/@anthropic-ai/sdk@0.27";

const RSS_URLS = [
  "https://www.uscis.gov/news/rss-feed/23269", // News Alerts
  "https://www.uscis.gov/news/rss-feed/23268", // Policy & Regulations
];
const MAX_ITEMS = 15;

// ─── Supabase & Anthropic clients ────────────────────────────────────────────

function getSupabase() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
}

function getAnthropic() {
  return new Anthropic({ apiKey: Deno.env.get("ANTHROPIC_API_KEY")! });
}

// ─── RSS Parsing ──────────────────────────────────────────────────────────────

function parseRSS(xml: string) {
  const items: any[] = [];
  const itemBlocks = xml.match(/<item>([\s\S]*?)<\/item>/gi) || [];

  for (const block of itemBlocks.slice(0, MAX_ITEMS)) {
    const get = (tag: string) => {
      const m =
        block.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`, "i")) ||
        block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
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
  const allItems: any[] = [];
  const seenGuids = new Set<string>();

  for (const url of RSS_URLS) {
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0 LA-Guide-Bot/1.0" },
      });
      if (!res.ok) continue;
      const xml = await res.text();
      for (const item of parseRSS(xml)) {
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

// ─── Claude translation + tagging ────────────────────────────────────────────

async function processItems(items: any[]) {
  if (!items.length) return [];

  const payload = items
    .map((it, i) => `${i + 1}. TITLE: ${it.title_en}\nSUMMARY: ${it.summary_en || "(no description)"}`)
    .join("\n\n");

  const msg = await getAnthropic().messages.create({
    model:      "claude-haiku-4-5-20251001",
    max_tokens: 3000,
    messages: [{
      role: "user",
      content: `Ты фильтр новостей для мигрантов в США (русскоязычная аудитория).

ПРОПУСКАЙ (тег "SKIP") — всё что не меняет правила для мигранта:
- аресты, уголовные дела, мошенничество, депортации конкретных людей
- лишение гражданства за преступления
- расследования и правоприменительные действия (enforcement)
- церемонии натурализации, статистика, годовые отчёты
- награды и кадровые изменения в USCIS
- PR-объявления, партнёрства, общие заявления политиков
- новости где обычному мигранту НЕ НУЖНО ничего менять или делать

ПУБЛИКУЙ только если правило, требование или процесс ИЗМЕНИЛСЯ:
✅ изменились требования к форме или списку документов
✅ изменилась стоимость подачи (filing fee)
✅ изменились сроки рассмотрения заявлений
✅ новые или изменённые правила для визы, статуса, гринкарты, гражданства
✅ изменения для TPS, DACA, asylum, беженцев, EAD, рабочих виз
✅ дедлайны которые мигрант должен соблюсти

Для ПУБЛИКУЕМЫХ новостей присвой тег:
- "Форма" — изменения в формах I-xxx, требованиях к документам
- "Сборы" — изменения в стоимости, сборах, fee waiver
- "Сроки" — изменения в сроках обработки
- "Визы" — визы H1B, L1, O1, F1, туристические и рабочие
- "Статус" — гринкарта, гражданство, TPS, DACA, asylum, беженцы, EAD

Верни ТОЛЬКО JSON-массив без пояснений:
[{"title_ru":"...","summary_ru":"...","tag":"Форма|Сборы|Сроки|Визы|Статус|SKIP"}]

title_ru — точный перевод заголовка.
summary_ru — что конкретно изменилось и что нужно сделать мигранту. Не более 80 слов. Без воды.

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
        // если Claude не вернул результат для этого элемента — пропускаем
        tag:        results[i]?.tag ?? "SKIP",
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

// ─── Main refresh logic ───────────────────────────────────────────────────────

async function runRefresh() {
  const supabase = getSupabase();

  const items = await fetchAllFeeds();
  if (!items.length) {
    return { ok: true, inserted: 0, message: "No items in feeds" };
  }

  const guids = items.map((i) => i.guid);
  const { data: existing } = await supabase
    .from("uscis_news")
    .select("guid")
    .in("guid", guids);
  const existingGuids = new Set((existing || []).map((r: any) => r.guid));
  const newItems = items.filter((i) => !existingGuids.has(i.guid));

  if (!newItems.length) {
    return { ok: true, inserted: 0, message: "All items already stored" };
  }

  const processed = await processItems(newItems);
  if (!processed.length) {
    return { ok: true, inserted: 0, message: "All new items were irrelevant" };
  }

  const { error } = await supabase
    .from("uscis_news")
    .upsert(processed, { onConflict: "guid" });
  if (error) throw error;

  await supabase.rpc("trim_uscis_news");

  return { ok: true, inserted: processed.length };
}

// ─── HTTP Handler ─────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  // Allow calls from pg_cron (internal) and manual POST with secret
  if (req.method === "POST") {
    const secret = req.headers.get("x-refresh-secret") || "";
    const expected = Deno.env.get("USCIS_REFRESH_SECRET") || "";
    if (expected && secret !== expected) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }
  }

  try {
    const result = await runRefresh();
    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("[refresh-uscis-news]", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
