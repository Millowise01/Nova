import { useMutation, useQuery } from '@tanstack/react-query';

import {
  fetchCategories,
  fetchFeaturedProducts,
  fetchHomeBanners,
  fetchHomeFeed,
  fetchProductBySlug,
  fetchProductList,
  fetchRelatedProducts,
  incrementProductView,
  type ProductListParams,
} from '@/api/products';

export function useFeaturedProductsQuery() {
  return useQuery({ queryKey: ['products', 'featured'], queryFn: fetchFeaturedProducts });
}

export function useCategoriesQuery() {
  return useQuery({ queryKey: ['categories'], queryFn: fetchCategories });
}

export function useHomeFeedQuery() {
  return useQuery({ queryKey: ['home', 'feed'], queryFn: fetchHomeFeed });
}

export function useHomeBannersQuery() {
  return useQuery({ queryKey: ['home', 'banners'], queryFn: fetchHomeBanners });
}

export function useProductListQuery(params: ProductListParams) {
  return useQuery({ queryKey: ['products', 'list', params], queryFn: () => fetchProductList(params) });
}

export function useProductDetailQuery(slug: string) {
  return useQuery({ queryKey: ['products', slug], queryFn: () => fetchProductBySlug(slug), enabled: Boolean(slug) });
}

export function useRelatedProductsQuery(slug: string) {
  return useQuery({ queryKey: ['products', slug, 'related'], queryFn: () => fetchRelatedProducts(slug), enabled: Boolean(slug) });
}

export function useIncrementProductViewMutation() {
  return useMutation({ mutationFn: (slug: string) => incrementProductView(slug) });
}