export interface Service {
  id: string;
  name: string;
  description: string;
  image: string;
  price: number | null;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  image: string;
  price: number | null;
  featured?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface BookingFormData {
  fullName: string;
  phone: string;
  service: string;
  date: string;
  time: string;
  note: string;
}
