# 🛒 CLOTHING MERN APP ( FYNSHITS )

A modern full-stack  e-commerce platform built with **React**, **Node.js**, **Express**, **PostgreSQL**, and **Cloudflare Workers**. The application includes authentication, payments, AI-powered features, image optimization, and an admin dashboard for managing products and orders.

## ✨ Features

### 👤 Authentication
- Clerk Authentication
- Secure Sign In / Sign Up
- Protected Routes
- User Profile Management

### 🛍️ Shopping
- Browse Products
- Product Categories
- Product Details
- Search & Filtering
- Shopping Cart
- Checkout Flow

### 💳 Payments
- Polar Payment Integration
- Secure Checkout
- Order Creation
- Payment Verification
- Order History

### 🖼️ Media
- ImageKit Image Optimization
- Fast Image Delivery
- Responsive Images

### 🤖 AI Features
- AI-assisted shopping experience
- Smart product interactions
- AI-ready architecture for future integrations

### 📊 Admin Dashboard
- Manage Products
- Manage Orders
- Category Management
- Dashboard Statistics

### ⚡ Performance
- React Query (TanStack Query)
- Optimized API Calls
- Lazy Loading
- Fast Rendering

---

# 🏗️ Tech Stack

## Frontend

- React
- Vite
- React Router
- Tailwind CSS
- TanStack Query
- Zustand
- Clerk
- Axios

## Backend

- Node.js
- Express.js
- TypeScript
- Drizzle ORM
- PostgreSQL (Neon)
- Cloudflare Workers

## Database

- PostgreSQL
- Drizzle ORM

## Authentication

- Clerk

## Payments

- Polar

## Image Storage

- ImageKit

## Monitoring

- Sentry

---

# 📂 Project Structure

```
FullStack-Ecommerce-WebApp
│
├── FRONTEND
│   ├── src
│   ├── public
│   └── ...
│
├── BACKEND
│   ├── src
│   ├── database
│   ├── routes
│   ├── middleware
│   └── ...
│
└── README.md
```

---

# 🚀 Getting Started

## Clone Repository

```bash
git clone https://github.com/zayanwaris7-hash/FullStack-Ecommerce-WebApp.git
```

```bash
cd FullStack-Ecommerce-WebApp
```

---

# 📦 Frontend Setup

```bash
cd FRONTEND
```

Install dependencies

```bash
npm install
```

Run development server

```bash
npm run dev
```

---

# ⚙️ Backend Setup

```bash
cd BACKEND
```

Install dependencies

```bash
npm install
```

Start development server

```bash
npm run dev
```

---

# 🔑 Environment Variables

Create a `.env` file inside the backend.

Example:

```env
DATABASE_URL=

CLERK_SECRET_KEY=
CLERK_PUBLISHABLE_KEY=

POLAR_ACCESS_TOKEN=
POLAR_WEBHOOK_SECRET=

IMAGEKIT_PUBLIC_KEY=
IMAGEKIT_PRIVATE_KEY=
IMAGEKIT_URL_ENDPOINT=

SENTRY_DSN=

PORT=3000
```

Frontend `.env`

```env
VITE_CLERK_PUBLISHABLE_KEY=
VITE_API_URL=
```

---

# 🗄️ Database

Generate migrations

```bash
npm run db:generate
```

Run migrations

```bash
npm run db:migrate
```

Open Drizzle Studio

```bash
npm run db:studio
```

---

# 📸 Screenshots

> Add screenshots here

- Home Page
- Product Page
- Cart
- Checkout
- Dashboard

---

# 📌 Future Improvements

- Wishlist
- Product Reviews
- Coupons
- Inventory Management
- Recommendation System
- AI Product Assistant
- Analytics Dashboard
- Email Notifications
- Multi-vendor Support

---

# 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create a feature branch

```bash
git checkout -b feature-name
```

3. Commit your changes

```bash
git commit -m "Added new feature"
```

4. Push your branch

```bash
git push origin feature-name
```

5. Open a Pull Request

---

# 📄 License

This project is licensed under the MIT License.

---

# 👨‍💻 Author

**Zayan Waris**

GitHub:
https://github.com/zayanwaris7-hash

---

⭐ If you like this project, don't forget to star the repository!
