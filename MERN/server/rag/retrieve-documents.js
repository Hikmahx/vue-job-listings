/**
 * RETRIEVE-DOCUMENTS.JS - Vector Search & Document Retrieval
 * 
 * WHAT IT DOES (Phase 2 - Retrieval):
 * 1. Converts user query to embedding (same model as ingestion)
 * 2. Searches MongoDB vector store for similar embeddings
 * 3. Returns top-K most relevant documents + metadata
 * 
 * WHY VECTOR SEARCH WORKS:
 * User Query: "I want a female-founded tech startup"
 *        ↓
 * Embedding: [0.234, -0.567, 0.891, ...]
 *        ↓
 * Vector Search: "Which job embeddings are closest to this?"
 *        ↓
 * Results: Jobs where embedding ≈ query embedding
 *        ↓
 * LLM: "These are relevant to female-founded startups"
 * 
 * COSINE SIMILARITY SCORE:
 * 0 = Not related at all
 * 0.5 = Moderately related
 * 1.0 = Identical meaning
 */

import { MongoClient } from 'mongodb';
import { getEmbedding } from './get-embeddings.js';

const VECTOR_DB_NAME = "vector_store_database";
const VECTOR_COLLECTION_NAME = "embedding_store";

/**
 * Retrieve top-K most similar documents to user query
 * 
 * PROCESS:
 * 1. Convert query to embedding using same model as ingestion
 * 2. Use $search stage in aggregation pipeline for vector similarity
 * 3. Return documents with similarity scores
 * 4. Filter by minimum similarity threshold
 * 
 * @param {string} query - User's natural language query
 * @param {string} mongoUri - MongoDB connection string
 * @param {number} topK - Number of top results (default 5)
 * @param {number} minSimilarity - Minimum similarity score (0-1, default 0.0)
 * @returns {Promise<Array>} - Array of relevant documents with scores
 * 
 * USAGE:
 * const results = await retrieveDocuments(
 *   "I want a female-founded tech startup in the US",
 *   process.env.MONGO_URI,
 *   5  // Top 5 results
 * );
 */
async function retrieveDocuments(query, mongoUri, topK = 5, minSimilarity = 0.0) {
  let client;

  try {
    if (!mongoUri) {
      throw new Error("MONGO_URI environment variable not set");
    }

    // Convert query to embedding using input_type="query"
    // This optimizes embedding for search instead of storage
    console.log("[RETRIEVE] Generating query embedding...");
    const queryEmbedding = await getEmbedding(query, "query");
    console.log(
      `[RETRIEVE] ✓ Generated embedding (dimension: ${queryEmbedding.length})`
    );

    client = new MongoClient(mongoUri);
    await client.connect();

    const vectorDb = client.db(VECTOR_DB_NAME);
    const collection = vectorDb.collection(VECTOR_COLLECTION_NAME);

    console.log(`[RETRIEVE] Searching ${topK} similar documents...`);

    // MongoDB Atlas Vector Search aggregation pipeline
    // $search performs vector similarity search using cosine distance
    // Requires vector search index to be created in MongoDB Atlas UI
    const searchPipeline = [
      {
        $search: {
          cosmosSearch: {
            vector: queryEmbedding, // 768-dimensional query embedding
            k: topK, // Return top-K results
          },
          returnScore: true, // Include similarity scores
        },
      },
      {
        // Project fields to return (exclude raw embedding for readability)
        $project: {
          jobId: 1,
          companyId: 1,
          position: 1,
          company: 1,
          location: 1,
          level: 1,
          text: 1,
          metadata: 1,
          similarityScore: { $meta: 'searchScore' }, // Return the similarity score
        },
      },
      {
        // Sort by similarity score (highest first)
        $sort: { similarityScore: -1 },
      },
      {
        // Limit to topK results
        $limit: topK,
      },
    ];

    const results = await collection
      .aggregate(searchPipeline)
      .toArray();

    console.log(`[RETRIEVE] ✓ Found ${results.length} relevant documents`);

    // Filter by minimum similarity if needed
    const filteredResults = results.filter(
      (doc) => doc.similarityScore >= minSimilarity
    );

    if (filteredResults.length < results.length) {
      console.log(
        `[RETRIEVE] Filtered to ${filteredResults.length} documents (min similarity: ${minSimilarity})`
      );
    }

    return filteredResults;
  } catch (error) {
    console.error("[RETRIEVE] Error retrieving documents:", error.message);
    throw error;
  } finally {
    if (client) {
      await client.close();
    }
  }
}

/**
 * Format retrieved documents for use in LLM context
 * 
 * WHAT IT DOES:
 * Converts raw MongoDB documents into clean format for passing to LLM
 * Removes unnecessary fields, includes relevant metadata
 * 
 * @param {Array} documents - Raw documents from retrieveDocuments()
 * @returns {Array} - Formatted documents ready for LLM
 */
function formatDocumentsForLLM(documents) {
  return documents.map((doc) => ({
    position: doc.position,
    company: doc.company,
    location: doc.location,
    level: doc.level,
    text: doc.text,
    similarity_score: parseFloat(doc.similarityScore.toFixed(3)),
    metadata: doc.metadata,
  }));
}

/**
 * Build context string from retrieved documents for LLM prompt
 * 
 * EXAMPLE OUTPUT:
 * ```
 * RELEVANT JOB DATA:
 * 
 * [1] Senior Frontend Developer at TechCorp (score: 0.876)
 * Location: United States | Level: Senior
 * Position: Senior Frontend Developer | Role: Frontend | Level: senior |
 * Location: United States | Work Type: remote | Contract: full-time |
 * Required Skills: React, TypeScript, CSS | Company Name: TechCorp |
 * Industry: ai_ml | Company Size: 45 employees | Founded: 2021 |
 * Headquarters: San Francisco | Founder Gender: female
 * ```
 */
function buildContextString(documents) {
  if (!documents || documents.length === 0) {
    return "No relevant job data found.";
  }

  let context = "RELEVANT JOB DATA:\n\n";

  documents.forEach((doc, index) => {
    context += `[${index + 1}] ${doc.position} at ${doc.company} (similarity score: ${doc.similarityScore.toFixed(3)})\n`;
    context += `Location: ${doc.location} | Level: ${doc.level}\n`;
    context += `${doc.text}\n\n`;
  });

  return context;
}

export {
  retrieveDocuments,
  formatDocumentsForLLM,
  buildContextString,
};
