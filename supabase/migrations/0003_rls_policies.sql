-- ============================================================================
-- Avon Pharmo Chem — Supabase migration 0003
-- Row Level Security. This is where the app's real security now lives.
-- Apply AFTER 0002.
--
-- Model (mirrors the prior Firestore-rules audit):
--   * default-deny (RLS on, no policy = no access)
--   * public read on catalog (products/categories/brands/industries/settings)
--   * customers read/write ONLY their own quotes + their own profile row
--   * inquiries: create-only for public, read admin-only
--   * catalog writes: admin only
--   * BLOCK self-privilege-escalation on profiles.role
-- ============================================================================

-- Enable RLS everywhere first (default-deny until a policy grants access).
alter table public.brands             enable row level security;
alter table public.categories         enable row level security;
alter table public.industries         enable row level security;
alter table public.products           enable row level security;
alter table public.product_industries enable row level security;
alter table public.profiles           enable row level security;
alter table public.quotes             enable row level security;
alter table public.quote_items        enable row level security;
alter table public.inquiries          enable row level security;
alter table public.site_settings      enable row level security;

-- ── Catalog: public read, admin write ───────────────────────────────────────
-- brands
drop policy if exists brands_public_read on public.brands;
create policy brands_public_read on public.brands for select using (true);
drop policy if exists brands_admin_write on public.brands;
create policy brands_admin_write on public.brands for all
  using (public.is_admin()) with check (public.is_admin());

-- categories
drop policy if exists categories_public_read on public.categories;
create policy categories_public_read on public.categories for select using (true);
drop policy if exists categories_admin_write on public.categories;
create policy categories_admin_write on public.categories for all
  using (public.is_admin()) with check (public.is_admin());

-- industries
drop policy if exists industries_public_read on public.industries;
create policy industries_public_read on public.industries for select using (true);
drop policy if exists industries_admin_write on public.industries;
create policy industries_admin_write on public.industries for all
  using (public.is_admin()) with check (public.is_admin());

-- products
drop policy if exists products_public_read on public.products;
create policy products_public_read on public.products for select using (true);
drop policy if exists products_admin_write on public.products;
create policy products_admin_write on public.products for all
  using (public.is_admin()) with check (public.is_admin());

-- product_industries (join table): public read, admin write
drop policy if exists prod_ind_public_read on public.product_industries;
create policy prod_ind_public_read on public.product_industries for select using (true);
drop policy if exists prod_ind_admin_write on public.product_industries;
create policy prod_ind_admin_write on public.product_industries for all
  using (public.is_admin()) with check (public.is_admin());

-- site_settings: public read, admin write
drop policy if exists settings_public_read on public.site_settings;
create policy settings_public_read on public.site_settings for select using (true);
drop policy if exists settings_admin_write on public.site_settings;
create policy settings_admin_write on public.site_settings for all
  using (public.is_admin()) with check (public.is_admin());

-- ── profiles: own row or admin; NO self-escalation of role ──────────────────
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles for select
  using (id = auth.uid() or public.is_admin());

-- Insert: a user may create only their own row, and only as 'customer'.
-- (The handle_new_user trigger normally does this; this policy covers any
-- direct client insert and still blocks escalation.)
drop policy if exists profiles_insert_self on public.profiles;
create policy profiles_insert_self on public.profiles for insert
  with check (id = auth.uid() and role = 'customer');

-- Update: a user may update their own row but CANNOT change their role.
-- The WITH CHECK re-reads the row's role against the existing value; since a
-- non-admin cannot set role at all here, escalation to 'admin' is impossible.
drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self on public.profiles for update
  using (id = auth.uid())
  with check (
    id = auth.uid()
    and role = (select p.role from public.profiles p where p.id = auth.uid())
  );

-- Admins may do anything to any profile (including promote/demote roles).
drop policy if exists profiles_admin_all on public.profiles;
create policy profiles_admin_all on public.profiles for all
  using (public.is_admin()) with check (public.is_admin());

-- ── quotes: public create (RFQ incl. guests); owner/admin read; admin write ─
drop policy if exists quotes_public_create on public.quotes;
create policy quotes_public_create on public.quotes for insert with check (true);

drop policy if exists quotes_owner_or_admin_read on public.quotes;
create policy quotes_owner_or_admin_read on public.quotes for select
  using (public.is_admin() or (user_id is not null and user_id = auth.uid()));

drop policy if exists quotes_admin_update on public.quotes;
create policy quotes_admin_update on public.quotes for update
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists quotes_admin_delete on public.quotes;
create policy quotes_admin_delete on public.quotes for delete
  using (public.is_admin());

-- ── quote_items: visibility follows the parent quote ────────────────────────
drop policy if exists quote_items_public_create on public.quote_items;
create policy quote_items_public_create on public.quote_items for insert
  with check (
    exists (select 1 from public.quotes q where q.id = quote_id)
  );

drop policy if exists quote_items_parent_read on public.quote_items;
create policy quote_items_parent_read on public.quote_items for select
  using (
    exists (
      select 1 from public.quotes q
      where q.id = quote_id
        and (public.is_admin() or (q.user_id is not null and q.user_id = auth.uid()))
    )
  );

drop policy if exists quote_items_admin_write on public.quote_items;
create policy quote_items_admin_write on public.quote_items for all
  using (public.is_admin()) with check (public.is_admin());

-- ── inquiries: create-only for public, read/manage admin-only ───────────────
drop policy if exists inquiries_public_create on public.inquiries;
create policy inquiries_public_create on public.inquiries for insert with check (true);

drop policy if exists inquiries_admin_read on public.inquiries;
create policy inquiries_admin_read on public.inquiries for select using (public.is_admin());

drop policy if exists inquiries_admin_write on public.inquiries;
create policy inquiries_admin_write on public.inquiries for update
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists inquiries_admin_delete on public.inquiries;
create policy inquiries_admin_delete on public.inquiries for delete using (public.is_admin());

-- ── Views run with the definer's rights; expose read-only counts to all. ────
grant select on public.category_product_counts to anon, authenticated;
