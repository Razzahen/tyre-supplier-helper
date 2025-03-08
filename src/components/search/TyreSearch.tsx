
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/custom/Card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TyreSearchProps {
  onSearch: (size: string) => void;
  recentSearches?: string[];
  popularSizes?: string[];
}

const TyreSearch = ({ onSearch, recentSearches = [], popularSizes = ["205/55R16", "225/45R17", "235/35R19", "265/70R16"] }: TyreSearchProps) => {
  const [size, setSize] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (size.trim()) {
      onSearch(size);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSize(suggestion);
    onSearch(suggestion);
    setShowSuggestions(false);
  };

  return (
    <Card variant="glass" className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Find Tyre Prices</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="size">Tyre Size</Label>
            <div className="relative">
              <Input
                id="size"
                value={size}
                onChange={(e) => {
                  setSize(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 100)}
                placeholder="e.g. 205/55R16"
                className="pl-10"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />

              <AnimatePresence>
                {showSuggestions && (size.length > 0 || popularSizes.length > 0) && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    transition={{ duration: 0.2 }}
                    className="absolute mt-1 w-full bg-white dark:bg-gray-900 shadow-lg rounded-md border z-10 py-2 px-1"
                  >
                    {popularSizes
                      .filter(s => s.toLowerCase().includes(size.toLowerCase()))
                      .map((suggestion) => (
                        <div
                          key={suggestion}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="px-3 py-2 hover:bg-accent rounded-md cursor-pointer transition-colors"
                        >
                          {suggestion}
                        </div>
                      ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <Button type="submit" className="w-full">
            Search
          </Button>
        </form>

        {popularSizes.length > 0 && (
          <div className="mt-6">
            <Label>Popular Sizes</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {popularSizes.map(size => (
                <Badge
                  key={size}
                  variant="outline"
                  className="cursor-pointer hover:bg-accent transition-colors py-1.5"
                  onClick={() => {
                    setSize(size);
                    onSearch(size);
                  }}
                >
                  {size}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {recentSearches.length > 0 && (
          <div className="mt-6">
            <Label>Recent Searches</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {recentSearches.map(size => (
                <Badge
                  key={size}
                  variant="secondary"
                  className="cursor-pointer hover:bg-secondary/80 transition-colors py-1.5"
                  onClick={() => {
                    setSize(size);
                    onSearch(size);
                  }}
                >
                  {size}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TyreSearch;
