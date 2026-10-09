-- Partial payments on an additional charge stay on the same row.
-- Run once in the Supabase SQL editor.
alter table additional_charges
  add column if not exists amount_paid numeric(10,2) not null default 0;

update additional_charges
  set amount_paid = price
  where is_paid = true
    and amount_paid = 0;

notify pgrst, 'reload schema';
