"use client";

import { useRef, useState } from "react";
import { X, Loader2, Trash2 } from "lucide-react";
import { indiaDate } from "@/lib/dates";
import { chargeAmounts } from "@/lib/charges";

type ChargePayment = {
  id: string;
  amount: number;
  paid_on: string;
};

function rupee(value: number) {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
}

function formatPayDate(value: string) {
  const [year, month, day] = value.slice(0, 10).split("-");
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthIndex = Number(month) - 1;
  if (!year || !day || monthIndex < 0 || monthIndex > 11) return value;
  return `${Number(day)} ${months[monthIndex]} ${year}`;
}

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
  const [boughtDate, setBoughtDate] = useState(indiaDate);
  const [amountPaid, setAmountPaid] = useState("");
  const [paidDate, setPaidDate] = useState(indiaDate);
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
          amount_paid: amountPaid ? Number(amountPaid) : 0,
          paid_date: amountPaid && Number(amountPaid) > 0 ? paidDate : null,
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-stone-600">Amount paid now (₹)</label>
              <p className="mb-1 text-[11px] text-stone-400">Leave blank if nothing is paid yet. The rest can be recorded later.</p>
              <input
                type="number"
                min="0"
                step="0.01"
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
                placeholder="0"
                className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>
            {Number(amountPaid) > 0 && (
              <div>
                <label className="mb-1 block text-xs font-medium text-stone-600">Paid date</label>
                <input
                  type="date"
                  value={paidDate}
                  onChange={(e) => setPaidDate(e.target.value)}
                  required
                  className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-900 outline-none focus:border-emerald-500"
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

export function UpdateChargeModal({
  charge,
  memberId,
  onClose,
  onUpdated,
}: {
  charge: {
    id: string;
    item_name: string;
    price: number;
    bought_date: string;
    amount_paid?: number | null;
    is_paid: boolean;
    paid_date?: string | null;
    payments?: ChargePayment[];
  };
  memberId: string;
  onClose: () => void;
  onUpdated: (charge: any) => void;
}) {
  const starting = chargeAmounts(charge);
  const [itemName, setItemName] = useState(charge.item_name);
  const [price, setPrice] = useState(String(starting.total));
  const [boughtDate, setBoughtDate] = useState(charge.bought_date?.slice(0, 10) || indiaDate());
  const [payments, setPayments] = useState<ChargePayment[]>(charge.payments ?? []);
  const [payAmount, setPayAmount] = useState("");
  const [payDate, setPayDate] = useState(indiaDate());
  const [loading, setLoading] = useState(false);
  const [removingId, setRemovingId] = useState("");
  const [error, setError] = useState("");
  const saving = useRef(false);

  const total = Number(price || 0);
  const recorded = payments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
  const draft = payAmount === "" ? 0 : Number(payAmount);
  const pending = Number.isFinite(total) ? Math.max(0, total - recorded) : 0;
  const pendingAfter =
    Number.isFinite(total) && Number.isFinite(draft) ? Math.max(0, total - recorded - draft) : pending;

  function applyCharge(data: { payments?: ChargePayment[] }, clearPayment: boolean) {
    setPayments(data.payments ?? []);
    if (clearPayment) setPayAmount("");
    onUpdated(data);
  }

  async function save(payment: { amount: number; paid_on: string } | null) {
    if (saving.current) return;
    setError("");
    if (!Number.isFinite(total) || total < 0) {
      setError("Total amount must be zero or more.");
      return;
    }
    if (payment && payment.amount > pending + 0.001) {
      setError(`This payment is more than the pending ${rupee(pending)}.`);
      return;
    }
    saving.current = true;
    setLoading(true);
    try {
      const res = await fetch(`/api/members/${memberId}/charges`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          charge_id: charge.id,
          item_name: itemName,
          price: total,
          bought_date: boughtDate,
          payment,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update charge");
      applyCharge(data, payment !== null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      saving.current = false;
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (payAmount !== "" && Number(payAmount) > 0) {
      await save({ amount: Number(payAmount), paid_on: payDate });
      return;
    }
    await save(null);
  }

  async function removePayment(payment: ChargePayment) {
    if (!confirm(`Remove the ${rupee(Number(payment.amount))} payment from ${formatPayDate(payment.paid_on)}?`)) {
      return;
    }
    setError("");
    setRemovingId(payment.id);
    try {
      const res = await fetch(
        `/api/members/${memberId}/charges?paymentId=${encodeURIComponent(payment.id)}`,
        { method: "DELETE" }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to remove payment");
      applyCharge(data, false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setRemovingId("");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-stone-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-stone-100 px-6 py-4">
          <h3 className="text-base font-semibold text-stone-800">Update charge</h3>
          <button onClick={onClose} className="rounded-lg p-1 text-stone-400 hover:bg-stone-100">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <div>
            <label className="mb-1 block text-xs font-medium text-stone-600">Item name</label>
            <input
              type="text"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              required
              className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-900 outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-stone-600">Total amount (₹)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-900 outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-stone-600">Bought date</label>
              <input
                type="date"
                value={boughtDate}
                onChange={(e) => setBoughtDate(e.target.value)}
                required
                className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-900 outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="rounded-lg border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm">
            <p className="flex justify-between text-stone-600">
              <span>Total</span>
              <span>{rupee(total)}</span>
            </p>
            <p className="mt-1 flex justify-between text-emerald-700">
              <span>Paid</span>
              <span>{rupee(recorded)}</span>
            </p>
            {draft > 0 && (
              <p className="mt-1 flex justify-between text-emerald-700">
                <span>This payment</span>
                <span>{rupee(draft)}</span>
              </p>
            )}
            <p className="mt-1 flex justify-between font-semibold text-red-600">
              <span>Pending</span>
              <span>{rupee(draft > 0 ? pendingAfter : pending)}</span>
            </p>
          </div>

          <div>
            <p className="mb-2 text-xs font-medium text-stone-600">Payment history</p>
            {payments.length === 0 ? (
              <p className="rounded-lg border border-dashed border-stone-200 px-3 py-2.5 text-xs text-stone-400">
                No payments yet.
              </p>
            ) : (
              <ul className="divide-y divide-stone-100 rounded-lg border border-stone-200">
                {payments.map((payment) => (
                  <li key={payment.id} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
                    <span className="text-stone-500">{formatPayDate(payment.paid_on)}</span>
                    <span className="font-medium text-stone-800">{rupee(Number(payment.amount))}</span>
                    <button
                      type="button"
                      onClick={() => removePayment(payment)}
                      disabled={loading || removingId === payment.id}
                      className="rounded p-1 text-stone-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                      title="Remove payment"
                    >
                      {removingId === payment.id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Trash2 size={14} />
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {pending > 0 && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-stone-600">Add payment (₹)</label>
                <input
                  type="number"
                  min="0"
                  max={pending}
                  step="0.01"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  placeholder="0"
                  className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-900 outline-none focus:border-emerald-500"
                />
                <p className="mt-1 text-[11px] text-stone-400">
                  Adds this amount. Earlier payments stay in the history.
                </p>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-stone-600">Payment date</label>
                <input
                  type="date"
                  value={payDate}
                  max={indiaDate()}
                  onChange={(e) => setPayDate(e.target.value)}
                  className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-900 outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          )}

          {error && <p className="text-xs text-red-600">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-stone-200 px-3.5 py-2 text-xs font-medium text-stone-600 hover:bg-stone-50"
            >
              {payAmount ? "Close" : "Cancel"}
            </button>
            <button
              type="button"
              onClick={() => save(null)}
              disabled={loading}
              className="rounded-lg border border-stone-200 px-3.5 py-2 text-xs font-medium text-stone-700 hover:bg-stone-50 disabled:opacity-60"
            >
              Save details
            </button>
            {pending > 0 && (
              <button
                type="submit"
                disabled={loading || !(Number(payAmount) > 0)}
                className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
              >
                {loading && <Loader2 size={12} className="animate-spin" />}
                Record payment
              </button>
            )}
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
