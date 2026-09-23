'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import Image from 'next/image';
import { 
  LayoutDashboard, 
  Calendar as CalendarIcon, 
  ShoppingBag, 
  Scissors, 
  Package, 
  Settings as SettingsIcon,
  LogOut, 
  Lock, 
  Mail, 
  KeyRound, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Phone,
  Search,
  ExternalLink,
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Menu,
  X,
  Clock,
  DollarSign,
  AlertCircle,
  Users,
  Image as ImageIcon,
  Building,
  Globe,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  MapPin,
  CalendarOff,
  Save
} from 'lucide-react';

interface Booking {
  id: string;
  customer_name: string;
  customer_phone: string;
  service_name: string;
  booking_date: string;
  booking_time: string;
  deposit_amount?: number;
  deposit_status: string;
  status: string;
  notes?: string;
  created_at: string;
}

interface OrderItem {
  id?: string;
  product_name: string;
  quantity: number;
  unit_price?: number;
}

interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  delivery_address?: string;
  total_amount: number;
  status: string;
  notes?: string;
  created_at: string;
  order_items?: OrderItem[];
}

interface Service {
  id: string;
  name: string;
  description: string;
  price: number | null;
  duration?: string;
  image_url: string;
  is_visible: boolean;
  is_featured: boolean;
  display_order: number;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number | null;
  image_url: string;
  is_visible: boolean;
  is_available: boolean;
  stock_quantity?: number | null;
  is_featured: boolean;
  display_order: number;
}

interface BusinessSettings {
  business_name: string;
  phone_number: string;
  whatsapp_number: string;
  email_address: string;
  location_address: string;
  google_maps_url: string;
  logo_url: string;
  booking_deposit_amount: number;
  currency: string;
  hero_title: string;
  hero_subtitle: string;
  booking_cta_text: string;
  shop_cta_text: string;
  instagram_url: string;
  tiktok_url: string;
  facebook_url: string;
}

interface BusinessHour {
  id: number;
  day_name: string;
  is_open: boolean;
  open_time: string;
  close_time: string;
}

interface AvailabilityOverride {
  id: string;
  override_date: string;
  is_closed: boolean;
  open_time?: string;
  close_time?: string;
  reason?: string;
}

interface GalleryItem {
  id: string;
  title: string;
  image_url: string;
  category: string;
  is_visible: boolean;
  created_at: string;
}

interface Customer {
  phone: string;
  name: string;
  bookingCount: number;
  orderCount: number;
  lastActivity: string;
  bookings: Booking[];
  orders: Order[];
}

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [authLoading, setAuthLoading] = useState<boolean>(false);

  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Navigation section
  const [activeSection, setActiveSection] = useState<
    'dashboard' | 'bookings' | 'calendar' | 'availability' | 'orders' | 'services' | 'products' | 'customers' | 'gallery' | 'profile' | 'website' | 'account'
  >('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);

  // Core Data States
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [businessSettings, setBusinessSettings] = useState<BusinessSettings>({
    business_name: "Kiki's Touch Beauty Salon",
    phone_number: "054 360 3627",
    whatsapp_number: "233543603627",
    email_address: "Sarpongkesh@gmail.com",
    location_address: "Sowutoum, Ghana",
    google_maps_url: "https://maps.app.goo.gl/cYdLK7PJLBu15iGF7",
    logo_url: "/images/logo/kikis-touch-logo.png",
    booking_deposit_amount: 50,
    currency: "GH₵",
    hero_title: "Kiki's Touch Beauty Salon",
    hero_subtitle: "Beautiful braids, professional beauty services and quality hair products.",
    booking_cta_text: "Book via WhatsApp",
    shop_cta_text: "Shop Products",
    instagram_url: "",
    tiktok_url: "",
    facebook_url: "",
  });
  const [businessHours, setBusinessHours] = useState<BusinessHour[]>([]);
  const [availabilityOverrides, setAvailabilityOverrides] = useState<AvailabilityOverride[]>([]);

  const [fetchingData, setFetchingData] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  const [galleryModalOpen, setGalleryModalOpen] = useState(false);
  const [overrideModalOpen, setOverrideModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<{ id: string; type: 'product' | 'service' | 'gallery' | 'override'; name: string } | null>(null);

  // Form states
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    imageUrl: '',
    stockQuantity: '',
    isVisible: true,
    isAvailable: true,
  });
  const [productImageFile, setProductImageFile] = useState<File | null>(null);

  const [serviceForm, setServiceForm] = useState({
    name: '',
    description: '',
    price: '',
    duration: '1-2 hours',
    imageUrl: '',
    isVisible: true,
  });
  const [serviceImageFile, setServiceImageFile] = useState<File | null>(null);

  const [galleryForm, setGalleryForm] = useState({
    title: '',
    category: 'hairstyles',
    imageUrl: '',
    isVisible: true,
  });
  const [galleryImageFile, setGalleryImageFile] = useState<File | null>(null);

  const [overrideForm, setOverrideForm] = useState({
    date: new Date().toISOString().split('T')[0],
    isClosed: true,
    openTime: '09:00',
    closeTime: '20:00',
    reason: '',
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [passwordForm, setPasswordForm] = useState({ newPassword: '', confirmPassword: '' });

  // Calendar View Month state
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());

  // Check auth state on load
  useEffect(() => {
    checkUser();
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        await verifyAdminRole(session.user);
      } else {
        setUser(null);
        setIsAdmin(false);
        setLoading(false);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  async function checkUser() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        await verifyAdminRole(user);
      } else {
        setLoading(false);
      }
    } catch {
      setLoading(false);
    }
  }

  async function verifyAdminRole(currentUser: User) {
    try {
      if (currentUser.user_metadata?.role === 'admin' || currentUser.email === 'sarpongkesh@gmail.com') {
        setIsAdmin(true);
        loadDashboardData();
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', currentUser.id)
        .single();

      if (profile && profile.role === 'admin') {
        setIsAdmin(true);
        loadDashboardData();
      } else {
        setIsAdmin(false);
        setErrorMsg('Access restricted. Account is not registered as Admin.');
      }
    } catch {
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg('');
    setAuthLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (data.user) {
        setUser(data.user);
        await verifyAdminRole(data.user);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An error occurred during sign in.';
      setErrorMsg(message);
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    setUser(null);
    setIsAdmin(false);
  }

  async function loadDashboardData() {
    setFetchingData(true);
    try {
      const [
        bookingsRes,
        ordersRes,
        servicesRes,
        productsRes,
        galleryRes,
        settingsRes,
        hoursRes,
        overridesRes
      ] = await Promise.all([
        supabase.from('bookings').select('*').order('created_at', { ascending: false }),
        supabase.from('orders').select('*, order_items(*)').order('created_at', { ascending: false }),
        supabase.from('services').select('*').order('display_order', { ascending: true }),
        supabase.from('products').select('*').order('display_order', { ascending: true }),
        supabase.from('gallery').select('*').order('display_order', { ascending: true }),
        supabase.from('business_settings').select('*').eq('id', 1).single(),
        supabase.from('business_hours').select('*').order('id', { ascending: true }),
        supabase.from('availability_overrides').select('*').order('override_date', { ascending: true }),
      ]);

      if (bookingsRes.data) setBookings(bookingsRes.data);
      if (ordersRes.data) setOrders(ordersRes.data);
      if (servicesRes.data) setServices(servicesRes.data);
      if (productsRes.data) setProducts(productsRes.data);
      if (galleryRes.data) setGallery(galleryRes.data);
      if (settingsRes.data) setBusinessSettings(settingsRes.data);
      if (hoursRes.data && hoursRes.data.length > 0) setBusinessHours(hoursRes.data);
      if (overridesRes.data) setAvailabilityOverrides(overridesRes.data);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setFetchingData(false);
    }
  }

  // STORAGE FILE UPLOADER
  async function uploadFileToBucket(file: File, bucket: string): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, { cacheControl: '3600', upsert: true });

    if (uploadError) throw uploadError;

    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return publicUrlData.publicUrl;
  }

  // PRODUCTS CRUD
  function openAddProductModal() {
    setEditingProduct(null);
    setProductForm({
      name: '',
      description: '',
      price: '',
      imageUrl: '/images/products/edge-control.jpg',
      stockQuantity: '',
      isVisible: true,
      isAvailable: true,
    });
    setProductImageFile(null);
    setProductModalOpen(true);
  }

  function openEditProductModal(product: Product) {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description || '',
      price: product.price !== null && product.price !== undefined ? product.price.toString() : '',
      imageUrl: product.image_url || '/images/products/edge-control.jpg',
      stockQuantity: product.stock_quantity !== null && product.stock_quantity !== undefined ? product.stock_quantity.toString() : '',
      isVisible: product.is_visible,
      isAvailable: product.is_available !== false,
    });
    setProductImageFile(null);
    setProductModalOpen(true);
  }

  async function handleSaveProduct(e: React.FormEvent) {
    e.preventDefault();
    setActionLoading(true);

    try {
      let finalImageUrl = productForm.imageUrl;
      if (productImageFile) {
        finalImageUrl = await uploadFileToBucket(productImageFile, 'product-images');
      }

      const parsedPrice = productForm.price !== '' ? parseFloat(productForm.price) : null;
      const parsedStock = productForm.stockQuantity !== '' ? parseInt(productForm.stockQuantity, 10) : null;

      const payload = {
        name: productForm.name,
        description: productForm.description,
        price: parsedPrice,
        stock_quantity: parsedStock,
        image_url: finalImageUrl,
        is_visible: productForm.isVisible,
        is_available: productForm.isAvailable,
        updated_at: new Date().toISOString(),
      };

      if (editingProduct) {
        const { error } = await supabase.from('products').update(payload).eq('id', editingProduct.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('products').insert({
          ...payload,
          display_order: products.length + 1,
        });
        if (error) throw error;
      }

      setProductModalOpen(false);
      await loadDashboardData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error saving product';
      alert(msg);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDeleteProduct(id: string) {
    setActionLoading(true);
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      setDeleteConfirmId(null);
      await loadDashboardData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error deleting product';
      alert(msg);
    } finally {
      setActionLoading(false);
    }
  }

  // SERVICES CRUD
  function openAddServiceModal() {
    setEditingService(null);
    setServiceForm({
      name: '',
      description: '',
      price: '',
      duration: '1-2 hours',
      imageUrl: '/images/services/knotless-braids.jpg',
      isVisible: true,
    });
    setServiceImageFile(null);
    setServiceModalOpen(true);
  }

  function openEditServiceModal(service: Service) {
    setEditingService(service);
    setServiceForm({
      name: service.name,
      description: service.description || '',
      price: service.price !== null && service.price !== undefined ? service.price.toString() : '',
      duration: service.duration || '1-2 hours',
      imageUrl: service.image_url || '/images/services/knotless-braids.jpg',
      isVisible: service.is_visible,
    });
    setServiceImageFile(null);
    setServiceModalOpen(true);
  }

  async function handleSaveService(e: React.FormEvent) {
    e.preventDefault();
    setActionLoading(true);

    try {
      let finalImageUrl = serviceForm.imageUrl;
      if (serviceImageFile) {
        finalImageUrl = await uploadFileToBucket(serviceImageFile, 'service-images');
      }

      const parsedPrice = serviceForm.price !== '' ? parseFloat(serviceForm.price) : null;

      const payload = {
        name: serviceForm.name,
        description: serviceForm.description,
        price: parsedPrice,
        duration: serviceForm.duration,
        image_url: finalImageUrl,
        is_visible: serviceForm.isVisible,
        updated_at: new Date().toISOString(),
      };

      if (editingService) {
        const { error } = await supabase.from('services').update(payload).eq('id', editingService.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('services').insert({
          ...payload,
          display_order: services.length + 1,
        });
        if (error) throw error;
      }

      setServiceModalOpen(false);
      await loadDashboardData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error saving service';
      alert(msg);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDeleteService(id: string) {
    setActionLoading(true);
    try {
      const { error } = await supabase.from('services').delete().eq('id', id);
      if (error) throw error;
      setDeleteConfirmId(null);
      await loadDashboardData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error deleting service';
      alert(msg);
    } finally {
      setActionLoading(false);
    }
  }

  // GALLERY CRUD
  async function handleSaveGallery(e: React.FormEvent) {
    e.preventDefault();
    if (!galleryImageFile && !galleryForm.imageUrl) return;
    setActionLoading(true);

    try {
      let finalUrl = galleryForm.imageUrl;
      if (galleryImageFile) {
        finalUrl = await uploadFileToBucket(galleryImageFile, 'gallery-images');
      }

      const { error } = await supabase.from('gallery').insert({
        title: galleryForm.title,
        category: galleryForm.category,
        image_url: finalUrl,
        is_visible: galleryForm.isVisible,
        display_order: gallery.length + 1,
      });

      if (error) throw error;
      setGalleryModalOpen(false);
      setGalleryImageFile(null);
      setGalleryForm({ title: '', category: 'hairstyles', imageUrl: '', isVisible: true });
      await loadDashboardData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error uploading photo';
      alert(msg);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDeleteGallery(id: string) {
    setActionLoading(true);
    try {
      const { error } = await supabase.from('gallery').delete().eq('id', id);
      if (error) throw error;
      setDeleteConfirmId(null);
      await loadDashboardData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error deleting photo';
      alert(msg);
    } finally {
      setActionLoading(false);
    }
  }

  // AVAILABILITY OVERRIDES
  async function handleSaveOverride(e: React.FormEvent) {
    e.preventDefault();
    setActionLoading(true);

    try {
      const { error } = await supabase.from('availability_overrides').upsert({
        override_date: overrideForm.date,
        is_closed: overrideForm.isClosed,
        open_time: overrideForm.isClosed ? null : overrideForm.openTime,
        close_time: overrideForm.isClosed ? null : overrideForm.closeTime,
        reason: overrideForm.reason,
      }, { onConflict: 'override_date' });

      if (error) throw error;
      setOverrideModalOpen(false);
      await loadDashboardData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error saving date override';
      alert(msg);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDeleteOverride(id: string) {
    setActionLoading(true);
    try {
      const { error } = await supabase.from('availability_overrides').delete().eq('id', id);
      if (error) throw error;
      setDeleteConfirmId(null);
      await loadDashboardData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error removing date override';
      alert(msg);
    } finally {
      setActionLoading(false);
    }
  }

  // BUSINESS HOURS SAVE
  async function handleSaveBusinessHours(e: React.FormEvent) {
    e.preventDefault();
    setActionLoading(true);
    setSuccessMsg('');

    try {
      const promises = businessHours.map((h) =>
        supabase.from('business_hours').update({
          is_open: h.is_open,
          open_time: h.open_time,
          close_time: h.close_time,
          updated_at: new Date().toISOString(),
        }).eq('id', h.id)
      );

      await Promise.all(promises);
      setSuccessMsg('Business hours updated successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
      await loadDashboardData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error updating hours';
      alert(msg);
    } finally {
      setActionLoading(false);
    }
  }

  // BUSINESS PROFILE & WEBSITE SETTINGS SAVE
  async function handleSaveBusinessProfile(e: React.FormEvent) {
    e.preventDefault();
    setActionLoading(true);
    setSuccessMsg('');

    try {
      let logoUrl = businessSettings.logo_url;
      if (logoFile) {
        logoUrl = await uploadFileToBucket(logoFile, 'business-assets');
      }

      const { error } = await supabase
        .from('business_settings')
        .update({
          ...businessSettings,
          logo_url: logoUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', 1);

      if (error) throw error;
      setSuccessMsg('Business Profile updated! Live site has been updated.');
      setTimeout(() => setSuccessMsg(''), 4000);
      await loadDashboardData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error updating profile';
      alert(msg);
    } finally {
      setActionLoading(false);
    }
  }

  // PASSWORD UPDATE
  async function handleUpdatePassword(e: React.FormEvent) {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    setActionLoading(true);
    setSuccessMsg('');

    try {
      const { error } = await supabase.auth.updateUser({ password: passwordForm.newPassword });
      if (error) throw error;
      setSuccessMsg('Admin password updated successfully!');
      setPasswordForm({ newPassword: '', confirmPassword: '' });
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error updating password';
      alert(msg);
    } finally {
      setActionLoading(false);
    }
  }

  // STATUS WORKFLOW UPDATES
  async function updateBookingStatus(id: string, newStatus: string) {
    const { error } = await supabase
      .from('bookings')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (!error) setBookings(prev => prev.map(b => b.id === id ? { ...b, status: newStatus } : b));
  }

  async function updateDepositStatus(id: string, newDepositStatus: string) {
    const { error } = await supabase
      .from('bookings')
      .update({ deposit_status: newDepositStatus, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (!error) setBookings(prev => prev.map(b => b.id === id ? { ...b, deposit_status: newDepositStatus } : b));
  }

  async function updateOrderStatus(id: string, newStatus: string) {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (!error) setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
  }

  async function toggleProductVisibility(id: string, currentVisibility: boolean) {
    const { error } = await supabase
      .from('products')
      .update({ is_visible: !currentVisibility, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (!error) setProducts(prev => prev.map(p => p.id === id ? { ...p, is_visible: !currentVisibility } : p));
  }

  async function toggleProductAvailability(id: string, currentAvailability: boolean) {
    const { error } = await supabase
      .from('products')
      .update({ is_available: !currentAvailability, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (!error) setProducts(prev => prev.map(p => p.id === id ? { ...p, is_available: !currentAvailability } : p));
  }

  async function toggleServiceVisibility(id: string, currentVisibility: boolean) {
    const { error } = await supabase
      .from('services')
      .update({ is_visible: !currentVisibility, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (!error) setServices(prev => prev.map(s => s.id === id ? { ...s, is_visible: !currentVisibility } : s));
  }

  async function toggleGalleryVisibility(id: string, currentVisibility: boolean) {
    const { error } = await supabase
      .from('gallery')
      .update({ is_visible: !currentVisibility })
      .eq('id', id);

    if (!error) setGallery(prev => prev.map(g => g.id === id ? { ...g, is_visible: !currentVisibility } : g));
  }

  function formatWhatsAppUrl(phone: string) {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const fullPhone = cleanPhone.startsWith('233') ? cleanPhone : cleanPhone.startsWith('0') ? `233${cleanPhone.slice(1)}` : cleanPhone;
    return `https://wa.me/${fullPhone}`;
  }

  // AGGREGATE CUSTOMERS DIRECTORY
  const customersMap = new Map<string, Customer>();

  bookings.forEach((b) => {
    const key = b.customer_phone || b.customer_name;
    if (!key) return;
    if (!customersMap.has(key)) {
      customersMap.set(key, {
        phone: b.customer_phone,
        name: b.customer_name,
        bookingCount: 0,
        orderCount: 0,
        lastActivity: b.created_at || b.booking_date,
        bookings: [],
        orders: [],
      });
    }
    const c = customersMap.get(key)!;
    c.bookingCount += 1;
    c.bookings.push(b);
  });

  orders.forEach((o) => {
    const key = o.customer_phone || o.customer_name;
    if (!key) return;
    if (!customersMap.has(key)) {
      customersMap.set(key, {
        phone: o.customer_phone,
        name: o.customer_name,
        bookingCount: 0,
        orderCount: 0,
        lastActivity: o.created_at,
        bookings: [],
        orders: [],
      });
    }
    const c = customersMap.get(key)!;
    c.orderCount += 1;
    c.orders.push(o);
  });

  const customerList = Array.from(customersMap.values());

  // CALCULATED STATS
  const todayStr = new Date().toISOString().split('T')[0];
  const todayBookingsCount = bookings.filter(b => b.booking_date === todayStr).length;
  const upcomingBookingsCount = bookings.filter(b => b.booking_date > todayStr && b.status !== 'cancelled').length;
  const pendingBookingsCount = bookings.filter(b => b.status === 'pending').length;
  const confirmedBookingsCount = bookings.filter(b => b.status === 'confirmed').length;

  const todayOrdersCount = orders.filter(o => o.created_at?.startsWith(todayStr)).length;
  const newOrdersCount = orders.filter(o => o.status === 'pending' || o.status === 'new').length;

  const totalProductsCount = products.length;
  const totalServicesCount = services.length;
  const totalCustomersCount = customerList.length;

  // FILTERED LISTS
  const filteredBookings = bookings.filter(b => 
    b.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.customer_phone?.includes(searchTerm) ||
    b.service_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredOrders = orders.filter(o =>
    o.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.customer_phone?.includes(searchTerm)
  );

  const filteredCustomers = customerList.filter(c =>
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone?.includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#141218] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-[#C5A059] animate-spin" />
          <p className="text-sm font-medium text-neutral-400">Loading Kiki&apos;s Touch Salon System...</p>
        </div>
      </div>
    );
  }

  // LOGIN SCREEN
  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-[#121116] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#1C1A22] rounded-3xl border border-white/10 p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#25222D] border border-[#C5A059]/30 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
              <Lock className="w-7 h-7 text-[#C5A059]" />
            </div>
            <h1 className="font-serif text-2xl font-bold text-white tracking-wide">{businessSettings.business_name}</h1>
            <p className="text-xs uppercase tracking-[0.25em] text-[#C5A059] font-medium mt-1">Management Portal</p>
          </div>

          {errorMsg && (
            <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-neutral-500 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="sarpongkesh@gmail.com"
                  className="w-full bg-[#121116] border border-white/10 rounded-2xl pl-12 pr-4 py-3.5 text-sm text-white focus:outline-none focus:border-[#C5A059] transition-colors placeholder:text-neutral-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">
                Password
              </label>
              <div className="relative">
                <KeyRound className="w-5 h-5 text-neutral-500 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#121116] border border-white/10 rounded-2xl pl-12 pr-4 py-3.5 text-sm text-white focus:outline-none focus:border-[#C5A059] transition-colors placeholder:text-neutral-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full bg-[#C5A059] hover:bg-[#b08c46] text-black font-semibold py-3.5 rounded-2xl transition-all duration-200 shadow-lg flex items-center justify-center gap-2 mt-2"
            >
              {authLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-black" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <span>Sign In to Admin Dashboard</span>
              )}
            </button>
          </form>

          <div className="mt-8 text-center pt-6 border-t border-white/5">
            <p className="text-[11px] text-neutral-500">
              Private Salon Management System • Sowutoum, Ghana
            </p>
          </div>
        </div>
      </div>
    );
  }

  // FULL PROTECTED ADMIN DASHBOARD
  return (
    <div className="min-h-screen bg-[#121116] text-neutral-100 flex flex-col md:flex-row font-sans">

      {/* MOBILE HEADER */}
      <header className="md:hidden bg-[#1C1A22] border-b border-white/10 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#C5A059]/20 border border-[#C5A059]/30 flex items-center justify-center text-[#C5A059]">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <h1 className="font-serif font-bold text-sm text-white truncate max-w-[160px]">{businessSettings.business_name}</h1>
            <p className="text-[10px] uppercase text-[#C5A059] tracking-wider font-semibold">Salon Dashboard</p>
          </div>
        </div>

        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="p-2 text-neutral-300 hover:text-white"
        >
          {mobileSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* SIDEBAR NAVIGATION */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50 w-64 bg-[#1C1A22] border-r border-white/10 flex flex-col transition-transform duration-300 transform
        ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Sidebar Header */}
        <div className="p-6 border-b border-white/10 hidden md:flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#C5A059]/15 border border-[#C5A059]/30 flex items-center justify-center text-[#C5A059] shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h2 className="font-serif font-bold text-sm text-white truncate">{businessSettings.business_name}</h2>
            <p className="text-[10px] uppercase text-[#C5A059] tracking-widest font-bold">Business Owner</p>
          </div>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'bookings', label: 'Bookings', icon: CalendarIcon, badge: pendingBookingsCount },
            { id: 'calendar', label: 'Calendar', icon: CalendarIcon },
            { id: 'availability', label: 'Availability', icon: CalendarOff },
            { id: 'orders', label: 'Orders', icon: ShoppingBag, badge: newOrdersCount },
            { id: 'services', label: 'Services', icon: Scissors, count: services.length },
            { id: 'products', label: 'Products', icon: Package, count: products.length },
            { id: 'customers', label: 'Customers', icon: Users, count: totalCustomersCount },
            { id: 'gallery', label: 'Gallery', icon: ImageIcon, count: gallery.length },
            { id: 'profile', label: 'Business Profile', icon: Building },
            { id: 'website', label: 'Website Settings', icon: Globe },
            { id: 'account', label: 'Account / Security', icon: ShieldCheck },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setActiveSection(item.id as typeof activeSection); setMobileSidebarOpen(false); }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-[#C5A059] text-black font-semibold shadow-md'
                    : 'text-neutral-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    isActive ? 'bg-black text-[#C5A059]' : 'bg-[#C5A059] text-black'
                  }`}>
                    {item.badge}
                  </span>
                )}
                {item.count !== undefined && item.badge === undefined && (
                  <span className="text-[11px] opacity-60">({item.count})</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-white/10 space-y-3">
          <div className="px-3 py-2 bg-[#121116] rounded-xl border border-white/5">
            <p className="text-[10px] text-neutral-500 uppercase tracking-wider font-semibold">Admin Account</p>
            <p className="text-xs text-neutral-300 font-medium truncate mt-0.5">{user.email}</p>
          </div>

          <button
            onClick={handleSignOut}
            className="w-full px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 transition-colors text-xs font-semibold flex items-center justify-center gap-2 border border-rose-500/20"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* MAIN WORKSPACE AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">

        {/* TOP BAR */}
        <header className="bg-[#1C1A22] border-b border-white/10 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
          <div>
            <h2 className="font-serif text-lg font-bold text-white capitalize">{activeSection.replace('_', ' ')}</h2>
            <p className="text-xs text-neutral-400 hidden sm:block">Private Management Dashboard for {businessSettings.business_name}</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadDashboardData}
              disabled={fetchingData}
              className="px-3.5 py-2 rounded-xl bg-[#25222D] border border-white/10 hover:bg-white/10 text-neutral-300 transition-colors flex items-center gap-2 text-xs font-medium"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${fetchingData ? 'animate-spin text-[#C5A059]' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </header>

        {/* SUCCESS ALERTS */}
        {successMsg && (
          <div className="mx-6 mt-6 p-4 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <main className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">

          {/* 1. DASHBOARD */}
          {activeSection === 'dashboard' && (
            <div className="space-y-8">
              {/* Stats Counters Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#1C1A22] border border-white/10 rounded-3xl p-5">
                  <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Today&apos;s Bookings</span>
                  <div className="font-serif font-bold text-2xl sm:text-3xl text-white mt-1">{todayBookingsCount}</div>
                  <p className="text-[11px] text-amber-400 mt-2 font-medium">{pendingBookingsCount} Pending Approval</p>
                </div>

                <div className="bg-[#1C1A22] border border-white/10 rounded-3xl p-5">
                  <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Upcoming Bookings</span>
                  <div className="font-serif font-bold text-2xl sm:text-3xl text-white mt-1">{upcomingBookingsCount}</div>
                  <p className="text-[11px] text-emerald-400 mt-2 font-medium">{confirmedBookingsCount} Confirmed</p>
                </div>

                <div className="bg-[#1C1A22] border border-white/10 rounded-3xl p-5">
                  <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Orders</span>
                  <div className="font-serif font-bold text-2xl sm:text-3xl text-white mt-1">{orders.length}</div>
                  <p className="text-[11px] text-amber-400 mt-2 font-medium">{newOrdersCount} New Orders</p>
                </div>

                <div className="bg-[#1C1A22] border border-white/10 rounded-3xl p-5">
                  <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Total Customers</span>
                  <div className="font-serif font-bold text-2xl sm:text-3xl text-white mt-1">{totalCustomersCount}</div>
                  <p className="text-[11px] text-neutral-400 mt-2 font-medium">{services.length} Services • {products.length} Products</p>
                </div>
              </div>

              {/* Quick Actions Shortcuts */}
              <div className="bg-[#1C1A22] border border-white/10 rounded-3xl p-6 space-y-4">
                <h3 className="font-serif font-bold text-base text-white">Quick Actions</h3>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={openAddProductModal}
                    className="px-4 py-2.5 rounded-2xl bg-[#C5A059] hover:bg-[#b08c46] text-black font-semibold text-xs flex items-center gap-2 transition-all shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Product</span>
                  </button>
                  <button
                    onClick={openAddServiceModal}
                    className="px-4 py-2.5 rounded-2xl bg-[#C5A059] hover:bg-[#b08c46] text-black font-semibold text-xs flex items-center gap-2 transition-all shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Service</span>
                  </button>
                  <button
                    onClick={() => setActiveSection('bookings')}
                    className="px-4 py-2.5 rounded-2xl bg-[#25222D] hover:bg-white/10 text-white text-xs font-medium border border-white/10 flex items-center gap-2 transition-all"
                  >
                    <CalendarIcon className="w-4 h-4 text-[#C5A059]" />
                    <span>View Bookings</span>
                  </button>
                  <button
                    onClick={() => setActiveSection('orders')}
                    className="px-4 py-2.5 rounded-2xl bg-[#25222D] hover:bg-white/10 text-white text-xs font-medium border border-white/10 flex items-center gap-2 transition-all"
                  >
                    <ShoppingBag className="w-4 h-4 text-[#C5A059]" />
                    <span>View Orders</span>
                  </button>
                  <button
                    onClick={() => setActiveSection('profile')}
                    className="px-4 py-2.5 rounded-2xl bg-[#25222D] hover:bg-white/10 text-white text-xs font-medium border border-white/10 flex items-center gap-2 transition-all"
                  >
                    <Building className="w-4 h-4 text-[#C5A059]" />
                    <span>Edit Business Profile</span>
                  </button>
                </div>
              </div>

              {/* Activity Feeds */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-[#1C1A22] border border-white/10 rounded-3xl p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-serif font-bold text-base text-white">Recent Booking Requests</h3>
                    <button onClick={() => setActiveSection('bookings')} className="text-xs text-[#C5A059] font-semibold hover:underline">View All</button>
                  </div>
                  {bookings.length === 0 ? (
                    <p className="text-xs text-neutral-500 py-6 text-center">No bookings recorded yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {bookings.slice(0, 4).map((b) => (
                        <div key={b.id} className="p-3.5 bg-[#121116] rounded-2xl border border-white/5 flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold text-white">{b.customer_name}</p>
                            <p className="text-xs text-neutral-400 mt-0.5">{b.service_name} • {b.booking_date} @ {b.booking_time}</p>
                          </div>
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                            b.status === 'confirmed' ? 'bg-emerald-500/20 text-emerald-300' :
                            b.status === 'completed' ? 'bg-blue-500/20 text-blue-300' :
                            b.status === 'cancelled' ? 'bg-rose-500/20 text-rose-300' :
                            'bg-amber-500/20 text-amber-300'
                          }`}>
                            {b.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-[#1C1A22] border border-white/10 rounded-3xl p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-serif font-bold text-base text-white">Recent Orders</h3>
                    <button onClick={() => setActiveSection('orders')} className="text-xs text-[#C5A059] font-semibold hover:underline">View All</button>
                  </div>
                  {orders.length === 0 ? (
                    <p className="text-xs text-neutral-500 py-6 text-center">No orders recorded yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {orders.slice(0, 4).map((o) => (
                        <div key={o.id} className="p-3.5 bg-[#121116] rounded-2xl border border-white/5 flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold text-white">{o.customer_name}</p>
                            <p className="text-xs text-neutral-400 mt-0.5">{businessSettings.currency}{o.total_amount || 0} • {o.order_items?.length || 0} item(s)</p>
                          </div>
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                            o.status === 'completed' ? 'bg-emerald-500/20 text-emerald-300' :
                            o.status === 'processing' ? 'bg-blue-500/20 text-blue-300' :
                            o.status === 'cancelled' ? 'bg-rose-500/20 text-rose-300' :
                            'bg-amber-500/20 text-amber-300'
                          }`}>
                            {o.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 2. BOOKINGS SECTION */}
          {activeSection === 'bookings' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-neutral-500 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search bookings by client name, phone or service..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-[#1C1A22] border border-white/10 rounded-2xl pl-11 pr-4 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-[#C5A059]"
                  />
                </div>
                <div className="text-xs text-neutral-400 font-medium">
                  Showing {filteredBookings.length} booking records
                </div>
              </div>

              {filteredBookings.length === 0 ? (
                <div className="bg-[#1C1A22] rounded-3xl border border-white/10 p-12 text-center">
                  <CalendarIcon className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
                  <h3 className="font-serif text-lg font-semibold text-white">No appointment requests found</h3>
                  <p className="text-xs text-neutral-400 mt-1">Bookings submitted on the website will appear here.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredBookings.map((b) => (
                    <div key={b.id} className="bg-[#1C1A22] rounded-3xl border border-white/10 p-5 space-y-4 hover:border-white/20 transition-all">
                      <div className="flex items-start justify-between border-b border-white/5 pb-3">
                        <div>
                          <h4 className="font-bold text-white text-base">{b.customer_name}</h4>
                          <a
                            href={formatWhatsAppUrl(b.customer_phone)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-[#C5A059] font-medium hover:underline flex items-center gap-1 mt-1"
                          >
                            <Phone className="w-3 h-3" />
                            <span>{b.customer_phone}</span>
                            <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                          </a>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          b.status === 'confirmed' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                          b.status === 'completed' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                          b.status === 'cancelled' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                          'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}>
                          {b.status}
                        </span>
                      </div>

                      <div className="space-y-2 text-xs text-neutral-300">
                        <div className="flex justify-between">
                          <span className="text-neutral-500">Service:</span>
                          <span className="font-semibold text-white">{b.service_name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-500">Date & Time:</span>
                          <span className="font-medium text-neutral-200">{b.booking_date} @ {b.booking_time}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-500">{businessSettings.currency}{b.deposit_amount || businessSettings.booking_deposit_amount} Deposit:</span>
                          <span className={`font-semibold ${b.deposit_status === 'paid' ? 'text-emerald-400' : 'text-amber-400'}`}>
                            {b.deposit_status || 'Pending'}
                          </span>
                        </div>
                        {b.notes && (
                          <div className="bg-[#121116] p-3 rounded-xl border border-white/5 text-[11px] italic text-neutral-300 mt-2">
                            &quot;{b.notes}&quot;
                          </div>
                        )}
                      </div>

                      {/* Action Controls */}
                      <div className="border-t border-white/5 pt-3 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-neutral-400">Change Status:</span>
                          <select
                            value={b.status}
                            onChange={(e) => updateBookingStatus(b.id, e.target.value)}
                            className="bg-[#121116] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#C5A059]"
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>

                        <div className="flex items-center justify-between text-xs">
                          <span className="text-neutral-400">Deposit Status:</span>
                          <select
                            value={b.deposit_status || 'pending'}
                            onChange={(e) => updateDepositStatus(b.id, e.target.value)}
                            className="bg-[#121116] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#C5A059]"
                          >
                            <option value="pending">Pending Deposit</option>
                            <option value="paid">Paid Deposit</option>
                          </select>
                        </div>

                        <a
                          href={formatWhatsAppUrl(b.customer_phone)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full mt-2 py-2 rounded-xl bg-[#25D366]/15 text-[#25D366] hover:bg-[#25D366]/25 border border-[#25D366]/30 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>Chat Client on WhatsApp</span>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 3. CALENDAR SECTION */}
          {activeSection === 'calendar' && (
            <div className="bg-[#1C1A22] rounded-3xl border border-white/10 p-6 space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-serif font-bold text-xl text-white">Appointments Calendar</h3>
                  <p className="text-xs text-neutral-400">Click any appointment to manage status or contact customer.</p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      const prev = new Date(currentCalendarDate);
                      prev.setMonth(prev.getMonth() - 1);
                      setCurrentCalendarDate(prev);
                    }}
                    className="p-2 bg-[#121116] border border-white/10 rounded-xl text-neutral-300 hover:text-white"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <span className="font-serif font-bold text-sm text-white px-2">
                    {currentCalendarDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                  </span>

                  <button
                    onClick={() => {
                      const next = new Date(currentCalendarDate);
                      next.setMonth(next.getMonth() + 1);
                      setCurrentCalendarDate(next);
                    }}
                    className="p-2 bg-[#121116] border border-white/10 rounded-xl text-neutral-300 hover:text-white"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Month Grid */}
              <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-neutral-400 pb-2 border-b border-white/5">
                <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
              </div>

              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: 35 }).map((_, idx) => {
                  const year = currentCalendarDate.getFullYear();
                  const month = currentCalendarDate.getMonth();
                  const firstDay = new Date(year, month, 1).getDay();
                  const dayNum = idx - firstDay + 1;
                  const daysInMonth = new Date(year, month + 1, 0).getDate();

                  if (dayNum < 1 || dayNum > daysInMonth) {
                    return <div key={idx} className="h-28 bg-[#121116]/40 rounded-2xl border border-white/5 opacity-30" />;
                  }

                  const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                  const dayBookings = bookings.filter(b => b.booking_date === dateStr);

                  return (
                    <div key={idx} className="h-28 bg-[#121116] rounded-2xl border border-white/5 p-2 overflow-y-auto space-y-1">
                      <div className="text-[11px] font-bold text-neutral-400">{dayNum}</div>
                      {dayBookings.map(b => (
                        <div
                          key={b.id}
                          onClick={() => setActiveSection('bookings')}
                          className={`p-1 rounded text-[10px] cursor-pointer font-medium truncate ${
                            b.status === 'confirmed' ? 'bg-emerald-500/20 text-emerald-300' :
                            b.status === 'completed' ? 'bg-blue-500/20 text-blue-300' : 'bg-amber-500/20 text-amber-300'
                          }`}
                          title={`${b.customer_name} - ${b.service_name} @ ${b.booking_time}`}
                        >
                          {b.booking_time} {b.customer_name.split(' ')[0]}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 4. AVAILABILITY SECTION */}
          {activeSection === 'availability' && (
            <div className="space-y-8">
              {/* Business Hours Configuration */}
              <div className="bg-[#1C1A22] rounded-3xl border border-white/10 p-6 sm:p-8 space-y-6">
                <div>
                  <h3 className="font-serif font-bold text-xl text-white">Weekly Business Hours</h3>
                  <p className="text-xs text-neutral-400">Configure opening and closing times for each day of the week. Updates reflect on the website instantly.</p>
                </div>

                <form onSubmit={handleSaveBusinessHours} className="space-y-4">
                  <div className="divide-y divide-white/5">
                    {businessHours.map((h, index) => (
                      <div key={h.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3 w-36">
                          <input
                            type="checkbox"
                            checked={h.is_open}
                            onChange={(e) => {
                              const updated = [...businessHours];
                              updated[index].is_open = e.target.checked;
                              setBusinessHours(updated);
                            }}
                            className="rounded border-white/10 accent-[#C5A059]"
                          />
                          <span className="font-semibold text-sm text-white">{h.day_name}</span>
                        </div>

                        {h.is_open ? (
                          <div className="flex items-center gap-2 text-xs">
                            <input
                              type="time"
                              value={h.open_time?.slice(0, 5) || '09:00'}
                              onChange={(e) => {
                                const updated = [...businessHours];
                                updated[index].open_time = e.target.value;
                                setBusinessHours(updated);
                              }}
                              className="bg-[#121116] border border-white/10 rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-[#C5A059]"
                            />
                            <span className="text-neutral-500">to</span>
                            <input
                              type="time"
                              value={h.close_time?.slice(0, 5) || '20:00'}
                              onChange={(e) => {
                                const updated = [...businessHours];
                                updated[index].close_time = e.target.value;
                                setBusinessHours(updated);
                              }}
                              className="bg-[#121116] border border-white/10 rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-[#C5A059]"
                            />
                          </div>
                        ) : (
                          <span className="text-xs font-semibold text-rose-400 uppercase">Closed</span>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-white/10 flex justify-end">
                    <button
                      type="submit"
                      disabled={actionLoading}
                      className="px-5 py-2.5 rounded-2xl bg-[#C5A059] hover:bg-[#b08c46] text-black font-semibold text-xs flex items-center gap-2 shadow-md"
                    >
                      {actionLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      <span>Save Business Hours</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Date Overrides & Blocked Dates */}
              <div className="bg-[#1C1A22] rounded-3xl border border-white/10 p-6 sm:p-8 space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-serif font-bold text-xl text-white">Date Blocking &amp; Holiday Closures</h3>
                    <p className="text-xs text-neutral-400">Block specific dates or add special opening hours for events.</p>
                  </div>
                  <button
                    onClick={() => setOverrideModalOpen(true)}
                    className="px-4 py-2.5 rounded-2xl bg-[#C5A059] hover:bg-[#b08c46] text-black font-semibold text-xs flex items-center gap-2 shadow-md"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Date Override</span>
                  </button>
                </div>

                {availabilityOverrides.length === 0 ? (
                  <p className="text-xs text-neutral-500 py-6 text-center">No blocked dates or holiday closures configured.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {availabilityOverrides.map((o) => (
                      <div key={o.id} className="p-4 bg-[#121116] rounded-2xl border border-white/5 space-y-2 flex items-center justify-between">
                        <div>
                          <p className="font-bold text-sm text-white">{o.override_date}</p>
                          <p className="text-xs text-rose-400 font-semibold">{o.is_closed ? 'Entire Day Closed' : `Special Hours: ${o.open_time} - ${o.close_time}`}</p>
                          {o.reason && <p className="text-[11px] text-neutral-400 italic mt-0.5">&quot;{o.reason}&quot;</p>}
                        </div>

                        <button
                          onClick={() => setDeleteConfirmId({ id: o.id, type: 'override', name: o.override_date })}
                          className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl transition-colors border border-rose-500/20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 5. ORDERS SECTION */}
          {activeSection === 'orders' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-neutral-500 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search orders by customer name or phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-[#1C1A22] border border-white/10 rounded-2xl pl-11 pr-4 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-[#C5A059]"
                  />
                </div>
                <div className="text-xs text-neutral-400 font-medium">
                  Showing {filteredOrders.length} order records
                </div>
              </div>

              {filteredOrders.length === 0 ? (
                <div className="bg-[#1C1A22] rounded-3xl border border-white/10 p-12 text-center">
                  <ShoppingBag className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
                  <h3 className="font-serif text-lg font-semibold text-white">No product orders found</h3>
                  <p className="text-xs text-neutral-400 mt-1">Product purchases will appear here.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredOrders.map((o) => (
                    <div key={o.id} className="bg-[#1C1A22] rounded-3xl border border-white/10 p-5 space-y-4 hover:border-white/20 transition-all">
                      <div className="flex items-start justify-between border-b border-white/5 pb-3">
                        <div>
                          <h4 className="font-bold text-white text-base">{o.customer_name}</h4>
                          <a
                            href={formatWhatsAppUrl(o.customer_phone)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-[#C5A059] font-medium hover:underline flex items-center gap-1 mt-1"
                          >
                            <Phone className="w-3 h-3" />
                            <span>{o.customer_phone}</span>
                            <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                          </a>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          o.status === 'completed' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                          o.status === 'processing' || o.status === 'ready' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                          o.status === 'cancelled' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                          'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}>
                          {o.status}
                        </span>
                      </div>

                      <div className="space-y-3 text-xs text-neutral-300">
                        {o.order_items && o.order_items.length > 0 && (
                          <div className="bg-[#121116] p-3 rounded-2xl border border-white/5 space-y-2">
                            <p className="font-semibold text-neutral-400 text-[11px] uppercase tracking-wider">Historical Order Items Snapshot:</p>
                            <ul className="space-y-1 divide-y divide-white/5">
                              {o.order_items.map((item, idx) => (
                                <li key={idx} className="pt-1 flex justify-between text-neutral-200">
                                  <span>{item.quantity}x {item.product_name}</span>
                                  {item.unit_price ? <span>{businessSettings.currency}{item.unit_price * item.quantity}</span> : <span>Confirm</span>}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-1">
                          <span className="text-neutral-400 font-medium">Order Total:</span>
                          <span className="font-serif font-bold text-base text-[#C5A059]">
                            {businessSettings.currency}{o.total_amount || 0}
                          </span>
                        </div>
                      </div>

                      <div className="border-t border-white/5 pt-3 flex items-center justify-between text-xs">
                        <span className="text-neutral-400 font-medium">Order Status:</span>
                        <select
                          value={o.status}
                          onChange={(e) => updateOrderStatus(o.id, e.target.value)}
                          className="bg-[#121116] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#C5A059]"
                        >
                          <option value="pending">New / Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="ready">Ready for Pickup/Delivery</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 6. SERVICES SECTION */}
          {activeSection === 'services' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif font-bold text-lg text-white">Salon Services Catalog</h3>
                  <p className="text-xs text-neutral-400">Add, edit prices, descriptions, duration, or hide services from public site.</p>
                </div>
                <button
                  onClick={openAddServiceModal}
                  className="bg-[#C5A059] hover:bg-[#b08c46] text-black font-semibold px-4 py-2.5 rounded-2xl text-xs flex items-center gap-2 transition-all shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Service</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((s) => (
                  <div key={s.id} className="bg-[#1C1A22] rounded-3xl border border-white/10 overflow-hidden flex flex-col justify-between">
                    <div>
                      <div className="relative h-44 w-full bg-[#121116]">
                        {s.image_url ? (
                          <Image src={s.image_url} alt={s.name} fill className="object-cover" />
                        ) : (
                          <div className="flex items-center justify-center h-full text-neutral-600">No Image</div>
                        )}
                        <div className="absolute top-3 right-3 flex gap-2">
                          <button
                            onClick={() => toggleServiceVisibility(s.id, s.is_visible)}
                            className={`p-2 rounded-xl text-xs font-bold backdrop-blur-md transition-colors ${
                              s.is_visible ? 'bg-emerald-500/80 text-white' : 'bg-neutral-800/90 text-neutral-400'
                            }`}
                            title={s.is_visible ? 'Visible on Website' : 'Hidden from Website'}
                          >
                            {s.is_visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="p-5 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-bold text-white text-base font-serif">{s.name}</h4>
                          <span className="text-sm font-semibold text-[#C5A059] shrink-0">
                            {s.price !== null && s.price !== undefined ? `${businessSettings.currency}${s.price}` : 'Quote'}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-400 leading-relaxed line-clamp-3">{s.description}</p>
                        <p className="text-[11px] text-neutral-500 font-medium">Duration: {s.duration || '1-2 hours'}</p>
                      </div>
                    </div>

                    <div className="p-5 pt-0 border-t border-white/5 mt-4 flex items-center justify-between gap-2">
                      <button
                        onClick={() => openEditServiceModal(s)}
                        className="flex-1 py-2 px-3 bg-[#25222D] hover:bg-white/10 rounded-xl text-xs font-semibold text-neutral-200 flex items-center justify-center gap-1.5 transition-colors border border-white/5"
                      >
                        <Pencil className="w-3.5 h-3.5 text-[#C5A059]" />
                        <span>Edit Service</span>
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId({ id: s.id, type: 'service', name: s.name })}
                        className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl transition-colors border border-rose-500/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 7. PRODUCTS SECTION */}
          {activeSection === 'products' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif font-bold text-lg text-white">Hair Care &amp; Beauty Products Catalog</h3>
                  <p className="text-xs text-neutral-400">Full inventory control with real-time price updates on public shop.</p>
                </div>
                <button
                  onClick={openAddProductModal}
                  className="bg-[#C5A059] hover:bg-[#b08c46] text-black font-semibold px-4 py-2.5 rounded-2xl text-xs flex items-center gap-2 transition-all shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Product</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {products.map((p) => (
                  <div key={p.id} className="bg-[#1C1A22] rounded-3xl border border-white/10 overflow-hidden flex flex-col justify-between">
                    <div>
                      <div className="relative h-44 w-full bg-[#121116]">
                        {p.image_url ? (
                          <Image src={p.image_url} alt={p.name} fill className="object-cover" />
                        ) : (
                          <div className="flex items-center justify-center h-full text-neutral-600">No Image</div>
                        )}
                        <div className="absolute top-3 right-3 flex gap-2">
                          <button
                            onClick={() => toggleProductVisibility(p.id, p.is_visible)}
                            className={`p-2 rounded-xl text-xs font-bold backdrop-blur-md transition-colors ${
                              p.is_visible ? 'bg-emerald-500/80 text-white' : 'bg-neutral-800/90 text-neutral-400'
                            }`}
                          >
                            {p.is_visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="p-5 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-bold text-white text-base font-serif">{p.name}</h4>
                          <span className="text-sm font-semibold text-[#C5A059] shrink-0">
                            {p.price !== null && p.price !== undefined ? `${businessSettings.currency}${p.price}` : 'Quote'}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-400 leading-relaxed line-clamp-3">{p.description}</p>
                        
                        <div className="pt-2 flex items-center justify-between">
                          <button
                            onClick={() => toggleProductAvailability(p.id, p.is_available)}
                            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-colors ${
                              p.is_available !== false ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                            }`}
                          >
                            {p.is_available !== false ? 'In Stock' : 'Out of Stock'}
                          </button>
                          {p.stock_quantity !== null && p.stock_quantity !== undefined && (
                            <span className="text-[11px] text-neutral-400 font-medium">{p.stock_quantity} units</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="p-5 pt-0 border-t border-white/5 mt-4 flex items-center justify-between gap-2">
                      <button
                        onClick={() => openEditProductModal(p)}
                        className="flex-1 py-2 px-3 bg-[#25222D] hover:bg-white/10 rounded-xl text-xs font-semibold text-neutral-200 flex items-center justify-center gap-1.5 transition-colors border border-white/5"
                      >
                        <Pencil className="w-3.5 h-3.5 text-[#C5A059]" />
                        <span>Edit Product</span>
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId({ id: p.id, type: 'product', name: p.name })}
                        className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl transition-colors border border-rose-500/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 8. CUSTOMERS SECTION */}
          {activeSection === 'customers' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-neutral-500 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search customers by name or phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-[#1C1A22] border border-white/10 rounded-2xl pl-11 pr-4 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-[#C5A059]"
                  />
                </div>
                <div className="text-xs text-neutral-400 font-medium">
                  Total {filteredCustomers.length} unique customers
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredCustomers.map((c, idx) => (
                  <div key={idx} className="bg-[#1C1A22] rounded-3xl border border-white/10 p-5 space-y-4 hover:border-white/20 transition-all">
                    <div className="flex items-start justify-between border-b border-white/5 pb-3">
                      <div>
                        <h4 className="font-bold text-white text-base">{c.name}</h4>
                        <a
                          href={formatWhatsAppUrl(c.phone)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-[#C5A059] font-medium hover:underline flex items-center gap-1 mt-1"
                        >
                          <Phone className="w-3 h-3" />
                          <span>{c.phone}</span>
                          <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                        </a>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-white/5 text-neutral-300 text-[10px] font-bold">
                        {c.bookingCount} Bookings • {c.orderCount} Orders
                      </span>
                    </div>

                    <div className="space-y-2 text-xs text-neutral-300">
                      <p className="text-[11px] text-neutral-500">Last Activity: {c.lastActivity ? new Date(c.lastActivity).toLocaleDateString() : 'Recent'}</p>
                    </div>

                    <button
                      onClick={() => setSelectedCustomer(c)}
                      className="w-full py-2.5 rounded-xl bg-[#25222D] hover:bg-white/10 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all border border-white/5"
                    >
                      <span>View Customer Details &amp; History</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 9. GALLERY SECTION */}
          {activeSection === 'gallery' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif font-bold text-lg text-white">Salon Photo Gallery</h3>
                  <p className="text-xs text-neutral-400">Upload and manage salon showcase photos stored in Supabase Storage.</p>
                </div>
                <button
                  onClick={() => setGalleryModalOpen(true)}
                  className="bg-[#C5A059] hover:bg-[#b08c46] text-black font-semibold px-4 py-2.5 rounded-2xl text-xs flex items-center gap-2 transition-all shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>Upload Photo</span>
                </button>
              </div>

              {gallery.length === 0 ? (
                <div className="bg-[#1C1A22] rounded-3xl border border-white/10 p-12 text-center">
                  <ImageIcon className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
                  <h3 className="font-serif text-lg font-semibold text-white">No gallery photos uploaded</h3>
                  <p className="text-xs text-neutral-400 mt-1">Upload photos to showcase hairstyles and salon atmosphere.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {gallery.map((g) => (
                    <div key={g.id} className="bg-[#1C1A22] rounded-2xl border border-white/10 overflow-hidden relative group">
                      <div className="relative h-44 w-full bg-[#121116]">
                        <Image src={g.image_url} alt={g.title || 'Gallery photo'} fill className="object-cover" />
                      </div>
                      <div className="p-3 flex items-center justify-between bg-[#1C1A22]">
                        <span className="text-xs text-neutral-300 font-medium truncate">{g.title || g.category}</span>
                        <div className="flex gap-1">
                          <button
                            onClick={() => toggleGalleryVisibility(g.id, g.is_visible)}
                            className="p-1.5 text-neutral-400 hover:text-white"
                          >
                            {g.is_visible ? <Eye className="w-3.5 h-3.5 text-emerald-400" /> : <EyeOff className="w-3.5 h-3.5 text-neutral-600" />}
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId({ id: g.id, type: 'gallery', name: g.title || 'Photo' })}
                            className="p-1.5 text-rose-400 hover:text-rose-300"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 10. BUSINESS PROFILE SECTION */}
          {activeSection === 'profile' && (
            <div className="bg-[#1C1A22] rounded-3xl border border-white/10 p-6 sm:p-8 max-w-3xl space-y-6">
              <div>
                <h3 className="font-serif font-bold text-xl text-white">Business Profile Settings</h3>
                <p className="text-xs text-neutral-400">Updates made here immediately change information across the live website and WhatsApp booking system.</p>
              </div>

              <form onSubmit={handleSaveBusinessProfile} className="space-y-4 text-xs">
                <div>
                  <label className="block text-neutral-400 font-semibold uppercase tracking-wider mb-2">Business Name</label>
                  <input
                    type="text"
                    required
                    value={businessSettings.business_name}
                    onChange={(e) => setBusinessSettings({ ...businessSettings, business_name: e.target.value })}
                    className="w-full bg-[#121116] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#C5A059]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-neutral-400 font-semibold uppercase tracking-wider mb-2">Phone Number</label>
                    <input
                      type="text"
                      required
                      value={businessSettings.phone_number}
                      onChange={(e) => setBusinessSettings({ ...businessSettings, phone_number: e.target.value })}
                      className="w-full bg-[#121116] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#C5A059]"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-400 font-semibold uppercase tracking-wider mb-2">WhatsApp Number (e.g. 233543603627)</label>
                    <input
                      type="text"
                      required
                      value={businessSettings.whatsapp_number}
                      onChange={(e) => setBusinessSettings({ ...businessSettings, whatsapp_number: e.target.value })}
                      className="w-full bg-[#121116] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#C5A059]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-neutral-400 font-semibold uppercase tracking-wider mb-2">Email Address</label>
                    <input
                      type="email"
                      required
                      value={businessSettings.email_address}
                      onChange={(e) => setBusinessSettings({ ...businessSettings, email_address: e.target.value })}
                      className="w-full bg-[#121116] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#C5A059]"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-400 font-semibold uppercase tracking-wider mb-2">Location Address</label>
                    <input
                      type="text"
                      required
                      value={businessSettings.location_address}
                      onChange={(e) => setBusinessSettings({ ...businessSettings, location_address: e.target.value })}
                      className="w-full bg-[#121116] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#C5A059]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-neutral-400 font-semibold uppercase tracking-wider mb-2">Google Maps Link</label>
                  <input
                    type="url"
                    required
                    value={businessSettings.google_maps_url}
                    onChange={(e) => setBusinessSettings({ ...businessSettings, google_maps_url: e.target.value })}
                    className="w-full bg-[#121116] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#C5A059]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-neutral-400 font-semibold uppercase tracking-wider mb-2">Booking Deposit Amount</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={businessSettings.booking_deposit_amount}
                      onChange={(e) => setBusinessSettings({ ...businessSettings, booking_deposit_amount: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-[#121116] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#C5A059]"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-400 font-semibold uppercase tracking-wider mb-2">Currency Symbol</label>
                    <input
                      type="text"
                      required
                      value={businessSettings.currency}
                      onChange={(e) => setBusinessSettings({ ...businessSettings, currency: e.target.value })}
                      className="w-full bg-[#121116] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#C5A059]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-neutral-400 font-semibold uppercase tracking-wider mb-2">Upload Logo (Supabase Storage)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setLogoFile(e.target.files[0]);
                      }
                    }}
                    className="w-full bg-[#121116] border border-white/10 rounded-xl p-2.5 text-neutral-300 text-xs"
                  />
                </div>

                <div className="pt-4 border-t border-white/10 flex justify-end">
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-6 py-3 rounded-2xl bg-[#C5A059] hover:bg-[#b08c46] text-black font-semibold flex items-center gap-2 shadow-md"
                  >
                    {actionLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    <span>Save Business Profile</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* 11. WEBSITE SETTINGS SECTION */}
          {activeSection === 'website' && (
            <div className="bg-[#1C1A22] rounded-3xl border border-white/10 p-6 sm:p-8 max-w-3xl space-y-6">
              <div>
                <h3 className="font-serif font-bold text-xl text-white">Website Copy &amp; Social Links</h3>
                <p className="text-xs text-neutral-400">Edit hero headings, button text, and social accounts displayed on the public website.</p>
              </div>

              <form onSubmit={handleSaveBusinessProfile} className="space-y-4 text-xs">
                <div>
                  <label className="block text-neutral-400 font-semibold uppercase tracking-wider mb-2">Hero Main Title</label>
                  <input
                    type="text"
                    value={businessSettings.hero_title}
                    onChange={(e) => setBusinessSettings({ ...businessSettings, hero_title: e.target.value })}
                    className="w-full bg-[#121116] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#C5A059]"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 font-semibold uppercase tracking-wider mb-2">Hero Subtitle / Description</label>
                  <textarea
                    rows={3}
                    value={businessSettings.hero_subtitle}
                    onChange={(e) => setBusinessSettings({ ...businessSettings, hero_subtitle: e.target.value })}
                    className="w-full bg-[#121116] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#C5A059] resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-neutral-400 font-semibold uppercase tracking-wider mb-2">Booking Button CTA Text</label>
                    <input
                      type="text"
                      value={businessSettings.booking_cta_text}
                      onChange={(e) => setBusinessSettings({ ...businessSettings, booking_cta_text: e.target.value })}
                      className="w-full bg-[#121116] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#C5A059]"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-400 font-semibold uppercase tracking-wider mb-2">Shop Button CTA Text</label>
                    <input
                      type="text"
                      value={businessSettings.shop_cta_text}
                      onChange={(e) => setBusinessSettings({ ...businessSettings, shop_cta_text: e.target.value })}
                      className="w-full bg-[#121116] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#C5A059]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-neutral-400 font-semibold uppercase tracking-wider mb-2">Instagram URL</label>
                    <input
                      type="url"
                      value={businessSettings.instagram_url || ''}
                      onChange={(e) => setBusinessSettings({ ...businessSettings, instagram_url: e.target.value })}
                      placeholder="https://instagram.com/..."
                      className="w-full bg-[#121116] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#C5A059]"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-400 font-semibold uppercase tracking-wider mb-2">TikTok URL</label>
                    <input
                      type="url"
                      value={businessSettings.tiktok_url || ''}
                      onChange={(e) => setBusinessSettings({ ...businessSettings, tiktok_url: e.target.value })}
                      placeholder="https://tiktok.com/@..."
                      className="w-full bg-[#121116] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#C5A059]"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-400 font-semibold uppercase tracking-wider mb-2">Facebook URL</label>
                    <input
                      type="url"
                      value={businessSettings.facebook_url || ''}
                      onChange={(e) => setBusinessSettings({ ...businessSettings, facebook_url: e.target.value })}
                      placeholder="https://facebook.com/..."
                      className="w-full bg-[#121116] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#C5A059]"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 flex justify-end">
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-6 py-3 rounded-2xl bg-[#C5A059] hover:bg-[#b08c46] text-black font-semibold flex items-center gap-2 shadow-md"
                  >
                    {actionLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    <span>Save Website Content</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* 12. ACCOUNT & SECURITY SECTION */}
          {activeSection === 'account' && (
            <div className="bg-[#1C1A22] rounded-3xl border border-white/10 p-6 sm:p-8 max-w-xl space-y-6">
              <div>
                <h3 className="font-serif font-bold text-xl text-white">Account &amp; Password Security</h3>
                <p className="text-xs text-neutral-400">Update your private admin password for {user.email}.</p>
              </div>

              <form onSubmit={handleUpdatePassword} className="space-y-4 text-xs">
                <div>
                  <label className="block text-neutral-400 font-semibold uppercase tracking-wider mb-2">New Password</label>
                  <input
                    type="password"
                    required
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    placeholder="••••••••••••"
                    className="w-full bg-[#121116] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#C5A059]"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 font-semibold uppercase tracking-wider mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    placeholder="••••••••••••"
                    className="w-full bg-[#121116] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#C5A059]"
                  />
                </div>

                <div className="pt-4 border-t border-white/10 flex justify-end">
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-6 py-3 rounded-2xl bg-[#C5A059] hover:bg-[#b08c46] text-black font-semibold flex items-center gap-2 shadow-md"
                  >
                    {actionLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                    <span>Update Password</span>
                  </button>
                </div>
              </form>
            </div>
          )}

        </main>
      </div>

      {/* MODALS */}
      {/* Product Modal */}
      {productModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#1C1A22] border border-white/10 rounded-3xl p-6 sm:p-8 w-full max-w-lg my-8 space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="font-serif font-bold text-lg text-white">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button onClick={() => setProductModalOpen(false)} className="text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div>
                <label className="block text-neutral-400 font-semibold uppercase tracking-wider mb-2">Product Name *</label>
                <input
                  type="text"
                  required
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  placeholder="e.g. Edge Control"
                  className="w-full bg-[#121116] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              <div>
                <label className="block text-neutral-400 font-semibold uppercase tracking-wider mb-2">Description</label>
                <textarea
                  rows={3}
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  placeholder="Product features and benefits..."
                  className="w-full bg-[#121116] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#C5A059] resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-neutral-400 font-semibold uppercase tracking-wider mb-2">Price ({businessSettings.currency})</label>
                  <input
                    type="number"
                    step="0.01"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    placeholder="e.g. 80.00"
                    className="w-full bg-[#121116] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#C5A059]"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 font-semibold uppercase tracking-wider mb-2">Stock Quantity</label>
                  <input
                    type="number"
                    value={productForm.stockQuantity}
                    onChange={(e) => setProductForm({ ...productForm, stockQuantity: e.target.value })}
                    placeholder="e.g. 25"
                    className="w-full bg-[#121116] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#C5A059]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 font-semibold uppercase tracking-wider mb-2">Product Photo (Supabase Storage)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setProductImageFile(e.target.files[0]);
                    }
                  }}
                  className="w-full bg-[#121116] border border-white/10 rounded-xl p-2.5 text-neutral-300 text-xs"
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-neutral-200">
                  <input
                    type="checkbox"
                    checked={productForm.isVisible}
                    onChange={(e) => setProductForm({ ...productForm, isVisible: e.target.checked })}
                    className="rounded border-white/10 accent-[#C5A059]"
                  />
                  <span>Visible on Shop Page</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-neutral-200">
                  <input
                    type="checkbox"
                    checked={productForm.isAvailable}
                    onChange={(e) => setProductForm({ ...productForm, isAvailable: e.target.checked })}
                    className="rounded border-white/10 accent-[#C5A059]"
                  />
                  <span>In Stock</span>
                </label>
              </div>

              <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setProductModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-white/10 text-neutral-300 hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2.5 rounded-xl bg-[#C5A059] hover:bg-[#b08c46] text-black font-semibold flex items-center gap-2"
                >
                  {actionLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
                  <span>Save Product</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Service Modal */}
      {serviceModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#1C1A22] border border-white/10 rounded-3xl p-6 sm:p-8 w-full max-w-lg my-8 space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="font-serif font-bold text-lg text-white">
                {editingService ? 'Edit Service' : 'Add New Service'}
              </h3>
              <button onClick={() => setServiceModalOpen(false)} className="text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveService} className="space-y-4 text-xs">
              <div>
                <label className="block text-neutral-400 font-semibold uppercase tracking-wider mb-2">Service Name *</label>
                <input
                  type="text"
                  required
                  value={serviceForm.name}
                  onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                  placeholder="e.g. Knotless Braids"
                  className="w-full bg-[#121116] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              <div>
                <label className="block text-neutral-400 font-semibold uppercase tracking-wider mb-2">Description</label>
                <textarea
                  rows={3}
                  value={serviceForm.description}
                  onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                  placeholder="Service description..."
                  className="w-full bg-[#121116] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#C5A059] resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-neutral-400 font-semibold uppercase tracking-wider mb-2">Starting Price ({businessSettings.currency})</label>
                  <input
                    type="number"
                    step="0.01"
                    value={serviceForm.price}
                    onChange={(e) => setServiceForm({ ...serviceForm, price: e.target.value })}
                    placeholder="e.g. 150.00"
                    className="w-full bg-[#121116] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#C5A059]"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 font-semibold uppercase tracking-wider mb-2">Duration</label>
                  <input
                    type="text"
                    value={serviceForm.duration}
                    onChange={(e) => setServiceForm({ ...serviceForm, duration: e.target.value })}
                    placeholder="e.g. 2-3 hours"
                    className="w-full bg-[#121116] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#C5A059]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 font-semibold uppercase tracking-wider mb-2">Service Image (Supabase Storage)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setServiceImageFile(e.target.files[0]);
                    }
                  }}
                  className="w-full bg-[#121116] border border-white/10 rounded-xl p-2.5 text-neutral-300 text-xs"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-neutral-200">
                  <input
                    type="checkbox"
                    checked={serviceForm.isVisible}
                    onChange={(e) => setServiceForm({ ...serviceForm, isVisible: e.target.checked })}
                    className="rounded border-white/10 accent-[#C5A059]"
                  />
                  <span>Visible on Services Page</span>
                </label>
              </div>

              <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setServiceModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-white/10 text-neutral-300 hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2.5 rounded-xl bg-[#C5A059] hover:bg-[#b08c46] text-black font-semibold flex items-center gap-2"
                >
                  {actionLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
                  <span>Save Service</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Gallery Modal */}
      {galleryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#1C1A22] border border-white/10 rounded-3xl p-6 sm:p-8 w-full max-w-lg my-8 space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="font-serif font-bold text-lg text-white">Upload Gallery Photo</h3>
              <button onClick={() => setGalleryModalOpen(false)} className="text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGallery} className="space-y-4 text-xs">
              <div>
                <label className="block text-neutral-400 font-semibold uppercase tracking-wider mb-2">Photo Title</label>
                <input
                  type="text"
                  value={galleryForm.title}
                  onChange={(e) => setGalleryForm({ ...galleryForm, title: e.target.value })}
                  placeholder="e.g. Knotless Box Braids Showcase"
                  className="w-full bg-[#121116] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              <div>
                <label className="block text-neutral-400 font-semibold uppercase tracking-wider mb-2">Category</label>
                <select
                  value={galleryForm.category}
                  onChange={(e) => setGalleryForm({ ...galleryForm, category: e.target.value })}
                  className="w-full bg-[#121116] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#C5A059]"
                >
                  <option value="hairstyles">Hairstyles &amp; Braids</option>
                  <option value="salon">Salon Environment</option>
                  <option value="products">Hair Products</option>
                </select>
              </div>

              <div>
                <label className="block text-neutral-400 font-semibold uppercase tracking-wider mb-2">Photo File (Supabase Storage)</label>
                <input
                  type="file"
                  accept="image/*"
                  required
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setGalleryImageFile(e.target.files[0]);
                    }
                  }}
                  className="w-full bg-[#121116] border border-white/10 rounded-xl p-2.5 text-neutral-300 text-xs"
                />
              </div>

              <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setGalleryModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-white/10 text-neutral-300 hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2.5 rounded-xl bg-[#C5A059] hover:bg-[#b08c46] text-black font-semibold flex items-center gap-2"
                >
                  {actionLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
                  <span>Upload Photo</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Date Override Modal */}
      {overrideModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#1C1A22] border border-white/10 rounded-3xl p-6 sm:p-8 w-full max-w-lg my-8 space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="font-serif font-bold text-lg text-white">Block Date / Add Special Hours</h3>
              <button onClick={() => setOverrideModalOpen(false)} className="text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveOverride} className="space-y-4 text-xs">
              <div>
                <label className="block text-neutral-400 font-semibold uppercase tracking-wider mb-2">Target Date *</label>
                <input
                  type="date"
                  required
                  value={overrideForm.date}
                  onChange={(e) => setOverrideForm({ ...overrideForm, date: e.target.value })}
                  className="w-full bg-[#121116] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-neutral-200">
                  <input
                    type="checkbox"
                    checked={overrideForm.isClosed}
                    onChange={(e) => setOverrideForm({ ...overrideForm, isClosed: e.target.checked })}
                    className="rounded border-white/10 accent-[#C5A059]"
                  />
                  <span>Block Entire Day (Fully Closed)</span>
                </label>
              </div>

              <div>
                <label className="block text-neutral-400 font-semibold uppercase tracking-wider mb-2">Reason / Note</label>
                <input
                  type="text"
                  value={overrideForm.reason}
                  onChange={(e) => setOverrideForm({ ...overrideForm, reason: e.target.value })}
                  placeholder="e.g. Holiday closure / Closed for event"
                  className="w-full bg-[#121116] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setOverrideModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-white/10 text-neutral-300 hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2.5 rounded-xl bg-[#C5A059] hover:bg-[#b08c46] text-black font-semibold flex items-center gap-2"
                >
                  {actionLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
                  <span>Save Override</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer Details Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#1C1A22] border border-white/10 rounded-3xl p-6 sm:p-8 w-full max-w-2xl my-8 space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="font-serif font-bold text-xl text-white">{selectedCustomer.name}</h3>
                <p className="text-xs text-[#C5A059] mt-0.5">{selectedCustomer.phone}</p>
              </div>
              <button onClick={() => setSelectedCustomer(null)} className="text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6 text-xs max-h-[60vh] overflow-y-auto pr-2">
              <div>
                <h4 className="font-bold text-white mb-3">Appointment Bookings ({selectedCustomer.bookings.length})</h4>
                {selectedCustomer.bookings.length === 0 ? (
                  <p className="text-neutral-500 italic">No bookings recorded.</p>
                ) : (
                  <div className="space-y-2">
                    {selectedCustomer.bookings.map(b => (
                      <div key={b.id} className="p-3 bg-[#121116] rounded-xl border border-white/5 flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-white">{b.service_name}</p>
                          <p className="text-neutral-400 text-[11px]">{b.booking_date} @ {b.booking_time}</p>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-white/5 text-[10px] uppercase font-bold text-neutral-300">{b.status}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h4 className="font-bold text-white mb-3">Product Orders ({selectedCustomer.orders.length})</h4>
                {selectedCustomer.orders.length === 0 ? (
                  <p className="text-neutral-500 italic">No orders recorded.</p>
                ) : (
                  <div className="space-y-2">
                    {selectedCustomer.orders.map(o => (
                      <div key={o.id} className="p-3 bg-[#121116] rounded-xl border border-white/5 flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-white">{businessSettings.currency}{o.total_amount || 0}</p>
                          <p className="text-neutral-400 text-[11px]">{o.created_at ? new Date(o.created_at).toLocaleDateString() : 'Order'}</p>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-white/5 text-[10px] uppercase font-bold text-neutral-300">{o.status}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex justify-end">
              <a
                href={formatWhatsAppUrl(selectedCustomer.phone)}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-xl bg-[#25D366] text-black font-semibold text-xs flex items-center gap-2"
              >
                <Phone className="w-4 h-4" />
                <span>Chat Customer on WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1C1A22] border border-white/10 rounded-3xl p-6 w-full max-w-md space-y-4">
            <h3 className="font-serif font-bold text-lg text-white">
              Confirm Delete {deleteConfirmId.type.toUpperCase()}
            </h3>
            <p className="text-xs text-neutral-400">
              Are you sure you want to permanently delete <strong className="text-white">&quot;{deleteConfirmId.name}&quot;</strong>? This action cannot be undone.
            </p>

            <div className="pt-4 flex justify-end gap-3 text-xs">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2.5 rounded-xl border border-white/10 text-neutral-300 hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (deleteConfirmId.type === 'product') handleDeleteProduct(deleteConfirmId.id);
                  else if (deleteConfirmId.type === 'service') handleDeleteService(deleteConfirmId.id);
                  else if (deleteConfirmId.type === 'gallery') handleDeleteGallery(deleteConfirmId.id);
                  else if (deleteConfirmId.type === 'override') handleDeleteOverride(deleteConfirmId.id);
                }}
                disabled={actionLoading}
                className="px-5 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-semibold flex items-center gap-2"
              >
                {actionLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
                <span>Delete Permanently</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
