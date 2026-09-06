// Save this file to: components/NotificationBell.tsx
// Assumes Tailwind CSS is already set up in the project (standard for Next.js).
"use client";

import { useEffect, useRef, useState } from "react";

type NotificationItem = {
  memberId: string;
  periodId: string;
  name: string;
  phone: string;
  endDate: string;
  daysLeft: number;
  type: "due_soon" | "overdue";
};

type NotificationData = {
  dueSoon: NotificationItem[];
  overdue: NotificationItem[];
  reactivatedCount: number;
};

export default function NotificationBell() {
  const [data, setData] = useState<NotificationData | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const panelRef = useRef<HTMLDivElement>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/notifications");
      const json = await res.json();
      setData(json);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // refresh every 5 minutes while the dashboard is open
    const interval = setInterval(load, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const totalCount = (data?.overdue.length ?? 0) + (data?.dueSoon.length ?? 0);

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={`Notifications, ${totalCount} pending`}
        className="relative flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-600 transition hover:bg-stone-50"
      >
        <BellIcon />
        {totalCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-xs font-semibold text-white">
            {totalCount > 99 ? "99+" : totalCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-96 max-w-[90vw] rounded-xl border border-stone-200 bg-white shadow-lg">
          <div className="flex items-center justify-between border-b border-stone-100 px-4 py-3">
            <h3 className="text-sm font-semibold text-stone-800">Payment reminders</h3>
            <button
              onClick={load}
              className="text-xs text-stone-400 hover:text-stone-700"
            >
              Refresh
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading && (
              <p className="px-4 py-6 text-center text-sm text-stone-400">Loading…</p>
            )}

            {!loading && totalCount === 0 && (
              <p className="px-4 py-6 text-center text-sm text-stone-400">
                Nobody&apos;s due right now. All caught up.
              </p>
            )}

            {!loading && data && data.overdue.length > 0 && (
              <Section title={`Overdue (${data.overdue.length})`}>
                {data.overdue.map((item) => (
                  <NotificationRow key={item.periodId} item={item} />
                ))}
              </Section>
            )}

            {!loading && data && data.dueSoon.length > 0 && (
              <Section title={`Due soon (${data.dueSoon.length})`}>
                {data.dueSoon.map((item) => (
                  <NotificationRow key={item.periodId} item={item} />
                ))}
              </Section>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="px-4 pt-3 text-xs font-medium text-stone-400">{title}</p>
      <div className="divide-y divide-stone-50">{children}</div>
    </div>
  );
}

function NotificationRow({ item }: { item: NotificationItem }) {
  const isOverdue = item.type === "overdue";
  const label = isOverdue
    ? `${Math.abs(item.daysLeft)} day${Math.abs(item.daysLeft) === 1 ? "" : "s"} overdue`
    : item.daysLeft === 0
    ? "Due today"
    : `Due in ${item.daysLeft} day${item.daysLeft === 1 ? "" : "s"}`;

  return (
    <a
      href={`/admin/members/${item.memberId}`}
      className="flex items-center gap-3 px-4 py-3 transition hover:bg-stone-50"
    >
      <span
        className={`h-2 w-2 shrink-0 rounded-full ${
          isOverdue ? "bg-red-600" : "bg-amber-500"
        }`}
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-stone-800">{item.name}</p>
        <p className="text-xs text-stone-400">{item.phone}</p>
      </div>
      <span
        className={`shrink-0 text-xs font-medium ${
          isOverdue ? "text-red-600" : "text-amber-600"
        }`}
      >
        {label}
      </span>
    </a>
  );
}

function BellIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}
