/**
 * RETRIEVE-DOCUMENTS-TEST.TS - Testing & Debugging Vector Retrieval
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
import path from 'path';
import { MongoClient } from 'mongodb';
import { retrieveDocuments, buildContextString } from './retrieve-documents';

dotenv.config({ path: path.resolve('./config/config.env') });

const VECTOR_DB_NAME = 'vector_store_database';
const VECTOR_COLLECTION_NAME = 'embeddings_stream'; // must match ingest-data.ts

async function testRetrieval(): Promise<void> {
  console.log('\n===========================================');
  console.log('RETRIEVE-DOCUMENTS TEST');
  console.log('===========================================\n');

  // --- Step 1: Check env ---
  console.log('[TEST] Checking environment variables...');
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error('[TEST] ✗ MONGO_URI not set');
    return;
  }
  console.log('[TEST] ✓ MONGO_URI set');

  // --- Step 2: Directly verify documents exist in MongoDB ---
  console.log('\n[TEST] Verifying vector store contents directly...');
  let client: MongoClient | null = null;

  try {
    client = new MongoClient(mongoUri);
    await client.connect();
    const collection = client
      .db(VECTOR_DB_NAME)
      .collection(VECTOR_COLLECTION_NAME);

    const count = await collection.countDocuments();
    console.log(`[TEST] Documents in '${VECTOR_COLLECTION_NAME}': ${count}`);

    if (count === 0) {
      console.error(
        '[TEST] ✗ Collection is EMPTY — run npm run rag:ingest first',
      );
      await client.close();
      return;
    }

    // Show a sample document to confirm expected structure
    const sample = await collection.findOne(
      {},
      {
        projection: {
          position: 1,
          company: 1,
          location: 1,
          embedding: { $slice: 3 }
        },
      },
    ) as any;

    console.log(`[TEST] ✓ Sample doc: "${sample.position}" at "${sample.company}" (${sample.location})`);
    console.log(`[TEST] ✓ Embedding present: ${!!sample.embedding} | First 3 dims: [${sample.embedding?.map((n: number) => n.toFixed(4)).join(', ')}...]`);

    await client.close();
    client = null;
  } catch (err: any) {
    console.error('[TEST] ✗ MongoDB direct check failed:', err.message);
    if (client) await client.close();
    return;
  }

  // --- Step 3: Run vector search queries ---
  console.log('\n[TEST] ✓ Using local embeddings (Xenova) - no API key needed');

  const testQueries: string[] = [
    'Senior Frontend Developer remote United States HTML CSS JavaScript',
    "I'm looking for a senior frontend developer role in the US",
    'female-founded tech startups with remote positions',
    'backend engineer in India, startup with 10-50 employees',
    'full-time React developer, San Francisco, over 5 years experience',
  ];

  console.log(`\n[TEST] Running ${testQueries.length} test queries...\n`);

  let totalFound = 0;

  for (const query of testQueries) {
    console.log('-------------------------------------------');
    console.log(`Query: "${query}"\n`);

    try {
      const results = await retrieveDocuments(query, mongoUri, 3);

      if (results.length === 0) {
        console.log('[TEST] ⚠ Vector search returned 0 results');
        console.log('[TEST] → Documents exist in MongoDB, so this is a RETRIEVAL IMPLEMENTATION issue');
        console.log('[TEST] → Check: correct index name, correct collection in retrieve-documents.ts\n');
        continue;
      }

      totalFound += results.length;
      console.log(`[TEST] ✓ Retrieved ${results.length} documents\n`);

      results.forEach((doc, idx) => {
        const score = doc.similarityScore?.toFixed(3) ?? 'N/A';
        console.log(`[${idx + 1}] ${doc.position} at ${doc.company}`);
        console.log(`    Location: ${doc.location} | Level: ${doc.level}`);
        console.log(`    Similarity Score: ${score}`);
        console.log();
      });

      const contextString = buildContextString(results);
      console.log('[TEST] Context string preview:');
      console.log(`    ${contextString.substring(0, 200)}...\n`);
    } catch (error: any) {
      console.error(`[TEST] ✗ Error: ${error.message}\n`);
    }
  }

  console.log('-------------------------------------------');
  console.log('\n[TEST] Test complete!');

  if (totalFound > 0) {
    console.log('✓ RAG retrieval is working!\n');
  } else {
    console.log('✗ Vector search returned 0 results for all queries.');
    console.log('  → Documents ARE in MongoDB (confirmed above)');
    console.log('  → The issue is in retrieve-documents.ts implementation');
    console.log('  → Check: DB name, collection name, index name, $vectorSearch syntax\n');
  }
}
// Only run when executed directly (not when imported as a module)
// const isMainModule = import.meta.url === `file://${process.argv[1]}`;
const isMainModule = require.main === module;

if (isMainModule) {
  testRetrieval().catch((error: any) => {
    console.error('Test failed:', error);
    process.exit(1);
  });
}

export { testRetrieval };