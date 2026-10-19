import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import confetti from 'canvas-confetti';
import { CheckCircle2, PackageCheck, MapPin, ArrowRight, Home, Clock, Zap } from 'lucide-react';

export default function OrderConfirmation() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#FF0055', '#8B5CF6', '#FFB800'],
      });
    } catch (e) {
      // Ignore
    }

    const fetchOrder = async () => {
      try {
        const { data } = await api.get(`/orders/${id}`);
        if (data.success) {
          setOrder(data.order);
        }
      } catch (err) {
        console.error('Failed to load order:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen pt-36 pb-24 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-neon-pink border-t-transparent rounded-full animate-spin shadow-glow-pink"></div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-28 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-fade-in">
      {/* Top Banner Card */}
      <div className="cyber-card p-8 sm:p-12 text-center space-y-4 border-veloce-500/40 shadow-glow-violet bg-midnight-900/90">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center mx-auto border border-emerald-500/40 shadow-glow-cyan">
          <CheckCircle2 size={36} />
        </div>

        <span className="badge bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-bold px-3 py-1">
          Cryptographic Payment Settled • Reserves Decremented
        </span>

        <h1 className="text-3xl sm:text-5xl font-display font-black text-white">
          Dispatch Order Confirmed! ⚡🍕
        </h1>

        <p className="text-midnight-300 text-xs sm:text-sm max-w-lg mx-auto font-sans">
          Thank you for choosing VELOCE PIZZERIA! Your recipe has been transmitted to our kitchen and the 480°C stone kiln is firing your crust.
        </p>

        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <Link
            to={`/orders/${id}`}
            className="btn-primary !px-7 !py-3.5 flex items-center gap-2 shadow-glow-pink text-xs font-mono uppercase tracking-wider"
          >
            <Clock size={15} />
            <span>Track Telemetry Live</span>
            <ArrowRight size={15} />
          </Link>

          <Link to="/" className="btn-secondary !px-6 !py-3.5 flex items-center gap-2 text-xs font-mono uppercase">
            <Home size={15} />
            <span>Return to Storefront</span>
          </Link>
        </div>
      </div>

      {/* Order Details Card */}
      {order && (
        <div className="cyber-card p-6 sm:p-8 space-y-6 border-white/10 font-mono">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-4 gap-2">
            <div>
              <p className="text-[10px] text-midnight-400 uppercase tracking-wider">Order Identification</p>
              <h3 className="text-lg font-display font-black text-white">#{order.orderNumber}</h3>
            </div>
            <div className="sm:text-right">
              <p className="text-[10px] text-midnight-400 uppercase tracking-wider">Razorpay Gateway ID</p>
              <span className="text-xs text-amber-electric">{order.razorpayPaymentId || 'Verified Sandbox Signature'}</span>
            </div>
          </div>

          {/* Items Breakdown */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-midnight-300">
              Artisan Items in Kiln
            </h4>
            <div className="space-y-2">
              {order.items?.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs bg-midnight-950/70 p-3.5 rounded-xl border border-white/10">
                  <div>
                    <span className="font-bold text-white font-sans">
                      {item.quantity}x {item.name}
                    </span>
                    <span className="text-[10px] text-midnight-400 block">
                      {item.size} • {item.base?.name} • {item.sauce?.name}
                    </span>
                  </div>
                  <span className="font-display font-black text-white text-sm">
                    ₹{item.subtotal || item.itemPrice * item.quantity}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing & Address */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-white/10">
            <div className="font-sans">
              <h4 className="text-[11px] font-mono font-bold uppercase tracking-wider text-midnight-300 mb-2">
                Destination Coordinates
              </h4>
              <p className="text-xs font-bold text-white font-mono">{order.deliveryAddress?.fullName}</p>
              <p className="text-xs text-midnight-300 mt-0.5">{order.deliveryAddress?.street}</p>
              <p className="text-xs text-midnight-400">
                {order.deliveryAddress?.city} - {order.deliveryAddress?.postalCode}
              </p>
              <p className="text-xs text-amber-electric mt-1 font-mono">📞 {order.deliveryAddress?.phone}</p>
            </div>

            <div className="sm:text-right space-y-1.5 text-xs">
              <h4 className="text-[11px] font-mono font-bold uppercase tracking-wider text-midnight-300 mb-2">
                Settlement Breakdown
              </h4>
              <div className="flex justify-between sm:justify-end gap-6 text-midnight-300">
                <span>Subtotal:</span>
                <span className="text-white">₹{order.pricing?.subtotal}</span>
              </div>
              <div className="flex justify-between sm:justify-end gap-6 text-midnight-300">
                <span>GST (5%):</span>
                <span className="text-white">₹{order.pricing?.tax}</span>
              </div>
              <div className="flex justify-between sm:justify-end gap-6 text-midnight-300">
                <span>Delivery:</span>
                <span className="text-emerald-400 font-bold">{order.pricing?.deliveryFee === 0 ? 'FREE' : `₹${order.pricing?.deliveryFee}`}</span>
              </div>
              <div className="flex justify-between sm:justify-end gap-6 text-sm font-bold text-white pt-2 border-t border-white/10">
                <span>Total Settled:</span>
                <span className="text-xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-electric to-white">
                  ₹{order.pricing?.total}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
