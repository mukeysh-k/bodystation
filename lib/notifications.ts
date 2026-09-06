import { supabaseAdmin } from "./supabase";

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
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  // Fetch all current member statuses from view
  const { data: statusRows, error } = await supabaseAdmin
    .from("member_current_status")
    .select("*");

  if (error) throw error;

  const rows = statusRows ?? [];

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

  // Calculate fees due: plan balance + unpaid store charges
  const { data: unpaidCharges } = await supabaseAdmin
    .from("additional_charges")
    .select("member_id, price")
    .eq("is_paid", false);

  const memberBalanceMap: Record<string, number> = {};

  for (const r of rows) {
    if (r.member_status === "active" && r.balance && Number(r.balance) > 0) {
      memberBalanceMap[r.member_id] = Number(r.balance);
    }
  }

  if (unpaidCharges) {
    for (const c of unpaidCharges) {
      memberBalanceMap[c.member_id] =
        (memberBalanceMap[c.member_id] || 0) + Number(c.price);
    }
  }

  const feesDueMembers = Object.keys(memberBalanceMap);
  const feesDueCount = feesDueMembers.length;
  const feesDueTotal = Object.values(memberBalanceMap).reduce((sum, val) => sum + val, 0);

  // Revenue this month
  const { data: revenueRows } = await supabaseAdmin
    .from("payments")
    .select("amount, paid_on")
    .gte(
      "paid_on",
      new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split("T")[0]
    );

  const revenueThisMonth = (revenueRows ?? []).reduce(
    (sum: number, r: any) => sum + Number(r.amount),
    0
  );

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
      revenueThisMonth,
    },
  };
}
