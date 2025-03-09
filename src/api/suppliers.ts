
import { supabase } from '@/integrations/supabase/client';
import { Supplier } from '@/types';

export const getSuppliers = async (): Promise<Supplier[]> => {
  const { data, error } = await supabase
    .from('suppliers')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching suppliers:', error);
    throw error;
  }

  return data || [];
};

export const createSupplier = async (supplier: Omit<Supplier, 'id' | 'user_id' | 'created_at'>): Promise<Supplier> => {
  const { data, error } = await supabase
    .from('suppliers')
    .insert([supplier])
    .select()
    .single();

  if (error) {
    console.error('Error creating supplier:', error);
    throw error;
  }

  return data as Supplier;
};

export const updateSupplier = async (id: string, supplier: Partial<Omit<Supplier, 'id' | 'user_id' | 'created_at'>>): Promise<Supplier> => {
  const { data, error } = await supabase
    .from('suppliers')
    .update(supplier)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating supplier:', error);
    throw error;
  }

  return data as Supplier;
};

export const deleteSupplier = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('suppliers')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting supplier:', error);
    throw error;
  }
};
