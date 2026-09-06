import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requireAdminApi } from "@/lib/auth";

// GET /api/members/[id] — member detail + full history
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const guard = await requireAdminApi();
  if (guard instanceof NextResponse) return guard;

  const { id } = params;

  // Fetch member
  const { data: member, error: memberErr } = await supabaseAdmin
    .from("members")
    .select("*")
    .eq("id", id)
    .single();
  if (memberErr || !member)
    return NextResponse.json({ error: "Member not found" }, { status: 404 });

  // Fetch all membership periods with plan name, ordered newest first
  const { data: periods, error: periodsErr } = await supabaseAdmin
    .from("membership_periods")
    .select("*, plans(name, duration_days, price)")
    .eq("member_id", id)
    .order("start_date", { ascending: false });
  if (periodsErr)
    return NextResponse.json({ error: periodsErr.message }, { status: 500 });

  // Fetch all payments for this member
  const periodIds = (periods ?? []).map((p: any) => p.id);
  let payments: any[] = [];
  if (periodIds.length > 0) {
    const { data: paymentRows } = await supabaseAdmin
      .from("payments")
      .select("*")
      .in("membership_period_id", periodIds)
      .order("paid_on", { ascending: false });
    payments = paymentRows ?? [];
  }

  // Fetch freezes
  let freezes: any[] = [];
  if (periodIds.length > 0) {
    const { data: freezeRows } = await supabaseAdmin
      .from("freezes")
      .select("*")
      .in("membership_period_id", periodIds)
      .order("freeze_start", { ascending: false });
    freezes = freezeRows ?? [];
  }

  // Fetch additional charges (water bottle, protein, etc.)
  const { data: additionalCharges } = await supabaseAdmin
    .from("additional_charges")
    .select("*")
    .eq("member_id", id)
    .order("bought_date", { ascending: false });

  return NextResponse.json({
    member,
    periods: periods ?? [],
    payments,
    freezes,
    additionalCharges: additionalCharges ?? [],
  });
}

// PATCH /api/members/[id] — update member info
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const guard = await requireAdminApi();
  if (guard instanceof NextResponse) return guard;

  const body = await req.json();
  const { name, phone, email, gender, emergency_contact, notes } = body;

  const { data, error } = await supabaseAdmin
    .from("members")
    .update({ name, phone, email, gender, emergency_contact, notes })
    .eq("id", params.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// DELETE /api/members/[id] — delete member completely
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const guard = await requireAdminApi();
  if (guard instanceof NextResponse) return guard;

  const { error } = await supabaseAdmin
    .from("members")
    .delete()
    .eq("id", params.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

