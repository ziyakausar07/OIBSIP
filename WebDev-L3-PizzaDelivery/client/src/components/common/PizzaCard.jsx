import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { Plus, Minus, Sliders, Check, Sparkles } from 'lucide-react';
import { useState } from 'react';

export default function PizzaCard({ pizza }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('8"');

  const handleQuickAdd = () => {
    if (!pizza.isAvailable) return;

    const sizeMultiplier = selectedSize === '12"' ? 1.4 : 1.0;
    const finalPrice = Math.round(pizza.basePrice * sizeMultiplier);

    const item = {
      pizza: pizza._id,
      name: pizza.name,
      image: pizza.image,
      size: selectedSize === '12"' ? 'Large' : 'Regular',
      base: pizza.defaultIngredients?.base
        ? {
            id: pizza.defaultIngredients.base._id || pizza.defaultIngredients.base,
            name: pizza.defaultIngredients.base.name || 'Classic Hand-Tossed',
            price: pizza.defaultIngredients.base.price || 0,
          }
        : null,
      sauce: pizza.defaultIngredients?.sauce
        ? {
            id: pizza.defaultIngredients.sauce._id || pizza.defaultIngredients.sauce,
            name: pizza.defaultIngredients.sauce.name || 'Classic Marinara',
            price: pizza.defaultIngredients.sauce.price || 0,
          }
        : null,
      cheese: pizza.defaultIngredients?.cheese
        ? {
            id: pizza.defaultIngredients.cheese._id || pizza.defaultIngredients.cheese,
            name: pizza.defaultIngredients.cheese.name || 'Mozzarella',
            price: pizza.defaultIngredients.cheese.price || 0,
          }
        : null,
      veggies: (pizza.defaultIngredients?.veggies || []).map((v) => ({
        id: v._id || v,
        name: v.name || 'Topping',
        price: v.price || 0,
      })),
      itemPrice: finalPrice,
      quantity: quantity,
    };

    addItem(item);
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  };

  const currentPrice = Math.round(pizza.basePrice * (selectedSize === '12"' ? 1.4 : 1.0));

  return (
    <div className="cyber-card p-5 group hover:border-purple-400/50 hover:shadow-glow-violet transition-all duration-300 flex flex-col justify-between relative hover:-translate-y-1">
      {/* Top Header: Badge & Category */}
      <div className="flex items-center justify-between mb-3">
        <span className="badge bg-purple-500/15 text-veloce-200 border border-purple-500/25 text-[11px] font-sans">
          {pizza.category}
        </span>
        {pizza.badge && (
          <span className="badge bg-nocturne-pink/20 text-nocturne-pink border border-nocturne-pink/35 text-[10px] font-bold">
            <Sparkles size={11} /> {pizza.badge}
          </span>
        )}
      </div>

      {/* Main Row: Circular Pizza + Title & Size Radios */}
      <div className="flex items-center gap-4 sm:gap-5 mb-4">
        {/* Circular Pizza Disk */}
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 shrink-0">
          <img
            src={pizza.image}
            alt={pizza.name}
            className="w-full h-full object-cover rounded-full shadow-[0_8px_25px_rgba(0,0,0,0.8)] border-2 border-purple-500/20 group-hover:scale-105 group-hover:rotate-6 transition-transform duration-500"
            loading="lazy"
          />
          {!pizza.isAvailable && (
            <div className="absolute inset-0 bg-midnight-950/85 backdrop-blur-sm rounded-full flex items-center justify-center">
              <span className="text-[10px] font-bold text-nocturne-pink uppercase">Sold Out</span>
            </div>
          )}
        </div>

        {/* Title, Details, and Size Radios */}
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-bold text-base sm:text-lg text-white group-hover:text-nocturne-lavender transition-colors truncate">
            {pizza.name}
          </h3>
          <p className="text-nocturne-muted text-xs line-clamp-2 mt-1 leading-relaxed">
            {pizza.description}
          </p>

          {/* Nocturne Size Selectors (with Magenta Radio Dot) */}
          <div className="flex items-center gap-3 mt-3">
            <button
              type="button"
              onClick={() => setSelectedSize('8"')}
              className="flex items-center gap-1.5 text-xs text-nocturne-lavender hover:text-white transition-colors cursor-pointer"
            >
              <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-all ${
                selectedSize === '8"'
                  ? 'border-nocturne-pink bg-nocturne-pink/20'
                  : 'border-white/30'
              }`}>
                {selectedSize === '8"' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-nocturne-pink"></span>
                )}
              </span>
              <span className="font-medium">8"</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedSize('12"')}
              className="flex items-center gap-1.5 text-xs text-nocturne-lavender hover:text-white transition-colors cursor-pointer"
            >
              <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-all ${
                selectedSize === '12"'
                  ? 'border-nocturne-pink bg-nocturne-pink/20'
                  : 'border-white/30'
              }`}>
                {selectedSize === '12"' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-nocturne-pink"></span>
                )}
              </span>
              <span className="font-medium">12"</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Row: Price, Quantity Pill & Add to cart button */}
      <div className="pt-3 border-t border-purple-500/15 flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="text-[10px] uppercase font-sans text-nocturne-muted block">
            Price
          </span>
          <span className="text-xl font-display font-extrabold text-white">
            ₹{currentPrice}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Quantity Pill Counter */}
          <div className="flex items-center bg-midnight-950/80 border border-purple-500/25 rounded-full px-2 py-1 text-xs">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="w-5 h-5 rounded-full flex items-center justify-center text-nocturne-lavender hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Decrease quantity"
            >
              <Minus size={12} />
            </button>
            <span className="w-6 text-center font-bold text-white text-xs">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity((q) => q + 1)}
              className="w-5 h-5 rounded-full flex items-center justify-center text-nocturne-lavender hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Increase quantity"
            >
              <Plus size={12} />
            </button>
          </div>

          {/* Add to Cart Pill Button */}
          <button
            onClick={handleQuickAdd}
            disabled={!pizza.isAvailable}
            className={`btn-primary !px-4 !py-2 text-xs rounded-full font-medium flex items-center gap-1.5 shadow-glow-violet transition-all ${
              added ? '!bg-emerald-500 !text-white' : ''
            }`}
          >
            {added ? (
              <>
                <Check size={14} />
                <span>Added</span>
              </>
            ) : (
              <span>Add to cart</span>
            )}
          </button>

          {/* Customizer link */}
          <Link
            to={`/custom-pizza?pizzaId=${pizza._id}`}
            className="p-2 rounded-full bg-midnight-950/80 border border-purple-500/20 text-nocturne-lavender hover:text-white hover:border-purple-400 transition-all"
            title="Customize in Pizza Lab"
          >
            <Sliders size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
