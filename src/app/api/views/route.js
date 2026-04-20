import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const TABLE_BY_TYPE = {
  place: "places",
  tip: "tips",
  event: "events",
  housing: "housing",
};

function getAdminClient() {
  if (!supabaseUrl || !serviceRoleKey) return null;
  return createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
}

async function incrementViews(admin, table, itemId) {
  const { count, error } = await admin
    .from("card_views")
    .select("id", { count: "exact", head: true })
    .eq("item_type", table)
    .eq("item_id", itemId);

  if (error) return { error: error.message, status: 500 };
  return { views: Number(count || 0) };
}

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const itemType = String(url.searchParams.get("itemType") || "").trim();
    const itemIdsParam = String(url.searchParams.get("itemIds") || "").trim();
    const table = TABLE_BY_TYPE[itemType];

    if (!table || !itemIdsParam) {
      return Response.json({ error: "Invalid query." }, { status: 400 });
    }

    const itemIds = itemIdsParam
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean)
      .slice(0, 200);

    if (!itemIds.length) {
      return Response.json({ ok: true, counts: {} });
    }

    const admin = getAdminClient();
    if (!admin) {
      return Response.json({ error: "Supabase service role is not configured." }, { status: 500 });
    }

    const { data, error } = await admin
      .from("card_views")
      .select("item_id")
      .eq("item_type", itemType)
      .in("item_id", itemIds);

    if (error) return Response.json({ error: error.message }, { status: 500 });

    const counts = {};
    itemIds.forEach((id) => { counts[id] = 0; });
    (data || []).forEach((row) => {
      const id = String(row.item_id || "");
      counts[id] = Number(counts[id] || 0) + 1;
    });

    return Response.json({ ok: true, counts });
  } catch (error) {
    return Response.json({ error: error?.message || "Server error." }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const itemType = String(body?.itemType || "").trim();
    const itemId = String(body?.itemId || "").trim();
    const viewerKey = String(body?.viewerKey || "").trim();
    const table = TABLE_BY_TYPE[itemType];

    if (!table || !itemId || !viewerKey) {
      return Response.json({ error: "Invalid payload." }, { status: 400 });
    }

    const admin = getAdminClient();
    if (!admin) {
      return Response.json({ error: "Supabase service role is not configured." }, { status: 500 });
    }

    const { error: insertError } = await admin
      .from("card_views")
      .insert({
        item_type: itemType,
        item_id: itemId,
        viewer_key: viewerKey,
      });

    if (insertError) {
      if (insertError.code === "23505") {
        const existing = await incrementViews(admin, itemType, itemId);
        if (existing?.error) return Response.json({ error: existing.error }, { status: existing.status || 500 });
        return Response.json({ ok: true, counted: false, views: Number(existing.views || 0) });
      }
      return Response.json({ error: insertError.message }, { status: 500 });
    }

    const incremented = await incrementViews(admin, itemType, itemId);
    if (incremented?.error) {
      return Response.json({ error: incremented.error }, { status: incremented.status || 500 });
    }

    return Response.json({ ok: true, counted: true, views: Number(incremented.views || 0) });
  } catch (error) {
    return Response.json({ error: error?.message || "Server error." }, { status: 500 });
  }
}
