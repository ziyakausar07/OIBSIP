const Pizza = require('../models/Pizza');
const Ingredient = require('../models/Ingredient');
const Inventory = require('../models/Inventory');

// @desc    Get all available pizzas with filtering
// @route   GET /api/pizzas
const getPizzas = async (req, res, next) => {
  try {
    const { category, search, featured } = req.query;
    const filter = { isAvailable: true };

    if (category && category !== 'All') {
      filter.category = category;
    }

    if (featured === 'true') {
      filter.isFeatured = true;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const pizzas = await Pizza.find(filter)
      .populate('defaultIngredients.base')
      .populate('defaultIngredients.sauce')
      .populate('defaultIngredients.cheese')
      .populate('defaultIngredients.veggies')
      .sort({ isFeatured: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: pizzas.length,
      pizzas,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get pizza by ID
// @route   GET /api/pizzas/:id
const getPizzaById = async (req, res, next) => {
  try {
    const pizza = await Pizza.findById(req.params.id)
      .populate('defaultIngredients.base')
      .populate('defaultIngredients.sauce')
      .populate('defaultIngredients.cheese')
      .populate('defaultIngredients.veggies');

    if (!pizza) {
      return res.status(404).json({ success: false, message: 'Pizza not found' });
    }

    res.status(200).json({ success: true, pizza });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all ingredients categorized for Custom Pizza Builder
// @route   GET /api/ingredients
const getIngredients = async (req, res, next) => {
  try {
    const ingredients = await Ingredient.find().sort({ price: 1 });
    const inventory = await Inventory.find();

    // Map inventory stock to ingredients
    const invMap = {};
    for (const item of inventory) {
      invMap[item.ingredient.toString()] = {
        quantity: item.quantity,
        isOutOfStock: item.quantity <= 0,
        isLowStock: item.quantity <= item.lowStockThreshold,
      };
    }

    const grouped = {
      bases: [],
      sauces: [],
      cheeses: [],
      veggies: [],
    };

    const allEnhanced = [];
    for (const ing of ingredients) {
      const stock = invMap[ing._id.toString()] || { quantity: 50, isOutOfStock: false };
      const enhanced = {
        ...ing.toObject(),
        stockQuantity: stock.quantity,
        isOutOfStock: stock.isOutOfStock || !ing.isAvailable,
      };

      allEnhanced.push(enhanced);

      if (ing.category === 'base') grouped.bases.push(enhanced);
      else if (ing.category === 'sauce') grouped.sauces.push(enhanced);
      else if (ing.category === 'cheese') grouped.cheeses.push(enhanced);
      else if (ing.category === 'veggie') grouped.veggies.push(enhanced);
    }

    res.status(200).json({
      success: true,
      ingredients: allEnhanced,
      grouped,
      raw: ingredients,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new pizza (Admin)
// @route   POST /api/pizzas
const createPizza = async (req, res, next) => {
  try {
    const pizza = await Pizza.create(req.body);
    res.status(201).json({ success: true, pizza });
  } catch (error) {
    next(error);
  }
};

// @desc    Update pizza (Admin)
// @route   PUT /api/pizzas/:id
const updatePizza = async (req, res, next) => {
  try {
    const pizza = await Pizza.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!pizza) return res.status(404).json({ success: false, message: 'Pizza not found' });
    res.status(200).json({ success: true, pizza });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete pizza (Admin)
// @route   DELETE /api/pizzas/:id
const deletePizza = async (req, res, next) => {
  try {
    const pizza = await Pizza.findByIdAndDelete(req.params.id);
    if (!pizza) return res.status(404).json({ success: false, message: 'Pizza not found' });
    res.status(200).json({ success: true, message: 'Pizza removed successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPizzas,
  getPizzaById,
  getIngredients,
  createPizza,
  updatePizza,
  deletePizza,
};
