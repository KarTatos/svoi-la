import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";
import { logError, logInfo, requestMeta } from "@/lib/logger";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const RICH_PREFIX = "__LA_RICH_V1__";

const DISTRICT_ALIASES = {
  weho: ["weho", "west hollywood", "РІРµСЃС‚ РіРѕР»Р»РёРІСѓРґ", "СѓСЌСЃС‚ РіРѕР»Р»РёРІСѓРґ"],
  hollywood: ["hollywood", "РіРѕР»Р»РёРІСѓРґ", "РіРѕР»РёРІСѓРґ"],
  glendale: ["glendale", "РіР»РµРЅРґРµР№Р»"],
  dtla: ["dtla", "downtown la", "downtown", "РґР°СѓРЅС‚Р°СѓРЅ", "С†РµРЅС‚СЂ Р»Р°"],
  valley: ["valley", "studio city", "north hollywood", "РґРѕР»РёРЅР°", "СЃС‚СѓРґРёРѕ СЃРёС‚Рё", "РЅРѕСЂС‚ С…РѕР»Р»РёРІСѓРґ"],
  silverlake: ["silver lake", "los feliz", "СЃРёР»СЊРІРµСЂ Р»РµР№Рє", "Р»РѕСЃ С„РµР»РёР·"],
  westside: ["westside", "santa monica", "venice", "СЃР°РЅС‚Р° РјРѕРЅРёРєР°", "РІРµРЅРёСЃ"],
  southbay: ["south bay", "manhattan beach", "hermosa beach", "redondo beach", "long beach", "СЃР°СѓС‚С… Р±РµР№", "РјР°РЅС…СЌС‚С‚РµРЅ Р±РёС‡", "С…РµСЂРјРѕСЃР° Р±РёС‡", "СЂРµРґРѕРЅРґРѕ Р±РёС‡", "Р»РѕРЅРі Р±РёС‡"],
  pasadena: ["pasadena", "РїР°СЃР°РґРµРЅР°"],
  midcity: ["mid-city", "midcity", "melrose", "РјРёРґ СЃРёС‚Рё", "РјРµР»СЂРѕСѓР·"],
};

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[С‘]/g, "Рµ")
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
    "uscis", "С„РѕСЂРјР°", "РІРёР·Р°", "РіСЂРёРЅ", "РєР°СЂС‚Р°", "РіСЂР°Р¶РґР°РЅСЃС‚РІРѕ", "РЅР°С‚СѓСЂР°Р»РёР·Р°С†", "asylum",
    "СѓР±РµР¶РёС‰", "ead", "i-", "n-", "ds-", "tps", "РїРµС‚РёС†Рё", "СЃС‚Р°С‚СѓСЃ", "РєРµР№СЃ", "receipt",
    "РёРјРјРёРіСЂР°", "РґРµРїРѕСЂС‚Р°С†", "РїРѕС€Р»РёРЅ", "ssn", "РґРѕРєСѓРјРµРЅС‚",
  ];
  const localKeywords = [
    "СЂРµСЃС‚РѕСЂР°РЅ", "Р±Р°СЂ", "РєР°С„Рµ", "РєРѕС„Рµ", "С…Р°Р№Рє", "РїРѕРµСЃС‚СЊ", "РїРѕРіСѓР»СЏС‚СЊ", "РєСѓРґР°", "РјРµСЃС‚",
    "СЂР°Р№РѕРЅ", "СЃРѕР±С‹С‚Рё", "РјРµСЂРѕРїСЂРёСЏС‚", "СЃРѕРІРµС‚", "Р¶РёР»СЊ", "Р°СЂРµРЅРґ", "СЂР°Р±РѕС‚", "РІР°РєР°РЅ",
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
  return `- ${place.name} (${place.district || "unknown district"}, ${place.cat || place.category || "category"}) вЂ” ${place.tip || "Р±РµР· РѕРїРёСЃР°РЅРёСЏ"} | РђРґСЂРµСЃ: ${place.address || "РЅРµ СѓРєР°Р·Р°РЅ"} | link: app://place/${place.id}`;
}

function formatHousingLine(item) {
  const price = Number(item.minPrice || 0) > 0 ? `$${Number(item.minPrice).toLocaleString("en-US")}+` : "С†РµРЅР° РЅРµ СѓРєР°Р·Р°РЅР°";
  const area = item.district || "LA";
  const type = item.type || "Р¶РёР»СЊС‘";
  const contact = item.telegram ? `tg: @${String(item.telegram).replace(/^@/, "")}` : (item.messageContact ? `sms: ${item.messageContact}` : "РєРѕРЅС‚Р°РєС‚ РЅРµ СѓРєР°Р·Р°РЅ");
  return `- ${item.title || item.address || "Р–РёР»СЊС‘"} (${type}, ${area}) вЂ” ${price} | РђРґСЂРµСЃ: ${item.address || "РЅРµ СѓРєР°Р·Р°РЅ"} | РљРѕРЅС‚Р°РєС‚: ${contact} | link: app://housing/${item.id}`;
}

function sanitizeClientData(appData) {
  if (!appData || typeof appData !== "object") return { places: [], tips: [], events: [], housing: [] };
  const places = Array.isArray(appData.places) ? appData.places : [];
  const tips = Array.isArray(appData.tips) ? appData.tips : [];
  const events = Array.isArray(appData.events) ? appData.events : [];
  const housing = Array.isArray(appData.housing) ? appData.housing : [];

  return {
    places: places
      .slice(0, 250)
      .map((p) => ({
        id: p.id,
        name: p.name || "",
        district: p.district || "",
        cat: p.cat || p.category || "",
        address: p.address || "",
        tip: p.tip || "",
        likes: Number(p.likes || 0),
      }))
      .filter((p) => p.name),
    tips: tips
      .slice(0, 120)
      .map((t) => ({
        id: t.id,
        title: t.title || "",
        category: t.cat || t.category || "",
        text: t.text || "",
      }))
      .filter((t) => t.title),
    events: events
      .slice(0, 120)
      .map((e) => ({
        id: e.id,
        title: e.title || "",
        category: e.cat || e.category || "",
        location: e.location || "",
        date: e.date || "",
        desc: e.desc || e.description || "",
      }))
      .filter((e) => e.title),
    housing: housing
      .slice(0, 120)
      .map((h) => ({
        id: h.id,
        title: h.title || "",
        district: h.district || "",
        type: h.type || "",
        address: h.address || "",
        minPrice: Number(h.minPrice || h.min_price || 0),
        telegram: h.telegram || "",
        messageContact: h.messageContact || h.message_contact || "",
      }))
      .filter((h) => h.title || h.address),
  };
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
    parts.push(`РњРµСЃС‚Р° (${bestPlaces.length}):\n${bestPlaces.map(formatPlaceLine).join("\n")}`);
  }
  if (tips.length) {
    parts.push(`РЎРѕРІРµС‚С‹:\n${tips.map((t) => `- ${t.title} (${t.category}): ${String(t.text || "").slice(0, 180)} | link: app://tip/${t.id}`).join("\n")}`);
  }
  if (events.length) {
    parts.push(`РЎРѕР±С‹С‚РёСЏ:\n${events.map((e) => `- ${e.title} (${e.category}) ${e.date ? `вЂ” ${e.date}` : ""} ${e.location ? `РІ ${e.location}` : ""}: ${String(e.desc || "").slice(0, 160)} | link: app://event/${e.id}`).join("\n")}`);
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
    const { message, history = [], appData = null } = await request.json();
    if (!message || typeof message !== "string") {
      logInfo("chat.bad_request", meta);
      return Response.json({ error: "РџСѓСЃС‚РѕРµ СЃРѕРѕР±С‰РµРЅРёРµ" }, { status: 400 });
    }

    const queryType = classifyQuery(message);

    const clientData = sanitizeClientData(appData);
    const hasClientData = clientData.places.length || clientData.tips.length || clientData.events.length || clientData.housing.length;
    const fallbackData = hasClientData ? { places: [], tips: [], events: [], housing: [] } : await fetchSupabaseDataFallback(message);
    const mergedData = {
      places: [...clientData.places, ...fallbackData.places],
      tips: [...clientData.tips, ...fallbackData.tips],
      events: [...clientData.events, ...fallbackData.events],
      housing: [...clientData.housing, ...fallbackData.housing],
    };

    const localContext = buildLocalContext(message, mergedData);
    const localDataBlock = localContext.hasData
      ? `\n\nР”РђРќРќР«Р• РџР РР›РћР–Р•РќРРЇ (РёСЃРїРѕР»СЊР·СѓР№ С‚РѕР»СЊРєРѕ РёС… РґР»СЏ СЂРµРєРѕРјРµРЅРґР°С†РёР№):\n${localContext.context}`
      : "\n\nР”РђРќРќР«Р• РџР РР›РћР–Р•РќРРЇ: РїРѕРґС…РѕРґСЏС‰РёС… Р·Р°РїРёСЃРµР№ РЅРµ РЅР°Р№РґРµРЅРѕ.";

    const systemPrompt = `РўС‹ вЂ” AI-РїРѕРјРѕС‰РЅРёРє РїСЂРёР»РѕР¶РµРЅРёСЏ "РњС‹ РІ LA".

РџСЂР°РІРёР»Р°:
1. РќРёРєРѕРіРґР° РЅРµ РёСЃРїРѕР»СЊР·СѓР№ СЃР»РѕРІРѕ "СЂСѓСЃСЃРєРѕСЏР·С‹С‡РЅС‹Рµ" РёР»Рё РµРіРѕ С„РѕСЂРјС‹.
2. РћС‚РІРµС‡Р°Р№ С‚РѕР»СЊРєРѕ РїРѕ С‚РµРјР°Рј: USCIS/РёРјРјРёРіСЂР°С†РёСЏ, РјРµСЃС‚Р° РІ LA, СЃРѕР±С‹С‚РёСЏ, СЃРѕРІРµС‚С‹, Р¶РёР»СЊРµ, СЂР°Р±РѕС‚Р°.
3. Р•СЃР»Рё РІРѕРїСЂРѕСЃ РїСЂРѕ РјРµСЃС‚Р°/СЃРѕР±С‹С‚РёСЏ/СЃРѕРІРµС‚С‹, РѕС‚РІРµС‡Р°Р№ СЃС‚СЂРѕРіРѕ РЅР° РѕСЃРЅРѕРІРµ РґР°РЅРЅС‹С… РїСЂРёР»РѕР¶РµРЅРёСЏ РЅРёР¶Рµ.
4. Р•СЃР»Рё РґР°РЅРЅС‹С… РЅРµРґРѕСЃС‚Р°С‚РѕС‡РЅРѕ, С‡РµСЃС‚РЅРѕ СЃРєР°Р¶Рё РѕР± СЌС‚РѕРј Рё РїСЂРµРґР»РѕР¶Рё РґРѕР±Р°РІРёС‚СЊ Р·Р°РїРёСЃСЊ РІ СЃРѕРѕС‚РІРµС‚СЃС‚РІСѓСЋС‰РёР№ СЂР°Р·РґРµР».
5. РћС‚РІРµС‡Р°Р№ РєСЂР°С‚РєРѕ, РїРѕ РґРµР»Сѓ, РЅР° СЂСѓСЃСЃРєРѕРј.
6. Р”Р»СЏ USCIS РґРѕР±Р°РІР»СЏР№ РґРёСЃРєР»РµР№РјРµСЂ: "Р­С‚Рѕ РёРЅС„РѕСЂРјР°С†РёРѕРЅРЅР°СЏ РїРѕРјРѕС‰СЊ, РЅРµ СЋСЂРёРґРёС‡РµСЃРєР°СЏ РєРѕРЅСЃСѓР»СЊС‚Р°С†РёСЏ. РџСЂРѕРІРµСЂСЏР№С‚Рµ Р°РєС‚СѓР°Р»СЊРЅС‹Рµ РїСЂР°РІРёР»Р° РЅР° uscis.gov".
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

    return Response.json({ text: text || "РќРµ СѓРґР°Р»РѕСЃСЊ РїРѕР»СѓС‡РёС‚СЊ РѕС‚РІРµС‚.", queryType, localDataUsed: localContext.hasData });
  } catch (error) {
    logError("chat.unhandled", error, meta);
    if (error?.status === 401) return Response.json({ error: "РћС€РёР±РєР° API РєР»СЋС‡Р°." }, { status: 500 });
    if (error?.status === 429) return Response.json({ error: "РЎР»РёС€РєРѕРј РјРЅРѕРіРѕ Р·Р°РїСЂРѕСЃРѕРІ. РџРѕРґРѕР¶РґРёС‚Рµ." }, { status: 429 });
    return Response.json({ error: "РћС€РёР±РєР° СЃРµСЂРІРµСЂР°." }, { status: 500 });
  }
}
