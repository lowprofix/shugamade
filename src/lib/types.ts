export interface Product {
  id: number;
  hiboutik_id: number;
  name: string;
  description: string;
  price: string;
  image: string;
  category?: string;
  stock: number;
  is_available: boolean;
  created_at: string;
  updated_at: string;
} 