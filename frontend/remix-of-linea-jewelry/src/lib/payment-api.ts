import { getAuthHeader } from './auth';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface MockPaymentIntent {
  mockPaymentId: string;
  mockClientSecret: string;
  amount: number;
  currency: string;
  orderId: string;
  orderNumber: string;
}

export interface PaymentWebhookResult {
  processed: boolean;
  reason?: string;
  requiresAdminReview?: boolean;
  severity?: string;
}

/**
 * Create mock payment intent for an order
 */
export async function createMockPaymentIntent(orderId: string): Promise<MockPaymentIntent> {
  const response = await fetch(`${API_BASE}/payment/mock/intent`, {
    method: 'POST',
    headers: getAuthHeader(),
    body: JSON.stringify({ orderId }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create payment intent');
  }

  const data: ApiResponse<MockPaymentIntent> = await response.json();
  return data.data;
}

/**
 * Handle mock payment webhook (simulates payment confirmation)
 */
export async function handleMockPaymentWebhook(
  event: 'payment.success' | 'payment.failed',
  mockPaymentId: string,
  orderId: string
): Promise<PaymentWebhookResult> {
  const response = await fetch(`${API_BASE}/payment/mock/webhook`, {
    method: 'POST',
    headers: getAuthHeader(),
    body: JSON.stringify({ event, mockPaymentId, orderId }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to process payment webhook');
  }

  const data: ApiResponse<PaymentWebhookResult> = await response.json();
  return data.data;
}
