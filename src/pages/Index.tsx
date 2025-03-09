
import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import TyreSearch from '@/components/search/TyreSearch';
import ResultsTable from '@/components/search/ResultsTable';
import { TyreSearchResult } from '@/types';
import { searchTyres } from '@/api/tyres';
import { useQuery } from '@tanstack/react-query';

const Index = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Fetch search results from API
  const { data: results = [], isLoading } = useQuery({
    queryKey: ['tyre-search', searchTerm],
    queryFn: () => searchTyres(searchTerm),
    enabled: !!searchTerm,
  });

  // Load recent searches from localStorage
  useEffect(() => {
    const storedSearches = localStorage.getItem('recentSearches');
    if (storedSearches) {
      try {
        setRecentSearches(JSON.parse(storedSearches));
      } catch (error) {
        console.error('Failed to parse recent searches:', error);
      }
    }
  }, []);

  // Save recent searches to localStorage
  useEffect(() => {
    if (recentSearches.length > 0) {
      localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
    }
  }, [recentSearches]);

  const handleSearch = (size: string) => {
    setSearchTerm(size);

    // Update recent searches
    if (size && !recentSearches.includes(size)) {
      setRecentSearches(prev => [size, ...prev].slice(0, 5));
    }
  };

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
        
        {(isLoading || results.length > 0 || searchTerm) && (
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
