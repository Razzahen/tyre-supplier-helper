
import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import TyreSearch from '@/components/search/TyreSearch';
import ResultsTable from '@/components/search/ResultsTable';
import { TyreSearchResult } from '@/types';
import { calculateSellPrice, findApplicableMargin } from '@/utils/priceListProcessing';

// Mock data for tyre search results
const mockTyreData: TyreSearchResult[] = [
  {
    id: '1',
    size: '205/55R16',
    brand: 'Michelin',
    model: 'Primacy 4',
    supplier: 'ABC Tyres',
    cost: 120,
    sellPrice: 168,
    margin: 40,
    marginType: 'percentage'
  },
  {
    id: '2',
    size: '205/55R16',
    brand: 'Continental',
    model: 'PremiumContact 6',
    supplier: 'ABC Tyres',
    cost: 110,
    sellPrice: 154,
    margin: 40,
    marginType: 'percentage'
  },
  {
    id: '3',
    size: '205/55R16',
    brand: 'Pirelli',
    model: 'P7 Cinturato',
    supplier: 'XYZ Supplies',
    cost: 115,
    sellPrice: 175,
    margin: 60,
    marginType: 'fixed'
  },
  {
    id: '4',
    size: '205/55R16',
    brand: 'Goodyear',
    model: 'EfficientGrip Performance 2',
    supplier: 'XYZ Supplies',
    cost: 105,
    sellPrice: 165,
    margin: 60,
    marginType: 'fixed'
  }
];

// Mock recent searches
const mockRecentSearches = ['205/55R16', '225/45R17', '235/35R19'];

const Index = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<TyreSearchResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>(mockRecentSearches);

  const handleSearch = (size: string) => {
    setSearchTerm(size);
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      const filteredResults = mockTyreData.filter(
        tyre => tyre.size.toLowerCase() === size.toLowerCase()
      );
      setResults(filteredResults);
      setIsLoading(false);

      // Update recent searches
      if (size && !recentSearches.includes(size)) {
        setRecentSearches(prev => [size, ...prev].slice(0, 5));
      }
    }, 1000);
  };

  // For demo purposes, load some results initially
  useEffect(() => {
    if (recentSearches.length > 0) {
      handleSearch(recentSearches[0]);
    }
  }, []);

  return (
    <Layout
      title="Tyre Search"
      description="Search for tyre prices across all suppliers"
    >
      <div className="grid gap-8">
        <TyreSearch 
          onSearch={handleSearch} 
          recentSearches={recentSearches}
        />
        
        {(isLoading || results.length > 0) && (
          <ResultsTable 
            results={results} 
            isLoading={isLoading} 
          />
        )}
      </div>
    </Layout>
  );
};

export default Index;
