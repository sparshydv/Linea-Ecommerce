import { X, Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import type { Cart } from "@/types/cart";
import { formatPrice } from "@/lib/format";

interface ShoppingBagProps {
  isOpen: boolean;
  onClose: () => void;
  cart: Cart | null;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  isLoggedIn: boolean;
  onViewFavorites?: () => void;
}

const ShoppingBag = ({ 
  isOpen, 
  onClose, 
  cart, 
  updateQuantity, 
  removeItem,
  isLoggedIn,
  onViewFavorites 
}: ShoppingBagProps) => {
  if (!isOpen) return null;

  const cartItems = cart?.items || [];
  const subtotal = cartItems.reduce((sum, item) => sum + (item.priceSnapshot * item.quantity), 0) || 0;

  const handleQuantityChange = async (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      await removeItem(productId);
    } else {
      await updateQuantity(productId, newQuantity);
    }
  };

  return (
    <div className="fixed inset-0 z-50 h-screen">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 h-screen"
        onClick={onClose}
      />
      
      {/* Off-canvas panel */}
      <div className="absolute right-0 top-0 h-screen w-96 bg-background border-l border-border animate-slide-in-right flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-light text-foreground">Shopping Bag</h2>
          <button
            onClick={onClose}
            className="p-2 text-foreground hover:text-muted-foreground transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 flex flex-col p-6">
          {/* Mobile favorites toggle - only show on mobile */}
          {onViewFavorites && (
            <div className="md:hidden mb-6 pb-6 border-b border-border">
              <button
                onClick={onViewFavorites}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-border rounded-lg text-nav-foreground hover:text-nav-hover hover:border-nav-hover transition-colors duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                </svg>
                <span className="text-sm font-light">View Favorites</span>
              </button>
            </div>
          )}
          
          {!isLoggedIn ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-4">
              <p className="text-muted-foreground text-sm text-center">
                Please log in to view your shopping bag and save items.
              </p>
              <Button className="w-full">
                <Link to="/auth/login">Log In</Link>
              </Button>
            </div>
          ) : cartItems.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-muted-foreground text-sm text-center">
                Your shopping bag is empty.<br />
                Continue shopping to add items to your bag.
              </p>
            </div>
          ) : (
            <>
              {/* Cart items */}
              <div className="flex-1 overflow-y-auto space-y-6 mb-6">
                {cartItems.map((item) => {
                  const imageUrl = item.product.images?.[0]?.url || '';
                  return (
                    <div key={item.product._id} className="flex gap-4">
                      <div className="w-20 h-20 bg-muted/10 rounded-lg overflow-hidden">
                        <img 
                          src={imageUrl}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="text-sm font-light text-muted-foreground">{item.product.category}</p>
                            <h3 className="text-sm font-medium text-foreground">{item.product.name}</h3>
                          </div>
                          <button
                            onClick={() => removeItem(item.product._id)}
                            className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                            aria-label="Remove item"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <p className="text-sm font-light text-foreground mb-3">
                          {formatPrice(item.priceSnapshot)}
                        </p>
                        <div className="flex items-center gap-2 mt-3">
                          <div className="flex items-center border border-border">
                            <button 
                              onClick={() => handleQuantityChange(item.product._id, item.quantity - 1)}
                              className="p-2 hover:bg-muted/50 transition-colors"
                              aria-label="Decrease quantity"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="px-3 py-2 text-sm font-light min-w-[40px] text-center">
                              {item.quantity}
                            </span>
                            <button 
                              onClick={() => handleQuantityChange(item.product._id, item.quantity + 1)}
                              className="p-2 hover:bg-muted/50 transition-colors"
                              aria-label="Increase quantity"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Subtotal and checkout */}
              <div className="border-t border-border pt-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-light text-foreground">Subtotal</span>
                  <span className="text-sm font-medium text-foreground">
                    {formatPrice(subtotal)}
                  </span>
                </div>
                
                <p className="text-xs text-muted-foreground">
                  Shipping and taxes calculated at checkout
                </p>
                
                <Button 
                  asChild 
                  className="w-full rounded-none" 
                  size="lg"
                  onClick={onClose}
                >
                  <Link to="/checkout">
                    Proceed to Checkout
                  </Link>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full rounded-none" 
                  size="lg"
                  onClick={onClose}
                  asChild
                >
                  <Link to="/category/shop">
                    Continue Shopping
                  </Link>
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShoppingBag;