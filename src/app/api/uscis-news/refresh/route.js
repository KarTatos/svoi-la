import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";

const RSS_URL = "https://www.uscis.gov/news/rss-feed/23269";
const MAX_ITEMS = 10;

// Lazy-init: clients created on first request, not at module load time
// (avoids build-time crash when env vars aren't available)
function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || ""
  );
}

function getAnthropic() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || "" });
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function parseRSS(xml) {
  const items = [];
  const itemBlocks = xml.match(/<item>([\s\S]*?)<\/item>/gi) || [];
  for (const block of itemBlocks.slice(0, MAX_ITEMS)) {
    const get = (tag) => {
      const m = block.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`, "i"))
        || block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
      return m ? m[1].trim() : "";
    };
    const title    = get("title");
    const link     = get("link");
    const guid     = get("guid") || link;
    const pubDate  = get("pubDate");
    const desc     = get("description").replace(/<[^>]+>/g, "").trim();
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

async function translateItems(items) {
  if (!items.length) return [];

  // Build one prompt for all items to save API calls
  const payload = items.map((it, i) =>
    `${i + 1}. TITLE: ${it.title_en}\nSUMMARY: ${it.summary_en || "(no description)"}`
  ).join("\n\n");

  const msg = await getAnthropic().messages.create({
    model:      "claude-haiku-4-5-20251001",
    max_tokens: 2048,
    messages: [{
      role: "user",
      content: `Переведи на русский язык следующие новости USCIS. Для каждого пункта верни JSON-объект в массиве:
[{"title_ru":"...","summary_ru":"..."}]
Перевод должен быть точным и профессиональным. summary_ru — не более 150 слов.
Верни ТОЛЬКО валидный JSON-массив, без пояснений.

${payload}`,
    }],
  });

  try {
    const raw  = msg.content[0].text.trim();
    const json = raw.startsWith("[") ? raw : raw.slice(raw.indexOf("["), raw.lastIndexOf("]") + 1);
    const translations = JSON.parse(json);
    return items.map((it, i) => ({
      ...it,
      title_ru:   translations[i]?.title_ru   || it.title_en,
      summary_ru: translations[i]?.summary_ru || it.summary_en,
    }));
  } catch {
    // Fallback: return English if parsing fails
    return items.map((it) => ({ ...it, title_ru: it.title_en, summary_ru: it.summary_en }));
  }
}

// ─── Core logic (shared by GET cron + POST manual) ──────────────────────────

async function runRefresh() {
  const supabase = getSupabase();

  try {
    // 1. Fetch RSS
    const rssRes = await fetch(RSS_URL, {
      headers: { "User-Agent": "Mozilla/5.0 LA-Guide-Bot/1.0" },
      next: { revalidate: 0 },
    });
    if (!rssRes.ok) throw new Error(`RSS fetch failed: ${rssRes.status}`);
    const xml = await rssRes.text();

    // 2. Parse
    const items = parseRSS(xml);
    if (!items.length) return Response.json({ ok: true, inserted: 0, message: "No items in feed" });

    // 3. Check which guids are new
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

    // 4. Translate
    const translated = await translateItems(newItems);

    // 5. Upsert into Supabase
    const { error: upsertErr } = await supabase
      .from("uscis_news")
      .upsert(translated, { onConflict: "guid" });
    if (upsertErr) throw upsertErr;

    // 6. Trim to 10 most recent
    await supabase.rpc("trim_uscis_news");

    return Response.json({ ok: true, inserted: translated.length });
  } catch (err) {
    console.error("[uscis-news/refresh] error:", err);
    return Response.json({ error: String(err.message) }, { status: 500 });
  }
}

// ─── Route handlers ──────────────────────────────────────────────────────────

// GET — called by Vercel cron (sends Authorization: Bearer <CRON_SECRET>)
export async function GET(req) {
  const auth = req.headers.get("authorization") || "";
  const cronSecret = process.env.CRON_SECRET || "";
  if (cronSecret && auth !== `Bearer ${cronSecret}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  return runRefresh();
}

// POST — manual trigger (curl -H "x-refresh-secret: ..." POST)
export async function POST(req) {
  const secret = req.headers.get("x-refresh-secret") || "";
  if (secret !== (process.env.USCIS_REFRESH_SECRET || "")) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  return runRefresh();
}
