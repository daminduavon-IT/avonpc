-- ============================================================================
-- Avon Pharmo Chem — Supabase migration 0004
-- CMS text content (was Firestore settings/content — a flat key->text map used
-- by the admin Content Management page). Single-row JSONB, public read / admin
-- write, consistent with site_settings. Apply AFTER 0003.
-- ============================================================================

create table if not exists public.site_content (
  id         int primary key default 1 check (id = 1),
  content    jsonb not null default '{}'::jsonb,   -- { "<key>": "<text>", ... }
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_site_content_updated_at on public.site_content;
create trigger trg_site_content_updated_at
  before update on public.site_content
  for each row execute function public.set_updated_at();

alter table public.site_content enable row level security;

drop policy if exists site_content_public_read on public.site_content;
create policy site_content_public_read on public.site_content for select using (true);

drop policy if exists site_content_admin_write on public.site_content;
create policy site_content_admin_write on public.site_content for all
  using (public.is_admin()) with check (public.is_admin());
