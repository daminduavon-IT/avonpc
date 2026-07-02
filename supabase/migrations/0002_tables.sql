-- ============================================================================
-- Avon Pharmo Chem — Supabase migration 0002
-- Tables, foreign keys, indexes, triggers, and the productCount view.
-- Apply AFTER 0001.
-- ============================================================================

-- ── brands ──────────────────────────────────────────────────────────────────
create table if not exists public.brands (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,          -- stable public key (SEO)
  name        text not null,
  logo        text,
  description text,
  created_at  timestamptz not null default now()
);

-- ── categories (self-referencing parent) ────────────────────────────────────
create table if not exists public.categories (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique,        -- stable public key (SEO)
  name          text not null,
  description   text,
  image         text,
  parent_id     uuid references public.categories(id) on delete set null,
  display_order int,
  created_at    timestamptz not null default now()
);
create index if not exists idx_categories_parent on public.categories(parent_id);

-- ── industries ──────────────────────────────────────────────────────────────
create table if not exists public.industries (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  name        text not null,
  description text,
  image       text,
  created_at  timestamptz not null default now()
);

-- ── products ────────────────────────────────────────────────────────────────
create table if not exists public.products (
  id                uuid primary key default gen_random_uuid(),
  slug              text not null unique,     -- BYTE-FOR-BYTE preserved from Firestore
  name              text not null,
  model             text,
  sku               text,
  subcategory       text,
  category_id       uuid references public.categories(id) on delete set null,
  brand_id          uuid references public.brands(id) on delete set null,
  category_name     text,                     -- denormalized for display / back-compat
  brand_name        text,                     -- denormalized for display / back-compat
  short_description text,
  full_description  text,
  image             text,                     -- Cloudinary URL (carried across unchanged)
  specifications    jsonb not null default '[]'::jsonb,  -- [{label,value}]
  applications      jsonb not null default '[]'::jsonb,  -- string[]
  features          jsonb not null default '[]'::jsonb,  -- string[]
  tags              jsonb not null default '[]'::jsonb,  -- string[]
  images            jsonb not null default '[]'::jsonb,  -- string[] (Cloudinary URLs)
  gallery           jsonb not null default '[]'::jsonb,  -- string[] (Cloudinary URLs)
  variants          jsonb not null default '[]'::jsonb,  -- [{id,sku,selectionLabel,stockQty,price,description}]
  featured          boolean not null default false,
  is_flash_sale     boolean not null default false,
  status            product_status not null default 'active',
  display_order     int,
  price             numeric(12,2),
  stock_qty         int,                      -- normalized from Firestore string
  spec_sheet_url    text,
  seo_title         text,
  seo_description   text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index if not exists idx_products_category on public.products(category_id);
create index if not exists idx_products_brand    on public.products(brand_id);
create index if not exists idx_products_status   on public.products(status);
create index if not exists idx_products_featured on public.products(featured);

drop trigger if exists trg_products_updated_at on public.products;
create trigger trg_products_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

-- ── product ↔ industry (many-to-many, from Firestore industryIDs[]) ─────────
create table if not exists public.product_industries (
  product_id  uuid not null references public.products(id) on delete cascade,
  industry_id uuid not null references public.industries(id) on delete cascade,
  primary key (product_id, industry_id)
);
create index if not exists idx_prod_ind_industry on public.product_industries(industry_id);

-- ── profiles (1:1 with auth.users) ──────────────────────────────────────────
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  firebase_uid text unique,                   -- provenance + quotes remap key
  email        text,
  display_name text,
  company      text,
  phone        text,
  role         user_role not null default 'customer',   -- write-locked via RLS
  created_at   timestamptz not null default now()
);
create index if not exists idx_profiles_firebase_uid on public.profiles(firebase_uid);

-- Fire a profile row on every new auth user (signup or import).
drop trigger if exists trg_on_auth_user_created on auth.users;
create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── quotes ──────────────────────────────────────────────────────────────────
create table if not exists public.quotes (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid references auth.users(id) on delete set null,  -- remapped from firebase uid
  firebase_uid   text,                        -- staging: original Firestore userId, for backfill
  name           text,
  company        text,
  email          text,
  phone          text,
  country        text,
  state          text,
  city           text,
  message        text,
  status         quote_status not null default 'New',
  logistics_type logistics_type,
  bank_slip_url  text,                         -- Cloudinary URL
  internal_notes text,
  assigned_to    text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index if not exists idx_quotes_user    on public.quotes(user_id);
create index if not exists idx_quotes_status  on public.quotes(status);
create index if not exists idx_quotes_created on public.quotes(created_at desc);

drop trigger if exists trg_quotes_updated_at on public.quotes;
create trigger trg_quotes_updated_at
  before update on public.quotes
  for each row execute function public.set_updated_at();

-- ── quote_items (from Firestore quotes.products[]) ──────────────────────────
create table if not exists public.quote_items (
  id             uuid primary key default gen_random_uuid(),
  quote_id       uuid not null references public.quotes(id) on delete cascade,
  product_id     uuid references public.products(id) on delete set null,  -- best-effort resolve
  product_ref_id text,                         -- original Firestore product doc id (audit)
  name           text,
  brand          text,
  model          text,
  variant_id     text,
  variant_label  text,
  quantity       int not null default 1,
  price          numeric(12,2)
);
create index if not exists idx_quote_items_quote on public.quote_items(quote_id);

-- ── inquiries ───────────────────────────────────────────────────────────────
create table if not exists public.inquiries (
  id         uuid primary key default gen_random_uuid(),
  name       text,
  email      text,
  phone      text,
  company    text,
  message    text,
  created_at timestamptz not null default now()
);
create index if not exists idx_inquiries_created on public.inquiries(created_at desc);

-- ── site_settings (single row, id fixed to 1) ───────────────────────────────
create table if not exists public.site_settings (
  id            int primary key default 1 check (id = 1),
  company_name  text,
  email         text,
  phone         text,
  locations     jsonb not null default '[]'::jsonb,   -- [{name,address,phone,email,mapLink}]
  social_links  jsonb not null default '{}'::jsonb,   -- {facebook,linkedin,twitter,instagram}
  hero_carousel jsonb not null default '[]'::jsonb,   -- [{image,titleLine1,titleLine2,highlightWord,subtitle}]
  updated_at    timestamptz not null default now()
);

drop trigger if exists trg_site_settings_updated_at on public.site_settings;
create trigger trg_site_settings_updated_at
  before update on public.site_settings
  for each row execute function public.set_updated_at();

-- ── category product counts (view — replaces stale categories.productCount) ─
-- Always correct, no drift. Counts only active products.
create or replace view public.category_product_counts as
  select
    c.id   as category_id,
    c.slug as category_slug,
    count(p.id) filter (where p.status = 'active') as product_count
  from public.categories c
  left join public.products p on p.category_id = c.id
  group by c.id, c.slug;
