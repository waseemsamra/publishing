import type { ImagePlaceholder } from './placeholder-images';

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  materials: string[];
  certifications: string[];
  sustainabilityImpact: string;
  image: ImagePlaceholder;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Order {
  id: string;
  date: string;
  total: number;
  status: 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  customerName: string;
  itemCount: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  joinedDate: string;
}
