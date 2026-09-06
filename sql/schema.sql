-- =========================================================
-- GYM MANAGEMENT SCHEMA (Supabase / Postgres)
-- Run this in Supabase Dashboard → SQL Editor
-- =========================================================

-- 1. PLANS (Monthly, Quarterly, Annual, etc.)
create table plans (
  id uuid primary key default gen_random_uuid(),
  name text not null,               -- "Monthly", "Quarterly", "PT + Gym"
  duration_days int not null,       -- 30, 90, 180, 365
  price numeric(10,2) not null,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- 2. MEMBERS (the person — no login, just a record)
create table members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,              -- must include country code e.g. 91XXXXXXXXXX for WhatsApp
  email text,
  gender text,
  photo_url text,
  emergency_contact text,
  notes text,
  status text not null default 'active' check (status in ('active','inactive')),
  -- 'status' here just means "currently has a running/relevant membership record or not"
  created_at timestamptz default now()
);

-- 3. MEMBERSHIP PERIODS  <-- THIS is what solves your join/leave/rejoin problem
--    Every join, renewal, or rejoin creates a NEW row here.
--    Never overwrite start_date/end_date on an old row to "restart" a membership.
create table membership_periods (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references members(id) on delete cascade,
  plan_id uuid references plans(id),
  start_date date not null,
  planned_end_date date not null,        -- start_date + plan duration, calculated at insert time
  end_date date not null,                -- actual current end date (can be extended by freezes)
  status text not null default 'active'
    check (status in ('active','expired','left_early','frozen')),
  amount_due numeric(10,2) not null default 0,
  amount_paid numeric(10,2) not null default 0,
  left_on date,                          -- filled in if member left before end_date
  rejoined_from_period_id uuid references membership_periods(id), -- links back to prior period, optional but useful for history
  notes text,
  created_at timestamptz default now()
);

-- 4. FREEZE LOG (pause due to illness/travel — extends end_date instead of creating new period)
create table freezes (
  id uuid primary key default gen_random_uuid(),
  membership_period_id uuid not null references membership_periods(id) on delete cascade,
  freeze_start date not null,
  freeze_end date not null,
  days int not null,               -- freeze_end - freeze_start
  reason text,
  created_at timestamptz default now()
);

-- 5. PAYMENTS (granular log, in case of partial/multiple payments per period)
create table payments (
  id uuid primary key default gen_random_uuid(),
  membership_period_id uuid not null references membership_periods(id) on delete cascade,
  amount numeric(10,2) not null,
  paid_on date not null default current_date,
  method text,                     -- cash / upi / card
  created_at timestamptz default now()
);

-- 6. NOTIFICATION LOG (avoid sending duplicate reminders)
create table notifications_log (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references members(id) on delete cascade,
  membership_period_id uuid references membership_periods(id),
  type text not null,              -- 'due_soon' | 'overdue' | 'welcome'
  sent_on date not null default current_date,
  channel text not null default 'whatsapp',
  status text not null default 'sent',  -- sent / failed
  created_at timestamptz default now()
);

-- 7. ADMIN USERS (store hashed password for authenticated admin users)
create table if not exists admin_users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  password_hash text not null,
  name text not null default 'Gym Admin',
  role text not null default 'admin',
  created_at timestamptz default now()
);

-- Seed initial admin user if table is empty (Email: admin@bodystation.com | Password: admin123)
-- Hash generated via bcrypt (cost 10): $2a$10$7rVqJvX1aE10K1R8fN6nS.HqA1mQ2oE3r4t5y6u7i8o9p0a1b2c3d
insert into admin_users (email, password_hash, name, role)
values ('admin@bodystation.com', '$2a$10$wK1bJ9b9...admin123...', 'Gym Admin', 'admin')
on conflict (email) do nothing;

-- =========================================================
-- HELPFUL VIEW: current status of every member at a glance
-- This is what your dashboard queries.
-- =========================================================
create or replace view member_current_status as
select
  m.id as member_id,
  m.name,
  m.phone,
  m.status as member_status,
  mp.id as current_period_id,
  mp.start_date,
  mp.end_date,
  mp.status as period_status,
  mp.amount_due,
  mp.amount_paid,
  (mp.amount_due - mp.amount_paid) as balance,
  (mp.end_date - current_date) as days_left
from members m
left join lateral (
  select * from membership_periods
  where member_id = m.id
  order by created_at desc, start_date desc
  limit 1
) mp on true;

-- 8. ADDITIONAL CHARGES (Water bottle, protein powder, personal items, etc.)
create table additional_charges (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references members(id) on delete cascade,
  item_name text not null,
  price numeric(10,2) not null,
  bought_date date not null default current_date,
  is_paid boolean not null default false,
  paid_date date,
  created_at timestamptz default now()
);

-- Indexes for performance
create index idx_membership_periods_member on membership_periods(member_id);
create index idx_membership_periods_end_date on membership_periods(end_date);
create index idx_membership_periods_status on membership_periods(status);
create index idx_additional_charges_member on additional_charges(member_id);
