"use client";

import { useState } from "react";
import { X, Loader2 } from "lucide-react";

export function AddChargeModal({
  memberId,
  memberName,
  onClose,
  onAdded,
}: {
  memberId: string;
  memberName: string;
  onClose: () => void;
  onAdded: () => void;
}) {
  const [itemName, setItemName] = useState("");
  const [price, setPrice] = useState("");
  const [boughtDate, setBoughtDate] = useState(new Date().toISOString().split("T")[0]);
  const [isPaid, setIsPaid] = useState(false);
  const [paidDate, setPaidDate] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`/api/members/${memberId}/charges`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          item_name: itemName,
          price: Number(price),
          bought_date: boughtDate,
          is_paid: isPaid,
          paid_date: isPaid ? paidDate : null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add charge");

      onAdded();
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
          <div>
            <h2 className="text-base font-semibold text-stone-800">Add additional charge</h2>
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
          <div>
            <label className="mb-1 block text-xs font-medium text-stone-600">Item name *</label>
            <input
              type="text"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="e.g. Water bottle 1L, Whey Protein 1kg, Energy Drink"
              required
              className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-stone-600">Price (₹) *</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="50"
                required
                className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-stone-600">Bought date</label>
              <input
                type="date"
                value={boughtDate}
                onChange={(e) => setBoughtDate(e.target.value)}
                required
                className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>
          </div>

          <div className="rounded-lg border border-stone-200 bg-stone-50 p-3 space-y-2">
            <label className="flex items-center gap-2 text-xs font-medium text-stone-700 cursor-pointer">
              <input
                type="checkbox"
                checked={isPaid}
                onChange={(e) => setIsPaid(e.target.checked)}
                className="h-4 w-4 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
              />
              Mark as paid immediately
            </label>

            {isPaid && (
              <div>
                <label className="mb-1 block text-xs font-medium text-stone-600">Paid date</label>
                <input
                  type="date"
                  value={paidDate}
                  onChange={(e) => setPaidDate(e.target.value)}
                  required
                  className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 outline-none focus:border-emerald-500"
                />
              </div>
            )}
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-600">{error}</p>
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
              Save charge
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function MarkPaidModal({
  charge,
  memberId,
  onClose,
  onDone,
}: {
  charge: { id: string; item_name: string; price: number };
  memberId: string;
  onClose: () => void;
  onDone: () => void;
}) {
  const [paidDate, setPaidDate] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`/api/members/${memberId}/charges`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          charge_id: charge.id,
          is_paid: true,
          paid_date: paidDate,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update charge");

      onDone();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-stone-200 bg-white shadow-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-stone-800">Record payment</h3>
          <button onClick={onClose} className="rounded-lg p-1 text-stone-400 hover:bg-stone-100">
            <X size={18} />
          </button>
        </div>

        <p className="text-sm text-stone-600">
          Marking <span className="font-semibold text-stone-800">{charge.item_name}</span> (₹
          {Number(charge.price).toLocaleString("en-IN")}) as paid.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-stone-600">Paid date *</label>
            <input
              type="date"
              value={paidDate}
              onChange={(e) => setPaidDate(e.target.value)}
              required
              className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-900 outline-none focus:border-emerald-500"
            />
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-stone-200 px-3.5 py-2 text-xs font-medium text-stone-600 hover:bg-stone-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              {loading && <Loader2 size={12} className="animate-spin" />}
              Confirm paid
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function DeleteMemberConfirmModal({
  memberName,
  onClose,
  onConfirm,
}: {
  memberName: string;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    setLoading(true);
    await onConfirm();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-stone-200 bg-white p-6 shadow-2xl space-y-4">
        <h3 className="text-base font-semibold text-red-600">Delete member</h3>
        <p className="text-sm text-stone-600">
          Are you sure you want to permanently delete{" "}
          <span className="font-semibold text-stone-900">{memberName}</span>?
        </p>
        <p className="text-xs text-stone-400">
          This will delete their profile, active membership periods, payment history, and additional charges. This action cannot be undone.
        </p>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-lg border border-stone-200 px-3.5 py-2 text-xs font-medium text-stone-600 hover:bg-stone-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-60"
          >
            {loading && <Loader2 size={12} className="animate-spin" />}
            Delete permanently
          </button>
        </div>
      </div>
    </div>
  );
}
