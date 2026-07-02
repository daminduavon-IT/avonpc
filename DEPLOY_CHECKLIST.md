# Pre-Deploy Security Checklist — Avon Pharmo Chem

The code-level fixes from the audit are done. The items below **require console/dashboard access** and can only be done by you. **Do all 🔴 items before the site goes live.**

---

## 🔴 1. Rotate the leaked SMTP credential (CRITICAL)

`server/.env` — containing the Gmail app password `clsu ozqp crwi puth` for
`avonpcit@gmail.com` — was committed to git history. **That password is compromised.**

- [ ] Go to Google Account → Security → App passwords, **revoke** the leaked app password.
- [ ] Generate a **new** app password and put it in your local `server/.env` (now gitignored) and in your production host's environment variables.
- [ ] The files are now untracked (`git rm --cached` was run) and gitignored. To also purge them from history (recommended, since the repo may be shared), use `git filter-repo` or the BFG Repo-Cleaner, then force-push. If the repo has never left your machine, at minimum the rotation above is mandatory.

## 🔴 2. Deploy Firestore & Storage security rules (CRITICAL)

Rules files are now in the repo: `firestore.rules`, `storage.rules`, `firebase.json`.
Until deployed, assume the database is world-readable/writable.

- [ ] Install the Firebase CLI if needed: `npm i -g firebase-tools`
- [ ] `firebase login`
- [ ] `firebase use avonpclova` (the project ID from `src/lib/firebase.ts`)
- [ ] Review `firestore.rules` — confirm the collections match your data.
- [ ] Deploy: `firebase deploy --only firestore:rules,storage`
- [ ] In the Firebase console → Firestore → Rules, confirm they're live (not "test mode").

## 🔴 3. Set the admin role in Firestore (CRITICAL — admin login depends on it)

The hardcoded `admin@avonpc.com` admin was **removed** from the client. Admin access
now comes from the user's Firestore profile. Without this step, **no one can access `/admin`.**

- [ ] Ensure the admin user has signed up (so a `users/{uid}` doc exists), or create the doc.
- [ ] In Firebase console → Firestore → `users` → the admin's document, set field `role` = `admin` (string).
- [ ] Log in as that user and confirm `/admin` loads.

## 🔴 4. Lock down the Cloudinary unsigned upload preset (CRITICAL)

The unsigned preset is exposed in the client bundle; anyone can read it and upload
arbitrary files. Client-side size/type guards were added, but they're bypassable.

- [ ] Cloudinary console → Settings → Upload → your unsigned preset.
- [ ] Set **Allowed formats**: `jpg, png, webp, pdf`.
- [ ] Set a **max file size** (e.g. 10 MB) and **Incoming transformation** to strip metadata if desired.
- [ ] Set a fixed **Folder** (e.g. `bank-slips/`) so uploads can't scatter.
- [ ] Consider enabling **moderation** and/or switching to **signed** uploads via the Express server for stronger control.

---

## 🟠 5. Production environment variables

- [ ] Frontend build env (host or CI): set `VITE_API_URL` to the **production** mailer URL
      (e.g. `https://api.yourdomain.com/api/quote`), plus `VITE_CLOUDINARY_CLOUD_NAME`
      and `VITE_CLOUDINARY_UPLOAD_PRESET`. See `.env.example`.
- [ ] Server env: set `ALLOWED_ORIGINS` to your real site origin(s), comma-separated
      (e.g. `https://yourdomain.com,https://www.yourdomain.com`). CORS now **rejects**
      any origin not on this list. See `server/.env.example`.
- [ ] Server SMTP vars point at the **rotated** credential from step 1.

## 🟠 6. Verify a clean server install on the deploy host

- [ ] On the target Node version, run `npm ci` (or `npm install`) in `server/` and
      confirm `npm audit` reports **0 vulnerabilities** (nodemailer was bumped to 9.x).

## 🟡 7. Content / cosmetics

- [ ] Populate Website Settings in the admin panel — the built-in defaults reference
      India (Ahmedabad, +91) but this is a Sri Lanka business.
- [ ] Optimize `src/assets/avon-logo.png` (currently 1.84 MB) to WebP/SVG or < 100 KB.

---

_Generated as part of the pre-deploy audit. Code-level 🔴/🟠 items are already fixed in the working tree._
