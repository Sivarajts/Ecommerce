// backend/server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import "./config/db.js";

dotenv.config();
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);

app.get("/", (req, res) => res.send("✅ Backend running — use /api/*"));

app.use("/api/auth", authRoutes);
app.use("/api", productRoutes); // productRoutes mounts paths like /products, /products/search, /products/category/:id

app.get("/health", (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Backend running on port ${PORT}`));
