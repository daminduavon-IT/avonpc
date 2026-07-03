// ============================================================================
// Supabase data services — DROP-IN replacement for firestore-services.ts.
//
// Every exported name, signature, and RETURN SHAPE matches the old Firestore
// service so pages / components / React Query hooks change minimally. Rows come
// back as the same camelCase `Firestore*` interfaces the app already consumes,
// and `createdAt`/`updatedAt` are Timestamp-compatible shims exposing
// .toDate() / .toMillis() / .seconds so existing call sites keep working.
// ============================================================================

import { supabase } from './supabase';

// ─── Timestamp compatibility shim ────────────────────────────────────────────
// The app calls createdAt.toDate() / .toMillis() / reads .seconds in several
// places. Supabase returns ISO strings; wrap them so those call sites are
// unchanged. toDateSafe() in utils.ts also understands { seconds }.
export interface TimestampCompat {
  toDate: () => Date;
  toMillis: () => number;
  seconds: number;
  nanoseconds: number;
}
function ts(iso: string | null | undefined): TimestampCompat | undefined {
  if (!iso) return undefined;
  const ms = new Date(iso).getTime();
  if (Number.isNaN(ms)) return undefined;
  return {
    toDate: () => new Date(ms),
    toMillis: () => ms,
    seconds: Math.floor(ms / 1000),
    nanoseconds: (ms % 1000) * 1e6,
  };
}

// Strip undefined (parity with the old services, which cleaned undefined before
// writing because Firestore rejected it; harmless for Postgres too).
function clean<T extends Record<string, unknown>>(obj: T): Partial<T> {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined)) as Partial<T>;
}

// ─── Products ────────────────────────────────────────────────────────────────

export interface ProductVariant {
  id: string;
  sku: string;
  selectionLabel: string;
  stockQty: number;
  price: number;
  description?: string;
}

export interface FirestoreProduct {
  id?: string;
  name: string;
  slug: string;
  brand: string;
  category: string;
  subcategory?: string;
  model: string;
  sku: string;
  shortDescription: string;
  fullDescription: string;
  specifications: { label: string; value: string }[];
  applications: string[];
  features: string[];
  image: string;
  images: string[];
  featured: boolean;
  status: 'active' | 'inactive';
  tags: string[];
  industryIDs?: string[];
  specSheetUrl?: string;
  seoTitle?: string;
  seoDescription?: string;
  displayOrder?: number;
  price?: number;
  stockQty?: string;
  isFlashSale?: boolean;
  selectionType?: string;
  variants?: ProductVariant[];
  gallery?: string[];
  createdAt?: any;
  updatedAt?: any;
}

// Map a Supabase products row (+ joined industries) -> the app's FirestoreProduct shape.
function rowToProduct(r: any): FirestoreProduct {
  const industryIDs = Array.isArray(r.product_industries)
    ? r.product_industries.map((pi: any) => pi.industry_id)
    : (r.industryIDs ?? []);
  return {
    id: r.id,
    name: r.name,
    slug: r.slug,
    brand: r.brand_name ?? '',
    category: r.category_name ?? '',
    subcategory: r.subcategory ?? undefined,
    model: r.model ?? '',
    sku: r.sku ?? '',
    shortDescription: r.short_description ?? '',
    fullDescription: r.full_description ?? '',
    specifications: r.specifications ?? [],
    applications: r.applications ?? [],
    features: r.features ?? [],
    image: r.image ?? '',
    images: r.images ?? [],
    featured: !!r.featured,
    status: r.status,
    tags: r.tags ?? [],
    industryIDs,
    specSheetUrl: r.spec_sheet_url ?? undefined,
    seoTitle: r.seo_title ?? undefined,
    seoDescription: r.seo_description ?? undefined,
    displayOrder: r.display_order ?? undefined,
    price: r.price ?? undefined,
    stockQty: r.stock_qty != null ? String(r.stock_qty) : undefined,
    isFlashSale: !!r.is_flash_sale,
    selectionType: r.selection_type ?? undefined,
    variants: r.variants ?? undefined,
    gallery: r.gallery ?? undefined,
    createdAt: ts(r.created_at),
    updatedAt: ts(r.updated_at),
  };
}

// Map the app's product payload -> a Supabase products row (snake_case).
// industryIDs are handled separately (join table), not on the row.
function productToRow(p: Partial<FirestoreProduct>): Record<string, unknown> {
  const row: Record<string, unknown> = {
    name: p.name,
    slug: p.slug,
    brand_name: p.brand,
    category_name: p.category,
    subcategory: p.subcategory,
    model: p.model,
    sku: p.sku,
    short_description: p.shortDescription,
    full_description: p.fullDescription,
    specifications: p.specifications,
    applications: p.applications,
    features: p.features,
    image: p.image,
    images: p.images,
    featured: p.featured,
    status: p.status,
    tags: p.tags,
    spec_sheet_url: p.specSheetUrl,
    seo_title: p.seoTitle,
    seo_description: p.seoDescription,
    display_order: p.displayOrder,
    price: p.price,
    stock_qty: p.stockQty != null && p.stockQty !== '' ? parseInt(String(p.stockQty), 10) : undefined,
    is_flash_sale: p.isFlashSale,
    variants: p.variants,
    gallery: p.gallery,
  };
  return clean(row);
}

const PRODUCT_SELECT = '*, product_industries(industry_id)';

export const getProducts = async (filters?: { category?: string; brand?: string; featured?: boolean; status?: string }) => {
  let q = supabase.from('products').select(PRODUCT_SELECT);
  // The old API filtered category/brand by NAME; keep that behavior.
  if (filters?.category) q = q.eq('category_name', filters.category);
  if (filters?.brand) q = q.eq('brand_name', filters.brand);
  if (filters?.featured) q = q.eq('featured', true);
  if (filters?.status) q = q.eq('status', filters.status);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []).map(rowToProduct);
};

export const getProductBySlug = async (slug: string) => {
  const { data, error } = await supabase.from('products').select(PRODUCT_SELECT).eq('slug', slug).maybeSingle();
  if (error) throw error;
  return data ? rowToProduct(data) : null;
};

export const getProductById = async (id: string) => {
  const { data, error } = await supabase.from('products').select(PRODUCT_SELECT).eq('id', id).maybeSingle();
  if (error) throw error;
  return data ? rowToProduct(data) : null;
};

// Sync a product's industry join rows to the given list of industry ids.
async function syncProductIndustries(productId: string, industryIDs?: string[]) {
  if (!industryIDs) return;
  await supabase.from('product_industries').delete().eq('product_id', productId);
  if (industryIDs.length) {
    const rows = industryIDs.map(industry_id => ({ product_id: productId, industry_id }));
    const { error } = await supabase.from('product_industries').insert(rows);
    if (error) throw error;
  }
}

export const addProduct = async (product: Omit<FirestoreProduct, 'id'>) => {
  const { data, error } = await supabase.from('products').insert(productToRow(product)).select('id').single();
  if (error) throw error;
  await syncProductIndustries(data.id, product.industryIDs);
  return data.id as string;
};

export const updateProduct = async (id: string, data: Partial<FirestoreProduct>) => {
  const { error } = await supabase.from('products').update(productToRow(data)).eq('id', id);
  if (error) throw error;
  if (data.industryIDs !== undefined) await syncProductIndustries(id, data.industryIDs);
};

export const deleteProduct = async (id: string) => {
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw error;
};

// ─── Categories ──────────────────────────────────────────────────────────────

export interface FirestoreCategory {
  id?: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  parentId?: string;
  displayOrder?: number;
  createdAt?: any;
}

function rowToCategory(r: any): FirestoreCategory {
  return {
    id: r.id,
    name: r.name,
    slug: r.slug,
    description: r.description ?? '',
    image: r.image ?? '',
    parentId: r.parent_id ?? undefined,
    displayOrder: r.display_order ?? undefined,
    createdAt: ts(r.created_at),
  };
}
function categoryToRow(c: Partial<FirestoreCategory>) {
  return clean({
    name: c.name, slug: c.slug, description: c.description, image: c.image,
    parent_id: c.parentId, display_order: c.displayOrder,
  });
}

export const getCategories = async () => {
  const { data, error } = await supabase.from('categories').select('*');
  if (error) throw error;
  return (data ?? []).map(rowToCategory);
};
export const addCategory = async (cat: Omit<FirestoreCategory, 'id'>) => {
  const { data, error } = await supabase.from('categories').insert(categoryToRow(cat)).select('id').single();
  if (error) throw error;
  return data.id as string;
};
export const updateCategory = async (id: string, data: Partial<FirestoreCategory>) => {
  const { error } = await supabase.from('categories').update(categoryToRow(data)).eq('id', id);
  if (error) throw error;
};
export const deleteCategory = async (id: string) => {
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) throw error;
};

// ─── Industries ────────────────────────────────────────────────────────────

export interface FirestoreIndustry {
  id?: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  createdAt?: any;
}

function rowToIndustry(r: any): FirestoreIndustry {
  return {
    id: r.id, name: r.name, slug: r.slug,
    description: r.description ?? '', image: r.image ?? '',
    createdAt: ts(r.created_at),
  };
}
function industryToRow(i: Partial<FirestoreIndustry>) {
  return clean({ name: i.name, slug: i.slug, description: i.description, image: i.image });
}

export const getIndustries = async () => {
  const { data, error } = await supabase.from('industries').select('*');
  if (error) throw error;
  return (data ?? []).map(rowToIndustry);
};
export const addIndustry = async (industry: Omit<FirestoreIndustry, 'id'>) => {
  const { data, error } = await supabase.from('industries').insert(industryToRow(industry)).select('id').single();
  if (error) throw error;
  return data.id as string;
};
export const updateIndustry = async (id: string, data: Partial<FirestoreIndustry>) => {
  const { error } = await supabase.from('industries').update(industryToRow(data)).eq('id', id);
  if (error) throw error;
};
export const deleteIndustry = async (id: string) => {
  const { error } = await supabase.from('industries').delete().eq('id', id);
  if (error) throw error;
};

// ─── Brands ──────────────────────────────────────────────────────────────────

export interface FirestoreBrand {
  id?: string;
  name: string;
  slug: string;
  logo: string;
  description: string;
  createdAt?: any;
}

function rowToBrand(r: any): FirestoreBrand {
  return {
    id: r.id, name: r.name, slug: r.slug,
    logo: r.logo ?? '', description: r.description ?? '',
    createdAt: ts(r.created_at),
  };
}
function brandToRow(b: Partial<FirestoreBrand>) {
  return clean({ name: b.name, slug: b.slug, logo: b.logo, description: b.description });
}

export const getBrands = async () => {
  const { data, error } = await supabase.from('brands').select('*');
  if (error) throw error;
  return (data ?? []).map(rowToBrand);
};
export const addBrand = async (brand: Omit<FirestoreBrand, 'id'>) => {
  const { data, error } = await supabase.from('brands').insert(brandToRow(brand)).select('id').single();
  if (error) throw error;
  return data.id as string;
};
export const updateBrand = async (id: string, data: Partial<FirestoreBrand>) => {
  const { error } = await supabase.from('brands').update(brandToRow(data)).eq('id', id);
  if (error) throw error;
};
export const deleteBrand = async (id: string) => {
  const { error } = await supabase.from('brands').delete().eq('id', id);
  if (error) throw error;
};

// ─── Quotes ──────────────────────────────────────────────────────────────────

export interface QuoteRequest {
  id?: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  country: string;
  state: string;
  city: string;
  message: string;
  products: { id: string; name: string; brand: string; model: string; quantity: number; variantId?: string; variantLabel?: string; price?: number }[];
  status: 'New' | 'In Review' | 'Quotation Sent' | 'Follow Up' | 'Closed';
  logisticsType?: 'Pickup' | 'Courier' | 'Avon Delivery';
  bankSlipUrl?: string;
  userId?: string;
  internalNotes?: string;
  assignedTo?: string;
  createdAt?: any;
  updatedAt?: any;
}

// Map a quote row (+ joined quote_items) -> the app's QuoteRequest shape.
function rowToQuote(r: any): QuoteRequest {
  const items = Array.isArray(r.quote_items) ? r.quote_items : [];
  return {
    id: r.id,
    name: r.name ?? '',
    company: r.company ?? '',
    email: r.email ?? '',
    phone: r.phone ?? '',
    country: r.country ?? '',
    state: r.state ?? '',
    city: r.city ?? '',
    message: r.message ?? '',
    products: items.map((it: any) => ({
      id: it.product_ref_id ?? it.product_id ?? '',
      name: it.name ?? '',
      brand: it.brand ?? '',
      model: it.model ?? '',
      quantity: it.quantity ?? 1,
      variantId: it.variant_id ?? undefined,
      variantLabel: it.variant_label ?? undefined,
      price: it.price ?? undefined,
    })),
    status: r.status,
    logisticsType: r.logistics_type ?? undefined,
    bankSlipUrl: r.bank_slip_url ?? undefined,
    userId: r.user_id ?? undefined,
    internalNotes: r.internal_notes ?? undefined,
    assignedTo: r.assigned_to ?? undefined,
    createdAt: ts(r.created_at),
    updatedAt: ts(r.updated_at),
  };
}

const QUOTE_SELECT = '*, quote_items(*)';

export const getQuotes = async () => {
  const { data, error } = await supabase.from('quotes').select(QUOTE_SELECT).order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(rowToQuote);
};

export const getUserQuotes = async (userId: string) => {
  const { data, error } = await supabase.from('quotes').select(QUOTE_SELECT)
    .eq('user_id', userId).order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(rowToQuote);
};

export const getQuoteById = async (id: string) => {
  const { data, error } = await supabase.from('quotes').select(QUOTE_SELECT).eq('id', id).maybeSingle();
  if (error) throw error;
  return data ? rowToQuote(data) : null;
};

export const submitQuote = async (quoteData: Omit<QuoteRequest, 'id' | 'status'>) => {
  // Insert the quote header, then its line items (mirrors the child-table model).
  const { products, ...header } = quoteData;
  const { data: quote, error } = await supabase.from('quotes').insert(clean({
    name: header.name, company: header.company, email: header.email, phone: header.phone,
    country: header.country, state: header.state, city: header.city, message: header.message,
    logistics_type: header.logisticsType, bank_slip_url: header.bankSlipUrl,
    user_id: header.userId, status: 'New',
  })).select('id').single();
  if (error) throw error;

  if (products?.length) {
    const items = products.map(p => ({
      quote_id: quote.id,
      product_id: null,               // resolve server-side if needed; ref id kept below
      product_ref_id: p.id ?? null,
      name: p.name, brand: p.brand, model: p.model,
      variant_id: p.variantId ?? null, variant_label: p.variantLabel ?? null,
      quantity: p.quantity ?? 1, price: p.price ?? null,
    }));
    const { error: itemsErr } = await supabase.from('quote_items').insert(items);
    if (itemsErr) throw itemsErr;
  }

  // Preserve the old inventory-deduction behavior (best-effort, non-fatal).
  try {
    for (const item of products ?? []) {
      if (!item.id) continue;
      const { data: prod } = await supabase.from('products')
        .select('id, stock_qty, variants').eq('id', item.id).maybeSingle();
      if (!prod) continue;
      if (item.variantId && Array.isArray(prod.variants)) {
        const variants = prod.variants.map((v: any) =>
          v.id === item.variantId && v.stockQty !== undefined
            ? { ...v, stockQty: Math.max(0, v.stockQty - item.quantity) } : v);
        await supabase.from('products').update({ variants }).eq('id', item.id);
      } else if (prod.stock_qty != null) {
        await supabase.from('products').update({
          stock_qty: Math.max(0, prod.stock_qty - item.quantity),
        }).eq('id', item.id);
      }
    }
  } catch (e) {
    console.error('Inventory deduction error:', e);
  }

  return quote.id as string;
};

export const updateQuoteStatus = async (id: string, status: QuoteRequest['status'], notes?: string) => {
  const patch: Record<string, unknown> = { status };
  if (notes !== undefined) patch.internal_notes = notes;
  const { error } = await supabase.from('quotes').update(patch).eq('id', id);
  if (error) throw error;
};

// ─── Contact Inquiries ───────────────────────────────────────────────────────

export interface ContactInquiry {
  id?: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  message: string;
  createdAt?: any;
}

function rowToInquiry(r: any): ContactInquiry {
  return {
    id: r.id, name: r.name ?? '', email: r.email ?? '', phone: r.phone ?? '',
    company: r.company ?? '', message: r.message ?? '', createdAt: ts(r.created_at),
  };
}

export const submitInquiry = async (inquiry: Omit<ContactInquiry, 'id'>) => {
  const { data, error } = await supabase.from('inquiries').insert(clean({
    name: inquiry.name, email: inquiry.email, phone: inquiry.phone,
    company: inquiry.company, message: inquiry.message,
  })).select('id').single();
  if (error) throw error;
  return data.id as string;
};

export const getInquiries = async () => {
  const { data, error } = await supabase.from('inquiries').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(rowToInquiry);
};

// ─── Customers ───────────────────────────────────────────────────────────────

export const getCustomers = async () => {
  // Old API returned users docs as { id, ...data }. Profiles mirror that.
  const { data, error } = await supabase.from('profiles').select('*');
  if (error) throw error;
  return (data ?? []).map((r: any) => ({
    id: r.id,
    uid: r.id,
    email: r.email ?? '',
    displayName: r.display_name ?? '',
    company: r.company ?? '',
    phone: r.phone ?? '',
    role: r.role,
    createdAt: ts(r.created_at),
  }));
};

// ─── Website Settings ────────────────────────────────────────────────────────

export interface WebsiteLocation {
  name: string; address: string; phone: string; email: string; mapLink: string;
}
export interface HeroSlide {
  image: string; titleLine1: string; titleLine2: string; highlightWord: string; subtitle: string;
}
export interface WebsiteSettings {
  companyName: string;
  email: string;
  phone: string;
  locations: WebsiteLocation[];
  socialLinks: { facebook: string; linkedin: string; twitter: string; instagram: string };
  heroCarousel: HeroSlide[];
}

const SETTINGS_DEFAULTS: WebsiteSettings = {
  companyName: 'Avon Pharmo Chem (Pvt) Ltd',
  email: 'info@avonpc.com',
  phone: '+91 79 2583 1234',
  locations: [{
    name: 'Main Office',
    address: '123 Industrial Area, Ahmedabad, Gujarat 380015, India',
    phone: '+91 79 2583 1234', email: 'info@avonpc.com', mapLink: '',
  }],
  socialLinks: { facebook: '', linkedin: '', twitter: '', instagram: '' },
  heroCarousel: [
    { image: 'https://images.unsplash.com/photo-1581093588401-fbb62a02f120?auto=format(c)&fit=crop&q=80', titleLine1: 'Trusted', titleLine2: 'Equipment Supplier', highlightWord: 'Laboratory', subtitle: 'Glassware • Instruments • Safety Equipment • Lab Furniture' },
    { image: 'https://images.unsplash.com/photo-1579154235602-3c2c2446051b?auto=format&fit=crop&q=80', titleLine1: 'Advanced', titleLine2: 'Solutions', highlightWord: 'Scientific', subtitle: 'Providing cutting-edge technology for precise research & analysis' },
  ],
};

export const getSettings = async (): Promise<WebsiteSettings | null> => {
  const { data, error } = await supabase.from('site_settings').select('*').eq('id', 1).maybeSingle();
  if (error) throw error;
  if (!data) return SETTINGS_DEFAULTS;
  return {
    ...SETTINGS_DEFAULTS,
    companyName: data.company_name ?? SETTINGS_DEFAULTS.companyName,
    email: data.email ?? SETTINGS_DEFAULTS.email,
    phone: data.phone ?? SETTINGS_DEFAULTS.phone,
    socialLinks: { ...SETTINGS_DEFAULTS.socialLinks, ...(data.social_links || {}) },
    locations: (data.locations && data.locations.length) ? data.locations : SETTINGS_DEFAULTS.locations,
    heroCarousel: (data.hero_carousel && data.hero_carousel.length) ? data.hero_carousel : SETTINGS_DEFAULTS.heroCarousel,
  };
};

export const updateSettings = async (data: Partial<WebsiteSettings>) => {
  const { error } = await supabase.from('site_settings').upsert({
    id: 1,
    company_name: data.companyName,
    email: data.email,
    phone: data.phone,
    locations: data.locations,
    social_links: data.socialLinks,
    hero_carousel: data.heroCarousel,
  }, { onConflict: 'id' });
  if (error) throw error;
};

// ─── File Upload (Supabase Storage) ──────────────────────────────────────────
// NOTE: The app uploads images to CLOUDINARY (unchanged). These helpers existed
// in the old service for Firebase Storage; kept with matching signatures in case
// anything references them. They now target a Supabase 'media' bucket.

export const uploadFile = async (file: File, path: string): Promise<string> => {
  const { error } = await supabase.storage.from('media').upload(path, file, { upsert: true });
  if (error) throw error;
  const { data } = supabase.storage.from('media').getPublicUrl(path);
  return data.publicUrl;
};

export const deleteFile = async (path: string) => {
  const { error } = await supabase.storage.from('media').remove([path]);
  if (error) throw error;
};

// ─── Site Content (CMS text map) ─────────────────────────────────────────────
// Was Firestore settings/content — a flat { key: text } map.

export const getSiteContent = async (): Promise<Record<string, string>> => {
  const { data, error } = await supabase.from('site_content').select('content').eq('id', 1).maybeSingle();
  if (error) throw error;
  return (data?.content as Record<string, string>) ?? {};
};

export const updateSiteContent = async (contentMap: Record<string, string>) => {
  const { error } = await supabase.from('site_content')
    .upsert({ id: 1, content: contentMap }, { onConflict: 'id' });
  if (error) throw error;
};

// ─── Aliases / functions the (new) UI expects ────────────────────────────────
// The reworked UI calls these names; map them onto our schema so the new pages
// work against our real database without changing the DB.

// Content settings == our site_content CMS map.
export const getContentSettings = getSiteContent;
export const updateContentSettings = updateSiteContent;

// Communication settings (e.g. notification email). Stored in site_content under
// a reserved key so we don't need a schema change; kept separate from CMS text.
export interface CommunicationSettings {
  notificationEmail: string;
}
const COMM_KEY = '__communications__';

export const getCommunicationSettings = async (): Promise<CommunicationSettings> => {
  const defaults: CommunicationSettings = { notificationEmail: 'avonpcit@gmail.com' };
  const map = await getSiteContent();
  const raw = map[COMM_KEY];
  if (!raw) return defaults;
  try { return { ...defaults, ...JSON.parse(raw) }; } catch { return defaults; }
};

export const updateCommunicationSettings = async (settings: Partial<CommunicationSettings>) => {
  const map = await getSiteContent();
  const current = map[COMM_KEY] ? JSON.parse(map[COMM_KEY]) : {};
  map[COMM_KEY] = JSON.stringify({ ...current, ...settings });
  await updateSiteContent(map);
};

// Patch arbitrary quote fields (new UI's generic editor). Maps camelCase ->
// snake_case for the columns the UI edits.
export const updateQuoteField = async (id: string, data: Partial<QuoteRequest>) => {
  const patch: Record<string, unknown> = {};
  if (data.status !== undefined) patch.status = data.status;
  if (data.internalNotes !== undefined) patch.internal_notes = data.internalNotes;
  if (data.assignedTo !== undefined) patch.assigned_to = data.assignedTo;
  if (data.logisticsType !== undefined) patch.logistics_type = data.logisticsType;
  if (data.bankSlipUrl !== undefined) patch.bank_slip_url = data.bankSlipUrl;
  const { error } = await supabase.from('quotes').update(patch).eq('id', id);
  if (error) throw error;
};

export const deleteInquiry = async (id: string) => {
  const { error } = await supabase.from('inquiries').delete().eq('id', id);
  if (error) throw error;
};

// Upload a file to the Supabase 'media' bucket under a folder, unique name.
export const uploadToSupabase = async (file: File, folder: string): Promise<string> => {
  const ext = file.name.split('.').pop();
  const uniqueName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage.from('media').upload(uniqueName, file, { upsert: false });
  if (error) throw error;
  const { data } = supabase.storage.from('media').getPublicUrl(uniqueName);
  return data.publicUrl;
};

export const listFiles = async (folder: string): Promise<{ name: string; url: string }[]> => {
  const { data, error } = await supabase.storage.from('media')
    .list(folder, { sortBy: { column: 'created_at', order: 'desc' } });
  if (error) throw error;
  return (data ?? []).map(f => ({
    name: f.name,
    url: supabase.storage.from('media').getPublicUrl(`${folder}/${f.name}`).data.publicUrl,
  }));
};

// ─── Dashboard Stats ─────────────────────────────────────────────────────────

export const getDashboardStats = async () => {
  const [products, categories, brands, quotes, inquiries] = await Promise.all([
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase.from('categories').select('*', { count: 'exact', head: true }),
    supabase.from('brands').select('*', { count: 'exact', head: true }),
    supabase.from('quotes').select('*', { count: 'exact', head: true }),
    supabase.from('inquiries').select('*', { count: 'exact', head: true }),
  ]);
  return {
    totalProducts: products.count ?? 0,
    totalCategories: categories.count ?? 0,
    totalBrands: brands.count ?? 0,
    totalQuotes: quotes.count ?? 0,
    totalInquiries: inquiries.count ?? 0,
  };
};
