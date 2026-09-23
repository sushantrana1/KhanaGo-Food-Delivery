# 🍔 KhanaGo

### Your Food. Your Way. 🇳🇵

> A modern full-stack food delivery platform built for Nepal, featuring restaurant discovery, secure authentication, cart & checkout, multiple payment options, real-time order tracking, notifications, and a powerful admin dashboard.

<p align="center">

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-KhanaGo-ff6b35?style=for-the-badge)](https://khana-go-food-delivery.vercel.app)
[![Frontend](https://img.shields.io/badge/Frontend-Vercel-black?style=for-the-badge\&logo=vercel)](https://khana-go-food-delivery.vercel.app)
[![Backend](https://img.shields.io/badge/Backend-Render-46E3B7?style=for-the-badge\&logo=render)](https://khanago-food-delivery.onrender.com)
[![Database](https://img.shields.io/badge/Database-MongoDB-47A248?style=for-the-badge\&logo=mongodb)](https://www.mongodb.com/)

</p>

---

## 🚀 Live Project

| Service                 | Link                                                  |
| ----------------------- | ----------------------------------------------------- |
| 🌐 **Frontend**         | https://khana-go-food-delivery.vercel.app             |
| ⚙️ **Backend API**      | https://khanago-food-delivery.onrender.com            |
| 💚 **API Health Check** | https://khanago-food-delivery.onrender.com/api/health |

> **Note:** The backend is hosted on Render's free tier and may take around 20–30 seconds to wake up after inactivity.

---

## ✨ What is KhanaGo?

KhanaGo is a full-stack food delivery application designed around the Nepalese food-ordering experience.

The project demonstrates how a modern web application can connect:

**Customer → Food Discovery → Cart → Checkout → Payment → Order Tracking → Notifications**

while providing administrators with tools to manage users, meals, deals, orders, and platform statistics.

---

## 🎯 Key Features

### 👤 Customer Experience

* 🔐 JWT-based authentication
* 🍱 Browse meals by category, area, and ingredient
* 🔎 Search with filters
* 🛒 Shopping cart with quantity management
* ❤️ Favorites system
* 📍 Nepal province and district-based checkout
* 💳 Cash on Delivery
* 💰 Khalti payment integration
* 💰 eSewa payment integration
* 💰 IME Pay integration
* 📦 Order history
* 🚚 Order tracking with timeline
* 🔔 Real-time order status notifications

### 🛠️ Admin Dashboard

* 📊 Dashboard with users, orders, revenue, and pending-order statistics
* 📦 Order management
* 🔄 Order status updates
* 👥 User management
* 🚫 Ban / unban users
* 🗑️ Delete users
* 🍔 Meal management
* 🏷️ Deals management
* ⏱️ Countdown-based deals
* 🔔 Notifications for new orders
* 🛡️ Role-based access control

### 🔒 Security & Performance

* 🔑 JWT authentication
* 🍪 HTTP-only cookies
* 🚦 API rate limiting
* 🛡️ CORS whitelist protection
* 🧹 NoSQL injection protection
* 🪖 Helmet security headers
* ⚡ Optimistic UI updates
* 💀 Skeleton loaders
* 📱 Mobile-first responsive design

---

## 🧰 Tech Stack

### Frontend

![React](https://img.shields.io/badge/React_19-20232A?style=flat-square\&logo=react\&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite_6-646CFF?style=flat-square\&logo=vite\&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS_4-06B6D4?style=flat-square\&logo=tailwindcss\&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-5A29E4?style=flat-square\&logo=axios\&logoColor=white)

* React 19
* Vite 6
* React Router 7
* Tailwind CSS 4
* Lucide React
* Axios

### Backend

![Node](https://img.shields.io/badge/Node.js_18+-339933?style=flat-square\&logo=node.js\&logoColor=white)
![Express](https://img.shields.io/badge/Express_4-000000?style=flat-square\&logo=express\&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat-square\&logo=mongodb\&logoColor=white)

* Node.js 18+
* Express 4
* MongoDB
* Mongoose 8
* JWT
* bcryptjs
* Helmet
* Express Rate Limit
* Mongo Sanitize

### External Services

* 🍽️ TheMealDB
* 💳 Khalti
* 💳 eSewa
* 💳 IME Pay

### Deployment

* ▲ Vercel - Frontend
* 🚀 Render - Backend
* 🍃 MongoDB Atlas - Database

---

## 🏗️ Architecture

```text
                         ┌─────────────────────┐
                         │       Customer      │
                         │   Web Application   │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │      React + Vite   │
                         │    Tailwind CSS     │
                         └──────────┬──────────┘
                                    │
                              REST API
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │   Node.js + Express │
                         │    JWT + Security   │
                         └──────────┬──────────┘
                                    │
                   ┌────────────────┼────────────────┐
                   ▼                ▼                ▼
              ┌─────────┐    ┌────────────┐   ┌─────────────┐
              │ MongoDB │    │ Payments   │   │ TheMealDB   │
              │  Atlas  │    │ Khalti     │   │ Meal Data   │
              │         │    │ eSewa      │   │             │
              └─────────┘    │ IME Pay    │   └─────────────┘
                             └────────────┘

                         ┌─────────────────────┐
                         │    Admin Dashboard  │
                         │ Users • Orders      │
                         │ Meals • Deals       │
                         │ Analytics            │
                         └─────────────────────┘
```

---

## 📁 Project Structure

```text
khanago/
│
├── backend/
│   ├── src/
│   │   ├── config/          # Database & environment configuration
│   │   ├── controllers/    # Request handlers
│   │   ├── middleware/     # Authentication, validation & errors
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/         # API routes
│   │   ├── services/       # Payments & meal services
│   │   ├── utils/          # Utility functions
│   │   ├── app.js
│   │   └── server.js
│   │
│   ├── seedDeals.js
│   ├── seedAdmin.js
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # Auth, Cart & Toast contexts
│   │   ├── hooks/          # Custom React hooks
│   │   ├── pages/          # Application pages
│   │   ├── services/       # API clients
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   │
│   ├── public/
│   ├── .env.example
│   ├── package.json
│   ├── vercel.json
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

---

## ⚡ Getting Started

### Prerequisites

Make sure you have:

* Node.js 18+
* npm
* MongoDB Atlas or local MongoDB
* Git

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/khanago.git
cd khanago
```

### 2. Configure the Backend

```bash
cd backend
npm install
cp .env.example .env
```

Add your environment variables:

```env
PORT=5000
NODE_ENV=development

MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/khanago

JWT_SECRET=your_jwt_secret_at_least_32_characters
JWT_EXPIRES_IN=7d

CLIENT_URL=http://localhost:5173

THEMEALDB_API_URL=https://www.themealdb.com/api/json/v1/1
```

Start the backend:

```bash
npm run dev
```

Backend:

```text
http://localhost:5000
```

### 3. Configure the Frontend

```bash
cd ../frontend
npm install
cp .env.example .env
```

Add:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
```

Frontend:

```text
http://localhost:5173
```

### 4. Seed the Database

From the `backend` directory:

```bash
npm run seed:deals
npm run seed:admin
```

The seed process creates meal/deal data and an admin account.

### 5. Access the Admin Panel

Open:

```text
http://localhost:5173/login
```

Log in using the credentials generated by:

```bash
npm run seed:admin
```

Then access:

```text
/admin
```

---

## 🔐 Environment Variables

### Backend

| Variable               | Description                    |
| ---------------------- | ------------------------------ |
| `PORT`                 | Backend server port            |
| `NODE_ENV`             | Development or production      |
| `MONGO_URI`            | MongoDB connection string      |
| `JWT_SECRET`           | JWT signing secret             |
| `JWT_EXPIRES_IN`       | JWT expiration                 |
| `CLIENT_URL`           | Frontend URL for CORS          |
| `THEMEALDB_API_URL`    | TheMealDB API URL              |
| `KHALTI_SECRET_KEY`    | Optional Khalti configuration  |
| `ESEWA_MERCHANT_ID`    | Optional eSewa configuration   |
| `IMEPAY_MERCHANT_CODE` | Optional IME Pay configuration |

### Frontend

| Variable       | Description          |
| -------------- | -------------------- |
| `VITE_API_URL` | Backend API base URL |

---

## 🛡️ Security

KhanaGo implements several backend security practices:

* JWT authentication
* HTTP-only authentication cookies
* Password hashing with bcrypt
* CORS whitelist
* API rate limiting
* Helmet security headers
* NoSQL injection protection
* Role-based authorization
* Environment-based secret management

---

## 💡 What This Project Demonstrates

This project was built to demonstrate practical full-stack development skills including:

* Building a complete React application
* Designing RESTful APIs
* Authentication and authorization
* MongoDB data modeling
* Payment integration
* State management
* API integration
* Admin dashboard development
* Secure backend development
* Responsive UI development
* Cloud deployment
* Frontend/backend architecture

---

## 📚 Learning Highlights

Through KhanaGo, I worked with concepts such as:

**Frontend**

`React` `React Router` `Tailwind CSS` `Axios` `Context API`

**Backend**

`Node.js` `Express` `REST APIs` `JWT` `Middleware`

**Database**

`MongoDB` `Mongoose` `Data Modeling`

**Security**

`HTTP-only Cookies` `CORS` `Rate Limiting` `Helmet` `NoSQL Injection Protection`

**Deployment**

`Vercel` `Render` `MongoDB Atlas`

---

## 📄 License

This project is licensed under the MIT License.

See the `LICENSE` file for details.

---

## 👨‍💻 Author

### Sushant Rana

Full-Stack Developer | React | Node.js | MongoDB

🌐 **Live Project:**
https://khana-go-food-delivery.vercel.app

🐙 **GitHub:**
https://github.com/sushantrana1

📧 **Email:**
[your.email@example.com](mailto:sushantrana1121@gmail.com)

---

<p align="center">

### 🇳🇵 Built with ❤️ in Nepal

⭐ If you found this project interesting, consider giving it a star!

</p>
