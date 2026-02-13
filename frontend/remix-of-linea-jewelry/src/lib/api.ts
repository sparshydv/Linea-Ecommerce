import type { Product } from '@/types/product';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

async function request<T>(path: string) {
  const response = await fetch(`${API_BASE_URL}${path}`);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  const payload = await response.json();
  return payload.data as T;
}

export async function fetchProducts(params: {
  page?: number;
  limit?: number;
  category?: string;
  sort?: string;
  newArrivals?: number;
}) {
  const search = new URLSearchParams();
  if (params.page) search.set('page', String(params.page));
  if (params.limit) search.set('limit', String(params.limit));
  if (params.category) search.set('category', params.category);
  if (params.sort) search.set('sort', params.sort);
  if (params.newArrivals) search.set('newArrivals', String(params.newArrivals));

  const query = search.toString();
  return request<{ items: Product[]; pagination: { page: number; limit: number; total: number; totalPages: number } }>(
    `/products${query ? `?${query}` : ''}`
  );
}

export async function fetchProductBySlug(slug: string) {
  return request<Product>(`/products/${slug}`);
}
