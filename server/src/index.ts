import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { PrismaClient } from "@prisma/client";
import authRoutes from "./routes/auth";
import proposalRoutes from "./routes/proposals";
import publicRoutes from "./routes/public";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
export const prisma = new PrismaClient();

// Middlewares
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

const allowedOrigin = process.env.CLIENT_URL || "http://localhost:5173";
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl) or matching client
      if (!origin || origin === allowedOrigin || origin.startsWith("http://localhost:")) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive for preview/local dev
      }
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // limit each IP to 300 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/proposals", proposalRoutes);
app.use("/api/public/proposals", publicRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Server error:", err);
  res.status(500).json({ error: err.message || "Internal server error" });
});

app.listen(port, () => {
  console.log(`💖 LoveLink Server is running on port ${port}`);
});
