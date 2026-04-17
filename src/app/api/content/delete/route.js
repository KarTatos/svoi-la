import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const ALLOWED_TABLES = new Set(["places", "tips", "events"]);
const ALLOWED_ITEM_TYPES = new Set(["place", "tip", "event"]);

function hasConfig() {
  return !!(supabaseUrl && supabaseAnonKey && serviceRoleKey);
}

function getAuthClient() {
  return createClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: false } });
}

function getAdminClient() {
  return createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
}

async function getUserFromBearerToken(request) {
  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice("Bearer ".length).trim() : "";
  if (!token) return { error: "Missing access token.", status: 401 };

  const { data, error } = await getAuthClient().auth.getUser(token);
  if (error || !data?.user) return { error: "Invalid token.", status: 401 };
  return { user: data.user };
}

export async function DELETE(request) {
  if (!hasConfig()) {
    return Response.json({ error: "Supabase admin env vars are not configured." }, { status: 500 });
  }

  const auth = await getUserFromBearerToken(request);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });

  const body = await request.json().catch(() => null);
  const id = body?.id;
  const table = body?.table;
  const itemType = body?.itemType;

  if (!id || !ALLOWED_TABLES.has(table) || !ALLOWED_ITEM_TYPES.has(itemType)) {
    return Response.json({ error: "Invalid delete payload." }, { status: 400 });
  }

  const admin = getAdminClient();
  const { data: record, error: selectError } = await admin.from(table).select("id,user_id").eq("id", id).maybeSingle();
  if (selectError) return Response.json({ error: selectError.message }, { status: 500 });
  if (!record) return Response.json({ error: "Record not found." }, { status: 404 });
  if (!record.user_id || record.user_id !== auth.user.id) {
    return Response.json({ error: "Delete denied." }, { status: 403 });
  }

  const { error: commentsError } = await admin.from("comments").delete().eq("item_id", id).eq("item_type", itemType);
  if (commentsError) return Response.json({ error: commentsError.message }, { status: 500 });

  const { error: likesError } = await admin.from("likes").delete().eq("item_id", id).eq("item_type", itemType);
  if (likesError) return Response.json({ error: likesError.message }, { status: 500 });

  const { error: deleteError } = await admin.from(table).delete().eq("id", id);
  if (deleteError) return Response.json({ error: deleteError.message }, { status: 500 });

  return Response.json({ ok: true });
}

