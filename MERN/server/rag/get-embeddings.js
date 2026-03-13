/**
 * GET-EMBEDDINGS.JS - Voyage AI Embedding Generation
 * 
 * WHAT IT DOES (Phase 1 - Ingestion):
 * Converts text into vector embeddings using Voyage AI's `voyage-3-large` model.
 * 
 * WHY VOYAGE AI?
 * - Superior accuracy for semantic search (better than OpenAI embeddings for RAG)
 * - Cost-effective ($0.10 per million input tokens vs OpenAI's $0.02)
 * - Optimized retrieval performance with input_type parameter
 * 
 * BEGINNER CONCEPT:
 * An embedding is a list of numbers that represents text meaning.
 * "senior developer" and "senior engineer" → similar embeddings → found together in search
 * 
 * Example output: [0.123, -0.456, 0.789, ... ] (1024 dimensions)
 */

const voyageai = require("voyageai");

// Initialize Voyage AI client with API key from environment
const client = new voyageai.Client({
  apiKey: process.env.VOYAGE_API_KEY,
});

/**
 * Generate embedding for a single text input
 * @param {string} text - The text to embed
 * @param {string} inputType - "document" for storage, "query" for search (default: "document")
 * @returns {Promise<number[]>} - Vector embedding array
 * 
 * USAGE:
 * const embedding = await getEmbedding("Senior Frontend Developer");
 * // Returns: [0.123, -0.456, 0.789, ...]
 */
async function getEmbedding(text, inputType = "document") {
  try {
    if (!text || typeof text !== "string") {
      throw new Error("Text input must be a non-empty string");
    }

    // Voyage AI `voyage-3-large` model (1024-dimensional embeddings)
    const response = await client.embed([text], {
      model: "voyage-3-large",
      inputType: inputType, // "document" for chunks, "query" for user questions
    });

    // Return the first (and only) embedding
    return response.data[0].embedding;
  } catch (error) {
    console.error("Error generating embedding:", error.message);
    throw new Error(`Embedding generation failed: ${error.message}`);
  }
}

/**
 * Generate embeddings for multiple texts (batch processing)
 * @param {string[]} texts - Array of texts to embed
 * @param {string} inputType - "document" or "query"
 * @returns {Promise<number[][]>} - Array of vector embeddings
 * 
 * USAGE:
 * const embeddings = await getEmbeddings([
 *   "Senior Frontend Developer",
 *   "Backend Engineer"
 * ]);
 * // Returns: [[0.123, ...], [0.456, ...]]
 */
async function getEmbeddings(texts, inputType = "document") {
  try {
    if (!Array.isArray(texts) || texts.length === 0) {
      throw new Error("Texts must be a non-empty array");
    }

    // Batch API call - more efficient than individual calls
    const response = await client.embed(texts, {
      model: "voyage-3-large",
      inputType: inputType,
    });

    // Return array of embeddings in same order as input
    return response.data.map((item) => item.embedding);
  } catch (error) {
    console.error("Error generating embeddings:", error.message);
    throw new Error(`Batch embedding generation failed: ${error.message}`);
  }
}

module.exports = {
  getEmbedding,
  getEmbeddings,
};
