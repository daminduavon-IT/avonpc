// STEP 5 (Phase 3) — Build auth-uid-map.json AFTER importing users to Supabase.
//
// import_users creates NEW uuids in auth.users (Firebase 28-char UIDs cannot be
// reused). This script matches migrated users back to their Firebase UID BY EMAIL
// and emits:
//   migration/auth-uid-map.json   { "<firebase_uid>": "<new-supabase-uuid>" }
// which Phase 2's 3b-backfill-users.mjs consumes to fix quotes.user_id + profiles.id.
//
// Reads:
//   migration/auth/firebase-users.json  (from firestoreusers2json / auth:export)
//   migration/.env                       (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
// Run:  node auth/5-build-uid-map.mjs

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadSupabaseConfig } from '../config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationRoot = path.join(__dirname, '..');

// Normalize the varied export shapes into { uid, email }.
function normalizeFirebaseUsers(raw) {
  // firestoreusers2json => array of { uid, email, ... }
  // firebase auth:export => { users: [ { localId, email, ... } ] }
  const list = Array.isArray(raw) ? raw : (raw.users || []);
  return list
    .map(u => ({
      uid: u.uid || u.localId || u.__id,
      email: (u.email || '').toLowerCase().trim(),
    }))
    .filter(u => u.uid && u.email);
}

async function main() {
  const exportPath = path.join(__dirname, 'firebase-users.json');
  if (!fs.existsSync(exportPath)) {
    console.error(`Missing ${exportPath} — export Firebase users first (see RUNBOOK Phase 3).`);
    process.exit(1);
  }
  const firebaseUsers = normalizeFirebaseUsers(JSON.parse(fs.readFileSync(exportPath, 'utf8')));
  console.log(`Firebase users with email: ${firebaseUsers.length}`);

  const { url, serviceRoleKey } = loadSupabaseConfig();
  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(url, serviceRoleKey, { auth: { persistSession: false } });

  // Pull all Supabase auth users (admin API, paginated) -> email -> uuid.
  const emailToUuid = new Map();
  let page = 1;
  for (;;) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw new Error(`listUsers: ${error.message}`);
    for (const u of data.users) {
      if (u.email) emailToUuid.set(u.email.toLowerCase().trim(), u.id);
    }
    if (data.users.length < 1000) break;
    page++;
  }
  console.log(`Supabase auth users: ${emailToUuid.size}`);

  const map = {};
  const unmatched = [];
  for (const fu of firebaseUsers) {
    const uuid = emailToUuid.get(fu.email);
    if (uuid) map[fu.uid] = uuid;
    else unmatched.push(fu.email);
  }

  fs.writeFileSync(path.join(migrationRoot, 'auth-uid-map.json'), JSON.stringify(map, null, 2));
  console.log(`\nWrote auth-uid-map.json with ${Object.keys(map).length} mappings.`);
  if (unmatched.length) {
    console.warn(`  ! ${unmatched.length} Firebase users had no matching Supabase auth email:`);
    unmatched.slice(0, 20).forEach(e => console.warn(`    - ${e}`));
    console.warn('    (These users were not imported, or emails differ in case/whitespace.)');
  }
  console.log('\nNext: run  node 3b-backfill-users.mjs  to fix quotes.user_id + profiles.');
}

main().catch(err => { console.error('BUILD UID MAP FAILED:', err.message); process.exit(1); });
