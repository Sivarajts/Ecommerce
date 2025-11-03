// backend/middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const requireAuth = (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ user: null });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ user: null });
  }
};
