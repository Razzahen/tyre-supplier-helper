
import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import MarginConfig from '@/components/margins/MarginConfig';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/custom/Card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MarginConfig as MarginConfigType, TyreSize, TyreBrand } from '@/types';
import { Percent, DollarSign, Trash2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMarginConfigs, createMarginConfig, deleteMarginConfig } from '@/api/margins';
import { getTyreSizes } from '@/api/tyres';
import { getTyreBrands } from '@/api/tyres';

const Margins = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch data
  const { data: marginConfigs = [], isLoading: isLoadingConfigs } = useQuery({
    queryKey: ['margin-configs'],
    queryFn: getMarginConfigs,
  });

  const { data: tyreSizes = [], isLoading: isLoadingSizes } = useQuery({
    queryKey: ['tyre-sizes'],
    queryFn: getTyreSizes,
  });

  const { data: tyreBrands = [], isLoading: isLoadingBrands } = useQuery({
    queryKey: ['tyre-brands'],
    queryFn: getTyreBrands,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: createMarginConfig,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['margin-configs'] });
      toast({
        title: "Configuration saved",
        description: "Margin configuration has been saved successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to save configuration: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteMarginConfig,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['margin-configs'] });
      toast({
        title: "Configuration deleted",
        description: "Margin configuration has been removed",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete configuration: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  const handleSaveConfig = (config: Partial<MarginConfigType>) => {
    // Determine priority based on specificity
    let priority = 0;
    if (config.tyre_size_id && config.brand_id) {
      priority = 30; // Size + Brand specific
    } else if (config.brand_id) {
      priority = 20; // Brand specific
    } else if (config.tyre_size_id) {
      priority = 10; // Size specific
    }

    createMutation.mutate({
      ...config,
      priority
    } as Omit<MarginConfigType, 'id' | 'created_at' | 'updated_at' | 'user_id'>);
  };

  const handleDeleteConfig = (configId: string) => {
    deleteMutation.mutate(configId);
  };

  const getSizeById = (id: string) => tyreSizes.find(size => size.id === id)?.size || 'Unknown';
  const getBrandById = (id: string) => tyreBrands.find(brand => brand.id === id)?.name || 'Unknown';

  const isLoading = isLoadingConfigs || isLoadingSizes || isLoadingBrands;

  if (isLoading) {
    return (
      <Layout
        title="Margin Configuration"
        description="Set your preferred margins for different tyre categories"
      >
        <div className="flex flex-col items-center justify-center p-12">
          <Loader2 size={48} className="animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading margin configurations...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      title="Margin Configuration"
      description="Set your preferred margins for different tyre categories"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <MarginConfig
            onSave={handleSaveConfig}
            tyreSizes={tyreSizes}
            tyreBrands={tyreBrands}
            existingConfigs={marginConfigs}
          />
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Current Margin Rules</CardTitle>
              <CardDescription>
                Rules are applied in order of specificity, with more specific rules taking precedence
              </CardDescription>
            </CardHeader>
            <CardContent>
              {marginConfigs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No margin configurations yet. Add your first configuration to get started.
                </div>
              ) : (
                <div className="space-y-3">
                  {marginConfigs.map((config) => (
                    <div
                      key={config.id}
                      className="p-4 rounded-lg border bg-card flex justify-between items-center hover:bg-accent/20 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex flex-wrap gap-2 items-center">
                          {config.tyre_size_id ? (
                            <Badge variant="outline">Size: {getSizeById(config.tyre_size_id)}</Badge>
                          ) : (
                            <Badge variant="outline">All Sizes</Badge>
                          )}
                          
                          {config.brand_id ? (
                            <Badge variant="outline">Brand: {getBrandById(config.brand_id)}</Badge>
                          ) : (
                            <Badge variant="outline">All Brands</Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center text-sm font-medium">
                          {config.margin_type === 'percentage' ? (
                            <Percent size={14} className="mr-1 text-green-500" />
                          ) : (
                            <DollarSign size={14} className="mr-1 text-green-500" />
                          )}
                          <span className="text-green-500">
                            {config.margin_type === 'percentage'
                              ? `${config.margin_value}% margin`
                              : `$${config.margin_value.toFixed(2)} markup`}
                          </span>
                        </div>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteConfig(config.id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 size={16} />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Margins;
