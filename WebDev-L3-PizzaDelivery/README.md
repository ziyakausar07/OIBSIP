# 🍕 SliceCraft — Full-Stack Pizza Delivery & Inventory Management System

A production-grade, full-stack **Pizza Delivery and Inventory Management System** built with the **MERN Stack** (MongoDB, Express.js, React.js, Node.js), featuring separate Customer & Admin portals, interactive step-by-step custom pizza builder, Razorpay test-mode payment gateway with cryptographic signature verification, atomic inventory stock deduction, scheduled low-stock email alerts (Nodemailer + node-cron), and real-time order tracking powered by Socket.IO.

---

## 🌟 Key Highlights & Features

### 👤 Customer Experience
- **Artisan Pizza Catalog:** Dynamic menu loaded from MongoDB with category filtering (`Classic`, `Veg`, `Gourmet`, `Special`), real-time search, and price sorting.
- **4-Step Custom Pizza Builder Wizard:**
  - **Step 1 — Choose Base:** 5 crust options (Hand-Tossed, Thin Crust, Thick Crust, Whole Wheat, Cheese-Stuffed).
  - **Step 2 — Pick Sauce:** 5 sauces (Classic Marinara, Creamy Alfredo, Spicy Arrabbiata, Pesto Basil, BBQ Smoky).
  - **Step 3 — Select Cheese:** 5 cheese varieties (Mozzarella, Cheddar Blend, Parmesan, Vegan Cashew Cheese, Four Cheese Blend).
  - **Step 4 — Load Veggies:** Multi-select farm toppings (Bell Peppers, Mushrooms, Red Onions, Black Olives, Jalapeños, Sweet Corn, etc.).
  - **Live Dynamic Price Counter:** Live recalculation with size multipliers (Regular 8", Medium 10", Large 12").
  - **Visual Pizza Layer Preview:** Dynamic interactive visualization of selected ingredients.
- **Persistent Cart & Order Summary:** Auto-persists in local storage; itemized ingredients breakdown; 5% GST; Free Delivery on orders over ₹500.
- **Razorpay Test-Mode Checkout:** Seamless test payments (Cards, UPI, NetBanking) with server-side signature verification (`HMAC-SHA256`).
- **Live Order Tracking:** Real-time lifecycle updates (`Order Received` → `In Kitchen` → `Sent to Delivery` → `Delivered`) via Socket.IO without manual page refreshing.
- **User Dashboard:** Order history, active orders status banner, profile management.

### 🛡️ Admin Control Panel
- **Dedicated Admin Portal (`/admin/login`):** Role-based authorization enforced via JWT and server middleware.
- **Summary Analytics Dashboard:** KPI cards for Total Orders, Orders In Kitchen, Delivered, Low-Stock alerts, and Total Revenue.
- **Full Inventory Stock Management:**
  - Searchable inventory table across Bases, Sauces, Cheeses, and Veggies.
  - Live progress bars indicating stock vs. safety threshold.
  - Manual restock / waste adjustment modal (+/- delta validation).
  - Configurable low-stock trigger threshold per ingredient.
  - Manual Stock Check trigger button.
- **Order Lifecycle Management:** Filter, search, and update order statuses with timestamped internal timeline notes.
- **Notifications & Audit History:** Comprehensive log of dispatched low-stock emails and stock movement audit records.

### ⚙️ Automation & Security
- **Automated Low-Stock Monitor:** Scheduled `node-cron` job (every 15 mins) that scans inventory, detects items below threshold, and sends automated alert emails via Nodemailer.
- **Duplicate Alert Prevention:** Tracks cooldown hours (`LOW_STOCK_COOLDOWN_HOURS`) and resets alerts only after restock.
- **Atomic Stock Deduction:** Concurrency-safe atomic deduction with automatic rollback if an ingredient runs out mid-order.
- **Trusted Server-Side Pricing:** Never trusts client-submitted totals; re-evaluates all item and ingredient prices from MongoDB.
- **Hardened Security:** Helmet HTTP headers, CORS whitelisting, rate limiting on sensitive routes, bcrypt password hashing.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, React Router v6, Tailwind CSS, Lucide Icons, Canvas Confetti, React Hot Toast |
| **Backend** | Node.js, Express.js, Socket.IO, node-cron, Nodemailer, Razorpay SDK, Helmet, CORS, Express Rate Limit |
| **Database** | MongoDB with Mongoose ODM |
| **Authentication** | JSON Web Tokens (JWT), bcryptjs, Email Verification Tokens |
| **Payments** | Razorpay Test Mode with HMAC-SHA256 verification |

---

## 📁 Project Architecture & Directory Structure

```
OIBSIPWebDev-L1-PizzaDelivery/
├── .env.example              # Environment variables template
├── .gitignore                # Root gitignore
├── README.md                 # Complete documentation
│
├── client/                   # Vite + React Frontend
│   ├── index.html            # HTML entry point with Razorpay script
│   ├── package.json          # Frontend dependencies
│   ├── tailwind.config.js    # Custom brand theme (crimson, pizza, charcoal)
│   ├── vite.config.js        # Vite dev server with proxy to backend
│   └── src/
│       ├── main.jsx          # App root with providers & toast setup
│       ├── App.jsx           # Application route definitions
│       ├── index.css         # Tailwind utilities & glassmorphism styles
│       ├── components/
│       │   ├── layout/       # Navbar, Footer, AdminNav
│       │   └── common/       # ProtectedRoute, PizzaCard, OrderTracker
│       ├── context/          # AuthContext, CartContext, SocketContext
│       ├── services/         # Axios API client with JWT interceptor
│       └── pages/
│           ├── public/       # Home, Menu, About, Contact, Login, Register, VerifyEmail, ForgotPassword, ResetPassword
│           ├── user/         # CustomPizza (Wizard), Cart, Checkout, OrderConfirmation, Dashboard, OrderDetails
│           ├── admin/        # AdminLogin, AdminDashboard, AdminOrders, AdminInventory, AdminNotifications
│           └── NotFound.jsx  # 404 Page
│
└── server/                   # Node.js + Express Backend
    ├── server.js             # Express app & HTTP/Socket.IO server bootstrap
    ├── package.json          # Backend dependencies & scripts
    ├── config/               # db.js, socket.js, razorpay.js
    ├── models/               # User, Pizza, Ingredient, Inventory, Order, Payment, InventoryTransaction, NotificationLog, Tokens
    ├── controllers/          # authController, pizzaController, orderController, paymentController, adminController
    ├── middleware/           # authMiddleware, errorHandler, rateLimiter
    ├── routes/               # authRoutes, pizzaRoutes, orderRoutes, paymentRoutes, adminRoutes
    ├── services/             # pricingService, inventoryService, emailService, cronService
    ├── scripts/              # seed.js (populates catalog & inventory), createAdmin.js (creates admin account)
    └── tests/                # Automated backend unit tests (services.test.js)
```

---

## 🚀 Quickstart Installation Guide

### Prerequisites
- **Node.js** v18+ installed
- **MongoDB** running locally (`mongodb://127.0.0.1:27017`) or a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster URI.

---

### Step 1: Backend Setup

1. Open terminal and navigate to `server/`:
   ```bash
   cd server
   npm install
   ```

2. Configure environment variables:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Ensure your `.env` contains:
   ```env
   PORT=5050
   NODE_ENV=development
   CLIENT_URL=http://localhost:3000
   MONGODB_URI=mongodb://127.0.0.1:27017/pizza_delivery_db
   JWT_SECRET=super_secret_jwt_key_pizza_delivery_987654321_secure
   JWT_EXPIRE=7d

   # Razorpay Test Mode Credentials
   RAZORPAY_KEY_ID=rzp_test_pizza_demo_key
   RAZORPAY_KEY_SECRET=rzp_test_pizza_demo_secret
   RAZORPAY_WEBHOOK_SECRET=rzp_webhook_secret_key

   # SMTP Email Configuration (Ethereal test email preview by default)
   SMTP_HOST=smtp.ethereal.email
   SMTP_PORT=587
   SMTP_USER=
   SMTP_PASS=
   SMTP_FROM="SliceCraft Pizza <orders@slicecraftpizza.com>"
   ADMIN_EMAIL=admin@slicecraftpizza.com

   # Cron Job Configurations
   LOW_STOCK_CRON_SCHEDULE=*/15 * * * *
   LOW_STOCK_COOLDOWN_HOURS=6
   ```

3. Seed the database (Ingredients, Inventory portions, Sample pizzas):
   ```bash
   npm run seed
   ```

4. Create the initial administrator account:
   ```bash
   npm run create-admin
   ```
   *Default Admin Credentials:*
   - **Email:** `admin@slicecraftpizza.com` (or `admin@slicecraft.com`)
   - **Password:** `Admin@123`

5. Start backend development server:
   ```bash
   npm run dev
   ```
   Server will run on **http://localhost:5050**.

---

### Step 2: Frontend Setup

1. In a new terminal, navigate to `client/`:
   ```bash
   cd client
   npm install
   ```

2. Start the Vite dev server:
   ```bash
   npm run dev
   ```
   The client will open on **http://localhost:3000**.

---

## 💳 Razorpay Test Mode Integration

The system natively uses **Razorpay Test Mode**:
1. When a user clicks **"Pay via Razorpay"** on `/checkout`, the backend calls `POST /api/payments/create-order` to verify stock availability, compute trusted server prices, and generate a Razorpay order.
2. The frontend triggers Razorpay Checkout modal.
3. Upon payment completion, Razorpay returns a cryptographic signature (`razorpay_signature`), which is verified on the backend using `HMAC-SHA256` (`POST /api/payments/verify`).
4. If valid, the backend reserves inventory, sets the order to `Paid`, and notifies the admin dashboard in real-time via Socket.IO.
5. If using test sandbox keys without live credentials, the built-in test sandbox simulator automatically exercises the entire verification, inventory deduction, and timeline workflow.

---

## 📧 Email Verification & Low-Stock Alerts

- **Email Verification:** Automatically dispatches a 64-character verification token link to newly registered users. If SMTP credentials are empty in development, the email token and click link are clearly printed to the backend console.
- **Scheduled Low-Stock Monitoring:** A background `node-cron` job runs every 15 minutes. Any ingredient with stock `quantity <= lowStockThreshold` dispatches an HTML alert email to `ADMIN_EMAIL` and records an entry in `NotificationLog`.
- **Manual Alert Check:** Administrators can click **"Trigger Stock Alert Scan"** in the Admin Inventory page to immediately check low stock on demand.

---

## 🧪 Automated Testing

Run the automated backend unit test suite:
```bash
cd server
npm test
```
Validates:
- Correct aggregation of ingredient quantities across complex multi-item custom orders.
- Razorpay `HMAC-SHA256` signature verification and rejection of tampered payloads.
- Free delivery calculation threshold (Orders >= ₹500 free, else ₹40).
- GST 5% tax rounding.

---

## 🌐 Deployment Guidelines

### Frontend on Vercel
1. Set the root directory to `client`.
2. Framework Preset: **Vite**.
3. Build Command: `npm run build`.
4. Output Directory: `dist`.
5. Environment Variable:
   - `VITE_API_URL`: Your deployed backend URL (e.g. `https://slicecraft-api.onrender.com`).

### Backend on Render
1. Set the root directory to `server`.
2. Environment: **Node**.
3. Build Command: `npm install`.
4. Start Command: `npm start`.
5. Add all environment variables from `.env.example` in Render Dashboard.

### Database on MongoDB Atlas
1. Create a free M0 cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Whitelist `0.0.0.0/0` in Network Access.
3. Replace `MONGODB_URI` with your connection string:
   `mongodb+srv://<username>:<password>@cluster0.mongodb.net/slicecraft?retryWrites=true&w=majority`

---

## 📜 License
Developed for the **Oasis Infobyte Internship Program (OIBSIP) Web Development Level 1**. Distributed under the ISC License.
