// Installments are extra additional_charges rows named [[bs-pay:<charge id>]].
// The parent amount_paid stays the sum, which fees and the members list already use.
import { supabaseAdmin } from "./supabase";
import { indiaDate } from "./dates";
import {
  chargeAmounts,
  chargePaymentItemName,
  chargePaymentParentId,
} from "./charges";

export type ChargePayment = {
  id: string;
  amount: number;
  paid_on: string;
};

type ChargeRow = {
  id: string;
  member_id: string;
  item_name: string;
  price: number | string;
  bought_date: string;
  is_paid: boolean;
  amount_paid?: number | string | null;
  paid_date?: string | null;
  created_at?: string;
};

export type PresentedCharge = ChargeRow & { payments: ChargePayment[] };

type Failure = { ok: false; error: string; status: number };
type Success = { ok: true; charge: PresentedCharge };

function money(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function rupee(value: number) {
  return `₹${money(value).toLocaleString("en-IN")}`;
}

function dateOnly(value: string | null | undefined, fallback = "") {
  if (value && /^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10);
  return fallback;
}

function paymentFromRow(row: ChargeRow): ChargePayment {
  return {
    id: row.id,
    amount: money(Number(row.price || 0)),
    paid_on: dateOnly(row.paid_date || row.bought_date, indiaDate()),
  };
}

function sortedPaymentRows(rows: ChargeRow[]) {
  return [...rows].sort((a, b) => {
    const byDate = dateOnly(a.paid_date || a.bought_date).localeCompare(
      dateOnly(b.paid_date || b.bought_date)
    );
    if (byDate !== 0) return byDate;
    return String(a.created_at || "").localeCompare(String(b.created_at || ""));
  });
}

async function fetchMemberChargeRows(memberId: string) {
  const { data, error } = await supabaseAdmin
    .from("additional_charges")
    .select("*")
    .eq("member_id", memberId);
  if (error) throw new Error(error.message);
  return (data ?? []) as ChargeRow[];
}

function splitRows(rows: ChargeRow[]) {
  const charges: ChargeRow[] = [];
  const payments = new Map<string, ChargeRow[]>();
  for (const row of rows) {
    const parentId = chargePaymentParentId(row.item_name);
    if (parentId) {
      const list = payments.get(parentId) ?? [];
      list.push(row);
      payments.set(parentId, list);
    } else {
      charges.push(row);
    }
  }
  return { charges, payments };
}

function presentCharge(charge: ChargeRow, paymentRows: ChargeRow[]): PresentedCharge {
  const payments = sortedPaymentRows(paymentRows).map(paymentFromRow);
  if (payments.length === 0) {
    const paid = chargeAmounts(charge).paid;
    if (paid > 0) {
      payments.push({
        id: `recorded:${charge.id}`,
        amount: money(paid),
        paid_on: dateOnly(charge.paid_date || charge.bought_date, indiaDate()),
      });
    }
  }
  return { ...charge, payments };
}

export async function listMemberCharges(memberId: string) {
  const { charges, payments } = splitRows(await fetchMemberChargeRows(memberId));
  return charges
    .sort(
      (a, b) =>
        String(b.bought_date).localeCompare(String(a.bought_date)) ||
        String(b.created_at || "").localeCompare(String(a.created_at || ""))
    )
    .map((charge) => presentCharge(charge, payments.get(charge.id) ?? []));
}

async function loadOwnedCharge(memberId: string, chargeId: string) {
  const { charges, payments } = splitRows(await fetchMemberChargeRows(memberId));
  const charge = charges.find((row) => row.id === chargeId);
  if (!charge) return null;
  return { charge, paymentRows: payments.get(chargeId) ?? [] };
}

async function syncParent(charge: ChargeRow, paymentRows: ChargeRow[]) {
  const paid = money(paymentRows.reduce((sum, row) => sum + Number(row.price || 0), 0));
  const price = money(Number(charge.price || 0));
  const dates = paymentRows
    .map((row) => dateOnly(row.paid_date || row.bought_date))
    .filter(Boolean)
    .sort();
  const { data, error } = await supabaseAdmin
    .from("additional_charges")
    .update({
      amount_paid: paid,
      is_paid: paid + 0.001 >= price,
      paid_date: paid > 0 ? dates[dates.length - 1] : null,
    })
    .eq("id", charge.id)
    .eq("member_id", charge.member_id)
    .select("*")
    .single();
  if (error || !data) throw new Error(error?.message || "Could not update the charge.");
  return data as ChargeRow;
}

/** Turn the single saved amount into the first history row, once. */
async function materializeRecordedPayment(charge: ChargeRow, paymentRows: ChargeRow[]) {
  if (paymentRows.length > 0) return paymentRows;
  const paid = chargeAmounts(charge).paid;
  if (paid <= 0) return paymentRows;
  const fresh = await loadOwnedCharge(charge.member_id, charge.id);
  if (fresh && fresh.paymentRows.length > 0) return fresh.paymentRows;
  const paidOn = dateOnly(charge.paid_date || charge.bought_date, indiaDate());
  const amount = money(paid);
  const { data, error } = await supabaseAdmin
    .from("additional_charges")
    .insert({
      member_id: charge.member_id,
      item_name: chargePaymentItemName(charge.id),
      price: amount,
      amount_paid: amount,
      bought_date: paidOn,
      is_paid: true,
      paid_date: paidOn,
    })
    .select("*")
    .single();
  if (error || !data) throw new Error(error?.message || "Could not save the existing payment.");
  return [data as ChargeRow];
}

function paymentDateError(paidOn: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(paidOn)) return "Choose the date this payment was made.";
  if (paidOn > indiaDate()) return "Payment date must be today or earlier.";
  return null;
}

export async function createMemberCharge(input: {
  memberId: string;
  itemName: string;
  price: number;
  boughtDate: string;
  amountPaid: number;
  paidOn: string | null;
}): Promise<Success | Failure> {
  const itemName = input.itemName.trim();
  if (!itemName) return { ok: false, error: "Item name is required.", status: 400 };
  if (chargePaymentParentId(itemName)) {
    return { ok: false, error: "Item name is not valid.", status: 400 };
  }
  const price = money(input.price);
  const amountPaid = money(input.amountPaid);
  if (!Number.isFinite(price) || price < 0) {
    return { ok: false, error: "Total amount must be zero or more.", status: 400 };
  }
  if (!Number.isFinite(amountPaid) || amountPaid < 0) {
    return { ok: false, error: "Amount paid cannot be negative.", status: 400 };
  }
  if (amountPaid > price + 0.001) {
    return { ok: false, error: "Amount paid cannot be more than the total.", status: 400 };
  }
  const paidOn = input.paidOn || indiaDate();
  if (amountPaid > 0) {
    const dateError = paymentDateError(paidOn);
    if (dateError) return { ok: false, error: dateError, status: 400 };
  }

  const { data, error } = await supabaseAdmin
    .from("additional_charges")
    .insert({
      member_id: input.memberId,
      item_name: itemName,
      price,
      bought_date: input.boughtDate || indiaDate(),
      is_paid: false,
      amount_paid: 0,
      paid_date: null,
    })
    .select("*")
    .single();
  if (error || !data) return { ok: false, error: error?.message || "Could not add the charge.", status: 500 };

  if (amountPaid <= 0) return { ok: true, charge: presentCharge(data as ChargeRow, []) };

  const added = await updateMemberCharge({
    memberId: input.memberId,
    chargeId: (data as ChargeRow).id,
    payment: { amount: amountPaid, paidOn },
  });
  if (!added.ok) {
    await supabaseAdmin.from("additional_charges").delete().eq("id", (data as ChargeRow).id);
  }
  return added;
}

export async function updateMemberCharge(input: {
  memberId: string;
  chargeId: string;
  itemName?: string;
  price?: number;
  boughtDate?: string;
  payment?: { amount: number; paidOn: string } | null;
}): Promise<Success | Failure> {
  const owned = await loadOwnedCharge(input.memberId, input.chargeId);
  if (!owned) return { ok: false, error: "Charge not found.", status: 404 };

  let charge = owned.charge;
  let paymentRows: ChargeRow[];
  try {
    paymentRows = await materializeRecordedPayment(charge, owned.paymentRows);
  } catch (err: any) {
    return { ok: false, error: err.message, status: 500 };
  }

  const nextPrice = input.price === undefined ? money(Number(charge.price)) : money(input.price);
  if (!Number.isFinite(nextPrice) || nextPrice < 0) {
    return { ok: false, error: "Total amount must be zero or more.", status: 400 };
  }
  const already = money(paymentRows.reduce((sum, row) => sum + Number(row.price || 0), 0));
  if (nextPrice + 0.001 < already) {
    return {
      ok: false,
      error: `Total cannot be less than the ${rupee(already)} already paid. Remove a payment first.`,
      status: 400,
    };
  }

  const detail: Record<string, unknown> = {};
  if (input.itemName !== undefined) {
    const itemName = input.itemName.trim();
    if (!itemName) return { ok: false, error: "Item name is required.", status: 400 };
    if (chargePaymentParentId(itemName)) {
      return { ok: false, error: "Item name is not valid.", status: 400 };
    }
    detail.item_name = itemName;
  }
  if (input.price !== undefined) detail.price = nextPrice;
  if (input.boughtDate !== undefined) detail.bought_date = input.boughtDate;

  if (Object.keys(detail).length > 0) {
    const { data, error } = await supabaseAdmin
      .from("additional_charges")
      .update(detail)
      .eq("id", charge.id)
      .eq("member_id", input.memberId)
      .select("*")
      .single();
    if (error || !data) return { ok: false, error: error?.message || "Could not update the charge.", status: 500 };
    charge = data as ChargeRow;
  }
  charge = { ...charge, price: nextPrice };

  if (input.payment) {
    const amount = money(input.payment.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      return { ok: false, error: "Enter the amount paid.", status: 400 };
    }
    const dateError = paymentDateError(input.payment.paidOn);
    if (dateError) return { ok: false, error: dateError, status: 400 };
    const pending = money(Math.max(0, nextPrice - already));
    if (amount > pending + 0.001) {
      return {
        ok: false,
        error: `This payment is more than the pending ${rupee(pending)}.`,
        status: 400,
      };
    }
    const { data, error } = await supabaseAdmin
      .from("additional_charges")
      .insert({
        member_id: input.memberId,
        item_name: chargePaymentItemName(charge.id),
        price: amount,
        amount_paid: amount,
        bought_date: input.payment.paidOn,
        is_paid: true,
        paid_date: input.payment.paidOn,
      })
      .select("*")
      .single();
    if (error || !data) return { ok: false, error: error?.message || "Could not record the payment.", status: 500 };
    paymentRows = [...paymentRows, data as ChargeRow];
  }

  try {
    const synced = await syncParent(charge, paymentRows);
    return { ok: true, charge: presentCharge(synced, paymentRows) };
  } catch (err: any) {
    return { ok: false, error: err.message, status: 500 };
  }
}

export async function removeChargePayment(
  memberId: string,
  paymentId: string
): Promise<Success | Failure> {
  if (paymentId.startsWith("recorded:")) {
    const chargeId = paymentId.slice("recorded:".length);
    const owned = await loadOwnedCharge(memberId, chargeId);
    if (!owned) return { ok: false, error: "Charge not found.", status: 404 };
    if (owned.paymentRows.length > 0) {
      return { ok: true, charge: presentCharge(owned.charge, owned.paymentRows) };
    }
    try {
      const synced = await syncParent(owned.charge, []);
      return { ok: true, charge: presentCharge(synced, []) };
    } catch (err: any) {
      return { ok: false, error: err.message, status: 500 };
    }
  }

  const { data: row, error } = await supabaseAdmin
    .from("additional_charges")
    .select("*")
    .eq("id", paymentId)
    .eq("member_id", memberId)
    .maybeSingle();
  if (error) return { ok: false, error: error.message, status: 500 };
  const parentId = row ? chargePaymentParentId((row as ChargeRow).item_name) : null;
  if (!row || !parentId) return { ok: false, error: "Payment not found.", status: 404 };

  const owned = await loadOwnedCharge(memberId, parentId);
  if (!owned) return { ok: false, error: "Charge not found.", status: 404 };

  const { error: deleteError } = await supabaseAdmin
    .from("additional_charges")
    .delete()
    .eq("id", paymentId)
    .eq("member_id", memberId);
  if (deleteError) return { ok: false, error: deleteError.message, status: 500 };

  const remaining = owned.paymentRows.filter((payment) => payment.id !== paymentId);
  try {
    const synced = await syncParent(owned.charge, remaining);
    return { ok: true, charge: presentCharge(synced, remaining) };
  } catch (err: any) {
    return { ok: false, error: err.message, status: 500 };
  }
}

export async function deleteMemberCharge(memberId: string, chargeId: string): Promise<Failure | { ok: true }> {
  const owned = await loadOwnedCharge(memberId, chargeId);
  if (!owned) return { ok: false, error: "Charge not found.", status: 404 };

  const { error: paymentsError } = await supabaseAdmin
    .from("additional_charges")
    .delete()
    .eq("member_id", memberId)
    .eq("item_name", chargePaymentItemName(chargeId));
  if (paymentsError) return { ok: false, error: paymentsError.message, status: 500 };

  const { error } = await supabaseAdmin
    .from("additional_charges")
    .delete()
    .eq("id", chargeId)
    .eq("member_id", memberId);
  if (error) return { ok: false, error: error.message, status: 500 };
  return { ok: true };
}
