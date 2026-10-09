import { unstable_noStore as noStore } from "next/cache";
import { chargeAmounts, chargePaymentParentId } from "./charges";
import { supabaseAdmin } from "./supabase";

const PAGE_SIZE = 1000;

async function fetchAll<T>(
  build: (
    from: number,
    to: number
  ) => PromiseLike<{ data: T[] | null; error: { message: string } | null }>
): Promise<T[]> {
  const rows: T[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await build(from, from + PAGE_SIZE - 1);
    if (error) throw error;
    const batch = data ?? [];
    rows.push(...batch);
    if (batch.length < PAGE_SIZE) break;
  }
  return rows;
}

export type NotificationItem = {
  memberId: string;
  periodId: string;
  name: string;
  phone: string;
  endDate: string;
  daysLeft: number; // negative if overdue
  type: "due_soon" | "overdue";
};

/**
 * Returns everything the admin dashboard needs in one call:
 * - dueSoon: active members with active period whose due date is within the next 7 days
 * - overdue: active members with active period whose due date has passed (days_left < 0)
 * - summary: counts for the dashboard cards
 */
export async function getDashboardNotifications() {
  noStore();
  // Fetch all current member statuses from view (page past the 1000-row cap)
  const rows = await fetchAll<any>((from, to) =>
    supabaseAdmin
      .from("member_current_status")
      .select("*")
      .order("member_id", { ascending: true })
      .range(from, to)
  );

  // Due Soon: active members with active period whose end_date is within next 7 days
  const dueSoonRows = rows.filter(
    (m: any) =>
      m.member_status === "active" &&
      m.period_status === "active" &&
      m.days_left !== null &&
      m.days_left >= 0 &&
      m.days_left <= 7
  );

  // Overdue: active members whose membership end_date has passed (days_left < 0) AND who still owe an unpaid balance (balance > 0)
  const overdueRows = rows.filter(
    (m: any) =>
      m.member_status === "active" &&
      m.period_status === "active" &&
      m.days_left !== null &&
      m.days_left < 0 &&
      Number(m.balance || 0) > 0
  );

  const dueSoon: NotificationItem[] = dueSoonRows.map((r: any) => ({
    memberId: r.member_id,
    periodId: r.current_period_id ?? "",
    name: r.name ?? "Member",
    phone: r.phone ?? "",
    endDate: r.end_date,
    daysLeft: Number(r.days_left),
    type: "due_soon",
  }));

  const overdue: NotificationItem[] = overdueRows.map((r: any) => ({
    memberId: r.member_id,
    periodId: r.current_period_id ?? "",
    name: r.name ?? "Member",
    phone: r.phone ?? "",
    endDate: r.end_date,
    daysLeft: Number(r.days_left),
    type: "overdue",
  }));

  // Active Count: count of active members
  const activeCount = rows.filter((m: any) => m.member_status === "active").length;

  // Fees due matches the members list: plan balance on the current period
  // plus unpaid store charges, for every member.
  let unpaidCharges: {
    member_id: string;
    item_name?: string | null;
    price: number;
    amount_paid?: number | null;
    is_paid?: boolean;
  }[] = [];
  try {
    unpaidCharges = await fetchAll((from, to) =>
      supabaseAdmin
        .from("additional_charges")
        .select("member_id, item_name, price, amount_paid, is_paid")
        .order("id", { ascending: true })
        .range(from, to)
    );
  } catch (err: any) {
    if (!String(err?.message || err).includes("amount_paid")) throw err;
    unpaidCharges = await fetchAll((from, to) =>
      supabaseAdmin
        .from("additional_charges")
        .select("member_id, item_name, price, is_paid")
        .eq("is_paid", false)
        .order("id", { ascending: true })
        .range(from, to)
    );
  }

  const memberBalanceMap: Record<string, number> = {};

  for (const r of rows) {
    const planBalance = Number(r.balance || 0);
    if (planBalance > 0) memberBalanceMap[r.member_id] = planBalance;
  }

  for (const c of unpaidCharges) {
    if (chargePaymentParentId(c.item_name)) continue;
    const pending = chargeAmounts(c).pending;
    if (pending <= 0) continue;
    memberBalanceMap[c.member_id] = (memberBalanceMap[c.member_id] || 0) + pending;
  }

  const feesDueMembers = Object.keys(memberBalanceMap);
  const feesDueCount = feesDueMembers.length;
  const feesDueTotal = Object.values(memberBalanceMap).reduce((sum, val) => sum + val, 0);

  return {
    dueSoon,
    overdue,
    reactivatedCount: 0,
    summary: {
      activeCount,
      dueSoonCount: dueSoon.length,
      overdueCount: overdue.length,
      feesDueCount,
      feesDueTotal,
    },
  };
}
