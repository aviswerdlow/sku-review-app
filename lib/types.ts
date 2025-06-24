// Type definitions for the SKU review app

export interface ProductVariant {
  sku: string;
  title: string;
  original_title?: string;  // Added to store the original product title
  attributes?: {
    base_product: string;
    weight?: number;
    weight_min?: number;
    weight_max?: number;
    weight_unit?: string;
    preparation?: string;
    kosher?: boolean;
    organic?: boolean;
  };
}

export interface VariantGroup {
  id: string;
  parent_sku: string;
  parent_title: string;
  confidence: number;
  reasoning: string;
  variant_count: number;
  common_attributes: Record<string, any>;
  varying_attributes: string[];
  variants: ProductVariant[];
  review_status: 'pending' | 'approved' | 'rejected';
  reviewer_email?: string;
  review_date?: string;
  rejection_reason?: string;
  feedback?: string;
}

export interface ReviewStats {
  total_groups: number;
  pending_review: number;
  approved: number;
  rejected: number;
  total_products: number;
  grouped_products: number;
  grouping_rate: number;
}