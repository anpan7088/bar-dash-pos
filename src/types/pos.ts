export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  emoji: string;
}

export interface OrderItem {
  product: Product;
  quantity: number;
}

export interface Table {
  id: number;
  name: string;
  status: 'free' | 'occupied' | 'reserved';
  seats: number;
  order?: OrderItem[];
}

export type PaymentMethod = 'cash' | 'card' | 'split';

export type ViewMode = 'tables' | 'order';
