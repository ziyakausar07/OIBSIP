import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ShieldCheck, CreditCard, Smartphone, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Cart() {
  const { items, updateQuantity, removeItem, clearCart, getSubtotal, getTax, getDeliveryFee, getTotal } = useCart();
  const { isAuthenticated, isVerified } = useAuth();
  const navigate = useNavigate();

  const [splitBill, setSplitBill] = useState(false);
  const [splitCount, setSplitCount] = useState(2);
  const [paymentMethod, setPaymentMethod] = useState('UPI');

  const subtotal = getSubtotal();
  const tax = getTax();
  const deliveryFee = getDeliveryFee();
  const total = getTotal();

  const handleProceedToCheckout = () => {
    if (!isAuthenticated) {
      toast.error('Please log in to proceed to checkout');
      navigate('/login', { state: { from: { pathname: '/checkout' } } });
      return;
    }
    if (!isVerified) {
      toast.error('Please verify your email before placing an order');
      navigate('/verify-email');
      return;
    }
    navigate('/checkout');
  };

  if (!items || items.length === 0) {
    return (
      <div className="pt-36 pb-28 max-w-3xl mx-auto px-4 text-center animate-fade-in">
        <div className="cyber-card p-12 md:p-16 space-y-6 border-purple-500/25">
          <div className="w-20 h-20 rounded-full bg-veloce-600/20 text-veloce-200 flex items-center justify-center mx-auto border border-purple-500/30 shadow-glow-violet">
            <ShoppingBag size={36} />
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-white">Your Cart is Empty</h2>
          <p className="text-nocturne-lavender/80 text-xs sm:text-sm max-w-md mx-auto font-sans">
            You haven't added any artisan pizzas to your order yet. Build your custom pizza in the 3D lab or select from our chef specials!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
            <Link to="/menu" className="btn-secondary text-xs">
              Explore Menu
            </Link>
            <Link to="/custom-pizza" className="btn-primary text-xs shadow-glow-violet">
              Open Pizza Lab 🍕
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-fade-in">
      <div className="flex items-center justify-between border-b border-purple-500/20 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-nocturne-pink animate-pulse"></span>
            <span className="text-[11px] font-sans font-medium text-veloce-300 uppercase tracking-wider">
              Velzino Cart
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-white">
            Cart ({items.reduce((s, i) => s + i.quantity, 0)} items)
          </h1>
        </div>
        <button
          onClick={clearCart}
          className="text-xs font-sans text-nocturne-pink hover:text-white flex items-center gap-1.5 transition-colors"
        >
          <Trash2 size={13} />
          <span>Clear Cart</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Items List (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {items.map((item) => (
            <div key={item.cartId} className="cyber-card p-4 sm:p-5 border-purple-500/20 hover:border-purple-400/40 transition-all flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4 w-full sm:w-auto">
                {/* Circular thumbnail */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full shrink-0 overflow-hidden border-2 border-purple-500/25 shadow-lg bg-midnight-950">
                  <img
                    src={item.image || 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=300&q=80'}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-display font-bold text-base text-white">{item.name}</h3>
                    <span className="badge bg-purple-500/20 text-veloce-200 border border-purple-500/30 text-[10px]">
                      {item.size || 'Regular'}
                    </span>
                  </div>

                  {/* Customizations summary */}
                  <div className="flex flex-wrap gap-x-3 text-xs text-nocturne-muted">
                    {item.base && <span>Base: {item.base.name}</span>}
                    {item.sauce && <span>Sauce: {item.sauce.name}</span>}
                    {item.cheese && <span>Cheese: {item.cheese.name}</span>}
                  </div>

                  {item.veggies?.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {item.veggies.map((v, idx) => (
                        <span key={idx} className="badge bg-nocturne-card border border-purple-500/20 text-veloce-200 text-[10px] px-2 py-0.5">
                          {v.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Price and Quantity Controls */}
              <div className="flex items-center justify-between w-full sm:w-auto gap-5 border-t sm:border-0 border-purple-500/15 pt-3 sm:pt-0">
                <div className="text-right">
                  <span className="text-xl font-display font-extrabold text-white">
                    ₹{item.itemPrice * item.quantity}
                  </span>
                  <span className="text-[10px] text-nocturne-muted block">
                    (₹{item.itemPrice} ea)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-midnight-950/80 border border-purple-500/25 rounded-full px-2 py-1">
                    <button
                      onClick={() => updateQuantity(item.cartId, item.quantity - 1)}
                      className="w-5 h-5 rounded-full flex items-center justify-center text-nocturne-lavender hover:text-white transition-all"
                      aria-label="Decrease Quantity"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="w-7 text-center font-bold text-xs text-white">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.cartId, item.quantity + 1)}
                      className="w-5 h-5 rounded-full flex items-center justify-center text-nocturne-lavender hover:text-white transition-all"
                      aria-label="Increase Quantity"
                    >
                      <Plus size={12} />
                    </button>
                  </div>

                  <button
                    onClick={() => removeItem(item.cartId)}
                    className="p-2 text-nocturne-muted hover:text-nocturne-pink transition-colors"
                    title="Remove item"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary & Payment Card (Matching Mockup Phone 3) */}
        <div className="lg:col-span-4 sticky top-24 space-y-4">
          <div className="cyber-card p-6 space-y-5 border-purple-500/25">
            <h3 className="font-display font-bold text-base text-white border-b border-purple-500/20 pb-3 flex items-center justify-between">
              <span>Order Summary</span>
              <span className="badge bg-purple-500/20 text-veloce-200 border border-purple-500/30 text-[10px]">
                Velzino Express
              </span>
            </h3>

            {/* Split Bill Toggle (From Mockup) */}
            <div className="p-3.5 rounded-2xl bg-midnight-950/80 border border-purple-500/20 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-white">Split Bill</p>
                <p className="text-[10px] text-nocturne-muted">Divide with friends</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={splitBill}
                  onChange={(e) => setSplitBill(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-midnight-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-veloce-600 peer-checked:to-nocturne-pink"></div>
              </label>
            </div>

            {splitBill && (
              <div className="p-3 rounded-xl bg-midnight-950/60 border border-purple-500/20 flex items-center justify-between text-xs animate-fade-in">
                <span className="text-nocturne-lavender">Split among:</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSplitCount(Math.max(2, splitCount - 1))}
                    className="w-6 h-6 rounded-full bg-midnight-800 border border-purple-500/20 flex items-center justify-center text-white"
                  >
                    -
                  </button>
                  <span className="font-bold text-white px-1">{splitCount} people</span>
                  <button
                    onClick={() => setSplitCount(splitCount + 1)}
                    className="w-6 h-6 rounded-full bg-midnight-800 border border-purple-500/20 flex items-center justify-center text-white"
                  >
                    +
                  </button>
                </div>
                <span className="font-bold text-nocturne-pink">₹{Math.round(total / splitCount)} each</span>
              </div>
            )}

            {/* Payment Options Selection (From Mockup Phone 3) */}
            <div className="space-y-2">
              <label className="text-xs text-nocturne-lavender font-medium block">Payment Method</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'Card', label: 'Card', icon: CreditCard },
                  { id: 'UPI', label: 'UPI', icon: Smartphone },
                  { id: 'Tap', label: 'Tap to Pay', icon: Zap },
                ].map((pm) => {
                  const Icon = pm.icon;
                  const isSelected = paymentMethod === pm.id;
                  return (
                    <button
                      key={pm.id}
                      type="button"
                      onClick={() => setPaymentMethod(pm.id)}
                      className={`py-2.5 px-2 rounded-xl text-xs font-medium flex flex-col items-center gap-1.5 transition-all border ${
                        isSelected
                          ? 'border-nocturne-pink bg-purple-950/60 text-white shadow-glow-pink'
                          : 'border-purple-500/20 bg-midnight-950/60 text-nocturne-muted hover:text-white hover:border-purple-400/40'
                      }`}
                    >
                      <Icon size={14} className={isSelected ? 'text-nocturne-pink' : 'text-nocturne-muted'} />
                      <span>{pm.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Breakdown costs */}
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-nocturne-muted">
                <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                <span className="font-medium text-white">₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-nocturne-muted">
                <span>GST & Taxes (5%)</span>
                <span className="font-medium text-white">₹{tax}</span>
              </div>
              <div className="flex justify-between text-nocturne-muted">
                <span>Lounge Delivery</span>
                <span className="font-medium text-emerald-400">
                  {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                </span>
              </div>
            </div>

            {/* Total Row */}
            <div className="pt-3 border-t border-purple-500/20 flex justify-between items-baseline">
              <span className="font-display font-bold text-sm text-white">Total</span>
              <span className="text-3xl font-display font-extrabold text-white">
                ₹{total}
              </span>
            </div>

            {/* Confirm and Pay Button (Matching Phone 3 in mockup) */}
            <button
              onClick={handleProceedToCheckout}
              className="btn-primary w-full !py-3.5 !rounded-full flex items-center justify-center gap-2 text-sm font-medium shadow-glow-violet tracking-wide"
            >
              <span>Confirm and Pay</span>
              <ArrowRight size={16} />
            </button>

            <div className="pt-2 flex items-center justify-center gap-1.5 text-[11px] text-nocturne-muted">
              <ShieldCheck size={13} className="text-emerald-400" />
              <span>Razorpay Verified Encrypted Checkout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
