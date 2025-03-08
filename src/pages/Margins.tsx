
import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import MarginConfig from '@/components/margins/MarginConfig';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/custom/Card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MarginConfig as MarginConfigType, TyreSize, TyreBrand } from '@/types';
import { Percent, DollarSign, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Mock data for tyre sizes
const mockTyreSizes: TyreSize[] = [
  { id: '1', size: '205/55R16', width: 205, aspectRatio: 55, diameter: 16 },
  { id: '2', size: '225/45R17', width: 225, aspectRatio: 45, diameter: 17 },
  { id: '3', size: '235/35R19', width: 235, aspectRatio: 35, diameter: 19 },
  { id: '4', size: '265/70R16', width: 265, aspectRatio: 70, diameter: 16 },
];

// Mock data for tyre brands
const mockTyreBrands: TyreBrand[] = [
  { id: '1', name: 'Michelin' },
  { id: '2', name: 'Continental' },
  { id: '3', name: 'Bridgestone' },
  { id: '4', name: 'Pirelli' },
  { id: '5', name: 'Goodyear' },
];

// Mock initial margin configurations
const initialMarginConfigs: MarginConfigType[] = [
  {
    id: '1',
    userId: 'user1',
    marginType: 'percentage',
    marginValue: 40,
    priority: 0, // Global default
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    userId: 'user1',
    tyreSizeId: '3', // 235/35R19
    marginType: 'percentage',
    marginValue: 35,
    priority: 10, // Size-specific
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    userId: 'user1',
    brandId: '1', // Michelin
    marginType: 'fixed',
    marginValue: 60,
    priority: 20, // Brand-specific
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const Margins = () => {
  const { toast } = useToast();
  const [marginConfigs, setMarginConfigs] = useState<MarginConfigType[]>(initialMarginConfigs);

  const getSizeById = (id: string) => mockTyreSizes.find(size => size.id === id)?.size || 'Unknown';
  const getBrandById = (id: string) => mockTyreBrands.find(brand => brand.id === id)?.name || 'Unknown';

  const handleSaveConfig = (config: Partial<MarginConfigType>) => {
    // Determine priority based on specificity
    let priority = 0;
    if (config.tyreSizeId && config.brandId) {
      priority = 30; // Size + Brand specific
    } else if (config.brandId) {
      priority = 20; // Brand specific
    } else if (config.tyreSizeId) {
      priority = 10; // Size specific
    }

    // Check if a config with the same criteria already exists
    const existingConfigIndex = marginConfigs.findIndex(c => 
      (c.tyreSizeId === config.tyreSizeId || (!c.tyreSizeId && !config.tyreSizeId)) && 
      (c.brandId === config.brandId || (!c.brandId && !config.brandId))
    );

    if (existingConfigIndex !== -1) {
      // Update existing config
      const updatedConfigs = [...marginConfigs];
      updatedConfigs[existingConfigIndex] = {
        ...updatedConfigs[existingConfigIndex],
        ...config,
        updatedAt: new Date().toISOString(),
      };
      setMarginConfigs(updatedConfigs);
    } else {
      // Add new config
      const newConfig: MarginConfigType = {
        id: `${marginConfigs.length + 1}`, // Mock ID generation
        userId: 'user1', // Mock user ID
        ...config as any,
        priority,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setMarginConfigs([...marginConfigs, newConfig]);
    }
  };

  const handleDeleteConfig = (configId: string) => {
    setMarginConfigs(marginConfigs.filter(c => c.id !== configId));
    toast({
      title: "Configuration deleted",
      description: "Margin configuration has been removed",
    });
  };

  return (
    <Layout
      title="Margin Configuration"
      description="Set your preferred margins for different tyre categories"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <MarginConfig
            onSave={handleSaveConfig}
            tyreSizes={mockTyreSizes}
            tyreBrands={mockTyreBrands}
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
                          {config.tyreSizeId ? (
                            <Badge variant="outline">Size: {getSizeById(config.tyreSizeId)}</Badge>
                          ) : (
                            <Badge variant="outline">All Sizes</Badge>
                          )}
                          
                          {config.brandId ? (
                            <Badge variant="outline">Brand: {getBrandById(config.brandId)}</Badge>
                          ) : (
                            <Badge variant="outline">All Brands</Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center text-sm font-medium">
                          {config.marginType === 'percentage' ? (
                            <Percent size={14} className="mr-1 text-green-500" />
                          ) : (
                            <DollarSign size={14} className="mr-1 text-green-500" />
                          )}
                          <span className="text-green-500">
                            {config.marginType === 'percentage'
                              ? `${config.marginValue}% margin`
                              : `$${config.marginValue.toFixed(2)} markup`}
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
