import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requireAdminApi } from "@/lib/auth";

// POST /api/members/[id]/charges — add additional charge (water bottle, protein, etc.)
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const guard = await requireAdminApi();
  if (guard instanceof NextResponse) return guard;

  const { id } = params;
  const body = await req.json();
  const { item_name, price, bought_date, is_paid, paid_date } = body;

  if (!item_name || price === undefined) {
    return NextResponse.json(
      { error: "Item name and price are required." },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from("additional_charges")
    .insert({
      member_id: id,
      item_name,
      price: Number(price),
      bought_date: bought_date || new Date().toISOString().split("T")[0],
      is_paid: Boolean(is_paid),
      paid_date: is_paid ? (paid_date || new Date().toISOString().split("T")[0]) : null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

// PATCH /api/members/[id]/charges — update an additional charge (mark as paid/unpaid, change paid_date)
export async function PATCH(
  req: NextRequest
) {
  const guard = await requireAdminApi();
  if (guard instanceof NextResponse) return guard;

  const body = await req.json();
  const { charge_id, is_paid, paid_date, item_name, price } = body;

  if (!charge_id) {
    return NextResponse.json({ error: "Charge ID is required." }, { status: 400 });
  }

  const updates: Record<string, any> = {};
  if (is_paid !== undefined) {
    updates.is_paid = Boolean(is_paid);
    updates.paid_date = is_paid ? (paid_date || new Date().toISOString().split("T")[0]) : null;
  }
  if (item_name !== undefined) updates.item_name = item_name;
  if (price !== undefined) updates.price = Number(price);

  const { data, error } = await supabaseAdmin
    .from("additional_charges")
    .update(updates)
    .eq("id", charge_id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// DELETE /api/members/[id]/charges — delete an additional charge
export async function DELETE(
  req: NextRequest
) {
  const guard = await requireAdminApi();
  if (guard instanceof NextResponse) return guard;

  const { searchParams } = new URL(req.url);
  const chargeId = searchParams.get("chargeId");

  if (!chargeId) {
    return NextResponse.json({ error: "chargeId parameter is required." }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from("additional_charges")
    .delete()
    .eq("id", chargeId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
