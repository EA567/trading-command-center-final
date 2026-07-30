import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Example Route Handler demonstrating the Supabase CRUD pattern.
 * The app does not call this route yet — lib/store/AppStoreContext.tsx
 * currently reads/writes localStorage. To go live with Supabase:
 *
 *   1. Fill in .env.local with your project URL + anon key.
 *   2. Run supabase/schema.sql in the Supabase SQL editor.
 *   3. Add Supabase Auth (e.g. magic link) so auth.uid() is populated.
 *   4. Replace the body of each action in AppStoreContext.tsx with a
 *      fetch('/api/trades', ...) call following the pattern below.
 */

export async function GET() {
  const supabase = createClient();
  const { data, error } = await supabase.from("trades").select("*").order("date", { ascending: false });
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
    .from("trades")
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
  const { data, error } = await supabase.from("trades").update(patch).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function DELETE(req: NextRequest) {
  const supabase = createClient();
  const { id } = await req.json();
  const { error } = await supabase.from("trades").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
