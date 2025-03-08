
export interface Supplier {
  id: string;
  name: string;
  contact?: string;
  email?: string;
  phone?: string;
  createdAt: string;
  userId?: string;
}

export interface TyreSize {
  id: string;
  size: string; // e.g. "205/55R16"
  width: number; // e.g. 205
  aspectRatio: number; // e.g. 55
  diameter: number; // e.g. 16
}

export interface TyreBrand {
  id: string;
  name: string; // e.g. "Michelin"
}

export interface TyreModel {
  id: string;
  brandId: string;
  name: string; // e.g. "Pilot Sport 4"
}

export interface TyrePrice {
  id: string;
  supplierId: string;
  tyreSizeId: string;
  tyreModelId: string;
  brandId: string;
  cost: number; // The price from the supplier
  createdAt: string;
  updatedAt: string;
}

export interface MarginConfig {
  id: string;
  userId: string;
  tyreSizeId?: string; // If set, applies to this specific size
  brandId?: string; // If set, applies to this specific brand
  tyreModelId?: string; // If set, applies to this specific model
  marginType: 'percentage' | 'fixed'; // Whether it's a percentage or fixed dollar amount
  marginValue: number; // The actual value (e.g. 40 for 40% or 60 for $60)
  priority: number; // Higher priority configs override lower ones when multiple match
  createdAt: string;
  updatedAt: string;
}

export interface TyreSearchResult {
  id: string;
  size: string;
  brand: string;
  model: string;
  supplier: string;
  cost: number;
  sellPrice: number;
  margin: number;
  marginType: 'percentage' | 'fixed';
}

export interface PriceListRow {
  size: string;
  brand: string;
  model: string;
  cost: number;
}

export interface ProcessedPriceList {
  supplierId: string;
  rows: PriceListRow[];
  errorRows?: string[];
}
