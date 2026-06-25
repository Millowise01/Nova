export type UserRole = "guest" | "customer" | "seller" | "admin";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: UserRole;
  avatarUrl?: string | null;
  isVerified: boolean;
  createdAt: string;
}

export interface Address {
  id: string;
  userId: string;
  label: string;
  line1: string;
  line2?: string | null;
  city: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string | null;
  productCount?: number;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
  description?: string;
}

export interface Seller {
  id: string;
  shopName: string;
  slug: string;
  logoUrl?: string | null;
  description?: string;
  rating: number;
  totalSales: number;
  isVerified: boolean;
  isEcoCertified: boolean;
}

export interface ProductImage {
  id: string;
  url: string;
  alt?: string | null;
}

export type CarbonImpact = "LOW" | "MEDIUM" | "HIGH";

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  priceSll: number;
  stock: number;
  category: Category;
  brand?: Brand;
  seller: Seller;
  images: ProductImage[];
  isEcoCertified: boolean;
  ecoScore: number;
  carbonImpact: CarbonImpact;
  tags: string[];
  isActive: boolean;
  isFeatured: boolean;
  rating?: number;
  reviewCount?: number;
}

export interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  author: {
    id: string;
    name: string;
    avatarUrl?: string | null;
  };
}

export type OrderStatus =
  | "PLACED"
  | "CONFIRMED"
  | "PACKED"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED";

export type PaymentMethod = "ORANGE_MONEY" | "AFRICELL_MONEY" | "CARD";
export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

export interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  unitPriceSll: number;
  product?: {
    id: string;
    name: string;
    slug: string;
    images: ProductImage[];
  };
}

export interface Order {
  id: string;
  status: OrderStatus;
  subtotalSll: number;
  deliveryFeeSll: number;
  totalSll: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  placedAt: string;
  updatedAt: string;
  items: OrderItem[];
  deliveryAddress?: Address;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface WishlistItem {
  id: string;
  productId: string;
  addedAt: string;
  product: Pick<Product, "id" | "name" | "slug" | "priceSll" | "images">;
}

export interface Notification {
  id: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
  type: "order" | "promotion" | "security" | "system";
}

export interface DashboardMetric {
  label: string;
  value: string;
  delta: string;
  positive?: boolean;
}

export interface SellerDashboard {
  mtdRevenueSll: number;
  orderCount: number;
  avgRating: number;
  inventoryAlerts: number;
}

export interface AdminDashboard {
  revenueSll: number;
  totalUsers: number;
  totalSellers: number;
  totalOrders: number;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: "PERCENT" | "FIXED";
  discountValue: number;
  minOrderSll?: number;
  expiresAt: string;
  isActive: boolean;
}
