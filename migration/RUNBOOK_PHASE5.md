# Phase 5 Runbook — Verify, test, cutover

Firebase stays **live in parallel** the entire time. Cutover is env-var + deploy only;
rollback is reverting the branch. **Nothing is enforced until the migrations are applied**
and **env vars must be set on the host, not just locally.**

## Preconditions
- Phase 1 migrations applied (0001–**0004**) to your Supabase project.
- Phase 2 data loaded + verified (`npm run verify` passed).
- Phase 3 users imported, `auth-uid-map.json` built, `3b-backfill` run, admin promoted.
- `.env` (local) and the host both have `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`.

## A. Automated checks (already green in the repo)
```bash
npx tsc --noEmit     # pass
npm run lint         # 0 errors (10 pre-existing cosmetic warnings)
npm run build        # pass; JS chunk ~1.02 MB (Firebase tree-shaken out)
npm run test         # pass
```

## B. Automated RLS isolation test (LIVE Supabase, anon key)
Create two throwaway customer logins in Supabase, add to `migration/.env`:
```
SUPABASE_ANON_KEY=...
TEST_A_EMAIL=a@test.local   TEST_A_PASSWORD=...
TEST_B_EMAIL=b@test.local   TEST_B_PASSWORD=...
```
```bash
cd migration && node 7-rls-isolation-test.mjs
```
Proves: anon reads catalog but NOT quotes/inquiries; anon can create inquiry; **customer B
cannot read customer A's quotes**; a customer cannot self-escalate to admin. Must print
`ALL PASS` before cutover.

## C. Manual flow verification (run the app against Supabase)
`npm run dev` with Supabase env vars set, then walk each flow:

| Flow | Expected |
|---|---|
| **Browse catalog** (home, /products, /products/:category, /product/:slug, /brands, /industries) | Reads work; product detail shows specs/variants/images; category & brand filters return the right products; slugs unchanged (same URLs as before) |
| **Submit a quote** (add to cart → /request-quote → upload bank slip → submit) | Quote row + quote_items created in Supabase; **Cloudinary upload still works** (unchanged); **mailer email still sent** (unchanged); success screen shows |
| **Register** | New auth user; `profiles` row auto-created (role=customer); company/name saved |
| **Login** (a MIGRATED user, OLD password) | Succeeds with no reset (seamless path). If it fails → scrypt params wrong; see Phase 3 fallback |
| **Password reset** | resetPasswordForEmail sends; link returns to /login |
| **My Account** | Shows the user's migrated quotes (backfill worked); profile edit saves; dates render (Timestamp shim) |
| **Admin CRUD** (as promoted admin) | /admin loads; create/edit/delete product, category, brand, industry, content; update quote status — all succeed (RLS admin writes) |
| **Admin as non-admin** | A customer hitting /admin is redirected (client guard) AND writes are blocked by RLS even if forced |
| **Isolation** | Customer A cannot see B's quotes in My Account (matches the automated test) |

Spot-check the admin pages that render dates directly (AdminQuotes, AdminInquiries,
AdminReports) — they use `.toDate()`/`.toMillis()`, satisfied by the service's Timestamp shim.

## D. Cutover on cPanel (static host)
1. Set env vars **in the build environment** (they're baked into the bundle at build time —
   Vite inlines `VITE_*`). On cPanel this means building with the vars set, or building
   locally/CI with them and uploading `dist/`:
   ```bash
   VITE_SUPABASE_URL=... VITE_SUPABASE_ANON_KEY=... \
   VITE_CLOUDINARY_CLOUD_NAME=... VITE_CLOUDINARY_UPLOAD_PRESET=... \
   VITE_API_URL=https://api.avonpc.shop/api/quote \
   npm run build
   ```
   > ⚠️ Because Vite inlines env at build time, setting them only in cPanel's runtime panel
   > does nothing for a static SPA — they must be present when `npm run build` runs.
2. Upload `dist/` to `public_html` (same as before). Keep the SPA `.htaccess`.
3. The **Express mailer is unchanged** — no redeploy needed for the DB migration (it never
   read Firestore). Only ensure its `ALLOWED_ORIGINS` includes `https://avonpc.shop`.
4. Verify the live site: load a product page, submit a test quote, log in.

## E. Rollback (Firebase still live)
- **App:** revert the migration branch (or redeploy the previous `dist/`). The old build
  still points at Firebase, which was never disabled → instant rollback.
- **Env:** keep BOTH sets of env vars retained during the transition so either build works.
- **Data written to Supabase after cutover** (new quotes/inquiries/signups) will NOT be in
  Firebase. If you roll back, export those few Supabase rows and re-enter, or roll forward
  again. Keep the parallel window short to minimize this.
- **DO NOT delete or disable Firebase** until you've run on Supabase long enough to be
  confident (recommend ≥ 1–2 weeks). Only then remove the `firebase` npm dep + `firebase.ts`
  stub + Firebase env.

## F. Post-cutover cleanup (after you're confident — separate PR)
- `npm remove firebase` (already unused/tree-shaken).
- Delete `src/lib/firebase.ts` stub.
- Remove Firebase web config / env.
```
