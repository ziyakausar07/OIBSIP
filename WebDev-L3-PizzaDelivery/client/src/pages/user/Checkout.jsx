import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import RazorpayModal from '../../components/common/RazorpayModal';
import {
  ShieldCheck,
  CreditCard,
  MapPin,
  Phone,
  User,
  Building,
  CheckCircle2,
  Lock,
  AlertTriangle,
  ArrowRight,
  Zap
} from 'lucide-react';

export default function Checkout() {
  const { items, clearCart, getSubtotal, getTax, getDeliveryFee, getTotal } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [razorpayModalOpen, setRazorpayModalOpen] = useState(false);
  const [razorpayOrderData, setRazorpayOrderData] = useState(null);
  const [address, setAddress] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    street: '',
    city: 'Mumbai',
    postalCode: '400001',
    notes: '',
  });

  const subtotal = getSubtotal();
  const tax = getTax();
  const deliveryFee = getDeliveryFee();
  const total = getTotal();

  const handleChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const handlePayment = async (e) => {
    e.preventDefault();

    if (!items || items.length === 0) {
      toast.error('Your cart is empty');
      navigate('/menu');
      return;
    }

    if (!address.fullName || !address.phone || !address.street || !address.city) {
      toast.error('Please fill in all required delivery destination fields');
      return;
    }

    setLoading(true);

    try {
      // 1. Request Razorpay order creation from backend
      const { data: createData } = await api.post('/payments/create-order', {
        items,
        deliveryAddress: address,
      });

      if (!createData.success) {
        toast.error(createData.message || 'Failed to initiate checkout');
        setLoading(false);
        return;
      }

      const { orderId, orderNumber, razorpayOrderId, amount, keyId, customer } = createData;

      // 2. Setup Razorpay options
      const options = {
        key: keyId,
        amount: amount,
        currency: 'INR',
        name: 'VELOCE PIZZERIA',
        description: `Dispatch Order #${orderNumber}`,
        image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=200&q=80',
        order_id: razorpayOrderId.startsWith('rzp_test_sim') ? undefined : razorpayOrderId,
        prefill: {
          name: customer.name,
          email: customer.email,
          contact: customer.phone,
        },
        theme: {
          color: '#8B5CF6',
        },
        handler: async function (response) {
          try {
            toast.loading('Verifying cryptographic signature with banking node...', { id: 'verify-toast' });
            const { data: verifyData } = await api.post('/payments/verify', {
              orderId,
              razorpay_order_id: response.razorpay_order_id || razorpayOrderId,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyData.success) {
              toast.success('Payment verified! Order sent to stone kiln.', { id: 'verify-toast' });
              clearCart();
              navigate(`/order-confirmation/${orderId}`);
            } else {
              toast.error(verifyData.message || 'Payment verification failed', { id: 'verify-toast' });
            }
          } catch (vErr) {
            toast.error(vErr.response?.data?.message || 'Server verification failed', { id: 'verify-toast' });
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: function () {
            toast.error('Payment cancelled by user.');
            setLoading(false);
          },
        },
      };

      const isPlaceholderKey = !keyId || keyId.includes('placeholder') || keyId.includes('demo');

      if (window.Razorpay && !isPlaceholderKey) {
        try {
          const rzp = new window.Razorpay(options);
          rzp.on('payment.failed', function (response) {
            toast.error(`Payment failed: ${response.error.description || 'Unknown error'}`);
            setLoading(false);
          });
          rzp.open();
        } catch (sdkErr) {
          console.warn('Razorpay SDK failed to open, falling back to modal:', sdkErr);
          setRazorpayOrderData(createData);
          setRazorpayModalOpen(true);
          setLoading(false);
        }
      } else {
        // Open realistic interactive Razorpay Test Modal
        setRazorpayOrderData(createData);
        setRazorpayModalOpen(true);
        setLoading(false);
      }
    } catch (err) {
      console.error('Checkout error:', err);
      toast.error(err.response?.data?.message || 'An error occurred during checkout');
      setLoading(false);
    }
  };

  const handleRazorpayVerifySuccess = async (response) => {
    try {
      setLoading(true);
      toast.loading('Verifying cryptographic signature with banking node...', { id: 'verify-toast' });
      const { data: verifyData } = await api.post('/payments/verify', {
        orderId: razorpayOrderData.orderId,
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature,
      });

      if (verifyData.success) {
        toast.success('Payment verified! Stock automatically decremented.', { id: 'verify-toast' });
        setRazorpayModalOpen(false);
        clearCart();
        navigate(`/order-confirmation/${razorpayOrderData.orderId}`);
      } else {
        toast.error(verifyData.message || 'Payment verification failed', { id: 'verify-toast' });
      }
    } catch (vErr) {
      toast.error(vErr.response?.data?.message || 'Server verification failed', { id: 'verify-toast' });
    } finally {
      setLoading(false);
    }
  };

  const handleRazorpayFailure = (errMsg) => {
    toast.error(errMsg || 'Payment failed or cancelled.');
    setRazorpayModalOpen(false);
    setLoading(false);
  };

  return (
    <div className="pt-32 pb-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-fade-in">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full bg-neon-pink animate-pulse"></span>
          <span className="text-[11px] font-mono font-bold text-amber-electric uppercase tracking-widest">
            Dispatch Finalization
          </span>
        </div>
        <h1 className="text-3xl font-display font-black text-white">Checkout & Delivery</h1>
        <p className="text-midnight-300 text-xs sm:text-sm font-sans mt-0.5">
          Provide your delivery coordinates and confirm payment via Razorpay Test Sandbox.
        </p>
      </div>

      <form onSubmit={handlePayment} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form: Delivery Address (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="cyber-card p-6 sm:p-8 space-y-6 border-veloce-500/30">
            <h3 className="font-display font-black text-lg text-white flex items-center gap-2 border-b border-white/10 pb-3">
              <MapPin size={18} className="text-neon-pink" />
              <span>1. Delivery Destination Coordinates</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-mono text-midnight-300 block mb-1.5 uppercase">
                  Full Name *
                </label>
                <div className="relative">
                  <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-midnight-400" />
                  <input
                    type="text"
                    name="fullName"
                    required
                    value={address.fullName}
                    onChange={handleChange}
                    placeholder="Marco Rossi"
                    className="input-field pl-10 text-xs font-sans"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-mono text-midnight-300 block mb-1.5 uppercase">
                  Direct Phone *
                </label>
                <div className="relative">
                  <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-midnight-400" />
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={address.phone}
                    onChange={handleChange}
                    placeholder="+91 98765 43210"
                    className="input-field pl-10 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-mono text-midnight-300 block mb-1.5 uppercase">
                  Street Address & Apartment / Unit *
                </label>
                <input
                  type="text"
                  name="street"
                  required
                  value={address.street}
                  onChange={handleChange}
                  placeholder="Unit 402, Cyber Tower, Sector 5"
                  className="input-field text-xs font-sans"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-midnight-300 block mb-1.5 uppercase">
                  City *
                </label>
                <div className="relative">
                  <Building size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-midnight-400" />
                  <input
                    type="text"
                    name="city"
                    required
                    value={address.city}
                    onChange={handleChange}
                    className="input-field pl-10 text-xs font-sans"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-mono text-midnight-300 block mb-1.5 uppercase">
                  Postal Pin Code *
                </label>
                <input
                  type="text"
                  name="postalCode"
                  required
                  value={address.postalCode}
                  onChange={handleChange}
                  className="input-field text-xs font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-mono text-midnight-300 block mb-1.5 uppercase">
                  Courier Access Notes (Optional)
                </label>
                <input
                  type="text"
                  name="notes"
                  value={address.notes}
                  onChange={handleChange}
                  placeholder="e.g. Leave with security desk, ring door chime"
                  className="input-field text-xs font-sans"
                />
              </div>
            </div>
          </div>

          {/* Payment gateway card */}
          <div className="cyber-card p-6 sm:p-8 space-y-4 border-white/10">
            <h3 className="font-display font-black text-lg text-white flex items-center gap-2 border-b border-white/10 pb-3">
              <CreditCard size={18} className="text-amber-electric" />
              <span>2. Payment Engine Gateway</span>
            </h3>

            <div className="p-4 rounded-2xl border border-veloce-500/30 bg-veloce-950/40 flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <span className="text-3xl">💳</span>
                <div>
                  <h4 className="text-sm font-bold text-white font-display">Razorpay Verified Test Gateway</h4>
                  <p className="text-xs text-midnight-300 font-sans">
                    Simulated UPI, Cards, and NetBanking with instant cryptographic HMAC-SHA256 signature verification.
                  </p>
                </div>
              </div>
              <span className="badge-warning text-xs font-mono font-bold">TEST MODE</span>
            </div>

            <p className="text-xs text-midnight-400 font-sans leading-relaxed flex items-center gap-1.5">
              <Lock size={12} className="text-emerald-400 shrink-0" />
              Ingredient stock is automatically decremented upon payment confirmation.
            </p>
          </div>
        </div>

        {/* Right Summary (4 cols) */}
        <div className="lg:col-span-4 sticky top-24 space-y-6">
          <div className="cyber-card p-6 space-y-5 border-veloce-500/30">
            <h3 className="font-display font-black text-base text-white border-b border-white/10 pb-3">
              Order Review
            </h3>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.cartId} className="flex justify-between items-start text-xs border-b border-white/5 pb-2 font-mono">
                  <div>
                    <p className="font-bold text-white font-sans">
                      {item.quantity}x {item.name}
                    </p>
                    <p className="text-midnight-400 text-[10px]">
                      {item.base?.name} • {item.size || 'Medium'}
                    </p>
                  </div>
                  <span className="font-bold text-white">
                    ₹{item.itemPrice * item.quantity}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-2 text-xs font-mono border-b border-white/10 pb-4">
              <div className="flex justify-between text-midnight-300">
                <span>Subtotal</span>
                <span className="text-white">₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-midnight-300">
                <span>GST (5%)</span>
                <span className="text-white">₹{tax}</span>
              </div>
              <div className="flex justify-between text-midnight-300">
                <span>Express Kiln Delivery</span>
                <span className="text-emerald-400 font-bold">{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</span>
              </div>
            </div>

            <div className="flex justify-between items-center text-lg font-display font-black text-white">
              <span>Total Payable</span>
              <span className="text-3xl text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-electric to-white">
                ₹{total}
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full !py-3.5 flex items-center justify-center gap-2 font-mono text-xs uppercase tracking-wider shadow-glow-pink font-bold"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Authorizing Payment...</span>
                </>
              ) : (
                <>
                  <Lock size={15} />
                  <span>Pay ₹{total} via Razorpay ⚡</span>
                </>
              )}
            </button>

            <Link
              to="/cart"
              className="block text-center text-xs font-mono text-midnight-400 hover:text-white transition-colors"
            >
              ← Edit Cart Items
            </Link>
          </div>
        </div>
      </form>

      <RazorpayModal
        isOpen={razorpayModalOpen}
        orderData={razorpayOrderData}
        onClose={() => setRazorpayModalOpen(false)}
        onSuccess={handleRazorpayVerifySuccess}
        onFailure={handleRazorpayFailure}
      />
    </div>
  );
}
