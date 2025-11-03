import { Client as ESClient } from "@elastic/elasticsearch";
import dotenv from "dotenv";
dotenv.config();

// Initialize Elasticsearch client
const esClient = new ESClient({ node: process.env.ES_NODE || "http://localhost:9200" });

const createIndex = async () => {
  // --- FIX: Match your .env file and controller ---
  const indexName = process.env.ES_INDEX || "products"; 

  try {
    // Check if the index already exists
    const exists = await esClient.indices.exists({ index: indexName });
    if (!exists) {
      // Create index with mappings
      await esClient.indices.create({
        index: indexName,
        body: {
          mappings: {
            properties: {
              name: { type: "text" },
              description: { type: "text" },
              // --- FIX: Must be 'text' to be full-text searchable ---
              categoryName: { type: "text" }, 
              discountedPrice: { type: "float" },
              mrpPrice: { type: "float" },
              quantity: { type: "integer" },
              imageUrl: { type: "keyword" }, // 'keyword' is OK for URLs
              category_id: { type: "integer" } // 'integer' is OK for filtering
            }
          }
        }
      });
      console.log("✅ Elasticsearch index created:", indexName);
    } else {
      console.log("✅ Index already exists:", indexName);
    }
  } catch (err) {
    console.error("❌ Error creating Elasticsearch index:", err.message);
  }
};

createIndex();