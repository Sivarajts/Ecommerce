// backend/controllers/productsController.js
import { Client as ESClient } from "@elastic/elasticsearch";
import dotenv from "dotenv";
dotenv.config();

// ✅ Initialize Elasticsearch client
const esClient = new ESClient({ node: process.env.ES_NODE || "http://localhost:9200" });

export const elasticSearch = async (req, res) => {
  try {
    const { q, maxPrice, minPrice, categoryId, page = 1, perPage = 10 } = req.query;

    if (!q || q.trim() === "") {
      return res.status(400).json({ message: "Please provide a search query" });
    }

    // Set up pagination
    const from = (page - 1) * perPage;

    // Construct the Elasticsearch query
    const esQuery = {
      index: process.env.ES_INDEX || "products_index", // The Elasticsearch index name
      body: {
        query: {
          bool: {
            must: [
              { 
                multi_match: {
                  query: q,
                  fields: ["name^3", "description^2", "categoryName"],
                  fuzziness: "AUTO",
                },
              },
            ],
            filter: [] // Filters will go here
          },
        },
        from, // For pagination
        size: perPage, // Number of results per page
      },
    };

    // Add price filters if provided
    if (maxPrice) {
      esQuery.body.query.bool.filter.push({
        range: {
          discountedPrice: {
            lte: parseFloat(maxPrice), // Less than or equal to maxPrice
          },
        },
      });
    }

    if (minPrice) {
      esQuery.body.query.bool.filter.push({
        range: {
          discountedPrice: {
            gte: parseFloat(minPrice), // Greater than or equal to minPrice
          },
        },
      });
    }

    // Add category filter if provided
    if (categoryId) {
      esQuery.body.query.bool.filter.push({
        term: {
          category_id: parseInt(categoryId), // Filter by categoryId
        },
      });
    }

    // Execute the Elasticsearch query
    const esRes = await esClient.search(esQuery);
    const hits = esRes.hits.hits || [];
    
    // Map the hits to return the relevant fields
    const products = hits.map((hit) => ({
      id: hit._id,
      name: hit._source.name || "Unnamed product",
      description: hit._source.description || "No description",
      price: hit._source.discountedPrice || hit._source.mrpPrice || 0,
      quantity: hit._source.quantity || 0,
      category: hit._source.categoryName || "Uncategorized",
      imageUrl: hit._source.imageUrl || "No Image",
    }));

    // If no products are found, return 404 error
    if (products.length === 0) {
      return res.status(404).json({ message: "No matching products found" });
    }

    // Return the matching products with pagination info
    return res.json({
      q,
      page,
      perPage,
      total: esRes.hits.total.value,
      totalPages: Math.max(1, Math.ceil(esRes.hits.total.value / perPage)),
      products,
    });
  } catch (err) {
    console.error("❌ Error during Elasticsearch search:", err);
    return res.status(500).json({ message: "Search failed", error: err.message });
  }
};
