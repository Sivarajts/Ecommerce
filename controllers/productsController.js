import db from "../config/db.js";
import { Client as ESClient } from "@elastic/elasticsearch";
import dotenv from "dotenv";
dotenv.config();

// ✅ ElasticSearch Client
let esClient = null;
try {
  esClient = new ESClient({ node: process.env.ES_NODE });
  console.log("✅ Elasticsearch client initialized:", process.env.ES_NODE);
} catch (err) {
  console.error("❌ Failed to initialize Elasticsearch:", err.message);
  esClient = null;
}

// Helper: accept either ?limit= or ?perPage=, fallback
const getLimit = (req, fallback) => {
  const v = req.query.limit ?? req.query.perPage ?? fallback;
  return Math.max(1, parseInt(v, 10));
};

// 🧩 Categories Pagination
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

// P roducts by Category
export const getProductsByCategory = async (req, res) => {
  try {
    const categoryId = parseInt(req.params.id, 10);
    if (Number.isNaN(categoryId))
      return res.status(400).json({ error: "Invalid category id" });

    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const perPage = getLimit(req, 10);
    const offset = (page - 1) * perPage;

    const [countRows] = await db.query(
      "SELECT COUNT(*) as total FROM products WHERE category_id = ?",
      [categoryId]
    );
    const totalRaw = countRows[0].total || 0;
    const CAP = 25;
    const total = Math.min(totalRaw, CAP);
    const totalPages = Math.max(1, Math.ceil(total / perPage));

    if (offset >= CAP) {
      return res.json({ categoryId, page, perPage, total, totalPages, products: [] });
    }

    const adjustedLimit = Math.min(perPage, CAP - offset);
    const [rows] = await db.query(
      `SELECT id, category_id, name, description, mrp_price as mrpPrice,
              discounted_price as discountedPrice, quantity, image_url as imageUrl
       FROM products WHERE category_id = ? ORDER BY id ASC LIMIT ? OFFSET ?`,
      [categoryId, adjustedLimit, offset]
    );

    return res.json({ categoryId, page, perPage, total, totalPages, products: rows });
  } catch (err) {
    console.error("❌ getProductsByCategory error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

// 🧩 All Products (Paginated)
export const getAllProductsPage = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const perPage = getLimit(req, 10);
    const offset = (page - 1) * perPage;

    const [rows] = await db.query(
      `SELECT id, category_id, name, description, mrp_price as mrpPrice,
              discounted_price as discountedPrice, quantity, image_url as imageUrl
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

// 🧩 MySQL Fallback Search
export const searchProductsByName = async (req, res) => {
  try {
    const q = (req.query.q || "").trim();
    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const perPage = getLimit(req, 10);
    const offset = (page - 1) * perPage;
    if (!q)
      return res.json({ q, page, perPage, total: 0, totalPages: 0, products: [] });

    const like = `%${q}%`;
    const [rows] = await db.query(
      `SELECT id, category_id, name, description, mrp_price as mrpPrice,
              discounted_price as discountedPrice, quantity, image_url as imageUrl
       FROM products WHERE name LIKE ? OR description LIKE ?
       ORDER BY id ASC LIMIT ? OFFSET ?`,
      [like, like, perPage, offset]
    );
    const [countRows] = await db.query(
      "SELECT COUNT(*) as total FROM products WHERE name LIKE ? OR description LIKE ?",
      [like, like]
    );
    const total = countRows[0].total || 0;
    const totalPages = Math.max(1, Math.ceil(total / perPage));
    return res.json({ q, page, perPage, total, totalPages, products: rows });
  } catch (err) {
    console.error("❌ searchProductsByName error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};


// --- THIS IS THE UPGRADED E-COMMERCE QUERY ---
export const searchProductsFullText = async (req, res) => {
  console.log("✅ INCOMING ES-SEARCH REQUEST:", req.query); 
  
  try {
    // 1. Read ALL query parameters
    let q = (req.query.q || "").trim();
    let maxPrice = req.query.maxPrice ? parseFloat(req.query.maxPrice) : null;
    let minPrice = req.query.minPrice ? parseFloat(req.query.minPrice) : null;
    let categoryId = req.query.categoryId ? parseInt(req.query.categoryId, 10) : null;

    // --- NEW NLP (Natural Language Processing) PARSER ---
    let cleanQuery = q; // This will be the search term, e.g., "philips"
    
    // Regex for "under 1000" or "less than 500" or "max 2000"
    const maxRegex = /(?:under|less than|max)\s*(\d+)/i;
    // Regex for "over 1000" or "above 500" or "min 20"
    const minRegex = /(?:over|above|min)\s*(\d+)/i;
    // Regex for "between 1000 and 2000"
    const betweenRegex = /(?:between)\s*(\d+)\s*(?:and)\s*(\d+)/i;

    const maxMatch = q.match(maxRegex);
    const minMatch = q.match(minRegex);
    const betweenMatch = q.match(betweenRegex);

    if (betweenMatch) {
      minPrice = parseFloat(betweenMatch[1]); // e.g., "1000"
      maxPrice = parseFloat(betweenMatch[2]); // e.g., "2000"
      cleanQuery = q.replace(betweenRegex, "").trim(); // Remove "between 1000 and 2000"
    } else {
      if (maxMatch) {
        maxPrice = parseFloat(maxMatch[1]); // e.g., "1000"
        cleanQuery = cleanQuery.replace(maxRegex, "").trim(); // Remove "under 1000"
      }
      if (minMatch) {
        minPrice = parseFloat(minMatch[1]); // e.g., "500"
        cleanQuery = cleanQuery.replace(minRegex, "").trim(); // Remove "over 500"
      }
    }
    // --- END OF NLP PARSER ---
    
    // Use the 'clean' query for the search, but original 'q' for the response
    const searchQuery = cleanQuery || q; // If cleanQuery is empty, use original

    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const perPage = getLimit(req, 10);
    const from = (page - 1) * perPage;

    if (!searchQuery) {
      return res.json({ q, page, perPage, total: 0, totalPages: 0, products: [] });
    }

    let esAvailable = false;
    if (esClient) {
      try { await esClient.ping(); esAvailable = true; } catch (e) { esAvailable = false; }
    }

    if (!esAvailable) {
      console.warn("⚠️ Elasticsearch unavailable, falling back to MySQL LIKE search.");
      return await searchProductsByName(req, res);
    }

    // 2. Build the filter array dynamically
    const filters = [];
    
    // Build price filter (now includes parsed values)
    const priceFilter = {};
    if (minPrice) priceFilter.gte = minPrice;
    if (maxPrice) priceFilter.lte = maxPrice;
    if (Object.keys(priceFilter).length > 0) {
      filters.push({
        range: { discountedPrice: priceFilter }
      });
    }
    
    // Build category filter
    if (categoryId) {
      filters.push({
        term: { category_id: categoryId }
      });
    }

    // 3. Build the robust "e-commerce" query
    const esQuery = {
      index: process.env.ES_INDEX || "products",
      body: {
        query: {
          bool: {
            must: {
              bool: {
                should: [
                  { // Query 1: Exact match
                    multi_match: {
                      query: searchQuery,
                      fields: ["name^4", "categoryName^2", "description"],
                      type: "best_fields"
                    }
                  },
                  { // Query 2: Fuzzy match for typos
                    multi_match: {
                      query: searchQuery,
                      fields: ["name^3", "categoryName", "description"],
                      fuzziness: 2,
                      prefix_length: 2
                    }
                  },
                  { // Query 3: Partial/Prefix match
                    multi_match: {
                      query: searchQuery,
                      fields: ["name^2", "categoryName", "description"],
                      type: "phrase_prefix"
                    }
                  }
                ],
                minimum_should_match: 1
              }
            },
            filter: filters 
          }
        },
        from,
        size: perPage
      }
    };

    // Execute Elasticsearch query
    const esRes = await esClient.search(esQuery);
    
    const hits = esRes.hits.hits || [];
    const products = hits.map(hit => ({
      id: hit._id,
      ...hit._source
    }));

    const total = typeof esRes.hits.total === "object" ? esRes.hits.total.value : esRes.hits.total;

    return res.json({ 
      q, // Return original query
      page, 
      perPage, 
      total, 
      totalPages: Math.max(1, Math.ceil(total / perPage)), 
      products 
    });

  } catch (err) {
    console.error("❌ searchProductsFullText error:", err);
    if (err.meta && err.meta.body) {
        console.error("Elasticsearch error body:", JSON.stringify(err.meta.body, null, 2));
    }
    return res.status(500).json({ error: "Server error" });
  }
};