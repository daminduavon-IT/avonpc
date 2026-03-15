// Sample data for the catalog
export interface Product {
  id: string;
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
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  productCount: number;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo: string;
  description: string;
}

export const categories: Category[] = [];

export const brands: Brand[] = [];

export const products: Product[] = [];

export const industries = [
  { id: '1', name: 'Pharmaceutical', icon: '💊', description: 'Complete lab solutions for pharmaceutical manufacturing, QC, and R&D facilities.' },
  { id: '2', name: 'Research Laboratories', icon: '🔬', description: 'Advanced instruments and consumables for cutting-edge research.' },
  { id: '3', name: 'Universities', icon: '🎓', description: 'Educational lab equipment and supplies for academic institutions.' },
  { id: '4', name: 'Hospitals', icon: '🏥', description: 'Clinical laboratory equipment and diagnostic supplies.' },
  { id: '5', name: 'Food Industry', icon: '🍽️', description: 'Quality testing equipment and lab supplies for food safety.' },
  { id: '6', name: 'Chemical Industry', icon: '⚗️', description: 'Industrial-grade laboratory equipment for chemical processing.' },
];
