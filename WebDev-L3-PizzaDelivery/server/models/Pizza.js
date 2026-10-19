const mongoose = require('mongoose');

const pizzaSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Pizza name is required'],
      trim: true,
      unique: true,
    },
    slug: {
      type: String,
      lowercase: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ['Veg', 'Non-Veg', 'Gourmet', 'Classic', 'Special'],
      default: 'Classic',
      index: true,
    },
    basePrice: {
      type: Number,
      required: true,
      min: 0,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    badge: {
      type: String,
      default: '', // e.g. "Bestseller", "Chef Special", "New"
    },
    defaultIngredients: {
      base: { type: mongoose.Schema.Types.ObjectId, ref: 'Ingredient' },
      sauce: { type: mongoose.Schema.Types.ObjectId, ref: 'Ingredient' },
      cheese: { type: mongoose.Schema.Types.ObjectId, ref: 'Ingredient' },
      veggies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Ingredient' }],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Pizza', pizzaSchema);
