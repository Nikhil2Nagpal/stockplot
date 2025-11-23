'use client';

import type { Product, InventoryLog } from '@/lib/types';
import React, { useState, useMemo, useCallback, useRef, ChangeEvent } from 'react';
import { useToast } from "@/hooks/use-toast"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Plus, Upload, Download, Loader2 } from 'lucide-react';
import ProductTable from './product-table';
import HistoryPanel from './history-panel';
import ProductDialog from './product-dialog';

interface InventoryManagementSystemProps {
  initialProducts: Product[];
  categories: string[];
}

export default function InventoryManagementSystem({ initialProducts, categories }: InventoryManagementSystemProps) {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isHistoryPanelOpen, setIsHistoryPanelOpen] = useState(false);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchProducts = useCallback(async (search = searchTerm, category = categoryFilter) => {
    setIsLoading(true);
    try {
      let url = '/api/products';
      if (search) {
        url = `/api/products/search?name=${encodeURIComponent(search)}`;
      } else if (category && category !== 'all') {
        url = `/api/products?category=${encodeURIComponent(category)}`;
      }
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not fetch products.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast, searchTerm, categoryFilter]);

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    // Debounce could be added here
    fetchProducts(e.target.value, categoryFilter);
  };

  const handleCategoryChange = (value: string) => {
    setCategoryFilter(value);
    setSearchTerm(''); // Clear search when changing category
    fetchProducts('', value);
  };
  
  const handleRowClick = (product: Product) => {
    setSelectedProduct(product);
    setIsHistoryPanelOpen(true);
  };

  const refreshProducts = () => fetchProducts();

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/products/import', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Import failed');
      }

      const result = await response.json();
      toast({
        title: "Import Successful",
        description: `${result.added} products added, ${result.skipped} skipped.`,
      });
      refreshProducts();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Import Error",
        description: error.message || "An unexpected error occurred during import.",
      });
    } finally {
      setIsImporting(false);
      if(fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleExportClick = async () => {
    setIsExporting(true);
    try {
      const response = await fetch('/api/products/export');
      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `products-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Export Successful",
        description: "Your product data is being downloaded.",
      });

    } catch (error: any) {
       toast({
        variant: "destructive",
        title: "Export Error",
        description: error.message || "Could not export products.",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <main className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8 overflow-hidden">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-primary tracking-tight">StockPilot</h1>
          <p className="text-muted-foreground mt-1">Your central hub for product inventory management.</p>
        </header>

        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="Search by product name..." 
              className="pl-10" 
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          <Select value={categoryFilter} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            <Button onClick={() => setIsAddDialogOpen(true)} className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" /> Add New
            </Button>
             <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".csv"
                className="hidden"
              />
            <Button variant="outline" onClick={handleImportClick} disabled={isImporting} className="w-1/2 sm:w-auto">
              {isImporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
              Import
            </Button>
            <Button variant="outline" onClick={handleExportClick} disabled={isExporting} className="w-1/2 sm:w-auto">
             {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
              Export
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-auto rounded-lg border shadow-sm">
          <ProductTable 
            products={products}
            onRowClick={handleRowClick}
            refreshProducts={refreshProducts}
            isLoading={isLoading}
          />
        </div>
      </main>

      {selectedProduct && (
         <HistoryPanel
          product={selectedProduct}
          isOpen={isHistoryPanelOpen}
          onOpenChange={setIsHistoryPanelOpen}
        />
      )}

      <ProductDialog 
        isOpen={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onProductAdded={refreshProducts}
      />
    </div>
  );
}
