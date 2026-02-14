export interface CartItem {
  product: {
    _id: string;
    name: string;
    slug: string;
    category: string;
    basePrice: number;
    finalPrice: number;
    images: { url: string; alt?: string }[];
  };
  quantity: number;
  priceSnapshot: number;
}

export interface Cart {
  _id: string;
  user: string;
  items: CartItem[];
  updatedAt: string;
  createdAt?: string;
}

export interface Wishlist {
  _id: string;
  user: string;
  product: {
    _id: string;
    name: string;
    slug: string;
    category: string;
    basePrice: number;
    finalPrice: number;
    images: { url: string; alt?: string }[];
    isActive: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string | null;
  role: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
  };
}
