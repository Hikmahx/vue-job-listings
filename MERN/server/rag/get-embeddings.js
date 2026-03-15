/**
 * GET-EMBEDDINGS.JS - Voyage AI Embedding Generation
 *
 * WHAT IT DOES (Phase 1 - Ingestion):
 * Converts text into 768-dimensional vector embeddings using Voyage AI.
 * These embeddings are stored in MongoDB and used for similarity search.
 *
 * VECTOR DIMENSIONS: 768 (matches MongoDB vector search index configuration)
 *
 * WHY VOYAGE AI?
 * - State-of-the-art retrieval accuracy for RAG applications
 * - Optimized input_type parameter ("document" vs "query")
 * - Cost-effective for production use
 *
 * EMBEDDING CONCEPT:
 * An embedding converts text meaning into numbers: "senior developer" and
 * "senior engineer" → similar embeddings → found together in vector search.
 * Example: [0.123, -0.456, 0.789, ... ] (768 values)
 */

import {VoyageAIClient} from 'voyageai';

// Initialize Voyage AI client with API key from environment
const client = new VoyageAIClient({
  apiKey: process.env.VOYAGE_API_KEY,
});

/**
 * Generate embedding for a single text input
 *
 * @param {string} text - The text to embed
 * @param {string} inputType - "document" for storage, "query" for search (default: "document")
 * @returns {Promise<number[]>} - 768-dimensional vector embedding
 *
 * USAGE:
 * const embedding = await getEmbedding("Senior Frontend Developer");
 * // Returns: [0.123, -0.456, 0.789, ... ] (768 dimensions)
 */
export async function getEmbedding(text, inputType = 'document') {
  try {
    if (!text || typeof text !== 'string') {
      throw new Error('Text input must be a non-empty string');
    }

    // Voyage AI model produces 768-dimensional embeddings
    const response = await client.embed([text], {
      model: 'voyage-3',
      input_type: inputType, // "document" for storage, "query" for search
    });

    // Validate response structure
    if (!response?.data?.[0]?.embedding) {
      throw new Error(`Invalid embedding response: ${JSON.stringify(response)}`);
    }

    const embedding = response.data[0].embedding;

    // Validate dimensions match MongoDB vector search index (768)
    if (embedding.length !== 768) {
      throw new Error(
        `Expected 768-dimensional embedding, got ${embedding.length} dimensions`
      );
    }

    return embedding;
  } catch (error) {
    console.error('[RAG] Embedding error:', {
      message: error.message,
      textLength: text?.length || 0,
    });
    throw error;
  }
}

/**
 * Generate embeddings for multiple texts (batch processing)
 * More efficient than calling getEmbedding individually
 *
 * @param {string[]} texts - Array of texts to embed
 * @param {string} inputType - "document" or "query"
 * @returns {Promise<number[][]>} - Array of 768-dimensional embeddings
 *
 * USAGE:
 * const embeddings = await getEmbeddings([
 *   "Senior Frontend Developer",
 *   "Backend Engineer"
 * ]);
 * // Returns: [[0.123, ...], [0.456, ...]] (each is 768 dims)
 */
export async function getEmbeddings(texts, inputType = 'document') {
  try {
    if (!Array.isArray(texts) || texts.length === 0) {
      throw new Error('Texts must be a non-empty array');
    }

    // Batch API call - more efficient than individual calls
    const response = await client.embed(texts, {
      model: 'voyage-3',
      input_type: inputType,
    });

    // Validate response
    if (!response?.data || !Array.isArray(response.data)) {
      throw new Error(`Invalid batch embedding response: ${JSON.stringify(response)}`);
    }

    // Return array of embeddings in same order as input
    const embeddings = response.data.map((item) => item.embedding);

    // Validate all embeddings have correct dimensions
    embeddings.forEach((embedding, index) => {
      if (embedding.length !== 768) {
        throw new Error(
          `Embedding ${index} has ${embedding.length} dimensions, expected 768`
        );
      }
    });

    return embeddings;
  } catch (error) {
    console.error('[RAG] Batch embedding error:', {
      message: error.message,
      textCount: texts?.length || 0,
    });
    throw error;
  }
}
