// STEP 6 (Phase 3) — Promote admin(s) via the RLS-enforced profiles.role column.
//
// Admin is NEVER set from the client — RLS blocks role changes there. This uses
// the service_role key to set role='admin' on specific profiles by email.
//
// Usage:  node auth/6-set-admin.mjs admin@avonpc.shop [other-admin@...]
// If no emails are passed, it promotes everyone the transform marked role='admin'
// in migration/supabase-rows/profiles.json (the migrated admins).

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadSupabaseConfig } from '../config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationRoot = path.join(__dirname, '..');

async function main() {
  let emails = process.argv.slice(2).map(e => e.toLowerCase().trim()).filter(Boolean);

  if (emails.length === 0) {
    const profPath = path.join(migrationRoot, 'supabase-rows', 'profiles.json');
    if (fs.existsSync(profPath)) {
      emails = JSON.parse(fs.readFileSync(profPath, 'utf8'))
        .filter(p => p.role === 'admin' && p.email)
        .map(p => p.email.toLowerCase().trim());
    }
    if (emails.length === 0) {
      console.error('No emails given and no admin profiles found. Pass admin email(s) as arguments.');
      process.exit(1);
    }
    console.log(`Promoting migrated admins from profiles.json: ${emails.join(', ')}`);
  }

  const { url, serviceRoleKey } = loadSupabaseConfig();
  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(url, serviceRoleKey, { auth: { persistSession: false } });

  for (const email of emails) {
    const { data, error } = await supabase
      .from('profiles').update({ role: 'admin' }).eq('email', email).select('id,email,role');
    if (error) { console.error(`  FAIL ${email}: ${error.message}`); continue; }
    if (!data || data.length === 0) console.warn(`  ! ${email}: no profile row found (did the user import + sign in?)`);
    else console.log(`  OK  ${email} -> role=admin (id ${data[0].id})`);
  }
  console.log('\nDone. Verify in the app: this user should now reach /admin (RLS-gated).');
}

main().catch(err => { console.error('SET ADMIN FAILED:', err.message); process.exit(1); });
