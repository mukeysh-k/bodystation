import { NextRequest, NextResponse } from "next/server";
import {
  joinOrRejoin,
  renewOnTime,
  markLeftEarly,
  freezeMembership,
  recordPayment,
} from "@/lib/membership";
import { requireAdminApi } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const guard = await requireAdminApi();
  if (guard instanceof NextResponse) return guard;

  const body = await req.json();
  const { action } = body;

  try {
    switch (action) {
      case "join":
      case "rejoin": {
        const result = await joinOrRejoin({
          memberId: body.memberId,
          planId: body.planId,
          startDate: body.startDate, // optional, defaults to today
          amountPaid: body.amountPaid ?? 0,
          previousPeriodId: body.previousPeriodId,
        });
        return NextResponse.json({ ok: true, period: result });
      }

      case "renew": {
        const result = await renewOnTime({
          currentPeriodId: body.currentPeriodId,
          planId: body.planId,
          amountPaid: body.amountPaid ?? 0,
        });
        return NextResponse.json({ ok: true, period: result });
      }

      case "leave": {
        await markLeftEarly({
          periodId: body.periodId,
          leftOn: body.leftOn,
        });
        return NextResponse.json({ ok: true });
      }

      case "freeze": {
        await freezeMembership({
          periodId: body.periodId,
          freezeStart: body.freezeStart,
          freezeEnd: body.freezeEnd,
          reason: body.reason,
        });
        return NextResponse.json({ ok: true });
      }

      case "pay": {
        await recordPayment({
          periodId: body.periodId,
          amount: body.amount,
          method: body.method,
          paidOn: body.paidOn,
        });
        return NextResponse.json({ ok: true });
      }

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
