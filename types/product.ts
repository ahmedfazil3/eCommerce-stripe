export interface Category {
  id: string;
  name: string;
  image_url: string | null;
  created_at: string;
}

export interface Product {
  id: string;
  category_id: string | null;
  title: string;
  slug: string;
  description: string | null;
  price: number;
  discount_price: number | null;
  stock: number;
  image_url: string | null;
  images: string[];
  featured: boolean;
  rating: number;
  created_at: string;
  updated_at: string;
}
