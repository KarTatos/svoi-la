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

export async function POST(request) {
  try {
    const body = await request.json();
    const itemType = String(body?.itemType || "").trim();
    const itemId = String(body?.itemId || "").trim();
    const table = TABLE_BY_TYPE[itemType];

    if (!table || !itemId) {
      return Response.json({ error: "Invalid payload." }, { status: 400 });
    }

    const admin = getAdminClient();
    if (!admin) {
      return Response.json({ error: "Supabase service role is not configured." }, { status: 500 });
    }

    const { data: row, error: readError } = await admin
      .from(table)
      .select("id,views")
      .eq("id", itemId)
      .single();

    if (readError || !row?.id) {
      return Response.json({ error: readError?.message || "Item not found." }, { status: 404 });
    }

    const nextViews = Number(row.views || 0) + 1;
    const { data, error } = await admin
      .from(table)
      .update({ views: nextViews })
      .eq("id", itemId)
      .select("views")
      .single();

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ ok: true, views: Number(data?.views ?? nextViews) });
  } catch (error) {
    return Response.json({ error: error?.message || "Server error." }, { status: 500 });
  }
}

