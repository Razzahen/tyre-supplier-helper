
// Supabase table types
export type TyreSize = {
  id: string;
  size: string;
  width: number;
  aspect_ratio: number;
  diameter: number;
  created_at: string;
}

export type TyreBrand = {
  id: string;
  name: string;
  created_at: string;
}

export type TyreModel = {
  id: string;
  brand_id: string;
  name: string;
  created_at: string;
}

export type Supplier = {
  id: string;
  name: string;
  contact?: string;
  email?: string;
  phone?: string;
  user_id: string;
  created_at: string;
}

export type TyrePrice = {
  id: string;
  supplier_id: string;
  tyre_size_id: string;
  tyre_model_id: string;
  brand_id: string;
  cost: number;
  created_at: string;
  updated_at: string;
}

export type MarginConfig = {
  id: string;
  user_id: string;
  tyre_size_id?: string;
  brand_id?: string;
  tyre_model_id?: string;
  margin_type: 'percentage' | 'fixed';
  margin_value: number;
  priority: number;
  created_at: string;
  updated_at: string;
}

export type TyreSearchResult = {
  id: string;
  size: string;
  brand: string;
  model: string;
  supplier: string;
  cost: number;
  sell_price: number;
  margin_type: 'percentage' | 'fixed';
  margin_value: number;
}

export type PriceListRow = {
  size: string;
  brand: string;
  model: string;
  cost: number;
}

export type ProcessedPriceList = {
  supplierId: string;
  rows: PriceListRow[];
  errorRows?: string[];
}

// Authentication types
export type User = {
  id: string;
  email?: string;
}

export type Session = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
}
