import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/custom/Card';
import { Supplier } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface SupplierFormProps {
  supplier?: Supplier;
  onSubmit: (supplier: Omit<Supplier, 'id' | 'created_at' | 'user_id'>) => void;
  onCancel: () => void;
}

const SupplierForm = ({ supplier, onSubmit, onCancel }: SupplierFormProps) => {
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (supplier) {
      setName(supplier.name || '');
      setContact(supplier.contact || '');
      setEmail(supplier.email || '');
      setPhone(supplier.phone || '');
    }
  }, [supplier]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Supplier name is required';
    }

    if (email && !/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      toast({
        title: "Error",
        description: "Please fix the errors in the form",
        variant: "destructive",
      });
      return;
    }

    onSubmit({
      name: name.trim(),
      contact: contact.trim(),
      email: email.trim(),
      phone: phone.trim(),
    });
  };

  return (
    <Card className="w-full max-w-lg mx-auto animate-scale-in">
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>{supplier ? 'Edit Supplier' : 'Add Supplier'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              Supplier Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. ABC Tyres"
              required
              className={errors.name ? "border-destructive" : ""}
            />
            {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact">Contact Person</Label>
            <Input
              id="contact"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="e.g. John Smith"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. contact@abctyres.com"
              className={errors.email ? "border-destructive" : ""}
            />
            {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. (123) 456-7890"
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {supplier ? 'Update Supplier' : 'Add Supplier'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default SupplierForm;
