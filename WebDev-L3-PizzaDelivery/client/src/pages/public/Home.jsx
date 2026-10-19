import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import PizzaCard from '../../components/common/PizzaCard';
import { Sparkles, Flame, Clock, Zap, ArrowRight, ShieldCheck, Cpu, Sliders, ChevronRight } from 'lucide-react';

export default function Home() {
  const [featuredPizzas, setFeaturedPizzas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const { data } = await api.get('/pizzas');
        if (data.success) {
          const featured = data.pizzas.filter((p) => p.isFeatured).slice(0, 4);
          setFeaturedPizzas(featured.length ? featured : data.pizzas.slice(0, 4));
        }
      } catch (err) {
        console.error('Failed to load pizzas:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <div className="space-y-28 pb-24">
      {/* ── 1. NOCTURNE BITES & BEATS HERO SECTION ──────────────────────── */}
      <section className="relative pt-36 pb-20 md:pt-44 md:pb-32 overflow-hidden">
        {/* Soft Ambient Violet & Magenta Aura */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-veloce-600/20 blur-[170px] pointer-events-none rounded-full"></div>
        <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-nocturne-pink/15 blur-[150px] pointer-events-none rounded-full"></div>
        <div className="absolute bottom-10 right-1/4 w-[450px] h-[450px] bg-veloce-800/25 blur-[140px] pointer-events-none rounded-full"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headlines & CTA */}
            <div className="lg:col-span-7 space-y-7 text-center lg:text-left">
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-midnight-900/90 border border-purple-500/30 text-veloce-200 text-xs font-sans tracking-wide animate-fade-in shadow-glow-violet">
                <span className="w-2 h-2 rounded-full bg-nocturne-pink animate-ping"></span>
                <Sparkles size={14} className="text-veloce-300" />
                <span>Artisan Crusts & Midnight Vibes</span>
              </div>

              <div className="space-y-2">
                <h1 className="text-5xl sm:text-7xl lg:text-8xl font-display font-black tracking-tight text-white leading-none">
                  VELZINO
                </h1>
                <p className="text-xl sm:text-2xl lg:text-3xl font-display font-bold tracking-[0.18em] text-transparent bg-clip-text bg-gradient-to-r from-veloce-300 via-nocturne-lavender to-nocturne-pink uppercase">
                  Bites and Beats
                </p>
              </div>

              <p className="text-nocturne-lavender/80 text-base sm:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed font-sans font-normal">
                Stone-baked artisan pizza, slow cold-fermented sourdough crusts, and late-night cravings. Customize your pie with live crust telemetry or choose from our chef creations.
              </p>

              {/* Main CTA: Big Smooth Violet Pill */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-1">
                <Link
                  to="/menu"
                  className="btn-primary w-full sm:w-auto text-sm !px-9 !py-4 shadow-glow-violet group flex items-center justify-center gap-3 text-white font-medium"
                >
                  <span>Start Your Order</span>
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/custom-pizza"
                  className="btn-secondary w-full sm:w-auto text-sm !px-8 !py-4"
                >
                  <Sliders size={16} />
                  <span>Custom Pizza Lab</span>
                </Link>
              </div>

              {/* 3 Translucent Nocturne Dock Pills (Matching Mockup Phone 1) */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-3">
                <Link
                  to="/menu"
                  className="px-4 py-2 rounded-xl bg-midnight-900/70 border border-purple-500/25 text-xs text-nocturne-lavender hover:text-white hover:border-purple-400 flex items-center gap-2 backdrop-blur-md transition-all shadow-sm"
                >
                  <span>📄</span>
                  <span>View Menu</span>
                </Link>
                <Link
                  to="/custom-pizza"
                  className="px-4 py-2 rounded-xl bg-midnight-900/70 border border-purple-500/25 text-xs text-nocturne-lavender hover:text-white hover:border-purple-400 flex items-center gap-2 backdrop-blur-md transition-all shadow-sm"
                >
                  <span>🍕</span>
                  <span>Pizza Lab</span>
                </Link>
                <Link
                  to="/about"
                  className="px-4 py-2 rounded-xl bg-midnight-900/70 border border-purple-500/25 text-xs text-nocturne-lavender hover:text-white hover:border-purple-400 flex items-center gap-2 backdrop-blur-md transition-all shadow-sm"
                >
                  <span>🎵</span>
                  <span>Lounge & Music</span>
                </Link>
              </div>

              {/* Key Highlights */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-purple-500/15 max-w-lg mx-auto lg:mx-0">
                <div className="text-center lg:text-left">
                  <p className="text-2xl font-display font-black text-white flex items-center justify-center lg:justify-start gap-1">
                    72<span className="text-veloce-300 text-lg">H</span>
                  </p>
                  <p className="text-[11px] font-sans text-nocturne-muted uppercase tracking-wider">Cold Ferment</p>
                </div>
                <div className="text-center lg:text-left border-x border-purple-500/15 px-2">
                  <p className="text-2xl font-display font-black text-white flex items-center justify-center lg:justify-start gap-1">
                    480<span className="text-nocturne-pink text-lg">°C</span>
                  </p>
                  <p className="text-[11px] font-sans text-nocturne-muted uppercase tracking-wider">Stone Oven</p>
                </div>
                <div className="text-center lg:text-left">
                  <p className="text-2xl font-display font-black text-white flex items-center justify-center lg:justify-start gap-1">
                    4.97<span className="text-veloce-300 text-base">★</span>
                  </p>
                  <p className="text-[11px] font-sans text-nocturne-muted uppercase tracking-wider">Lounge Rating</p>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual Graphic with 3D Dish Effect */}
            <div className="lg:col-span-5 relative flex justify-center">
              <div className="relative w-80 sm:w-[420px] aspect-square rounded-full border border-purple-500/30 p-5 bg-gradient-to-tr from-midnight-950 via-midnight-900 to-veloce-900/30 shadow-2xl shadow-black group">
                {/* Glow ring */}
                <div className="absolute inset-0 rounded-full border border-purple-500/30 animate-pulse-glow"></div>

                {/* Rotating Pizza Visual */}
                <img
                  src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80"
                  alt="Velzino Artisan Pizza"
                  className="w-full h-full object-cover rounded-full shadow-2xl pizza-disk animate-spin-slow group-hover:scale-105 transition-transform duration-700"
                  style={{ animationDuration: '45s' }}
                />

                {/* Floating Glass Pill 1: Stone Oven */}
                <div className="absolute -top-3 -left-4 cyber-card px-4 py-2.5 flex items-center gap-3 shadow-glow-violet border-purple-500/30 animate-float !rounded-full">
                  <div className="w-8 h-8 rounded-full bg-veloce-600/30 flex items-center justify-center text-veloce-200">
                    <Flame size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">480°C Stone Fired</p>
                    <p className="text-[10px] text-nocturne-lavender font-sans">Neapolitan Crust</p>
                  </div>
                </div>

                {/* Floating Glass Pill 2: Mozzarella */}
                <div
                  className="absolute -bottom-4 -right-4 cyber-card px-4 py-2.5 flex items-center gap-3 shadow-glow-pink border-purple-500/30 animate-float !rounded-full"
                  style={{ animationDelay: '1.8s' }}
                >
                  <div className="w-8 h-8 rounded-full bg-nocturne-pink/25 flex items-center justify-center text-nocturne-pink">
                    <Sparkles size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">100% Fior Di Latte</p>
                    <p className="text-[10px] text-nocturne-lavender font-sans">Artisanal Melts</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. PROMO BANNER ──────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-veloce-900/60 via-midnight-900/90 to-midnight-950 border border-purple-500/25 p-8 md:p-12 shadow-2xl backdrop-blur-xl">
          <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-nocturne-pink/15 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <span className="badge bg-nocturne-pink/20 text-nocturne-pink border border-nocturne-pink/35 text-xs font-sans tracking-wide">
                ✨ Velzino Midnight Special
              </span>
              <h3 className="text-2xl md:text-3xl font-display font-bold text-white">
                Customize Your First Pizza & Enjoy 20% OFF
              </h3>
              <p className="text-nocturne-lavender/80 text-xs sm:text-sm max-w-xl font-sans">
                Choose your slow-fermented crust, signature sauce, Italian cheeses, and garden-fresh toppings.
              </p>
            </div>
            <Link
              to="/custom-pizza"
              className="btn-primary whitespace-nowrap !px-8 !py-3.5 shadow-glow-violet text-sm"
            >
              Open Pizza Lab 🍕
            </Link>
          </div>
        </div>
      </section>

      {/* ── 3. FEATURED PIZZAS ──────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2 h-2 rounded-full bg-nocturne-pink animate-pulse"></span>
              <span className="text-xs font-sans font-medium tracking-wide uppercase text-nocturne-lavender">
                Chef Curations
              </span>
            </div>
            <h2 className="section-title text-white">Signature Velzino Pizzas</h2>
          </div>
          <Link
            to="/menu"
            className="text-veloce-300 hover:text-white text-xs font-sans tracking-wide flex items-center gap-1.5 group self-start md:self-auto"
          >
            <span>Explore All Flavors</span>
            <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform text-nocturne-pink" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="cyber-card h-48 skeleton"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featuredPizzas.map((pizza) => (
              <PizzaCard key={pizza._id} pizza={pizza} />
            ))}
          </div>
        )}
      </section>

      {/* ── 4. HOW PIZZA LAB WORKS ────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-sans font-medium uppercase tracking-widest text-veloce-300 block">
            Crafted Your Way
          </span>
          <h2 className="section-title text-white">How Pizza Lab Works</h2>
          <p className="text-nocturne-lavender/80 text-xs sm:text-sm font-sans">
            Customize every layer with live visual previews and transparent pricing.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              step: '01',
              title: 'Artisan Dough Base',
              desc: 'Select from 5 stone-milled crusts: Hand-Tossed, Thin & Crispy, Cheese Stuffed, or Gluten-Free.',
              icon: '🫓',
              color: 'from-veloce-700/30 to-veloce-500/20',
            },
            {
              step: '02',
              title: 'Gourmet Sauce',
              desc: 'San Marzano marinara, spicy arrabbiata, white truffle alfredo, or basil pesto base.',
              icon: '🍅',
              color: 'from-nocturne-pink/25 to-veloce-600/20',
            },
            {
              step: '03',
              title: 'Artisanal Cheese',
              desc: 'Molten Fior di Latte mozzarella, aged cheddar, sharp parmesan, or smoked provolone.',
              icon: '🧀',
              color: 'from-veloce-600/30 to-veloce-400/20',
            },
            {
              step: '04',
              title: 'Fresh Garden Veggies',
              desc: 'Crisp bell peppers, button mushrooms, sweet golden corn, kalamata olives, and jalapeños.',
              icon: '🫑',
              color: 'from-emerald-500/20 to-veloce-600/20',
            },
          ].map((item) => (
            <div
              key={item.step}
              className="cyber-card p-6 relative group hover:border-purple-400/50 hover:shadow-glow-violet transition-all"
            >
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${item.color} flex items-center justify-center text-3xl mb-5 border border-purple-500/20 group-hover:scale-110 transition-transform`}>
                {item.icon}
              </div>
              <span className="text-[11px] font-sans font-bold text-veloce-300 uppercase tracking-widest block mb-1">
                Step {item.step}
              </span>
              <h3 className="font-display font-bold text-lg text-white mb-2">{item.title}</h3>
              <p className="text-xs text-nocturne-muted leading-relaxed font-sans">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            to="/custom-pizza"
            className="btn-primary !px-9 !py-3.5 text-xs font-sans tracking-wide shadow-glow-violet inline-flex items-center gap-2"
          >
            <Sliders size={16} /> Launch Interactive Lab
          </Link>
        </div>
      </section>

      {/* ── 5. CORE SYSTEM PILLARS ───────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="cyber-card p-8 md:p-12 border-purple-500/20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-veloce-600/20 text-veloce-200 flex items-center justify-center shrink-0 border border-purple-500/30 shadow-glow-violet">
                <Flame size={22} />
              </div>
              <div>
                <h4 className="font-display font-bold text-white text-base mb-1">Wood-Fired Neapolitan</h4>
                <p className="text-nocturne-muted text-xs leading-relaxed font-sans">
                  72-hour slow cold fermentation baked at 480°C Italian stone flame for blistered airy crusts.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-nocturne-pink/15 text-nocturne-pink flex items-center justify-center shrink-0 border border-nocturne-pink/30 shadow-glow-pink">
                <Clock size={22} />
              </div>
              <div>
                <h4 className="font-display font-bold text-white text-base mb-1">Live Order Telemetry</h4>
                <p className="text-nocturne-muted text-xs leading-relaxed font-sans">
                  Real-time synchronization with Socket.IO from dough stretching and baking to rider dispatch.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-veloce-600/20 text-veloce-200 flex items-center justify-center shrink-0 border border-purple-500/30 shadow-glow-violet">
                <ShieldCheck size={22} />
              </div>
              <div>
                <h4 className="font-display font-bold text-white text-base mb-1">Instant Verified Checkout</h4>
                <p className="text-nocturne-muted text-xs leading-relaxed font-sans">
                  UPI, Cards, and Netbanking powered by Razorpay with automatic ingredient inventory deduction.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
