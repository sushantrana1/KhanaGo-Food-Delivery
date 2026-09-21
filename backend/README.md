# Food Delivery Backend

Express.js backend for the Food Delivery application.

## Setup

1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env` and configure
3. Start MongoDB
4. Run: `npm run dev`

## Environment Variables

See `.env.example` for required variables.

## API Endpoints

- `GET /api/health` - Health check
- `/api/auth/*` - Authentication
- `/api/meals/*` - Meals from TheMealDB
- `/api/cart/*` - Shopping cart
- `/api/favorites/*` - User favorites
- `/api/orders/*` - Order management
- `/api/payments/*` - Payment processing
- `/api/users/*` - User profile and addresses
- `/api/admin/*` - Admin dashboard
