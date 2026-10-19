import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';

const CartContext = createContext(null);

export const useCart = () => useContext(CartContext);

const STORAGE_KEY = 'slicecraft_cart';

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Persist cart to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = useCallback((item) => {
    setItems((prev) => {
      // Generate a unique cart item ID based on selections
      const cartId = `${item.pizza || 'custom'}_${item.base?.id}_${item.sauce?.id}_${item.cheese?.id}_${(item.veggies || []).map(v => v.id).sort().join('-')}_${item.size || 'Medium'}`;
      const existing = prev.find((i) => i.cartId === cartId);
      if (existing) {
        toast.success(`Updated quantity for ${item.name}`);
        return prev.map((i) =>
          i.cartId === cartId
            ? { ...i, quantity: i.quantity + (item.quantity || 1) }
            : i
        );
      }
      toast.success(`${item.name} added to cart! 🍕`);
      return [...prev, { ...item, cartId, quantity: item.quantity || 1 }];
    });
  }, []);

  const updateQuantity = useCallback((cartId, quantity) => {
    if (quantity < 1) return;
    setItems((prev) =>
      prev.map((i) => (i.cartId === cartId ? { ...i, quantity } : i))
    );
  }, []);

  const removeItem = useCallback((cartId) => {
    setItems((prev) => prev.filter((i) => i.cartId !== cartId));
    toast.success('Item removed from cart');
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const getSubtotal = useCallback(() => {
    return items.reduce((sum, item) => sum + item.itemPrice * item.quantity, 0);
  }, [items]);

  const getTax = useCallback(() => {
    return Math.round(getSubtotal() * 0.05);
  }, [getSubtotal]);

  const getDeliveryFee = useCallback(() => {
    return getSubtotal() >= 500 ? 0 : 40;
  }, [getSubtotal]);

  const getTotal = useCallback(() => {
    return getSubtotal() + getTax() + getDeliveryFee();
  }, [getSubtotal, getTax, getDeliveryFee]);

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        getSubtotal,
        getTax,
        getDeliveryFee,
        getTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
