import { VariantGroup, ProductVariant } from './types';

interface NotebookGroup {
  parent_sku: string;
  parent_title: string;
  variant_count: number;
  grouping_rationale?: string;
  reasoning?: string;
  skus: string[];
  variants: Array<{
    sku: string;
    title?: string;
    weight?: string;
    display_name?: string;
    [key: string]: any;
  }>;
}

interface NotebookJSON {
  metadata: {
    generated: string;
    export_version: string;
    processing_method: string;
    stats: {
      total_products?: number;
      products_grouped?: number;
      groups_created?: number;
      grouping_rate?: number;
      ungrouped_count?: number;
    };
  };
  groups: NotebookGroup[];
  passover_filter?: any[];
  ungrouped_products?: Array<{
    sku: string;
    title?: string;
  }>;
}

interface LangChainJSON {
  metadata: {
    total_products?: number;
    grouping_rate?: number;
  };
  grouped_products: Array<{
    parent_sku: string;
    parent_title: string;
    confidence: number;
    reasoning: string;
    variant_count: number;
    common_attributes: Record<string, any>;
    varying_attributes: string[];
    variants: Array<{
      sku: string;
      title: string;
      attributes: Record<string, any>;
    }>;
  }>;
}

// Extract weight information from product title
function extractWeight(title: string): {
  weight?: number;
  weight_min?: number;
  weight_max?: number;
  weight_unit?: string;
} {
  if (!title) return {};

  // Match patterns like "1 lb", "5lb", "10-12 oz", "2.5 kg", etc.
  const weightPattern = /(\d+(?:\.\d+)?)\s*(?:-\s*(\d+(?:\.\d+)?))?\s*(lb|oz|kg|g|pound|ounce)s?\.?/i;
  const match = title.match(weightPattern);
  
  if (match) {
    const weight_unit = match[3].toLowerCase().replace(/s$/, '');
    const normalizedUnit = weight_unit === 'pound' ? 'lb' : 
                          weight_unit === 'ounce' ? 'oz' : weight_unit;
    
    if (match[2]) {
      // Range (e.g., "10-12 lb")
      return {
        weight_min: parseFloat(match[1]),
        weight_max: parseFloat(match[2]),
        weight_unit: normalizedUnit
      };
    } else {
      // Single weight
      return {
        weight: parseFloat(match[1]),
        weight_unit: normalizedUnit
      };
    }
  }
  
  return {};
}

// Extract preparation method from title
function extractPreparation(title: string): string {
  if (!title) return 'fresh';
  
  const titleLower = title.toLowerCase();
  
  if (titleLower.includes('fully cooked') || titleLower.includes('fully-cooked')) {
    return 'fully-cooked';
  } else if (titleLower.includes('smoked')) {
    return 'smoked';
  } else if (titleLower.includes('marinated')) {
    return 'marinated';
  } else if (titleLower.includes('pickled')) {
    return 'pickled';
  } else if (titleLower.includes('corned')) {
    return 'corned';
  } else if (titleLower.includes('cured')) {
    return 'cured';
  } else if (titleLower.includes('raw') || titleLower.includes('uncooked')) {
    return 'raw';
  }
  
  return 'fresh';
}

// Extract base product from title
function extractBaseProduct(title: string): string {
  if (!title) return 'unknown';
  
  const titleLower = title.toLowerCase();
  
  // Common meat products
  const products = [
    'ribeye', 'strip steak', 'sirloin', 'filet mignon', 'tenderloin',
    'brisket', 'short ribs', 'chuck roast', 'ground beef', 'ground veal',
    'ground lamb', 'ground turkey', 'ground chicken', 'hot dog', 'sausage',
    'chicken breast', 'chicken thigh', 'chicken wings', 'whole chicken',
    'turkey', 'lamb', 'veal', 'duck', 'pastrami', 'salami', 'bologna',
    'bacon', 'hamburger', 'burger', 'meatball', 'soup', 'cholent'
  ];
  
  for (const product of products) {
    if (titleLower.includes(product)) {
      return product;
    }
  }
  
  return 'meat product';
}

// Check if product is kosher
function isKosher(title: string, sku: string): boolean {
  if (!title) return false;
  
  const titleLower = title.toLowerCase();
  const skuUpper = sku.toUpperCase();
  
  // Check for kosher indicators
  return titleLower.includes('kosher') || 
         titleLower.includes('kosher for passover') ||
         skuUpper.startsWith('Y-') ||
         skuUpper.endsWith('P');
}

// Check if product is organic
function isOrganic(title: string): boolean {
  if (!title) return false;
  return title.toLowerCase().includes('organic');
}

// Convert notebook variant to app variant format
function convertVariant(variant: any): ProductVariant {
  const title = variant.title || variant.display_name || '';
  const weightInfo = extractWeight(title);
  
  return {
    sku: variant.sku,
    title: title,
    attributes: {
      base_product: extractBaseProduct(title),
      ...weightInfo,
      preparation: extractPreparation(title),
      kosher: isKosher(title, variant.sku),
      organic: isOrganic(title)
    }
  };
}

// Handle notebook JSON format
export function importNotebookJSON(data: NotebookJSON): VariantGroup[] {
  const groups: VariantGroup[] = [];
  
  data.groups.forEach((group, index) => {
    // Convert variants
    const variants = group.variants.map(convertVariant);
    
    // Extract common and varying attributes
    const allAttributes = new Set<string>();
    const commonAttributes: Record<string, any> = {};
    const varyingAttributes: string[] = [];
    
    // Collect all attribute keys
    variants.forEach(v => {
      if (v.attributes) {
        Object.keys(v.attributes).forEach(key => allAttributes.add(key));
      }
    });
    
    // Determine which attributes are common vs varying
    Array.from(allAttributes).forEach(attr => {
      const values = variants.map(v => v.attributes ? v.attributes[attr as keyof typeof v.attributes] : undefined);
      const uniqueValues = Array.from(new Set(values.map(v => JSON.stringify(v))));
      
      if (uniqueValues.length === 1 && values[0] !== undefined) {
        commonAttributes[attr] = values[0];
      } else if (uniqueValues.length > 1) {
        varyingAttributes.push(attr);
      }
    });
    
    groups.push({
      id: `group-${index}`,
      parent_sku: group.parent_sku,
      parent_title: group.parent_title,
      confidence: 0.85, // Default confidence since notebook doesn't provide it
      reasoning: group.grouping_rationale || group.reasoning || '',
      variant_count: group.variant_count,
      variants: variants,
      common_attributes: commonAttributes,
      varying_attributes: varyingAttributes,
      review_status: 'pending'
    });
  });
  
  return groups;
}

// Handle LangChain JSON format (original format)
export function importLangChainJSON(data: LangChainJSON): VariantGroup[] {
  const groups: VariantGroup[] = [];
  
  data.grouped_products.forEach((group, index) => {
    groups.push({
      id: `group-${index}`,
      parent_sku: group.parent_sku,
      parent_title: group.parent_title,
      confidence: group.confidence,
      reasoning: group.reasoning,
      variant_count: group.variant_count,
      variants: group.variants.map(v => ({
        sku: v.sku,
        title: v.title,
        attributes: {
          base_product: v.attributes.base_product || 'unknown',
          weight: v.attributes.weight,
          weight_min: v.attributes.weight_min,
          weight_max: v.attributes.weight_max,
          weight_unit: v.attributes.weight_unit,
          preparation: v.attributes.preparation,
          kosher: v.attributes.kosher,
          organic: v.attributes.organic
        }
      })),
      common_attributes: group.common_attributes,
      varying_attributes: group.varying_attributes,
      review_status: 'pending'
    });
  });
  
  return groups;
}

// Auto-detect format and import
export function importJSON(data: any): {
  groups: VariantGroup[];
  metadata: any;
  format: 'notebook' | 'langchain';
} {
  // Detect format based on structure
  if (data.groups && Array.isArray(data.groups)) {
    // Notebook format
    return {
      groups: importNotebookJSON(data as NotebookJSON),
      metadata: {
        generated: data.metadata?.generated || new Date().toISOString(),
        total_products: data.metadata?.stats?.total_products || 0,
        grouping_rate: data.metadata?.stats?.grouping_rate || 0,
        ungrouped_count: data.metadata?.stats?.ungrouped_count || 0,
        processing_method: data.metadata?.processing_method || 'enhanced'
      },
      format: 'notebook'
    };
  } else if (data.grouped_products && Array.isArray(data.grouped_products)) {
    // LangChain format
    return {
      groups: importLangChainJSON(data as LangChainJSON),
      metadata: {
        generated: new Date().toISOString(),
        total_products: data.metadata?.total_products || 0,
        grouping_rate: data.metadata?.grouping_rate || 0
      },
      format: 'langchain'
    };
  } else {
    throw new Error('Unrecognized JSON format. Expected either notebook format (with "groups" array) or LangChain format (with "grouped_products" array).');
  }
}