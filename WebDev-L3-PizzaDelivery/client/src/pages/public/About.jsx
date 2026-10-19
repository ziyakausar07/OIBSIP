import { Link } from 'react-router-dom';
import { Flame, Heart, Award, ShieldCheck, Sparkles, ChefHat, Users, Clock, Zap } from 'lucide-react';

export default function About() {
  return (
    <div className="pt-32 pb-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20 animate-fade-in">
      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-veloce-600/20 border border-purple-500/30 text-veloce-200 text-xs font-sans tracking-wide">
          <Sparkles size={13} className="text-nocturne-pink" />
          <span>The Velzino Story</span>
        </div>
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-display font-black text-white leading-tight">
          Where Artisan Crust Meets{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-veloce-300 via-nocturne-lavender to-nocturne-pink">
            Midnight Beats.
          </span>
        </h1>
        <p className="text-nocturne-lavender/80 text-xs sm:text-base leading-relaxed font-sans">
          Born out of a relentless passion for culinary artistry, VELZINO marries 72-hour Neapolitan cold sourdough fermentation with an ambient lounge experience and fast delivery to deliver crispy, molten artisan pizza.
        </p>
      </div>

      {/* Story Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-purple-500/25 aspect-video lg:aspect-square group">
          <img
            src="https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80"
            alt="Handcrafting Pizza at Velzino"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-midnight-950 via-midnight-950/20 to-transparent"></div>
          <div className="absolute bottom-6 left-6 right-6 cyber-card p-4 border-purple-500/30 !rounded-2xl">
            <p className="text-[10px] text-veloce-300 font-sans font-bold uppercase tracking-wider">
              The Gold Standard
            </p>
            <p className="text-xs sm:text-sm font-bold text-white font-sans mt-0.5">
              72-Hour Slow Cold Fermentation • Pure Fior Di Latte • 480°C Blistered Crusts
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <span className="text-xs font-sans font-bold text-veloce-300 uppercase tracking-widest block">
            Culinary Philosophy
          </span>
          <h2 className="text-2xl sm:text-4xl font-display font-bold text-white leading-tight">
            Crafted for Unmatched Flavor. Zero Compromises.
          </h2>
          <p className="text-nocturne-muted text-xs sm:text-sm leading-relaxed font-sans">
            Commercial chains use frozen pre-stretched discs and analogue cheeses. At VELZINO, our flour is 100% stone-milled Italian Tipo 00. Every morning begins with a 72-hour yeast fermentation that creates natural leopard-char bubbles and an airy, digestible crumb.
          </p>
          <p className="text-nocturne-muted text-xs sm:text-sm leading-relaxed font-sans">
            Our San Marzano plum tomatoes are cooked gently with cold-pressed olive oil and fresh basil. Our cheese is 100% whole milk Fior di Latte, delivering the silky molten pull our patrons adore.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="cyber-card p-4 border-purple-500/20">
              <span className="text-2xl block mb-1">🔥</span>
              <h4 className="font-bold text-white text-xs sm:text-sm">480°C Stone Oven</h4>
              <p className="text-nocturne-muted text-[11px] font-sans">Charred leopard crust in 90 seconds.</p>
            </div>
            <div className="cyber-card p-4 border-purple-500/20">
              <span className="text-2xl block mb-1">🌿</span>
              <h4 className="font-bold text-white text-xs sm:text-sm">Garden Fresh Harvest</h4>
              <p className="text-nocturne-muted text-[11px] font-sans">Fresh daily harvest from select growers.</p>
            </div>
          </div>

          <div className="pt-2">
            <Link to="/custom-pizza" className="btn-primary !px-7 !py-3.5 text-xs tracking-wide shadow-glow-violet inline-flex items-center gap-2">
              <Zap size={15} /> Build Custom Pizza Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
