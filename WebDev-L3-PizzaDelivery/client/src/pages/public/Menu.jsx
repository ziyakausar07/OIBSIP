import { useState, useEffect } from 'react';
import api from '../../services/api';
import PizzaCard from '../../components/common/PizzaCard';
import { Search, Sparkles, Frown, Sliders } from 'lucide-react';
import { Link } from 'react-router-dom';

const CATEGORIES = [
  { id: 'All', label: 'All Pizzas', icon: '🍕' },
  { id: 'Veg', label: 'Veggie Bites', icon: '🌿' },
  { id: 'Classic', label: 'Classic Crusts', icon: '🍅' },
  { id: 'Gourmet', label: 'Gourmet Melts', icon: '🧀' },
  { id: 'Special', label: 'Chef Specials', icon: '⭐' },
];

export default function Menu() {
  const [pizzas, setPizzas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recommended');

  useEffect(() => {
    const fetchPizzas = async () => {
      try {
        const { data } = await api.get('/pizzas');
        if (data.success) {
          setPizzas(data.pizzas);
        }
      } catch (err) {
        console.error('Failed to fetch menu pizzas:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPizzas();
  }, []);

  const filteredPizzas = pizzas
    .filter((pizza) => {
      const matchesCategory =
        selectedCategory === 'All' || pizza.category === selectedCategory;
      const matchesSearch =
        pizza.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pizza.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'price-low') return a.basePrice - b.basePrice;
      if (sortBy === 'price-high') return b.basePrice - a.basePrice;
      if (sortBy === 'popular') return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
      return 0;
    });

  return (
    <div className="pt-32 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 animate-fade-in">
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-veloce-600/20 border border-purple-500/30 text-veloce-200 text-xs font-sans tracking-wide">
          <Sparkles size={13} className="text-nocturne-pink" />
          <span>Velzino Bites & Beats Menu</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-display font-black text-white">
          Explore Our Menu
        </h1>
        <p className="text-nocturne-lavender/80 text-xs sm:text-sm font-sans max-w-lg mx-auto leading-relaxed">
          Artisanal wood-stone fired crusts, crafted with 72h cold fermented dough, imported Fior Di Latte, and fresh gourmet toppings.
        </p>
      </div>

      {/* Categories Horizontal Carousel Pills (Matching Mockup Phone 2) */}
      <div className="flex items-center justify-center gap-3 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 ${
              selectedCategory === cat.id
                ? 'bg-gradient-to-r from-veloce-700 to-veloce-500 text-white shadow-glow-violet border border-purple-400/50 scale-105'
                : 'bg-midnight-900/80 border border-purple-500/20 text-nocturne-lavender hover:text-white hover:bg-midnight-850 hover:border-purple-400/40'
            }`}
          >
            <span>{cat.icon}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Search and Sort Filter Bar */}
      <div className="cyber-card p-4 flex flex-col md:flex-row gap-4 items-center justify-between border-purple-500/20">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-nocturne-muted" />
          <input
            type="text"
            placeholder="Search pizzas or toppings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-midnight-950/80 border border-purple-500/25 rounded-full text-xs text-white placeholder-nocturne-muted focus:outline-none focus:border-purple-400"
          />
        </div>

        {/* Sort Select */}
        <div className="w-full md:w-auto flex items-center gap-2 justify-end">
          <span className="text-xs text-nocturne-muted whitespace-nowrap hidden sm:inline">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-midnight-950/90 border border-purple-500/25 rounded-full px-4 py-2 text-xs text-white focus:outline-none focus:border-purple-400 cursor-pointer"
          >
            <option value="recommended">Chef Recommended</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="popular">Most Popular</option>
          </select>
        </div>
      </div>

      {/* Pizza Grid: 2 columns with rich Nocturne cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="cyber-card h-52 skeleton"></div>
          ))}
        </div>
      ) : filteredPizzas.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredPizzas.map((pizza) => (
            <PizzaCard key={pizza._id} pizza={pizza} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 cyber-card max-w-md mx-auto p-8 border-purple-500/20">
          <Frown size={44} className="text-nocturne-muted mx-auto mb-3" />
          <h3 className="text-lg font-display font-bold text-white">No Pizzas Found</h3>
          <p className="text-nocturne-muted text-xs mt-1 mb-4 font-sans">
            We couldn't find anything matching "{searchQuery}". Try a different keyword or reset filters.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('All');
              setSearchQuery('');
            }}
            className="btn-secondary !px-5 !py-2 text-xs"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Custom Pizza Builder Teaser CTA */}
      <div className="cyber-card p-8 sm:p-10 border-purple-500/25 bg-gradient-to-r from-veloce-900/50 via-midnight-900 to-midnight-950 flex flex-col md:flex-row items-center justify-between gap-6 shadow-glow-violet">
        <div className="space-y-2 text-center md:text-left">
          <span className="badge bg-nocturne-pink/20 text-nocturne-pink border border-nocturne-pink/35 text-[10px] tracking-wider uppercase font-bold">
            ✨ Interactive Pizza Lab
          </span>
          <h3 className="text-2xl font-display font-bold text-white">
            Craving a Custom Recipe?
          </h3>
          <p className="text-nocturne-lavender/80 text-xs sm:text-sm font-sans max-w-xl">
            Pick your dough base, signature sauces, cheeses, and toppings in our interactive 3D visual builder!
          </p>
        </div>
        <Link to="/custom-pizza" className="btn-primary !px-8 !py-3 text-xs whitespace-nowrap shadow-glow-violet">
          Open Pizza Lab 🍕
        </Link>
      </div>
    </div>
  );
}
