import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/format";
import * as orderApi from "@/lib/order-api";
import type { Order } from "@/lib/order-api";

const OrderDetail = () => {
  const { id } = useParams();
  const { isLoggedIn } = useCart();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoggedIn || !id) return;

    let isMounted = true;

    const fetchOrder = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await orderApi.getOrder(id);
        if (isMounted) setOrder(data);
      } catch (err) {
        if (isMounted) {
          setError((err as any).message || "Failed to load order");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchOrder();
    return () => {
      isMounted = false;
    };
  }, [id, isLoggedIn]);

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center py-12">
            <h1 className="text-2xl font-light text-foreground mb-4">Sign in to view this order</h1>
            <p className="text-muted-foreground mb-6">You need to be logged in to view order details</p>
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
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-light text-foreground">Order Details</h1>
              <p className="text-sm text-muted-foreground">View your order summary and status</p>
            </div>
            <Button asChild variant="outline" className="rounded-none">
              <Link to="/orders">Back to Orders</Link>
            </Button>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded text-red-700 mb-6">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading order...</p>
            </div>
          ) : !order ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Order not found.</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="border border-border rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                </div>
              </div>

              <div className="border border-border rounded-lg p-6">
                <h2 className="text-lg font-light text-foreground mb-4">Items</h2>
                <div className="space-y-3">
                  {order.items.map((item) => (
                    <div key={`${item.product}-${item.name}`} className="flex justify-between text-sm">
                      <span className="text-foreground">{item.name} x {item.quantity}</span>
                      <span className="text-foreground">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border border-border rounded-lg p-6">
                <h2 className="text-lg font-light text-foreground mb-4">Pricing</h2>
                <div className="space-y-2 text-sm">
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

              <div className="border border-border rounded-lg p-6">
                <h2 className="text-lg font-light text-foreground mb-4">Payment</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground mb-1">Method</p>
                    <p className="text-foreground">
                      {order.payment?.method === 'cod'
                        ? 'COD'
                        : order.payment?.method === 'upi'
                        ? 'UPI'
                        : order.payment?.method === 'card'
                        ? 'Card'
                        : order.payment?.method
                        ? order.payment.method.replace(/_/g, ' ')
                        : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Status</p>
                    <p className="text-foreground capitalize">{order.payment?.status || "N/A"}</p>
                  </div>
                </div>
              </div>

              <div className="border border-border rounded-lg p-6">
                <h2 className="text-lg font-light text-foreground mb-4">Shipping Address</h2>
                <p className="text-sm text-foreground whitespace-pre-line">{order.shippingAddress}</p>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default OrderDetail;
