// STEP 3b — BACKFILL user references AFTER Phase 3 auth import.
//
// After import_users runs, you'll have auth.users rows with new uuids. Produce
// migration/auth-uid-map.json ({ "<firebase_uid>": "<new-auth-uuid>", ... })
// from that import (see RUNBOOK Phase 3), then run this to:
//   1. enrich profiles (company/phone/role) matched by firebase_uid
//   2. set quotes.user_id from quotes.firebase_uid
//
// Idempotent. Run:  node 3b-backfill-users.mjs

import fs from 'node:fs';
import path from 'node:path';
import { paths, loadSupabaseConfig } from './config.js';

async function main() {
  const mapPath = path.join(paths.root, 'auth-uid-map.json');
  if (!fs.existsSync(mapPath)) {
    console.error(`Missing ${mapPath}. Build it from the Phase 3 auth import first.`);
    process.exit(1);
  }
  const authMap = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
  const { url, serviceRoleKey } = loadSupabaseConfig();
  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(url, serviceRoleKey, { auth: { persistSession: false } });

  // 1. Enrich profiles by firebase_uid (the trigger already created base rows).
  const profiles = JSON.parse(fs.readFileSync(path.join(paths.transformDir, 'profiles.json'), 'utf8'));
  let pUpdated = 0;
  for (const p of profiles) {
    const authUuid = authMap[p.firebase_uid];
    if (!authUuid) continue;
    const { error } = await supabase.from('profiles').update({
      firebase_uid: p.firebase_uid,
      company: p.company,
      phone: p.phone,
      display_name: p.display_name,
      // NOTE: role is set here for migrated admins, but only the service_role
      // key (this script) can do so — RLS blocks client-side role changes.
      role: p.role,
    }).eq('id', authUuid);
    if (error) throw new Error(`profile backfill ${p.firebase_uid}: ${error.message}`);
    pUpdated++;
  }
  console.log(`profiles enriched: ${pUpdated}`);

  // 2. Backfill quotes.user_id from firebase_uid.
  const { data: staged, error: qErr } = await supabase
    .from('quotes').select('id, firebase_uid').is('user_id', null).not('firebase_uid', 'is', null);
  if (qErr) throw new Error(qErr.message);
  let qUpdated = 0;
  for (const q of staged || []) {
    const authUuid = authMap[q.firebase_uid];
    if (!authUuid) continue;
    const { error } = await supabase.from('quotes').update({ user_id: authUuid }).eq('id', q.id);
    if (error) throw new Error(`quote backfill ${q.id}: ${error.message}`);
    qUpdated++;
  }
  console.log(`quotes user_id backfilled: ${qUpdated}`);
  console.log('\nBackfill complete.');
}

main().catch(err => { console.error('BACKFILL FAILED:', err.message); process.exit(1); });
