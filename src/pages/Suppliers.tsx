
import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import SupplierList from '@/components/suppliers/SupplierList';
import SupplierForm from '@/components/suppliers/SupplierForm';
import PriceListUploader from '@/components/suppliers/PriceListUploader';
import { Supplier, ProcessedPriceList } from '@/types';
import { useToast } from '@/hooks/use-toast';

// Mock supplier data
const initialSuppliers: Supplier[] = [
  {
    id: '1',
    name: 'ABC Tyres',
    contact: 'John Smith',
    email: 'john@abctyres.com',
    phone: '(123) 456-7890',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'XYZ Supplies',
    contact: 'Jane Doe',
    email: 'jane@xyzsupplies.com',
    phone: '(098) 765-4321',
    createdAt: new Date().toISOString(),
  }
];

type FormMode = 'none' | 'add' | 'edit' | 'upload';

const Suppliers = () => {
  const { toast } = useToast();
  const [suppliers, setSuppliers] = useState<Supplier[]>(initialSuppliers);
  const [formMode, setFormMode] = useState<FormMode>('none');
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  const handleAddSupplier = () => {
    setSelectedSupplier(null);
    setFormMode('add');
  };

  const handleEditSupplier = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setFormMode('edit');
  };

  const handleDeleteSupplier = (supplierId: string) => {
    setSuppliers(suppliers.filter(s => s.id !== supplierId));
    toast({
      title: "Supplier deleted",
      description: "The supplier has been removed successfully",
    });
  };

  const handleUploadPriceList = (supplierId: string) => {
    const supplier = suppliers.find(s => s.id === supplierId);
    if (supplier) {
      setSelectedSupplier(supplier);
      setFormMode('upload');
    }
  };

  const handleSupplierFormSubmit = (supplierData: Omit<Supplier, 'id' | 'createdAt' | 'userId'>) => {
    if (formMode === 'add') {
      const newSupplier: Supplier = {
        ...supplierData,
        id: `${suppliers.length + 1}`, // Mock ID generation
        createdAt: new Date().toISOString(),
      };
      
      setSuppliers([...suppliers, newSupplier]);
      toast({
        title: "Supplier added",
        description: "New supplier has been added successfully",
      });
    } else if (formMode === 'edit' && selectedSupplier) {
      setSuppliers(
        suppliers.map(s =>
          s.id === selectedSupplier.id
            ? { ...selectedSupplier, ...supplierData }
            : s
        )
      );
      toast({
        title: "Supplier updated",
        description: "Supplier details have been updated successfully",
      });
    }
    
    setFormMode('none');
  };

  const handleUploadComplete = (data: ProcessedPriceList) => {
    // In a real app, this would save the processed data to the database
    console.log('Processed price list:', data);
    toast({
      title: "Price list processed",
      description: `Successfully added ${data.rows.length} tyre prices`,
    });
    setFormMode('none');
  };

  const renderContent = () => {
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
