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

// categories - kept path the same as frontend expects
router.get("/products/categories", getCategoriesPage);
router.get("/categories", getCategoriesPage); // alternative path

// products by category
router.get("/products/category/:id", getProductsByCategory);

// all products (frontend uses /api/products?page=..)
router.get("/products", getAllProductsPage);
router.get("/products/all", getAllProductsPage);

// search endpoints
router.get("/products/search", searchProductsByName); // fallback
router.get("/products/search/fulltext", searchProductsFullText);

export default router;
