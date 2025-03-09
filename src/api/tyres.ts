
import { supabase } from '@/integrations/supabase/client';
import { TyreSize, TyreBrand, TyreModel, TyreSearchResult, ProcessedPriceList, TyrePrice } from '@/types';

// Tyre Sizes
export const getTyreSizes = async (): Promise<TyreSize[]> => {
  const { data, error } = await supabase
    .from('tyre_sizes')
    .select('*')
    .order('size');

  if (error) {
    console.error('Error fetching tyre sizes:', error);
    throw error;
  }

  return data || [];
};

export const createTyreSize = async (size: Omit<TyreSize, 'id' | 'created_at'>): Promise<TyreSize> => {
  const { data, error } = await supabase
    .from('tyre_sizes')
    .insert([size])
    .select()
    .single();

  if (error) {
    console.error('Error creating tyre size:', error);
    throw error;
  }

  return data;
};

// Tyre Brands
export const getTyreBrands = async (): Promise<TyreBrand[]> => {
  const { data, error } = await supabase
    .from('tyre_brands')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching tyre brands:', error);
    throw error;
  }

  return data || [];
};

export const createTyreBrand = async (brand: Omit<TyreBrand, 'id' | 'created_at'>): Promise<TyreBrand> => {
  const { data, error } = await supabase
    .from('tyre_brands')
    .insert([brand])
    .select()
    .single();

  if (error) {
    console.error('Error creating tyre brand:', error);
    throw error;
  }

  return data;
};

// Tyre Models
export const getTyreModels = async (brandId?: string): Promise<TyreModel[]> => {
  let query = supabase
    .from('tyre_models')
    .select('*')
    .order('name');
  
  if (brandId) {
    query = query.eq('brand_id', brandId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching tyre models:', error);
    throw error;
  }

  return data || [];
};

export const createTyreModel = async (model: Omit<TyreModel, 'id' | 'created_at'>): Promise<TyreModel> => {
  const { data, error } = await supabase
    .from('tyre_models')
    .insert([model])
    .select()
    .single();

  if (error) {
    console.error('Error creating tyre model:', error);
    throw error;
  }

  return data;
};

// Tyre Prices
export const getTyrePrices = async (supplierId?: string): Promise<TyrePrice[]> => {
  let query = supabase
    .from('tyre_prices')
    .select('*');
  
  if (supplierId) {
    query = query.eq('supplier_id', supplierId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching tyre prices:', error);
    throw error;
  }

  return data || [];
};

export const searchTyres = async (size: string): Promise<TyreSearchResult[]> => {
  const { data, error } = await supabase
    .from('tyre_search_results')
    .select('*')
    .eq('size', size);

  if (error) {
    console.error('Error searching tyres:', error);
    throw error;
  }

  return data.map(item => ({
    id: item.id,
    size: item.size,
    brand: item.brand,
    model: item.model,
    supplier: item.supplier,
    cost: item.cost,
    sell_price: item.sell_price,
    margin_type: item.margin_type || 'percentage',
    margin_value: item.margin_value || 40
  })) || [];
};

// Upload price list
export const savePriceList = async (priceList: ProcessedPriceList): Promise<void> => {
  // First, fetch the necessary IDs
  const sizes = await getTyreSizes();
  const brands = await getTyreBrands();
  const models = await getTyreModels();
  
  // Create new entries that don't exist
  for (const row of priceList.rows) {
    // Check and create size if needed
    let sizeId = sizes.find(s => s.size === row.size)?.id;
    if (!sizeId) {
      // Parse size
      const sizeRegex = /^(\d+)\/(\d+)R(\d+)$/;
      const match = row.size.match(sizeRegex);
      
      if (match) {
        const width = parseInt(match[1]);
        const aspectRatio = parseInt(match[2]);
        const diameter = parseInt(match[3]);
        
        const newSize = await createTyreSize({
          size: row.size,
          width,
          aspect_ratio: aspectRatio,
          diameter
        });
        
        sizeId = newSize.id;
        sizes.push(newSize);
      } else {
        console.error(`Invalid size format: ${row.size}`);
        continue;
      }
    }
    
    // Check and create brand if needed
    let brandId = brands.find(b => b.name.toLowerCase() === row.brand.toLowerCase())?.id;
    if (!brandId) {
      const newBrand = await createTyreBrand({
        name: row.brand
      });
      
      brandId = newBrand.id;
      brands.push(newBrand);
    }
    
    // Check and create model if needed
    let modelId = models.find(m => 
      m.name.toLowerCase() === row.model.toLowerCase() && 
      m.brand_id === brandId
    )?.id;
    
    if (!modelId) {
      const newModel = await createTyreModel({
        brand_id: brandId,
        name: row.model
      });
      
      modelId = newModel.id;
      models.push(newModel);
    }
    
    // Insert or update price
    const { error } = await supabase
      .from('tyre_prices')
      .upsert({
        supplier_id: priceList.supplierId,
        tyre_size_id: sizeId,
        tyre_model_id: modelId,
        brand_id: brandId,
        cost: row.cost,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'supplier_id,tyre_size_id,tyre_model_id'
      });
    
    if (error) {
      console.error('Error inserting price:', error);
    }
  }
};
