export interface ProductImage {
  url: string;
  publicId?: string;
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  category: string;
  tags?: string[];
  basePrice: number;
  discount: number;
  finalPrice: number;
  stock: number;
  inStock: boolean;
  images: ProductImage[];
  description?: string;
  createdAt: string;
}
