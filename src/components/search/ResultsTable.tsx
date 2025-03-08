
import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/custom/Card';
import { Badge } from '@/components/ui/badge';
import { ArrowUpDown, ExternalLink, DollarSign, Percent } from 'lucide-react';
import { TyreSearchResult } from '@/types';
import { motion } from 'framer-motion';

interface ResultsTableProps {
  results: TyreSearchResult[];
  isLoading?: boolean;
}

type SortField = 'brand' | 'model' | 'supplier' | 'cost' | 'sellPrice' | 'margin';
type SortDirection = 'asc' | 'desc';

const ResultsTable = ({ results, isLoading = false }: ResultsTableProps) => {
  const [sortField, setSortField] = useState<SortField>('margin');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedResults = [...results].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    return 0;
  });

  const variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  if (isLoading) {
    return (
      <Card className="mt-8 w-full">
        <CardHeader>
          <CardTitle>Loading results...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-40">
            <div className="animate-pulse flex space-x-4">
              <div className="flex-1 space-y-6 py-1">
                <div className="h-2 bg-slate-200 rounded"></div>
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="h-2 bg-slate-200 rounded col-span-2"></div>
                    <div className="h-2 bg-slate-200 rounded col-span-1"></div>
                  </div>
                  <div className="h-2 bg-slate-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (results.length === 0) {
    return (
      <Card className="mt-8 w-full">
        <CardHeader>
          <CardTitle>No results found</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            No tyre options were found matching your search criteria. Please try a different size or check with your suppliers.
          </p>
        </CardContent>
      </Card>
    );
  }

  const SortButton = ({ field, label }: { field: SortField; label: string }) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => handleSort(field)}
      className="hover:bg-transparent"
    >
      {label}
      <ArrowUpDown size={14} className="ml-1.5 text-muted-foreground" />
    </Button>
  );

  return (
    <Card className="mt-8 w-full animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Tyre Options</span>
          <Badge variant="outline" className="ml-2">
            {results.length} results
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead><SortButton field="brand" label="Brand" /></TableHead>
                <TableHead><SortButton field="model" label="Model" /></TableHead>
                <TableHead><SortButton field="supplier" label="Supplier" /></TableHead>
                <TableHead className="text-right"><SortButton field="cost" label="Cost" /></TableHead>
                <TableHead className="text-right"><SortButton field="sellPrice" label="Sell Price" /></TableHead>
                <TableHead className="text-right"><SortButton field="margin" label="Margin" /></TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <motion.div
                variants={variants}
                initial="hidden"
                animate="show"
                component={React.Fragment}
              >
                {sortedResults.map((result) => (
                  <motion.tr
                    key={result.id}
                    variants={itemVariants}
                    component={TableRow}
                    className="hover:bg-accent/50 transition-colors"
                  >
                    <TableCell className="font-medium">{result.brand}</TableCell>
                    <TableCell>{result.model}</TableCell>
                    <TableCell>{result.supplier}</TableCell>
                    <TableCell className="text-right">${result.cost.toFixed(2)}</TableCell>
                    <TableCell className="text-right font-medium">${result.sellPrice.toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {result.marginType === 'percentage' ? (
                          <Percent size={14} className="text-green-500" />
                        ) : (
                          <DollarSign size={14} className="text-green-500" />
                        )}
                        <span className="text-green-500 font-medium">
                          {result.marginType === 'percentage'
                            ? `${result.margin}%`
                            : `$${result.margin.toFixed(2)}`}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button size="icon" variant="ghost">
                        <ExternalLink size={15} />
                      </Button>
                    </TableCell>
                  </motion.tr>
                ))}
              </motion.div>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default ResultsTable;
