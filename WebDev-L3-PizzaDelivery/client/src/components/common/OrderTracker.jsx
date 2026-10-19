import { CheckCircle2, Clock, ChefHat, Bike, PackageCheck, XCircle, ShieldCheck, Zap } from 'lucide-react';

const STEPS = [
  { key: 'Order Received', label: 'Order Received', icon: Clock, desc: 'Verified by central dispatch' },
  { key: 'In Kitchen', label: 'In Kitchen', icon: ChefHat, desc: 'Stone kiln fired at 480°C' },
  { key: 'Sent to Delivery', label: 'Out for Delivery', icon: Bike, desc: 'Thermal pouch courier in transit' },
  { key: 'Delivered', label: 'Delivered Hot', icon: PackageCheck, desc: 'Dispatched to customer' },
];

export default function OrderTracker({ orderStatus, statusHistory = [] }) {
  const isCancelled = orderStatus === 'Cancelled';
  const isFailed = orderStatus === 'Payment Failed';

  if (isCancelled || isFailed) {
    return (
      <div className="cyber-card p-6 border-neon-pink/40 text-center bg-midnight-950/80">
        <XCircle className="w-12 h-12 text-neon-pink mx-auto mb-2 animate-bounce-gentle" />
        <h4 className="font-display font-black text-lg text-neon-pink">
          Order {orderStatus}
        </h4>
        <p className="text-midnight-300 text-xs font-sans mt-1">
          {isCancelled
            ? 'This dispatch was cancelled. Any pre-authorized charges will automatically reverse to your source payment method.'
            : 'Payment verification failed with Razorpay gateway.'}
        </p>
      </div>
    );
  }

  const currentStepIndex = STEPS.findIndex((s) => s.key === orderStatus);
  const activeIndex = currentStepIndex !== -1 ? currentStepIndex : 0;

  const getStepTimestamp = (stepKey) => {
    const entry = statusHistory.find((h) => h.status === stepKey);
    if (!entry) return null;
    return new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="cyber-card p-6 md:p-8 space-y-6 border-veloce-500/30">
      {/* Top telemetry status pill */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-pink opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-neon-pink"></span>
          </span>
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">
            Live Telemetry Tracker
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="hud-pill !py-1 text-[11px] border-emerald-500/30 text-emerald-400">
            <ShieldCheck size={12} /> WebSocket Synchronized
          </span>
        </div>
      </div>

      <div className="relative pt-2">
        {/* Track Line for Desktop */}
        <div className="hidden md:block absolute top-1/2 left-10 right-10 h-1.5 bg-midnight-950/90 rounded-full -translate-y-6 z-0 border border-white/5">
          <div
            className="h-full bg-gradient-to-r from-neon-pink via-veloce-500 to-amber-electric rounded-full transition-all duration-700 ease-out shadow-glow-pink"
            style={{ width: `${(activeIndex / (STEPS.length - 1)) * 100}%` }}
          ></div>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isCompleted = idx < activeIndex;
            const isCurrent = idx === activeIndex;
            const time = getStepTimestamp(step.key);

            return (
              <div
                key={step.key}
                className={`flex md:flex-col items-center md:text-center gap-4 md:gap-3 transition-all duration-300 ${
                  isCurrent
                    ? 'opacity-100 scale-105'
                    : isCompleted
                    ? 'opacity-90'
                    : 'opacity-40'
                }`}
              >
                {/* Circle Icon */}
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg transition-all duration-300 ${
                    isCompleted
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-glow-cyan'
                      : isCurrent
                      ? 'bg-gradient-to-tr from-neon-pink via-veloce-600 to-amber-electric text-white ring-4 ring-veloce-500/30 shadow-glow-pink animate-pulse-glow'
                      : 'bg-midnight-950 text-midnight-400 border border-white/10'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 size={26} /> : <Icon size={24} />}
                </div>

                {/* Text Info */}
                <div>
                  <h4 className="font-display font-extrabold text-sm text-white flex items-center md:justify-center gap-1.5">
                    {step.label}
                    {isCurrent && (
                      <span className="inline-block w-2 h-2 rounded-full bg-amber-electric animate-ping"></span>
                    )}
                  </h4>
                  <p className="text-[11px] text-midnight-300 mt-0.5 font-sans">{step.desc}</p>
                  {time && (
                    <span className="inline-block mt-1.5 text-[10px] font-mono font-bold text-amber-electric bg-midnight-950/80 border border-amber-electric/30 px-2.5 py-0.5 rounded-md">
                      ⏱ {time}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
