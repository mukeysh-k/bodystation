"use client";

import { useEffect, useState } from "react";
import { X, Loader2 } from "lucide-react";

type Plan = { id: string; name: string; duration_days: number; price: number };

type ActionType = "renew" | "rejoin" | "leave" | "freeze" | "pay";

const ACTION_META: Record<
  ActionType,
  { title: string; description: string; submitLabel: string; submitColor: string }
> = {
  renew: {
    title: "🔄 Renew membership",
    description: "Select a plan and record payment. New period starts the day after the current end date.",
    submitLabel: "Confirm renewal",
    submitColor: "bg-emerald-600 hover:bg-emerald-700",
  },
  rejoin: {
    title: "↩️ Rejoin",
    description: "Member is coming back. A fresh period will start from the selected date.",
    submitLabel: "Confirm rejoin",
    submitColor: "bg-emerald-600 hover:bg-emerald-700",
  },
  leave: {
    title: "🚪 Mark as left",
    description: "This will close the current membership period as 'left early' and mark the member inactive.",
    submitLabel: "Confirm — mark as left",
    submitColor: "bg-red-600 hover:bg-red-700",
  },
  freeze: {
    title: "❄️ Freeze membership",
    description: "The due date will be extended by the number of frozen days. Member stays enrolled.",
    submitLabel: "Confirm freeze",
    submitColor: "bg-blue-600 hover:bg-blue-700",
  },
  pay: {
    title: "💰 Record payment",
    description: "Record a partial or full payment against the current membership period.",
    submitLabel: "Record payment",
    submitColor: "bg-violet-600 hover:bg-violet-700",
  },
};

export default function ActionModal({
  type,
  periodId,
  memberId,
  memberName,
  onClose,
  onDone,
}: {
  type: ActionType;
  periodId: string;
  memberId: string;
  memberName: string;
  onClose: () => void;
  onDone: () => void;
}) {
  const meta = ACTION_META[type];

  const [plans, setPlans] = useState<Plan[]>([]);
  const [planId, setPlanId] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [amountPaid, setAmountPaid] = useState("");
  const [leftOn, setLeftOn] = useState(new Date().toISOString().split("T")[0]);
  const [freezeStart, setFreezeStart] = useState(new Date().toISOString().split("T")[0]);
  const [freezeEnd, setFreezeEnd] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split("T")[0];
  });
  const [freezeReason, setFreezeReason] = useState("");
  const [payAmount, setPayAmount] = useState("");
  const [payMethod, setPayMethod] = useState("cash");
  const [payDate, setPayDate] = useState(new Date().toISOString().split("T")[0]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (type === "renew" || type === "rejoin") {
      fetch("/api/plans")
        .then((r) => r.json())
        .then((d) => {
          if (Array.isArray(d)) {
            setPlans(d);
            if (d.length > 0) setPlanId(d[0].id);
          }
        });
    }
  }, [type]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let body: Record<string, any> = {};

      if (type === "renew") {
        body = {
          action: "renew",
          currentPeriodId: periodId,
          planId,
          amountPaid: amountPaid ? Number(amountPaid) : 0,
        };
      } else if (type === "rejoin") {
        body = {
          action: "rejoin",
          memberId,
          planId,
          startDate,
          amountPaid: amountPaid ? Number(amountPaid) : 0,
          previousPeriodId: periodId,
        };
      } else if (type === "leave") {
        body = { action: "leave", periodId, leftOn };
      } else if (type === "freeze") {
        body = { action: "freeze", periodId, freezeStart, freezeEnd, reason: freezeReason };
      } else if (type === "pay") {
        body = {
          action: "pay",
          periodId,
          amount: Number(payAmount),
          method: payMethod,
          paidOn: payDate,
        };
      }

      const res = await fetch("/api/members/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");

      onDone();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const selectedPlan = plans.find((p) => p.id === planId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-100 px-6 py-4">
          <div>
            <h2 className="text-base font-semibold text-stone-800">{meta.title}</h2>
            <p className="text-xs text-stone-400">{memberName}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-sm text-stone-500">{meta.description}</p>

          {/* RENEW fields */}
          {(type === "renew" || type === "rejoin") && (
            <>
              <div>
                <Label>Plan</Label>
                <select
                  value={planId}
                  onChange={(e) => setPlanId(e.target.value)}
                  required
                  className={selectClass}
                >
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — {p.duration_days}d — ₹{p.price.toLocaleString("en-IN")}
                    </option>
                  ))}
                </select>
              </div>
              {type === "rejoin" && (
                <div>
                  <Label>Start date</Label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className={inputClass}
                  />
                </div>
              )}
              <div>
                <Label>
                  Amount paid (₹){" "}
                  {selectedPlan && (
                    <span className="text-stone-400">(plan price: ₹{selectedPlan.price.toLocaleString("en-IN")})</span>
                  )}
                </Label>
                <input
                  type="number"
                  min="0"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                  placeholder={selectedPlan ? String(selectedPlan.price) : "0"}
                  className={inputClass}
                />
              </div>
            </>
          )}

          {/* LEAVE fields */}
          {type === "leave" && (
            <div>
              <Label>Left on</Label>
              <input
                type="date"
                value={leftOn}
                onChange={(e) => setLeftOn(e.target.value)}
                className={inputClass}
              />
            </div>
          )}

          {/* FREEZE fields */}
          {type === "freeze" && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Freeze from</Label>
                  <input
                    type="date"
                    value={freezeStart}
                    onChange={(e) => setFreezeStart(e.target.value)}
                    required
                    className={inputClass}
                  />
                </div>
                <div>
                  <Label>Freeze until</Label>
                  <input
                    type="date"
                    value={freezeEnd}
                    onChange={(e) => setFreezeEnd(e.target.value)}
                    required
                    className={inputClass}
                  />
                </div>
              </div>
              <div>
                <Label>Reason (optional)</Label>
                <input
                  type="text"
                  value={freezeReason}
                  onChange={(e) => setFreezeReason(e.target.value)}
                  placeholder="Illness, travel…"
                  className={inputClass}
                />
              </div>
            </>
          )}

          {/* PAY fields */}
          {type === "pay" && (
            <>
              <div>
                <Label>Amount (₹) *</Label>
                <input
                  type="number"
                  min="1"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  required
                  placeholder="500"
                  className={inputClass}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Method</Label>
                  <select
                    value={payMethod}
                    onChange={(e) => setPayMethod(e.target.value)}
                    className={selectClass}
                  >
                    <option value="cash">Cash</option>
                    <option value="upi">UPI</option>
                    <option value="card">Card</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <Label>Date</Label>
                  <input
                    type="date"
                    value={payDate}
                    onChange={(e) => setPayDate(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>
            </>
          )}

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-600">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-stone-200 px-4 py-2 text-sm font-medium text-stone-600 hover:bg-stone-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white transition disabled:opacity-60 ${meta.submitColor}`}
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              {meta.submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-1 block text-xs font-medium text-stone-600">
      {children}
    </label>
  );
}

const inputClass =
  "w-full rounded-lg border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100";

const selectClass =
  "w-full rounded-lg border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100";
