/**
 * INGEST-DATA.TS - Data Ingestion Pipeline
 *
 * WHAT IT DOES (Phase 1 - Ingestion):
 * 1. Loads jobs from MongoDB
 * 2. Chunks each job + company metadata into readable text
 * 3. Generates embeddings for each chunk
 * 4. Stores embeddings in MongoDB vector store
 *
 * WHY CHUNKING?
 * Embedding models have input limits (~4000 tokens). Chunking ensures:
 * - Each chunk is semantic complete (meaningful on its own)
 * - All relevant metadata is included (company info, founder demographics)
 * - Vector search can find the most relevant job chunks
 *
 * BEGINNER WORKFLOW:
 * Job Data → Chunking → Embedding → MongoDB Vector Store
 *                ↓
 * "Senior Frontend at TechCorp, founded 2021, CEO: female"
 *                ↓
 * [0.123, -0.456, 0.789, ...]
 *                ↓
 * Stored in "embeddings_stream" collection, indexed for vector search
 */

import dotenv from 'dotenv';
dotenv.config({ path: './config/config.env' });

import mongoose from 'mongoose';
import { MongoClient, Collection } from 'mongodb';
import { getEmbeddings } from './get-embeddings';

// Import models
import { Job } from '../models/Job';
import { Company } from '../models/Company';
import { CompanyMember } from '../models/CompanyMember';

import { DocumentToInsert, IngestionResult } from './types';

const VECTOR_DB_NAME = 'vector_store_database';
const VECTOR_COLLECTION_NAME = 'embeddings_stream';
/**
 * Create and connect a new MongoClient
 */
async function createVectorClient(mongoUri: string): Promise<MongoClient> {
  const client = new MongoClient(mongoUri);
  await client.connect();
  return client;
}
 
/**
 * Get the embeddings collection from a connected client
 */
function getVectorCollection(client: MongoClient): Collection {
  return client.db(VECTOR_DB_NAME).collection(VECTOR_COLLECTION_NAME);
}

/**
 * Ensure mongoose is connected (no-op if already connected)
 */
async function ensureMongooseConnected(mongoUri: string): Promise<void> {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(mongoUri);
  }
}

/**
 * Build a document ready for insertion from a job ID
 * Fetches company and founder data internally
 */
async function buildDocument(jobId: string): Promise<{ doc: DocumentToInsert; chunk: string } | null> {
  const job = await Job.findById(jobId).lean();
  if (!job) {
    console.warn(`[INGEST] Job ${jobId} not found`);
    return null;
  }

  const company = await Company.findById((job as any).company).lean();
  if (!company) {
    console.warn(`[INGEST] Company not found for job ${jobId}`);
    return null;
  }

  let founder: any = null;
  if ((company as any).founders?.length > 0) {
    founder = await CompanyMember.findById((company as any).founders[0]).lean();
  }

  const chunk = createJobChunk(job, company, founder);

  const doc: DocumentToInsert = {
    jobId: job._id.toString(),
    companyId: (company as any)._id.toString(),
    position: (job as any).position,
    company: (company as any).name,
    location: (job as any).location,
    level: (job as any).level,
    text: chunk,
    metadata: {
      skills: (job as any).skills || [],
      market: (company as any).market,
      teamSize: (company as any).teamSize,
      foundedYear: (company as any).foundedYear,
      workType: (job as any).workType,
    },
    createdAt: new Date(),
  };

  return { doc, chunk };
}

/**
 * Create a semantically rich text chunk from job + company data
 */
function createJobChunk(job: any, company: any, founder: any = null): string {
  const chunks: string[] = [];

  // Job core information (primary search terms)
  chunks.push(`Position: ${job.position}`);
  chunks.push(`Role: ${job.role}`);
  chunks.push(`Level: ${job.level}`);
  chunks.push(`Location: ${job.location}`);
  chunks.push(`Work Type: ${job.workType || 'unspecified'}`);
  chunks.push(`Contract: ${job.contract}`);

  // Technical requirements
  if (job.skills?.length > 0) {
    chunks.push(`Required Skills: ${job.skills.join(', ')}`);
  }

  // Salary information
  if (job.minSalary || job.maxSalary) {
    const salary = `${job.minSalary || ''}${job.minSalary && job.maxSalary ? '-' : ''}${job.maxSalary || ''}`;
    chunks.push(`Salary: ${salary} ${job.currency || ''}`);
  }

  // Job details (description & requirements)
  if (job.jobDescription) {
    chunks.push(`Description: ${job.jobDescription.substring(0, 500)}`);
  }

  // Company information (AI-mode filters extract from this)
  chunks.push(`Company Name: ${company.name}`);
  chunks.push(`Industry: ${company.market}`);
  chunks.push(`Company Size: ${company.teamSize || 'unknown'} employees`);
  chunks.push(`Founded: ${company.foundedYear || 'unknown'}`);
  chunks.push(`Headquarters: ${company.location || 'unknown'}`);

  // Founder/CEO demographics (for AI filters like "female-founded")
  if (founder) {
    chunks.push(`Founder Name: ${founder.name}`);
    chunks.push(`Founder Gender: ${founder.gender || 'not specified'}`);
    chunks.push(`Founder Background: ${founder.background || ''}`);
  }

  // Company description
  if (company.description) {
    chunks.push(`About: ${company.description.substring(0, 300)}`);
  }

  return chunks.join(' | ');
}

/**
 * Ingest all jobs from MongoDB into the vector store (used by cron + CLI)
 *
 * FLOW:
 * 1. Connect to application database (read jobs)
 * 2. For each job:
 *    a. Fetch associated company and founder data
 *    b. Create text chunk with all context
 *    c. Generate embedding via Xenova
 * 3. Store in vector database
 * 4. Create vector search index
 *
 * @returns Ingestion summary
 */
export async function ingestData(): Promise<IngestionResult> {
  const MONGO_URI = process.env.MONGO_URI;
  if (!MONGO_URI) throw new Error('MONGO_URI environment variable not set');

  let client: MongoClient | null = null;

  try {
    console.log('[INGEST] Connecting to application database...');
    await ensureMongooseConnected(MONGO_URI);
    console.log('[INGEST] ✓ Connected to application database');

    client = await createVectorClient(MONGO_URI);
    const collection = getVectorCollection(client);

    console.log('[INGEST] Fetching jobs from database...');
    const jobs = await Job.find({}).lean();
    console.log(`[INGEST] Found ${jobs.length} jobs`);

    if (jobs.length === 0) {
      console.warn('[INGEST] No jobs found in database');
      return { status: 'warning', message: 'No jobs to ingest', jobsProcessed: 0 };
    }

    // Build all documents
    const built = await Promise.all(jobs.map((job) => buildDocument(job._id.toString())));
    const valid = built.filter(Boolean) as { doc: DocumentToInsert; chunk: string }[];

    console.log(`[INGEST] Generating embeddings for ${valid.length} jobs...`);
    const embeddings = await getEmbeddings(valid.map((v) => v.chunk), 'document');

    const docsToInsert = valid.map((v, i) => ({ ...v.doc, embedding: embeddings[i] }));

    console.log('[INGEST] Clearing existing vector store...');
    await collection.deleteMany({});

    console.log('[INGEST] Inserting documents with embeddings...');
    // Insert all documents
    const insertResult = await collection.insertMany(docsToInsert);
    console.log(`[INGEST] ✓ Inserted ${insertResult.insertedCount} documents`);

    console.log('[INGEST] Creating MongoDB Atlas Vector Search index...');
    // NOTE: Vector Search index is created in MongoDB Atlas UI, not via driver
    // This is a placeholder - actual index management is handled by MongoDB Atlas
    // Index configuration (create in Atlas UI):
    // {
    //   "fields": [
    //     {
    //       "type": "vector",
    //       "path": "embedding",
    //       "similarity": "cosine",
    //       "numDimensions": 768
    //     }
    //   ]
    // }

    try {
      await collection.dropIndex('vector_index');
    } catch (e) {
      // Index might not exist yet, that's fine
    }

    // Create compound index for metadata filtering (works alongside vector index)
    await collection.createIndex(
      {
        'metadata.market': 1,
        'metadata.foundedYear': 1,
        'metadata.teamSize': 1,
        'metadata.workType': 1,
      },
      { name: 'metadata_index' },
    );
    console.log('[INGEST] ✓ Ingestion complete!');
    return {
      status: 'success',
      message: 'Data ingestion completed',
      jobsProcessed: insertResult.insertedCount,
      embeddingsGenerated: embeddings.length,
    };
  } catch (error: any) {
    console.error('[INGEST] Error during ingestion:', error.message);
    throw error;
  } finally {
    // Clean up connections
    await mongoose.disconnect();
    if (client) await client.close();
  }
}

/**
 * Upsert a single job into the vector store (called on create/update)
 */
export async function ingestSingleJob(jobId: string): Promise<void> {
  const MONGO_URI = process.env.MONGO_URI;
  if (!MONGO_URI) throw new Error('MONGO_URI not set');

  let client: MongoClient | null = null;
  try {
    await ensureMongooseConnected(MONGO_URI);
    client = await createVectorClient(MONGO_URI);
    const collection = getVectorCollection(client);

    const built = await buildDocument(jobId);
    if (!built) return;

    const [embedding] = await getEmbeddings([built.chunk], 'document');

    await collection.replaceOne(
      { jobId },
      { ...built.doc, embedding },
      { upsert: true }
    );

    console.log(`[INGEST] ✓ Upserted job ${jobId} into vector store`);
  } catch (error: any) {
    console.error(`[INGEST] Failed to ingest job ${jobId}:`, error.message);
  } finally {
    if (client) await client.close();
  }
}

/**
 * Remove a single job from the vector store (called on delete)
 */
export async function removeJobFromIndex(jobId: string): Promise<void> {
  const MONGO_URI = process.env.MONGO_URI;
  if (!MONGO_URI) throw new Error('MONGO_URI not set');

  let client: MongoClient | null = null;
  try {
    client = await createVectorClient(MONGO_URI);
    const collection = getVectorCollection(client);

    await collection.deleteOne({ jobId });
    console.log(`[INGEST] ✓ Removed job ${jobId} from vector store`);
  } catch (error: any) {
    console.error(`[INGEST] Failed to remove job ${jobId}:`, error.message);
  } finally {
    if (client) await client.close();
  }
}

// Only runs when executed directly (npm run rag:ingest), not when imported
const isMain = process.argv[1]?.endsWith('ingest-data.ts') || process.argv[1]?.endsWith('ingest-data.js');
if (isMain) {
  ingestData()
    .then((result) => {
      console.log('[INGEST] Result:', result);
      process.exit(0);
    })
    .catch((error: any) => {
      console.error('[INGEST] Fatal error:', error);
      process.exit(1);
    });
}