/**
 * GET-EMBEDDINGS.JS - Open-Source Embedding Generation
 *
 * WHAT IT DOES (Phase 1 - Ingestion):
 * Converts text into 768-dimensional vector embeddings using Xenova/Transformers.
 * These embeddings are stored in MongoDB and used for similarity search.
 *
 * VECTOR DIMENSIONS: 768 (all-mpnet-base-v2 model output)
 *
 * WHY OPEN-SOURCE?
 * - No API costs or rate limits
 * - Runs locally (no external API calls)
 * - Privacy: data never leaves your server
 * - SBERT models optimized for semantic search
 *
 * EMBEDDING CONCEPT:
 * An embedding converts text meaning into numbers: "senior developer" and
 * "senior engineer" → similar embeddings → found together in vector search.
 * Example: [0.123, -0.456, 0.789, ... ] (768 values)
 */

import { pipeline } from '@xenova/transformers';

// Initialize the embedding model (lazy loads on first use)
let embeddingPipeline = null;

async function getEmbeddingPipeline() {
  if (!embeddingPipeline) {
    console.log('[EMBEDDINGS] Loading Xenova/all-mpnet-base-v2 model...');
    embeddingPipeline = await pipeline('feature-extraction', 'Xenova/all-mpnet-base-v2');
    console.log('[EMBEDDINGS] ✓ Model loaded');
  }
  return embeddingPipeline;
}

/**
 * Generate embedding for a single text input
 *
 * @param {string} text - The text to embed
 * @param {string} inputType - Unused (kept for API compatibility with Voyage AI)
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

    const pipeline = await getEmbeddingPipeline();
    
    // all-mpnet-base-v2 produces 768-dimensional embeddings
    const result = await pipeline(text, {
      pooling: 'mean',
      normalize: true,
    });

    // Convert Xenova tensor to plain array
    // Result is a Tensor object with data property containing the embedding
    const embedding = Array.from(result.data);

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
 * @param {string} inputType - Unused (kept for API compatibility)
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

    const pipeline = await getEmbeddingPipeline();
    
    // Batch process texts
    // Pipeline returns a Tensor2D with shape [num_texts, 768]
    const result = await pipeline(texts, {
      pooling: 'mean',
      normalize: true,
    });

    // Extract embeddings from tensor
    // If single text, result is Tensor1D; if batch, result is Tensor2D
    let embeddings;
    if (texts.length === 1) {
      embeddings = [Array.from(result.data)];
    } else {
      // For batch, we need to iterate through rows
      embeddings = [];
      for (let i = 0; i < texts.length; i++) {
        const start = i * 768;
        const end = start + 768;
        embeddings.push(Array.from(result.data.slice(start, end)));
      }
    }

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
