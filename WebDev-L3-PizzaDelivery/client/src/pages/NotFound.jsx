import { Link } from 'react-router-dom';
import { Home, Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen pt-32 pb-20 flex items-center justify-center px-4">
      <div className="cyber-card p-10 sm:p-14 text-center max-w-md w-full space-y-6 border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 blur-3xl pointer-events-none rounded-full" />
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary-500/10 border border-primary-500/30 shadow-[0_0_25px_rgba(255,0,85,0.25)] mx-auto">
          <span className="text-4xl animate-bounce-gentle">🍕</span>
        </div>
        <div>
          <div className="text-6xl font-display font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-amber-400 to-cyan-400 tracking-tight">
            404
          </div>
          <h2 className="text-xl font-display font-bold text-white mt-2">
            Sector Out of Reach
          </h2>
          <p className="text-xs text-charcoal-400 leading-relaxed mt-2">
            Looks like someone consumed this slice or your culinary coordinates took a detour. Let's calibrate your route back to the high-temp kiln.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/" className="btn-primary !py-2.5 text-xs flex items-center justify-center gap-2">
            <Home size={14} />
            <span>Return to Kiln</span>
          </Link>
          <Link to="/menu" className="btn-secondary !py-2.5 text-xs flex items-center justify-center gap-2">
            <Compass size={14} />
            <span>Explore Menu</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
