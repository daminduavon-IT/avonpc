// ============================================================================
// Avon Pharmo Chem — Supabase database types.
//
// Hand-authored to match supabase/migrations/0001–0003 exactly. Once your
// Supabase project is live you can regenerate/verify with:
//   npx supabase gen types typescript --project-id <ref> --schema public \
//     > src/lib/database.types.ts
// (or --db-url for a local instance). Keep this file in sync with the schema.
// ============================================================================

export type ProductStatus = 'active' | 'inactive';
export type QuoteStatus = 'New' | 'In Review' | 'Quotation Sent' | 'Follow Up' | 'Closed';
export type LogisticsType = 'Pickup' | 'Courier' | 'Avon Delivery';
export type UserRole = 'customer' | 'admin';

// Shapes stored in JSONB columns (mirrors the Firestore nested objects).
export interface SpecItem { label: string; value: string }
export interface ProductVariant {
  id: string;
  sku: string;
  selectionLabel: string;
  stockQty: number;
  price: number;
  description?: string;
}
export interface SiteLocation {
  name: string;
  address: string;
  phone: string;
  email: string;
  mapLink: string;
}
export interface SocialLinks {
  facebook: string;
  linkedin: string;
  twitter: string;
  instagram: string;
}
export interface HeroSlide {
  image: string;
  titleLine1: string;
  titleLine2: string;
  highlightWord: string;
  subtitle: string;
}

type Timestamptz = string; // ISO string over the wire

export interface Database {
  public: {
    Tables: {
      brands: {
        Row: {
          id: string;
          slug: string;
          name: string;
          logo: string | null;
          description: string | null;
          created_at: Timestamptz;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          logo?: string | null;
          description?: string | null;
          created_at?: Timestamptz;
        };
        Update: Partial<Database['public']['Tables']['brands']['Insert']>;
      };
      categories: {
        Row: {
          id: string;
          slug: string;
          name: string;
          description: string | null;
          image: string | null;
          parent_id: string | null;
          display_order: number | null;
          created_at: Timestamptz;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          description?: string | null;
          image?: string | null;
          parent_id?: string | null;
          display_order?: number | null;
          created_at?: Timestamptz;
        };
        Update: Partial<Database['public']['Tables']['categories']['Insert']>;
      };
      industries: {
        Row: {
          id: string;
          slug: string;
          name: string;
          description: string | null;
          image: string | null;
          created_at: Timestamptz;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          description?: string | null;
          image?: string | null;
          created_at?: Timestamptz;
        };
        Update: Partial<Database['public']['Tables']['industries']['Insert']>;
      };
      products: {
        Row: {
          id: string;
          slug: string;
          name: string;
          model: string | null;
          sku: string | null;
          subcategory: string | null;
          category_id: string | null;
          brand_id: string | null;
          category_name: string | null;
          brand_name: string | null;
          short_description: string | null;
          full_description: string | null;
          image: string | null;
          specifications: SpecItem[];
          applications: string[];
          features: string[];
          tags: string[];
          images: string[];
          gallery: string[];
          variants: ProductVariant[];
          featured: boolean;
          is_flash_sale: boolean;
          status: ProductStatus;
          display_order: number | null;
          price: number | null;
          stock_qty: number | null;
          spec_sheet_url: string | null;
          seo_title: string | null;
          seo_description: string | null;
          created_at: Timestamptz;
          updated_at: Timestamptz;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          model?: string | null;
          sku?: string | null;
          subcategory?: string | null;
          category_id?: string | null;
          brand_id?: string | null;
          category_name?: string | null;
          brand_name?: string | null;
          short_description?: string | null;
          full_description?: string | null;
          image?: string | null;
          specifications?: SpecItem[];
          applications?: string[];
          features?: string[];
          tags?: string[];
          images?: string[];
          gallery?: string[];
          variants?: ProductVariant[];
          featured?: boolean;
          is_flash_sale?: boolean;
          status?: ProductStatus;
          display_order?: number | null;
          price?: number | null;
          stock_qty?: number | null;
          spec_sheet_url?: string | null;
          seo_title?: string | null;
          seo_description?: string | null;
          created_at?: Timestamptz;
          updated_at?: Timestamptz;
        };
        Update: Partial<Database['public']['Tables']['products']['Insert']>;
      };
      product_industries: {
        Row: { product_id: string; industry_id: string };
        Insert: { product_id: string; industry_id: string };
        Update: Partial<{ product_id: string; industry_id: string }>;
      };
      profiles: {
        Row: {
          id: string;
          firebase_uid: string | null;
          email: string | null;
          display_name: string | null;
          company: string | null;
          phone: string | null;
          role: UserRole;
          created_at: Timestamptz;
        };
        Insert: {
          id: string;
          firebase_uid?: string | null;
          email?: string | null;
          display_name?: string | null;
          company?: string | null;
          phone?: string | null;
          role?: UserRole;
          created_at?: Timestamptz;
        };
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      quotes: {
        Row: {
          id: string;
          user_id: string | null;
          firebase_uid: string | null;
          name: string | null;
          company: string | null;
          email: string | null;
          phone: string | null;
          country: string | null;
          state: string | null;
          city: string | null;
          message: string | null;
          status: QuoteStatus;
          logistics_type: LogisticsType | null;
          bank_slip_url: string | null;
          internal_notes: string | null;
          assigned_to: string | null;
          created_at: Timestamptz;
          updated_at: Timestamptz;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          firebase_uid?: string | null;
          name?: string | null;
          company?: string | null;
          email?: string | null;
          phone?: string | null;
          country?: string | null;
          state?: string | null;
          city?: string | null;
          message?: string | null;
          status?: QuoteStatus;
          logistics_type?: LogisticsType | null;
          bank_slip_url?: string | null;
          internal_notes?: string | null;
          assigned_to?: string | null;
          created_at?: Timestamptz;
          updated_at?: Timestamptz;
        };
        Update: Partial<Database['public']['Tables']['quotes']['Insert']>;
      };
      quote_items: {
        Row: {
          id: string;
          quote_id: string;
          product_id: string | null;
          product_ref_id: string | null;
          name: string | null;
          brand: string | null;
          model: string | null;
          variant_id: string | null;
          variant_label: string | null;
          quantity: number;
          price: number | null;
        };
        Insert: {
          id?: string;
          quote_id: string;
          product_id?: string | null;
          product_ref_id?: string | null;
          name?: string | null;
          brand?: string | null;
          model?: string | null;
          variant_id?: string | null;
          variant_label?: string | null;
          quantity?: number;
          price?: number | null;
        };
        Update: Partial<Database['public']['Tables']['quote_items']['Insert']>;
      };
      inquiries: {
        Row: {
          id: string;
          name: string | null;
          email: string | null;
          phone: string | null;
          company: string | null;
          message: string | null;
          created_at: Timestamptz;
        };
        Insert: {
          id?: string;
          name?: string | null;
          email?: string | null;
          phone?: string | null;
          company?: string | null;
          message?: string | null;
          created_at?: Timestamptz;
        };
        Update: Partial<Database['public']['Tables']['inquiries']['Insert']>;
      };
      site_settings: {
        Row: {
          id: number;
          company_name: string | null;
          email: string | null;
          phone: string | null;
          locations: SiteLocation[];
          social_links: SocialLinks;
          hero_carousel: HeroSlide[];
          updated_at: Timestamptz;
        };
        Insert: {
          id?: number;
          company_name?: string | null;
          email?: string | null;
          phone?: string | null;
          locations?: SiteLocation[];
          social_links?: SocialLinks;
          hero_carousel?: HeroSlide[];
          updated_at?: Timestamptz;
        };
        Update: Partial<Database['public']['Tables']['site_settings']['Insert']>;
      };
      site_content: {
        Row: {
          id: number;
          content: Record<string, string>;
          updated_at: Timestamptz;
        };
        Insert: {
          id?: number;
          content?: Record<string, string>;
          updated_at?: Timestamptz;
        };
        Update: Partial<Database['public']['Tables']['site_content']['Insert']>;
      };
    };
    Views: {
      category_product_counts: {
        Row: {
          category_id: string | null;
          category_slug: string | null;
          product_count: number | null;
        };
      };
    };
    Functions: {
      is_admin: { Args: Record<string, never>; Returns: boolean };
    };
    Enums: {
      product_status: ProductStatus;
      quote_status: QuoteStatus;
      logistics_type: LogisticsType;
      user_role: UserRole;
    };
  };
}
