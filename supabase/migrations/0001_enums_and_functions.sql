-- ============================================================================
-- Avon Pharmo Chem — Supabase migration 0001
-- Enums + shared helper functions (triggers, admin check).
--
-- NOTHING IS LIVE until you apply this to your Supabase project
-- (supabase db push, or paste into the SQL editor). Apply 0001 → 0002 → 0003
-- in order.
-- ============================================================================

-- ── Enums ───────────────────────────────────────────────────────────────────
-- Guarded with DO blocks so this migration is safe to re-run.
do $$ begin
  create type product_status as enum ('active', 'inactive');
exception when duplicate_object then null; end $$;

do $$ begin
  create type quote_status as enum ('New', 'In Review', 'Quotation Sent', 'Follow Up', 'Closed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type logistics_type as enum ('Pickup', 'Courier', 'Avon Delivery');
exception when duplicate_object then null; end $$;

do $$ begin
  create type user_role as enum ('customer', 'admin');
exception when duplicate_object then null; end $$;

-- ── updated_at maintenance ──────────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ── Admin check ─────────────────────────────────────────────────────────────
-- SECURITY DEFINER so it can read public.profiles without tripping the RLS
-- policies that are themselves defined in terms of is_admin() (avoids
-- infinite recursion on the profiles table).
-- Written in plpgsql (not sql) so its body is NOT validated against
-- public.profiles at creation time — this migration runs before 0002 creates
-- that table. The reference resolves at first call, by which point it exists.
create or replace function public.is_admin()
returns boolean
language plpgsql
security definer
set search_path = public
stable
as $$
begin
  return exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  );
end;
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated, anon;

-- ── New-user handler ────────────────────────────────────────────────────────
-- Creates a profile row whenever a Supabase auth user is created (signup or
-- import). Role is ALWAYS forced to 'customer' here — privilege escalation is
-- impossible via this path; admins are promoted by a service_role statement.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'display_name', new.raw_user_meta_data ->> 'name', ''),
    'customer'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
