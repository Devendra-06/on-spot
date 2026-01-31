# 🍔 Food Delivery App (Monorepo)

A complete food delivery ecosystem featuring a Backend API, Restaurant Admin Panel, and a Cross-Platform Customer/Driver App.

## 🏗️ Architecture

- **Backend:** NestJS (Node.js) + PostgreSQL + TypeORM
- **Admin Panel:** Next.js (React) + Tailwind CSS
- **Mobile App:** Flutter (iOS/Android/Web) - Serving both Customers and Drivers

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- Flutter SDK
- PostgreSQL Database
- VS Code (Recommended)

### 1. Backend Setup (`apps/backend`)

The backend serves as the core API for all client apps.

```bash
cd apps/backend
npm install
cp .env.example .env # Configure your DB credentials
npm run start:dev
```

- **API URL:** `http://localhost:3000`
- **Swagger Docs:** `http://localhost:3000/docs`

### 2. Admin Panel Setup (`apps/admin`)

The web dashboard for Restaurant Owners to manage menus and orders.

```bash
cd apps/admin
npm install
cp .env.local.example .env.local
npm run dev -- -p 3001
```

- **URL:** `http://localhost:3001`
- **Login:** Create a user via Backend API or seed data.

### 3. Mobile App Setup (`apps/customer`)

Unified Flutter app for Customers and Drivers.

```bash
cd apps/customer
flutter pub get
flutter run
```

- **Customer Mode:** Login, Browse Menu, Add to Cart, Place Order.
- **Driver Mode:** Tap the "Delivery Icon" on Home Screen -> Claim & Deliver Orders.

## 🔄 End-to-End Workflow

1.  **Register/Login** on Mobile App.
2.  **Add Items** to Cart and **Place Order**.
3.  **Admin Panel** -> Live Orders -> **Accept** -> **Mark Ready**.
4.  **Mobile App** -> Tap Delivery Icon -> **Claim Order**.
5.  **Mobile App** -> My Orders -> Refresh to see status updates.

## 📂 Project Structure

- `apps/backend`: NestJS API
- `apps/admin`: Next.js Web Dashboard
- `apps/customer`: Flutter Mobile App

## 🛠️ Tech Stack

- **Auth:** JWT (Passport.js)
- **Database:** PostgreSQL
- **State Management:** Flutter (setState/Provider), React (Context/Hooks)
- **Styling:** Tailwind CSS (Web), Flutter Material (Mobile)
