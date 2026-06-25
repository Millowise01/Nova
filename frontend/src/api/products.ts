import { api } from '@/lib/axios';

export type Meta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type PaginatedResponse<T> = {
  data: T[];
  meta: Meta;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  productCount?: number;
};

export type SellerSummary = {
  id: string;
  shopName: string;
  logoUrl?: string | null;
  rating: number;
  isVerified: boolean;
  isEcoCertified: boolean;
};

export type ProductImage = {
  id: string;
  url: string;
  alt?: string | null;
};

export type CarbonImpact = 'LOW' | 'MEDIUM' | 'HIGH';

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  category: Category;
  seller: SellerSummary;
  images: ProductImage[];
  isEcoCertified: boolean;
  carbonImpact: CarbonImpact;
  tags: string[];
  isActive: boolean;
  isFeatured: boolean;
  views: number;
  rating?: number;
  reviewCount?: number;
};

export type Review = {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  author: {
    id: string;
    name: string;
    avatarUrl?: string | null;
  };
};

export type ProductListParams = {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  eco?: boolean;
  rating?: number;
  search?: string;
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'top_rated';
  page?: number;
  limit?: number;
};

export type HomeFeed = {
  featuredProducts: Product[];
  ecoProducts: Product[];
  featuredSellers: SellerSummary[];
  categories: Category[];
};

export type HomeBanner = {
  id: string;
  title: string;
  subtitle: string;
  imageUrl?: string | null;
  ctaLabel?: string | null;
  ctaHref?: string | null;
};

export type ProductDetail = Product & {
  seller: SellerSummary & {
    shopDescription?: string | null;
  };
  relatedProducts: Product[];
};

export type ProductDetailResponse = {
  product: ProductDetail;
  reviews: PaginatedResponse<Review>;
};

export type ProductViewResponse = {
  viewed: boolean;
};

function toSearchParams(params: ProductListParams = {}) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }

    searchParams.set(key, String(value));
  });

  return searchParams;
}

export async function fetchFeaturedProducts() {
  const response = await api.get<{ success: boolean; data: Product[] }>('/products/featured');
  return response.data.data;
}

export async function fetchCategories() {
  const response = await api.get<{ success: boolean; data: Category[] }>('/categories');
  return response.data.data;
}

export async function fetchHomeFeed() {
  const response = await api.get<{ success: boolean; data: HomeFeed }>('/home');
  return response.data.data;
}

export async function fetchProductList(params: ProductListParams = {}) {
  const query = toSearchParams(params);
  const response = await api.get<{ success: boolean; data: PaginatedResponse<Product> }>(`/products?${query.toString()}`);
  return response.data.data;
}

export async function fetchProductBySlug(slug: string) {
  const response = await api.get<{ success: boolean; data: ProductDetailResponse }>(`/products/${slug}`);
  return response.data.data;
}

export async function fetchRelatedProducts(slug: string) {
  const response = await api.get<{ success: boolean; data: Product[] }>(`/products/${slug}/related`);
  return response.data.data;
}

export async function incrementProductView(slug: string) {
  const response = await api.post<{ success: boolean; data: ProductViewResponse }>(`/products/${slug}/view`);
  return response.data.data;
}

export async function fetchFeaturedSellers() {
  const response = await api.get<{ success: boolean; data: SellerSummary[] }>('/seller/featured');
  return response.data.data;
}

export async function fetchHomeBanners() {
  const response = await api.get<{ success: boolean; data: HomeBanner[] }>('/banners');
  return response.data.data;
}