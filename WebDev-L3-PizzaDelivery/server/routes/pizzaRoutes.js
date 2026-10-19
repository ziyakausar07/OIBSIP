const express = require('express');
const router = express.Router();
const {
  getPizzas,
  getPizzaById,
  getIngredients,
  createPizza,
  updatePizza,
  deletePizza,
} = require('../controllers/pizzaController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/pizzas', getPizzas);
router.get('/pizzas/:id', getPizzaById);
router.get('/ingredients', getIngredients);

// Admin-only catalog modifications
router.post('/pizzas', protect, adminOnly, createPizza);
router.put('/pizzas/:id', protect, adminOnly, updatePizza);
router.delete('/pizzas/:id', protect, adminOnly, deletePizza);

module.exports = router;
