// utils/syncElastic.js
import db from "../config/db.js";
import { Client as ESClient } from "@elastic/elasticsearch";
import dotenv from "dotenv";
dotenv.config();

const esClient = new ESClient({ node: process.env.ES_NODE || "http://localhost:9200" });
const indexName = process.env.ES_INDEX || "products_index";

const syncProductsToES = async () => {
  try {
    console.log("🚀 Syncing MySQL products → Elasticsearch");

    // 1️⃣ Fetch all products from MySQL
    const [products] = await db.query(`
      SELECT id, category_id, name, description,
             mrp_price AS mrpPrice,
             discounted_price AS discountedPrice,
             quantity,
             image_url AS imageUrl
      FROM products
    `);

    if (!products.length) {
      console.log("⚠️ No products found in database");
      return;
    }

    // 2️⃣ Ensure index exists (or create with proper mappings)
    const exists = await esClient.indices.exists({ index: indexName });
    if (!exists) {
      await esClient.indices.create({
        index: indexName,
        body: {
          mappings: {
            properties: {
              id: { type: "integer" },
              name: { type: "text" },
              description: { type: "text" },
              mrpPrice: { type: "float" },
              discountedPrice: { type: "float" },
              quantity: { type: "integer" },
              category_id: { type: "integer" },
              imageUrl: { type: "keyword" }
            }
          }
        }
      });
      console.log("✅ Created Elasticsearch index:", indexName);
    }

    // 3️⃣ Prepare bulk upload
    const bulkBody = products.flatMap((p) => [
      { index: { _index: indexName, _id: p.id } },
      p
    ]);

    const bulkResponse = await esClient.bulk({ refresh: true, body: bulkBody });

    if (bulkResponse.errors) {
      const errored = bulkResponse.items.filter((i) => i.index && i.index.error);
      console.error("❌ Bulk indexing errors:", errored);
    } else {
      console.log(`✅ Indexed ${products.length} products`);
    }
  } catch (err) {
    console.error("❌ syncProductsToES error:", err);
  } finally {
    process.exit(0);
  }
};

syncProductsToES();
