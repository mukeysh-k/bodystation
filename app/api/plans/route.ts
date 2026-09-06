import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requireAdminApi } from "@/lib/auth";

// GET /api/plans — list all active plans
export async function GET() {
  const guard = await requireAdminApi();
  if (guard instanceof NextResponse) return guard;

  const { data, error } = await supabaseAdmin
    .from("plans")
    .select("*")
    .eq("is_active", true)
    .order("price", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST /api/plans — create a new plan
export async function POST(req: NextRequest) {
  const guard = await requireAdminApi();
  if (guard instanceof NextResponse) return guard;

  const body = await req.json();
  const { name, duration_days, price } = body;

  if (!name || !duration_days || !price) {
    return NextResponse.json(
      { error: "name, duration_days, and price are required." },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from("plans")
    .insert({ name, duration_days: Number(duration_days), price: Number(price) })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

// PATCH /api/plans — toggle is_active or update a plan
export async function PATCH(req: NextRequest) {
  const guard = await requireAdminApi();
  if (guard instanceof NextResponse) return guard;

  const body = await req.json();
  const { id, ...updates } = body;

  const { data, error } = await supabaseAdmin
    .from("plans")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
