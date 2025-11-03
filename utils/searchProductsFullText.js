// utils/searchProductsFullText.js
import { Client as ESClient } from "@elastic/elasticsearch";
import dotenv from "dotenv";
dotenv.config();

const esClient = new ESClient({ node: process.env.ES_NODE || "http://localhost:9200" });

export const searchProductsFullText = async (req, res) => {
  try {
    const q = (req.query.q || "").trim();  // Search term, e.g., "phone"
    const maxPrice = req.query.maxPrice ? parseFloat(req.query.maxPrice) : null;  // Price limit
    const minPrice = req.query.minPrice ? parseFloat(req.query.minPrice) : null;  // Price range
    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const perPage = parseInt(req.query.perPage || "10", 10);
    const from = (page - 1) * perPage;

    if (!q) return res.json({ q, page, perPage, total: 0, totalPages: 0, products: [] });

    const esQuery = {
      index: process.env.ES_INDEX || "products_index",
      body: {
        query: {
          bool: {
            must: [
              { multi_match: { query: q, fields: ["name^3", "description^2", "categoryName"], fuzziness: "AUTO" } }
            ],
            filter: [] // Filters will go here
          }
        },
        from,
        size: perPage
      }
    };

    // Add price filters if provided
    if (maxPrice) {
      esQuery.body.query.bool.filter.push({
        range: {
          discountedPrice: {
            lte: maxPrice
          }
        }
      });
    }

    if (minPrice) {
      esQuery.body.query.bool.filter.push({
        range: {
          discountedPrice: {
            gte: minPrice
          }
        }
      });
    }

    // Execute Elasticsearch query
    const esRes = await esClient.search(esQuery);
    const hits = esRes.hits.hits || [];
    
    // Map the hits to return the relevant fields
    const products = hits.map(hit => ({
      id: hit._id,
      name: hit._source.name || "Unnamed product",
      description: hit._source.description || "No description",
      price: hit._source.discountedPrice || hit._source.mrpPrice || 0,
      quantity: hit._source.quantity || 0,
      category: hit._source.categoryName || "Uncategorized",
      imageUrl: hit._source.imageUrl || "No Image"
    }));

    const total = typeof esRes.hits.total === "object" ? esRes.hits.total.value : esRes.hits.total;

    return res.json({
      q,
      page,
      perPage,
      total,
      totalPages: Math.max(1, Math.ceil(total / perPage)),
      products
    });
  } catch (err) {
    console.error("❌ Error during Elasticsearch search:", err);
    return res.status(500).json({ message: "Search failed", error: err.message });
  }
};
