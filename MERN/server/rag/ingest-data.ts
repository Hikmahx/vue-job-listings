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
import { MongoClient } from 'mongodb';
import { getEmbeddings } from './get-embeddings';

// Import models
import { Job } from '../models/Job';
import { Company } from '../models/Company';
import { CompanyMember } from '../models/CompanyMember';

import { DocumentToInsert, IngestionResult } from './types';

// MongoDB connection
const VECTOR_DB_NAME = 'vector_store_database';
const VECTOR_COLLECTION_NAME = 'embeddings_stream';

/**
 * Create a semantically rich text chunk from job + company data
 *
 * WHY THIS STRUCTURE?
 * The embedding model learns patterns from text structure.
 * "Founded: 2021" helps it understand founding year is important.
 * This increases RAG accuracy because the LLM can extract context.
 *
 * @param job     - Job document from MongoDB
 * @param company - Company document from MongoDB
 * @param founder - Founder profile (optional)
 * @returns Semantic text chunk
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
  if (job.skills && job.skills.length > 0) {
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
 * Ingest all jobs from MongoDB into vector store
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
async function ingestData(): Promise<IngestionResult> {
  let vectorConnection: MongoClient | null = null;

  try {
    const MONGO_URI = process.env.MONGO_URI;
    if (!MONGO_URI) {
      throw new Error('MONGO_URI environment variable not set');
    }

    console.log('[INGEST] Connecting to application database...');
    await mongoose.connect(MONGO_URI);
    console.log('[INGEST] ✓ Connected to application database');

    // Connect to same MongoDB cluster for vector store
    vectorConnection = new MongoClient(MONGO_URI);
    await vectorConnection.connect();
    const vectorDb = vectorConnection.db(VECTOR_DB_NAME);
    const vectorCollection = vectorDb.collection(VECTOR_COLLECTION_NAME);

    console.log('[INGEST] Fetching jobs from database...');
    // Fetch all jobs
    const jobs = await Job.find({}).lean();
    console.log(`[INGEST] Found ${jobs.length} jobs`);

    if (jobs.length === 0) {
      console.warn('[INGEST] No jobs found in database');
      return {
        status: 'warning',
        message: 'No jobs to ingest',
        jobsProcessed: 0,
      };
    }

    // Prepare documents for ingestion
    const docsToInsert: DocumentToInsert[] = [];
    const jobChunks: string[] = [];

    for (const job of jobs) {
      // Fetch associated company
      const company = await Company.findById(job.company).lean();
      if (!company) {
        console.warn(`[INGEST] Company not found for job ${job._id}`);
        continue;
      }

      // Fetch founder info if available
      let founder: any = null;
      if ((company as any).founders && (company as any).founders.length > 0) {
        founder = await CompanyMember.findById((company as any).founders[0]).lean();
      }

      // Create text chunk
      const chunk = createJobChunk(job, company, founder);
      jobChunks.push(chunk);

      // Prepare document for insertion (metadata + placeholder for embedding)
      docsToInsert.push({
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
      });
    }

    console.log(`[INGEST] Generating embeddings for ${jobChunks.length} jobs...`);
    // Generate all embeddings in batch
    const embeddings = await getEmbeddings(jobChunks, 'document');

    // Add embeddings to documents
    for (let i = 0; i < docsToInsert.length; i++) {
      docsToInsert[i].embedding = embeddings[i];
    }

    console.log('[INGEST] Clearing existing vector store...');
    // Clear existing data
    await vectorCollection.deleteMany({});

    console.log('[INGEST] Inserting documents with embeddings...');
    // Insert all documents
    const insertResult = await vectorCollection.insertMany(docsToInsert);
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
      await vectorCollection.dropIndex('vector_index');
    } catch (e) {
      // Index might not exist yet, that's fine
    }

    // Create compound index for metadata filtering (works alongside vector index)
    await vectorCollection.createIndex(
      {
        'metadata.market': 1,
        'metadata.foundedYear': 1,
        'metadata.teamSize': 1,
        'metadata.workType': 1,
      },
      { name: 'metadata_index' },
    );
    console.log(
      '[INGEST] ✓ Metadata index created (ensure vector index exists in Atlas UI)',
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
    if (vectorConnection) {
      await vectorConnection.close();
    }
  }
}

export { ingestData };

// Run ingestion
ingestData()
  .then((result) => {
    console.log('[INGEST] Result:', result);
    process.exit(0);
  })
  .catch((error: any) => {
    console.error('[INGEST] Fatal error:', error);
    process.exit(1);
  });
