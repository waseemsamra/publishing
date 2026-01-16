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

export interface MustHaveProduct {
    id: string;
    name: string;
    price: string;
    minUnits: string;
    delivery: string;
    badge?: string;
    image: ImagePlaceholder;
    tags?: ('new-in' | 'most-popular' | 'ready-to-ship')[];
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
  email: string;
  firstName?: string;
  lastName?: string;
  displayName?: string; // Optional if you use firstName/lastName
  role: 'admin' | 'editor' | 'viewer' | 'customer';
  roles: ('admin' | 'customer')[];
  status: 'active' | 'inactive' | 'pending';
  createdAt: any; // Consider using Date | firebase.firestore.Timestamp
  lastLogin?: any; // Consider using Date | firebase.firestore.Timestamp
  phone?: string;
  photoURL?: string;
}

export interface BrandStory {
    id: string;
    title: string;
    description: string;
    image: ImagePlaceholder;
}

export interface Size {
  id: string;
  name: string;
  shortName: string;
  createdAt?: any;
}

export interface Colour {
  id: string;
  name: string;
  hexCode: string;
  createdAt?: any;
}
    