const Inventory = require('../models/Inventory');
const InventoryTransaction = require('../models/InventoryTransaction');
const { emitInventoryUpdated } = require('../config/socket');

/**
 * Aggregates required ingredient quantities across all items in an order.
 */
const aggregateRequiredIngredients = (items) => {
  const requirements = {}; // ingredientId -> { name, quantity }

  for (const item of items) {
    const qty = item.quantity || 1;

    // Base
    const baseId = (item.base?.id || item.base).toString();
    requirements[baseId] = {
      name: item.base?.name || 'Base',
      quantity: (requirements[baseId]?.quantity || 0) + qty,
    };

    // Sauce
    const sauceId = (item.sauce?.id || item.sauce).toString();
    requirements[sauceId] = {
      name: item.sauce?.name || 'Sauce',
      quantity: (requirements[sauceId]?.quantity || 0) + qty,
    };

    // Cheese
    const cheeseId = (item.cheese?.id || item.cheese).toString();
    requirements[cheeseId] = {
      name: item.cheese?.name || 'Cheese',
      quantity: (requirements[cheeseId]?.quantity || 0) + qty,
    };

    // Veggies
    for (const veg of item.veggies || []) {
      const vegId = (veg.id || veg).toString();
      requirements[vegId] = {
        name: veg.name || 'Vegetable',
        quantity: (requirements[vegId]?.quantity || 0) + qty,
      };
    }
  }

  return requirements;
};

/**
 * Checks if all required ingredients have sufficient inventory in stock.
 */
const checkStockAvailability = async (items) => {
  const requirements = aggregateRequiredIngredients(items);
  const ingredientIds = Object.keys(requirements);

  const inventoryItems = await Inventory.find({ ingredient: { $in: ingredientIds } });
  const invMap = {};
  for (const inv of inventoryItems) {
    invMap[inv.ingredient.toString()] = inv;
  }

  const outOfStockItems = [];

  for (const [ingId, req] of Object.entries(requirements)) {
    const inv = invMap[ingId];
    if (!inv || inv.quantity < req.quantity) {
      outOfStockItems.push({
        ingredientId: ingId,
        name: inv?.itemName || req.name,
        available: inv ? inv.quantity : 0,
        required: req.quantity,
      });
    }
  }

  return {
    isAvailable: outOfStockItems.length === 0,
    outOfStockItems,
  };
};

/**
 * Concurrency-safe atomic deduction of stock for a verified order.
 * Rolls back previously deducted ingredients if an ingredient runs out mid-operation.
 */
const deductStockForOrder = async (order, performedBy = null) => {
  if (order.stockDeducted) {
    return { success: true, message: 'Stock already deducted for this order.' };
  }

  const requirements = aggregateRequiredIngredients(order.items);
  const deductionsCompleted = [];

  try {
    for (const [ingId, req] of Object.entries(requirements)) {
      // Find and deduct atomically only if quantity >= req.quantity
      const updatedInv = await Inventory.findOneAndUpdate(
        {
          ingredient: ingId,
          quantity: { $gte: req.quantity },
        },
        {
          $inc: { quantity: -req.quantity },
        },
        { new: false } // return original to track previousStock
      );

      if (!updatedInv) {
        // Stock exhaustion or race condition! Roll back already deducted ingredients
        throw new Error(`Insufficient stock available for '${req.name}'. Stock deduction failed.`);
      }

      const prevStock = updatedInv.quantity;
      const newStock = prevStock - req.quantity;

      deductionsCompleted.push({
        invId: updatedInv._id,
        ingredientId: ingId,
        itemName: updatedInv.itemName,
        quantity: req.quantity,
        previousStock: prevStock,
        newStock: newStock,
      });
    }

    // Record transactions and trigger socket updates
    for (const d of deductionsCompleted) {
      await InventoryTransaction.create({
        inventoryItem: d.invId,
        ingredient: d.ingredientId,
        itemName: d.itemName,
        type: 'DEDUCTION',
        quantity: d.quantity,
        previousStock: d.previousStock,
        newStock: d.newStock,
        reason: `Order #${order.orderNumber} deduction`,
        orderId: order._id,
        performedBy: performedBy,
      });

      emitInventoryUpdated({
        _id: d.invId,
        itemName: d.itemName,
        quantity: d.newStock,
      });
    }

    order.stockDeducted = true;
    await order.save();

    return { success: true, deductions: deductionsCompleted };
  } catch (error) {
    // Rollback any completed deductions
    console.error(`[Inventory Rollback] Initiating rollback due to error: ${error.message}`);
    for (const d of deductionsCompleted) {
      try {
        await Inventory.findByIdAndUpdate(d.invId, {
          $inc: { quantity: d.quantity },
        });
      } catch (rbErr) {
        console.error(`[Inventory Rollback Error] Failed to rollback ${d.itemName}:`, rbErr.message);
      }
    }
    throw error;
  }
};

/**
 * Manually adjust stock (increase or decrease) by an administrator.
 */
const adjustStock = async (itemId, quantityDelta, reason, performedBy) => {
  const inv = await Inventory.findById(itemId);
  if (!inv) {
    throw new Error('Inventory item not found');
  }

  const previousStock = inv.quantity;
  const newStock = previousStock + quantityDelta;

  if (newStock < 0) {
    throw new Error(`Adjustment would result in negative stock (${newStock} ${inv.unit})`);
  }

  inv.quantity = newStock;
  // If restocked above threshold, reset the alert flag so future low stock can trigger an alert
  if (newStock > inv.lowStockThreshold && inv.alertSent) {
    inv.alertSent = false;
  }
  if (quantityDelta > 0) {
    inv.lastRestockedAt = new Date();
  }

  await inv.save();

  await InventoryTransaction.create({
    inventoryItem: inv._id,
    ingredient: inv.ingredient,
    itemName: inv.itemName,
    type: quantityDelta > 0 ? 'RESTOCK' : 'ADJUSTMENT',
    quantity: Math.abs(quantityDelta),
    previousStock,
    newStock,
    reason: reason || (quantityDelta > 0 ? 'Manual Restock' : 'Manual Adjustment'),
    performedBy,
  });

  emitInventoryUpdated(inv);

  return inv;
};

module.exports = {
  aggregateRequiredIngredients,
  checkStockAvailability,
  deductStockForOrder,
  adjustStock,
};
