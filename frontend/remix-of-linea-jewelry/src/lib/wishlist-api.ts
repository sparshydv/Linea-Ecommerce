import { getAuthHeader } from './auth';
import type { Wishlist } from '@/types/cart';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

/**
 * Add product to wishlist
 */
export async function addToWishlist(productId: string): Promise<Wishlist> {
  const response = await fetch(`${API_BASE}/wishlist`, {
    method: 'POST',
    headers: getAuthHeader(),
    body: JSON.stringify({ productId }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to add to wishlist');
  }

  const data: ApiResponse<Wishlist> = await response.json();
  return data.data;
}

/**
 * Get all wishlist items
 */
export async function getWishlist(): Promise<Wishlist[]> {
  const response = await fetch(`${API_BASE}/wishlist`, {
    method: 'GET',
    headers: getAuthHeader(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch wishlist');
  }

  const data: ApiResponse<Wishlist[]> = await response.json();
  return data.data;
}

/**
 * Remove product from wishlist
 */
export async function removeFromWishlist(productId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/wishlist/${productId}`, {
    method: 'DELETE',
    headers: getAuthHeader(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to remove from wishlist');
  }
}
