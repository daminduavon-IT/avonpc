# Phase 2 Runbook — Firestore → Supabase data migration

Idempotent, re-runnable tooling. **You** run these locally with **your** credentials.
Firebase stays live and untouched (read-only export). Nothing writes to Supabase
until step 3, and only with the service_role key you provide.

## 0. One-time setup

```bash
cd migration
npm install                     # installs firebase-admin + @supabase/supabase-js (this folder only)
mkdir -p .secrets
```

Drop in your two secret files (both gitignored — verified):

| File | Where to get it |
|---|---|
| `migration/.secrets/firebase-service.json` | Firebase Console → Project Settings → **Service accounts** → *Generate new private key* |
| `migration/.env` | copy `.env.example`; `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` from Supabase Dashboard → Project Settings → **API** |

> ⚠️ The **service_role key** and the **Firebase admin key** are SECRET. They never go in `src/` or the frontend bundle. `git status` should never show them.

**Prerequisite:** Phase 1 migrations (schema + RLS) already applied to your Supabase project.

## 1. Export (read-only against Firestore)

```bash
npm run export
```

Writes `firestore-export/<collection>.json` + `_counts.json`. Re-runnable.

## 2. Transform (pure, no network)

```bash
npm run transform
```

Writes `supabase-rows/<table>.json` + `_report.json`. **Open `_report.json`** and check:
- `unresolvedCategoryRefs` / `unresolvedBrandRefs` — products whose category/brand name
  didn't match a category slug / brand name. These load with a null FK but keep
  `category_name`/`brand_name` so the site still displays them. Fix source data and
  re-run if you want the FKs populated.
- `guestQuotes` — quotes with no `userId` (expected; loaded with `user_id = null`).
- `profilesNeedingAuthBackfill` / `quotesNeedingUserBackfill` — will be > 0 until
  Phase 3 auth import + `auth-uid-map.json` exist. Resolved by step 3b.

## 3. Load (writes to Supabase, service_role, upsert-safe)

```bash
npm run load
```

Upserts every table in FK-safe order. Re-running overwrites by primary key (idempotent).
Profiles without a known auth uuid are **staged** (skipped here, backfilled in 3b).

## 3b. Backfill user references — AFTER Phase 3 auth import

Once `import_users` (Phase 3) has run, build `migration/auth-uid-map.json`:

```json
{ "<firebase_uid>": "<new-supabase-auth-uuid>", "...": "..." }
```

(The Phase 3 runbook shows how to derive this from the import output / `auth.users`.)
Then:

```bash
node 3b-backfill-users.mjs
```

This enriches profiles (company/phone/**role** for migrated admins — service_role only,
RLS blocks client role changes) and sets `quotes.user_id` from `firebase_uid`.

> Tip: if you run Phase 3 **before** this Phase 2 load, just place `auth-uid-map.json`
> before step 2 and the transform resolves `user_id`/`profiles.id` directly — 3b becomes a no-op.

## 4. Verify

```bash
npm run verify
```

Reconciles row counts (Firestore vs Supabase) and spot-checks: 3 products (slug preserved,
price numeric, jsonb arrays), one quote (items + user link + Cloudinary slip URL), one
inquiry, and the settings singleton. Exits non-zero on any diff.

## Full pipeline (after secrets + Phase 1 are in place)

```bash
npm run all      # export -> transform -> load -> verify
```

## Idempotency & rollback

- Every entity uuid is a **deterministic UUIDv5** of its Firestore doc id, so re-running
  transform+load upserts the same rows — no duplicates.
- To roll back a load: `truncate` the affected tables in Supabase (RLS-bypassing SQL editor)
  and re-run, or restore from a Supabase backup. Firebase is never modified.

## What carries across unchanged

- **Cloudinary URLs** (`products.image/images/gallery`, `quotes.bank_slip_url`) — copied as
  plain strings. Cloudinary is not touched.
- **Slugs** — copied byte-for-byte; `unique` constraint enforces no collisions. Public URLs
  do not change.
