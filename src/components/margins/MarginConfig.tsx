
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/custom/Card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Check, DollarSign, Percent } from 'lucide-react';
import { MarginConfig as MarginConfigType, TyreSize, TyreBrand } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface MarginConfigProps {
  onSave: (config: Partial<MarginConfigType>) => void;
  tyreSizes: TyreSize[];
  tyreBrands: TyreBrand[];
  existingConfigs: MarginConfigType[];
}

const MarginConfig = ({
  onSave,
  tyreSizes,
  tyreBrands,
  existingConfigs,
}: MarginConfigProps) => {
  const { toast } = useToast();
  
  const [size, setSize] = useState<string>('all');
  const [brand, setBrand] = useState<string>('all');
  const [marginType, setMarginType] = useState<'percentage' | 'fixed'>('percentage');
  const [marginValue, setMarginValue] = useState<string>('');

  const handleSave = () => {
    const marginValueNum = parseFloat(marginValue);
    
    if (isNaN(marginValueNum) || marginValueNum <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid margin value greater than zero",
        variant: "destructive",
      });
      return;
    }

    const config: Partial<MarginConfigType> = {
      marginType,
      marginValue: marginValueNum,
      tyreSizeId: size !== 'all' ? size : undefined,
      brandId: brand !== 'all' ? brand : undefined,
    };

    onSave(config);
    resetForm();
    
    toast({
      title: "Success",
      description: "Margin configuration saved successfully",
    });
  };

  const resetForm = () => {
    setSize('all');
    setBrand('all');
    setMarginType('percentage');
    setMarginValue('');
  };

  // Find existing config that matches current selection
  const matchingConfig = existingConfigs.find(config => 
    (config.tyreSizeId === size || (size === 'all' && !config.tyreSizeId)) && 
    (config.brandId === brand || (brand === 'all' && !config.brandId))
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Configure Margins</CardTitle>
        <CardDescription>
          Set your preferred margins for different tyre sizes and brands
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="size">Tyre Size</Label>
            <Select value={size} onValueChange={setSize}>
              <SelectTrigger id="size">
                <SelectValue placeholder="Select size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sizes</SelectItem>
                {tyreSizes.map((size) => (
                  <SelectItem key={size.id} value={size.id}>
                    {size.size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="brand">Brand</Label>
            <Select value={brand} onValueChange={setBrand}>
              <SelectTrigger id="brand">
                <SelectValue placeholder="Select brand" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Brands</SelectItem>
                {tyreBrands.map((brand) => (
                  <SelectItem key={brand.id} value={brand.id}>
                    {brand.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {matchingConfig && (
          <div className="bg-amber-50 border-amber-200 border rounded-lg p-4 text-amber-800">
            <p className="text-sm flex items-center">
              <span className="font-medium mr-2">Existing configuration:</span>
              {matchingConfig.marginType === 'percentage' ? (
                <Badge variant="outline" className="bg-amber-100 text-amber-800">
                  <Percent size={12} className="mr-1" />
                  {matchingConfig.marginValue}%
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-amber-100 text-amber-800">
                  <DollarSign size={12} className="mr-1" />
                  ${matchingConfig.marginValue.toFixed(2)}
                </Badge>
              )}
            </p>
            <p className="text-xs mt-1">This new configuration will override the existing one.</p>
          </div>
        )}

        <div className="space-y-3">
          <Label>Margin Type</Label>
          <RadioGroup
            value={marginType}
            onValueChange={(value) => setMarginType(value as 'percentage' | 'fixed')}
            className="flex space-x-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="percentage" id="percentage" />
              <Label htmlFor="percentage" className="flex items-center cursor-pointer">
                <Percent size={14} className="mr-1" />
                Percentage
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="fixed" id="fixed" />
              <Label htmlFor="fixed" className="flex items-center cursor-pointer">
                <DollarSign size={14} className="mr-1" />
                Fixed Amount
              </Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label htmlFor="margin-value">
            {marginType === 'percentage' ? 'Percentage' : 'Dollar Amount'}
          </Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {marginType === 'percentage' ? (
                <Percent size={16} className="text-muted-foreground" />
              ) : (
                <DollarSign size={16} className="text-muted-foreground" />
              )}
            </div>
            <Input
              id="margin-value"
              type="number"
              step={marginType === 'percentage' ? 1 : 0.01}
              min={0}
              className="pl-10"
              placeholder={marginType === 'percentage' ? '40' : '60.00'}
              value={marginValue}
              onChange={(e) => setMarginValue(e.target.value)}
            />
          </div>
        </div>

        <Button onClick={handleSave} className="w-full">
          <Check size={16} className="mr-2" />
          Save Configuration
        </Button>
      </CardContent>
    </Card>
  );
};

export default MarginConfig;
