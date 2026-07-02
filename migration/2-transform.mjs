// STEP 2 — TRANSFORM: Firestore docs -> relational rows for Postgres.
//
// Reads:  migration/firestore-export/*.json  (from step 1)
//         migration/auth-uid-map.json         (OPTIONAL, from Phase 3 auth import;
//                                              maps firebase_uid -> new auth uuid)
// Writes: migration/supabase-rows/*.json      (one file per target table)
//         migration/supabase-rows/_report.json (unresolved refs, warnings)
//
// Pure/deterministic. Safe to re-run. Run:  node 2-transform.mjs

import fs from 'node:fs';
import path from 'node:path';
import { paths, ensureDir } from './config.js';
import { idFor } from './lib/uuid.mjs';
import {
  slugifyCategoryName, toIso, toInt, toNumeric, asArray, orNull,
} from './lib/helpers.mjs';

const read = (name) => {
  const f = path.join(paths.exportDir, `${name}.json`);
  if (!fs.existsSync(f)) {
    console.error(`Missing export ${f} — run 1-export.mjs first.`);
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(f, 'utf8'));
};

function main() {
  ensureDir(paths.transformDir);
  const report = { warnings: [], unresolved: {} };
  const warn = (msg) => { report.warnings.push(msg); console.warn('  ! ' + msg); };

  // ── Load source collections ───────────────────────────────────────────────
  const brands = read('brands');
  const categories = read('categories');
  const industries = read('industries');
  const products = read('products');
  const quotes = read('quotes');
  const inquiries = read('inquiries');
  const users = read('users');
  const settingsDocs = read('settings');

  // Optional auth uid -> new uuid map (produced by Phase 3 import_users).
  const authMapPath = path.join(paths.root, 'auth-uid-map.json');
  const authMap = fs.existsSync(authMapPath)
    ? JSON.parse(fs.readFileSync(authMapPath, 'utf8'))
    : {};
  if (!fs.existsSync(authMapPath)) {
    warn('auth-uid-map.json not found — quotes.user_id / profiles.id will be staged ' +
      'via firebase_uid for backfill after Phase 3. This is expected if auth is not imported yet.');
  }

  // ── Lookup maps (firestore doc id -> new uuid) ────────────────────────────
  const brandIdByDoc = new Map();
  const brandIdByName = new Map();   // exact name -> uuid  (products.brand is a name)
  const categoryIdByDoc = new Map();
  const categoryIdBySlug = new Map(); // slug -> uuid (products.category slugified -> slug)
  const industryIdByDoc = new Map();

  // ── brands ────────────────────────────────────────────────────────────────
  const brandRows = brands.map(b => {
    const id = idFor('brands', b.__id);
    brandIdByDoc.set(b.__id, id);
    if (b.name) brandIdByName.set(b.name, id);
    return {
      id,
      slug: b.slug,
      name: b.name,
      logo: orNull(b.logo),
      description: orNull(b.description),
      created_at: toIso(b.createdAt),
    };
  });

  // ── categories (two passes: rows, then resolve parent_id) ─────────────────
  const categoryRows = categories.map(c => {
    const id = idFor('categories', c.__id);
    categoryIdByDoc.set(c.__id, id);
    if (c.slug) categoryIdBySlug.set(c.slug, id);
    return {
      id,
      slug: c.slug,
      name: c.name,
      description: orNull(c.description),
      image: orNull(c.image),
      parent_id: null,               // resolved below
      display_order: c.displayOrder ?? null,
      created_at: toIso(c.createdAt),
      __parentDoc: c.parentId ?? null,
    };
  });
  for (const row of categoryRows) {
    if (row.__parentDoc) {
      const parent = categoryIdByDoc.get(row.__parentDoc);
      if (parent) row.parent_id = parent;
      else warn(`category '${row.slug}' has unknown parentId '${row.__parentDoc}'`);
    }
    delete row.__parentDoc;
  }

  // ── industries ────────────────────────────────────────────────────────────
  const industryRows = industries.map(i => {
    const id = idFor('industries', i.__id);
    industryIdByDoc.set(i.__id, id);
    return {
      id,
      // industries may lack a slug in Firestore; derive one stably if missing.
      slug: i.slug || slugifyCategoryName(i.name),
      name: i.name,
      description: orNull(i.description),
      image: orNull(i.image),
      created_at: toIso(i.createdAt),
    };
  });

  // ── products + product_industries ─────────────────────────────────────────
  const productRows = [];
  const productIndustryRows = [];
  const unresolvedCategory = [];
  const unresolvedBrand = [];

  for (const p of products) {
    const id = idFor('products', p.__id);

    // Resolve category NAME -> category row (slugify name, match slug).
    let category_id = null;
    if (p.category) {
      const slug = slugifyCategoryName(p.category);
      category_id = categoryIdBySlug.get(slug) ?? null;
      if (!category_id) unresolvedCategory.push({ product: p.slug, category: p.category });
    }
    // Resolve brand NAME -> brand row (exact name).
    let brand_id = null;
    if (p.brand) {
      brand_id = brandIdByName.get(p.brand) ?? null;
      if (!brand_id) unresolvedBrand.push({ product: p.slug, brand: p.brand });
    }

    productRows.push({
      id,
      slug: p.slug,                        // preserved byte-for-byte
      name: p.name,
      model: orNull(p.model),
      sku: orNull(p.sku),
      subcategory: orNull(p.subcategory),
      category_id,
      brand_id,
      category_name: orNull(p.category),   // denormalized for display / back-compat
      brand_name: orNull(p.brand),
      short_description: orNull(p.shortDescription),
      full_description: orNull(p.fullDescription),
      image: orNull(p.image),              // Cloudinary URL, unchanged
      specifications: asArray(p.specifications),
      applications: asArray(p.applications),
      features: asArray(p.features),
      tags: asArray(p.tags),
      images: asArray(p.images),
      gallery: asArray(p.gallery),
      variants: asArray(p.variants),
      featured: !!p.featured,
      is_flash_sale: !!p.isFlashSale,
      status: p.status === 'inactive' ? 'inactive' : 'active',
      display_order: p.displayOrder ?? null,
      price: toNumeric(p.price),
      stock_qty: toInt(p.stockQty),        // string -> int
      spec_sheet_url: orNull(p.specSheetUrl),
      seo_title: orNull(p.seoTitle),
      seo_description: orNull(p.seoDescription),
      created_at: toIso(p.createdAt),
      updated_at: toIso(p.updatedAt),
    });

    // industryIDs[] (doc ids) -> join rows
    for (const indDoc of asArray(p.industryIDs)) {
      const industry_id = industryIdByDoc.get(indDoc);
      if (industry_id) productIndustryRows.push({ product_id: id, industry_id });
      else warn(`product '${p.slug}' references unknown industry id '${indDoc}'`);
    }
  }
  if (unresolvedCategory.length) report.unresolved.category = unresolvedCategory;
  if (unresolvedBrand.length) report.unresolved.brand = unresolvedBrand;

  // ── profiles (from users) ─────────────────────────────────────────────────
  // In Supabase the profile PK must equal auth.users.id (a NEW uuid). We only
  // know that uuid after Phase 3. So:
  //   - If authMap has the firebase uid, set id to the mapped auth uuid.
  //   - Else emit the row WITHOUT id (staged) — loaded/backfilled after auth.
  // The handle_new_user trigger also creates a bare profile on import; the load
  // step upserts extra fields (company/phone/role) onto it by firebase_uid.
  const profileRows = users.map(u => {
    const firebase_uid = u.uid || u.__id;   // users doc id IS the firebase uid
    const mappedId = authMap[firebase_uid] || null;
    return {
      id: mappedId,                          // null until auth import maps it
      firebase_uid,
      email: orNull(u.email),
      display_name: orNull(u.displayName),
      company: orNull(u.company),
      phone: orNull(u.phone),
      role: u.role === 'admin' ? 'admin' : 'customer',
      created_at: toIso(u.createdAt),
    };
  });

  // ── quotes + quote_items ──────────────────────────────────────────────────
  const quoteRows = [];
  const quoteItemRows = [];
  let guestQuotes = 0;
  // Map ORIGINAL firestore product id -> new uuid, so quote items resolve.
  const productUuidByFirestoreId = new Map(products.map(p => [p.__id, idFor('products', p.__id)]));

  for (const q of quotes) {
    const id = idFor('quotes', q.__id);
    const firebase_uid = q.userId || null;
    let user_id = null;
    if (firebase_uid) {
      user_id = authMap[firebase_uid] || null;
      if (!user_id) { /* staged via firebase_uid for backfill */ }
    } else {
      guestQuotes++;
    }

    quoteRows.push({
      id,
      user_id,
      firebase_uid,                          // staging for backfill
      name: orNull(q.name),
      company: orNull(q.company),
      email: orNull(q.email),
      phone: orNull(q.phone),
      country: orNull(q.country),
      state: orNull(q.state),
      city: orNull(q.city),
      message: orNull(q.message),
      status: q.status || 'New',
      logistics_type: q.logisticsType || null,
      bank_slip_url: orNull(q.bankSlipUrl),  // Cloudinary URL, unchanged
      internal_notes: orNull(q.internalNotes),
      assigned_to: orNull(q.assignedTo),
      created_at: toIso(q.createdAt),
      updated_at: toIso(q.updatedAt),
    });

    // products[] -> quote_items child rows (deterministic id per quote+index)
    asArray(q.products).forEach((item, idx) => {
      quoteItemRows.push({
        id: idFor('quote_items', `${q.__id}:${idx}`),
        quote_id: id,
        product_id: item.id ? (productUuidByFirestoreId.get(item.id) || null) : null,
        product_ref_id: item.id || null,     // keep original id for audit
        name: orNull(item.name),
        brand: orNull(item.brand),
        model: orNull(item.model),
        variant_id: orNull(item.variantId),
        variant_label: orNull(item.variantLabel),
        quantity: toInt(item.quantity) ?? 1,
        price: toNumeric(item.price),
      });
    });
  }

  // ── inquiries ─────────────────────────────────────────────────────────────
  const inquiryRows = inquiries.map(i => ({
    id: idFor('inquiries', i.__id),
    name: orNull(i.name),
    email: orNull(i.email),
    phone: orNull(i.phone),
    company: orNull(i.company),
    message: orNull(i.message),
    created_at: toIso(i.createdAt),
  }));

  // ── site_settings (single doc 'website') ──────────────────────────────────
  const settingsDoc = settingsDocs.find(d => d.__id === 'website') || settingsDocs[0] || null;
  const settingsRows = settingsDoc ? [{
    id: 1,
    company_name: orNull(settingsDoc.companyName),
    email: orNull(settingsDoc.email),
    phone: orNull(settingsDoc.phone),
    locations: asArray(settingsDoc.locations),
    social_links: settingsDoc.socialLinks || {},
    hero_carousel: asArray(settingsDoc.heroCarousel),
  }] : [];

  // ── site_content (single doc 'content' — flat { key: text } CMS map) ───────
  // Every field except the __id provenance marker becomes the content jsonb.
  const contentDoc = settingsDocs.find(d => d.__id === 'content') || null;
  const contentRows = contentDoc ? [{
    id: 1,
    content: Object.fromEntries(
      Object.entries(contentDoc).filter(([k]) => k !== '__id')
    ),
  }] : [];

  // ── Write outputs ─────────────────────────────────────────────────────────
  const out = {
    brands: brandRows,
    categories: categoryRows,
    industries: industryRows,
    products: productRows,
    product_industries: productIndustryRows,
    profiles: profileRows,
    quotes: quoteRows,
    quote_items: quoteItemRows,
    inquiries: inquiryRows,
    site_settings: settingsRows,
    site_content: contentRows,
  };
  for (const [table, rows] of Object.entries(out)) {
    fs.writeFileSync(path.join(paths.transformDir, `${table}.json`), JSON.stringify(rows, null, 2));
    console.log(`  ${String(rows.length).padStart(5)} rows  ${table}`);
  }

  report.stats = {
    guestQuotes,
    unresolvedCategoryRefs: unresolvedCategory.length,
    unresolvedBrandRefs: unresolvedBrand.length,
    profilesNeedingAuthBackfill: profileRows.filter(p => !p.id).length,
    quotesNeedingUserBackfill: quoteRows.filter(q => q.firebase_uid && !q.user_id).length,
  };
  fs.writeFileSync(path.join(paths.transformDir, '_report.json'), JSON.stringify(report, null, 2));
  console.log('\nTransform complete. Review supabase-rows/_report.json for unresolved refs.');
  console.log('  stats:', JSON.stringify(report.stats));
}

main();
