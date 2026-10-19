import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import AdminNav from '../../components/layout/AdminNav';
import toast from 'react-hot-toast';
import {
  ShoppingBag,
  ChefHat,
  PackageCheck,
  IndianRupee,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Clock,
  Sparkles,
  Zap,
  Activity,
  Layers,
  ShieldCheck,
  TrendingUp
} from 'lucide-react';

export default function AdminDashboard() {
  const { socket } = useSocket();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/dashboard');
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load admin stats:', err);
      toast.error(err.response?.data?.message || 'Failed to load dashboard telemetry');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();

    const handleNewOrder = (newOrder) => {
      toast.success(`⚡ New Order Dispatched: #${newOrder.orderNumber}!`, {
        duration: 5000,
        icon: '🍕',
      });
      fetchDashboard();
    };

    const handleInventoryUpdate = () => {
      fetchDashboard();
    };

    socket?.on('new_order_admin', handleNewOrder);
    socket?.on('inventory_updated', handleInventoryUpdate);

    return () => {
      socket?.off('new_order_admin', handleNewOrder);
      socket?.off('inventory_updated', handleInventoryUpdate);
    };
  }, [socket]);

  if (loading && !data) {
    return (
      <div className="min-h-screen pt-36 pb-24 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-neon-pink border-t-transparent rounded-full animate-spin shadow-glow-pink"></div>
          <p className="text-midnight-300 font-mono text-xs uppercase tracking-widest">
            Syncing Kitchen Command Telemetry...
          </p>
        </div>
      </div>
    );
  }

  const stats = data?.stats || {};
  const recentOrders = data?.recentOrders || [];
  const criticalInventory = data?.criticalInventory || [];

  return (
    <div className="pt-32 pb-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-fade-in">
      <AdminNav />

      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-[11px] font-mono font-bold text-amber-electric uppercase tracking-widest">
              Live Operations HUD
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-black text-white">
            Kitchen & Sales Command Center
          </h1>
        </div>

        <button
          onClick={fetchDashboard}
          className="btn-secondary !px-4 !py-2 text-xs font-mono uppercase tracking-wider self-start sm:self-auto flex items-center gap-2 border-white/15 hover:border-veloce-400"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          <span>Refresh HUD</span>
        </button>
      </div>

      {/* Low-Stock Warning Banner */}
      {stats.lowStockCount > 0 && (
        <div className="cyber-card p-5 border-amber-electric/40 bg-amber-molten/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-glow-amber">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-amber-electric/20 text-amber-electric flex items-center justify-center shrink-0 border border-amber-electric/30">
              <AlertTriangle size={22} />
            </div>
            <div>
              <h4 className="font-display font-extrabold text-sm text-white flex items-center gap-2">
                CRITICAL INVENTORY ALERT ({stats.lowStockCount} items below threshold)
              </h4>
              <p className="text-xs text-midnight-300 font-sans mt-0.5">
                Certain pizza bases, sauces, or cheese portions are depleted. Automated node-cron alerts have been logged.
              </p>
            </div>
          </div>
          <Link
            to="/admin/inventory?lowStockOnly=true"
            className="btn-primary !px-5 !py-2 text-xs font-mono uppercase tracking-wider whitespace-nowrap shadow-glow-pink"
          >
            Restock Now ⚡
          </Link>
        </div>
      )}

      {/* Telemetry Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Total Orders */}
        <div className="cyber-card p-5 space-y-2 border-veloce-500/25 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-veloce-600/10 rounded-full blur-xl pointer-events-none"></div>
          <div className="flex items-center justify-between text-midnight-400 font-mono text-xs font-bold uppercase tracking-wider">
            <span>Total Orders</span>
            <ShoppingBag size={17} className="text-veloce-400" />
          </div>
          <p className="text-3xl font-display font-black text-white">
            {stats.totalOrders || 0}
          </p>
          <span className="text-[11px] font-mono text-midnight-400 block">All-time volume</span>
        </div>

        {/* In Kitchen & Queued */}
        <div className="cyber-card p-5 space-y-2 border-amber-electric/25 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-electric/10 rounded-full blur-xl pointer-events-none"></div>
          <div className="flex items-center justify-between text-midnight-400 font-mono text-xs font-bold uppercase tracking-wider">
            <span>Active Kitchen</span>
            <ChefHat size={17} className="text-amber-electric" />
          </div>
          <p className="text-3xl font-display font-black text-amber-electric">
            {(stats.pendingOrders || 0) + (stats.kitchenOrders || 0)}
          </p>
          <span className="text-[11px] font-mono text-midnight-300 block">
            {stats.pendingOrders || 0} queued • {stats.kitchenOrders || 0} in kiln
          </span>
        </div>

        {/* Dispatched / Delivered */}
        <div className="cyber-card p-5 space-y-2 border-emerald-500/25 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl pointer-events-none"></div>
          <div className="flex items-center justify-between text-midnight-400 font-mono text-xs font-bold uppercase tracking-wider">
            <span>Delivered Fleet</span>
            <PackageCheck size={17} className="text-emerald-400" />
          </div>
          <p className="text-3xl font-display font-black text-emerald-400">
            {stats.deliveredOrders || 0}
          </p>
          <span className="text-[11px] font-mono text-midnight-300 block">
            {stats.deliveryOrders || 0} currently in courier transit
          </span>
        </div>

        {/* Verified Revenue */}
        <div className="cyber-card p-5 space-y-2 border-neon-pink/25 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-neon-pink/10 rounded-full blur-xl pointer-events-none"></div>
          <div className="flex items-center justify-between text-midnight-400 font-mono text-xs font-bold uppercase tracking-wider">
            <span>Net Revenue</span>
            <IndianRupee size={17} className="text-neon-pink" />
          </div>
          <p className="text-3xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-electric to-white">
            ₹{stats.totalRevenue || 0}
          </p>
          <span className="text-[11px] font-mono text-midnight-400 block">
            Verified Razorpay settlements
          </span>
        </div>
      </div>

      {/* Main Split: Live Order Queue on Left, Critical Stock Telemetry on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Recent Orders List (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity size={16} className="text-neon-pink" />
              <h3 className="font-display font-black text-lg text-white">Live Order Queue</h3>
            </div>
            <Link
              to="/admin/orders"
              className="text-xs font-mono font-bold uppercase tracking-wider text-veloce-300 hover:text-white flex items-center gap-1"
            >
              <span>Manage All ({stats.totalOrders || 0})</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          <div className="cyber-card overflow-hidden border-white/10">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-midnight-950/80 text-midnight-400 uppercase tracking-wider font-bold border-b border-white/10">
                  <tr>
                    <th className="px-5 py-3.5">Order ID</th>
                    <th className="px-5 py-3.5">Recipient</th>
                    <th className="px-5 py-3.5">Items</th>
                    <th className="px-5 py-3.5">Total</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {recentOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-white/5 transition-colors">
                      <td className="px-5 py-3.5 font-bold text-white">
                        #{order.orderNumber}
                      </td>
                      <td className="px-5 py-3.5 text-midnight-200 font-sans">
                        {order.deliveryAddress?.fullName || order.user?.name || 'Customer'}
                      </td>
                      <td className="px-5 py-3.5 text-midnight-300 truncate max-w-[160px] font-sans">
                        {order.items?.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                      </td>
                      <td className="px-5 py-3.5 font-display font-bold text-white">
                        ₹{order.pricing?.total}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={
                            order.orderStatus === 'Delivered'
                              ? 'badge-success'
                              : order.orderStatus === 'In Kitchen'
                              ? 'badge-warning'
                              : order.orderStatus === 'Sent to Delivery'
                              ? 'badge-info'
                              : order.orderStatus === 'Cancelled'
                              ? 'badge-danger'
                              : 'badge bg-midnight-800 text-midnight-300'
                          }
                        >
                          {order.orderStatus}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Link
                          to="/admin/orders"
                          className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-white/5 text-veloce-300 hover:bg-veloce-500/20 hover:text-white transition-all inline-block"
                        >
                          Dispatch →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Critical Stock List (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers size={16} className="text-amber-electric" />
              <h3 className="font-display font-black text-lg text-white">Stock Depletion</h3>
            </div>
            <Link
              to="/admin/inventory"
              className="text-xs font-mono font-bold uppercase tracking-wider text-amber-electric hover:text-white flex items-center gap-1"
            >
              <span>Full Stock</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          <div className="cyber-card p-5 space-y-3 border-white/10">
            {criticalInventory.length > 0 ? (
              criticalInventory.map((item) => (
                <div
                  key={item._id}
                  className="flex items-center justify-between p-3 rounded-xl bg-midnight-950/70 border border-white/10 text-xs font-mono"
                >
                  <div>
                    <h5 className="font-bold text-white">{item.itemName}</h5>
                    <span className="text-[10px] text-midnight-400 capitalize">
                      {item.category} • Threshold: {item.lowStockThreshold}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-display font-bold text-neon-pink block text-sm">
                      {item.quantity} {item.unit}
                    </span>
                    <span className="badge-danger text-[9px] px-1.5 py-0.5">DEPLETED</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-xs text-midnight-300 font-sans space-y-2">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
                  <ShieldCheck size={20} />
                </div>
                <p className="font-semibold text-white">All Stock Levels Optimal</p>
                <p className="text-[11px] text-midnight-400">
                  All dough bases, cheeses, sauces, and veggies exceed safety thresholds.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
