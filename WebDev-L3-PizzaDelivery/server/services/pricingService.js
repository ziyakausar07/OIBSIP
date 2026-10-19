const Ingredient = require('../models/Ingredient');
const Pizza = require('../models/Pizza');

/**
 * Validates and calculates trusted server-side pricing for an order item.
 * Never trusts prices sent from the client.
 */
const calculateItemPrice = async (item) => {
  let basePrice = 0;
  let itemName = item.name || 'Custom Pizza';

  if (item.pizza) {
    const pizza = await Pizza.findById(item.pizza);
    if (!pizza || !pizza.isAvailable) {
      throw new Error(`Pizza '${item.name || 'selected'}' is currently unavailable`);
    }
    basePrice = pizza.basePrice;
    itemName = pizza.name;
  }

  // Fetch Base
  const baseIng = await Ingredient.findById(item.base?.id || item.base);
  if (!baseIng || !baseIng.isAvailable) {
    throw new Error(`Selected base '${item.base?.name || 'Base'}' is unavailable`);
  }

  // Fetch Sauce
  const sauceIng = await Ingredient.findById(item.sauce?.id || item.sauce);
  if (!sauceIng || !sauceIng.isAvailable) {
    throw new Error(`Selected sauce '${item.sauce?.name || 'Sauce'}' is unavailable`);
  }

  // Fetch Cheese
  const cheeseIng = await Ingredient.findById(item.cheese?.id || item.cheese);
  if (!cheeseIng || !cheeseIng.isAvailable) {
    throw new Error(`Selected cheese '${item.cheese?.name || 'Cheese'}' is unavailable`);
  }

  // Fetch Veggies
  const veggieIds = (item.veggies || []).map((v) => (v.id ? v.id : v));
  const veggieIngs = await Ingredient.find({ _id: { $in: veggieIds } });
  if (veggieIngs.length !== veggieIds.length) {
    throw new Error('One or more selected vegetables are invalid or unavailable');
  }

  // Size multiplier
  const sizeMultipliers = {
    Regular: 1.0,
    Medium: 1.25,
    Large: 1.5,
  };
  const size = item.size || 'Medium';
  const multiplier = sizeMultipliers[size] || 1.25;

  // Additional ingredient costs
  const ingredientsCost =
    baseIng.price +
    sauceIng.price +
    cheeseIng.price +
    veggieIngs.reduce((sum, v) => sum + v.price, 0);

  // If custom pizza without pre-set pizza basePrice, calculate from ingredients with a base crust charge
  const rawUnitPrice = basePrice > 0 ? basePrice + ingredientsCost : Math.max(149, ingredientsCost + 99);
  const finalUnitPrice = Math.round(rawUnitPrice * multiplier);
  const quantity = Math.max(1, parseInt(item.quantity || 1, 10));
  const subtotal = finalUnitPrice * quantity;

  return {
    pizza: item.pizza || null,
    name: itemName,
    size,
    base: { id: baseIng._id, name: baseIng.name, price: baseIng.price },
    sauce: { id: sauceIng._id, name: sauceIng.name, price: sauceIng.price },
    cheese: { id: cheeseIng._id, name: cheeseIng.name, price: cheeseIng.price },
    veggies: veggieIngs.map((v) => ({ id: v._id, name: v.name, price: v.price })),
    quantity,
    itemPrice: finalUnitPrice,
    subtotal,
  };
};

/**
 * Calculates complete trusted order pricing summary
 */
const calculateOrderPricing = async (items) => {
  if (!items || !items.length) {
    throw new Error('Order must contain at least one item');
  }

  const verifiedItems = [];
  let subtotal = 0;

  for (const item of items) {
    const verifiedItem = await calculateItemPrice(item);
    verifiedItems.push(verifiedItem);
    subtotal += verifiedItem.subtotal;
  }

  const tax = Math.round(subtotal * 0.05); // 5% GST
  const deliveryFee = subtotal >= 500 ? 0 : 40; // Free delivery above ₹500
  const total = subtotal + tax + deliveryFee;

  return {
    items: verifiedItems,
    pricing: {
      subtotal,
      tax,
      deliveryFee,
      total,
    },
  };
};

module.exports = {
  calculateItemPrice,
  calculateOrderPricing,
};
