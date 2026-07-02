// SIMPLE AUTH MIGRATION — recreate Firebase users as Supabase users.
//
// For a small user set: creates each user via the Supabase Admin API (service_role),
// email pre-confirmed, no password (they set one via reset email on first login).
// Dedupes by email. Writes migration/auth-uid-map.json (firebase_uid -> new uuid)
// so 3b-backfill-users.mjs can link quotes + enrich profiles.
//
// Idempotent: if a user already exists, it reuses them (matched by email).
//
// Reads:  migration/firestore-export/users.json, migration/.env (service_role)
// Run:    node auth/create-users-simple.mjs

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadSupabaseConfig } from '../config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationRoot = path.join(__dirname, '..');

async function main() {
  const usersPath = path.join(migrationRoot, 'firestore-export', 'users.json');
  const users = JSON.parse(fs.readFileSync(usersPath, 'utf8'));

  const { url, serviceRoleKey } = loadSupabaseConfig();
  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(url, serviceRoleKey, { auth: { persistSession: false } });

  // Fetch existing auth users once (to be idempotent + resolve dupes).
  const existingByEmail = new Map();
  let page = 1;
  for (;;) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw new Error(`listUsers: ${error.message}`);
    for (const u of data.users) if (u.email) existingByEmail.set(u.email.toLowerCase().trim(), u.id);
    if (data.users.length < 1000) break;
    page++;
  }

  // Dedupe source users by email — keep the FIRST occurrence's firebase uid as
  // canonical, but remember ALL firebase uids for that email so every quote
  // (whichever uid it used) maps to the one new auth user.
  const emailToFirebaseUids = new Map();   // email -> [firebase_uid, ...]
  const emailMeta = new Map();             // email -> { displayName, role }
  for (const u of users) {
    const email = (u.email || '').toLowerCase().trim();
    if (!email) continue;
    if (!emailToFirebaseUids.has(email)) {
      emailToFirebaseUids.set(email, []);
      emailMeta.set(email, { displayName: u.displayName || '', role: u.role === 'admin' ? 'admin' : 'customer' });
    }
    emailToFirebaseUids.get(email).push(u.__id || u.uid);
    // If any duplicate says admin, treat as admin.
    if (u.role === 'admin') emailMeta.get(email).role = 'admin';
  }

  console.log(`Source: ${users.length} user docs -> ${emailToFirebaseUids.size} unique emails`);

  const authMap = {};   // firebase_uid -> new supabase uuid (ALL uids per email)
  for (const [email, firebaseUids] of emailToFirebaseUids) {
    const meta = emailMeta.get(email);
    let uuid = existingByEmail.get(email);

    if (uuid) {
      console.log(`  = exists   ${email}  (reusing ${uuid.slice(0, 8)}…)`);
    } else {
      const { data, error } = await supabase.auth.admin.createUser({
        email,
        email_confirm: true,   // mark confirmed; they set a password via reset
        user_metadata: { display_name: meta.displayName },
      });
      if (error) { console.error(`  ! FAIL    ${email}: ${error.message}`); continue; }
      uuid = data.user.id;
      console.log(`  + created  ${email}  -> ${uuid.slice(0, 8)}…`);
    }

    // Map EVERY firebase uid that used this email to the one new uuid.
    for (const fbUid of firebaseUids) authMap[fbUid] = uuid;
  }

  fs.writeFileSync(path.join(migrationRoot, 'auth-uid-map.json'), JSON.stringify(authMap, null, 2));
  console.log(`\nWrote auth-uid-map.json with ${Object.keys(authMap).length} firebase_uid mappings.`);
  console.log('Next: node 3b-backfill-users.mjs   (links quotes + enriches profiles)');
  console.log('Then send password-reset emails (see runbook) so users can log in.');
}

main().catch(err => { console.error('CREATE USERS FAILED:', err.message); process.exit(1); });
