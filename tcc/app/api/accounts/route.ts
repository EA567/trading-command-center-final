import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// See app/api/trades/route.ts for the full explanation of this pattern.

export async function GET() {
  const supabase = createClient();
  const { data, error } = await supabase.from("accounts").select("*").order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const body = await req.json();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { data, error } = await supabase
    .from("accounts")
    .insert({ ...body, user_id: user.id })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function PATCH(req: NextRequest) {
  const supabase = createClient();
  const body = await req.json();
  const { id, ...patch } = body;
  const { data, error } = await supabase.from("accounts").update(patch).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function DELETE(req: NextRequest) {
  const supabase = createClient();
  const { id } = await req.json();
  const { error } = await supabase.from("accounts").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
