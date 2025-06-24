// Type definitions for the SKU review app

export interface EditHistory {
  original: string;
  edited: string;
  edited_by?: string;
  edited_date?: string;
}

export interface RemovalInfo {
  removed_by?: string;
  removed_date: string;
  removal_reason: string;
  suggested_action?: 'different_group' | 'ungrouped' | 'invalid_product' | 'other';
  notes?: string;
}

export interface ProductVariant {
  sku: string;
  title: string;
  original_title?: string;  // Added to store the original product title
  title_edited?: string;  // User-edited title
  title_edit_history?: EditHistory & { ai_generated?: string };
  is_removed?: boolean;
  removal_info?: RemovalInfo;
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
  parent_title_edited?: string;  // User-edited parent title
  parent_title_edit_history?: EditHistory;
  confidence: number;
  reasoning: string;
  variant_count: number;
  common_attributes: Record<string, any>;
  varying_attributes: string[];
  variants: ProductVariant[];
  removed_variants?: ProductVariant[];  // Track removed variants
  has_edits?: boolean;  // Flag to indicate if group has any edits
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