import { getAuthHeader } from './auth';
import type { Cart, CartItem } from '@/types/cart';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

/**
 * Fetch user's cart
 */
export async function fetchCart(): Promise<Cart> {
  const response = await fetch(`${API_BASE}/cart`, {
    method: 'GET',
    headers: getAuthHeader(),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Unauthorized');
    }
    throw new Error('Failed to fetch cart');
  }

  const data: ApiResponse<Cart> = await response.json();
  return data.data;
}

/**
 * Add item to cart
 */
export async function addToCart(productId: string, quantity: number = 1): Promise<Cart> {
  const response = await fetch(`${API_BASE}/cart/items`, {
    method: 'POST',
    headers: getAuthHeader(),
    body: JSON.stringify({ productId, quantity }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to add item to cart');
  }

  const data: ApiResponse<Cart> = await response.json();
  return data.data;
}

/**
 * Update cart item quantity
 */
export async function updateCartItem(productId: string, quantity: number): Promise<Cart> {
  const response = await fetch(`${API_BASE}/cart/items/${productId}`, {
    method: 'PUT',
    headers: getAuthHeader(),
    body: JSON.stringify({ quantity }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update cart item');
  }

  const data: ApiResponse<Cart> = await response.json();
  return data.data;
}

/**
 * Remove item from cart
 */
export async function removeFromCart(productId: string): Promise<Cart> {
  const response = await fetch(`${API_BASE}/cart/items/${productId}`, {
    method: 'DELETE',
    headers: getAuthHeader(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to remove item from cart');
  }

  const data: ApiResponse<Cart> = await response.json();
  return data.data;
}

/**
 * Clear entire cart
 */
export async function clearCart(): Promise<Cart> {
  const response = await fetch(`${API_BASE}/cart`, {
    method: 'DELETE',
    headers: getAuthHeader(),
  });

  if (!response.ok) {
    throw new Error('Failed to clear cart');
  }

  const data: ApiResponse<Cart> = await response.json();
  return data.data;
}
