/**
 * RAG-VECTOR-INDEX.JS - MongoDB Vector Search Index Management
 * 
 * WHAT IS A VECTOR INDEX?
 * A database index that organizes embeddings (vectors) for fast similarity search.
 * Without it, searches would scan ALL documents (O(n) complexity).
 * With it, searches use intelligent data structures (O(log n) or better).
 * 
 * WHY "IVF" (Inverted File)?
 * IVF divides vector space into clusters. Search only checks relevant clusters.
 * Trade-off: Slightly less accurate than brute force, but 100x faster.
 * 
 * COSINE SIMILARITY:
 * How MongoDB measures if two vectors are "similar" (0 = opposite, 1 = identical).
 * Used for semantic search: "senior frontend" ≈ "senior react engineer"
 */

import { MongoClient } from 'mongodb';

const VECTOR_DB_NAME = "vector_store_database";
const VECTOR_COLLECTION_NAME = "embedding_store";
const INDEX_NAME = "vector_index";

/**
 * Create or recreate vector search index
 * 
 * INDEX PARAMETERS:
 * - m: Number of connections per node (4-64 recommended, default 4)
 *   Higher = more accurate, slower ingestion
 * - efConstruction: Size of neighbor list (default 400)
 * - efSearch: Size of neighbor list during search (default 400)
 * - metric: "cosine" for semantic similarity
 * 
 * @param {string} mongoUri - MongoDB connection string
 * @returns {Promise<Object>} - Index creation result
 */
async function createVectorIndex(mongoUri) {
  let client;

  try {
    if (!mongoUri) {
      throw new Error("MONGO_URI environment variable not set");
    }

    console.log("[INDEX] Connecting to MongoDB...");
    client = new MongoClient(mongoUri);
    await client.connect();

    const vectorDb = client.db(VECTOR_DB_NAME);
    const collection = vectorDb.collection(VECTOR_COLLECTION_NAME);

    console.log(`[INDEX] Connected to ${VECTOR_DB_NAME}.${VECTOR_COLLECTION_NAME}`);

    // Drop existing index if present
    console.log(`[INDEX] Dropping existing "${INDEX_NAME}" index (if exists)...`);
    try {
      await collection.dropIndex(INDEX_NAME);
      console.log("[INDEX] ✓ Previous index dropped");
    } catch (error) {
      if (error.message.includes("index not found")) {
        console.log("[INDEX] No existing index to drop");
      } else {
        throw error;
      }
    }

    // Create new vector search index
    console.log("[INDEX] Creating new vector search index...");
    console.log("[INDEX] Parameters:");
    console.log('  - kind: "vector-ivf" (Inverted File for fast search)');
    console.log("  - m: 4 (connections per node)");
    console.log("  - efConstruction: 400 (neighbor list size)");
    console.log("  - efSearch: 400 (search neighbor list size)");
    console.log('  - metric: "cosine" (semantic similarity)');

    const createIndexResult = await collection.createIndex(
      { embedding: "cosmosSearch" },
      {
        name: INDEX_NAME,
        cosmosSearchOptions: {
          kind: "vector-ivf",
          m: 4, // Bi-directional links per node
          efConstruction: 400, // Size of dynamic list for construction
          efSearch: 400, // Size of dynamic list for search
          metric: "cosine", // Distance metric: cosine similarity
        },
        background: true, // Build index in background (doesn't block collection)
      }
    );

    console.log("[INDEX] ✓ Vector index created successfully!");
    console.log("[INDEX] Index name:", INDEX_NAME);
    console.log("[INDEX] Database:", VECTOR_DB_NAME);
    console.log("[INDEX] Collection:", VECTOR_COLLECTION_NAME);

    return {
      status: "success",
      indexName: INDEX_NAME,
      message: "Vector search index created",
    };
  } catch (error) {
    console.error("[INDEX] Error creating vector index:", error.message);
    throw error;
  } finally {
    if (client) {
      await client.close();
      console.log("[INDEX] Connection closed");
    }
  }
}

/**
 * Get vector index information
 * @param {string} mongoUri - MongoDB connection string
 * @returns {Promise<Array>} - List of indexes on collection
 */
async function getIndexInfo(mongoUri) {
  let client;

  try {
    client = new MongoClient(mongoUri);
    await client.connect();

    const vectorDb = client.db(VECTOR_DB_NAME);
    const collection = vectorDb.collection(VECTOR_COLLECTION_NAME);

    const indexes = await collection.listIndexes().toArray();

    console.log("[INDEX] Current indexes on collection:");
    indexes.forEach((idx) => {
      console.log(`  - ${idx.name}:`, idx.key);
    });

    return indexes;
  } catch (error) {
    console.error("[INDEX] Error fetching index info:", error.message);
    throw error;
  } finally {
    if (client) {
      await client.close();
    }
  }
}

export {
  createVectorIndex,
  getIndexInfo,
};
