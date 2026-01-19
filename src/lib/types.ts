import type { ImagePlaceholder } from './placeholder-images';

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  images?: ImagePlaceholder[];
  materials: string[];
  certifications: string[];
  sustainabilityImpact: string;
  
  // Option relationships
  categoryIds?: string[];
  sizeIds?: string[];
  colourIds?: string[];
  printOptionIds?: string[];
  wallTypeIds?: string[];
  thicknessIds?: string[];
  materialTypeIds?: string[];
  finishTypeIds?: string[];
  adhesiveIds?: string[];
  handleIds?: string[];
  shapeIds?: string[];

  createdAt?: any;
  updatedAt?: any;
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

export interface PrintOption {
  id: string;
  name: string;
  description: string;
  createdAt?: any;
}

export interface WallType {
  id: string;
  name: string;
  createdAt?: any;
}

export interface Thickness {
  id: string;
  name: string;
  description: string;
  createdAt?: any;
}

export interface MaterialType {
  id: string;
  name: string;
  description: string;
  createdAt?: any;
}

export interface FinishType {
  id: string;
  name: string;
  description: string;
  createdAt?: any;
}

export interface Adhesive {
  id: string;
  name: string;
  description: string;
  createdAt?: any;
}

export interface Handle {
  id: string;
  name: string;
  description: string;
  createdAt?: any;
}
    
export interface Shape {
  id: string;
  name: string;
  description: string;
  createdAt?: any;
}

export interface StoreSettings {
  id: string;
  storeName?: string;
  logoUrl?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  companyDetails?: string;
  updatedAt?: any;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  parentId?: string;
  imageUrl?: string;
  imageHint?: string;
  createdAt?: any;
}
  
export interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  links: { text: string; href: string }[];
  imageUrl: string;
  imageHint: string;
  order: number;
  createdAt?: any;
  updatedAt?: any;
}

export interface TrendingItem {
  id: string;
  title: string;
  imageUrl: string;
  imageHint: string;
  order: number;
  createdAt?: any;
  updatedAt?: any;
}
    
