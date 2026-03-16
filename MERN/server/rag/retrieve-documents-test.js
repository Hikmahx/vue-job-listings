/**
 * RETRIEVE-DOCUMENTS-TEST.JS - Testing & Debugging Vector Retrieval
 * 
 * WHAT IT DOES:
 * Standalone test file to verify RAG is working correctly.
 * Tests each phase independently:
 * 1. Can generate embeddings? ✓/✗ (using local Xenova model)
 * 2. Can retrieve documents? ✓/✗
 * 3. Are similarity scores reasonable? ✓/✗
 * 
 * HOW TO RUN:
 * npm run rag:test
 * 
 * REQUIREMENTS:
 * - MONGO_URI in .env
 * - Jobs ingested via: npm run rag:ingest
 * 
 * TROUBLESHOOTING:
 * See RAG_DEBUG_GUIDE.md for common issues and solutions
 */

import dotenv from 'dotenv';
import { retrieveDocuments, buildContextString } from './retrieve-documents.js';

dotenv.config();

/**
 * Test embedding generation and retrieval
 */
async function testRetrieval() {
  console.log("\n===========================================");
  console.log("RETRIEVE-DOCUMENTS TEST");
  console.log("===========================================\n");

  // Check environment variables
  console.log("[TEST] Checking environment variables...");
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    console.error("[TEST] ✗ MONGO_URI not set in .env");
    return;
  }
  console.log("[TEST] ✓ MONGO_URI set");
  console.log("[TEST] ✓ Using local embeddings (Xenova) - no API key needed");

  // Test queries
  const testQueries = [
    "I'm looking for a senior frontend developer role in the US",
    "female-founded tech startups with remote positions",
    "backend engineer in India, startup with 10-50 employees",
    "full-time React developer, San Francisco, over 5 years experience",
  ];

  console.log(`\n[TEST] Running ${testQueries.length} test queries...\n`);

  for (const query of testQueries) {
    console.log("-------------------------------------------");
    console.log(`Query: "${query}"\n`);

    try {
      // Retrieve documents
      const results = await retrieveDocuments(query, mongoUri, 3);

      if (results.length === 0) {
        console.log("[TEST] ⚠ No documents found (vector store may be empty)");
        console.log("[TEST] Solution: Run ingest-data.js first\n");
        continue;
      }

      console.log(`[TEST] ✓ Retrieved ${results.length} documents\n`);

      // Display results
      results.forEach((doc, idx) => {
        const score = doc.similarityScore.toFixed(3);
        console.log(`[${idx + 1}] ${doc.position} at ${doc.company}`);
        console.log(`    Location: ${doc.location} | Level: ${doc.level}`);
        console.log(`    Similarity Score: ${score}`);
        console.log();
      });

      // Build context string
      const contextString = buildContextString(results);
      console.log("[TEST] Context string built for LLM");
      console.log("[TEST] Sample context (first 200 chars):");
      console.log(`    ${contextString.substring(0, 200)}...\n`);
    } catch (error) {
      console.error(`[TEST] ✗ Error: ${error.message}\n`);

      // Provide debugging help
      if (error.message.includes("MONGO_URI")) {
        console.log(
          "[TEST] Hint: Check your MONGO_URI connection string"
        );
      } else if (error.message.includes("embedding")) {
        console.log(
          "[TEST] Hint: Check that ingest-data.js has been run"
        );
      }
      console.log();
    }
  }

  console.log("-------------------------------------------");
  console.log("\n[TEST] Test complete!");
  console.log(
    "\nNext steps:"
  );
  console.log("1. If you see documents: RAG retrieval is working! ✓");
  console.log("2. If no documents: Run ingest-data.js to populate vector store");
  console.log("3. If errors: Check RAG_DEBUG_GUIDE.md for solutions\n");
}

// Run test
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  testRetrieval().catch((error) => {
    console.error('Test failed:', error);
    process.exit(1);
  });
}

export { testRetrieval };
