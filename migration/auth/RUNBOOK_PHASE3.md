# Phase 3 Runbook — Firebase Auth → Supabase Auth

Migrates your users (email/password only — **no OAuth**, confirmed in discovery, so no
Google re-link caveat applies). Uses the community `firebase-to-supabase/auth` tools plus
the local scripts in this folder. Firebase Auth stays live and untouched.

> ⚠️ **Verify commands against the current repo/docs before running.** This area changes.
> Sources checked: the [Supabase Firebase-Auth guide](https://supabase.com/docs/guides/platform/migrating-to-supabase/firebase-auth)
> and [`firebase-to-supabase/auth`](https://github.com/supabase-community/firebase-to-supabase/tree/main/auth).

---

## Strategy: seamless (lazy) — keep existing passwords

Firebase hashes with **scrypt**; Supabase (GoTrue) stores **bcrypt** but can **natively
verify a `firebase-scrypt` hash** on login *if* the project is given Firebase's scrypt
parameters, then transparently re-hashes to bcrypt. So the primary path needs **no custom
middleware**. The community `verify-firebase-pw` middleware is kept only as a **fallback**
(its password-updating half is partial). If the native path can't be configured on your
plan, fall back to **forced password reset** (documented at the bottom).

---

## Step 1 — Get the scrypt hash parameters (Firebase console)

Firebase Console → **Authentication** → **Users** tab → the **⋮ (3-dot) menu at the top
right of the users list** → **"Password hash parameters"**. Copy all four:

| Firebase field | Typical value | Used as (community tool env) |
|---|---|---|
| `base64_signer_key` | (long base64) | `SIGNERKEY` |
| `base64_salt_separator` | usually `Bw==` | `SALTSEPARATOR` |
| `rounds` | `8` | `ROUNDS` |
| `mem_cost` | `14` | `MEMCOST` |

Keep these secret (put them in the tool's `local.env.sh`, gitignored — never commit).

## Step 2 — Export Firebase users

Two options; either produces the input for step 4's uid-map builder. Save the output as
`migration/auth/firebase-users.json`.

**Option A — community tool (includes passwordHash for the seamless path):**
```bash
# in a clone of firebase-to-supabase/auth, with firebase-service.json present
node firestoreusers2json.js firebase-users.json 100
```

**Option B — Firebase CLI:**
```bash
firebase auth:export firebase-users.json --format=json --project <your-project-id>
```
(Option A is preferred for the seamless path — it packages the scrypt hash per user.)

Copy the resulting file to `migration/auth/firebase-users.json` (gitignored).

## Step 3 — Import users into Supabase

The community `import_users` writes directly to `auth.users` over Postgres, so it needs a
**`supabase-service.json`** (NOT the anon/service_role REST key — this is the DB connection):
```json
{
  "host": "db.<project-ref>.supabase.co",
  "password": "<your Supabase DB password>",
  "user": "postgres",
  "database": "postgres",
  "port": 5432
}
```
(Host + password: Supabase Dashboard → Project Settings → **Database** → Connection info.)

Set the scrypt env vars (from step 1), then import:
```bash
export SIGNERKEY=...   SALTSEPARATOR=Bw==   ROUNDS=8   MEMCOST=14
node import_users.js /full/path/to/firebase-users.json 100
```

This inserts users into `auth.users` with **new UUIDs** and the preserved firebase-scrypt
hash. Our Phase 1 `handle_new_user` trigger fires on each insert and creates a base
`public.profiles` row (role forced to `customer`).

> If native firebase-scrypt verification isn't available on your project, stand up the
> `auth/middleware/verify-firebase-pw/` service from the repo (Supabase Edge Function or
> reuse the Express service) so the first login verifies the old password and sets the new
> one. Otherwise skip the middleware entirely.

## Step 4 — Build the uid map (this folder)

```bash
cd migration
npm install                       # if not already (from Phase 2)
node auth/5-build-uid-map.mjs      # needs migration/.env (SUPABASE_URL + service_role key)
```
Matches `firebase-users.json` to Supabase `auth.users` **by email** and writes
`migration/auth-uid-map.json` (`{ firebase_uid: new_uuid }`). Reports any unmatched emails.

## Step 5 — Backfill data references (Phase 2 script)

Now that the uid map exists, resolve `quotes.user_id` and enrich `profiles`:
```bash
node 3b-backfill-users.mjs
```
(If you ran Phase 3 **before** the Phase 2 load, instead just place `auth-uid-map.json`
before Phase 2 step 2 — the transform resolves everything directly and 3b is a no-op.)

## Step 6 — Promote admin(s) via RLS-enforced column

```bash
node auth/6-set-admin.mjs admin@avonpc.shop
# or, with no args, promotes everyone the transform marked role='admin'
```
Admin lives in `profiles.role`, enforced by RLS — **never** settable from the client. This
replaces the old Firestore `role` field / removed hardcoded email.

## Step 7 — Verify auth

- In the app (Phase 5) or Supabase Dashboard → Authentication, confirm user count matches
  the Firebase export.
- **Log in as one migrated user with their OLD password** — it should work with no reset
  (seamless path). If it fails, the scrypt params are wrong → recheck step 1, or fall back.
- Log in as the admin → confirm `/admin` loads (role resolved via RLS `is_admin()`).
- Confirm a migrated customer's quotes appear under their account (Phase 2 backfill worked).

---

## Fallback — forced password reset (if seamless can't be configured)

1. `import_users` **without** the scrypt env vars (users imported with no usable password).
2. From the app / Supabase, trigger `resetPasswordForEmail` for every user (or let them use
   "Forgot password" on first login).
3. Users set a new password once. Simpler, but user-visible friction. All data (quotes,
   profiles) still links correctly via the uid map — only the password step differs.

## Ordering summary (interlocks with Phase 2)

```
Phase 1 (schema+RLS applied)
Phase 3 steps 1–3  (export + import users -> new uuids, trigger makes base profiles)
Phase 3 step 4     (build auth-uid-map.json)
Phase 2 load (3)   (catalog/quotes/etc.)  ── can run before or after; order-independent
Phase 3 step 5     (3b-backfill: quotes.user_id + profile enrichment)
Phase 3 step 6     (set admin)
Phase 3 step 7     (verify)
```

## Secrets recap (all gitignored)
`firebase-service.json`, `supabase-service.json`, `local.env.sh` (scrypt params),
`firebase-users.json`, `auth-uid-map.json`, `migration/.env` (service_role). None of these
ever go in `src/` or the frontend bundle.
