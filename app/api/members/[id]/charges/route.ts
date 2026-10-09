import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth";
import { indiaDate } from "@/lib/dates";
import {
  createMemberCharge,
  deleteMemberCharge,
  removeChargePayment,
  updateMemberCharge,
} from "@/lib/charge-ledger";

function fail(result: { ok: false; error: string; status: number }) {
  return NextResponse.json({ error: result.error }, { status: result.status });
}

// POST /api/members/[id]/charges — add a charge, with an optional first payment
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const guard = await requireAdminApi();
  if (guard instanceof NextResponse) return guard;

  const body = await req.json();
  const { item_name, price, bought_date, is_paid, paid_date, amount_paid } = body;

  if (!item_name || price === undefined) {
    return NextResponse.json({ error: "Item name and price are required." }, { status: 400 });
  }

  const total = Number(price);
  const paid =
    amount_paid !== undefined && amount_paid !== null && amount_paid !== ""
      ? Number(amount_paid)
      : is_paid
        ? total
        : 0;

  const result = await createMemberCharge({
    memberId: params.id,
    itemName: String(item_name),
    price: total,
    boughtDate: bought_date || indiaDate(),
    amountPaid: paid,
    paidOn: paid > 0 ? paid_date || indiaDate() : null,
  });
  if (!result.ok) return fail(result);
  return NextResponse.json(result.charge, { status: 201 });
}

// PATCH /api/members/[id]/charges — edit the charge and/or add one payment
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const guard = await requireAdminApi();
  if (guard instanceof NextResponse) return guard;

  const body = await req.json();
  const { charge_id, item_name, price, bought_date, payment } = body;

  if (!charge_id) {
    return NextResponse.json({ error: "Charge ID is required." }, { status: 400 });
  }

  let nextPayment: { amount: number; paidOn: string } | null = null;
  if (payment && typeof payment === "object") {
    nextPayment = {
      amount: Number(payment.amount),
      paidOn: payment.paid_on || indiaDate(),
    };
  }

  const result = await updateMemberCharge({
    memberId: params.id,
    chargeId: charge_id,
    itemName: item_name,
    price: price !== undefined ? Number(price) : undefined,
    boughtDate: bought_date,
    payment: nextPayment,
  });
  if (!result.ok) return fail(result);
  return NextResponse.json(result.charge);
}

// DELETE /api/members/[id]/charges?chargeId= — delete the charge
// DELETE /api/members/[id]/charges?paymentId= — remove one payment from its history
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const guard = await requireAdminApi();
  if (guard instanceof NextResponse) return guard;

  const { searchParams } = new URL(req.url);
  const paymentId = searchParams.get("paymentId");
  const chargeId = searchParams.get("chargeId");

  if (paymentId) {
    const result = await removeChargePayment(params.id, paymentId);
    if (!result.ok) return fail(result);
    return NextResponse.json(result.charge);
  }

  if (!chargeId) {
    return NextResponse.json({ error: "chargeId parameter is required." }, { status: 400 });
  }

  const result = await deleteMemberCharge(params.id, chargeId);
  if (!result.ok) return fail(result);
  return NextResponse.json({ ok: true });
}
