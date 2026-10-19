import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldCheck, 
  QrCode, 
  CreditCard, 
  Landmark, 
  Wallet, 
  Lock, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  Sparkles,
  Smartphone
} from 'lucide-react';

export default function RazorpayModal({
  isOpen,
  onClose,
  orderData,
  onSuccess,
  onFailure,
}) {
  const [activeTab, setActiveTab] = useState('upi');
  const [status, setStatus] = useState('idle'); // idle | processing | success | failed
  const [selectedUpiApp, setSelectedUpiApp] = useState('gpay');
  const [cardNumber, setCardNumber] = useState('4111 2222 3333 4444');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('888');
  const [selectedBank, setSelectedBank] = useState('HDFC');

  useEffect(() => {
    if (isOpen) {
      setStatus('idle');
    }
  }, [isOpen]);

  if (!isOpen || !orderData) return null;

  const { amount = 0, orderNumber = '', razorpayOrderId = '', customer = {} } = orderData;
  const displayAmount = orderData.pricing?.total ? Number(orderData.pricing.total).toFixed(2) : (amount >= 100 ? (amount / 100).toFixed(2) : Number(amount).toFixed(2));

  const handlePaySuccess = () => {
    setStatus('processing');
    setTimeout(() => {
      setStatus('success');
      setTimeout(() => {
        const simulatedPaymentId = `pay_rzp_test_${Date.now()}`;
        onSuccess({
          razorpay_order_id: razorpayOrderId,
          razorpay_payment_id: simulatedPaymentId,
          razorpay_signature: 'test_mode_sandbox_signature',
        });
      }, 1000);
    }, 1400);
  };

  const handlePayFailure = () => {
    setStatus('processing');
    setTimeout(() => {
      setStatus('failed');
      setTimeout(() => {
        onFailure('Bank declined simulated transaction (Test Mode)');
      }, 1200);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-midnight-950/85 backdrop-blur-md animate-fade-in">
      <div 
        className="w-full max-w-xl bg-midnight-900 border border-purple-500/30 rounded-2xl shadow-2xl shadow-purple-950/80 overflow-hidden flex flex-col animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header: Razorpay Brand & Test Mode indicator */}
        <div className="bg-gradient-to-r from-midnight-950 via-midnight-900 to-midnight-950 border-b border-purple-500/20 px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-sm shadow-md shadow-blue-500/30">
              R
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-white tracking-wide flex items-center gap-1.5">
                Razorpay <span className="text-[10px] text-blue-400 font-semibold">Gateway</span>
              </span>
              <span className="text-[10px] text-nocturne-muted flex items-center gap-1">
                <ShieldCheck size={11} className="text-emerald-400" />
                Verified Merchant
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse">
              Sandbox Test Mode
            </span>
            <button
              onClick={onClose}
              disabled={status === 'processing' || status === 'success'}
              className="p-1 rounded-lg text-nocturne-muted hover:text-white hover:bg-white/10 transition-colors disabled:opacity-40"
              title="Close payment window"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Merchant Summary Bar */}
        <div className="bg-midnight-950/70 px-6 py-4 flex items-center justify-between border-b border-purple-500/15">
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">VELZINO — Bites & Beats</h3>
            <p className="text-[11px] text-nocturne-muted">Order #{orderNumber || '1001'} • Artisan Dispatch</p>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-nocturne-muted uppercase tracking-wider block">Total Amount</span>
            <span className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-nocturne-lavender to-purple-300 font-display">
              ₹{displayAmount}
            </span>
          </div>
        </div>

        {/* Modal Body / Status States */}
        {status === 'processing' ? (
          <div className="py-14 px-6 flex flex-col items-center justify-center text-center space-y-4">
            <div className="relative w-16 h-16 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-purple-500/20 border-t-veloce-500 animate-spin" />
              <Lock size={22} className="text-veloce-400" />
            </div>
            <div>
              <h4 className="text-base font-semibold text-white">Contacting Banking Node...</h4>
              <p className="text-xs text-nocturne-muted mt-1">
                Simulating cryptographic handshake with Razorpay sandbox
              </p>
            </div>
          </div>
        ) : status === 'success' ? (
          <div className="py-14 px-6 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 animate-scale-in">
              <CheckCircle2 size={36} />
            </div>
            <div>
              <h4 className="text-base font-bold text-white">Payment Authorized!</h4>
              <p className="text-xs text-emerald-300 mt-1">
                Ref ID: pay_rzp_test_{Date.now().toString().slice(-6)}
              </p>
              <p className="text-[11px] text-nocturne-muted mt-2">
                Returning you to VELZINO kitchen dispatch...
              </p>
            </div>
          </div>
        ) : status === 'failed' ? (
          <div className="py-12 px-6 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 animate-scale-in">
              <AlertCircle size={36} />
            </div>
            <div>
              <h4 className="text-base font-bold text-white">Payment Declined</h4>
              <p className="text-xs text-rose-300 mt-1">
                Test transaction rejected as requested.
              </p>
            </div>
            <button
              onClick={() => setStatus('idle')}
              className="px-4 py-2 rounded-xl text-xs bg-midnight-800 text-white border border-purple-500/30 hover:bg-midnight-750"
            >
              Try Again
            </button>
          </div>
        ) : (
          /* Normal Payment Selection View */
          <div className="grid grid-cols-1 md:grid-cols-12 min-h-[320px]">
            {/* Sidebar Method Selector */}
            <div className="md:col-span-5 bg-midnight-950/50 p-3 border-r border-purple-500/15 flex flex-row md:flex-col gap-1.5 overflow-x-auto">
              <button
                onClick={() => setActiveTab('upi')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  activeTab === 'upi'
                    ? 'bg-veloce-600/30 text-white border border-veloce-500/40 shadow-sm'
                    : 'text-nocturne-lavender/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <Smartphone size={16} className={activeTab === 'upi' ? 'text-nocturne-pink' : ''} />
                <div className="text-left">
                  <div className="font-semibold">UPI & QR</div>
                  <div className="text-[10px] text-nocturne-muted hidden sm:block">GPay, PhonePe, Paytm</div>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('card')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  activeTab === 'card'
                    ? 'bg-veloce-600/30 text-white border border-veloce-500/40 shadow-sm'
                    : 'text-nocturne-lavender/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <CreditCard size={16} className={activeTab === 'card' ? 'text-nocturne-pink' : ''} />
                <div className="text-left">
                  <div className="font-semibold">Cards</div>
                  <div className="text-[10px] text-nocturne-muted hidden sm:block">Visa, Mastercard, RuPay</div>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('netbanking')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  activeTab === 'netbanking'
                    ? 'bg-veloce-600/30 text-white border border-veloce-500/40 shadow-sm'
                    : 'text-nocturne-lavender/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <Landmark size={16} className={activeTab === 'netbanking' ? 'text-nocturne-pink' : ''} />
                <div className="text-left">
                  <div className="font-semibold">Netbanking</div>
                  <div className="text-[10px] text-nocturne-muted hidden sm:block">HDFC, ICICI, SBI</div>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('wallet')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  activeTab === 'wallet'
                    ? 'bg-veloce-600/30 text-white border border-veloce-500/40 shadow-sm'
                    : 'text-nocturne-lavender/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <Wallet size={16} className={activeTab === 'wallet' ? 'text-nocturne-pink' : ''} />
                <div className="text-left">
                  <div className="font-semibold">Wallets</div>
                  <div className="text-[10px] text-nocturne-muted hidden sm:block">Amazon Pay, Paytm</div>
                </div>
              </button>
            </div>

            {/* Right Pane: Selected Method Details */}
            <div className="md:col-span-7 p-5 flex flex-col justify-between">
              {activeTab === 'upi' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white">Select Test UPI App:</span>
                    <span className="text-[10px] text-emerald-400 font-mono">100% Instant</span>
                  </div>

                  {/* UPI App selector chips */}
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'gpay', label: 'Google Pay', icon: '🟢' },
                      { id: 'phonepe', label: 'PhonePe', icon: '🟣' },
                      { id: 'paytm', label: 'Paytm UPI', icon: '🔵' },
                    ].map((app) => (
                      <button
                        key={app.id}
                        onClick={() => setSelectedUpiApp(app.id)}
                        className={`p-2.5 rounded-xl border text-center transition-all ${
                          selectedUpiApp === app.id
                            ? 'bg-purple-500/20 border-purple-400 text-white shadow-sm'
                            : 'bg-midnight-950 border-purple-500/20 text-nocturne-lavender/80 hover:border-purple-400/40'
                        }`}
                      >
                        <div className="text-lg">{app.icon}</div>
                        <div className="text-[11px] font-medium mt-1">{app.label}</div>
                      </button>
                    ))}
                  </div>

                  {/* Realistic Mock QR Code */}
                  <div className="p-3 bg-midnight-950/80 rounded-xl border border-purple-500/20 flex items-center gap-3">
                    <div className="w-14 h-14 bg-white p-1 rounded-lg flex items-center justify-center shrink-0">
                      <QrCode size={46} className="text-midnight-950" />
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-white">Scan & Pay via UPI App</p>
                      <p className="text-[10px] text-nocturne-muted mt-0.5">
                        UPI ID: <span className="text-purple-300 font-mono">velzino.craft@razorpay</span>
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'card' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white">Test Card Details:</span>
                    <span className="text-[10px] text-amber-300">Auto-filled</span>
                  </div>

                  <div>
                    <label className="text-[10px] text-nocturne-muted uppercase tracking-wider block mb-1">
                      Card Number
                    </label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full bg-midnight-950 border border-purple-500/25 rounded-xl px-3 py-2 text-xs text-white font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-nocturne-muted uppercase tracking-wider block mb-1">
                        Expiry
                      </label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full bg-midnight-950 border border-purple-500/25 rounded-xl px-3 py-2 text-xs text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-nocturne-muted uppercase tracking-wider block mb-1">
                        CVV
                      </label>
                      <input
                        type="text"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        className="w-full bg-midnight-950 border border-purple-500/25 rounded-xl px-3 py-2 text-xs text-white font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'netbanking' && (
                <div className="space-y-3">
                  <span className="text-xs font-semibold text-white block">Select Popular Bank:</span>
                  <div className="grid grid-cols-2 gap-2">
                    {['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank'].map((b) => (
                      <button
                        key={b}
                        onClick={() => setSelectedBank(b)}
                        className={`p-2 rounded-xl text-xs font-medium border text-left transition-all ${
                          selectedBank === b
                            ? 'bg-purple-500/20 border-purple-400 text-white'
                            : 'bg-midnight-950 border-purple-500/20 text-nocturne-muted hover:text-white'
                        }`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'wallet' && (
                <div className="space-y-3">
                  <span className="text-xs font-semibold text-white block">Select Test Wallet:</span>
                  <div className="grid grid-cols-2 gap-2">
                    {['Amazon Pay', 'Paytm Wallet', 'MobiKwik', 'Freecharge'].map((w) => (
                      <div
                        key={w}
                        className="p-3 bg-midnight-950 border border-purple-500/20 rounded-xl text-xs font-medium text-white flex items-center gap-2 cursor-pointer hover:border-purple-400/40"
                      >
                        <Wallet size={14} className="text-nocturne-pink" />
                        <span>{w}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons in bottom */}
              <div className="pt-4 border-t border-purple-500/15 mt-4 space-y-2">
                <button
                  onClick={handlePaySuccess}
                  id="razorpay-simulate-pay-btn"
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                >
                  <Lock size={14} />
                  <span>Pay ₹{displayAmount} (Simulate Success)</span>
                  <ArrowRight size={14} />
                </button>

                <div className="flex items-center justify-between text-[10px] text-nocturne-muted px-1">
                  <button
                    onClick={handlePayFailure}
                    className="hover:text-rose-400 transition-colors underline"
                  >
                    Simulate Payment Failure
                  </button>
                  <span className="flex items-center gap-1">
                    <Lock size={10} className="text-emerald-400" /> 256-bit SSL Secure
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="bg-midnight-950 px-5 py-2.5 border-t border-purple-500/15 flex items-center justify-between text-[10px] text-nocturne-muted">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span>Razorpay Secure Checkout</span>
          </div>
          <span>Demo Sandbox Node Active</span>
        </div>
      </div>
    </div>
  );
}
