'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { 
  Calendar, 
  ShoppingBag, 
  Scissors, 
  Package, 
  LogOut, 
  Lock, 
  Mail, 
  KeyRound, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  RefreshCw, 
  Phone,
  Search,
  ExternalLink,
  DollarSign
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
  is_visible: boolean;
  is_featured: boolean;
  display_order: number;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number | null;
  is_visible: boolean;
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

  // Dashboard active tab
  const [activeTab, setActiveTab] = useState<'bookings' | 'orders' | 'services' | 'products'>('bookings');

  // Data states
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [fetchingData, setFetchingData] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState('');

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
      // Check user metadata first or query profiles table
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

  async function toggleServiceVisibility(id: string, currentVisibility: boolean) {
    const { error } = await supabase
      .from('services')
      .update({ is_visible: !currentVisibility, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (!error) {
      setServices(prev => prev.map(s => s.id === id ? { ...s, is_visible: !currentVisibility } : s));
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

  function formatWhatsAppUrl(phone: string) {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const fullPhone = cleanPhone.startsWith('233') ? cleanPhone : cleanPhone.startsWith('0') ? `233${cleanPhone.slice(1)}` : cleanPhone;
    return `https://wa.me/${fullPhone}`;
  }

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
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-[#C5A059] animate-spin" />
          <p className="text-sm font-medium text-neutral-600">Loading Kiki&apos;s Touch Admin...</p>
        </div>
      </div>
    );
  }

  // LOGIN SCREEN
  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-[#E8E2D5] p-8">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-[#FAF7F2] border border-[#E8E2D5] rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-6 h-6 text-[#C5A059]" />
            </div>
            <h1 className="font-serif text-2xl font-semibold text-neutral-900">Kiki&apos;s Touch Salon</h1>
            <p className="text-xs uppercase tracking-widest text-[#C5A059] font-medium mt-1">Admin Portal</p>
          </div>

          {errorMsg && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 mb-2">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="sarpongkesh@gmail.com"
                  className="w-full bg-[#FAF7F2] border border-[#E8E2D5] rounded-xl pl-11 pr-4 py-3 text-sm text-neutral-900 focus:outline-none focus:border-[#C5A059] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 mb-2">
                Password
              </label>
              <div className="relative">
                <KeyRound className="w-5 h-5 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#FAF7F2] border border-[#E8E2D5] rounded-xl pl-11 pr-4 py-3 text-sm text-neutral-900 focus:outline-none focus:border-[#C5A059] transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full bg-[#1A1A1A] hover:bg-[#C5A059] text-white font-medium py-3 rounded-xl transition-all duration-200 shadow-md flex items-center justify-center gap-2"
            >
              {authLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <span>Sign In to Admin Panel</span>
              )}
            </button>
          </form>

          <div className="mt-8 text-center pt-6 border-t border-neutral-100">
            <p className="text-xs text-neutral-400">
              Kiki&apos;s Touch Beauty Salon • Sowutoum, Ghana
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ADMIN DASHBOARD SCREEN
  return (
    <div className="min-h-screen bg-[#F7F4EE] text-neutral-900">
      {/* Top Header */}
      <header className="bg-white border-b border-[#E8E2D5] sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#FAF7F2] border border-[#E8E2D5] flex items-center justify-center">
              <Lock className="w-5 h-5 text-[#C5A059]" />
            </div>
            <div>
              <h1 className="font-serif text-lg font-bold text-neutral-900">Kiki&apos;s Touch Admin</h1>
              <p className="text-xs text-neutral-500">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadDashboardData}
              disabled={fetchingData}
              className="p-2 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-neutral-600 transition-colors flex items-center gap-1.5 text-xs font-medium"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${fetchingData ? 'animate-spin text-[#C5A059]' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              onClick={handleSignOut}
              className="px-3 py-2 rounded-xl bg-neutral-100 hover:bg-rose-50 hover:text-rose-600 text-neutral-700 transition-colors text-xs font-medium flex items-center gap-1.5"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>

        {/* Tab Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-neutral-100 flex gap-2 overflow-x-auto py-2">
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === 'bookings'
                ? 'bg-[#1A1A1A] text-white shadow-sm'
                : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            <Calendar className="w-4 h-4 text-[#C5A059]" />
            <span>Bookings ({bookings.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === 'orders'
                ? 'bg-[#1A1A1A] text-white shadow-sm'
                : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            <ShoppingBag className="w-4 h-4 text-[#C5A059]" />
            <span>Orders ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('services')}
            className={`px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === 'services'
                ? 'bg-[#1A1A1A] text-white shadow-sm'
                : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            <Scissors className="w-4 h-4 text-[#C5A059]" />
            <span>Services ({services.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === 'products'
                ? 'bg-[#1A1A1A] text-white shadow-sm'
                : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            <Package className="w-4 h-4 text-[#C5A059]" />
            <span>Products ({products.length})</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Search / Filter bar */}
        {(activeTab === 'bookings' || activeTab === 'orders') && (
          <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={`Search ${activeTab} by name or phone...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-[#E8E2D5] rounded-xl pl-10 pr-4 py-2.5 text-sm text-neutral-900 focus:outline-none focus:border-[#C5A059]"
              />
            </div>
            <div className="text-xs text-neutral-500 font-medium">
              Showing {activeTab === 'bookings' ? filteredBookings.length : filteredOrders.length} entries
            </div>
          </div>
        )}

        {/* BOOKINGS TAB */}
        {activeTab === 'bookings' && (
          <div>
            {filteredBookings.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[#E8E2D5] p-12 text-center">
                <Calendar className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                <h3 className="font-serif text-lg font-medium text-neutral-700">No appointments found</h3>
                <p className="text-xs text-neutral-400 mt-1">Bookings submitted by salon clients will appear here automatically.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredBookings.map((b) => (
                  <div key={b.id} className="bg-white rounded-2xl border border-[#E8E2D5] p-5 shadow-xs hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between border-b border-neutral-100 pb-3 mb-3">
                      <div>
                        <h4 className="font-semibold text-neutral-900 text-base">{b.customer_name}</h4>
                        <a
                          href={formatWhatsAppUrl(b.customer_phone)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-[#C5A059] font-medium hover:underline flex items-center gap-1 mt-0.5"
                        >
                          <Phone className="w-3 h-3" />
                          <span>{b.customer_phone}</span>
                          <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                        </a>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        b.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' :
                        b.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                        b.status === 'cancelled' ? 'bg-rose-100 text-rose-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {b.status}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs text-neutral-600 mb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-neutral-400">Service:</span>
                        <span className="font-semibold text-neutral-900">{b.service_name}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-neutral-400">Date & Time:</span>
                        <span className="font-medium text-neutral-800">{b.booking_date} @ {b.booking_time}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-neutral-400">GH₵50 Deposit:</span>
                        <span className={`font-semibold flex items-center gap-1 ${
                          b.deposit_status === 'paid' ? 'text-emerald-600' : 'text-amber-600'
                        }`}>
                          <DollarSign className="w-3 h-3" />
                          {b.deposit_status || 'Pending'}
                        </span>
                      </div>
                      {b.notes && (
                        <div className="bg-[#FAF7F2] p-2.5 rounded-lg border border-[#E8E2D5] text-[11px] italic text-neutral-700 mt-2">
                          &quot;{b.notes}&quot;
                        </div>
                      )}
                    </div>

                    {/* Quick Action Status Pickers */}
                    <div className="border-t border-neutral-100 pt-3 flex flex-col gap-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-neutral-400 font-medium">Update Status:</span>
                        <select
                          value={b.status}
                          onChange={(e) => updateBookingStatus(b.id, e.target.value)}
                          className="bg-neutral-50 border border-neutral-200 rounded-lg px-2 py-1 text-xs text-neutral-800 focus:outline-none focus:border-[#C5A059]"
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className="text-neutral-400 font-medium">Deposit:</span>
                        <select
                          value={b.deposit_status || 'pending'}
                          onChange={(e) => updateDepositStatus(b.id, e.target.value)}
                          className="bg-neutral-50 border border-neutral-200 rounded-lg px-2 py-1 text-xs text-neutral-800 focus:outline-none focus:border-[#C5A059]"
                        >
                          <option value="pending">Pending GH₵50</option>
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

        {/* ORDERS TAB */}
        {activeTab === 'orders' && (
          <div>
            {filteredOrders.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[#E8E2D5] p-12 text-center">
                <ShoppingBag className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                <h3 className="font-serif text-lg font-medium text-neutral-700">No product orders yet</h3>
                <p className="text-xs text-neutral-400 mt-1">Product purchases will appear here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredOrders.map((o) => (
                  <div key={o.id} className="bg-white rounded-2xl border border-[#E8E2D5] p-5 shadow-xs hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between border-b border-neutral-100 pb-3 mb-3">
                      <div>
                        <h4 className="font-semibold text-neutral-900 text-base">{o.customer_name}</h4>
                        <a
                          href={formatWhatsAppUrl(o.customer_phone)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-[#C5A059] font-medium hover:underline flex items-center gap-1 mt-0.5"
                        >
                          <Phone className="w-3 h-3" />
                          <span>{o.customer_phone}</span>
                          <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                        </a>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        o.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                        o.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                        o.status === 'cancelled' ? 'bg-rose-100 text-rose-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {o.status}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs text-neutral-600 mb-4">
                      {o.delivery_address && (
                        <div>
                          <span className="text-neutral-400">Delivery Address:</span>
                          <p className="font-medium text-neutral-800 mt-0.5">{o.delivery_address}</p>
                        </div>
                      )}
                      
                      {o.order_items && o.order_items.length > 0 && (
                        <div className="bg-[#FAF7F2] p-2.5 rounded-lg border border-[#E8E2D5] text-xs">
                          <span className="font-semibold text-neutral-700 block mb-1">Items:</span>
                          <ul className="space-y-1">
                            {o.order_items.map((item, idx) => (
                              <li key={idx} className="flex justify-between text-neutral-800">
                                <span>{item.quantity}x {item.product_name}</span>
                                {item.unit_price && <span>GH₵{item.unit_price * item.quantity}</span>}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
                        <span className="text-neutral-500 font-medium">Total Amount:</span>
                        <span className="font-serif font-bold text-base text-[#1A1A1A]">
                          GH₵{o.total_amount || 'Contact for price'}
                        </span>
                      </div>
                    </div>

                    <div className="border-t border-neutral-100 pt-3 flex items-center justify-between text-xs">
                      <span className="text-neutral-400 font-medium">Update Status:</span>
                      <select
                        value={o.status}
                        onChange={(e) => updateOrderStatus(o.id, e.target.value)}
                        className="bg-neutral-50 border border-neutral-200 rounded-lg px-2.5 py-1 text-xs text-neutral-800 focus:outline-none focus:border-[#C5A059]"
                      >
                        <option value="pending">Pending</option>
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

        {/* SERVICES TAB */}
        {activeTab === 'services' && (
          <div className="bg-white rounded-2xl border border-[#E8E2D5] overflow-hidden shadow-xs">
            <div className="p-4 bg-[#FAF7F2] border-b border-[#E8E2D5] flex items-center justify-between">
              <h3 className="font-serif font-semibold text-neutral-900 text-base">Salon Services Directory</h3>
              <span className="text-xs text-neutral-500">{services.length} Total Services</span>
            </div>

            <div className="divide-y divide-neutral-100">
              {services.map((s) => (
                <div key={s.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-neutral-50 transition-colors">
                  <div>
                    <h4 className="font-semibold text-neutral-900 text-sm">{s.name}</h4>
                    <p className="text-xs text-neutral-500 mt-0.5">{s.description}</p>
                  </div>

                  <div className="flex items-center gap-4 self-end sm:self-auto">
                    <button
                      onClick={() => toggleServiceVisibility(s.id, s.is_visible)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                        s.is_visible 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : 'bg-neutral-100 text-neutral-500 border border-neutral-200'
                      }`}
                    >
                      {s.is_visible ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                      <span>{s.is_visible ? 'Visible on Web' : 'Hidden'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PRODUCTS TAB */}
        {activeTab === 'products' && (
          <div className="bg-white rounded-2xl border border-[#E8E2D5] overflow-hidden shadow-xs">
            <div className="p-4 bg-[#FAF7F2] border-b border-[#E8E2D5] flex items-center justify-between">
              <h3 className="font-serif font-semibold text-neutral-900 text-base">Product Catalog Directory</h3>
              <span className="text-xs text-neutral-500">{products.length} Total Products</span>
            </div>

            <div className="divide-y divide-neutral-100">
              {products.map((p) => (
                <div key={p.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-neutral-50 transition-colors">
                  <div>
                    <h4 className="font-semibold text-neutral-900 text-sm">{p.name}</h4>
                    <p className="text-xs text-neutral-500 mt-0.5">{p.description}</p>
                  </div>

                  <div className="flex items-center gap-4 self-end sm:self-auto">
                    <button
                      onClick={() => toggleProductVisibility(p.id, p.is_visible)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                        p.is_visible 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : 'bg-neutral-100 text-neutral-500 border border-neutral-200'
                      }`}
                    >
                      {p.is_visible ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                      <span>{p.is_visible ? 'Visible on Web' : 'Hidden'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
