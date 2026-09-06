// Save this file to: app/api/cron/reminders/route.ts

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { sendWhatsAppTemplate } from "@/lib/whatsapp";

// Protects this endpoint so only Vercel Cron (or you, with the secret) can trigger it
function isAuthorized(req: Request) {
  const auth = req.headers.get("authorization");
  return auth === `Bearer ${process.env.CRON_SECRET}`;
}

export async function GET(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = new Date().toISOString().split("T")[0];
  const REMIND_DAYS_BEFORE = 3; // send "due soon" reminder 3 days before due date

  const results = { dueSoon: 0, overdue: 0, errors: [] as string[] };

  // ---- 1. Members due in exactly REMIND_DAYS_BEFORE days ----
  const reminderDate = new Date();
  reminderDate.setDate(reminderDate.getDate() + REMIND_DAYS_BEFORE);
  const reminderDateStr = reminderDate.toISOString().split("T")[0];

  const { data: dueSoonPeriods } = await supabaseAdmin
    .from("membership_periods")
    .select("id, member_id, end_date, members(name, phone)")
    .eq("status", "active")
    .eq("end_date", reminderDateStr);

  for (const period of dueSoonPeriods ?? []) {
    // avoid duplicate sends for the same period+type
    const { data: alreadySent } = await supabaseAdmin
      .from("notifications_log")
      .select("id")
      .eq("membership_period_id", period.id)
      .eq("type", "due_soon")
      .maybeSingle();
    if (alreadySent) continue;

    const member = (period as any).members;
    const result = await sendWhatsAppTemplate({
      to: member.phone,
      templateName: "due_reminder",
      params: [member.name, period.end_date],
    });

    await supabaseAdmin.from("notifications_log").insert({
      member_id: period.member_id,
      membership_period_id: period.id,
      type: "due_soon",
      status: result.success ? "sent" : "failed",
    });

    result.success ? results.dueSoon++ : results.errors.push(`due_soon:${period.id}`);
  }

  // ---- 2. Members whose end_date has already passed (overdue), status still 'active' ----
  const { data: overduePeriods } = await supabaseAdmin
    .from("membership_periods")
    .select("id, member_id, end_date, members(name, phone)")
    .eq("status", "active")
    .lt("end_date", today);

  for (const period of overduePeriods ?? []) {
    const { data: alreadySent } = await supabaseAdmin
      .from("notifications_log")
      .select("id")
      .eq("membership_period_id", period.id)
      .eq("type", "overdue")
      .maybeSingle();
    if (alreadySent) continue;

    const member = (period as any).members;
    const result = await sendWhatsAppTemplate({
      to: member.phone,
      templateName: "overdue_alert",
      params: [member.name, period.end_date],
    });

    await supabaseAdmin.from("notifications_log").insert({
      member_id: period.member_id,
      membership_period_id: period.id,
      type: "overdue",
      status: result.success ? "sent" : "failed",
    });

    // also flip the period status to 'expired' so the dashboard reflects reality
    await supabaseAdmin
      .from("membership_periods")
      .update({ status: "expired" })
      .eq("id", period.id);

    result.success ? results.overdue++ : results.errors.push(`overdue:${period.id}`);
  }

  // ---- 3. Auto-unfreeze: frozen periods whose extended end_date is now in the future ----
  await supabaseAdmin
    .from("membership_periods")
    .update({ status: "active" })
    .eq("status", "frozen")
    .gt("end_date", today);

  return NextResponse.json({ ok: true, ...results });
}
