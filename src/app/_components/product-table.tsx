'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import type { Product } from '@/lib/types';
import { useToast } from "@/hooks/use-toast"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Edit, Trash2, Save, X, Loader2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface ProductTableProps {
  products: Product[];
  onRowClick: (product: Product) => void;
  refreshProducts: () => void;
  isLoading: boolean;
}

const ProductRow = ({ product, onRowClick, refreshProducts }: { product: Product, onRowClick: (p: Product) => void, refreshProducts: () => void }) => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editedProduct, setEditedProduct] = useState(product);

  const handleEdit = () => {
    setEditedProduct(product);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editedProduct),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save product');
      }
      toast({ title: "Success", description: "Product updated successfully." });
      refreshProducts();
      setIsEditing(false);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/products/${product.id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete product');
      toast({ title: "Success", description: "Product deleted successfully." });
      refreshProducts();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const isNumericField = ['stock'].includes(name);
    setEditedProduct(prev => ({ ...prev, [name]: isNumericField ? Number(value) : value }));
  };
  
  const statusVariant = product.status === 'In Stock' ? 'default' : 'destructive';

  if (isEditing) {
    return (
      <TableRow className="bg-secondary">
        <TableCell><Image src={product.imageUrl} alt={product.name} width={40} height={40} className="rounded-md" data-ai-hint="product image"/></TableCell>
        <TableCell><Input name="name" value={editedProduct.name} onChange={handleChange} className="h-8" /></TableCell>
        <TableCell><Input name="unit" value={editedProduct.unit} onChange={handleChange} className="h-8 w-20" /></TableCell>
        <TableCell><Input name="category" value={editedProduct.category} onChange={handleChange} className="h-8 w-32" /></TableCell>
        <TableCell><Input name="brand" value={editedProduct.brand} onChange={handleChange} className="h-8 w-32" /></TableCell>
        <TableCell><Input name="stock" type="number" value={editedProduct.stock} onChange={handleChange} className="h-8 w-20" /></TableCell>
        <TableCell>{product.status}</TableCell>
        <TableCell className="flex gap-2">
          <Button size="icon" variant="ghost" onClick={handleSave} disabled={isSaving} className="h-8 w-8">
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          </Button>
          <Button size="icon" variant="ghost" onClick={handleCancel} className="h-8 w-8 text-destructive"><X className="h-4 w-4" /></Button>
        </TableCell>
      </TableRow>
    );
  }

  return (
    <TableRow key={product.id} className="cursor-pointer" onClick={() => onRowClick(product)}>
      <TableCell><Image src={product.imageUrl} alt={product.name} width={40} height={40} className="rounded-md" data-ai-hint="product image" /></TableCell>
      <TableCell className="font-medium">{product.name}</TableCell>
      <TableCell>{product.unit}</TableCell>
      <TableCell>{product.category}</TableCell>
      <TableCell>{product.brand}</TableCell>
      <TableCell>{product.stock}</TableCell>
      <TableCell>
        <Badge variant={statusVariant} className={statusVariant === 'default' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'}>
          {product.status}
        </Badge>
      </TableCell>
      <TableCell onClick={e => e.stopPropagation()} className="text-right">
        <div className="flex gap-2 justify-end">
          <Button size="icon" variant="ghost" onClick={handleEdit} className="h-8 w-8"><Edit className="h-4 w-4" /></Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the product "{product.name}".
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
                  {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default function ProductTable({ products, onRowClick, refreshProducts, isLoading }: ProductTableProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex justify-center items-center h-full text-muted-foreground">
        No products found.
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[60px]">Image</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Unit</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Brand</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right w-[120px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map(product => (
            <ProductRow key={product.id} product={product} onRowClick={onRowClick} refreshProducts={refreshProducts} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
