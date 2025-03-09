
import { supabase } from '@/integrations/supabase/client';
import { MarginConfig } from '@/types';

export const getMarginConfigs = async (): Promise<MarginConfig[]> => {
  const { data, error } = await supabase
    .from('margin_configs')
    .select('*')
    .order('priority', { ascending: false });

  if (error) {
    console.error('Error fetching margin configs:', error);
    throw error;
  }

  return data as MarginConfig[] || [];
};

export const createMarginConfig = async (
  config: Omit<MarginConfig, 'id' | 'created_at' | 'updated_at' | 'user_id'>
): Promise<MarginConfig> => {
  const { data, error } = await supabase
    .from('margin_configs')
    .insert(config)
    .select()
    .single();

  if (error) {
    console.error('Error creating margin config:', error);
    throw error;
  }

  return data as MarginConfig;
};

export const updateMarginConfig = async (
  id: string,
  config: Partial<Omit<MarginConfig, 'id' | 'created_at' | 'updated_at' | 'user_id'>>
): Promise<MarginConfig> => {
  const updates = {
    ...config,
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('margin_configs')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating margin config:', error);
    throw error;
  }

  return data as MarginConfig;
};

export const deleteMarginConfig = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('margin_configs')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting margin config:', error);
    throw error;
  }
};
