"use client";

import { useEffect, useState } from "react";
import { X, Loader2 } from "lucide-react";

type Plan = { id: string; name: string; duration_days: number; price: number };

export default function AddMemberModal({
  onClose,
  onAdded,
}: {
  onClose: () => void;
  onAdded: () => void;
}) {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [step, setStep] = useState<"info" | "join">("info");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Step 1 fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [notes, setNotes] = useState("");

  // Step 2 fields
  const [planId, setPlanId] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [amountPaid, setAmountPaid] = useState("");
  const [createdMemberId, setCreatedMemberId] = useState("");

  useEffect(() => {
    fetch("/api/plans")
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d)) {
          setPlans(d);
          if (d.length > 0) setPlanId(d[0].id);
        }
      });
  }, []);

  async function handleCreateMember(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          email,
          gender,
          emergency_contact: emergencyContact,
          notes,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCreatedMemberId(data.id);
      setStep("join");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/members/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "join",
          memberId: createdMemberId,
          planId,
          startDate,
          amountPaid: amountPaid ? Number(amountPaid) : 0,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onAdded();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSkipJoin() {
    onAdded();
  }

  const selectedPlan = plans.find((p) => p.id === planId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-stone-200 bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-100 px-6 py-4">
          <div>
            <h2 className="text-base font-semibold text-stone-800">
              {step === "info" ? "Add new member" : "Set up membership"}
            </h2>
            <p className="text-xs text-stone-400">
              Step {step === "info" ? 1 : 2} of 2
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-600"
          >
            <X size={18} />
          </button>
        </div>

        {/* Step 1 — Member info */}
        {step === "info" && (
          <form onSubmit={handleCreateMember} className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Full name *</Label>
                <Input
                  value={name}
                  onChange={setName}
                  placeholder="Rahul Sharma"
                  required
                />
              </div>
              <div>
                <Label>Phone *</Label>
                <Input
                  value={phone}
                  onChange={setPhone}
                  placeholder="919876543210"
                  required
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  value={email}
                  onChange={setEmail}
                  placeholder="rahul@email.com"
                  type="email"
                />
              </div>
              <div>
                <Label>Gender</Label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                >
                  <option value="">—</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <Label>Emergency contact</Label>
                <Input
                  value={emergencyContact}
                  onChange={setEmergencyContact}
                  placeholder="Name / phone"
                />
              </div>
              <div className="col-span-2">
                <Label>Notes</Label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 resize-none"
                  placeholder="Any notes about this member…"
                />
              </div>
            </div>

            {error && <ErrorMsg>{error}</ErrorMsg>}

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-stone-200 px-4 py-2 text-sm font-medium text-stone-600 hover:bg-stone-50"
              >
                Cancel
              </button>
              <SubmitBtn loading={loading}>Next: Set up plan →</SubmitBtn>
            </div>
          </form>
        )}

        {/* Step 2 — Membership / Join */}
        {step === "join" && (
          <form onSubmit={handleJoin} className="p-6 space-y-4">
            <p className="text-sm text-stone-500">
              <span className="font-medium text-stone-800">{name}</span> has been
              added. Now select a plan and record the initial payment.
            </p>

            <div>
              <Label>Membership plan *</Label>
              <select
                value={planId}
                onChange={(e) => setPlanId(e.target.value)}
                required
                className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              >
                {plans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — {p.duration_days} days — ₹{p.price.toLocaleString("en-IN")}
                  </option>
                ))}
              </select>
              {selectedPlan && (
                <p className="mt-1 text-xs text-stone-400">
                  Plan price: ₹{selectedPlan.price.toLocaleString("en-IN")}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start date</Label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>
              <div>
                <Label>Amount paid (₹)</Label>
                <Input
                  value={amountPaid}
                  onChange={setAmountPaid}
                  placeholder={selectedPlan ? String(selectedPlan.price) : "0"}
                  type="number"
                  min="0"
                />
              </div>
            </div>

            {error && <ErrorMsg>{error}</ErrorMsg>}

            <div className="flex justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={handleSkipJoin}
                className="rounded-lg border border-stone-200 px-4 py-2 text-sm font-medium text-stone-600 hover:bg-stone-50"
              >
                Skip for now
              </button>
              <SubmitBtn loading={loading}>Confirm & save</SubmitBtn>
            </div>
          </form>
        )}
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

function Input({
  value,
  onChange,
  placeholder,
  required,
  type = "text",
  min,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  type?: string;
  min?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      min={min}
      className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
    />
  );
}

function ErrorMsg({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-600">
      {children}
    </p>
  );
}

function SubmitBtn({
  loading,
  children,
}: {
  loading: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
    >
      {loading && <Loader2 size={14} className="animate-spin" />}
      {children}
    </button>
  );
}
