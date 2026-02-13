import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Cart, User } from '@/types/cart';
import * as cartApi from '@/lib/cart-api';
import * as authApi from '@/lib/auth-api';
import { isAuthenticated, getToken, removeToken, getStoredUser, removeStoredUser, setStoredUser, setToken } from '@/lib/auth';

interface CartContextType {
  // Auth state
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  
  // Cart state
  cart: Cart | null;
  loading: boolean;
  error: string | null;
  totalItems: number;
  totalPrice: number;
  
  // Auth functions
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  
  // Cart functions
  fetchCart: () => Promise<void>;
  addItem: (productId: string, quantity: number) => Promise<void>;
  updateItem: (productId: string, quantity: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  clear: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  // Auth state
  const [user, setUser] = useState<User | null>(getStoredUser);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(!!getToken());
  const [isLoading, setIsLoading] = useState(false);
  
  // Cart state
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch cart from API
  const fetchCart = useCallback(async () => {
    if (!isAuthenticated()) {
      setCart(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await cartApi.fetchCart();
      setCart(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch cart';
      setError(message);
      if (message === 'Unauthorized') {
        setCart(null);
        setIsLoggedIn(false);
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Add item to cart
  const addItem = useCallback(async (productId: string, quantity: number) => {
    if (!isAuthenticated()) {
      setError('Please log in to add items to cart');
      return;
    }

    setError(null);
    try {
      const data = await cartApi.addToCart(productId, quantity);
      setCart(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add item';
      setError(message);
      throw err;
    }
  }, []);

  // Update item quantity
  const updateItem = useCallback(async (productId: string, quantity: number) => {
    setError(null);
    try {
      const data = await cartApi.updateCartItem(productId, quantity);
      setCart(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update item';
      setError(message);
    }
  }, []);

  // Remove item from cart
  const removeItem = useCallback(async (productId: string) => {
    setError(null);
    try {
      const data = await cartApi.removeFromCart(productId);
      setCart(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to remove item';
      setError(message);
    }
  }, []);

  // Clear cart
  const clear = useCallback(async () => {
    setError(null);
    try {
      const data = await cartApi.clearCart();
      setCart(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to clear cart';
      setError(message);
    }
  }, []);

  // Login
  const login = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const { user: authUser, token } = await authApi.login(email, password);
      setToken(token);
      setStoredUser(authUser);
      setUser(authUser);
      setIsLoggedIn(true);
      // Fetch cart after login
      setTimeout(() => fetchCart(), 100);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [fetchCart]);

  // Register
  const register = useCallback(async (email: string, password: string, name: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const { user: authUser, token } = await authApi.register(email, password, name);
      setToken(token);
      setStoredUser(authUser);
      setUser(authUser);
      setIsLoggedIn(true);
      // Fetch cart after register
      setTimeout(() => fetchCart(), 100);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [fetchCart]);

  // Logout
  const logout = useCallback(() => {
    removeToken();
    removeStoredUser();
    setUser(null);
    setIsLoggedIn(false);
    setCart(null);
    setError(null);
    authApi.logout();
  }, []);

  // Calculate totals
  const totalItems = cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
  const totalPrice =
    cart?.items.reduce((sum, item) => sum + item.priceSnapshot * item.quantity, 0) ?? 0;

  // Fetch cart on mount if authenticated
  useEffect(() => {
    if (isAuthenticated()) {
      fetchCart();
    }
  }, []);

  const value: CartContextType = {
    user,
    isLoggedIn,
    isLoading,
    cart,
    loading,
    error,
    totalItems,
    totalPrice,
    login,
    register,
    logout,
    fetchCart,
    addItem,
    updateItem,
    removeItem,
    clear,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
