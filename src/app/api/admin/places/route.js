import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function hasConfig() {
  return !!(supabaseUrl && supabaseAnonKey && serviceRoleKey);
}

function getAuthClient() {
  return createClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: false } });
}

function getAdminClient() {
  return createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
}

function getAllowedEmails() {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

async function requireAdmin(request) {
  const allowed = getAllowedEmails();
  if (!hasConfig()) {
    return { error: Response.json({ error: "Supabase admin env vars are not configured." }, { status: 500 }) };
  }
  if (!allowed.length) {
    return { error: Response.json({ error: "ADMIN_EMAILS is not configured." }, { status: 500 }) };
  }

  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice("Bearer ".length).trim() : "";
  if (!token) {
    return { error: Response.json({ error: "Missing access token." }, { status: 401 }) };
  }

  const { data, error } = await getAuthClient().auth.getUser(token);
  if (error || !data?.user) {
    return { error: Response.json({ error: "Invalid token." }, { status: 401 }) };
  }

  const email = (data.user.email || "").toLowerCase();
  if (!allowed.includes(email)) {
    return { error: Response.json({ error: "Forbidden." }, { status: 403 }) };
  }

  return { user: data.user };
}

export async function GET(request) {
  const adminCheck = await requireAdmin(request);
  if (adminCheck.error) return adminCheck.error;

  const { data, error } = await getAdminClient().from("places").select("*").order("created_at", { ascending: false });
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ data: data || [] });
}

export async function POST(request) {
  const adminCheck = await requireAdmin(request);
  if (adminCheck.error) return adminCheck.error;

  const body = await request.json();
  const payload = body?.place;
  if (!payload?.name || !payload?.category || !payload?.district || !payload?.tip) {
    return Response.json({ error: "Missing required fields." }, { status: 400 });
  }

  const { data, error } = await getAdminClient().from("places").insert([payload]).select().single();
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ data });
}

export async function PATCH(request) {
  const adminCheck = await requireAdmin(request);
  if (adminCheck.error) return adminCheck.error;

  const body = await request.json();
  const id = body?.id;
  const updates = body?.updates;
  if (!id || !updates || typeof updates !== "object") {
    return Response.json({ error: "Invalid patch payload." }, { status: 400 });
  }

  const { data, error } = await getAdminClient().from("places").update(updates).eq("id", id).select().single();
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ data });
}

export async function DELETE(request) {
  const adminCheck = await requireAdmin(request);
  if (adminCheck.error) return adminCheck.error;

  const body = await request.json();
  const id = body?.id;
  if (!id) return Response.json({ error: "Missing id." }, { status: 400 });

  const client = getAdminClient();
  await client.from("comments").delete().eq("item_id", id).eq("item_type", "place");
  await client.from("likes").delete().eq("item_id", id).eq("item_type", "place");
  const { error } = await client.from("places").delete().eq("id", id);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}
