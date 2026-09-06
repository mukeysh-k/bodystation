"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Phone,
  Mail,
  User,
  CalendarDays,
  Loader2,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  IndianRupee,
  Trash2,
  Plus,
  ShoppingBag,
} from "lucide-react";
import NotificationBell from "@/components/NotificationBell";
import ActionModal from "./ActionModal";
import EditMemberModal from "./EditMemberModal";
import {
  AddChargeModal,
  MarkPaidModal,
  DeleteMemberConfirmModal,
} from "./ChargeModals";

type Member = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  gender?: string;
  emergency_contact?: string;
  notes?: string;
  status: "active" | "inactive";
  created_at: string;
};

type Plan = { name: string; duration_days: number; price: number };

type Period = {
  id: string;
  member_id: string;
  plan_id: string;
  start_date: string;
  planned_end_date: string;
  end_date: string;
  status: "active" | "expired" | "left_early" | "frozen";
  amount_due: number;
  amount_paid: number;
  left_on?: string;
  notes?: string;
  created_at: string;
  plans: Plan | null;
};

type Payment = {
  id: string;
  membership_period_id: string;
  amount: number;
  paid_on: string;
  method?: string;
};

type Freeze = {
  id: string;
  membership_period_id: string;
  freeze_start: string;
  freeze_end: string;
  days: number;
  reason?: string;
};

type AdditionalCharge = {
  id: string;
  member_id: string;
  item_name: string;
  price: number;
  bought_date: string;
  is_paid: boolean;
  paid_date?: string;
  created_at: string;
};

type MemberDetail = {
  member: Member;
  periods: Period[];
  payments: Payment[];
  freezes: Freeze[];
  additionalCharges?: AdditionalCharge[];
};

function PeriodStatusBadge({ status }: { status: Period["status"] }) {
  const map: Record<Period["status"], { label: string; className: string; icon: React.ReactNode }> = {
    active: {
      label: "Active",
      className: "bg-emerald-50 text-emerald-700",
      icon: <CheckCircle2 size={11} />,
    },
    expired: {
      label: "Expired",
      className: "bg-stone-100 text-stone-500",
      icon: <Clock size={11} />,
    },
    left_early: {
      label: "Left early",
      className: "bg-amber-50 text-amber-700",
      icon: <XCircle size={11} />,
    },
    frozen: {
      label: "Frozen",
      className: "bg-blue-50 text-blue-700",
      icon: <Clock size={11} />,
    },
  };
  const { label, className, icon } = map[status] ?? map.expired;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${className}`}
    >
      {icon}
      {label}
    </span>
  );
}

export default function MemberDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [detail, setDetail] = useState<MemberDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionModal, setActionModal] = useState<{
    type: "renew" | "rejoin" | "leave" | "freeze" | "pay";
    periodId: string;
  } | null>(null);

  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddChargeModal, setShowAddChargeModal] = useState(false);
  const [markPaidCharge, setMarkPaidCharge] = useState<AdditionalCharge | null>(null);
  const [showDeleteMemberModal, setShowDeleteMemberModal] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/members/${id}`);
      if (!res.ok) throw new Error("Member not found");
      const data = await res.json();
      setDetail(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDeleteMember() {
    try {
      const res = await fetch(`/api/members/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to delete member");
      }
      router.push("/admin/members");
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    }
  }

  async function handleDeleteCharge(chargeId: string) {
    if (!confirm("Are you sure you want to delete this charge?")) return;
    try {
      const res = await fetch(`/api/members/${id}/charges?chargeId=${chargeId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete charge");
      load();
    } catch (err: any) {
      alert(err.message);
    }
  }

  async function handleToggleUnpayCharge(charge: AdditionalCharge) {
    if (!confirm(`Mark "${charge.item_name}" as unpaid?`)) return;
    try {
      const res = await fetch(`/api/members/${id}/charges`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          charge_id: charge.id,
          is_paid: false,
        }),
      });
      if (!res.ok) throw new Error("Failed to update charge");
      load();
    } catch (err: any) {
      alert(err.message);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 size={28} className="animate-spin text-stone-400" />
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="flex min-h-screen items-center justify-center text-stone-500">
        <div className="text-center">
          <AlertCircle size={36} className="mx-auto mb-3 text-red-400" />
          <p className="font-medium">{error || "Member not found"}</p>
          <Link
            href="/admin/members"
            className="mt-4 inline-block text-sm text-emerald-600 hover:underline"
          >
            ← Back to members
          </Link>
        </div>
      </div>
    );
  }

  const { member, periods, payments, freezes, additionalCharges = [] } = detail;
  const activePeriod = periods.find((p) => p.status === "active" || p.status === "frozen");
  const today = new Date().toISOString().split("T")[0];
  const daysLeft = activePeriod
    ? Math.round(
        (new Date(activePeriod.end_date).setHours(0, 0, 0, 0) -
          new Date(today).setHours(0, 0, 0, 0)) /
          86400000
      )
    : null;

  const totalPaid = payments.reduce((s, p) => s + Number(p.amount), 0);
  const balance = activePeriod
    ? Number(activePeriod.amount_due) - Number(activePeriod.amount_paid)
    : 0;

  const unpaidChargesTotal = additionalCharges
    .filter((c) => !c.is_paid)
    .reduce((sum, c) => sum + Number(c.price), 0);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-stone-200 bg-white px-6 py-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/members"
            className="rounded-lg p-1.5 text-stone-500 hover:bg-stone-100"
          >
            <ArrowLeft size={18} />
          </Link>
          <h1 className="text-lg font-semibold text-stone-800">{member.name}</h1>
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
              member.status === "active"
                ? "bg-emerald-50 text-emerald-700"
                : "bg-stone-100 text-stone-500"
            }`}
          >
            {member.status}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={load}
            className="rounded-lg p-2 text-stone-500 hover:bg-stone-100"
            title="Refresh"
          >
            <RefreshCw size={16} />
          </button>
          <NotificationBell />
        </div>
      </header>

      <main className="flex-1 p-6">
        <div className="mx-auto max-w-4xl space-y-6">
          {/* Top row: member info + quick stats */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* Member card */}
            <div className="sm:col-span-2 rounded-xl border border-stone-200 bg-white p-5">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-stone-100 text-stone-500">
                  <User size={24} />
                </div>
                <div className="flex-1 space-y-1.5 text-sm">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="text-lg font-semibold text-stone-800">{member.name}</h2>
                    <div className="flex items-center gap-1.5">
                      <button
                        id="edit-member-btn"
                        onClick={() => setShowEditModal(true)}
                        className="flex shrink-0 items-center gap-1.5 rounded-lg border border-stone-200 px-3 py-1.5 text-xs font-medium text-stone-600 transition hover:bg-stone-50"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        id="delete-member-btn"
                        onClick={() => setShowDeleteMemberModal(true)}
                        className="flex shrink-0 items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50"
                      >
                        <Trash2 size={13} /> Delete
                      </button>
                    </div>
                  </div>
                  <p className="flex items-center gap-1.5 text-stone-500">
                    <Phone size={13} /> {member.phone}
                  </p>
                  {member.email && (
                    <p className="flex items-center gap-1.5 text-stone-500">
                      <Mail size={13} /> {member.email}
                    </p>
                  )}
                  {member.gender && (
                    <p className="text-stone-400">{member.gender}</p>
                  )}
                  {member.emergency_contact && (
                    <p className="text-stone-400">
                      Emergency: {member.emergency_contact}
                    </p>
                  )}
                  {member.notes && (
                    <p className="mt-2 rounded-lg bg-stone-50 px-3 py-2 text-xs text-stone-500 italic">
                      {member.notes}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Quick stats */}
            <div className="rounded-xl border border-stone-200 bg-white p-5 space-y-4">
              <StatRow
                label="Days left"
                value={
                  daysLeft === null
                    ? "—"
                    : daysLeft < 0
                    ? `${Math.abs(daysLeft)}d overdue`
                    : `${daysLeft}d`
                }
                tone={
                  daysLeft === null
                    ? "neutral"
                    : daysLeft < 0
                    ? "danger"
                    : daysLeft <= 3
                    ? "warning"
                    : "positive"
                }
              />
              <StatRow
                label="Renews on"
                value={
                  activePeriod
                    ? new Date(activePeriod.end_date).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                    : "—"
                }
                tone="neutral"
              />
              <StatRow
                label="Plan balance due"
                value={balance > 0 ? `₹${balance.toLocaleString("en-IN")}` : "Paid"}
                tone={balance > 0 ? "danger" : "positive"}
              />
              {unpaidChargesTotal > 0 && (
                <StatRow
                  label="Unpaid store charges"
                  value={`₹${unpaidChargesTotal.toLocaleString("en-IN")}`}
                  tone="danger"
                />
              )}
            </div>
          </div>

          {/* Action buttons */}
          {activePeriod && (
            <div className="flex flex-wrap gap-2">
              <ActionBtn
                onClick={() =>
                  setActionModal({ type: "renew", periodId: activePeriod.id })
                }
                color="emerald"
              >
                🔄 Renew
              </ActionBtn>
              <ActionBtn
                onClick={() =>
                  setActionModal({ type: "freeze", periodId: activePeriod.id })
                }
                color="blue"
              >
                ❄️ Freeze
              </ActionBtn>
              <ActionBtn
                onClick={() =>
                  setActionModal({ type: "pay", periodId: activePeriod.id })
                }
                color="violet"
              >
                💰 Record payment
              </ActionBtn>
              <ActionBtn
                onClick={() =>
                  setActionModal({ type: "leave", periodId: activePeriod.id })
                }
                color="red"
              >
                🚪 Mark as left
              </ActionBtn>
            </div>
          )}

          {!activePeriod && (
            <div className="flex items-center gap-3">
              <p className="text-sm text-stone-500">Member has no active membership.</p>
              {periods.length > 0 && (
                <ActionBtn
                  onClick={() =>
                    setActionModal({ type: "rejoin", periodId: periods[0].id })
                  }
                  color="emerald"
                >
                  ↩️ Rejoin
                </ActionBtn>
              )}
            </div>
          )}

          {/* Additional Charges / Store Purchases Section */}
          <section className="rounded-xl border border-stone-200 bg-white p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag size={18} className="text-stone-600" />
                <h3 className="text-sm font-semibold text-stone-800">
                  Additional Charges (Store / Items)
                </h3>
              </div>
              <button
                onClick={() => setShowAddChargeModal(true)}
                className="flex items-center gap-1.5 rounded-lg bg-stone-800 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-stone-900"
              >
                <Plus size={14} /> Add charge
              </button>
            </div>

            {additionalCharges.length === 0 ? (
              <p className="text-xs text-stone-400 py-3">
                No additional charges recorded (e.g. water bottle, protein powder, etc.).
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-stone-100 bg-stone-50 text-left">
                      <th className="px-3 py-2 font-semibold text-stone-600">Item Name</th>
                      <th className="px-3 py-2 font-semibold text-stone-600">Bought Date</th>
                      <th className="px-3 py-2 font-semibold text-stone-600">Price (₹)</th>
                      <th className="px-3 py-2 font-semibold text-stone-600">Paid Status</th>
                      <th className="px-3 py-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-50">
                    {additionalCharges.map((charge) => (
                      <tr key={charge.id} className="hover:bg-stone-50 transition">
                        <td className="px-3 py-2.5 font-medium text-stone-800">
                          {charge.item_name}
                        </td>
                        <td className="px-3 py-2.5 text-stone-500">
                          {formatDate(charge.bought_date)}
                        </td>
                        <td className="px-3 py-2.5 font-semibold text-stone-800">
                          ₹{Number(charge.price).toLocaleString("en-IN")}
                        </td>
                        <td className="px-3 py-2.5">
                          {charge.is_paid ? (
                            <button
                              onClick={() => handleToggleUnpayCharge(charge)}
                              title="Click to mark as unpaid"
                              className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100 transition"
                            >
                              <CheckCircle2 size={12} />
                              Paid {charge.paid_date ? `(${formatDate(charge.paid_date)})` : ""}
                            </button>
                          ) : (
                            <button
                              onClick={() => setMarkPaidCharge(charge)}
                              title="Click to mark as paid"
                              className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700 hover:bg-red-100 transition"
                            >
                              <Clock size={12} />
                              Unpaid — Mark paid
                            </button>
                          )}
                        </td>
                        <td className="px-3 py-2.5 text-right">
                          <button
                            onClick={() => handleDeleteCharge(charge.id)}
                            className="rounded p-1 text-stone-400 hover:bg-red-50 hover:text-red-600 transition"
                            title="Delete charge"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Membership history */}
          <section>
            <h3 className="mb-3 text-sm font-semibold text-stone-700">
              Membership history
            </h3>
            {periods.length === 0 ? (
              <p className="text-sm text-stone-400">No membership periods yet.</p>
            ) : (
              <div className="space-y-3">
                {periods.map((p) => {
                  const periodPayments = payments.filter(
                    (pay) => pay.membership_period_id === p.id
                  );
                  const periodFreezes = freezes.filter(
                    (f) => f.membership_period_id === p.id
                  );
                  return (
                    <div
                      key={p.id}
                      className="rounded-xl border border-stone-200 bg-white p-5"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <PeriodStatusBadge status={p.status} />
                            <span className="text-sm font-medium text-stone-800">
                              {p.plans?.name ?? "Unknown plan"}
                            </span>
                          </div>
                          <p className="text-xs text-stone-400">
                            <CalendarDays size={11} className="inline mr-1" />
                            {formatDate(p.start_date)} → {formatDate(p.end_date)}
                            {p.planned_end_date !== p.end_date && (
                              <span className="ml-1 text-blue-500">
                                (extended from {formatDate(p.planned_end_date)})
                              </span>
                            )}
                          </p>
                          {p.left_on && (
                            <p className="text-xs text-amber-600">
                              Left on: {formatDate(p.left_on)}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-stone-800">
                            ₹{Number(p.amount_paid).toLocaleString("en-IN")}
                            <span className="font-normal text-stone-400">
                              {" "}
                              / ₹{Number(p.amount_due).toLocaleString("en-IN")}
                            </span>
                          </p>
                          {Number(p.amount_due) - Number(p.amount_paid) > 0 && (
                            <p className="text-xs text-red-500">
                              ₹
                              {(Number(p.amount_due) - Number(p.amount_paid)).toLocaleString(
                                "en-IN"
                              )}{" "}
                              due
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Payments sub-list */}
                      {periodPayments.length > 0 && (
                        <div className="mt-3 border-t border-stone-50 pt-3 space-y-1">
                          {periodPayments.map((pay) => (
                            <div
                              key={pay.id}
                              className="flex items-center justify-between text-xs text-stone-500"
                            >
                              <span className="flex items-center gap-1">
                                <IndianRupee size={10} />
                                Payment — {pay.method ?? "cash"}
                              </span>
                              <span>
                                ₹{Number(pay.amount).toLocaleString("en-IN")} on{" "}
                                {formatDate(pay.paid_on)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Freezes */}
                      {periodFreezes.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {periodFreezes.map((f) => (
                            <p key={f.id} className="text-xs text-blue-500">
                              ❄️ Frozen {formatDate(f.freeze_start)} →{" "}
                              {formatDate(f.freeze_end)} ({f.days}d
                              {f.reason ? ` — ${f.reason}` : ""})
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Modals */}
      {actionModal && (
        <ActionModal
          type={actionModal.type}
          periodId={actionModal.periodId}
          memberId={member.id}
          memberName={member.name}
          onClose={() => setActionModal(null)}
          onDone={() => {
            setActionModal(null);
            load();
          }}
        />
      )}

      {showEditModal && (
        <EditMemberModal
          member={member}
          onClose={() => setShowEditModal(false)}
          onSaved={() => {
            setShowEditModal(false);
            load();
          }}
        />
      )}

      {showAddChargeModal && (
        <AddChargeModal
          memberId={member.id}
          memberName={member.name}
          onClose={() => setShowAddChargeModal(false)}
          onAdded={() => {
            setShowAddChargeModal(false);
            load();
          }}
        />
      )}

      {markPaidCharge && (
        <MarkPaidModal
          charge={markPaidCharge}
          memberId={member.id}
          onClose={() => setMarkPaidCharge(null)}
          onDone={() => {
            setMarkPaidCharge(null);
            load();
          }}
        />
      )}

      {showDeleteMemberModal && (
        <DeleteMemberConfirmModal
          memberName={member.name}
          onClose={() => setShowDeleteMemberModal(false)}
          onConfirm={handleDeleteMember}
        />
      )}
    </div>
  );
}

function StatRow({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "neutral" | "positive" | "warning" | "danger";
}) {
  const toneClass: Record<string, string> = {
    neutral: "text-stone-800",
    positive: "text-emerald-600",
    warning: "text-amber-600",
    danger: "text-red-600",
  };
  return (
    <div>
      <p className="text-xs text-stone-400">{label}</p>
      <p className={`text-base font-semibold ${toneClass[tone]}`}>{value}</p>
    </div>
  );
}

function ActionBtn({
  children,
  onClick,
  color,
}: {
  children: React.ReactNode;
  onClick: () => void;
  color: "emerald" | "blue" | "violet" | "red";
}) {
  const map: Record<string, string> = {
    emerald: "border-emerald-200 text-emerald-700 hover:bg-emerald-50",
    blue: "border-blue-200 text-blue-700 hover:bg-blue-50",
    violet: "border-violet-200 text-violet-700 hover:bg-violet-50",
    red: "border-red-200 text-red-600 hover:bg-red-50",
  };
  return (
    <button
      onClick={onClick}
      className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${map[color]}`}
    >
      {children}
    </button>
  );
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
