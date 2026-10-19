import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Layers, Bell, ExternalLink, Shield, Cpu } from 'lucide-react';

export default function AdminNav() {
  const location = useLocation();

  const links = [
    { to: '/admin', label: 'Command HUD', icon: LayoutDashboard },
    { to: '/admin/orders', label: 'Order Dispatch', icon: ShoppingCart },
    { to: '/admin/inventory', label: 'Ingredient Stock', icon: Layers },
    { to: '/admin/notifications', label: 'Cron Logs', icon: Bell },
  ];

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5 mb-8">
      {/* Brand & Mode Tag */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-veloce-600/30 text-veloce-300 flex items-center justify-center border border-veloce-500/40">
          <Shield size={16} />
        </div>
        <div className="hidden sm:block">
          <h2 className="font-display font-extrabold text-sm text-white">
            KITCHEN COMMAND CENTER
          </h2>
          <p className="text-[10px] font-mono text-midnight-400">
            VELOCE Automated Operations HUD
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none bg-midnight-950/80 p-1 rounded-xl border border-white/10">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.to;

          return (
            <Link
              key={link.to}
              to={link.to}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-mono font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-neon-pink to-veloce-600 text-white shadow-glow-pink'
                  : 'text-midnight-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon size={14} />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Storefront button */}
      <Link
        to="/"
        target="_blank"
        className="hud-pill hover:border-veloce-400 hover:text-white transition-all text-[11px]"
      >
        <span>Public Storefront</span>
        <ExternalLink size={12} className="text-neon-pink" />
      </Link>
    </div>
  );
}
