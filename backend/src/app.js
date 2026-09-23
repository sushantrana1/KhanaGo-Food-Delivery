import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import cookieParser from "cookie-parser";

// Routes
import mealRoutes from "./routes/mealRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import dealRoutes from "./routes/dealRoutes.js";
import favoriteRoutes from "./routes/favoriteRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

// Middleware
import { errorHandler } from "./middleware/errorMiddleware.js";

const app = express();

// ─────────────────────────────────────────────
// CORS
// ─────────────────────────────────────────────
const allowedOrigins = [
  // Local development
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:5000",

  // Production — Vercel frontend
  "https://khana-go-food-delivery.vercel.app",

  // Legacy / alternate URLs
  "https://food-delivery-client-7qjz.onrender.com",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (Postman, mobile apps, server-to-server)
      if (!origin) return callback(null, true);

      // Allow localhost on any port (dev convenience)
      if (/^http:\/\/localhost:\d+$/.test(origin)) {
        return callback(null, true);
      }

      // Allow any Vercel preview deployment for this project
      if (
        /^https:\/\/khana-go-food-delivery(-[a-z0-9]+)?\.vercel\.app$/.test(
          origin
        )
      ) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.log("CORS blocked:", origin);
      return callback(null, false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ─────────────────────────────────────────────
// Security & Parsers
// ─────────────────────────────────────────────
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());
app.use(mongoSanitize());

// ─────────────────────────────────────────────
// Trust proxy (needed on Render for rate-limit + secure cookies)
// ─────────────────────────────────────────────
app.set("trust proxy", 1);

// ─────────────────────────────────────────────
// Rate Limiting
// ─────────────────────────────────────────────
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // 300 requests per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: "error",
    message: "Too many requests, please try again later.",
  },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // stricter for auth
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: "error",
    message: "Too many auth attempts, please try again in 15 minutes.",
  },
});

app.use("/api", apiLimiter);
app.use("/api/auth", authLimiter);

// ─────────────────────────────────────────────
// Health / Root
// ─────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({
    status: "success",
    message: "KhanaGo API Running",
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "KhanaGo API is working",
    timestamp: new Date().toISOString(),
  });
});

// ─────────────────────────────────────────────
// Routes
// ─────────────────────────────────────────────
app.use("/api/meals", mealRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/deals", dealRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/users", userRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/admin", adminRoutes);

// ─────────────────────────────────────────────
// 404 handler (for unmatched API routes)
// ─────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    status: "fail",
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// ─────────────────────────────────────────────
// Global error handler — MUST be last
// ─────────────────────────────────────────────
app.use(errorHandler);

export default app;