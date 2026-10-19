/**
 * Seed script — populates MongoDB with sample ingredients, inventory, and pizzas.
 * Run with: npm run seed
 */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Ingredient = require('../models/Ingredient');
const Inventory = require('../models/Inventory');
const Pizza = require('../models/Pizza');
const InventoryTransaction = require('../models/InventoryTransaction');

const ingredients = [
  // ── Bases ─────────────────────────────
  { name: 'Classic Hand-Tossed', category: 'base', price: 0, description: 'Traditional stretchy dough, crispy edges', image: '🫓' },
  { name: 'Thin Crust', category: 'base', price: 20, description: 'Extra thin & crispy Roman style', image: '🥖' },
  { name: 'Thick Crust', category: 'base', price: 30, description: 'Fluffy deep-dish pan style', image: '🍞' },
  { name: 'Whole Wheat', category: 'base', price: 25, description: 'Healthy whole grain base', image: '🌾' },
  { name: 'Cheese-Stuffed Crust', category: 'base', price: 60, description: 'Mozzarella-stuffed edge ring', image: '🧀' },

  // ── Sauces ────────────────────────────
  { name: 'Classic Marinara', category: 'sauce', price: 0, description: 'San Marzano tomato basil sauce', image: '🍅' },
  { name: 'Creamy Alfredo', category: 'sauce', price: 30, description: 'Rich garlic parmesan cream', image: '🥛' },
  { name: 'Spicy Arrabbiata', category: 'sauce', price: 15, description: 'Chili-infused tomato fire', image: '🌶️' },
  { name: 'Pesto Basil', category: 'sauce', price: 35, description: 'Fresh basil & pine nut blend', image: '🌿' },
  { name: 'BBQ Smoky', category: 'sauce', price: 25, description: 'Hickory smoked barbecue', image: '🔥' },

  // ── Cheeses ───────────────────────────
  { name: 'Mozzarella', category: 'cheese', price: 0, description: 'Classic stretchy mozzarella', image: '🧀' },
  { name: 'Cheddar Blend', category: 'cheese', price: 25, description: 'Sharp aged cheddar mix', image: '🧈' },
  { name: 'Parmesan', category: 'cheese', price: 35, description: 'Imported Parmigiano-Reggiano', image: '🇮🇹' },
  { name: 'Vegan Cashew Cheese', category: 'cheese', price: 40, description: 'Plant-based cashew melt', image: '🥜' },
  { name: 'Four Cheese Blend', category: 'cheese', price: 50, description: 'Mozzarella, cheddar, gouda, parmesan', image: '✨' },

  // ── Veggies / Toppings ────────────────
  { name: 'Bell Peppers', category: 'veggie', price: 20, description: 'Tri-color sweet peppers', image: '🫑' },
  { name: 'Mushrooms', category: 'veggie', price: 25, description: 'Fresh button mushrooms', image: '🍄' },
  { name: 'Red Onions', category: 'veggie', price: 15, description: 'Thinly sliced red onion rings', image: '🧅' },
  { name: 'Black Olives', category: 'veggie', price: 30, description: 'Mediterranean black olives', image: '🫒' },
  { name: 'Jalapeños', category: 'veggie', price: 15, description: 'Fiery sliced jalapeños', image: '🌶️' },
  { name: 'Sweet Corn', category: 'veggie', price: 15, description: 'Golden sweet corn kernels', image: '🌽' },
  { name: 'Fresh Tomatoes', category: 'veggie', price: 15, description: 'Vine-ripened tomato slices', image: '🍅' },
  { name: 'Baby Spinach', category: 'veggie', price: 20, description: 'Fresh baby spinach leaves', image: '🥬' },
  { name: 'Pineapple', category: 'veggie', price: 25, description: 'Tropical pineapple chunks', image: '🍍' },
  { name: 'Sun-Dried Tomatoes', category: 'veggie', price: 35, description: 'Intensely flavored sun-dried', image: '☀️' },
];

const run = async () => {
  try {
    await connectDB();
    console.log('\n🌱 Starting database seed...\n');

    // Clear existing data
    await Ingredient.deleteMany({});
    await Inventory.deleteMany({});
    await Pizza.deleteMany({});
    await InventoryTransaction.deleteMany({});
    console.log('   ✓ Cleared existing seed data');

    // Insert ingredients
    const createdIngredients = await Ingredient.insertMany(ingredients);
    console.log(`   ✓ Inserted ${createdIngredients.length} ingredients`);

    // Create inventory records for each ingredient
    const inventoryDocs = createdIngredients.map((ing) => ({
      ingredient: ing._id,
      itemName: ing.name,
      category: ing.category,
      quantity: Math.floor(80 + Math.random() * 120), // 80-200
      unit: 'portions',
      lowStockThreshold: 20,
    }));
    const createdInventory = await Inventory.insertMany(inventoryDocs);
    console.log(`   ✓ Created ${createdInventory.length} inventory records`);

    // Log initial seed transactions
    const txDocs = createdInventory.map((inv) => ({
      inventoryItem: inv._id,
      ingredient: inv.ingredient,
      itemName: inv.itemName,
      type: 'INITIAL_SEED',
      quantity: inv.quantity,
      previousStock: 0,
      newStock: inv.quantity,
      reason: 'Initial database seed',
    }));
    await InventoryTransaction.insertMany(txDocs);
    console.log(`   ✓ Logged ${txDocs.length} seed transactions`);

    // Build ingredient lookup by name
    const byName = {};
    for (const ing of createdIngredients) {
      byName[ing.name] = ing._id;
    }

    // Seed sample pizzas
    const pizzas = [
      {
        name: 'Margherita Classic',
        slug: 'margherita-classic',
        description: 'The timeless Neapolitan classic — San Marzano tomato sauce, fresh mozzarella, and aromatic basil on a perfectly blistered hand-tossed base.',
        image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500&q=80',
        category: 'Classic',
        basePrice: 199,
        isFeatured: true,
        badge: 'Bestseller',
        defaultIngredients: {
          base: byName['Classic Hand-Tossed'],
          sauce: byName['Classic Marinara'],
          cheese: byName['Mozzarella'],
          veggies: [byName['Fresh Tomatoes'], byName['Baby Spinach']],
        },
      },
      {
        name: 'Farmhouse Veggie',
        slug: 'farmhouse-veggie',
        description: 'A garden-fresh celebration loaded with crunchy bell peppers, mushrooms, sweet corn, onions, and olives on a wholesome whole wheat base.',
        image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&q=80',
        category: 'Veg',
        basePrice: 249,
        isFeatured: true,
        badge: 'Popular',
        defaultIngredients: {
          base: byName['Whole Wheat'],
          sauce: byName['Classic Marinara'],
          cheese: byName['Mozzarella'],
          veggies: [byName['Bell Peppers'], byName['Mushrooms'], byName['Sweet Corn'], byName['Red Onions'], byName['Black Olives']],
        },
      },
      {
        name: 'Pesto Paradise',
        slug: 'pesto-paradise',
        description: 'Vibrant basil pesto base topped with sun-dried tomatoes, mushrooms, baby spinach, and aged parmesan shavings.',
        image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&q=80',
        category: 'Gourmet',
        basePrice: 349,
        isFeatured: true,
        badge: 'Chef Special',
        defaultIngredients: {
          base: byName['Thin Crust'],
          sauce: byName['Pesto Basil'],
          cheese: byName['Parmesan'],
          veggies: [byName['Sun-Dried Tomatoes'], byName['Mushrooms'], byName['Baby Spinach']],
        },
      },
      {
        name: 'Smoky BBQ Delight',
        slug: 'smoky-bbq-delight',
        description: 'Hickory BBQ sauce base with caramelized onions, bell peppers, jalapeños, and a rich four-cheese blend on thick crust.',
        image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500&q=80',
        category: 'Special',
        basePrice: 329,
        isFeatured: true,
        badge: 'New',
        defaultIngredients: {
          base: byName['Thick Crust'],
          sauce: byName['BBQ Smoky'],
          cheese: byName['Four Cheese Blend'],
          veggies: [byName['Red Onions'], byName['Bell Peppers'], byName['Jalapeños']],
        },
      },
      {
        name: 'Alfredo Supreme',
        slug: 'alfredo-supreme',
        description: 'Luxurious creamy alfredo sauce with mushrooms, baby spinach, and a lavish cheddar blend on cheese-stuffed crust.',
        image: 'https://images.unsplash.com/photo-1588315029754-2dd089d39a1a?w=500&q=80',
        category: 'Gourmet',
        basePrice: 379,
        isFeatured: false,
        badge: '',
        defaultIngredients: {
          base: byName['Cheese-Stuffed Crust'],
          sauce: byName['Creamy Alfredo'],
          cheese: byName['Cheddar Blend'],
          veggies: [byName['Mushrooms'], byName['Baby Spinach']],
        },
      },
      {
        name: 'Tropical Hawaiian',
        slug: 'tropical-hawaiian',
        description: 'Sweet pineapple chunks, bell peppers, and fresh mushrooms with mozzarella on a classic hand-tossed base.',
        image: 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=500&q=80',
        category: 'Special',
        basePrice: 279,
        isFeatured: false,
        badge: '',
        defaultIngredients: {
          base: byName['Classic Hand-Tossed'],
          sauce: byName['Classic Marinara'],
          cheese: byName['Mozzarella'],
          veggies: [byName['Pineapple'], byName['Bell Peppers'], byName['Mushrooms']],
        },
      },
      {
        name: 'Spicy Diavola',
        slug: 'spicy-diavola',
        description: 'Fiery arrabbiata sauce loaded with jalapeños, red onions, and olives — topped with a bold four-cheese melt on thin crust.',
        image: 'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=500&q=80',
        category: 'Special',
        basePrice: 299,
        isFeatured: false,
        badge: 'Spicy 🔥',
        defaultIngredients: {
          base: byName['Thin Crust'],
          sauce: byName['Spicy Arrabbiata'],
          cheese: byName['Four Cheese Blend'],
          veggies: [byName['Jalapeños'], byName['Red Onions'], byName['Black Olives']],
        },
      },
      {
        name: 'Vegan Garden',
        slug: 'vegan-garden',
        description: 'A 100% plant-based pizza with cashew cheese, pesto, fresh veggies, and sun-dried tomatoes on whole wheat.',
        image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=500&q=80',
        category: 'Veg',
        basePrice: 319,
        isFeatured: false,
        badge: 'Vegan 🌱',
        defaultIngredients: {
          base: byName['Whole Wheat'],
          sauce: byName['Pesto Basil'],
          cheese: byName['Vegan Cashew Cheese'],
          veggies: [byName['Bell Peppers'], byName['Mushrooms'], byName['Sun-Dried Tomatoes'], byName['Baby Spinach']],
        },
      },
    ];

    const createdPizzas = await Pizza.insertMany(pizzas);
    console.log(`   ✓ Inserted ${createdPizzas.length} sample pizzas`);

    console.log('\n✅ Database seeded successfully!\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Seed error:', error.message);
    process.exit(1);
  }
};

run();
