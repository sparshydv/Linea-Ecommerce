# LINEA E-Commerce

Full-stack e-commerce application with a modern React storefront and Node.js/Express backend API.

This repository contains:
- `backend/` → Express + MongoDB API
- `frontend/remix-of-linea-jewelry/` → Vite + React + TypeScript storefront

---

## Table of Contents
- [Overview](#overview)
- [What’s Implemented](#whats-implemented)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Backend](#backend)
  - [Core Modules](#core-modules)
  - [Auth & Google OAuth](#auth--google-oauth)
  - [API Routes](#api-routes)
- [Frontend](#frontend)
  - [Key Pages](#key-pages)
  - [State & API Integration](#state--api-integration)
  - [UI/UX Work Completed](#uiux-work-completed)
- [Checkout & Order Flow](#checkout--order-flow)
- [Environment Variables](#environment-variables)
- [Run Locally](#run-locally)
- [Deployment Guide](#deployment-guide)
  - [Backend on Render](#backend-on-render)
  - [Frontend on Vercel/Netlify](#frontend-on-vercelnetlify)
  - [Google OAuth Setup (Production)](#google-oauth-setup-production)
- [Testing / API Validation](#testing--api-validation)
- [Troubleshooting](#troubleshooting)

---

## Overview
LINEA is a jewelry-focused commerce platform with:
- Product catalog + search
- JWT auth + Google sign-in
- Cart + wishlist
- Checkout with shipping rules and payment selection
- Orders list + order detail view

The backend provides REST APIs, while the frontend consumes them via typed API utilities.

---

## What’s Implemented

### Backend
- User registration/login (JWT)
- Google OAuth login (`/api/auth/google`) with account auto-linking by email
- User model extended with:
  - `googleId`
  - `authProvider`
  - `avatarUrl`
- Product listing, filtering, and search endpoints
- Protected cart and wishlist endpoints
- Order creation from cart with pricing snapshots
- Payment method support in order creation: `cod`, `upi`, `card`
- Mock payment intent + webhook flow
- Health endpoint and root ping endpoint for deployment health checks

### Frontend
- Full storefront routing
- Auth pages redesigned with optional Google sign-in
- Cart context handles auth and cart state
- Header user menu:
  - Avatar/initials when logged in
  - Orders + Logout in account menu
  - Mobile account icon menu
- Checkout updates:
  - Shipping rule: free above ₹499, otherwise ₹70
  - Payment options: COD / UPI / Card
  - Complete Order button enabled only when required details are complete
- Order details view shows payment method and multiline shipping address
- Cart off-canvas fixed to scroll internally (page scroll lock while open)

---

## Tech Stack

### Backend
- Node.js
- Express 5
- MongoDB + Mongoose
- JWT (`jsonwebtoken`)
- Password hashing (`bcryptjs`)
- Google OAuth verification (`google-auth-library`)
- Security/logging: `helmet`, `cors`, `morgan`

### Frontend
- React 18 + TypeScript
- Vite
- Tailwind CSS
- shadcn/ui + Radix primitives
- React Router
- TanStack Query
- Google OAuth client (`@react-oauth/google`)

---

## Project Structure

```text
LINEA/
├─ backend/
│  ├─ src/
│  │  ├─ controllers/
│  │  ├─ services/
│  │  ├─ models/
│  │  ├─ routes/
│  │  ├─ middleware/
│  │  └─ config/
│  ├─ seed.js
│  └─ package.json
└─ frontend/
   └─ remix-of-linea-jewelry/
      ├─ src/
      │  ├─ pages/
      │  ├─ components/
      │  ├─ context/
      │  ├─ lib/
      │  └─ types/
      └─ package.json
```

---

## Backend

### Core Modules
- `src/models` → Mongoose schemas (`User`, `Product`, `Cart`, `Wishlist`, `Order`)
- `src/services` → Business logic for auth/cart/order/payment/product
- `src/controllers` → Request/response handlers
- `src/routes` → API route wiring
- `src/middleware` → auth, notFound, error handling

### Auth & Google OAuth
- Local auth:
  - `POST /api/auth/register`
  - `POST /api/auth/login`
- Google auth:
  - `POST /api/auth/google` (authorization code exchange)
- Profile:
  - `GET /api/auth/me`

Google flow stores `avatarUrl` from Google profile picture and links existing account by email.

### API Routes
- Health:
  - `GET /` (root ping)
  - `GET /health`
- Products:
  - `GET /api/products`
  - `GET /api/products/search`
  - `GET /api/products/:slug`
- Cart (protected):
  - `GET /api/cart`
  - `POST /api/cart/items`
  - `PUT /api/cart/items/:productId`
  - `DELETE /api/cart/items/:productId`
  - `DELETE /api/cart`
- Wishlist (protected):
  - `POST /api/wishlist`
  - `GET /api/wishlist`
  - `DELETE /api/wishlist/:productId`
- Orders (protected):
  - `POST /api/orders`
  - `GET /api/orders`
  - `GET /api/orders/:id`
- Payments:
  - `POST /api/payments/mock/intent`
  - `POST /api/payments/mock/webhook`

---

## Frontend

### Key Pages
- Home (`/`)
- Category (`/category/:category`)
- Product detail (`/product/:slug`)
- Search (`/search`)
- Checkout (`/checkout`)
- Login/Register (`/auth/login`, `/auth/register`)
- Orders (`/orders`, `/orders/:id`)
- Wishlist (`/wishlist`)
- About/Policy/Terms pages

### State & API Integration
- `CartContext` manages:
  - auth session (`user`, token, login/logout)
  - cart state and operations
- API clients in `src/lib`:
  - `auth-api.ts`
  - `cart-api.ts`
  - `wishlist-api.ts`
  - `order-api.ts`
  - `payment-api.ts`

### UI/UX Work Completed
- Auth pages redesigned with split layout and hero image
- Header account menu with avatar/initials + Orders/Logout actions
- Mobile account icon menu behavior added
- Cart drawer internal scroll fix

---

## Checkout & Order Flow

Current checkout behavior:
1. User enters customer details + shipping address
2. User selects payment method (`cod`, `upi`, `card`)
3. Shipping cost rule:
   - `₹0` when subtotal > `₹499`
   - `₹70` when subtotal ≤ `₹499`
4. “Complete Order” button enables only if:
   - customer details required fields filled
   - shipping address required fields filled
   - payment option selected
5. Order is created and mock payment webhook confirms payment

Order detail formatting includes:
- Payment method label (COD / UPI / Card)
- Shipping address in separate lines:
  - Name
  - Address line
  - Email
  - Phone

---

## Environment Variables

### Backend (`backend/.env`)
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/ecommerce
NODE_ENV=development
JWT_SECRET=your_jwt_secret

CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=postmessage
```

Reference: `backend/.env.example`

### Frontend (`frontend/remix-of-linea-jewelry/.env`)
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

---

## Run Locally

### 1) Backend
```bash
cd backend
npm install
npm run dev
```

Backend runs on `http://localhost:5000`

### 2) Frontend
```bash
cd frontend/remix-of-linea-jewelry
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`

### 3) Optional seed data
```bash
cd backend
npm run seed
```

---

## Deployment Guide

### Backend on Render
1. Create a Render Web Service from `backend/`
2. Build command: `npm install`
3. Start command: `npm start`
4. Set env vars from backend section above
5. Health check path: `/health`
6. Redeploy after env updates

Notes:
- Root route (`/`) returns 200 for platform checks/pings
- API routes are under `/api/*`

### Frontend on Vercel/Netlify
1. Deploy `frontend/remix-of-linea-jewelry/`
2. Build command: `npm run build`
3. Output directory: `dist`
4. Set frontend env vars:
   - `VITE_API_BASE_URL` → deployed backend URL + `/api`
   - `VITE_GOOGLE_CLIENT_ID`

### Google OAuth Setup (Production)
1. In Google Cloud Console, create OAuth Client (Web application)
2. Configure Authorized JavaScript origins:
   - Local: `http://localhost:5173`
   - Production: your frontend domain
3. Use same `GOOGLE_CLIENT_ID` in backend and frontend
4. Backend uses `GOOGLE_REDIRECT_URI=postmessage`

---

## Testing / API Validation
- HTTP test collections are available in backend:
  - `PHASE-6-TESTS.http`
  - `PHASE-7-TESTS.http`

Use VS Code REST Client extension (or Postman) to run endpoint checks.

---

## Troubleshooting

### `Route not found: /` on Render
- Ensure backend is updated with root route and health endpoint
- Set health check path to `/health`

### Frontend cannot resolve `@react-oauth/google`
```bash
cd frontend/remix-of-linea-jewelry
npm install @react-oauth/google
```

### Google button shown but login fails
- Verify `VITE_GOOGLE_CLIENT_ID`
- Verify backend `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET`
- Verify frontend origin is whitelisted in Google Cloud OAuth settings

### Wrong payment method in order details
- Ensure frontend sends `paymentMethod` during checkout
- Ensure backend stores allowed method (`cod`, `upi`, `card`)
- Check newly created orders (old orders keep old stored method)

---

If you want, I can also add badges (build/deploy), API request examples, and a small architecture diagram for GitHub README polish.
