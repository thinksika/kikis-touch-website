'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import Image from 'next/image';
import { 
  LayoutDashboard, 
  Calendar, 
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
  Upload,
  Eye,
  EyeOff,
  Menu,
  X,
  Clock,
  DollarSign,
  AlertCircle
} from 'lucide-react';

interface Booking {
  id: string;
  customer_name: string;
  customer_phone: string;
  service_name: string;
  booking_date: string;
  booking_time: string;
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
  is_featured: boolean;
  display_order: number;
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

  // Dashboard active section
  const [activeSection, setActiveSection] = useState<'dashboard' | 'bookings' | 'orders' | 'services' | 'products' | 'settings'>('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);

  // Data states
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [fetchingData, setFetchingData] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state for Product & Service CRUD
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  const [deleteConfirmId, setDeleteConfirmId] = useState<{ id: string; type: 'product' | 'service'; name: string } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Form states for Product CRUD
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    imageUrl: '',
    isVisible: true,
    isAvailable: true,
  });
  const [productImageFile, setProductImageFile] = useState<File | null>(null);

  // Form states for Service CRUD
  const [serviceForm, setServiceForm] = useState({
    name: '',
    description: '',
    price: '',
    imageUrl: '',
    isVisible: true,
  });
  const [serviceImageFile, setServiceImageFile] = useState<File | null>(null);

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
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMsg(error.message);
        setAuthLoading(false);
        return;
      }

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
      const [bookingsRes, ordersRes, servicesRes, productsRes] = await Promise.all([
        supabase.from('bookings').select('*').order('created_at', { ascending: false }),
        supabase.from('orders').select('*, order_items(*)').order('created_at', { ascending: false }),
        supabase.from('services').select('*').order('display_order', { ascending: true }),
        supabase.from('products').select('*').order('display_order', { ascending: true }),
      ]);

      if (bookingsRes.data) setBookings(bookingsRes.data);
      if (ordersRes.data) setOrders(ordersRes.data);
      if (servicesRes.data) setServices(servicesRes.data);
      if (productsRes.data) setProducts(productsRes.data);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setFetchingData(false);
    }
  }

  // IMAGE UPLOAD HELPER
  async function uploadImageToStorage(file: File, bucket: 'product-images' | 'service-images'): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, { cacheControl: '3600', upsert: true });

    if (uploadError) {
      throw uploadError;
    }

    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  }

  // PRODUCT CRUD HANDLERS
  function openAddProductModal() {
    setEditingProduct(null);
    setProductForm({
      name: '',
      description: '',
      price: '',
      imageUrl: '/images/products/edge-control.jpg',
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
        finalImageUrl = await uploadImageToStorage(productImageFile, 'product-images');
      }

      const parsedPrice = productForm.price !== '' ? parseFloat(productForm.price) : null;

      const payload = {
        name: productForm.name,
        description: productForm.description,
        price: parsedPrice,
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

  // SERVICE CRUD HANDLERS
  function openAddServiceModal() {
    setEditingService(null);
    setServiceForm({
      name: '',
      description: '',
      price: '',
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
        finalImageUrl = await uploadImageToStorage(serviceImageFile, 'service-images');
      }

      const parsedPrice = serviceForm.price !== '' ? parseFloat(serviceForm.price) : null;

      const payload = {
        name: serviceForm.name,
        description: serviceForm.description,
        price: parsedPrice,
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

  // STATUS UPDATES
  async function updateBookingStatus(id: string, newStatus: string) {
    const { error } = await supabase
      .from('bookings')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (!error) {
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: newStatus } : b));
    }
  }

  async function updateDepositStatus(id: string, newDepositStatus: string) {
    const { error } = await supabase
      .from('bookings')
      .update({ deposit_status: newDepositStatus, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (!error) {
      setBookings(prev => prev.map(b => b.id === id ? { ...b, deposit_status: newDepositStatus } : b));
    }
  }

  async function updateOrderStatus(id: string, newStatus: string) {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (!error) {
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
    }
  }

  async function toggleProductVisibility(id: string, currentVisibility: boolean) {
    const { error } = await supabase
      .from('products')
      .update({ is_visible: !currentVisibility, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (!error) {
      setProducts(prev => prev.map(p => p.id === id ? { ...p, is_visible: !currentVisibility } : p));
    }
  }

  async function toggleProductAvailability(id: string, currentAvailability: boolean) {
    const { error } = await supabase
      .from('products')
      .update({ is_available: !currentAvailability, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (!error) {
      setProducts(prev => prev.map(p => p.id === id ? { ...p, is_available: !currentAvailability } : p));
    }
  }

  async function toggleServiceVisibility(id: string, currentVisibility: boolean) {
    const { error } = await supabase
      .from('services')
      .update({ is_visible: !currentVisibility, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (!error) {
      setServices(prev => prev.map(s => s.id === id ? { ...s, is_visible: !currentVisibility } : s));
    }
  }

  function formatWhatsAppUrl(phone: string) {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const fullPhone = cleanPhone.startsWith('233') ? cleanPhone : cleanPhone.startsWith('0') ? `233${cleanPhone.slice(1)}` : cleanPhone;
    return `https://wa.me/${fullPhone}`;
  }

  // Dashboard Stats Calculations
  const totalBookingsCount = bookings.length;
  const pendingBookingsCount = bookings.filter(b => b.status === 'pending').length;
  const confirmedBookingsCount = bookings.filter(b => b.status === 'confirmed').length;

  const totalOrdersCount = orders.length;
  const pendingOrdersCount = orders.filter(o => o.status === 'pending' || o.status === 'new').length;

  const totalProductsCount = products.length;
  const totalServicesCount = services.length;

  // Filtered lists
  const filteredBookings = bookings.filter(b => 
    b.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.customer_phone?.includes(searchTerm) ||
    b.service_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredOrders = orders.filter(o =>
    o.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.customer_phone?.includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#141218] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-[#C5A059] animate-spin" />
          <p className="text-sm font-medium text-neutral-400">Loading Kiki&apos;s Touch Dashboard...</p>
        </div>
      </div>
    );
  }

  // LOGIN SCREEN FOR UNAUTHENTICATED USERS
  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-[#121116] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#1C1A22] rounded-3xl border border-white/10 p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#25222D] border border-[#C5A059]/30 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
              <Lock className="w-7 h-7 text-[#C5A059]" />
            </div>
            <h1 className="font-serif text-2xl font-bold text-white tracking-wide">Kiki&apos;s Touch Salon</h1>
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
              Private Salon Management System • Kiki&apos;s Touch Sowutoum
            </p>
          </div>
        </div>
      </div>
    );
  }

  // PROTECTED PRIVATE ADMIN DASHBOARD
  return (
    <div className="min-h-screen bg-[#121116] text-neutral-100 flex flex-col md:flex-row font-sans">

      {/* MOBILE HEADER */}
      <header className="md:hidden bg-[#1C1A22] border-b border-white/10 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#C5A059]/20 border border-[#C5A059]/30 flex items-center justify-center text-[#C5A059]">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <h1 className="font-serif font-bold text-sm text-white">Kiki&apos;s Touch</h1>
            <p className="text-[10px] uppercase text-[#C5A059] tracking-wider font-semibold">Salon Admin</p>
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
          <div className="w-10 h-10 rounded-2xl bg-[#C5A059]/15 border border-[#C5A059]/30 flex items-center justify-center text-[#C5A059]">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif font-bold text-base text-white">Kiki&apos;s Touch</h2>
            <p className="text-[10px] uppercase text-[#C5A059] tracking-widest font-bold">Salon Owner Dashboard</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          <button
            onClick={() => { setActiveSection('dashboard'); setMobileSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs sm:text-sm font-medium transition-all ${
              activeSection === 'dashboard'
                ? 'bg-[#C5A059] text-black font-semibold shadow-md'
                : 'text-neutral-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 shrink-0" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => { setActiveSection('bookings'); setMobileSidebarOpen(false); }}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs sm:text-sm font-medium transition-all ${
              activeSection === 'bookings'
                ? 'bg-[#C5A059] text-black font-semibold shadow-md'
                : 'text-neutral-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 shrink-0" />
              <span>Bookings</span>
            </div>
            {pendingBookingsCount > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                activeSection === 'bookings' ? 'bg-black text-[#C5A059]' : 'bg-[#C5A059] text-black'
              }`}>
                {pendingBookingsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => { setActiveSection('orders'); setMobileSidebarOpen(false); }}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs sm:text-sm font-medium transition-all ${
              activeSection === 'orders'
                ? 'bg-[#C5A059] text-black font-semibold shadow-md'
                : 'text-neutral-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-4 h-4 shrink-0" />
              <span>Orders</span>
            </div>
            {pendingOrdersCount > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                activeSection === 'orders' ? 'bg-black text-[#C5A059]' : 'bg-[#C5A059] text-black'
              }`}>
                {pendingOrdersCount}
              </span>
            )}
          </button>

          <button
            onClick={() => { setActiveSection('services'); setMobileSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs sm:text-sm font-medium transition-all ${
              activeSection === 'services'
                ? 'bg-[#C5A059] text-black font-semibold shadow-md'
                : 'text-neutral-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <Scissors className="w-4 h-4 shrink-0" />
            <span>Services ({services.length})</span>
          </button>

          <button
            onClick={() => { setActiveSection('products'); setMobileSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs sm:text-sm font-medium transition-all ${
              activeSection === 'products'
                ? 'bg-[#C5A059] text-black font-semibold shadow-md'
                : 'text-neutral-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <Package className="w-4 h-4 shrink-0" />
            <span>Products ({products.length})</span>
          </button>

          <button
            onClick={() => { setActiveSection('settings'); setMobileSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs sm:text-sm font-medium transition-all ${
              activeSection === 'settings'
                ? 'bg-[#C5A059] text-black font-semibold shadow-md'
                : 'text-neutral-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <SettingsIcon className="w-4 h-4 shrink-0" />
            <span>Salon Settings</span>
          </button>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-white/10 space-y-3">
          <div className="px-3 py-2 bg-[#121116] rounded-xl border border-white/5">
            <p className="text-[10px] text-neutral-500 uppercase tracking-wider font-semibold">Logged in as</p>
            <p className="text-xs text-neutral-300 font-medium truncate mt-0.5">{user.email}</p>
          </div>

          <button
            onClick={handleSignOut}
            className="w-full px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 transition-colors text-xs font-semibold flex items-center justify-center gap-2 border border-rose-500/20"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT WORKSPACE */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">

        {/* TOP BAR */}
        <header className="bg-[#1C1A22] border-b border-white/10 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
          <div>
            <h2 className="font-serif text-lg font-bold text-white capitalize">{activeSection}</h2>
            <p className="text-xs text-neutral-400 hidden sm:block">Manage your salon operations, bookings, products, and services</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadDashboardData}
              disabled={fetchingData}
              className="px-3.5 py-2 rounded-xl bg-[#25222D] border border-white/10 hover:bg-white/10 text-neutral-300 transition-colors flex items-center gap-2 text-xs font-medium"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${fetchingData ? 'animate-spin text-[#C5A059]' : ''}`} />
              <span className="hidden sm:inline">Refresh Data</span>
            </button>
          </div>
        </header>

        {/* WORKSPACE AREA */}
        <main className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">

          {/* 1. DASHBOARD OVERVIEW SECTION */}
          {activeSection === 'dashboard' && (
            <div className="space-y-8">
              {/* Stats Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#1C1A22] border border-white/10 rounded-3xl p-5">
                  <div className="flex items-center justify-between text-neutral-400 mb-3">
                    <span className="text-xs font-semibold uppercase tracking-wider">Bookings</span>
                    <Calendar className="w-5 h-5 text-[#C5A059]" />
                  </div>
                  <div className="font-serif font-bold text-2xl sm:text-3xl text-white">{totalBookingsCount}</div>
                  <div className="flex items-center gap-2 text-[11px] mt-2 text-neutral-400">
                    <span className="text-amber-400 font-semibold">{pendingBookingsCount} Pending</span>
                    <span>•</span>
                    <span className="text-emerald-400 font-semibold">{confirmedBookingsCount} Confirmed</span>
                  </div>
                </div>

                <div className="bg-[#1C1A22] border border-white/10 rounded-3xl p-5">
                  <div className="flex items-center justify-between text-neutral-400 mb-3">
                    <span className="text-xs font-semibold uppercase tracking-wider">Orders</span>
                    <ShoppingBag className="w-5 h-5 text-[#C5A059]" />
                  </div>
                  <div className="font-serif font-bold text-2xl sm:text-3xl text-white">{totalOrdersCount}</div>
                  <div className="text-[11px] mt-2 text-amber-400 font-semibold">
                    {pendingOrdersCount} Pending Fulfillment
                  </div>
                </div>

                <div className="bg-[#1C1A22] border border-white/10 rounded-3xl p-5">
                  <div className="flex items-center justify-between text-neutral-400 mb-3">
                    <span className="text-xs font-semibold uppercase tracking-wider">Services</span>
                    <Scissors className="w-5 h-5 text-[#C5A059]" />
                  </div>
                  <div className="font-serif font-bold text-2xl sm:text-3xl text-white">{totalServicesCount}</div>
                  <div className="text-[11px] mt-2 text-emerald-400 font-semibold">
                    {services.filter(s => s.is_visible).length} Active on Website
                  </div>
                </div>

                <div className="bg-[#1C1A22] border border-white/10 rounded-3xl p-5">
                  <div className="flex items-center justify-between text-neutral-400 mb-3">
                    <span className="text-xs font-semibold uppercase tracking-wider">Products</span>
                    <Package className="w-5 h-5 text-[#C5A059]" />
                  </div>
                  <div className="font-serif font-bold text-2xl sm:text-3xl text-white">{totalProductsCount}</div>
                  <div className="text-[11px] mt-2 text-emerald-400 font-semibold">
                    {products.filter(p => p.is_visible).length} Active on Shop
                  </div>
                </div>
              </div>

              {/* Recent Activity Feeds */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Bookings */}
                <div className="bg-[#1C1A22] border border-white/10 rounded-3xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-serif font-bold text-base text-white flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#C5A059]" />
                      <span>Recent Bookings</span>
                    </h3>
                    <button
                      onClick={() => setActiveSection('bookings')}
                      className="text-xs text-[#C5A059] hover:underline font-semibold"
                    >
                      View All
                    </button>
                  </div>

                  {bookings.length === 0 ? (
                    <p className="text-xs text-neutral-500 py-6 text-center">No bookings recorded yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {bookings.slice(0, 4).map((b) => (
                        <div key={b.id} className="p-3.5 bg-[#121116] rounded-2xl border border-white/5 flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold text-white">{b.customer_name}</p>
                            <p className="text-xs text-neutral-400 mt-0.5">{b.service_name} • {b.booking_date}</p>
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

                {/* Recent Orders */}
                <div className="bg-[#1C1A22] border border-white/10 rounded-3xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-serif font-bold text-base text-white flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4 text-[#C5A059]" />
                      <span>Recent Orders</span>
                    </h3>
                    <button
                      onClick={() => setActiveSection('orders')}
                      className="text-xs text-[#C5A059] hover:underline font-semibold"
                    >
                      View All
                    </button>
                  </div>

                  {orders.length === 0 ? (
                    <p className="text-xs text-neutral-500 py-6 text-center">No orders recorded yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {orders.slice(0, 4).map((o) => (
                        <div key={o.id} className="p-3.5 bg-[#121116] rounded-2xl border border-white/5 flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold text-white">{o.customer_name}</p>
                            <p className="text-xs text-neutral-400 mt-0.5">
                              GH₵{o.total_amount || 0} • {o.order_items?.length || 0} item(s)
                            </p>
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
              {/* Search & Stats Filter */}
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
                  <Calendar className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
                  <h3 className="font-serif text-lg font-semibold text-white">No appointment bookings found</h3>
                  <p className="text-xs text-neutral-400 mt-1">Bookings submitted on the website will appear here in real time.</p>
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
                          <span className="text-neutral-500">GH₵50 Deposit:</span>
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

                      {/* Controls */}
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
                          <span className="text-neutral-400">GH₵50 Deposit:</span>
                          <select
                            value={b.deposit_status || 'pending'}
                            onChange={(e) => updateDepositStatus(b.id, e.target.value)}
                            className="bg-[#121116] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#C5A059]"
                          >
                            <option value="pending">Pending</option>
                            <option value="paid">Paid GH₵50</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 3. ORDERS SECTION */}
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
                          o.status === 'processing' || o.status === 'confirmed' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                          o.status === 'cancelled' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                          'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}>
                          {o.status}
                        </span>
                      </div>

                      <div className="space-y-3 text-xs text-neutral-300">
                        {o.order_items && o.order_items.length > 0 && (
                          <div className="bg-[#121116] p-3 rounded-2xl border border-white/5 space-y-2">
                            <p className="font-semibold text-neutral-400 text-[11px] uppercase tracking-wider">Order Items Snapshot:</p>
                            <ul className="space-y-1 divide-y divide-white/5">
                              {o.order_items.map((item, idx) => (
                                <li key={idx} className="pt-1 flex justify-between text-neutral-200">
                                  <span>{item.quantity}x {item.product_name}</span>
                                  {item.unit_price ? <span>GH₵{item.unit_price * item.quantity}</span> : <span>Confirm on WA</span>}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-1">
                          <span className="text-neutral-400 font-medium">Order Total:</span>
                          <span className="font-serif font-bold text-base text-[#C5A059]">
                            GH₵{o.total_amount || 'Custom'}
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
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="processing">Processing</option>
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

          {/* 4. SERVICES CRUD SECTION */}
          {activeSection === 'services' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif font-bold text-lg text-white">Salon Services Catalog</h3>
                  <p className="text-xs text-neutral-400">Add, update prices, change descriptions, or hide services from public site.</p>
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
                            {s.price !== null && s.price !== undefined ? `GH₵${s.price}` : 'Quote'}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-400 leading-relaxed line-clamp-3">{s.description}</p>
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
                        title="Delete Service"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. PRODUCTS CRUD SECTION */}
          {activeSection === 'products' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif font-bold text-lg text-white">Hair Care & Beauty Products Catalog</h3>
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
                            title={p.is_visible ? 'Visible on Shop' : 'Hidden from Shop'}
                          >
                            {p.is_visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="p-5 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-bold text-white text-base font-serif">{p.name}</h4>
                          <span className="text-sm font-semibold text-[#C5A059] shrink-0">
                            {p.price !== null && p.price !== undefined ? `GH₵${p.price}` : 'Quote'}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-400 leading-relaxed line-clamp-3">{p.description}</p>
                        
                        <div className="pt-2">
                          <button
                            onClick={() => toggleProductAvailability(p.id, p.is_available)}
                            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-colors ${
                              p.is_available !== false ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                            }`}
                          >
                            {p.is_available !== false ? 'In Stock' : 'Out of Stock'}
                          </button>
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
                        title="Delete Product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 6. SETTINGS SECTION */}
          {activeSection === 'settings' && (
            <div className="bg-[#1C1A22] rounded-3xl border border-white/10 p-6 sm:p-8 max-w-3xl space-y-6">
              <div>
                <h3 className="font-serif font-bold text-xl text-white">Salon Settings & Information</h3>
                <p className="text-xs text-neutral-400 mt-1">Official contact information and business defaults for Kiki&apos;s Touch Beauty Salon.</p>
              </div>

              <div className="space-y-4 text-xs">
                <div className="p-4 bg-[#121116] rounded-2xl border border-white/5 space-y-1">
                  <span className="text-neutral-500 font-semibold uppercase tracking-wider text-[10px]">Business Name</span>
                  <p className="text-white font-medium text-sm">Kiki&apos;s Touch Beauty Salon</p>
                </div>

                <div className="p-4 bg-[#121116] rounded-2xl border border-white/5 space-y-1">
                  <span className="text-neutral-500 font-semibold uppercase tracking-wider text-[10px]">Location</span>
                  <p className="text-white font-medium text-sm">Sowutoum, Ghana</p>
                </div>

                <div className="p-4 bg-[#121116] rounded-2xl border border-white/5 space-y-1">
                  <span className="text-neutral-500 font-semibold uppercase tracking-wider text-[10px]">WhatsApp / Phone</span>
                  <p className="text-white font-medium text-sm">054 360 3627 (https://wa.me/233543603627)</p>
                </div>

                <div className="p-4 bg-[#121116] rounded-2xl border border-white/5 space-y-1">
                  <span className="text-neutral-500 font-semibold uppercase tracking-wider text-[10px]">Required Deposit</span>
                  <p className="text-white font-medium text-sm">GH₵50 required to secure appointment slot</p>
                </div>

                <div className="p-4 bg-[#121116] rounded-2xl border border-white/5 space-y-1">
                  <span className="text-neutral-500 font-semibold uppercase tracking-wider text-[10px]">Opening Hours</span>
                  <p className="text-white font-medium text-sm">Monday – Saturday: 9:00 AM – 8:00 PM • Sunday: Closed</p>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* PRODUCT MODAL (ADD / EDIT) */}
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

              <div>
                <label className="block text-neutral-400 font-semibold uppercase tracking-wider mb-2">Price (GH₵)</label>
                <input
                  type="number"
                  step="0.01"
                  value={productForm.price}
                  onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                  placeholder="e.g. 80.00 (leave blank for Quote)"
                  className="w-full bg-[#121116] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              <div>
                <label className="block text-neutral-400 font-semibold uppercase tracking-wider mb-2">Product Image (Upload to Supabase Storage)</label>
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

      {/* SERVICE MODAL (ADD / EDIT) */}
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

              <div>
                <label className="block text-neutral-400 font-semibold uppercase tracking-wider mb-2">Starting Price (GH₵)</label>
                <input
                  type="number"
                  step="0.01"
                  value={serviceForm.price}
                  onChange={(e) => setServiceForm({ ...serviceForm, price: e.target.value })}
                  placeholder="e.g. 150.00 (leave blank for Quote)"
                  className="w-full bg-[#121116] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              <div>
                <label className="block text-neutral-400 font-semibold uppercase tracking-wider mb-2">Service Image (Upload to Supabase Storage)</label>
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

      {/* DELETE CONFIRMATION DIALOG */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1C1A22] border border-white/10 rounded-3xl p-6 w-full max-w-md space-y-4">
            <h3 className="font-serif font-bold text-lg text-white">
              Confirm Delete {deleteConfirmId.type === 'product' ? 'Product' : 'Service'}
            </h3>
            <p className="text-xs text-neutral-400">
              Are you sure you want to permanently delete <strong className="text-white">&quot;{deleteConfirmId.name}&quot;</strong>? This action cannot be undone.
            </p>

            <div className="pt-4 flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2.5 rounded-xl border border-white/10 text-neutral-300 text-xs hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (deleteConfirmId.type === 'product') {
                    handleDeleteProduct(deleteConfirmId.id);
                  } else {
                    handleDeleteService(deleteConfirmId.id);
                  }
                }}
                disabled={actionLoading}
                className="px-5 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs flex items-center gap-2"
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
