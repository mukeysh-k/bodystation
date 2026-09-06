# Gym Management System — Build Plan

## Status
- WhatsApp notifications: **deferred** (code exists in `lib/whatsapp.ts` + `app/api/cron/reminders/route.ts`, just not wired up — no env vars needed until you're ready)
- In-app dashboard notifications: **built** — see `components/NotificationBell.tsx`, `lib/notifications.ts`, `app/api/notifications/route.ts`, `app/admin/dashboard/page.tsx`

---

## Architecture
- **Frontend + Backend:** Your existing Next.js app (App Router), hosted on Vercel (free)
- **Database:** Supabase (Postgres, free tier)
- **Auth:** Single admin login (NextAuth credentials provider, or a simple custom session) — not yet built
- **Core logic:** Membership Periods model — every join/renew/rejoin creates a new period row, so "left before due date, rejoined 15 days later" is handled correctly
- **Notifications:** Computed live from the database on every dashboard load — no cron job needed for this. WhatsApp cron is pre-built for later.

---

## Full Feature List

### Phase 1 — Foundation
- [ ] Supabase project + schema (provided: `sql/schema.sql`)
- [ ] Admin login page (single admin, email + password)
- [ ] Protected `/admin` routes (redirect to login if not authenticated)
- [ ] Basic layout: sidebar/nav (Dashboard, Members, Plans, Settings)

### Phase 2 — Member Management
- [ ] Add member form (name, phone, email, gender, photo, emergency contact, notes)
- [ ] Join flow: pick a plan, set start date (defaults to today), record initial payment
- [ ] Member list page: search by name/phone, filter by status, sort by due date
- [ ] Member detail page: status, days left/overdue-by, full history timeline, payment history, edit info

### Phase 3 — Membership Actions
- [ ] **Renew** — on-time renewal (`lib/membership.ts` → `renewOnTime`)
- [ ] **Rejoin** — member left and is coming back; fresh period from rejoin date (`joinOrRejoin`)
- [ ] **Mark as Left** — closes current period as "left early" (`markLeftEarly`)
- [ ] **Freeze/Pause** — extends due date by N days (`freezeMembership`)
- [ ] **Record Payment** — partial or full payments (`recordPayment`)
- All wired to one endpoint: `app/api/members/actions/route.ts`

### Phase 4 — Dashboard & In-App Notifications ✅ built this round
- [x] Notification bell with badge count (`components/NotificationBell.tsx`)
- [x] Panel showing Overdue (red) and Due Soon (amber), sorted by urgency
- [x] Click a notification → jumps to that member's detail page
- [x] Dashboard summary cards: Active members, Due this week, Overdue, Revenue this month
- [x] Auto-refreshes every 5 minutes while dashboard is open
- [x] Frozen members past their extended due date auto-reactivate on load

**Still to do to make this live:**
- [ ] Build `/admin/members/[id]` page (the bell links there — currently a 404 until you build it)
- [ ] Wire `requireAdmin` auth check into `app/api/notifications/route.ts` (commented placeholder included)
- [ ] Confirm Tailwind CSS is set up in your project (the bell component uses Tailwind utility classes)

### Phase 5 — Plans & Settings
- [ ] Manage plans (add/edit/deactivate: name, duration in days, price)
- [ ] Change admin password
- [ ] Export members list to CSV

### Phase 5.5 — Backups & Data Export ✅ built this round
- [x] On-demand "Export all data" button — downloads a .zip of every table as CSV (`components/ExportDataButton.tsx`, `app/api/admin/export/route.ts`)
- [x] Automated weekly database backup via GitHub Actions — free, commits a full SQL dump to a private repo every Sunday (`.github/workflows/backup.yml`)

**To activate:**
- [ ] `npm install jszip`
- [ ] Add the Export button to your settings/admin page
- [ ] Copy your Supabase DB connection string into a `SUPABASE_DB_URL` GitHub secret (steps are in the comment at the top of `backup.yml`)
- [ ] Make sure the GitHub repo is **private** before enabling the workflow (it will contain real member data)

Why both: the button is for "I want a copy right now," the GitHub Action is the safety net so backups happen even if nobody remembers to click anything.

### Phase 6 — Later / Optional
- [ ] WhatsApp reminders — backend already built, just add API keys + approved templates, then restore the cron block in `vercel.json`
- [ ] Attendance check-in log
- [ ] Multiple branches
- [ ] Member self-view page (read-only link, no login)

---

## Suggested build order from here
1. Auth + protected admin layout
2. Plans page
3. Add member + Join flow
4. Member list + detail page (`/admin/members/[id]`) — needed for the notification bell links to work
5. Renew / Leave / Rejoin / Freeze actions
6. ~~Dashboard with in-app notifications~~ ✅ done
7. Payments + CSV export
8. WhatsApp, when ready
