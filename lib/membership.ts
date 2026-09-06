import { supabaseAdmin } from "./supabase";

/**
 * Adds `days` to a date string (YYYY-MM-DD) and returns YYYY-MM-DD.
 */
function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

/**
 * SCENARIO 1: New member joins, or an existing (left) member REJOINS.
 * Always creates a fresh membership_periods row starting from `startDate`.
 * This is the key fix for "member left, came back 15 days later" —
 * the new due date is calculated from THIS start date, not the old cycle.
 */
export async function joinOrRejoin({
  memberId,
  planId,
  startDate,           // defaults to today if not passed
  amountPaid = 0,
  previousPeriodId,     // pass this if it's a rejoin, to link history (optional)
}: {
  memberId: string;
  planId: string;
  startDate?: string;
  amountPaid?: number;
  previousPeriodId?: string;
}) {
  const { data: plan, error: planErr } = await supabaseAdmin
    .from("plans")
    .select("*")
    .eq("id", planId)
    .single();
  if (planErr || !plan) throw new Error("Plan not found");

  const start = startDate ?? new Date().toISOString().split("T")[0];
  const end = addDays(start, plan.duration_days);

  const { data, error } = await supabaseAdmin
    .from("membership_periods")
    .insert({
      member_id: memberId,
      plan_id: planId,
      start_date: start,
      planned_end_date: end,
      end_date: end,
      status: "active",
      amount_due: plan.price,
      amount_paid: amountPaid,
      rejoined_from_period_id: previousPeriodId ?? null,
    })
    .select()
    .single();

  if (error) throw error;

  // Make sure member.status is active again
  await supabaseAdmin.from("members").update({ status: "active" }).eq("id", memberId);

  return data;
}

/**
 * SCENARIO 2: Member renews ON TIME (before or on their due date).
 * New period starts the day AFTER the current period's end_date —
 * so their cycle stays continuous, no gap.
 */
export async function renewOnTime({
  currentPeriodId,
  planId,
  amountPaid = 0,
}: {
  currentPeriodId: string;
  planId: string;
  amountPaid?: number;
}) {
  const { data: currentPeriod, error } = await supabaseAdmin
    .from("membership_periods")
    .select("*")
    .eq("id", currentPeriodId)
    .single();
  if (error || !currentPeriod) throw new Error("Current period not found");

  // Close the old period as expired (naturally completed)
  await supabaseAdmin
    .from("membership_periods")
    .update({ status: "expired" })
    .eq("id", currentPeriodId);

  const todayStr = new Date().toISOString().split("T")[0];
  // If period already ended in the past, start new cycle from today!
  const nextStart =
    currentPeriod.end_date < todayStr ? todayStr : addDays(currentPeriod.end_date, 1);

  return joinOrRejoin({
    memberId: currentPeriod.member_id,
    planId,
    startDate: nextStart,
    amountPaid,
    previousPeriodId: currentPeriodId,
  });
}

/**
 * SCENARIO 3: Member leaves BEFORE their due date.
 * We close the current period as 'left_early' and mark the member inactive.
 * We do NOT delete anything — history is preserved.
 */
export async function markLeftEarly({
  periodId,
  leftOn,
}: {
  periodId: string;
  leftOn?: string;
}) {
  const { data: period, error } = await supabaseAdmin
    .from("membership_periods")
    .select("*")
    .eq("id", periodId)
    .single();
  if (error || !period) throw new Error("Period not found");

  const leaveDate = leftOn ?? new Date().toISOString().split("T")[0];

  await supabaseAdmin
    .from("membership_periods")
    .update({ status: "left_early", left_on: leaveDate })
    .eq("id", periodId);

  await supabaseAdmin
    .from("members")
    .update({ status: "inactive" })
    .eq("id", period.member_id);
}

/**
 * SCENARIO 4: Freeze / pause (illness, travel) — member does NOT leave,
 * their due date just gets pushed out by the number of frozen days.
 * This is different from "leaving" — no new period is created.
 */
export async function freezeMembership({
  periodId,
  freezeStart,
  freezeEnd,
  reason,
}: {
  periodId: string;
  freezeStart: string;
  freezeEnd: string;
  reason?: string;
}) {
  const days = Math.round(
    (new Date(freezeEnd).getTime() - new Date(freezeStart).getTime()) / 86400000
  );
  if (days <= 0) throw new Error("freezeEnd must be after freezeStart");

  const { data: period, error } = await supabaseAdmin
    .from("membership_periods")
    .select("*")
    .eq("id", periodId)
    .single();
  if (error || !period) throw new Error("Period not found");

  const newEndDate = addDays(period.end_date, days);

  await supabaseAdmin
    .from("membership_periods")
    .update({ end_date: newEndDate, status: "frozen" })
    .eq("id", periodId);

  await supabaseAdmin.from("freezes").insert({
    membership_period_id: periodId,
    freeze_start: freezeStart,
    freeze_end: freezeEnd,
    days,
    reason,
  });

  // Once freeze period passes, a daily cron (see cron/update-statuses) should
  // flip status back to 'active' automatically if today < newEndDate.
}

/**
 * Record a payment against a period (handles partial payments).
 */
export async function recordPayment({
  periodId,
  amount,
  method,
  paidOn,
}: {
  periodId: string;
  amount: number;
  method?: string;
  paidOn?: string;
}) {
  await supabaseAdmin.from("payments").insert({
    membership_period_id: periodId,
    amount,
    method,
    paid_on: paidOn ?? new Date().toISOString().split("T")[0],
  });

  const { data: period } = await supabaseAdmin
    .from("membership_periods")
    .select("amount_paid")
    .eq("id", periodId)
    .single();

  await supabaseAdmin
    .from("membership_periods")
    .update({ amount_paid: (period?.amount_paid ?? 0) + amount })
    .eq("id", periodId);
}
