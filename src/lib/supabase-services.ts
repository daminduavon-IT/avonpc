import { supabase } from './supabase';

// ─── Types ────────────────────────────────────────────────────

export interface ProductVariant {
  id: string;
  name: string;       // e.g. "24 Pack", "96 Pack"
  sku: string;
  model: string;
  regularPrice?: number;
  flashSalePrice?: number;
  isFlashSale?: boolean;
  specSheetUrl?: string;
  stock?: number;
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
  isFlashSale?: boolean;
  flashSalePrice?: number;
  flashSaleStock?: number;
  flashSaleInitialStock?: number;
  regularPrice?: number;
  featured: boolean;
  status: 'active' | 'inactive';
  tags: string[];
  industryIDs?: string[];
  specSheetUrl?: string;
  seoTitle?: string;
  seoDescription?: string;
  displayOrder?: number;
  variants?: ProductVariant[];
  createdAt?: string;
  updatedAt?: string;
}

export interface FirestoreCategory {
  id?: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  parentId?: string;
  displayOrder?: number;
  createdAt?: string;
}

export interface FirestoreIndustry {
  id?: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  createdAt?: string;
}

export interface FirestoreBrand {
  id?: string;
  name: string;
  slug: string;
  logo: string;
  description: string;
  createdAt?: string;
}

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
  products: { id: string; name: string; brand: string; model: string; quantity: number }[];
  status: 'New' | 'In Review' | 'Quotation Sent' | 'Follow Up' | 'Closed';
  logisticsTier?: 'pickup' | 'courier' | 'avon';
  paymentMethod?: 'bank_transfer' | 'cod';
  paymentSlipUrl?: string;
  deliveryStatus?: 'Pending' | 'Processing' | 'Delivered';
  userId?: string;
  internalNotes?: string;
  assignedTo?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ContactInquiry {
  id?: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  message: string;
  createdAt?: string;
}

export interface WebsiteLocation {
  name: string;
  address: string;
  phone: string;
  email: string;
  mapLink: string;
}

export interface HeroSlide {
  image: string;
  titleLine1: string;
  titleLine2: string;
  highlightWord: string;
  subtitle: string;
}

export interface WebsiteSettings {
  companyName: string;
  email: string;
  phone: string;
  locations: WebsiteLocation[];
  socialLinks: { facebook: string; linkedin: string; twitter: string; instagram: string };
  heroCarousel: HeroSlide[];
}

export interface CommunicationSettings {
  notificationEmail: string;
  testEmailSentAt?: string;
}

// ─── Helpers ─────────────────────────────────────────────────

// Supabase uses snake_case columns; map to/from camelCase for the app.
function toProduct(row: any): FirestoreProduct {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    brand: row.brand,
    category: row.category,
    subcategory: row.subcategory,
    model: row.model,
    sku: row.sku,
    shortDescription: row.short_description,
    fullDescription: row.full_description,
    specifications: row.specifications ?? [],
    applications: row.applications ?? [],
    features: row.features ?? [],
    image: row.image,
    images: row.images ?? [],
    isFlashSale: row.is_flash_sale,
    flashSalePrice: row.flash_sale_price,
    regularPrice: row.regular_price,
    featured: row.featured,
    status: row.status,
    tags: row.tags ?? [],
    industryIDs: row.industry_ids ?? [],
    specSheetUrl: row.spec_sheet_url,
    seoTitle: row.seo_title,
    seoDescription: row.seo_description,
    displayOrder: row.display_order,
    variants: row.variants ?? [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function fromProduct(p: Partial<FirestoreProduct>) {
  const row: any = {};
  if (p.name !== undefined) row.name = p.name;
  if (p.slug !== undefined) row.slug = p.slug;
  if (p.brand !== undefined) row.brand = p.brand;
  if (p.category !== undefined) row.category = p.category;
  if (p.subcategory !== undefined) row.subcategory = p.subcategory;
  if (p.model !== undefined) row.model = p.model;
  if (p.sku !== undefined) row.sku = p.sku;
  if (p.shortDescription !== undefined) row.short_description = p.shortDescription;
  if (p.fullDescription !== undefined) row.full_description = p.fullDescription;
  if (p.specifications !== undefined) row.specifications = p.specifications;
  if (p.applications !== undefined) row.applications = p.applications;
  if (p.features !== undefined) row.features = p.features;
  if (p.image !== undefined) row.image = p.image;
  if (p.images !== undefined) row.images = p.images;
  if (p.isFlashSale !== undefined) row.is_flash_sale = p.isFlashSale;
  if (p.flashSalePrice !== undefined) row.flash_sale_price = p.flashSalePrice;
  if (p.regularPrice !== undefined) row.regular_price = p.regularPrice;
  if (p.featured !== undefined) row.featured = p.featured;
  if (p.status !== undefined) row.status = p.status;
  if (p.tags !== undefined) row.tags = p.tags;
  if (p.industryIDs !== undefined) row.industry_ids = p.industryIDs;
  if (p.specSheetUrl !== undefined) row.spec_sheet_url = p.specSheetUrl;
  if (p.seoTitle !== undefined) row.seo_title = p.seoTitle;
  if (p.seoDescription !== undefined) row.seo_description = p.seoDescription;
  if (p.displayOrder !== undefined) row.display_order = p.displayOrder;
  if (p.variants !== undefined) row.variants = p.variants;
  return row;
}

function toQuote(row: any): QuoteRequest {
  return {
    id: row.id,
    name: row.name,
    company: row.company,
    email: row.email,
    phone: row.phone,
    country: row.country,
    state: row.state,
    city: row.city,
    message: row.message,
    products: row.products ?? [],
    status: row.status,
    logisticsTier: row.logistics_tier,
    paymentMethod: row.payment_method,
    paymentSlipUrl: row.payment_slip_url,
    deliveryStatus: row.delivery_status,
    userId: row.user_id,
    internalNotes: row.internal_notes,
    assignedTo: row.assigned_to,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toCategory(row: any): FirestoreCategory {
  return {
    id: row.id, name: row.name, slug: row.slug,
    description: row.description, image: row.image,
    parentId: row.parent_id, displayOrder: row.display_order,
    createdAt: row.created_at,
  };
}

function toIndustry(row: any): FirestoreIndustry {
  return { id: row.id, name: row.name, slug: row.slug, description: row.description, image: row.image, createdAt: row.created_at };
}

function toBrand(row: any): FirestoreBrand {
  return { id: row.id, name: row.name, slug: row.slug, logo: row.logo, description: row.description, createdAt: row.created_at };
}

function toInquiry(row: any): ContactInquiry {
  return { id: row.id, name: row.name, email: row.email, phone: row.phone, company: row.company, message: row.message, createdAt: row.created_at };
}

function throwIfError<T>(data: T | null, error: any): T {
  if (error) throw new Error(error.message);
  return data as T;
}

// ─── Products ─────────────────────────────────────────────────

export const getProducts = async (filters?: { category?: string; brand?: string; featured?: boolean; status?: string }): Promise<FirestoreProduct[]> => {
  let q = supabase.from('products').select('*');
  if (filters?.category) q = q.eq('category', filters.category);
  if (filters?.brand) q = q.eq('brand', filters.brand);
  if (filters?.featured) q = q.eq('featured', true);
  if (filters?.status) q = q.eq('status', filters.status);
  const { data, error } = await q;
  throwIfError(data, error);
  return (data ?? []).map(toProduct);
};

export const getProductBySlug = async (slug: string): Promise<FirestoreProduct | null> => {
  const { data, error } = await supabase.from('products').select('*').eq('slug', slug).limit(1).maybeSingle();
  throwIfError(data, error);
  return data ? toProduct(data) : null;
};

export const getProductById = async (id: string): Promise<FirestoreProduct | null> => {
  const { data, error } = await supabase.from('products').select('*').eq('id', id).maybeSingle();
  throwIfError(data, error);
  return data ? toProduct(data) : null;
};

export const addProduct = async (product: Omit<FirestoreProduct, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const { data, error } = await supabase.from('products').insert(fromProduct(product)).select('id').single();
  throwIfError(data, error);
  return data.id;
};

export const updateProduct = async (id: string, data: Partial<FirestoreProduct>): Promise<void> => {
  const { error } = await supabase.from('products').update(fromProduct(data)).eq('id', id);
  throwIfError(null, error);
};

export const deleteProduct = async (id: string): Promise<void> => {
  const { error } = await supabase.from('products').delete().eq('id', id);
  throwIfError(null, error);
};

// ─── Categories ───────────────────────────────────────────────

export const getCategories = async (): Promise<FirestoreCategory[]> => {
  const { data, error } = await supabase.from('categories').select('*').order('display_order');
  throwIfError(data, error);
  return (data ?? []).map(toCategory);
};

export const addCategory = async (cat: Omit<FirestoreCategory, 'id' | 'createdAt'>): Promise<string> => {
  const { data, error } = await supabase.from('categories').insert({
    name: cat.name, slug: cat.slug, description: cat.description,
    image: cat.image, parent_id: cat.parentId ?? null, display_order: cat.displayOrder ?? 0,
  }).select('id').single();
  throwIfError(data, error);
  return data.id;
};

export const updateCategory = async (id: string, cat: Partial<FirestoreCategory>): Promise<void> => {
  const row: any = {};
  if (cat.name !== undefined) row.name = cat.name;
  if (cat.slug !== undefined) row.slug = cat.slug;
  if (cat.description !== undefined) row.description = cat.description;
  if (cat.image !== undefined) row.image = cat.image;
  if (cat.parentId !== undefined) row.parent_id = cat.parentId;
  if (cat.displayOrder !== undefined) row.display_order = cat.displayOrder;
  const { error } = await supabase.from('categories').update(row).eq('id', id);
  throwIfError(null, error);
};

export const deleteCategory = async (id: string): Promise<void> => {
  const { error } = await supabase.from('categories').delete().eq('id', id);
  throwIfError(null, error);
};

// ─── Industries ───────────────────────────────────────────────

export const getIndustries = async (): Promise<FirestoreIndustry[]> => {
  const { data, error } = await supabase.from('industries').select('*').order('name');
  throwIfError(data, error);
  return (data ?? []).map(toIndustry);
};

export const addIndustry = async (industry: Omit<FirestoreIndustry, 'id' | 'createdAt'>): Promise<string> => {
  const { data, error } = await supabase.from('industries').insert({
    name: industry.name, slug: industry.slug, description: industry.description, image: industry.image,
  }).select('id').single();
  throwIfError(data, error);
  return data.id;
};

export const updateIndustry = async (id: string, industry: Partial<FirestoreIndustry>): Promise<void> => {
  const row: any = {};
  if (industry.name !== undefined) row.name = industry.name;
  if (industry.slug !== undefined) row.slug = industry.slug;
  if (industry.description !== undefined) row.description = industry.description;
  if (industry.image !== undefined) row.image = industry.image;
  const { error } = await supabase.from('industries').update(row).eq('id', id);
  throwIfError(null, error);
};

export const deleteIndustry = async (id: string): Promise<void> => {
  const { error } = await supabase.from('industries').delete().eq('id', id);
  throwIfError(null, error);
};

// ─── Brands ───────────────────────────────────────────────────

export const getBrands = async (): Promise<FirestoreBrand[]> => {
  const { data, error } = await supabase.from('brands').select('*').order('name');
  throwIfError(data, error);
  return (data ?? []).map(toBrand);
};

export const addBrand = async (brand: Omit<FirestoreBrand, 'id' | 'createdAt'>): Promise<string> => {
  const { data, error } = await supabase.from('brands').insert({
    name: brand.name, slug: brand.slug, logo: brand.logo, description: brand.description,
  }).select('id').single();
  throwIfError(data, error);
  return data.id;
};

export const updateBrand = async (id: string, brand: Partial<FirestoreBrand>): Promise<void> => {
  const row: any = {};
  if (brand.name !== undefined) row.name = brand.name;
  if (brand.slug !== undefined) row.slug = brand.slug;
  if (brand.logo !== undefined) row.logo = brand.logo;
  if (brand.description !== undefined) row.description = brand.description;
  const { error } = await supabase.from('brands').update(row).eq('id', id);
  throwIfError(null, error);
};

export const deleteBrand = async (id: string): Promise<void> => {
  const { error } = await supabase.from('brands').delete().eq('id', id);
  throwIfError(null, error);
};

// ─── Quotes ───────────────────────────────────────────────────

export const getQuotes = async (): Promise<QuoteRequest[]> => {
  const { data, error } = await supabase.from('quotes').select('*').order('created_at', { ascending: false });
  throwIfError(data, error);
  return (data ?? []).map(toQuote);
};

export const getUserQuotes = async (userId: string): Promise<QuoteRequest[]> => {
  const { data, error } = await supabase.from('quotes').select('*').eq('user_id', userId).order('created_at', { ascending: false });
  throwIfError(data, error);
  return (data ?? []).map(toQuote);
};

export const getQuoteById = async (id: string): Promise<QuoteRequest | null> => {
  const { data, error } = await supabase.from('quotes').select('*').eq('id', id).maybeSingle();
  throwIfError(data, error);
  return data ? toQuote(data) : null;
};

export const submitQuote = async (quoteData: Omit<QuoteRequest, 'id' | 'status'>): Promise<string> => {
  const { data, error } = await supabase.from('quotes').insert({
    name: quoteData.name, company: quoteData.company, email: quoteData.email,
    phone: quoteData.phone, country: quoteData.country, state: quoteData.state,
    city: quoteData.city, message: quoteData.message, products: quoteData.products,
    status: 'New',
    logistics_tier: quoteData.logisticsTier,
    payment_method: quoteData.paymentMethod,
    payment_slip_url: quoteData.paymentSlipUrl,
    user_id: quoteData.userId ?? null,
  }).select('id').single();
  throwIfError(data, error);
  return data.id;
};

export const updateQuoteStatus = async (id: string, status: QuoteRequest['status'], notes?: string): Promise<void> => {
  const row: any = { status };
  if (notes !== undefined) row.internal_notes = notes;
  const { error } = await supabase.from('quotes').update(row).eq('id', id);
  throwIfError(null, error);
};

export const updateQuoteField = async (id: string, data: Partial<QuoteRequest>): Promise<void> => {
  const row: any = {};
  if (data.status !== undefined) row.status = data.status;
  if (data.deliveryStatus !== undefined) row.delivery_status = data.deliveryStatus;
  if (data.internalNotes !== undefined) row.internal_notes = data.internalNotes;
  if (data.assignedTo !== undefined) row.assigned_to = data.assignedTo;
  if (data.paymentSlipUrl !== undefined) row.payment_slip_url = data.paymentSlipUrl;
  const { error } = await supabase.from('quotes').update(row).eq('id', id);
  throwIfError(null, error);
};

// ─── Inquiries ────────────────────────────────────────────────

export const submitInquiry = async (inquiry: Omit<ContactInquiry, 'id'>): Promise<string> => {
  const { data, error } = await supabase.from('inquiries').insert({
    name: inquiry.name, email: inquiry.email, phone: inquiry.phone,
    company: inquiry.company, message: inquiry.message,
  }).select('id').single();
  throwIfError(data, error);
  return data.id;
};

export const getInquiries = async (): Promise<ContactInquiry[]> => {
  const { data, error } = await supabase.from('inquiries').select('*').order('created_at', { ascending: false });
  throwIfError(data, error);
  return (data ?? []).map(toInquiry);
};

export const deleteInquiry = async (id: string): Promise<void> => {
  const { error } = await supabase.from('inquiries').delete().eq('id', id);
  throwIfError(null, error);
};

// ─── Customers ────────────────────────────────────────────────

export const getCustomers = async () => {
  const { data, error } = await supabase.from('profiles').select('*').eq('role', 'customer').order('created_at', { ascending: false });
  throwIfError(data, error);
  return data ?? [];
};

// ─── Settings ─────────────────────────────────────────────────

const defaultWebsiteSettings: WebsiteSettings = {
  companyName: 'Avon Pharmo Chem (Pvt) Ltd',
  email: 'info@avonpc.com',
  phone: '+94 11 436 1909',
  locations: [{ name: 'Main Office', address: 'Nugegoda, Sri Lanka', phone: '+94 11 436 1909', email: 'info@avonpc.com', mapLink: '' }],
  socialLinks: { facebook: '', linkedin: '', twitter: '', instagram: '' },
  heroCarousel: [],
};

export const getSettings = async (): Promise<WebsiteSettings | null> => {
  const { data, error } = await supabase.from('settings').select('value').eq('key', 'website').maybeSingle();
  throwIfError(data, error);
  if (!data) return defaultWebsiteSettings;
  const val = data.value as Partial<WebsiteSettings>;
  return {
    ...defaultWebsiteSettings, ...val,
    socialLinks: { ...defaultWebsiteSettings.socialLinks, ...(val.socialLinks ?? {}) },
    locations: val.locations ?? defaultWebsiteSettings.locations,
    heroCarousel: val.heroCarousel ?? [],
  };
};

export const updateSettings = async (settings: Partial<WebsiteSettings>): Promise<void> => {
  const { error } = await supabase.from('settings').upsert({ key: 'website', value: settings });
  throwIfError(null, error);
};

export const getCommunicationSettings = async (): Promise<CommunicationSettings> => {
  const defaults: CommunicationSettings = { notificationEmail: 'avonpcit@gmail.com' };
  const { data, error } = await supabase.from('settings').select('value').eq('key', 'communications').maybeSingle();
  throwIfError(data, error);
  if (!data) return defaults;
  return { ...defaults, ...(data.value as Partial<CommunicationSettings>) };
};

export const updateCommunicationSettings = async (settings: Partial<CommunicationSettings>): Promise<void> => {
  const { error } = await supabase.from('settings').upsert({ key: 'communications', value: settings });
  throwIfError(null, error);
};

export const getContentSettings = async (): Promise<Record<string, string>> => {
  const { data, error } = await supabase.from('settings').select('value').eq('key', 'content').maybeSingle();
  throwIfError(data, error);
  return (data?.value as Record<string, string>) ?? {};
};

export const updateContentSettings = async (content: Record<string, string>): Promise<void> => {
  const { error } = await supabase.from('settings').upsert({ key: 'content', value: content });
  throwIfError(null, error);
};

// ─── File Upload (Supabase Storage) ───────────────────────────

// folder: 'products' | 'categories' | 'brands' | 'industries' | 'media' | 'quotes'
export const uploadToSupabase = async (file: File, folder: string): Promise<string> => {
  const ext = file.name.split('.').pop();
  const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const path = `${folder}/${uniqueName}`;
  const { error } = await supabase.storage.from('media').upload(path, file, { upsert: false });
  throwIfError(null, error);
  const { data } = supabase.storage.from('media').getPublicUrl(path);
  return data.publicUrl;
};

export const deleteFile = async (path: string): Promise<void> => {
  const { error } = await supabase.storage.from('media').remove([path]);
  throwIfError(null, error);
};

export const listFiles = async (folder: string): Promise<{ name: string; url: string }[]> => {
  const { data, error } = await supabase.storage.from('media').list(folder, { sortBy: { column: 'created_at', order: 'desc' } });
  throwIfError(data, error);
  return (data ?? []).map(f => ({
    name: f.name,
    url: supabase.storage.from('media').getPublicUrl(`${folder}/${f.name}`).data.publicUrl,
  }));
};

// ─── Dashboard Stats ──────────────────────────────────────────

export const getDashboardStats = async () => {
  const [products, categories, brands, quotes, inquiries] = await Promise.all([
    supabase.from('products').select('id', { count: 'exact', head: true }),
    supabase.from('categories').select('id', { count: 'exact', head: true }),
    supabase.from('brands').select('id', { count: 'exact', head: true }),
    supabase.from('quotes').select('id', { count: 'exact', head: true }),
    supabase.from('inquiries').select('id', { count: 'exact', head: true }),
  ]);
  return {
    totalProducts: products.count ?? 0,
    totalCategories: categories.count ?? 0,
    totalBrands: brands.count ?? 0,
    totalQuotes: quotes.count ?? 0,
    totalInquiries: inquiries.count ?? 0,
  };
};
