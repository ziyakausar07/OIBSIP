import { Link } from 'react-router-dom';
import { Heart, Mail, Phone, MapPin, Zap, Flame, ShieldCheck, Clock } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-purple-500/20 bg-midnight-950/90 backdrop-blur-2xl relative overflow-hidden">
      {/* Glow ambient background lights */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-veloce-600/15 rounded-full blur-3xl pointer-events-none -translate-y-1/2"></div>
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-nocturne-pink/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-veloce-700 via-veloce-600 to-nocturne-pink flex items-center justify-center shadow-glow-violet">
                <Zap className="w-5 h-5 text-white fill-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-display font-black text-xl text-white tracking-wider">
                  VELZINO
                </span>
                <span className="text-[10px] tracking-[0.2em] font-sans text-nocturne-muted uppercase -mt-0.5">
                  Bites & Beats
                </span>
              </div>
            </div>
            <p className="text-nocturne-muted text-xs leading-relaxed font-sans">
              Artisan wood-stone fired crusts, crafted with 72h cold-fermented sourdough, pure Fior Di Latte, and live order tracking. Late night cravings perfected.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <span className="hud-pill !py-1 text-[11px] border-purple-500/30 text-veloce-200 !rounded-full">
                <ShieldCheck size={12} className="text-emerald-400" /> Hot & Fresh Thermal Delivery
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-bold text-white mb-4 text-xs uppercase tracking-widest text-veloce-300">
              Navigation
            </h4>
            <ul className="space-y-2.5">
              {[
                { to: '/menu', label: 'Bites & Pizzas' },
                { to: '/custom-pizza', label: 'Custom Pizza Lab' },
                { to: '/about', label: 'Lounge & Story' },
                { to: '/contact', label: 'Contact Lounge' },
                { to: '/admin/login', label: 'Staff Command' },
              ].map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    className="text-nocturne-muted text-xs hover:text-white hover:translate-x-1 transition-all inline-block"
                  >
                    → {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-bold text-white mb-4 text-xs uppercase tracking-widest text-nocturne-pink">
              Lounge & Kitchen
            </h4>
            <ul className="space-y-3 text-xs font-sans text-nocturne-muted">
              <li className="flex items-start gap-2.5">
                <MapPin size={15} className="text-nocturne-pink shrink-0 mt-0.5" />
                <span>Sector 4, Culinary Arts Avenue, Mumbai 400051</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone size={15} className="text-veloce-300 shrink-0" />
                <span>+91 98765 43210 (Lounge Hotline)</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail size={15} className="text-veloce-400 shrink-0" />
                <span>hello@velzino.com</span>
              </li>
            </ul>
          </div>

          {/* Hours & Telemetry */}
          <div>
            <h4 className="font-display font-bold text-white mb-4 text-xs uppercase tracking-widest text-veloce-300">
              Operating Hours
            </h4>
            <ul className="space-y-2 text-xs text-nocturne-muted">
              <li className="flex justify-between py-1 border-b border-purple-500/10">
                <span>Mon – Thu</span>
                <span className="text-white font-medium">11:00 AM – Midnight</span>
              </li>
              <li className="flex justify-between py-1 border-b border-purple-500/10">
                <span>Fri – Sat</span>
                <span className="text-nocturne-pink font-bold">11:00 AM – 2:00 AM</span>
              </li>
              <li className="flex justify-between py-1">
                <span>Sunday</span>
                <span className="text-white font-medium">12:00 PM – Midnight</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-purple-500/15 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-nocturne-muted">
          <p className="flex items-center gap-1.5">
            © {new Date().getFullYear()} <span className="text-white font-bold">VELZINO</span>. Hand-stretched with{' '}
            <Flame size={13} className="text-veloce-300 fill-veloce-300" /> & Midnight Passion.
          </p>
          <div className="flex items-center gap-3">
            <span className="text-nocturne-muted">OIBSIP Full-Stack Web Development Task</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
          </div>
        </div>
      </div>
    </footer>
  );
}
