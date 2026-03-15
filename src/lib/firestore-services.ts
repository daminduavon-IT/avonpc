import {
  collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, limit, serverTimestamp, Timestamp,
  DocumentData, QueryConstraint,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from './firebase';

// ─── Products ────────────────────────────────────────────────────────

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
  seoTitle?: string;
  seoDescription?: string;
  displayOrder?: number;
  createdAt?: any;
  updatedAt?: any;
}

const productsCol = collection(db, 'products');

export const getProducts = async (filters?: { category?: string; brand?: string; featured?: boolean; status?: string }) => {
  const constraints: QueryConstraint[] = [];
  if (filters?.category) constraints.push(where('category', '==', filters.category));
  if (filters?.brand) constraints.push(where('brand', '==', filters.brand));
  if (filters?.featured) constraints.push(where('featured', '==', true));
  if (filters?.status) constraints.push(where('status', '==', filters.status));

  const q = constraints.length > 0 ? query(productsCol, ...constraints) : productsCol;
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as FirestoreProduct));
};

export const getProductBySlug = async (slug: string) => {
  const q = query(productsCol, where('slug', '==', slug), limit(1));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as FirestoreProduct;
};

export const getProductById = async (id: string) => {
  const snap = await getDoc(doc(db, 'products', id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as FirestoreProduct;
};

export const addProduct = async (product: Omit<FirestoreProduct, 'id'>) => {
  const docRef = await addDoc(productsCol, {
    ...product,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};

export const updateProduct = async (id: string, data: Partial<FirestoreProduct>) => {
  await updateDoc(doc(db, 'products', id), { ...data, updatedAt: serverTimestamp() });
};

export const deleteProduct = async (id: string) => {
  await deleteDoc(doc(db, 'products', id));
};

// ─── Categories ──────────────────────────────────────────────────────

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

const categoriesCol = collection(db, 'categories');

export const getCategories = async () => {
  const snapshot = await getDocs(categoriesCol);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as FirestoreCategory));
};

export const addCategory = async (cat: Omit<FirestoreCategory, 'id'>) => {
  const docRef = await addDoc(categoriesCol, { ...cat, createdAt: serverTimestamp() });
  return docRef.id;
};

export const updateCategory = async (id: string, data: Partial<FirestoreCategory>) => {
  await updateDoc(doc(db, 'categories', id), data);
};

export const deleteCategory = async (id: string) => {
  await deleteDoc(doc(db, 'categories', id));
};

// ─── Brands ──────────────────────────────────────────────────────────

export interface FirestoreBrand {
  id?: string;
  name: string;
  slug: string;
  logo: string;
  description: string;
  createdAt?: any;
}

const brandsCol = collection(db, 'brands');

export const getBrands = async () => {
  const snapshot = await getDocs(brandsCol);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as FirestoreBrand));
};

export const addBrand = async (brand: Omit<FirestoreBrand, 'id'>) => {
  const docRef = await addDoc(brandsCol, { ...brand, createdAt: serverTimestamp() });
  return docRef.id;
};

export const updateBrand = async (id: string, data: Partial<FirestoreBrand>) => {
  await updateDoc(doc(db, 'brands', id), data);
};

export const deleteBrand = async (id: string) => {
  await deleteDoc(doc(db, 'brands', id));
};

// ─── Quotes ──────────────────────────────────────────────────────────

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
  internalNotes?: string;
  assignedTo?: string;
  createdAt?: any;
  updatedAt?: any;
}

const quotesCol = collection(db, 'quotes');

export const getQuotes = async () => {
  const q = query(quotesCol, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as QuoteRequest));
};

export const getQuoteById = async (id: string) => {
  const snap = await getDoc(doc(db, 'quotes', id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as QuoteRequest;
};

export const submitQuote = async (quoteData: Omit<QuoteRequest, 'id' | 'status'>) => {
  const docRef = await addDoc(quotesCol, {
    ...quoteData,
    status: 'New',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};

export const updateQuoteStatus = async (id: string, status: QuoteRequest['status'], notes?: string) => {
  const data: any = { status, updatedAt: serverTimestamp() };
  if (notes !== undefined) data.internalNotes = notes;
  await updateDoc(doc(db, 'quotes', id), data);
};

// ─── Contact Inquiries ───────────────────────────────────────────────

export interface ContactInquiry {
  id?: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  message: string;
  createdAt?: any;
}

const inquiriesCol = collection(db, 'inquiries');

export const submitInquiry = async (inquiry: Omit<ContactInquiry, 'id'>) => {
  const docRef = await addDoc(inquiriesCol, { ...inquiry, createdAt: serverTimestamp() });
  return docRef.id;
};

export const getInquiries = async () => {
  const q = query(inquiriesCol, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as ContactInquiry));
};

// ─── Customers ───────────────────────────────────────────────────────

export const getCustomers = async () => {
  const snapshot = await getDocs(collection(db, 'users'));
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
};

// ─── Website Settings ────────────────────────────────────────────────

export interface WebsiteSettings {
  companyName: string;
  email: string;
  phone: string;
  address: string;
  mapLink: string;
  socialLinks: { facebook: string; linkedin: string; twitter: string; instagram: string };
}

export const getSettings = async (): Promise<WebsiteSettings | null> => {
  const snap = await getDoc(doc(db, 'settings', 'website'));
  if (!snap.exists()) return null;
  return snap.data() as WebsiteSettings;
};

export const updateSettings = async (data: Partial<WebsiteSettings>) => {
  await updateDoc(doc(db, 'settings', 'website'), data);
};

// ─── File Upload (Storage) ───────────────────────────────────────────

export const uploadFile = async (file: File, path: string): Promise<string> => {
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
};

export const deleteFile = async (path: string) => {
  const storageRef = ref(storage, path);
  await deleteObject(storageRef);
};

// ─── Dashboard Stats ─────────────────────────────────────────────────

export const getDashboardStats = async () => {
  const [products, categories, brands, quotes] = await Promise.all([
    getDocs(productsCol),
    getDocs(categoriesCol),
    getDocs(brandsCol),
    getDocs(quotesCol),
  ]);

  return {
    totalProducts: products.size,
    totalCategories: categories.size,
    totalBrands: brands.size,
    totalQuotes: quotes.size,
  };
};
