
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/custom/Card';
import { Separator } from '@/components/ui/separator';
import { Plus, Upload, Pencil, Trash2, FileText, Calendar, File } from 'lucide-react';
import { Supplier } from '@/types';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

interface SupplierListProps {
  suppliers: Supplier[];
  onAddSupplier: () => void;
  onEditSupplier: (supplier: Supplier) => void;
  onDeleteSupplier: (supplierId: string) => void;
  onUploadPriceList: (supplierId: string) => void;
}

const SupplierList = ({
  suppliers,
  onAddSupplier,
  onEditSupplier,
  onDeleteSupplier,
  onUploadPriceList
}: SupplierListProps) => {
  const listVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Suppliers</CardTitle>
        <Button onClick={onAddSupplier} size="sm">
          <Plus size={16} className="mr-2" />
          Add Supplier
        </Button>
      </CardHeader>
      <CardContent>
        {suppliers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="rounded-full bg-muted p-3">
              <File className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">No suppliers added</h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-xs">
              You haven't added any suppliers yet. Add your first supplier to begin managing tyre options.
            </p>
            <Button onClick={onAddSupplier} className="mt-4">
              <Plus size={16} className="mr-2" />
              Add Supplier
            </Button>
          </div>
        ) : (
          <motion.div
            className="space-y-4"
            variants={listVariants}
            initial="hidden"
            animate="show"
          >
            {suppliers.map((supplier) => (
              <motion.div
                key={supplier.id}
                variants={itemVariants}
                className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/20 transition-colors"
              >
                <div className="flex-1 space-y-1">
                  <div className="font-medium">{supplier.name}</div>
                  {supplier.email && (
                    <div className="text-sm text-muted-foreground">{supplier.email}</div>
                  )}
                  <div className="flex items-center text-xs text-muted-foreground mt-2">
                    <Calendar size={12} className="mr-1" />
                    Added {format(new Date(supplier.createdAt), 'PP')}
                  </div>
                </div>

                <div className="mt-4 md:mt-0 flex flex-row space-x-2 justify-end">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8"
                    onClick={() => onUploadPriceList(supplier.id)}
                  >
                    <Upload size={14} className="mr-1" />
                    <span className="hidden sm:inline">Price List</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8"
                    onClick={() => onEditSupplier(supplier)}
                  >
                    <Pencil size={14} />
                    <span className="sr-only">Edit</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => onDeleteSupplier(supplier.id)}
                  >
                    <Trash2 size={14} />
                    <span className="sr-only">Delete</span>
                  </Button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};

export default SupplierList;
