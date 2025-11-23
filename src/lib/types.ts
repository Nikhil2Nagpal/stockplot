export type Product = {
  id: number;
  name: string;
  unit: string;
  category: string;
  brand: string;
  stock: number;
  status: 'In Stock' | 'Out of Stock';
  imageUrl: string;
};

export type InventoryLog = {
  id: number;
  productId: number;
  date: string; // ISO string
  oldStock: number;
  newStock: number;
  changedBy: string;
  timestamp: string; // ISO string
};
