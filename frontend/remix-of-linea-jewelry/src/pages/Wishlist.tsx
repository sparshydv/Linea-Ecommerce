import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/header/Header';
import Footer from '@/components/footer/Footer';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import * as wishlistApi from '@/lib/wishlist-api';
import { formatPrice } from '@/lib/format';
import type { Wishlist } from '@/types/cart';
import { Trash2 } from 'lucide-react';

const Wishlist = () => {
  const { isLoggedIn, addItem } = useCart();
  const [items, setItems] = useState<Wishlist[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    if (isLoggedIn) {
      fetchWishlist();
    }
  }, [isLoggedIn]);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      setError(null);
      const wishlistItems = await wishlistApi.getWishlist();
      setItems(wishlistItems);
    } catch (err) {
      setError((err as any).message || 'Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (productId: string) => {
    try {
      setRemovingId(productId);
      await wishlistApi.removeFromWishlist(productId);
      setItems(items.filter(item => item.product._id !== productId));
    } catch (err) {
      setError((err as any).message || 'Failed to remove item');
    } finally {
      setRemovingId(null);
    }
  };

  const handleAddToCart = async (productId: string) => {
    try {
      await addItem(productId, 1);
      // Optionally remove from wishlist after adding to cart
      // await handleRemove(productId);
    } catch (err) {
      setError((err as any).message || 'Failed to add to cart');
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center py-12">
            <h1 className="text-2xl font-light text-foreground mb-4">Sign in to view wishlist</h1>
            <p className="text-muted-foreground mb-6">You need to be logged in to view your wishlist</p>
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
          <h1 className="text-3xl font-light text-foreground mb-8">My Wishlist</h1>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded text-red-700 mb-6">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading wishlist...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-6">Your wishlist is empty</p>
              <Button asChild>
                <Link to="/category/shop">Continue Shopping</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {items.map((item) => (
                <div key={item._id} className="border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                  <Link to={`/product/${item.product.slug}`} className="block bg-muted h-64 overflow-hidden">
                    <img 
                      src={item.product.images?.[0]?.url || ''} 
                      alt={item.product.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                    />
                  </Link>
                  
                  <div className="p-4 space-y-4">
                    <Link to={`/product/${item.product.slug}`} className="block hover:underline">
                      <p className="text-xs text-muted-foreground mb-1">{item.product.category}</p>
                      <h3 className="text-sm font-medium text-foreground">{item.product.name}</h3>
                    </Link>

                    <div className="flex justify-between items-center">
                      <p className="text-lg font-light text-foreground">
                        {formatPrice(item.product.finalPrice)}
                      </p>
                      <button
                        onClick={() => handleRemove(item.product._id)}
                        disabled={removingId === item.product._id}
                        className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <Button
                      onClick={() => handleAddToCart(item.product._id)}
                      className="w-full rounded-none"
                      disabled={!item.product.isActive}
                    >
                      {!item.product.isActive ? 'Out of Stock' : 'Add to Bag'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Wishlist;
