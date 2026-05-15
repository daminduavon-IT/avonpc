-- ============================================================
-- Avon Pharmo Chem — Supabase Schema
-- Run this entire file in the Supabase SQL Editor
-- ============================================================

-- ─── Extensions ──────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─── Profiles (extends Supabase auth.users) ──────────────────
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  display_name text,
  company     text,
  phone       text,
  role        text not null default 'customer' check (role in ('customer', 'admin')),
  created_at  timestamptz not null default now()
);
alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);
create policy "Admins can view all profiles"
  on public.profiles for select
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, display_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'customer')
  );
  return new;
end;
$$;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─── Categories ───────────────────────────────────────────────
create table public.categories (
  id            uuid primary key default uuid_generate_v4(),
  name          text not null,
  slug          text not null unique,
  description   text not null default '',
  image         text not null default '',
  parent_id     uuid references public.categories(id) on delete set null,
  display_order int not null default 0,
  created_at    timestamptz not null default now()
);
alter table public.categories enable row level security;
create policy "Public read categories" on public.categories for select using (true);
create policy "Admins manage categories" on public.categories for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- ─── Industries ───────────────────────────────────────────────
create table public.industries (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  slug        text not null unique,
  description text not null default '',
  image       text not null default '',
  created_at  timestamptz not null default now()
);
alter table public.industries enable row level security;
create policy "Public read industries" on public.industries for select using (true);
create policy "Admins manage industries" on public.industries for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- ─── Brands ───────────────────────────────────────────────────
create table public.brands (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  slug        text not null unique,
  logo        text not null default '',
  description text not null default '',
  created_at  timestamptz not null default now()
);
alter table public.brands enable row level security;
create policy "Public read brands" on public.brands for select using (true);
create policy "Admins manage brands" on public.brands for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- ─── Products ─────────────────────────────────────────────────
create table public.products (
  id                uuid primary key default uuid_generate_v4(),
  name              text not null,
  slug              text not null unique,
  brand             text not null default '',
  category          text not null default '',
  subcategory       text,
  model             text not null default '',
  sku               text not null default '',
  short_description text not null default '',
  full_description  text not null default '',
  specifications    jsonb not null default '[]',
  applications      text[] not null default '{}',
  features          text[] not null default '{}',
  image             text not null default '',
  images            text[] not null default '{}',
  is_flash_sale     boolean not null default false,
  flash_sale_price  numeric(10,2),
  regular_price     numeric(10,2),
  featured          boolean not null default false,
  status            text not null default 'active' check (status in ('active', 'inactive')),
  tags              text[] not null default '{}',
  industry_ids      uuid[] not null default '{}',
  spec_sheet_url    text,
  seo_title         text,
  seo_description   text,
  display_order     int not null default 0,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
alter table public.products enable row level security;
create policy "Public read active products" on public.products for select using (status = 'active' or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
create policy "Admins manage products" on public.products for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- Auto-update updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;
create trigger products_updated_at before update on public.products
  for each row execute procedure public.set_updated_at();

-- ─── Quotes ───────────────────────────────────────────────────
create table public.quotes (
  id              uuid primary key default uuid_generate_v4(),
  name            text not null,
  company         text not null default '',
  email           text not null,
  phone           text not null default '',
  country         text not null default '',
  state           text not null default '',
  city            text not null default '',
  message         text not null default '',
  products        jsonb not null default '[]',
  status          text not null default 'New'
                  check (status in ('New','In Review','Quotation Sent','Follow Up','Closed')),
  logistics_tier  text check (logistics_tier in ('pickup','courier','avon')),
  payment_method  text check (payment_method in ('bank_transfer','cod')),
  payment_slip_url text,
  delivery_status text default 'Pending'
                  check (delivery_status in ('Pending','Processing','Delivered')),
  user_id         uuid references auth.users(id) on delete set null,
  internal_notes  text,
  assigned_to     text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
alter table public.quotes enable row level security;
create trigger quotes_updated_at before update on public.quotes
  for each row execute procedure public.set_updated_at();

create policy "Users can insert quotes" on public.quotes for insert with check (true);
create policy "Users can view own quotes" on public.quotes for select
  using (user_id = auth.uid() or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
create policy "Admins manage quotes" on public.quotes for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- ─── Inquiries ────────────────────────────────────────────────
create table public.inquiries (
  id         uuid primary key default uuid_generate_v4(),
  name       text not null,
  email      text not null,
  phone      text not null default '',
  company    text not null default '',
  message    text not null,
  created_at timestamptz not null default now()
);
alter table public.inquiries enable row level security;
create policy "Anyone can insert inquiry" on public.inquiries for insert with check (true);
create policy "Admins manage inquiries" on public.inquiries for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- ─── Settings ─────────────────────────────────────────────────
create table public.settings (
  key        text primary key,
  value      jsonb not null default '{}',
  updated_at timestamptz not null default now()
);
alter table public.settings enable row level security;
create policy "Public read settings" on public.settings for select using (true);
create policy "Admins manage settings" on public.settings for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- ─── Seed default settings rows ───────────────────────────────
insert into public.settings (key, value) values
('website', '{
  "companyName": "Avon Pharmo Chem (Pvt) Ltd",
  "email": "info@avonpc.com",
  "phone": "+94 11 436 1909",
  "locations": [{"name":"Main Office","address":"Nugegoda, Sri Lanka","phone":"+94 11 436 1909","email":"info@avonpc.com","mapLink":""}],
  "socialLinks": {"facebook":"","linkedin":"","twitter":"","instagram":""},
  "heroCarousel": []
}'::jsonb),
('communications', '{"notificationEmail": "avonpcit@gmail.com"}'::jsonb)
on conflict (key) do nothing;

-- ─── Supabase Storage bucket ──────────────────────────────────
-- Run this separately in the Storage section OR via SQL:
-- insert into storage.buckets (id, name, public) values ('media', 'media', true);
-- create policy "Public read media" on storage.objects for select using (bucket_id = 'media');
-- create policy "Authenticated upload media" on storage.objects for insert
--   with check (bucket_id = 'media' and auth.role() = 'authenticated');
-- create policy "Admins delete media" on storage.objects for delete
--   using (bucket_id = 'media' and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
