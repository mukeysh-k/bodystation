import { NextRequest, NextResponse } from "next/server";
import { getDashboardNotifications } from "@/lib/notifications";
import { requireAdminApi } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  const guard = await requireAdminApi();
  if (guard instanceof NextResponse) return guard;

  try {
    const data = await getDashboardNotifications();
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
