# Phase 1 Runbook — Apply the Supabase schema + RLS

**Nothing here is live until YOU apply it to your Supabase project.** These are
just SQL files on disk. Firebase stays untouched and running in parallel.

## What was created

| File | Purpose |
|---|---|
| `supabase/migrations/0001_enums_and_functions.sql` | Enums, `set_updated_at()`, `is_admin()`, `handle_new_user()` |
| `supabase/migrations/0002_tables.sql` | All tables, FKs, indexes, `updated_at` triggers, `category_product_counts` view |
| `supabase/migrations/0003_rls_policies.sql` | Row Level Security — the app's real security layer |
| `src/lib/database.types.ts` | TypeScript types matching the schema (used by the app in Phase 4) |
| `supabase/config.toml` | CLI config (contains no secrets) |

All three SQL files were **parse-validated** against the real Postgres grammar
(libpg_query / Postgres 17). They apply in numeric order: 0001 → 0002 → 0003.

## Option A — Supabase CLI (recommended)

```bash
npx supabase login                              # opens browser; uses YOUR login
npx supabase link --project-ref <project-ref>   # from your project's URL/dashboard
npx supabase db push                            # applies migrations 0001–0003
```

`<project-ref>` is the ~20-char ID in your project URL
(`https://<project-ref>.supabase.co`). It is **not** the secret service_role key.

## Option B — SQL editor (no CLI)

Open the Supabase Dashboard → SQL Editor and run each file's contents in order:
`0001` → `0002` → `0003`. Each is idempotent/re-runnable.

## After applying — quick sanity checks (SQL editor)

```sql
-- 1. All 10 tables exist with RLS enabled:
select relname, relrowsecurity
from pg_class
where relnamespace = 'public'::regnamespace and relkind = 'r'
order by relname;
-- every row should show relrowsecurity = true

-- 2. Policies are present (expect ~25):
select tablename, policyname, cmd from pg_policies
where schemaname = 'public' order by tablename, policyname;

-- 3. Default-deny works for anon: with the ANON key (not service_role),
--    selecting from products should succeed (public read) but selecting from
--    inquiries should return 0 rows / be blocked. Test from the app in Phase 5.
```

## Promote your admin (AFTER Phase 3 auth import)

Admin is a write-locked column; set it with a **service_role** SQL statement,
never from the client:

```sql
update public.profiles set role = 'admin'
where email = 'your-admin@avonpc.shop';
```

## Regenerate types later (optional)

Once live, you can replace the hand-authored types with generated ones:

```bash
npx supabase gen types typescript --project-id <project-ref> --schema public \
  > src/lib/database.types.ts
```

## Rollback

Nothing in your app uses these tables yet (Phase 4 does the rewrite). To undo,
drop the schema objects in reverse, or simply reset the Supabase project's
`public` schema. Firebase is unaffected either way.
