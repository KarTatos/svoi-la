import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function getAdminClient() {
  if (!supabaseUrl || !serviceRoleKey) return null;
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function POST(req) {
  try {
    const body = await req.json();
    const itemId = String(body?.item_id || "").trim();
    const text = String(body?.text || "").trim();
    const author = String(body?.author || "Пользователь").trim().slice(0, 80) || "Пользователь";
    const userId = String(body?.user_id || "").trim() || null;
    if (!itemId || !text) {
      return NextResponse.json({ error: "item_id и text обязательны" }, { status: 400 });
    }

    const admin = getAdminClient();
    if (!admin) return NextResponse.json({ error: "Supabase service role не настроен" }, { status: 500 });

    const { data, error } = await admin
      .from("comments")
      .insert([{ item_id: itemId, item_type: "post", author, user_id: userId, text }])
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ error: "Неверный запрос" }, { status: 400 });
  }
}

export async function PATCH(req) {
  try {
    const body = await req.json();
    const commentId = String(body?.id || "").trim();
    const text = String(body?.text || "").trim();
    if (!commentId || !text) {
      return NextResponse.json({ error: "id и text обязательны" }, { status: 400 });
    }

    const admin = getAdminClient();
    if (!admin) return NextResponse.json({ error: "Supabase service role не настроен" }, { status: 500 });

    const { data, error } = await admin
      .from("comments")
      .update({ text })
      .eq("id", commentId)
      .eq("item_type", "post")
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ error: "Неверный запрос" }, { status: 400 });
  }
}

export async function DELETE(req) {
  const id = String(new URL(req.url).searchParams.get("id") || "").trim();
  if (!id) return NextResponse.json({ error: "id обязателен" }, { status: 400 });

  const admin = getAdminClient();
  if (!admin) return NextResponse.json({ error: "Supabase service role не настроен" }, { status: 500 });

  const { error } = await admin.from("comments").delete().eq("id", id).eq("item_type", "post");
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}

