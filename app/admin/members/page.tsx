"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Plus,
  Search,
  User,
  Phone,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  IndianRupee,
} from "lucide-react";
import AddMemberModal from "./AddMemberModal";
import NotificationBell from "@/components/NotificationBell";

type Member = {
  member_id: string;
  name: string;
  phone: string;
  member_status: "active" | "inactive";
  current_period_id: string | null;
  start_date: string | null;
  end_date: string | null;
  period_status: "active" | "expired" | "left_early" | "frozen" | null;
  amount_due: number | null;
  amount_paid: number | null;
  balance: number | null;
  days_left: number | null;
  store_unpaid?: number;
  total_balance?: number;
};

const FILTER_TABS = [
  { value: "", label: "All" },
  { value: "active", label: "Active" },
  { value: "fees_due", label: "Due Fees" },
  { value: "overdue", label: "Overdue" },
  { value: "due_soon", label: "Due Soon" },
  { value: "inactive", label: "Inactive" },
];

function statusBadge(m: Member) {
  if (m.period_status === "frozen") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
        <Clock size={11} />
        Frozen
      </span>
    );
  }
  if (m.member_status === "active" && m.days_left !== null && m.days_left < 0) {
    const hasUnpaid = (m.total_balance ?? Number(m.balance || 0)) > 0;
    if (hasUnpaid) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700">
          <AlertCircle size={11} />
          Overdue {Math.abs(m.days_left)}d
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-medium text-stone-600">
        <Clock size={11} />
        Expired
      </span>
    );
  }
  if (m.member_status === "active" && m.days_left !== null && m.days_left <= 3) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700">
        <Clock size={11} />
        Due in {m.days_left}d
      </span>
    );
  }
  if (m.member_status === "active") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
        <CheckCircle2 size={11} />
        Active
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-medium text-stone-500">
      <XCircle size={11} />
      Inactive
    </span>
  );
}

function MembersPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialFilter = searchParams.get("filter") || searchParams.get("status") || "";

  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState(initialFilter);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    setActiveFilter(initialFilter);
  }, [initialFilter]);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (activeFilter) params.set("filter", activeFilter);
    const res = await fetch(`/api/members?${params}`);
    const data = await res.json();
    setMembers(Array.isArray(data) ? data : []);
    setLoading(false);
  }, [search, activeFilter]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  function handleTabChange(value: string) {
    setActiveFilter(value);
    const newParams = new URLSearchParams(searchParams.toString());
    if (value) {
      newParams.set("filter", value);
    } else {
      newParams.delete("filter");
    }
    router.replace(`/admin/members?${newParams.toString()}`);
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-stone-200 bg-white px-6 py-4">
        <h1 className="text-lg font-semibold text-stone-800">Members</h1>
        <div className="flex items-center gap-3">
          <NotificationBell />
          <button
            id="add-member-btn"
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            <Plus size={16} />
            Add member
          </button>
        </div>
      </header>

      <main className="flex-1 p-6">
        {/* Search & Filter Bar */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[220px] max-w-xs">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
            />
            <input
              type="search"
              placeholder="Search name or phone…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-stone-200 bg-white py-2 pl-9 pr-3 text-sm text-stone-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-1 rounded-xl bg-stone-100 p-1">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => handleTabChange(tab.value)}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
                  activeFilter === tab.value
                    ? "bg-white text-stone-900 shadow-sm"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-stone-200 bg-white overflow-hidden shadow-sm">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={24} className="animate-spin text-stone-400" />
            </div>
          ) : members.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-stone-400">
              <User size={40} className="mb-3 opacity-40" />
              <p className="text-sm">No members found matching filter.</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-3 text-sm text-emerald-600 hover:underline"
              >
                Add member
              </button>
            </div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-stone-100 bg-stone-50 text-stone-500">
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide">
                    Name
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide">
                    Phone
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide">
                    Status
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide">
                    Renewal Date
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide">
                    Total Due (₹)
                  </th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {members.map((m) => {
                  const totalBalance = m.total_balance ?? Number(m.balance || 0);
                  const hasDue = totalBalance > 0;

                  return (
                    <tr
                      key={m.member_id}
                      className="group transition hover:bg-stone-50"
                    >
                      <td className="px-4 py-3 font-semibold text-stone-800">
                        {m.name}
                      </td>
                      <td className="px-4 py-3 text-stone-500">
                        <span className="flex items-center gap-1.5">
                          <Phone size={12} className="text-stone-400" />
                          {m.phone}
                        </span>
                      </td>
                      <td className="px-4 py-3">{statusBadge(m)}</td>
                      <td className="px-4 py-3 text-stone-500">
                        {m.end_date
                          ? new Date(m.end_date).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          : "—"}
                      </td>
                      <td className="px-4 py-3 font-semibold">
                        {hasDue ? (
                          <div className="flex flex-col">
                            <span className="text-red-600">
                              ₹{totalBalance.toLocaleString("en-IN")}
                            </span>
                            {Boolean(m.store_unpaid) && (
                              <span className="text-[10px] text-stone-400 font-normal">
                                (Plan ₹{Number(m.balance || 0)} + Store ₹{m.store_unpaid})
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-emerald-600 text-xs font-medium">Clear</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/admin/members/${m.member_id}`}
                          className="rounded-lg px-3 py-1.5 text-xs font-semibold text-stone-700 border border-stone-200 transition hover:bg-stone-100 hover:border-stone-300"
                        >
                          View Member →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <p className="mt-3 text-xs text-stone-400">
          Showing {members.length} member{members.length !== 1 ? "s" : ""}
        </p>
      </main>

      {showAddModal && (
        <AddMemberModal
          onClose={() => setShowAddModal(false)}
          onAdded={() => {
            setShowAddModal(false);
            load();
          }}
        />
      )}
    </div>
  );
}

export default function MembersPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 size={24} className="animate-spin text-stone-400" />
        </div>
      }
    >
      <MembersPageContent />
    </Suspense>
  );
}
