import { getDashboardNotifications } from "@/lib/notifications";
import NotificationBell from "@/components/NotificationBell";
import Link from "next/link";
import { Users, Clock, AlertCircle, IndianRupee, ArrowRight, ShoppingBag } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { summary } = await getDashboardNotifications();

  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex items-center justify-between border-b border-stone-200 bg-white px-6 py-4">
        <h1 className="text-lg font-semibold text-stone-800">Dashboard</h1>
        <NotificationBell />
      </header>

      <main className="flex-1 p-6">
        <div className="mx-auto max-w-5xl space-y-6">
          {/* Top Cards Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Link href="/admin/members?filter=active" className="block group">
              <SummaryCard
                label="Active Members"
                value={summary.activeCount}
                subtext="Click to view active members"
                icon={<Users size={20} className="text-emerald-600" />}
                tone="emerald"
              />
            </Link>

            <Link href="/admin/members?filter=fees_due" className="block group">
              <SummaryCard
                label="Due Fees (Pending)"
                value={`${summary.feesDueCount} members`}
                subtext={
                  summary.feesDueTotal > 0
                    ? `₹${summary.feesDueTotal.toLocaleString("en-IN")} total pending`
                    : "No pending balance"
                }
                icon={<IndianRupee size={20} className="text-red-600" />}
                tone="danger"
              />
            </Link>

            <Link href="/admin/members?filter=overdue" className="block group">
              <SummaryCard
                label="Overdue Memberships"
                value={summary.overdueCount}
                subtext="Plan end date passed"
                icon={<AlertCircle size={20} className="text-amber-600" />}
                tone="warning"
              />
            </Link>

            <Link href="/admin/members?filter=due_soon" className="block group">
              <SummaryCard
                label="Due This Week"
                value={summary.dueSoonCount}
                subtext="Expiring within 3 days"
                icon={<Clock size={20} className="text-blue-600" />}
                tone="blue"
              />
            </Link>

            <div className="block">
              <SummaryCard
                label="Revenue This Month"
                value={`₹${summary.revenueThisMonth.toLocaleString("en-IN")}`}
                subtext="Total payments collected"
                icon={<IndianRupee size={20} className="text-purple-600" />}
                tone="purple"
              />
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
            <div>
              <h3 className="font-semibold text-stone-800">Quick Member Directory</h3>
              <p className="text-xs text-stone-400">
                Filter members by payment status, active status, or renewal dates.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/admin/members?filter=fees_due"
                className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100"
              >
                View Due Fees ({summary.feesDueCount})
              </Link>
              <Link
                href="/admin/members"
                className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700"
              >
                View all members <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  subtext,
  icon,
  tone,
}: {
  label: string;
  value: string | number;
  subtext?: string;
  icon: React.ReactNode;
  tone: "emerald" | "danger" | "warning" | "blue" | "purple";
}) {
  const toneMap: Record<string, { card: string; text: string }> = {
    emerald: { card: "border-stone-200 hover:border-emerald-300", text: "text-emerald-700" },
    danger: { card: "border-stone-200 hover:border-red-300", text: "text-red-600" },
    warning: { card: "border-stone-200 hover:border-amber-300", text: "text-amber-600" },
    blue: { card: "border-stone-200 hover:border-blue-300", text: "text-blue-600" },
    purple: { card: "border-stone-200 hover:border-purple-300", text: "text-purple-600" },
  };

  const { card, text } = toneMap[tone];

  return (
    <div
      className={`rounded-xl border bg-white p-5 shadow-sm transition hover:shadow-md ${card}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-stone-500 uppercase tracking-wider">{label}</span>
        <div className="rounded-lg bg-stone-50 p-2">{icon}</div>
      </div>
      <p className={`mt-2 text-2xl font-bold ${text}`}>{value}</p>
      {subtext && <p className="mt-1 text-xs text-stone-400">{subtext}</p>}
    </div>
  );
}
