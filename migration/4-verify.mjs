// STEP 4 — VERIFY: counts + field-level spot checks (Firestore vs Supabase).
//
// Reads Firestore counts from firestore-export/_counts.json and the transformed
// rows, then queries Supabase (service_role) to confirm the load landed.
// Run:  node 4-verify.mjs

import fs from 'node:fs';
import path from 'node:path';
import { paths, loadSupabaseConfig } from './config.js';

const rows = (t) => JSON.parse(fs.readFileSync(path.join(paths.transformDir, `${t}.json`), 'utf8'));

async function count(supabase, table) {
  const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
  if (error) throw new Error(`${table} count: ${error.message}`);
  return count ?? 0;
}

function line(label, a, b) {
  const ok = a === b;
  console.log(`  ${ok ? 'OK ' : 'DIFF'}  ${label.padEnd(22)} firestore/transform=${String(a).padStart(5)}  supabase=${String(b).padStart(5)}`);
  return ok;
}

async function main() {
  const fsCounts = JSON.parse(fs.readFileSync(path.join(paths.exportDir, '_counts.json'), 'utf8'));
  const { url, serviceRoleKey } = loadSupabaseConfig();
  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(url, serviceRoleKey, { auth: { persistSession: false } });

  let allOk = true;
  console.log('\n== Row count reconciliation ==');
  // Firestore collection -> Supabase table(s). products/quotes fan out to children.
  allOk &= line('brands', fsCounts.brands, await count(supabase, 'brands'));
  allOk &= line('categories', fsCounts.categories, await count(supabase, 'categories'));
  allOk &= line('industries', fsCounts.industries, await count(supabase, 'industries'));
  allOk &= line('products', fsCounts.products, await count(supabase, 'products'));
  allOk &= line('inquiries', fsCounts.inquiries, await count(supabase, 'inquiries'));
  allOk &= line('quotes', fsCounts.quotes, await count(supabase, 'quotes'));
  // Children compared against transform output (no direct Firestore equivalent).
  allOk &= line('quote_items(vs xform)', rows('quote_items').length, await count(supabase, 'quote_items'));
  allOk &= line('product_industries', rows('product_industries').length, await count(supabase, 'product_industries'));

  // ── Field-level spot checks ───────────────────────────────────────────────
  console.log('\n== Spot checks ==');

  // A few products: slug preserved, price numeric, jsonb arrays intact.
  const sampleProducts = rows('products').slice(0, 3);
  for (const p of sampleProducts) {
    const { data, error } = await supabase.from('products')
      .select('slug,name,price,stock_qty,specifications,variants,category_name,brand_name,image')
      .eq('id', p.id).single();
    if (error) { console.log(`  DIFF product ${p.slug}: ${error.message}`); allOk = false; continue; }
    const slugOk = data.slug === p.slug;
    const specOk = Array.isArray(data.specifications);
    console.log(`  ${slugOk && specOk ? 'OK ' : 'DIFF'}  product '${data.slug}'  price=${data.price}  stock=${data.stock_qty}  specs=${data.specifications?.length}  variants=${data.variants?.length}  img=${data.image ? 'yes' : 'no'}`);
    if (!slugOk) { console.log(`       ! slug mismatch: expected '${p.slug}' got '${data.slug}'`); allOk = false; }
  }

  // One quote with its items + user link + Cloudinary bank slip URL.
  const sampleQuote = rows('quotes')[0];
  if (sampleQuote) {
    const { data: q } = await supabase.from('quotes')
      .select('id,name,email,user_id,firebase_uid,bank_slip_url,logistics_type').eq('id', sampleQuote.id).single();
    const { count: itemCount } = await supabase.from('quote_items')
      .select('*', { count: 'exact', head: true }).eq('quote_id', sampleQuote.id);
    const expectedItems = rows('quote_items').filter(i => i.quote_id === sampleQuote.id).length;
    const itemsOk = itemCount === expectedItems;
    console.log(`  ${itemsOk ? 'OK ' : 'DIFF'}  quote '${q?.name}'  items=${itemCount}/${expectedItems}  user=${q?.user_id ? 'linked' : (q?.firebase_uid ? 'staged' : 'guest')}  slip=${q?.bank_slip_url ? 'yes' : 'no'}`);
    if (!itemsOk) allOk = false;
  }

  // One inquiry.
  const sampleInquiry = rows('inquiries')[0];
  if (sampleInquiry) {
    const { data: inq, error } = await supabase.from('inquiries').select('name,email,message').eq('id', sampleInquiry.id).single();
    console.log(`  ${inq && !error ? 'OK ' : 'DIFF'}  inquiry '${inq?.name}'  email=${inq?.email ? 'yes' : 'no'}`);
    if (error) allOk = false;
  }

  // Settings singleton.
  const { data: settings } = await supabase.from('site_settings').select('company_name,hero_carousel').eq('id', 1).single();
  console.log(`  ${settings ? 'OK ' : 'DIFF'}  site_settings  company='${settings?.company_name}'  slides=${settings?.hero_carousel?.length ?? 0}`);

  // Site content (only if the source had a content doc).
  const contentXform = rows('site_content');
  if (contentXform.length) {
    const { data: content } = await supabase.from('site_content').select('content').eq('id', 1).single();
    const keyCount = content?.content ? Object.keys(content.content).length : 0;
    const expectedKeys = Object.keys(contentXform[0].content || {}).length;
    console.log(`  ${keyCount === expectedKeys ? 'OK ' : 'DIFF'}  site_content  keys=${keyCount}/${expectedKeys}`);
  }

  console.log(`\n${allOk ? 'VERIFY PASSED' : 'VERIFY FOUND DIFFERENCES — review above'}`);
  process.exit(allOk ? 0 : 1);
}

main().catch(err => { console.error('VERIFY FAILED:', err.message); process.exit(1); });
