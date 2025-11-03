import { Client as ESClient } from "@elastic/elasticsearch";
import db from "../config/db.js"; // Your DB connection
import dotenv from "dotenv";
dotenv.config();

// Initialize Elasticsearch client
const esClient = new ESClient({ node: process.env.ES_NODE || "http://localhost:9200" });
// --- FIX: Match your .env file ---
const indexName = process.env.ES_INDEX || "products";

const indexProducts = async () => {
  try {
    // --- FIX 1: JOIN with categories to get categoryName ---
    const [products] = await db.query(`
      SELECT 
        p.id, p.name, p.description, 
        p.mrp_price, p.discounted_price,
        p.quantity, p.image_url, p.category_id,
        c.name AS categoryName
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
    `);

    if (products.length === 0) {
      console.log("❌ No products found to index");
      return;
    }

    // Prepare the bulk body for Elasticsearch indexing
    const bulkBody = products.flatMap(product => [
      { index: { _index: indexName, _id: product.id } },
      {
        name: product.name,
        description: product.description,
        mrpPrice: product.mrp_price, // Use correct column names from DB
        discountedPrice: product.discounted_price, // Use correct column names
        quantity: product.quantity,
        category_id: product.category_id,
        imageUrl: product.image_url,
        categoryName: product.categoryName // This now has data from the JOIN
      }
    ]);

    // --- FIX 2: The v8 client response is NOT nested in 'body' ---
    const bulkResponse = await esClient.bulk({ refresh: true, body: bulkBody });

    // Check for errors in the bulk response
    const errors = bulkResponse.items.filter(item => item.index && item.index.error);

    if (errors.length > 0) {
      console.error("❌ Errors during bulk indexing:", JSON.stringify(errors, null, 2));
    } else {
      console.log(`✅ All ${products.length} products indexed successfully!`);
    }
  } catch (err) {
    console.error("❌ Error during indexing:", err);
    if (err.meta && err.meta.body) {
        console.error("Elasticsearch error body:", JSON.stringify(err.meta.body, null, 2));
    }
  }
};

indexProducts();