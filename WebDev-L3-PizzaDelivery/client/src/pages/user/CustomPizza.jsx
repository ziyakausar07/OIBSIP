import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { useCart } from '../../context/CartContext';
import toast from 'react-hot-toast';
import {
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  Check,
  Sparkles,
  Flame,
  CheckCircle2,
  Sliders,
  Layers,
  RotateCw,
  Zap,
  Info
} from 'lucide-react';

const STEPS = [
  { number: 1, title: 'Artisan Crust Base', category: 'base', icon: '🫓', desc: 'Crust style & texture' },
  { number: 2, title: 'Signature Sauce', category: 'sauce', icon: '🍅', desc: 'Kiln flavor base' },
  { number: 3, title: 'Cheese Melt', category: 'cheese', icon: '🧀', desc: 'Melt & rich stretch' },
  { number: 4, title: 'Hydroponic Veggies', category: 'veggie', icon: '🫑', desc: 'Garden crunch toppings' },
];

const SIZES = [
  { name: 'Regular', multiplier: 1.0, inches: '8"', slices: 4 },
  { name: 'Medium', multiplier: 1.25, inches: '10"', slices: 6 },
  { name: 'Large', multiplier: 1.5, inches: '12"', slices: 8 },
];

export default function CustomPizza() {
  const [searchParams] = useSearchParams();
  const pizzaId = searchParams.get('pizzaId');
  const navigate = useNavigate();
  const { addItem } = useCart();

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [ingredients, setIngredients] = useState([]);
  const [basePizza, setBasePizza] = useState(null);

  // Selections
  const [size, setSize] = useState('Medium');
  const [selectedBase, setSelectedBase] = useState(null);
  const [selectedSauce, setSelectedSauce] = useState(null);
  const [selectedCheese, setSelectedCheese] = useState(null);
  const [selectedVeggies, setSelectedVeggies] = useState([]);

  // Visualizer interactive rotation
  const [rotationAngle, setRotationAngle] = useState(0);

  // Fetch ingredients & optional base pizza
  useEffect(() => {
    const initData = async () => {
      try {
        setLoading(true);
        const { data: ingData } = await api.get('/ingredients');
        if (ingData.success) {
          const rawList = Array.isArray(ingData.ingredients)
            ? ingData.ingredients
            : Array.isArray(ingData.raw)
            ? ingData.raw
            : [
                ...(ingData.ingredients?.bases || ingData.grouped?.bases || []),
                ...(ingData.ingredients?.sauces || ingData.grouped?.sauces || []),
                ...(ingData.ingredients?.cheeses || ingData.grouped?.cheeses || []),
                ...(ingData.ingredients?.veggies || ingData.grouped?.veggies || []),
              ];

          setIngredients(rawList);

          if (pizzaId) {
            const { data: pzData } = await api.get(`/pizzas/${pizzaId}`);
            if (pzData.success && pzData.pizza) {
              const pz = pzData.pizza;
              setBasePizza(pz);

              if (pz.defaultIngredients?.base) {
                const b = rawList.find(i => i._id === (pz.defaultIngredients.base._id || pz.defaultIngredients.base));
                if (b) setSelectedBase(b);
              }
              if (pz.defaultIngredients?.sauce) {
                const s = rawList.find(i => i._id === (pz.defaultIngredients.sauce._id || pz.defaultIngredients.sauce));
                if (s) setSelectedSauce(s);
              }
              if (pz.defaultIngredients?.cheese) {
                const c = rawList.find(i => i._id === (pz.defaultIngredients.cheese._id || pz.defaultIngredients.cheese));
                if (c) setSelectedCheese(c);
              }
              if (pz.defaultIngredients?.veggies?.length) {
                const vegIds = pz.defaultIngredients.veggies.map(v => v._id || v);
                const matchedVeggies = rawList.filter(i => vegIds.includes(i._id));
                setSelectedVeggies(matchedVeggies);
              }
            }
          } else {
            const defaultBase = rawList.find(i => i.category === 'base');
            const defaultSauce = rawList.find(i => i.category === 'sauce');
            const defaultCheese = rawList.find(i => i.category === 'cheese');
            if (defaultBase) setSelectedBase(defaultBase);
            if (defaultSauce) setSelectedSauce(defaultSauce);
            if (defaultCheese) setSelectedCheese(defaultCheese);
          }
        }
      } catch (err) {
        console.error('Failed to load ingredients:', err);
        toast.error('Failed to load ingredients catalog');
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, [pizzaId]);

  const categorized = useMemo(() => {
    const safeList = Array.isArray(ingredients) ? ingredients : [];
    return {
      base: safeList.filter(i => i && i.category === 'base'),
      sauce: safeList.filter(i => i && i.category === 'sauce'),
      cheese: safeList.filter(i => i && i.category === 'cheese'),
      veggie: safeList.filter(i => i && i.category === 'veggie'),
    };
  }, [ingredients]);

  const livePrice = useMemo(() => {
    const sizeMultiplier = SIZES.find(s => s.name === size)?.multiplier || 1.25;
    const baseP = basePizza?.basePrice || 0;

    const baseCost = selectedBase?.price || 0;
    const sauceCost = selectedSauce?.price || 0;
    const cheeseCost = selectedCheese?.price || 0;
    const veggieCost = selectedVeggies.reduce((sum, v) => sum + (v.price || 0), 0);

    const ingTotal = baseCost + sauceCost + cheeseCost + veggieCost;
    const rawUnitPrice = baseP > 0 ? baseP + ingTotal : Math.max(149, ingTotal + 99);
    return Math.round(rawUnitPrice * sizeMultiplier);
  }, [size, basePizza, selectedBase, selectedSauce, selectedCheese, selectedVeggies]);

  const canProceed = () => {
    if (currentStep === 1 && !selectedBase) return false;
    if (currentStep === 2 && !selectedSauce) return false;
    if (currentStep === 3 && !selectedCheese) return false;
    return true;
  };

  const handleNext = () => {
    if (!canProceed()) {
      toast.error('Please make a selection to advance to the next stage');
      return;
    }
    if (currentStep < 4) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const toggleVeggie = (veggie) => {
    setSelectedVeggies(prev => {
      const exists = prev.some(v => v._id === veggie._id);
      if (exists) {
        return prev.filter(v => v._id !== veggie._id);
      } else {
        return [...prev, veggie];
      }
    });
  };

  const handleAddToCart = () => {
    if (!selectedBase || !selectedSauce || !selectedCheese) {
      toast.error('Please complete all pizza customization steps');
      return;
    }

    const item = {
      pizza: basePizza?._id || null,
      name: basePizza ? `VELOCE ${basePizza.name} (Custom)` : 'VELOCE Custom Pizza Lab Creation',
      size,
      base: { id: selectedBase._id, name: selectedBase.name, price: selectedBase.price },
      sauce: { id: selectedSauce._id, name: selectedSauce.name, price: selectedSauce.price },
      cheese: { id: selectedCheese._id, name: selectedCheese.name, price: selectedCheese.price },
      veggies: selectedVeggies.map(v => ({ id: v._id, name: v.name, price: v.price })),
      itemPrice: livePrice,
      quantity: 1,
    };

    addItem(item);
    toast.success('🍕 Pizza added to your box!');
    navigate('/cart');
  };

  // Visualizer styling helpers
  const getCrustBorder = () => {
    const name = selectedBase?.name?.toLowerCase() || '';
    if (name.includes('cheese') || name.includes('stuffed')) return 'border-[#eab308] shadow-[0_0_25px_rgba(234,179,8,0.5)]';
    if (name.includes('thin') || name.includes('crispy')) return 'border-[#b45309]';
    if (name.includes('gluten')) return 'border-[#a16207]';
    return 'border-[#c2410c]';
  };

  const getSauceBg = () => {
    const name = selectedSauce?.name?.toLowerCase() || '';
    if (name.includes('alfredo') || name.includes('white')) return 'bg-amber-100/80';
    if (name.includes('pesto')) return 'bg-emerald-700/80';
    if (name.includes('arrabbiata') || name.includes('spicy')) return 'bg-red-700/90';
    return 'bg-rose-700/85'; // Marinara default
  };

  const getCheeseBg = () => {
    const name = selectedCheese?.name?.toLowerCase() || '';
    if (name.includes('cheddar')) return 'bg-amber-400/80';
    if (name.includes('parmesan')) return 'bg-amber-200/80';
    if (name.includes('vegan')) return 'bg-yellow-200/75';
    return 'bg-amber-300/85'; // Mozzarella default
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-36 pb-24 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-neon-pink border-t-transparent rounded-full animate-spin shadow-glow-pink"></div>
          <p className="text-midnight-300 font-mono text-xs uppercase tracking-widest">
            Initializing Culinary Canvas...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 animate-fade-in">
      {/* ── HEADER & SIZE SELECTOR ────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-veloce-500/15 border border-veloce-500/30 text-veloce-300 text-xs font-mono tracking-wider uppercase mb-2">
            <Sliders size={13} className="text-neon-pink" />
            <span>VELOCE Interactive Pizza Lab</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-black text-white">
            {basePizza ? `Customize: ${basePizza.name}` : 'Engineer Your Custom Pizza'}
          </h1>
          <p className="text-midnight-300 text-xs sm:text-sm font-sans mt-1">
            Build layer-by-layer with real-time 3D-styled interactive canvas, live nutrition & price telemetry.
          </p>
        </div>

        {/* Size Selector HUD */}
        <div className="cyber-card p-1.5 flex items-center gap-1.5 self-start md:self-auto border-white/15">
          {SIZES.map(s => (
            <button
              key={s.name}
              onClick={() => setSize(s.name)}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all duration-200 ${
                size === s.name
                  ? 'bg-gradient-to-r from-neon-pink to-amber-electric text-white shadow-glow-pink'
                  : 'text-midnight-300 hover:text-white hover:bg-white/5'
              }`}
            >
              {s.name} ({s.inches})
            </button>
          ))}
        </div>
      </div>

      {/* ── STEP NAVIGATOR TABS ─────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {STEPS.map((s) => {
          const isActive = currentStep === s.number;
          const isDone = currentStep > s.number;

          return (
            <button
              key={s.number}
              onClick={() => setCurrentStep(s.number)}
              className={`cyber-card p-4 text-left transition-all duration-300 relative overflow-hidden group ${
                isActive
                  ? 'border-veloce-400 bg-veloce-500/15 shadow-glow-violet ring-1 ring-veloce-400'
                  : isDone
                  ? 'border-emerald-500/40 bg-emerald-500/10'
                  : 'opacity-60 hover:opacity-100 hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{s.icon}</span>
                {isDone ? (
                  <CheckCircle2 size={18} className="text-emerald-400" />
                ) : (
                  <span className="text-[11px] font-mono font-bold text-midnight-400">
                    STAGE 0{s.number}
                  </span>
                )}
              </div>
              <h4 className="text-xs sm:text-sm font-display font-bold text-white truncate">
                {s.title}
              </h4>
              <p className="text-[11px] text-midnight-300 truncate hidden sm:block font-sans mt-0.5">
                {s.desc}
              </p>
            </button>
          );
        })}
      </div>

      {/* ── MAIN LAYOUT: BUILDER CONTROLS & 3D PIZZA CANVAS ───── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (8 cols): Step Controls */}
        <div className="lg:col-span-7 space-y-6">
          {/* STEP 1: BASE */}
          {currentStep === 1 && (
            <div className="cyber-card p-6 sm:p-8 space-y-6 animate-fade-in border-veloce-500/30">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <span className="text-xs font-mono text-amber-electric uppercase font-bold tracking-wider">
                    Stage 01 / 04
                  </span>
                  <h3 className="text-xl font-display font-black text-white mt-0.5">
                    Select Stone-Fired Crust Base
                  </h3>
                  <p className="text-xs text-midnight-300 mt-0.5">Choose 1 dough base foundation.</p>
                </div>
                <span className="badge-warning font-mono text-[10px]">1 Required</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {categorized.base.map((base) => {
                  const isSelected = selectedBase?._id === base._id;
                  return (
                    <div
                      key={base._id}
                      onClick={() => setSelectedBase(base)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 flex items-center justify-between group ${
                        isSelected
                          ? 'border-neon-pink bg-neon-pink/15 shadow-glow-pink'
                          : 'border-white/10 bg-midnight-950/60 hover:border-veloce-500/40 hover:bg-midnight-900'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-3xl group-hover:scale-110 transition-transform">
                          {base.image || '🫓'}
                        </span>
                        <div>
                          <h4 className="font-display font-bold text-sm text-white">{base.name}</h4>
                          <p className="text-xs text-midnight-300 mt-0.5">{base.description}</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0 ml-3">
                        <span className="text-xs font-mono font-bold text-amber-electric block">
                          {base.price > 0 ? `+₹${base.price}` : 'Standard'}
                        </span>
                        {isSelected && (
                          <span className="inline-flex items-center justify-center mt-1.5 w-5 h-5 bg-neon-pink rounded-full text-white text-[10px] font-bold">
                            ✓
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: SAUCE */}
          {currentStep === 2 && (
            <div className="cyber-card p-6 sm:p-8 space-y-6 animate-fade-in border-veloce-500/30">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <span className="text-xs font-mono text-neon-pink uppercase font-bold tracking-wider">
                    Stage 02 / 04
                  </span>
                  <h3 className="text-xl font-display font-black text-white mt-0.5">
                    Coat with Signature Sauce
                  </h3>
                  <p className="text-xs text-midnight-300 mt-0.5">Select 1 authentic Italian sauce base.</p>
                </div>
                <span className="badge-warning font-mono text-[10px]">1 Required</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {categorized.sauce.map((sauce) => {
                  const isSelected = selectedSauce?._id === sauce._id;
                  return (
                    <div
                      key={sauce._id}
                      onClick={() => setSelectedSauce(sauce)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 flex items-center justify-between group ${
                        isSelected
                          ? 'border-neon-pink bg-neon-pink/15 shadow-glow-pink'
                          : 'border-white/10 bg-midnight-950/60 hover:border-veloce-500/40 hover:bg-midnight-900'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-3xl group-hover:scale-110 transition-transform">
                          {sauce.image || '🍅'}
                        </span>
                        <div>
                          <h4 className="font-display font-bold text-sm text-white">{sauce.name}</h4>
                          <p className="text-xs text-midnight-300 mt-0.5">{sauce.description}</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0 ml-3">
                        <span className="text-xs font-mono font-bold text-amber-electric block">
                          {sauce.price > 0 ? `+₹${sauce.price}` : 'Standard'}
                        </span>
                        {isSelected && (
                          <span className="inline-flex items-center justify-center mt-1.5 w-5 h-5 bg-neon-pink rounded-full text-white text-[10px] font-bold">
                            ✓
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: CHEESE */}
          {currentStep === 3 && (
            <div className="cyber-card p-6 sm:p-8 space-y-6 animate-fade-in border-veloce-500/30">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <span className="text-xs font-mono text-amber-electric uppercase font-bold tracking-wider">
                    Stage 03 / 04
                  </span>
                  <h3 className="text-xl font-display font-black text-white mt-0.5">
                    Infuse Artisanal Cheese Melt
                  </h3>
                  <p className="text-xs text-midnight-300 mt-0.5">Select 1 stretchy cheese or premium blend.</p>
                </div>
                <span className="badge-warning font-mono text-[10px]">1 Required</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {categorized.cheese.map((cheese) => {
                  const isSelected = selectedCheese?._id === cheese._id;
                  return (
                    <div
                      key={cheese._id}
                      onClick={() => setSelectedCheese(cheese)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 flex items-center justify-between group ${
                        isSelected
                          ? 'border-amber-electric bg-amber-molten/20 shadow-glow-amber'
                          : 'border-white/10 bg-midnight-950/60 hover:border-amber-electric/40 hover:bg-midnight-900'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-3xl group-hover:scale-110 transition-transform">
                          {cheese.image || '🧀'}
                        </span>
                        <div>
                          <h4 className="font-display font-bold text-sm text-white">{cheese.name}</h4>
                          <p className="text-xs text-midnight-300 mt-0.5">{cheese.description}</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0 ml-3">
                        <span className="text-xs font-mono font-bold text-amber-electric block">
                          {cheese.price > 0 ? `+₹${cheese.price}` : 'Standard'}
                        </span>
                        {isSelected && (
                          <span className="inline-flex items-center justify-center mt-1.5 w-5 h-5 bg-amber-electric text-midnight-950 font-black rounded-full text-[10px]">
                            ✓
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 4: VEGGIES */}
          {currentStep === 4 && (
            <div className="cyber-card p-6 sm:p-8 space-y-6 animate-fade-in border-veloce-500/30">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <span className="text-xs font-mono text-cyber-cyan uppercase font-bold tracking-wider">
                    Stage 04 / 04
                  </span>
                  <h3 className="text-xl font-display font-black text-white mt-0.5">
                    Scatter Garden Fresh Veggies
                  </h3>
                  <p className="text-xs text-midnight-300 mt-0.5">Multi-select toppings for texture and crunch.</p>
                </div>
                <span className="badge-info font-mono text-[10px]">
                  {selectedVeggies.length} Selected
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {categorized.veggie.map((veg) => {
                  const isSelected = selectedVeggies.some(v => v._id === veg._id);
                  return (
                    <div
                      key={veg._id}
                      onClick={() => toggleVeggie(veg)}
                      className={`p-3.5 sm:p-4 rounded-2xl border cursor-pointer transition-all duration-200 flex items-center justify-between group ${
                        isSelected
                          ? 'border-cyber-cyan bg-cyber-cyan/15 shadow-glow-cyan'
                          : 'border-white/10 bg-midnight-950/60 hover:border-cyber-cyan/40 hover:bg-midnight-900'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl sm:text-3xl group-hover:scale-110 transition-transform">
                          {veg.image || '🫑'}
                        </span>
                        <div>
                          <h4 className="font-display font-bold text-xs sm:text-sm text-white">{veg.name}</h4>
                          <p className="text-[11px] text-midnight-300 mt-0.5">{veg.description}</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0 ml-3">
                        <span className="text-xs font-mono font-bold text-amber-electric block">
                          +₹{veg.price}
                        </span>
                        <div
                          className={`mt-1.5 w-5 h-5 rounded-md border flex items-center justify-center text-[11px] font-bold transition-all ${
                            isSelected
                              ? 'bg-cyber-cyan border-cyber-cyan text-midnight-950'
                              : 'border-white/20'
                          }`}
                        >
                          {isSelected && '✓'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step Navigation Controls */}
          <div className="flex items-center justify-between pt-4">
            <button
              onClick={handlePrev}
              disabled={currentStep === 1}
              className="btn-secondary !px-5 !py-3 disabled:opacity-30 flex items-center gap-2 font-mono text-xs uppercase"
            >
              <ChevronLeft size={16} />
              <span>Back Stage</span>
            </button>

            {currentStep < 4 ? (
              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className="btn-primary !px-7 !py-3 flex items-center gap-2 font-mono text-xs uppercase shadow-glow-pink"
              >
                <span>Advance to Phase 0{currentStep + 1}</span>
                <ChevronRight size={16} />
              </button>
            ) : (
              <button
                onClick={handleAddToCart}
                className="btn-primary !px-8 !py-3.5 flex items-center gap-2.5 shadow-glow-pink font-mono text-xs uppercase tracking-wider"
              >
                <ShoppingCart size={17} />
                <span>Confirm & Add to Box (₹{livePrice})</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Column (5 cols): Interactive 3D Pizza Canvas & Telemetry */}
        <div className="lg:col-span-5 sticky top-24 space-y-5">
          <div className="cyber-card p-6 space-y-6 border-veloce-500/30">
            {/* Visualizer Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <h3 className="font-display font-extrabold text-base text-white tracking-wide">
                  Live 3D Pizza Canvas
                </h3>
              </div>
              <button
                onClick={() => setRotationAngle(prev => (prev + 45) % 360)}
                className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-midnight-300 hover:text-white hover:border-veloce-400 transition-all text-xs flex items-center gap-1 font-mono"
                title="Rotate 45°"
              >
                <RotateCw size={13} />
                <span>{rotationAngle}°</span>
              </button>
            </div>

            {/* ── 3D PIZZA VISUAL DISK ────────────────── */}
            <div className="relative py-4 flex items-center justify-center">
              {/* Kiln ambient glow backplate */}
              <div className="absolute w-60 h-60 rounded-full bg-gradient-to-tr from-amber-molten/20 to-neon-pink/20 blur-2xl pointer-events-none"></div>

              {/* Crust Disk Container */}
              <div
                className={`relative w-56 h-56 sm:w-64 sm:h-64 rounded-full border-8 ${getCrustBorder()} p-2 transition-all duration-500 pizza-disk shadow-2xl flex items-center justify-center overflow-hidden`}
                style={{
                  transform: `rotate(${rotationAngle}deg)`,
                  background: 'radial-gradient(circle, #f59e0b 0%, #b45309 60%, #78350f 100%)',
                }}
              >
                {/* Sauce Layer */}
                <div
                  className={`absolute inset-2 rounded-full ${getSauceBg()} transition-colors duration-500 backdrop-blur-xs opacity-90`}
                ></div>

                {/* Cheese Layer */}
                <div
                  className={`absolute inset-3.5 rounded-full ${getCheeseBg()} transition-colors duration-500 shadow-inner flex items-center justify-center`}
                  style={{
                    backgroundImage: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.3) 0%, transparent 40%)',
                  }}
                >
                  {/* Subtle cheese herbs/pepper flakes */}
                  <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#15803d_1px,transparent_1px)] [background-size:12px_12px]"></div>
                </div>

                {/* Veggies Overlay Scatter */}
                {selectedVeggies.map((veg, index) => {
                  const angle = (index * (360 / Math.max(selectedVeggies.length, 1))) + 25;
                  const radius = 38; // percentage from center
                  const x = 50 + radius * Math.cos((angle * Math.PI) / 180);
                  const y = 50 + radius * Math.sin((angle * Math.PI) / 180);

                  return (
                    <div
                      key={veg._id}
                      className="absolute text-xl sm:text-2xl animate-scale-in drop-shadow-md select-none transition-all duration-300 pointer-events-none"
                      style={{
                        top: `${y}%`,
                        left: `${x}%`,
                        transform: 'translate(-50%, -50%)',
                      }}
                      title={veg.name}
                    >
                      {veg.image || '🫑'}
                    </div>
                  );
                })}

                {/* Center Chef Signature Emoticon if no veggies */}
                {selectedVeggies.length === 0 && (
                  <div className="relative z-10 text-center animate-fade-in pointer-events-none">
                    <span className="text-3xl block filter drop-shadow">🧀</span>
                    <span className="text-[10px] font-mono font-bold text-amber-950 uppercase tracking-wider block bg-amber-100/70 px-2 py-0.5 rounded-full mt-1">
                      Pure Melt
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Flavor Telemetry Meter Bars */}
            <div className="grid grid-cols-3 gap-2.5 pt-2 border-t border-white/10 font-mono text-[11px]">
              <div className="cyber-card p-2 text-center bg-midnight-950/70 border-white/10">
                <span className="text-midnight-400 block text-[10px]">CRUST DOUGH</span>
                <span className="font-bold text-amber-electric truncate block">
                  {selectedBase?.name?.split(' ')[0] || 'Hand-Tossed'}
                </span>
              </div>
              <div className="cyber-card p-2 text-center bg-midnight-950/70 border-white/10">
                <span className="text-midnight-400 block text-[10px]">HEAT LEVEL</span>
                <span className="font-bold text-neon-pink block">
                  {selectedSauce?.name?.toLowerCase().includes('spicy') || selectedSauce?.name?.toLowerCase().includes('arrabbiata')
                    ? '🌶️🌶️ HOT'
                    : '🌶️ MILD'}
                </span>
              </div>
              <div className="cyber-card p-2 text-center bg-midnight-950/70 border-white/10">
                <span className="text-midnight-400 block text-[10px]">TOPPINGS</span>
                <span className="font-bold text-cyber-cyan block">
                  {selectedVeggies.length} Loaded
                </span>
              </div>
            </div>

            {/* Itemized Recipe Ledger */}
            <div className="space-y-2 text-xs font-mono border-t border-white/10 pt-4 text-midnight-200">
              <div className="flex justify-between items-center py-0.5">
                <span className="flex items-center gap-1.5 text-midnight-300">
                  <span>🫓</span> Base:
                </span>
                <span className="font-bold text-white truncate max-w-[170px]">
                  {selectedBase?.name || '—'}
                </span>
              </div>

              <div className="flex justify-between items-center py-0.5">
                <span className="flex items-center gap-1.5 text-midnight-300">
                  <span>🍅</span> Sauce:
                </span>
                <span className="font-bold text-white truncate max-w-[170px]">
                  {selectedSauce?.name || '—'}
                </span>
              </div>

              <div className="flex justify-between items-center py-0.5">
                <span className="flex items-center gap-1.5 text-midnight-300">
                  <span>🧀</span> Cheese:
                </span>
                <span className="font-bold text-white truncate max-w-[170px]">
                  {selectedCheese?.name || '—'}
                </span>
              </div>

              <div className="py-0.5">
                <div className="flex justify-between items-center mb-1 text-midnight-300">
                  <span className="flex items-center gap-1.5">
                    <span>🫑</span> Veggies:
                  </span>
                  <span className="text-white font-bold">{selectedVeggies.length} items</span>
                </div>
                {selectedVeggies.length > 0 ? (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedVeggies.map(v => (
                      <span key={v._id} className="badge bg-cyber-cyan/15 text-cyber-cyan border border-cyber-cyan/30 text-[10px] px-2 py-0.5">
                        {v.name}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-midnight-400 italic text-[11px]">No extra toppings chosen</span>
                )}
              </div>
            </div>

            {/* Live Price Tag & Add to Cart Action */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-midnight-400 block font-semibold">
                  Calculated Price ({size})
                </span>
                <span className="text-3xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-electric to-white">
                  ₹{livePrice}
                </span>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={!selectedBase || !selectedSauce || !selectedCheese}
                className="btn-primary !px-5 !py-3 text-xs font-mono uppercase tracking-wider font-bold disabled:opacity-50 shadow-glow-pink"
              >
                Add to Cart 🍕
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
