const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const SCREENSHOTS_DIR = path.resolve(__dirname, '../../screenshots');
const BASE_URL = 'http://localhost:3000';
const API_URL = 'http://127.0.0.1:5050/api';

async function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function apiLogin(email, password) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!data.success) {
    throw new Error(`Login failed for ${email}: ${data.message || JSON.stringify(data)}`);
  }
  return data;
}

async function capture() {
  if (!fs.existsSync(SCREENSHOTS_DIR)) {
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  }

  console.log('🚀 Starting Screenshot Automation...');
  console.log('📁 Target Directory:', SCREENSHOTS_DIR);

  // Get auth tokens
  console.log('🔑 Authenticating demo customer & admin...');
  const customerAuth = await apiLogin('customer@slicecraft.com', 'Password@123');
  const adminAuth = await apiLogin('admin@slicecraftpizza.com', 'Admin@123');
  console.log('✅ Tokens obtained.');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 1.5 },
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security'],
  });

  const page = await browser.newPage();

  const snap = async (filename, fullPage = false) => {
    const filePath = path.join(SCREENSHOTS_DIR, filename);
    await page.screenshot({ path: filePath, fullPage });
    console.log(`📸 Saved: ${filename}`);
  };

  const setAuth = async (authData) => {
    await page.evaluate((auth) => {
      if (auth) {
        localStorage.setItem('slicecraft_token', auth.token);
        localStorage.setItem('slicecraft_user', JSON.stringify(auth.user));
      } else {
        localStorage.removeItem('slicecraft_token');
        localStorage.removeItem('slicecraft_user');
      }
    }, authData);
  };

  try {
    // 01: Home Page Hero
    console.log('1. Home Hero...');
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle2' });
    await wait(1000);
    await snap('01_home_hero.png');

    // 02: Home Featured Pizzas & Story
    console.log('2. Home Featured & Story...');
    await page.evaluate(() => window.scrollBy(0, 800));
    await wait(800);
    await snap('02_home_featured_pizzas.png');

    // 03: Menu Catalog
    console.log('3. Menu Catalog...');
    await page.goto(`${BASE_URL}/menu`, { waitUntil: 'networkidle2' });
    await wait(1500);
    await snap('03_menu_catalog.png');

    // 04: Custom Pizza - Step 1: Base Crust
    console.log('4. Custom Pizza Builder - Stage 1 Crust...');
    await page.goto(`${BASE_URL}/custom-pizza`, { waitUntil: 'networkidle2' });
    await wait(1200);
    await snap('04_custom_pizza_step1_crust.png');

    // 05: Custom Pizza - Step 2: Sauce
    console.log('5. Custom Pizza Builder - Stage 2 Sauce...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b => b.innerText.includes('STAGE 02') || b.innerText.includes('Sauce'));
      if (btn) btn.click();
    });
    await wait(800);
    await snap('05_custom_pizza_step2_sauce.png');

    // 06: Custom Pizza - Step 3: Cheese
    console.log('6. Custom Pizza Builder - Stage 3 Cheese...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b => b.innerText.includes('STAGE 03') || b.innerText.includes('Cheese'));
      if (btn) btn.click();
    });
    await wait(800);
    await snap('06_custom_pizza_step3_cheese.png');

    // 07: Custom Pizza - Step 4: Veggies & Dynamic Canvas
    console.log('7. Custom Pizza Builder - Stage 4 Veggies...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b => b.innerText.includes('STAGE 04') || b.innerText.includes('Veggies'));
      if (btn) btn.click();
    });
    await wait(800);
    // Click several veggie cards to show selections and price update
    await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('div, button'));
      const items = cards.filter(el => 
        el.innerText && (
          el.innerText.includes('Bell Peppers') ||
          el.innerText.includes('Mushrooms') ||
          el.innerText.includes('Jalapeños')
        )
      );
      items.slice(0, 3).forEach(el => el.click());
    });
    await wait(800);
    await snap('07_custom_pizza_step4_veggies.png');

    // Add custom pizza to cart
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const addBtn = buttons.find(b => b.innerText.includes('Add to Cart') || b.innerText.includes('Add To Cart'));
      if (addBtn) addBtn.click();
    });
    await wait(1000);

    // Also add one catalog pizza to make cart rich
    await page.goto(`${BASE_URL}/menu`, { waitUntil: 'networkidle2' });
    await wait(1000);
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const addBtns = buttons.filter(b => b.innerText.includes('Add to Cart') || b.innerText.includes('Add'));
      if (addBtns.length > 0) addBtns[0].click();
    });
    await wait(1000);

    // 08: Cart & Order Breakdown
    console.log('8. Cart & Order Summary...');
    await page.goto(`${BASE_URL}/cart`, { waitUntil: 'networkidle2' });
    await wait(1200);
    await snap('08_cart_and_order_summary.png');

    // 09: Customer Login Screen
    console.log('9. Customer Login...');
    await setAuth(null);
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle2' });
    await wait(800);
    await snap('09_customer_login.png');

    // 10: Customer Dashboard (Authenticated)
    console.log('10. Customer Dashboard...');
    await setAuth(customerAuth);
    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle2' });
    await wait(1500);
    await snap('10_customer_dashboard.png');

    // 11: Live Order Tracking / Order Details
    console.log('11. Live Order Tracking...');
    await page.goto(`${BASE_URL}/orders/6ad2510246bb13f3b6940d21`, { waitUntil: 'networkidle2' });
    await wait(1500);
    await snap('11_live_order_tracking.png');

    // 12: Admin Login Screen
    console.log('12. Admin Login...');
    await setAuth(null);
    await page.goto(`${BASE_URL}/admin/login`, { waitUntil: 'networkidle2' });
    await wait(800);
    await snap('12_admin_login.png');

    // 13: Admin Dashboard (KPIs, Charts, Summary)
    console.log('13. Admin Dashboard...');
    await setAuth(adminAuth);
    await page.goto(`${BASE_URL}/admin`, { waitUntil: 'networkidle2' });
    await wait(1500);
    await snap('13_admin_dashboard_kpis.png');

    // 14: Admin Inventory & Stock Thresholds
    console.log('14. Admin Inventory Stock...');
    await page.goto(`${BASE_URL}/admin/inventory`, { waitUntil: 'networkidle2' });
    await wait(1500);
    await snap('14_admin_inventory_stock.png');

    // 15: Admin Orders Lifecycle Management
    console.log('15. Admin Orders Management...');
    await page.goto(`${BASE_URL}/admin/orders`, { waitUntil: 'networkidle2' });
    await wait(1500);
    await snap('15_admin_orders_management.png');

    // 16: Admin Notifications & Audit History
    console.log('16. Admin Notifications & Audit...');
    await page.goto(`${BASE_URL}/admin/notifications`, { waitUntil: 'networkidle2' });
    await wait(1500);
    await snap('16_admin_notifications_audit.png');

    console.log('🎉 ALL SCREENSHOTS SUCCESSFULLY CAPTURED AND SAVED!');
  } catch (err) {
    console.error('❌ Error during capture process:', err);
  } finally {
    await browser.close();
  }
}

capture();
