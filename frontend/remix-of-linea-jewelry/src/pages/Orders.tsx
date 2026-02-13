import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/header/Header';
import Footer from '@/components/footer/Footer';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import * as orderApi from '@/lib/order-api';
import { formatPrice } from '@/lib/format';
import type { Order } from '@/lib/order-api';

const Orders = () => {
  const { isLoggedIn } = useCart();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 0 });

  useEffect(() => {
    if (isLoggedIn) {
      fetchOrders();
    }
  }, [isLoggedIn]);

  const fetchOrders = async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      const result = await orderApi.getUserOrders(page, 10);
      setOrders(result.items);
      setPagination(result.pagination);
    } catch (err) {
      setError((err as any).message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center py-12">
            <h1 className="text-2xl font-light text-foreground mb-4">Sign in to view orders</h1>
            <p className="text-muted-foreground mb-6">You need to be logged in to view your orders</p>
            <Button asChild>
              <Link to="/auth/login">Sign In</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <h1 className="text-3xl font-light text-foreground mb-8">My Orders</h1>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded text-red-700 mb-6">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-6">You haven't placed any orders yet</p>
              <Button asChild>
                <Link to="/category/shop">Continue Shopping</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <div key={order._id} className="border border-border rounded-lg p-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Order Number</p>
                      <p className="font-medium text-foreground">{order.orderNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Date</p>
                      <p className="font-medium text-foreground">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Status</p>
                      <p className="font-medium text-foreground capitalize">{order.status}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Total</p>
                      <p className="font-medium text-foreground">
                        {formatPrice(order.pricing.totalAmount)}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-border pt-4 mt-4">
                    <div className="space-y-2">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span className="text-foreground">{item.name} x {item.quantity}</span>
                          <span className="text-foreground">{formatPrice(item.price * item.quantity)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-border mt-4 pt-4">
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span className="text-foreground">{formatPrice(order.pricing.subtotal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Shipping</span>
                        <span className="text-foreground">{formatPrice(order.pricing.shipping)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tax</span>
                        <span className="text-foreground">{formatPrice(order.pricing.tax)}</span>
                      </div>
                      <div className="flex justify-between font-medium border-t border-border pt-2">
                        <span className="text-foreground">Total</span>
                        <span className="text-foreground">{formatPrice(order.pricing.totalAmount)}</span>
                      </div>
                    </div>
                  </div>

                  <Button asChild variant="outline" className="w-full mt-4 rounded-none">
                    <Link to={`/orders/${order._id}`}>View Order Details</Link>
                  </Button>
                </div>
              ))}

              {pagination.totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => fetchOrders(page)}
                      className={`px-4 py-2 border rounded ${
                        page === pagination.page
                          ? 'bg-foreground text-background'
                          : 'border-border hover:bg-muted'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Orders;
