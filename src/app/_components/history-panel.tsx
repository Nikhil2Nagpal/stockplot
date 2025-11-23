'use client';
import React, { useState, useEffect } from 'react';
import type { Product, InventoryLog } from '@/lib/types';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';

interface HistoryPanelProps {
  product: Product | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function HistoryPanel({ product, isOpen, onOpenChange }: HistoryPanelProps) {
  const [history, setHistory] = useState<InventoryLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && product) {
      setIsLoading(true);
      fetch(`/api/products/${product.id}/history`)
        .then(res => res.json())
        .then(data => {
          setHistory(data);
          setIsLoading(false);
        })
        .catch(err => {
          console.error("Failed to fetch history:", err);
          setIsLoading(false);
        });
    }
  }, [isOpen, product]);

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg w-full flex flex-col">
        <SheetHeader>
          <SheetTitle>Inventory History: {product?.name}</SheetTitle>
          <SheetDescription>
            A log of all stock changes for this product.
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-hidden">
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : history.length > 0 ? (
            <ScrollArea className="h-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Old</TableHead>
                    <TableHead>New</TableHead>
                    <TableHead>Change</TableHead>
                    <TableHead>By</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map(log => {
                    const change = log.newStock - log.oldStock;
                    return (
                      <TableRow key={log.id}>
                        <TableCell className="text-xs">{format(new Date(log.date), 'PP p')}</TableCell>
                        <TableCell>{log.oldStock}</TableCell>
                        <TableCell>{log.newStock}</TableCell>
                        <TableCell>
                          <Badge variant={change > 0 ? 'default' : 'destructive'} className={change > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {change > 0 ? `+${change}` : change}
                          </Badge>
                        </TableCell>
                        <TableCell>{log.changedBy}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </ScrollArea>
          ) : (
            <div className="flex justify-center items-center h-full text-muted-foreground">
              No inventory history found.
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
