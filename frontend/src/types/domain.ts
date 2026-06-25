export type UserRole = "guest" | "customer" | "seller" | "admin";

export interface Product {
  id: string;
  name: string;
  slug: string;
  priceSll: number;
  ecoScore: number;
  image: string;
  brand: string;
  category: string;
}

export interface Order {
  id: string;
  status: "pending" | "processing" | "in_transit" | "delivered";
  totalSll: number;
  createdAt: string;
}

export interface DashboardMetric {
  label: string;
  value: string;
  delta: string;
}
