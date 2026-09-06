import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requireAdminApi } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// GET /api/members — list all members with filter options
export async function GET(req: NextRequest) {
  const guard = await requireAdminApi();
  if (guard instanceof NextResponse) return guard;

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const filter = searchParams.get("filter") || searchParams.get("status") || "";

  let query = supabaseAdmin
    .from("member_current_status")
    .select("*")
    .order("name", { ascending: true });

  if (search) {
    query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%`);
  }

  // Filter conditions
  if (filter === "active") {
    query = query.eq("member_status", "active");
  } else if (filter === "inactive") {
    query = query.eq("member_status", "inactive");
  } else if (filter === "due_soon") {
    query = query
      .eq("member_status", "active")
      .eq("period_status", "active")
      .gte("days_left", 0)
      .lte("days_left", 7);
  } else if (filter === "overdue") {
    query = query
      .eq("member_status", "active")
      .eq("period_status", "active")
      .lt("days_left", 0)
      .gt("balance", 0);
  } else if (filter === "fees_due") {
    // We will filter members having positive plan balance or unpaid additional charges
    query = query.gt("balance", 0);
  }

  const { data: memberRows, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  let members = memberRows ?? [];

  // Also fetch unpaid additional charges to combine into balance or for fees_due filter
  const { data: unpaidCharges } = await supabaseAdmin
    .from("additional_charges")
    .select("member_id, price")
    .eq("is_paid", false);

  const unpaidMap: Record<string, number> = {};
  if (unpaidCharges) {
    for (const c of unpaidCharges) {
      unpaidMap[c.member_id] = (unpaidMap[c.member_id] || 0) + Number(c.price);
    }
  }

  // Attach store_unpaid and total_balance to each member
  members = members.map((m: any) => {
    const storeUnpaid = unpaidMap[m.member_id] || 0;
    const planBalance = Number(m.balance || 0);
    return {
      ...m,
      store_unpaid: storeUnpaid,
      total_balance: planBalance + storeUnpaid,
    };
  });

  // If filter is fees_due, include members with plan balance > 0 OR store_unpaid > 0
  if (filter === "fees_due") {
    // If query.gt("balance", 0) was run, let's fetch all active members and filter in memory so store_unpaid is included
    const { data: allActive } = await supabaseAdmin
      .from("member_current_status")
      .select("*")
      .order("name", { ascending: true });

    if (allActive) {
      members = allActive
        .map((m: any) => {
          const storeUnpaid = unpaidMap[m.member_id] || 0;
          const planBalance = Number(m.balance || 0);
          return {
            ...m,
            store_unpaid: storeUnpaid,
            total_balance: planBalance + storeUnpaid,
          };
        })
        .filter((m: any) => m.total_balance > 0);
    }
  }

  return NextResponse.json(members);
}

// POST /api/members — create a new member
export async function POST(req: NextRequest) {
  const guard = await requireAdminApi();
  if (guard instanceof NextResponse) return guard;

  const body = await req.json();
  const { name, phone, email, gender, emergency_contact, notes } = body;

  if (!name || !phone) {
    return NextResponse.json({ error: "Name and phone are required." }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("members")
    .insert({
      name,
      phone,
      email,
      gender,
      emergency_contact,
      notes,
      status: "active",
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
