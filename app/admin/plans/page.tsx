"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Plus,
  Pencil,
  Power,
  PowerOff,
  Loader2,
  Dumbbell,
  X,
} from "lucide-react";
import NotificationBell from "@/components/NotificationBell";

type Plan = {
  id: string;
  name: string;
  duration_days: number;
  price: number;
  is_active: boolean;
  created_at: string;
};

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [modal, setModal] = useState<{ plan?: Plan } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    // Fetch all plans including inactive for management
    const res = await fetch("/api/plans/all");
    const data = await res.json();
    setPlans(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function toggleActive(plan: Plan) {
    await fetch("/api/plans", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: plan.id, is_active: !plan.is_active }),
    });
    load();
  }

  const displayed = showAll ? plans : plans.filter((p) => p.is_active);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-stone-200 bg-white px-6 py-4">
        <h1 className="text-lg font-semibold text-stone-800">Plans</h1>
        <div className="flex items-center gap-3">
          <NotificationBell />
          <button
            id="add-plan-btn"
            onClick={() => setModal({})}
            className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            <Plus size={16} />
            Add plan
          </button>
        </div>
      </header>

      <main className="flex-1 p-6">
        <div className="mx-auto max-w-3xl">
          {/* Toggle inactive */}
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-stone-500">
              {displayed.length} plan{displayed.length !== 1 ? "s" : ""}
              {!showAll && plans.some((p) => !p.is_active) && (
                <span className="ml-1 text-stone-400">
                  ({plans.filter((p) => !p.is_active).length} inactive hidden)
                </span>
              )}
            </p>
            <button
              onClick={() => setShowAll((v) => !v)}
              className="text-xs text-stone-400 hover:text-stone-700 underline"
            >
              {showAll ? "Hide inactive" : "Show all incl. inactive"}
            </button>
          </div>

          {/* Plans list */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={24} className="animate-spin text-stone-400" />
            </div>
          ) : displayed.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-stone-300 py-20 text-stone-400">
              <Dumbbell size={40} className="mb-3 opacity-40" />
              <p className="text-sm">No plans yet.</p>
              <button
                onClick={() => setModal({})}
                className="mt-3 text-sm text-emerald-600 hover:underline"
              >
                Create your first plan
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {displayed.map((plan) => (
                <div
                  key={plan.id}
                  className={`flex items-center justify-between rounded-xl border bg-white px-5 py-4 transition ${
                    plan.is_active
                      ? "border-stone-200"
                      : "border-stone-100 opacity-50"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full ${
                        plan.is_active ? "bg-emerald-50" : "bg-stone-100"
                      }`}
                    >
                      <Dumbbell
                        size={18}
                        className={
                          plan.is_active ? "text-emerald-600" : "text-stone-400"
                        }
                      />
                    </div>
                    <div>
                      <p className="font-semibold text-stone-800">{plan.name}</p>
                      <p className="text-sm text-stone-400">
                        {plan.duration_days} days
                        {plan.is_active ? "" : " · Inactive"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <p className="text-lg font-bold text-stone-800">
                      ₹{Number(plan.price).toLocaleString("en-IN")}
                    </p>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setModal({ plan })}
                        title="Edit"
                        className="rounded-lg p-2 text-stone-400 transition hover:bg-stone-100 hover:text-stone-700"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => toggleActive(plan)}
                        title={plan.is_active ? "Deactivate" : "Activate"}
                        className={`rounded-lg p-2 transition ${
                          plan.is_active
                            ? "text-stone-400 hover:bg-red-50 hover:text-red-600"
                            : "text-stone-400 hover:bg-emerald-50 hover:text-emerald-600"
                        }`}
                      >
                        {plan.is_active ? (
                          <PowerOff size={15} />
                        ) : (
                          <Power size={15} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Info note */}
          <p className="mt-6 text-xs text-stone-400">
            Deactivating a plan hides it from the join/renew flow but keeps
            existing memberships on that plan intact.
          </p>
        </div>
      </main>

      {modal !== null && (
        <PlanModal
          plan={modal.plan}
          onClose={() => setModal(null)}
          onSaved={() => {
            setModal(null);
            load();
          }}
        />
      )}
    </div>
  );
}

function PlanModal({
  plan,
  onClose,
  onSaved,
}: {
  plan?: Plan;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!plan;
  const [name, setName] = useState(plan?.name ?? "");
  const [durationDays, setDurationDays] = useState(
    plan ? String(plan.duration_days) : ""
  );
  const [price, setPrice] = useState(plan ? String(plan.price) : "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Quick-fill presets
  const presets = [
    { label: "1 month", days: 30 },
    { label: "3 months", days: 90 },
    { label: "6 months", days: 180 },
    { label: "1 year", days: 365 },
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const payload = {
        name,
        duration_days: Number(durationDays),
        price: Number(price),
      };

      let res: Response;
      if (isEdit) {
        res = await fetch("/api/plans", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: plan!.id, ...payload }),
        });
      } else {
        res = await fetch("/api/plans", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onSaved();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-stone-100 px-6 py-4">
          <h2 className="text-base font-semibold text-stone-800">
            {isEdit ? "Edit plan" : "Add plan"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-stone-600">
              Plan name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Monthly, Quarterly, PT + Gym…"
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-stone-600">
              Duration *
            </label>
            {/* Presets */}
            <div className="mb-2 flex gap-2 flex-wrap">
              {presets.map((p) => (
                <button
                  key={p.days}
                  type="button"
                  onClick={() => setDurationDays(String(p.days))}
                  className={`rounded-md border px-3 py-1 text-xs font-medium transition ${
                    durationDays === String(p.days)
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                      : "border-stone-200 text-stone-600 hover:bg-stone-50"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                value={durationDays}
                onChange={(e) => setDurationDays(e.target.value)}
                required
                placeholder="30"
                className={inputClass}
              />
              <span className="shrink-0 text-sm text-stone-400">days</span>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-stone-600">
              Price (₹) *
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              placeholder="1000"
              className={inputClass}
            />
          </div>

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
              className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              {isEdit ? "Save changes" : "Create plan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const inputClass =
  "w-full rounded-lg border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100";
