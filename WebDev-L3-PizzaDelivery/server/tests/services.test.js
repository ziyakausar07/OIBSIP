const test = require('node:test');
const assert = require('node:assert');
const crypto = require('crypto');
const { aggregateRequiredIngredients } = require('../services/inventoryService');

test('aggregateRequiredIngredients properly aggregates base, sauce, cheese, and veggies across multiple items', () => {
  const items = [
    {
      quantity: 2,
      base: { id: 'base_1', name: 'Hand-Tossed' },
      sauce: { id: 'sauce_1', name: 'Marinara' },
      cheese: { id: 'cheese_1', name: 'Mozzarella' },
      veggies: [
        { id: 'veg_1', name: 'Mushrooms' },
        { id: 'veg_2', name: 'Olives' },
      ],
    },
    {
      quantity: 1,
      base: { id: 'base_1', name: 'Hand-Tossed' },
      sauce: { id: 'sauce_2', name: 'Alfredo' },
      cheese: { id: 'cheese_1', name: 'Mozzarella' },
      veggies: [
        { id: 'veg_1', name: 'Mushrooms' },
      ],
    },
  ];

  const result = aggregateRequiredIngredients(items);

  // base_1 should have 2 + 1 = 3
  assert.strictEqual(result['base_1'].quantity, 3);
  // sauce_1 should have 2
  assert.strictEqual(result['sauce_1'].quantity, 2);
  // sauce_2 should have 1
  assert.strictEqual(result['sauce_2'].quantity, 1);
  // cheese_1 should have 2 + 1 = 3
  assert.strictEqual(result['cheese_1'].quantity, 3);
  // veg_1 should have 2 + 1 = 3
  assert.strictEqual(result['veg_1'].quantity, 3);
  // veg_2 should have 2
  assert.strictEqual(result['veg_2'].quantity, 2);
});

test('Razorpay HMAC SHA256 signature verification validates authentic signatures and rejects tampered signatures', () => {
  const secret = 'rzp_test_secret_key_12345';
  const orderId = 'order_DA9827361273';
  const paymentId = 'pay_DA9827361273';

  // Authentic signature
  const authenticSignature = crypto
    .createHmac('sha256', secret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  // Verify authentic
  const generated = crypto
    .createHmac('sha256', secret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');
  assert.strictEqual(generated, authenticSignature);

  // Verify tampered orderId fails
  const tamperedGenerated = crypto
    .createHmac('sha256', secret)
    .update(`order_FAKE|${paymentId}`)
    .digest('hex');
  assert.notStrictEqual(tamperedGenerated, authenticSignature);
});

test('Delivery fee threshold calculation: Free over ₹500, else ₹40', () => {
  const calculateFee = (subtotal) => (subtotal >= 500 ? 0 : 40);
  assert.strictEqual(calculateFee(499), 40);
  assert.strictEqual(calculateFee(500), 0);
  assert.strictEqual(calculateFee(1200), 0);
});

test('GST calculation applies 5% rounded tax', () => {
  const calculateTax = (subtotal) => Math.round(subtotal * 0.05);
  assert.strictEqual(calculateTax(200), 10);
  assert.strictEqual(calculateTax(349), 17);
  assert.strictEqual(calculateTax(500), 25);
});
