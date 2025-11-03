// data/seed.js
import db from "../config/db.js";
import { categories as catsData, generateProducts } from "./productData.js"; // create this file as shown previously
import dotenv from "dotenv";
dotenv.config();

const products = generateProducts();

const run = async () => {
  try {
    // insert categories
    for (const c of catsData) {
      await db.query("INSERT INTO categories (name, description) VALUES (?, ?)", [c.name, c.description]);
    }
    // insert products
    for (const p of products) {
      await db.query("INSERT INTO products (name, description, mrp_price, discounted_price, quantity, category_id, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [p.name, p.description, p.mrp_price, p.discounted_price, p.quantity, p.category_id, p.image || `https://picsum.photos/seed/${encodeURIComponent(p.name)}/400/300`]);
    }
    console.log("Seeding complete");
    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  }
};

run();
