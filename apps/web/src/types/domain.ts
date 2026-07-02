import type { ID, ISODateString } from "@nova/types";

export interface CommerceImage {
  url: string;
  alt: string;
}

export interface Price {
  amount: number;
  currency: "SLL" | "USD";
  formatted: string;
  discountPercentage?: number;
}

export interface Product {
  id: ID;
  slug: string;
  title: string;
  description: string;
  price: Price;
  rating: number;
  reviewCount: number;
  images: CommerceImage[];
  sellerName: string;
  inStock: boolean;
  ecoScore?: "A" | "B" | "C" | "D";
  category: string;
  tags: string[];
}

export interface Category {
  id: ID;
  slug: string;
  name: string;
  productCount: number;
}

export interface Brand {
  id: ID;
  slug: string;
  name: string;
  logoUrl: string;
}

export interface Address {
  id: ID;
  label: string;
  recipient: string;
  line1: string;
  city: string;
  district: string;
  phone: string;
  isDefault: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
  savedForLater?: boolean;
}

export interface Order {
  id: ID;
  orderNumber: string;
  createdAt: ISODateString;
  status: "processing" | "shipped" | "delivered" | "cancelled" | "returned";
  total: Price;
  items: CartItem[];
}

export interface NavigationLink {
  href: string;
  label: string;
}

export interface ModuleCard {
  title: string;
  description: string;
  href?: string;
  badge?: string;
}
