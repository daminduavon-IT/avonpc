// STEP 3 — LOAD: upsert transformed rows into Supabase (service_role).
//
// Reads:  migration/supabase-rows/*.json (from step 2)
//         migration/.env (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
// Idempotent: every table upserts on its natural/primary key, so re-running is
// safe. Load order is FK-safe. Run:  node 3-load.mjs
//
// The service_role key BYPASSES RLS — that's required here and is why this runs
// server-side only, never in the browser.

import fs from 'node:fs';
import path from 'node:path';
import { paths, loadSupabaseConfig } from './config.js';

const CHUNK = 500;

const readRows = (table) => {
  const f = path.join(paths.transformDir, `${table}.json`);
  if (!fs.existsSync(f)) { console.error(`Missing ${f} — run 2-transform.mjs first.`); process.exit(1); }
  return JSON.parse(fs.readFileSync(f, 'utf8'));
};

async function upsert(supabase, table, rows, onConflict) {
  if (!rows.length) { console.log(`  ${table}: 0 rows (skip)`); return; }
  let done = 0;
  for (let i = 0; i < rows.length; i += CHUNK) {
    const chunk = rows.slice(i, i + CHUNK);
    const { error } = await supabase.from(table).upsert(chunk, { onConflict, ignoreDuplicates: false });
    if (error) throw new Error(`${table} upsert failed at row ${i}: ${error.message}`);
    done += chunk.length;
  }
  console.log(`  ${table}: upserted ${done}`);
}

async function main() {
  const { url, serviceRoleKey } = loadSupabaseConfig();
  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(url, serviceRoleKey, { auth: { persistSession: false } });

  // FK-safe order. Parents before children.
  await upsert(supabase, 'brands', readRows('brands'), 'id');
  await upsert(supabase, 'categories', readRows('categories'), 'id');       // parent_id self-ref ok (nullable, same batch table)
  await upsert(supabase, 'industries', readRows('industries'), 'id');
  await upsert(supabase, 'products', readRows('products'), 'id');
  await upsert(supabase, 'product_industries', readRows('product_industries'), 'product_id,industry_id');

  // ── profiles: only rows whose auth uuid is known (id != null). ────────────
  // The auth import (Phase 3) + handle_new_user trigger create the base profile
  // keyed by auth.users.id; here we enrich it with company/phone/role, matched
  // by firebase_uid. Rows still lacking an id are backfilled after auth import.
  const profiles = readRows('profiles');
  const ready = profiles.filter(p => p.id);
  const pending = profiles.filter(p => !p.id);
  await upsert(supabase, 'profiles', ready, 'id');
  if (pending.length) {
    console.log(`  profiles: ${pending.length} rows staged (no auth uuid yet) — run backfill after Phase 3 auth import`);
  }

  // ── quotes: backfill user_id from firebase_uid when possible ──────────────
  const quotes = readRows('quotes');
  await upsert(supabase, 'quotes', quotes, 'id');
  await upsert(supabase, 'quote_items', readRows('quote_items'), 'id');

  await upsert(supabase, 'inquiries', readRows('inquiries'), 'id');
  await upsert(supabase, 'site_settings', readRows('site_settings'), 'id');
  await upsert(supabase, 'site_content', readRows('site_content'), 'id');

  console.log('\nLoad complete.');
  console.log('If any profiles/quotes were staged without a user uuid, run:  node 3b-backfill-users.mjs  (after Phase 3).');
}

main().catch(err => { console.error('LOAD FAILED:', err.message); process.exit(1); });
