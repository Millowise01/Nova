export type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'CUSTOMER' | 'SELLER' | 'ADMIN';
  avatarUrl?: string | null;
  isVerified: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type Address = {
  id: string;
  userId: string;
  label: string;
  line1: string;
  line2?: string | null;
  city: string;
  country: string;
  phone: string;
  what3words?: string | null;
  isDefault?: boolean;
};

export type OrderItem = {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  product?: {
    id: string;
    name: string;
    slug: string;
    images: Array<{ id: string; url: string; alt?: string | null }>;
  };
};

export type Order = {
  id: string;
  customerId: string;
  sellerId: string;
  status: 'PLACED' | 'CONFIRMED' | 'PACKED' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentMethod: 'ORANGE_MONEY' | 'AFRICELL_MONEY' | 'CARD';
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  paymentRef?: string | null;
  addressId: string;
  notes?: string | null;
  what3words?: string | null;
  placedAt: string;
  updatedAt: string;
  items: OrderItem[];
};