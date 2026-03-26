# PantryPal

PantryPal is a comprehensive full-stack web application designed to help retailers manage their inventory and sales, while allowing customers to track their purchases and manage their pantry items seamlessly.

The application offers two distinct portals tailored to the specific needs of running a store and managing household groceries, complete with receipt scanning capabilities and detailed stock analytics.

## 🚀 Features

### For Retailers

- **Dashboard & Analytics:** Overview of sales, stock levels, and store performance.
- **Inventory Management:** Add new stock, manage existing products, and view complete stock history.
- **Point of Sale (POS):** Process new sales quickly and efficiently.
- **Sales History:** Track all past transactions.
- **Discount Management:** Apply and track discounts on products.
- **Profile Management:** Manage store details and settings.

### For Customers

- **My Pantry/Items:** Track purchased grocery items and their expiration or usage status.
- **Claim Purchase:** Scan and upload physical receipts to automatically claim and track purchased items (powered by OCR).
- **Notifications:** Receive alerts for expiring items or low stock.
- **Profile & Settings:** Personalized app experience.

## 🛠️ Tech Stack

### Frontend

The user interface is a modern single-page application built for speed and excellent user experience:

- **Framework:** React 18 with Vite
- **Language:** TypeScript
- **Styling:** Tailwind CSS with class-variance-authority and tailwind-merge
- **UI Components:** shadcn/ui (Radix UI primitives)
- **State Management & Data Fetching:** React Query (@tanstack/react-query)
- **Routing:** React Router v6
- **Forms & Validation:** React Hook Form + Zod
- **OCR:** Tesseract.js (for receipt scanning)

### Backend

A robust RESTful API that handles business logic and persistent data:

- **Environment:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL (using `pg` driver)
- **Authentication:** JSON Web Tokens (JWT) & bcrypt for password hashing
- **Middleware:** CORS, Dotenv

## 📂 Project Structure

```
pantrypal1/
├── frontend/             # React/Vite Frontend Application
│   ├── src/
│   │   ├── components/   # Reusable UI components (shadcn/ui)
│   │   ├── contexts/     # React context providers
│   │   ├── hooks/        # Custom React hooks
│   │   ├── lib/          # Utilities and API clients
│   │   ├── pages/        # Route components (customer/retailer portals)
│   │   └── services/     # Frontend services
│   ├── index.html        # App entry HTML
│   ├── vite.config.ts    # Vite configuration
│   └── tailwind.config.ts# Tailwind CSS configuration
│
└── backend/              # Node.js/Express Backend API
    ├── src/
    │   ├── config/       # Database and environment configurations
    │   ├── controllers/  # Route handlers (Auth, Sales, Inventory, etc.)
    │   ├── middleware/   # Custom Express middlewares (Auth, Error handling)
    │   ├── routes/       # API route definitions
    │   ├── services/     # Core business logic
    │   ├── utils/        # Helper functions
    │   └── server.js     # Express app entry point
    └── scripts/          # Database seeding and utility scripts
```

## 💻 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or newer recommended)
- [PostgreSQL](https://www.postgresql.org/) database server running
- Git

### 1. Clone the repository

```bash
git clone <repository-url>
cd pantrypal1
```

### 2. Backend Setup

Navigate to the backend directory, install dependencies, configure your environment, and start the server:

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory based on the configuration required (Database connection strings, JWT Secrets, etc.).

_(Optional)_ Run the seed script to populate your database with initial data:

```bash
npm run seed
```

Start the backend development server:

```bash
npm run dev
# or `npm start` for production
```

The API server will typically run on `http://localhost:5000` or a port specified in your `.env`.

### 3. Frontend Setup

Open a new terminal session, navigate to the frontend directory, install dependencies, and start the dev server:

```bash
cd frontend
npm install
npm run dev
```

The React application will be accessible at `http://localhost:5173`.

## 🔒 Security

- Passwords are securely hashed using `bcrypt` before database storage.
- Protected routes require valid JSON Web Tokens (JWT).
- Role-based access control separates Retailer capabilities from Customer features.

## 📄 Scripts

**Frontend (`frontend/package.json`)**

- `npm run dev`: Starts the Vite development server.
- `npm run build`: Builds the app for production.
- `npm run test`: Runs the Vitest test runner.
- `npm run lint`: Lints the frontend codebase via ESLint.

**Backend (`backend/package.json`)**

- `npm run dev`: Starts the server with Nodemon for automatic restarts.
- `npm run start`: Starts the standard Node server.
- `npm run seed`: Executes the database seed script.
