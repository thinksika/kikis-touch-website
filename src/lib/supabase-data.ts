import { supabase } from './supabase';
import { services as staticServices } from '@/data/services';
import { products as staticProducts } from '@/data/products';
import { Service, Product } from '@/types';

export async function getServicesFromSupabase(): Promise<Service[]> {
  try {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('is_visible', true)
      .order('display_order', { ascending: true });

    if (error || !data || data.length === 0) {
      return staticServices;
    }

    return data.map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      image: item.image_url || '/images/services/knotless-braids.jpg',
      price: item.price !== null && item.price !== undefined ? item.price : null,
    }));
  } catch {
    return staticServices;
  }
}

export async function getProductsFromSupabase(): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_visible', true)
      .order('display_order', { ascending: true });

    if (error || !data || data.length === 0) {
      return staticProducts;
    }

    return data.map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      image: item.image_url || '/images/products/edge-control.jpg',
      featured: item.is_featured,
      price: item.price !== null && item.price !== undefined ? item.price : null,
    }));
  } catch {
    return staticProducts;
  }
}
