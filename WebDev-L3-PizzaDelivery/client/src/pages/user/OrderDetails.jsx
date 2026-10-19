import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import OrderTracker from '../../components/common/OrderTracker';
import toast from 'react-hot-toast';
import {
  ChevronLeft,
  Clock,
  MapPin,
  CreditCard,
  ChefHat,
  RefreshCw,
  XCircle,
  AlertCircle,
  Zap,
  Activity
} from 'lucide-react';

export default function OrderDetails() {
  const { id } = useParams();
  const { socket, joinOrder, leaveOrder } = useSocket();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/orders/${id}`);
      if (data.success) {
        setOrder(data.order);
      }
    } catch (err) {
      console.error('Failed to load order:', err);
      toast.error('Failed to load order telemetry');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();

    joinOrder(id);

    const handleUpdate = (updatedOrder) => {
      if (updatedOrder._id === id || updatedOrder.orderNumber === order?.orderNumber) {
        setOrder(updatedOrder);
        toast.success(`⚡ Telemetry Update: ${updatedOrder.orderStatus}`, {
          icon: '🍕',
        });
      }
    };

    socket?.on('order_status_update', handleUpdate);

    return () => {
      leaveOrder(id);
      socket?.off('order_status_update', handleUpdate);
    };
  }, [id, socket]);

  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to abort this dispatch?')) return;

    try {
      setCancelling(true);
      const { data } = await api.put(`/orders/${id}/cancel`, {
        reason: 'Cancelled by customer',
      });
      if (data.success) {
        toast.success('Order has been cancelled.');
        setOrder(data.order);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not cancel order');
    } finally {
      setCancelling(false);
    }
  };

  if (loading && !order) {
    return (
      <div className="min-h-screen pt-36 pb-24 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-neon-pink border-t-transparent rounded-full animate-spin shadow-glow-pink"></div>
          <p className="text-midnight-300 font-mono text-xs uppercase tracking-widest">
            Synchronizing Live Telemetry Stream...
          </p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="pt-36 pb-24 max-w-lg mx-auto text-center px-4">
        <div className="cyber-card p-8 space-y-4 border-white/10">
          <AlertCircle size={40} className="text-neon-pink mx-auto" />
          <h2 className="text-xl font-bold font-display text-white">Order Record Not Found</h2>
          <p className="text-midnight-300 text-xs font-sans">
            We couldn't locate this order in our dispatch database.
          </p>
          <Link to="/dashboard" className="btn-primary !py-2.5 text-xs font-mono uppercase shadow-glow-pink">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const canCancel = order.orderStatus === 'Order Received';

  return (
    <div className="pt-32 pb-28 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-fade-in">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between font-mono text-xs">
        <Link
          to="/dashboard"
          className="text-midnight-300 hover:text-white flex items-center gap-1.5 transition-colors uppercase font-bold"
        >
          <ChevronLeft size={16} />
          <span>Back to Ledger</span>
        </Link>

        <button
          onClick={fetchOrder}
          className="hud-pill hover:border-veloce-400 hover:text-white text-[11px]"
          title="Refresh Telemetry Stream"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          <span>Sync Stream</span>
        </button>
      </div>

      {/* Order Banner */}
      <div className="cyber-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-veloce-500/30">
        <div>
          <span className="text-xs font-mono font-bold text-amber-electric uppercase tracking-widest block mb-1">
            Real-Time HUD Telemetry
          </span>
          <h1 className="text-2xl sm:text-3xl font-display font-black text-white">
            Dispatch #{order.orderNumber}
          </h1>
          <p className="text-xs font-mono text-midnight-400 mt-1">
            Placed on {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="badge-info text-xs px-3 py-1 font-mono font-bold">
            Status: {order.orderStatus}
          </span>
          {canCancel && (
            <button
              onClick={handleCancelOrder}
              disabled={cancelling}
              className="px-3.5 py-1.5 rounded-xl border border-neon-pink/40 text-neon-pink hover:bg-neon-pink/15 text-xs font-mono uppercase font-bold transition-all"
            >
              Cancel Order
            </button>
          )}
        </div>
      </div>

      {/* Visual Progress Tracker (Socket.IO Real-time Enabled) */}
      <OrderTracker
        orderStatus={order.orderStatus}
        statusHistory={order.statusHistory}
      />

      {/* Main Grid: Items on Left, Delivery and Payment on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Items Breakdown */}
        <div className="lg:col-span-8 space-y-6">
          <div className="cyber-card p-6 space-y-4 border-white/10">
            <h3 className="font-display font-black text-base text-white border-b border-white/10 pb-3">
              Artisan Items in Dispatch ({order.items?.length})
            </h3>

            <div className="space-y-3">
              {order.items?.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-midnight-950/70 border border-white/10 space-y-2 font-mono"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-sm text-white font-sans">
                        {item.quantity}x {item.name}
                      </h4>
                      <span className="badge-warning text-[10px] mt-1">{item.size || 'Medium'}</span>
                    </div>
                    <span className="font-display font-black text-white text-base">
                      ₹{item.subtotal || item.itemPrice * item.quantity}
                    </span>
                  </div>

                  <div className="text-xs text-midnight-300 space-y-0.5 pt-1 border-t border-white/5">
                    {item.base && <div><strong className="text-white">Crust:</strong> {item.base.name}</div>}
                    {item.sauce && <div><strong className="text-white">Sauce:</strong> {item.sauce.name}</div>}
                    {item.cheese && <div><strong className="text-white">Cheese:</strong> {item.cheese.name}</div>}
                    {item.veggies?.length > 0 && (
                      <div>
                        <strong className="text-white">Toppings:</strong>{' '}
                        {item.veggies.map(v => v.name).join(', ')}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline History */}
          <div className="cyber-card p-6 space-y-4 border-white/10">
            <h3 className="font-display font-black text-base text-white border-b border-white/10 pb-3">
              Dispatch Telemetry Log
            </h3>
            <div className="space-y-4 font-mono">
              {order.statusHistory?.map((h, i) => (
                <div key={i} className="flex gap-3 text-xs">
                  <div className="w-2.5 h-2.5 rounded-full bg-neon-pink mt-1 shrink-0 shadow-glow-pink"></div>
                  <div>
                    <p className="font-bold text-white uppercase">{h.status}</p>
                    <p className="text-midnight-300 text-[11px] mt-0.5 font-sans">{h.note}</p>
                    <p className="text-midnight-400 text-[10px] mt-0.5">
                      {new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} •{' '}
                      {new Date(h.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Address and Payment */}
        <div className="lg:col-span-4 space-y-6">
          {/* Destination */}
          <div className="cyber-card p-6 space-y-3 border-white/10 font-sans">
            <h4 className="font-display font-black text-sm text-white flex items-center gap-2 border-b border-white/10 pb-3">
              <MapPin size={16} className="text-neon-pink" />
              <span>Destination Coordinates</span>
            </h4>
            <div className="text-xs space-y-1.5 text-midnight-300">
              <p className="font-bold text-white font-mono">{order.deliveryAddress?.fullName}</p>
              <p>{order.deliveryAddress?.street}</p>
              <p>{order.deliveryAddress?.city} - {order.deliveryAddress?.postalCode}</p>
              <p className="text-amber-electric pt-1 font-mono">📞 {order.deliveryAddress?.phone}</p>
              {order.deliveryAddress?.notes && (
                <p className="text-[11px] text-midnight-400 italic mt-2 p-2 bg-midnight-950 rounded-lg border border-white/10">
                  "{order.deliveryAddress.notes}"
                </p>
              )}
            </div>
          </div>

          {/* Pricing Receipt */}
          <div className="cyber-card p-6 space-y-3 border-veloce-500/30 font-mono">
            <h4 className="font-display font-black text-sm text-white flex items-center gap-2 border-b border-white/10 pb-3">
              <CreditCard size={16} className="text-amber-electric" />
              <span>Payment Ledger</span>
            </h4>
            <div className="space-y-2 text-xs border-b border-white/10 pb-3">
              <div className="flex justify-between text-midnight-300">
                <span>Status</span>
                <span className="badge-success text-[10px]">{order.paymentStatus}</span>
              </div>
              <div className="flex justify-between text-midnight-300">
                <span>Subtotal</span>
                <span className="text-white">₹{order.pricing?.subtotal}</span>
              </div>
              <div className="flex justify-between text-midnight-300">
                <span>GST (5%)</span>
                <span className="text-white">₹{order.pricing?.tax}</span>
              </div>
              <div className="flex justify-between text-midnight-300">
                <span>Express Delivery</span>
                <span className="text-emerald-400 font-bold">
                  {order.pricing?.deliveryFee === 0 ? 'FREE' : `₹${order.pricing?.deliveryFee}`}
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center text-sm font-bold text-white pt-1">
              <span>Total Settled</span>
              <span className="text-2xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-electric to-white">
                ₹{order.pricing?.total}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
