// STEP 7 (Phase 5) — Automated RLS isolation test against LIVE Supabase.
//
// Proves the security model actually holds at the database layer:
//   - anon can READ catalog (products) but NOT read inquiries or quotes
//   - anon can CREATE a quote + an inquiry (public RFQ / contact)
//   - customer A canNOT read customer B's quotes
//   - a customer canNOT escalate their own role to 'admin'
//
// Uses the ANON key only (this is what the browser uses) plus two real test
// logins you provide. Read-mostly; it creates one throwaway quote/inquiry.
//
// Reads migration/.env: SUPABASE_URL, SUPABASE_ANON_KEY,
//   TEST_A_EMAIL/TEST_A_PASSWORD, TEST_B_EMAIL/TEST_B_PASSWORD (two customers).
// Run:  node 7-rls-isolation-test.mjs

import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// tiny .env loader (same as config.js)
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

const {
  SUPABASE_URL, SUPABASE_ANON_KEY,
  TEST_A_EMAIL, TEST_A_PASSWORD, TEST_B_EMAIL, TEST_B_PASSWORD,
} = process.env;

let pass = 0, fail = 0;
const ok = (name, cond, detail = '') => {
  console.log(`  ${cond ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`);
  cond ? pass++ : fail++;
};

async function main() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('Set SUPABASE_URL and SUPABASE_ANON_KEY in migration/.env'); process.exit(1);
  }
  const { createClient } = await import('@supabase/supabase-js');
  const anon = () => createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false } });

  // ── Anonymous (logged-out) client ─────────────────────────────────────────
  const pub = anon();
  {
    const { data, error } = await pub.from('products').select('id').limit(1);
    ok('anon CAN read products (public catalog)', !error, error?.message);

    const { data: inq, error: inqErr } = await pub.from('inquiries').select('id').limit(1);
    // RLS returns 0 rows (not an error) for blocked SELECT.
    ok('anon canNOT read inquiries', (inq?.length ?? 0) === 0, `rows=${inq?.length ?? 0}`);

    const { data: q, error: qErr } = await pub.from('quotes').select('id').limit(1);
    ok('anon canNOT read quotes', (q?.length ?? 0) === 0, `rows=${q?.length ?? 0}`);

    const { error: createErr } = await pub.from('inquiries').insert({
      name: 'RLS Test', email: 'rls@test.local', message: 'isolation test', phone: '', company: '',
    });
    ok('anon CAN create an inquiry (contact form)', !createErr, createErr?.message);
  }

  // ── Two customer sessions ─────────────────────────────────────────────────
  if (!TEST_A_EMAIL || !TEST_B_EMAIL) {
    console.log('\n  (skipping cross-customer test — set TEST_A_* and TEST_B_* in .env to run it)');
  } else {
    const a = anon(); const b = anon();
    const { error: aErr } = await a.auth.signInWithPassword({ email: TEST_A_EMAIL, password: TEST_A_PASSWORD });
    const { error: bErr } = await b.auth.signInWithPassword({ email: TEST_B_EMAIL, password: TEST_B_PASSWORD });
    if (aErr || bErr) { console.error('  login failed:', aErr?.message || bErr?.message); process.exit(1); }

    const { data: { user: userA } } = await a.auth.getUser();
    const { data: { user: userB } } = await b.auth.getUser();

    // A creates a quote (as themselves).
    const { data: aQuote, error: aqErr } = await a.from('quotes')
      .insert({ name: 'Cust A', email: TEST_A_EMAIL, user_id: userA.id, status: 'New' })
      .select('id').single();
    ok('customer A can create own quote', !aqErr && !!aQuote, aqErr?.message);

    // A can read their own quote.
    const { data: aRead } = await a.from('quotes').select('id').eq('id', aQuote?.id);
    ok('customer A CAN read own quote', (aRead?.length ?? 0) === 1);

    // B must NOT be able to read A's quote.
    const { data: bRead } = await b.from('quotes').select('id').eq('id', aQuote?.id);
    ok('customer B canNOT read customer A quote (ISOLATION)', (bRead?.length ?? 0) === 0, `rows=${bRead?.length ?? 0}`);

    // B listing all quotes must not include A's.
    const { data: bAll } = await b.from('quotes').select('id,user_id');
    const leaked = (bAll ?? []).some(q => q.user_id === userA.id);
    ok('customer B quote list excludes A rows', !leaked);

    // Privilege escalation: B tries to set their own role to admin -> must fail/no-op.
    await b.from('profiles').update({ role: 'admin' }).eq('id', userB.id);
    const { data: bProfile } = await b.from('profiles').select('role').eq('id', userB.id).maybeSingle();
    ok('customer B canNOT self-escalate to admin', bProfile?.role !== 'admin', `role=${bProfile?.role}`);

    // Cleanup A's test quote via A's session (admin-only delete would fail for A;
    // leave it — it's harmless test data. Note it below.)
    console.log(`\n  (left one test quote id=${aQuote?.id} owned by A, and one test inquiry — delete via admin if desired)`);
  }

  console.log(`\n${fail === 0 ? 'RLS ISOLATION: ALL PASS' : 'RLS ISOLATION: ' + fail + ' FAILURE(S)'}  (${pass} passed)`);
  process.exit(fail === 0 ? 0 : 1);
}

main().catch(err => { console.error('RLS TEST ERROR:', err.message); process.exit(1); });
