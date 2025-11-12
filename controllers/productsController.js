// backend/controllers/productsController.js
import db from "../config/db.js";
import { Client as ESClient } from "@elastic/elasticsearch";
import dotenv from "dotenv";
dotenv.config();

let esClient = null;
if (process.env.ES_NODE) {
  try { esClient = new ESClient({ node: process.env.ES_NODE }); } catch (e) { esClient = null; }
}

// Helper: accept either ?limit= or ?perPage=, fallback
const getLimit = (req, fallback) => {
  const v = req.query.limit ?? req.query.perPage ?? fallback;
  return Math.max(1, parseInt(v, 10));
};

export const getCategoriesPage = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const perPage = getLimit(req, 5);
    const offset = (page - 1) * perPage;

    const [rows] = await db.query(
      "SELECT id as category_id, name as category_name, description FROM categories ORDER BY id ASC LIMIT ? OFFSET ?",
      [perPage, offset]
    );
    const [countRows] = await db.query("SELECT COUNT(*) AS total FROM categories");
    const total = countRows[0].total || 0;
    const totalPages = Math.max(1, Math.ceil(total / perPage));
    return res.json({ page, perPage, total, totalPages, categories: rows });
  } catch (err) {
    console.error("❌ categories error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

// GET /api/products/category/:id?page=1&limit=10
// Enforce category CAP = 25 (so pages: 10,10,5 by default perPage=10)
export const getProductsByCategory = async (req, res) => {
  try {
    const categoryId = parseInt(req.params.id, 10);
    if (Number.isNaN(categoryId)) return res.status(400).json({ error: "Invalid category id" });

    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const perPage = getLimit(req, 10);
    const offset = (page - 1) * perPage;

    const [countRows] = await db.query("SELECT COUNT(*) as total FROM products WHERE category_id = ?", [categoryId]);
    const totalRaw = countRows[0].total || 0;

    const CAP = 25;
    const total = Math.min(totalRaw, CAP);
    const totalPages = Math.max(1, Math.ceil(total / perPage));

    // If the requested offset is beyond cap → return empty page
    if (offset >= CAP) {
      return res.json({ categoryId, page, perPage, total, totalPages, products: [] });
    }

    // adjusted limit: don't fetch beyond cap
    const adjustedLimit = Math.min(perPage, CAP - offset);
    const [rows] = await db.query(
      `SELECT id, category_id, name, description, mrp_price as mrpPrice, discounted_price as discountedPrice, quantity, image_url as imageUrl
       FROM products WHERE category_id = ? ORDER BY id ASC LIMIT ? OFFSET ?`,
      [categoryId, adjustedLimit, offset]
    );

    return res.json({ categoryId, page, perPage, total, totalPages, products: rows });
  } catch (err) {
    console.error("❌ getProductsByCategory error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

// GET /api/products?page=1&limit=10  (All products, full list)
export const getAllProductsPage = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const perPage = getLimit(req, 10);
    const offset = (page - 1) * perPage;

    const [rows] = await db.query(
      `SELECT id, category_id, name, description, mrp_price as mrpPrice, discounted_price as discountedPrice, quantity, image_url as imageUrl
       FROM products ORDER BY id ASC LIMIT ? OFFSET ?`,
      [perPage, offset]
    );
    const [countRows] = await db.query("SELECT COUNT(*) as total FROM products");
    const total = countRows[0].total || 0;
    const totalPages = Math.max(1, Math.ceil(total / perPage));
    return res.json({ page, perPage, total, totalPages, products: rows });
  } catch (err) {
    console.error("❌ getAllProductsPage error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

// Simple MySQL LIKE search
export const searchProductsByName = async (req, res) => {
  try {
    const q = (req.query.q || "").trim();
    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const perPage = getLimit(req, 10);
    const offset = (page - 1) * perPage;
    if (!q) return res.json({ q, page, perPage, total: 0, totalPages: 0, products: [] });

    const like = `%${q}%`;
    const [rows] = await db.query(
      `SELECT id, category_id, name, description, mrp_price as mrpPrice, discounted_price as discountedPrice, quantity, image_url as imageUrl
       FROM products WHERE name LIKE ? OR description LIKE ? ORDER BY id ASC LIMIT ? OFFSET ?`,
      [like, like, perPage, offset]
    );
    const [countRows] = await db.query("SELECT COUNT(*) as total FROM products WHERE name LIKE ? OR description LIKE ?", [like, like]);
    const total = countRows[0].total || 0;
    const totalPages = Math.max(1, Math.ceil(total / perPage));
    return res.json({ q, page, perPage, total, totalPages, products: rows });
  } catch (err) {
    console.error("❌ searchProductsByName error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

// ES fulltext search (if ES available)
export const searchProductsFullText = async (req, res) => {
  try {
    const q = (req.query.q || "").trim();
    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const perPage = getLimit(req, 10);
    const from = (page - 1) * perPage;
    if (!q) return res.json({ q, page, perPage, total: 0, totalPages: 0, products: [] });

    let esAvailable = false;
    if (esClient) {
      try { await esClient.ping(); esAvailable = true; } catch(e) { esAvailable = false; }
    }

    if (!esAvailable) {
      // fallback to MySQL search
      return await searchProductsByName(req, res);
    }

    const esRes = await esClient.search({
      index: process.env.ES_INDEX || "products",
      body: {
        query: { multi_match: { query: q, fields: ["name^3", "description"], fuzziness: "AUTO" } },
        from,
        size: perPage
      }
    });

    const hits = esRes.hits.hits || [];
    const products = hits.map(h => h._source);
    const total = typeof esRes.hits.total === "object" ? esRes.hits.total.value : esRes.hits.total;
    return res.json({ q, page, perPage, total, totalPages: Math.max(1, Math.ceil(total / perPage)), products });
  } catch (err) {
    console.error("❌ searchProductsFullText error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};
