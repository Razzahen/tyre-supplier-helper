
import { PriceListRow, ProcessedPriceList, TyreSize, TyreBrand, TyreModel } from '@/types';

// Mock function to simulate GPT-4o processing of price lists
export const processPriceList = async (
  file: File,
  supplierId: string
): Promise<ProcessedPriceList> => {
  // In a real implementation, we would:
  // 1. Upload the file to a server or directly to OpenAI
  // 2. Process it with GPT-4o to extract structured data
  // 3. Return the processed data
  
  console.log(`Processing price list for supplier ${supplierId}...`);
  
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 2500));
  
  // Mock data - in a real app, this would come from GPT-4o
  const mockData: PriceListRow[] = [
    { size: "205/55R16", brand: "Michelin", model: "Primacy 4", cost: 120 },
    { size: "205/55R16", brand: "Continental", model: "PremiumContact 6", cost: 110 },
    { size: "205/55R16", brand: "Pirelli", model: "P7 Cinturato", cost: 115 },
    { size: "225/45R17", brand: "Bridgestone", model: "Turanza T005", cost: 145 },
    { size: "225/45R17", brand: "Pirelli", model: "P Zero", cost: 160 },
    { size: "225/45R17", brand: "Continental", model: "SportContact 7", cost: 155 },
    { size: "235/35R19", brand: "Michelin", model: "Pilot Sport 4", cost: 210 },
    { size: "235/35R19", brand: "Bridgestone", model: "Potenza Sport", cost: 200 },
    { size: "265/70R16", brand: "Goodyear", model: "Wrangler AT", cost: 180 },
    { size: "265/70R16", brand: "BF Goodrich", model: "All-Terrain T/A KO2", cost: 195 },
  ];
  
  return {
    supplierId,
    rows: mockData,
  };
};

// Function to parse tyre size into its components
export const parseTyreSize = (sizeString: string): Partial<TyreSize> => {
  // Expected format: "WIDTH/ASPECT-RATIOR{DIAMETER}" - e.g. 205/55R16
  const regex = /^(\d+)\/(\d+)R(\d+)$/;
  const match = sizeString.match(regex);
  
  if (match) {
    return {
      size: sizeString,
      width: parseInt(match[1], 10),
      aspectRatio: parseInt(match[2], 10),
      diameter: parseInt(match[3], 10),
    };
  }
  
  return { size: sizeString };
};

// Calculate sell price based on cost and margin configuration
export const calculateSellPrice = (
  cost: number,
  marginType: 'percentage' | 'fixed',
  marginValue: number
): number => {
  if (marginType === 'percentage') {
    return cost * (1 + marginValue / 100);
  } else {
    return cost + marginValue;
  }
};

// Find the most specific applicable margin configuration
export const findApplicableMargin = (
  configs: any[],
  sizeId: string,
  brandId: string,
  modelId?: string
) => {
  // First look for model-specific config
  if (modelId) {
    const modelConfig = configs.find(c => c.tyreModelId === modelId);
    if (modelConfig) return modelConfig;
  }
  
  // Then look for brand+size specific config
  const brandSizeConfig = configs.find(c => 
    c.tyreSizeId === sizeId && c.brandId === brandId
  );
  if (brandSizeConfig) return brandSizeConfig;
  
  // Then brand-specific config
  const brandConfig = configs.find(c => 
    c.brandId === brandId && !c.tyreSizeId
  );
  if (brandConfig) return brandConfig;
  
  // Then size-specific config
  const sizeConfig = configs.find(c => 
    c.tyreSizeId === sizeId && !c.brandId
  );
  if (sizeConfig) return sizeConfig;
  
  // Finally, global config
  return configs.find(c => !c.tyreSizeId && !c.brandId) || {
    marginType: 'percentage',
    marginValue: 30, // Default 30% margin
  };
};
