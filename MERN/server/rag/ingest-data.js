/**
 * INGEST-DATA.JS - Data Ingestion Pipeline
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
 * Stored in "embedding_store" collection, indexed for vector search
 */

import mongoose from 'mongoose';
import { MongoClient } from 'mongodb';
import { getEmbeddings } from './get-embeddings.js';

// Import models
import { Job } from '../models/Job.ts';
import { Company } from '../models/Company.ts';
import { CompanyMember } from '../models/CompanyMember.ts';

// MongoDB connection
const VECTOR_DB_NAME = "vector_store_database";
const VECTOR_COLLECTION_NAME = "embedding_store";

/**
 * Create a semantically rich text chunk from job + company data
 * 
 * WHY THIS STRUCTURE?
 * The embedding model learns patterns from text structure.
 * "Founded: 2021" helps it understand founding year is important.
 * This increases RAG accuracy because the LLM can extract context.
 * 
 * @param {Object} job - Job document from MongoDB
 * @param {Object} company - Company document from MongoDB
 * @param {Object} founder - Founder profile (optional)
 * @returns {string} - Semantic text chunk
 */
function createJobChunk(job, company, founder = null) {
  const chunks = [];

  // Job core information (primary search terms)
  chunks.push(`Position: ${job.position}`);
  chunks.push(`Role: ${job.role}`);
  chunks.push(`Level: ${job.level}`);
  chunks.push(`Location: ${job.location}`);
  chunks.push(`Work Type: ${job.workType || "unspecified"}`);
  chunks.push(`Contract: ${job.contract}`);

  // Technical requirements
  if (job.skills && job.skills.length > 0) {
    chunks.push(`Required Skills: ${job.skills.join(", ")}`);
  }

  // Salary information
  if (job.minSalary || job.maxSalary) {
    const salary = `${job.minSalary || ""}${job.minSalary && job.maxSalary ? "-" : ""}${job.maxSalary || ""}`;
    chunks.push(`Salary: ${salary} ${job.currency || ""}`);
  }

  // Job details (description & requirements)
  if (job.jobDescription) {
    chunks.push(`Description: ${job.jobDescription.substring(0, 500)}`);
  }

  // Company information (AI-mode filters extract from this)
  chunks.push(`Company Name: ${company.name}`);
  chunks.push(`Industry: ${company.market}`);
  chunks.push(`Company Size: ${company.teamSize || "unknown"} employees`);
  chunks.push(`Founded: ${company.foundedYear || "unknown"}`);
  chunks.push(`Headquarters: ${company.location || "unknown"}`);

  // Founder/CEO demographics (for AI filters like "female-founded")
  if (founder) {
    chunks.push(`Founder Name: ${founder.name}`);
    chunks.push(`Founder Gender: ${founder.gender || "not specified"}`);
    chunks.push(`Founder Background: ${founder.background || ""}`);
  }

  // Company description
  if (company.description) {
    chunks.push(`About: ${company.description.substring(0, 300)}`);
  }

  return chunks.join(" | ");
}

/**
 * Ingest all jobs from MongoDB into vector store
 * 
 * FLOW:
 * 1. Connect to application database (read jobs)
 * 2. For each job:
 *    a. Fetch associated company and founder data
 *    b. Create text chunk with all context
 *    c. Generate embedding via Voyage AI
 * 3. Store in vector database
 * 4. Create vector search index
 * 
 * @returns {Promise<Object>} - Ingestion summary
 */
async function ingestData() {
  let appConnection;
  let vectorConnection;

  try {
    // Connection URLs
    const MONGO_URI = process.env.MONGO_URI;
    if (!MONGO_URI) {
      throw new Error("MONGO_URI environment variable not set");
    }

    const VOYAGE_API_KEY = process.env.VOYAGE_API_KEY;
    if (!VOYAGE_API_KEY) {
      throw new Error(
        "VOYAGE_API_KEY environment variable not set. Get free key at https://www.voyageai.com/"
      );
    }

    console.log("[INGEST] Connecting to application database...");
    // Connect to application database using Mongoose
    await mongoose.connect(MONGO_URI);
    console.log("[INGEST] ✓ Connected to application database");

    // Connect to same MongoDB cluster for vector store
    vectorConnection = new MongoClient(MONGO_URI);
    await vectorConnection.connect();
    const vectorDb = vectorConnection.db(VECTOR_DB_NAME);
    const vectorCollection = vectorDb.collection(VECTOR_COLLECTION_NAME);

    console.log("[INGEST] Fetching jobs from database...");
    // Fetch all jobs
    const jobs = await Job.find({}).lean();
    console.log(`[INGEST] Found ${jobs.length} jobs`);

    if (jobs.length === 0) {
      console.warn("[INGEST] No jobs found in database");
      return { status: "warning", message: "No jobs to ingest", jobsProcessed: 0 };
    }

    // Prepare documents for ingestion
    const docsToInsert = [];
    const jobChunks = [];

    for (const job of jobs) {
      // Fetch associated company
      const company = await Company.findById(job.company).lean();
      if (!company) {
        console.warn(`[INGEST] Company not found for job ${job._id}`);
        continue;
      }

      // Fetch founder info if available
      let founder = null;
      if (company.founders && company.founders.length > 0) {
        founder = await CompanyMember.findById(company.founders[0]).lean();
      }

      // Create text chunk
      const chunk = createJobChunk(job, company, founder);
      jobChunks.push(chunk);

      // Prepare document for insertion (metadata + placeholder for embedding)
      docsToInsert.push({
        jobId: job._id.toString(),
        companyId: company._id.toString(),
        position: job.position,
        company: company.name,
        location: job.location,
        level: job.level,
        text: chunk,
        metadata: {
          skills: job.skills || [],
          market: company.market,
          teamSize: company.teamSize,
          foundedYear: company.foundedYear,
          workType: job.workType,
        },
        createdAt: new Date(),
      });
    }

    console.log(`[INGEST] Generating embeddings for ${jobChunks.length} jobs...`);
    // Generate all embeddings in batch
    const embeddings = await getEmbeddings(jobChunks, "document");

    // Add embeddings to documents
    for (let i = 0; i < docsToInsert.length; i++) {
      docsToInsert[i].embedding = embeddings[i];
    }

    console.log("[INGEST] Clearing existing vector store...");
    // Clear existing data
    await vectorCollection.deleteMany({});

    console.log("[INGEST] Inserting documents with embeddings...");
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
      { name: 'metadata_index' }
    );
    console.log('[INGEST] ✓ Metadata index created (ensure vector index exists in Atlas UI)');

    console.log("[INGEST] ✓ Ingestion complete!");
    return {
      status: "success",
      message: "Data ingestion completed",
      jobsProcessed: insertResult.insertedCount,
      embeddingsGenerated: embeddings.length,
    };
  } catch (error) {
    console.error("[INGEST] Error during ingestion:", error.message);
    throw error;
  } finally {
    // Clean up connections
    if (appConnection) {
      await mongoose.disconnect();
    }
    if (vectorConnection) {
      await vectorConnection.close();
    }
  }
}

export { ingestData };
