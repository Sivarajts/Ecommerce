// backend/routes/productRoutes.js
import express from "express";
import {
  getCategoriesPage,
  getProductsByCategory,
  getAllProductsPage,
  searchProductsByName,
  searchProductsFullText
} from "../controllers/productsController.js";

const router = express.Router();

// Categories - kept path the same as frontend expects
router.get("/products/categories", getCategoriesPage);
router.get("/categories", getCategoriesPage); // alternative path

// Products by category
router.get("/products/category/:id", getProductsByCategory);

// All products (frontend uses /api/products?page=..)
router.get("/products", getAllProductsPage);
router.get("/products/all", getAllProductsPage);

// Search endpoints
router.get("/products/search", searchProductsByName); // Fallback to MySQL search
router.get("/products/search/fulltext", searchProductsFullText); // Elasticsearch full-text search

export default router;
