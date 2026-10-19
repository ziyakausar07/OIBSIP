import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  User,
  ShoppingBag,
  Clock,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
  Flame,
  CheckCircle2,
  Bike,
  Zap,
  Activity
} from 'lucide-react';

export default function Dashboard() {
  const { user, isVerified } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyOrders = async () => {
      try {
        const { data } = await api.get('/orders/my-orders');
        if (data.success) {
          setOrders(data.orders);
        }
      } catch (err) {
        console.error('Failed to load orders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMyOrders();
  }, []);

  const activeOrders = orders.filter(
    (o) => ['Order Received', 'In Kitchen', 'Sent to Delivery'].includes(o.orderStatus)
  );

  return (
    <div className="pt-32 pb-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 animate-fade-in">
      {/* User Welcome Banner */}
      <div className="cyber-card p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 border-veloce-500/30">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-neon-pink via-veloce-600 to-amber-electric flex items-center justify-center text-white text-2xl font-black font-display shadow-glow-pink">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-display font-black text-white">{user?.name}</h1>
              {isVerified ? (
                <span className="badge-success text-[10px] flex items-center gap-1 font-mono">
                  <ShieldCheck size={12} />
                  Verified Member
                </span>
              ) : (
                <Link to="/verify-email" className="badge-warning text-[10px] flex items-center gap-1 font-mono">
                  <AlertCircle size={12} />
                  Verify Email
                </Link>
              )}
            </div>
            <p className="text-xs font-mono text-midnight-300 mt-1">{user?.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/custom-pizza" className="btn-primary text-xs font-mono uppercase tracking-wider !px-5 !py-2.5 shadow-glow-pink">
            Launch Pizza Lab ⚡
          </Link>
          <Link to="/menu" className="btn-secondary text-xs font-mono uppercase tracking-wider !px-5 !py-2.5">
            Artisan Menu
          </Link>
        </div>
      </div>

      {/* Active Orders Highlight */}
      {activeOrders.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-pink opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-neon-pink"></span>
            </span>
            <h2 className="text-lg font-display font-black text-white">
              Live Active Dispatches ({activeOrders.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeOrders.map((order) => (
              <div
                key={order._id}
                className="cyber-card p-6 border-veloce-500/40 bg-veloce-950/20 space-y-4 shadow-glow-violet hover:border-veloce-400 transition-all"
              >
                <div className="flex items-center justify-between font-mono">
                  <div>
                    <span className="font-display font-extrabold text-white text-base">
                      #{order.orderNumber}
                    </span>
                    <p className="text-xs text-midnight-300 mt-0.5">
                      {order.items?.length} items • ₹{order.pricing?.total}
                    </p>
                  </div>
                  <span className="badge-warning text-xs font-bold px-3 py-1">
                    {order.orderStatus}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-white/10 font-mono text-xs">
                  <span className="text-midnight-300 flex items-center gap-1.5">
                    {order.orderStatus === 'In Kitchen'
                      ? '🔥 Baking in 480°C stone kiln'
                      : order.orderStatus === 'Sent to Delivery'
                      ? '🛵 Thermal courier en route'
                      : '📋 Verified by central dispatch'}
                  </span>
                  <Link
                    to={`/orders/${order._id}`}
                    className="btn-primary !px-4 !py-1.5 text-xs font-mono uppercase tracking-wider flex items-center gap-1 shadow-glow-pink"
                  >
                    <span>Track Live</span>
                    <ChevronRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Order History */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-display font-black text-white flex items-center gap-2">
            <Clock size={18} className="text-amber-electric" />
            <span>Order History Ledger</span>
          </h2>
        </div>

        {loading ? (
          <div className="cyber-card p-12 skeleton h-48"></div>
        ) : orders.length > 0 ? (
          <div className="cyber-card overflow-hidden border-white/10">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-midnight-950/80 text-midnight-400 uppercase tracking-wider font-bold border-b border-white/10">
                  <tr>
                    <th className="px-6 py-4">Order ID</th>
                    <th className="px-6 py-4">Timestamp</th>
                    <th className="px-6 py-4">Items</th>
                    <th className="px-6 py-4">Total</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Telemetry</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {orders.map((order) => (
                    <tr key={order._id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 font-bold text-white">
                        #{order.orderNumber}
                      </td>
                      <td className="px-6 py-4 text-midnight-300">
                        {new Date(order.createdAt).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-6 py-4 text-midnight-200 max-w-xs truncate font-sans">
                        {order.items?.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                      </td>
                      <td className="px-6 py-4 font-display font-black text-white">
                        ₹{order.pricing?.total}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={
                            order.orderStatus === 'Delivered'
                              ? 'badge-success'
                              : order.orderStatus === 'Cancelled'
                              ? 'badge-danger'
                              : 'badge-warning'
                          }
                        >
                          {order.orderStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          to={`/orders/${order._id}`}
                          className="px-3 py-1 rounded-lg bg-white/5 text-veloce-300 hover:text-white hover:bg-veloce-500/20 font-bold transition-all"
                        >
                          View HUD →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="cyber-card p-12 text-center space-y-3 border-white/10">
            <ShoppingBag size={36} className="text-midnight-400 mx-auto" />
            <h3 className="font-display font-bold text-white text-base">No Orders Dispatched Yet</h3>
            <p className="text-xs text-midnight-300 max-w-sm mx-auto font-sans">
              You haven't placed any orders yet. Discover our artisanal menu and taste perfection today!
            </p>
            <div className="pt-2">
              <Link to="/menu" className="btn-primary !px-6 !py-2.5 text-xs font-mono uppercase shadow-glow-pink">
                Explore Menu 🍕
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
