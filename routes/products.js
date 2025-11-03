// backend/routes/products.js
import express from "express";
import pool from "../db.js";
const router = express.Router();

// Get all products (paginated)
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 12;
    const offset = (page - 1) * limit;

    const [rows] = await pool.query("SELECT COUNT(*) as total FROM products");
    const totalProducts = rows[0].total;
    const totalPages = Math.ceil(totalProducts / limit);

    const [products] = await pool.query(
      "SELECT * FROM products ORDER BY id ASC LIMIT ? OFFSET ?",
      [limit, offset]
    );

    res.json({ products, page, totalPages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
});

// Get products by category (always 25 total, 3 pages max)
router.get("/category/:id", async (req, res) => {
  try {
    const categoryId = req.params.id;
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;

    const [rows] = await pool.query(
      "SELECT COUNT(*) as total FROM products WHERE category_id = ?",
      [categoryId]
    );
    const totalProducts = rows[0].total > 25 ? 25 : rows[0].total;
    const totalPages = Math.ceil(totalProducts / limit);

    const [products] = await pool.query(
      "SELECT * FROM products WHERE category_id = ? ORDER BY id ASC LIMIT ? OFFSET ?",
      [categoryId, limit, offset]
    );

    res.json({ products, page, totalPages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
});

export default router;
