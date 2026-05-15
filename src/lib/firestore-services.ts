import {
  collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, setDoc,
  query, where, orderBy, limit, serverTimestamp, Timestamp,
  DocumentData, QueryConstraint,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from './firebase';

// ─── Products ────────────────────────────────────────────────────────

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
  const cleanData = Object.fromEntries(Object.entries(product).filter(([_, v]) => v !== undefined));
  const docRef = await addDoc(productsCol, {
    ...cleanData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};

export const updateProduct = async (id: string, data: Partial<FirestoreProduct>) => {
  const cleanData = Object.fromEntries(Object.entries(data).filter(([_, v]) => v !== undefined));
  await updateDoc(doc(db, 'products', id), { ...cleanData, updatedAt: serverTimestamp() });
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
  // Firestore throws an error if we pass undefined values. Remove them first.
  const cleanData = Object.fromEntries(
    Object.entries(data).filter(([_, v]) => v !== undefined)
  );
  await updateDoc(doc(db, 'categories', id), cleanData);
};

export const deleteCategory = async (id: string) => {
  await deleteDoc(doc(db, 'categories', id));
};

// ─── Industries ────────────────────────────────────────────────────────

export interface FirestoreIndustry {
  id?: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  createdAt?: any;
}

const industriesCol = collection(db, 'industries');

export const getIndustries = async () => {
  const snapshot = await getDocs(industriesCol);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as FirestoreIndustry));
};

export const addIndustry = async (industry: Omit<FirestoreIndustry, 'id'>) => {
  const docRef = await addDoc(industriesCol, { ...industry, createdAt: serverTimestamp() });
  return docRef.id;
};

export const updateIndustry = async (id: string, data: Partial<FirestoreIndustry>) => {
  const cleanData = Object.fromEntries(
    Object.entries(data).filter(([_, v]) => v !== undefined)
  );
  await updateDoc(doc(db, 'industries', id), cleanData);
};

export const deleteIndustry = async (id: string) => {
  await deleteDoc(doc(db, 'industries', id));
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

const quotesCol = collection(db, 'quotes');

export const getQuotes = async () => {
  const q = query(quotesCol, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as QuoteRequest));
};

export const getUserQuotes = async (userId: string) => {
  const q = query(quotesCol, where('userId', '==', userId));
  const snapshot = await getDocs(q);
  return snapshot.docs
    .map(d => ({ id: d.id, ...d.data() } as QuoteRequest))
    .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
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

  // Attempt to deduct stock automatically
  try {
    for (const item of quoteData.products) {
      if (!item.id) continue;
      const productRef = doc(db, 'products', item.id);
      const productSnap = await getDoc(productRef);
      
      if (productSnap.exists()) {
        const productData = productSnap.data() as FirestoreProduct;
        
        // Handle Variant Stock
        if (item.variantId && productData.variants) {
          const updatedVariants = productData.variants.map(v => {
            if (v.id === item.variantId && v.stockQty !== undefined) {
              return { ...v, stockQty: Math.max(0, v.stockQty - item.quantity) };
            }
            return v;
          });
          await updateDoc(productRef, { variants: updatedVariants });
        } 
        // Handle Base Product Stock
        else if (productData.stockQty !== undefined) {
          const currentStock = parseInt(productData.stockQty as string, 10);
          if (!isNaN(currentStock)) {
            await updateDoc(productRef, { 
              stockQty: Math.max(0, currentStock - item.quantity).toString()
            });
          }
        }
      }
    }
  } catch (error) {
    console.error('Inventory deduction error:', error);
  }

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
  socialLinks: {
    facebook: string;
    linkedin: string;
    twitter: string;
    instagram: string;
  };
  heroCarousel: HeroSlide[];
}

export const getSettings = async (): Promise<WebsiteSettings | null> => {
  const defaults: WebsiteSettings = {
    companyName: 'Avon Pharmo Chem (Pvt) Ltd',
    email: 'info@avonpc.com',
    phone: '+91 79 2583 1234',
    locations: [
      {
        name: 'Main Office',
        address: '123 Industrial Area, Ahmedabad, Gujarat 380015, India',
        phone: '+91 79 2583 1234',
        email: 'info@avonpc.com',
        mapLink: ''
      }
    ],
    socialLinks: { facebook: '', linkedin: '', twitter: '', instagram: '' },
    heroCarousel: [
      {
        image: 'https://images.unsplash.com/photo-1581093588401-fbb62a02f120?auto=format(c)&fit=crop&q=80',
        titleLine1: 'Trusted',
        titleLine2: 'Equipment Supplier',
        highlightWord: 'Laboratory',
        subtitle: 'Glassware • Instruments • Safety Equipment • Lab Furniture'
      },
      {
        image: 'https://images.unsplash.com/photo-1579154235602-3c2c2446051b?auto=format&fit=crop&q=80',
        titleLine1: 'Advanced',
        titleLine2: 'Solutions',
        highlightWord: 'Scientific',
        subtitle: 'Providing cutting-edge technology for precise research & analysis'
      }
    ]
  };

  const snap = await getDoc(doc(db, 'settings', 'website'));
  if (!snap.exists()) return defaults;

  const data = snap.data() as Partial<WebsiteSettings>;
  return {
    ...defaults,
    ...data,
    socialLinks: { ...defaults.socialLinks, ...(data.socialLinks || {}) },
    locations: data.locations || defaults.locations,
    heroCarousel: data.heroCarousel || defaults.heroCarousel
  };
};

export const updateSettings = async (data: Partial<WebsiteSettings>) => {
  await setDoc(doc(db, 'settings', 'website'), data, { merge: true });
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
  const [products, categories, brands, quotes, inquiriesSnap] = await Promise.all([
    getDocs(productsCol),
    getDocs(categoriesCol),
    getDocs(brandsCol),
    getDocs(quotesCol),
    getDocs(inquiriesCol)
  ]);

  return {
    totalProducts: products.size,
    totalCategories: categories.size,
    totalBrands: brands.size,
    totalQuotes: quotes.size,
    totalInquiries: inquiriesSnap.size
  };
};
