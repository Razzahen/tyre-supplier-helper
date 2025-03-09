
import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import SupplierList from '@/components/suppliers/SupplierList';
import SupplierForm from '@/components/suppliers/SupplierForm';
import PriceListUploader from '@/components/suppliers/PriceListUploader';
import { Supplier, ProcessedPriceList } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSuppliers, createSupplier, updateSupplier, deleteSupplier } from '@/api/suppliers';
import { savePriceList } from '@/api/tyres';
import { Loader2 } from 'lucide-react';

type FormMode = 'none' | 'add' | 'edit' | 'upload';

const Suppliers = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formMode, setFormMode] = useState<FormMode>('none');
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  // Query suppliers
  const { data: suppliers = [], isLoading } = useQuery({
    queryKey: ['suppliers'],
    queryFn: getSuppliers
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: createSupplier,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast({
        title: "Supplier added",
        description: "New supplier has been added successfully",
      });
      setFormMode('none');
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to add supplier: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, supplier }: { id: string; supplier: Partial<Omit<Supplier, 'id' | 'user_id' | 'created_at'>> }) => 
      updateSupplier(id, supplier),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast({
        title: "Supplier updated",
        description: "Supplier details have been updated successfully",
      });
      setFormMode('none');
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update supplier: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSupplier,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast({
        title: "Supplier deleted",
        description: "The supplier has been removed successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete supplier: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  const priceListMutation = useMutation({
    mutationFn: savePriceList,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tyre-prices'] });
      toast({
        title: "Price list saved",
        description: "The price list has been processed and saved successfully",
      });
      setFormMode('none');
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to save price list: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  const handleAddSupplier = () => {
    setSelectedSupplier(null);
    setFormMode('add');
  };

  const handleEditSupplier = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setFormMode('edit');
  };

  const handleDeleteSupplier = (supplierId: string) => {
    deleteMutation.mutate(supplierId);
  };

  const handleUploadPriceList = (supplierId: string) => {
    const supplier = suppliers.find(s => s.id === supplierId);
    if (supplier) {
      setSelectedSupplier(supplier);
      setFormMode('upload');
    }
  };

  const handleSupplierFormSubmit = (supplierData: Omit<Supplier, 'id' | 'created_at' | 'user_id'>) => {
    if (formMode === 'add') {
      createMutation.mutate(supplierData);
    } else if (formMode === 'edit' && selectedSupplier) {
      updateMutation.mutate({
        id: selectedSupplier.id,
        supplier: supplierData
      });
    }
  };

  const handleUploadComplete = (data: ProcessedPriceList) => {
    priceListMutation.mutate(data);
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center p-12">
          <Loader2 size={48} className="animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading suppliers...</p>
        </div>
      );
    }

    switch (formMode) {
      case 'add':
        return (
          <SupplierForm
            onSubmit={handleSupplierFormSubmit}
            onCancel={() => setFormMode('none')}
          />
        );
      case 'edit':
        return (
          <SupplierForm
            supplier={selectedSupplier || undefined}
            onSubmit={handleSupplierFormSubmit}
            onCancel={() => setFormMode('none')}
          />
        );
      case 'upload':
        return selectedSupplier ? (
          <PriceListUploader
            supplierId={selectedSupplier.id}
            supplierName={selectedSupplier.name}
            onClose={() => setFormMode('none')}
            onUploadComplete={handleUploadComplete}
          />
        ) : null;
      default:
        return (
          <SupplierList
            suppliers={suppliers}
            onAddSupplier={handleAddSupplier}
            onEditSupplier={handleEditSupplier}
            onDeleteSupplier={handleDeleteSupplier}
            onUploadPriceList={handleUploadPriceList}
          />
        );
    }
  };

  return (
    <Layout
      title="Suppliers"
      description="Manage your tyre suppliers and their price lists"
    >
      {renderContent()}
    </Layout>
  );
};

export default Suppliers;
