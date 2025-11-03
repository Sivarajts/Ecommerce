// backend/controllers/authController.js
import db from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const PEPPER = process.env.PEPPER || "";
const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS || "12", 10);
const JWT_SECRET = process.env.JWT_SECRET || "changeme";

export const signup = async (req, res) => {
  try {
    const { firstname, lastname, email, password } = req.body;
    if (!firstname || !lastname || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }
    if (password.length < 5) {
      return res.status(400).json({ error: "Password must be at least 5 characters" });
    }

    const [exists] = await db.query("SELECT id FROM users WHERE email = ?", [email]);
    if (exists.length) return res.status(409).json({ error: "Email already exists" });

    const hashed = await bcrypt.hash(password + PEPPER, SALT_ROUNDS);
    await db.query("INSERT INTO users (firstname, lastname, email, password) VALUES (?, ?, ?, ?)", [firstname, lastname, email, hashed]);
    return res.status(201).json({ message: "User created" });
  } catch (err) {
    console.error("❌ Signup error:", err);
    return res.status(500).json({ error: "Server error during signup" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Missing credentials" });

    const [rows] = await db.query("SELECT id, firstname, lastname, email, password FROM users WHERE email = ?", [email]);
    if (!rows.length) return res.status(401).json({ error: "Invalid credentials" });

    const user = rows[0];
    const ok = await bcrypt.compare(password + PEPPER, user.password);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const payload = { id: user.id, firstname: user.firstname, lastname: user.lastname, email: user.email };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "2h" });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === "true",
      sameSite: process.env.COOKIE_SAMESITE || "Lax",
      maxAge: 2 * 60 * 60 * 1000,
      path: "/",
    });

    return res.json({ message: "Login successful", user: { id: user.id, firstname: user.firstname, lastname: user.lastname, email: user.email } });
  } catch (err) {
    console.error("❌ Login error:", err);
    return res.status(500).json({ error: "Server error during login" });
  }
};

export const logout = (req, res) => {
  res.clearCookie("token", { path: "/" });
  res.json({ message: "Logged out" });
};

export const me = (req, res) => {
  if (!req.user) return res.status(401).json({ user: null });
  return res.json({ user: req.user });
};
