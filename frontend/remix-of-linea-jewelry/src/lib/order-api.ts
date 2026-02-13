import { getAuthHeader } from './auth';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface OrderItem {
  product: string;
  name: string;
  price: number;
  quantity: number;
}

export interface OrderPricing {
  subtotal: number;
  tax: number;
  shipping: number;
  totalAmount: number;
}

export interface OrderPayment {
  method: string;
  status: 'pending' | 'success' | 'failed';
  transactionId?: string;
  paidAt?: string;
}

export interface Order {
  _id: string;
  user: string;
  orderNumber: string;
  items: OrderItem[];
  pricing: OrderPricing;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  payment: OrderPayment;
  shippingAddress: string;
  createdAt: string;
  updatedAt: string;
}

interface PlaceOrderOptions {
  shippingAddress?: string;
  shippingCost?: number;
  taxRate?: number;
}

/**
 * Place order from cart
 */
export async function placeOrder(options: PlaceOrderOptions = {}): Promise<Order> {
  const response = await fetch(`${API_BASE}/orders`, {
    method: 'POST',
    headers: getAuthHeader(),
    body: JSON.stringify(options),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to place order');
  }

  const data: ApiResponse<Order> = await response.json();
  return data.data;
}

/**
 * Get all user's orders
 */
export async function getUserOrders(page: number = 1, limit: number = 10, status?: string): Promise<{ items: Order[]; pagination: any }> {
  const params = new URLSearchParams();
  params.append('page', String(page));
  params.append('limit', String(limit));
  if (status) params.append('status', status);

  const response = await fetch(`${API_BASE}/orders?${params}`, {
    method: 'GET',
    headers: getAuthHeader(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch orders');
  }

  const data: ApiResponse<{ items: Order[]; pagination: any }> = await response.json();
  return data.data;
}

/**
 * Get single order by ID
 */
export async function getOrder(orderId: string): Promise<Order> {
  const response = await fetch(`${API_BASE}/orders/${orderId}`, {
    method: 'GET',
    headers: getAuthHeader(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch order');
  }

  const data: ApiResponse<Order> = await response.json();
  return data.data;
}
