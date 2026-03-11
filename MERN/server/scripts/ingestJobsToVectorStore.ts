/**
 * Ingest jobs (with company and optional founder info) into the vector store
 * for RAG retrieval. Run with: npx ts-node server/scripts/ingestJobsToVectorStore.ts
 * Requires: MONGO_URI, OPENAI_API_KEY
 */

import mongoose from 'mongoose';
import { MongoClient } from 'mongodb';
import { Job } from '../models/Job';
import { Company } from '../models/Company';
import { CompanyMember } from '../models/CompanyMember';
import { User } from '../models/User';

const VECTOR_DB = 'vector_store_database';
const VECTOR_COLL = 'embeddings_stream';

async function getEmbedding(text: string): Promise<number[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY required for ingestion');
  const res = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: text.slice(0, 8000),
    }),
  });
  if (!res.ok) throw new Error(`OpenAI: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return data.data[0].embedding;
}

function buildJobSummary(job: any, company: any, founderSummary?: string): string {
  const parts = [
    `Position: ${job.position}. Role: ${job.role}. Level: ${job.level}.`,
    `Location: ${job.location}. Work type: ${job.workType || 'unspecified'}.`,
    `Contract: ${job.contract}.`,
    job.skills?.length ? `Skills: ${job.skills.join(', ')}.` : '',
    `Company: ${company.name}. Market: ${company.market}.`,
    company.teamSize != null ? `Company size: ${company.teamSize} employees.` : '',
    company.foundedYear != null ? `Founded: ${company.foundedYear}.` : '',
    company.location ? `Company location: ${company.location}.` : '',
    founderSummary || '',
  ].filter(Boolean);
  return parts.join(' ');
}

async function run() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error('Set MONGO_URI');
    process.exit(1);
  }

  await mongoose.connect(mongoUri);
  const client = new MongoClient(mongoUri);
  await client.connect();
  const coll = client.db(VECTOR_DB).collection(VECTOR_COLL);

  const jobs = await Job.find()
    .populate({ path: 'company', select: 'name market teamSize foundedYear location' })
    .lean();

  console.log(`Found ${jobs.length} jobs. Building summaries and embedding...`);

  const toInsert: { content: string; embedding: number[]; metadata?: { jobId: string } }[] = [];

  for (let i = 0; i < jobs.length; i++) {
    const job = jobs[i] as any;
    const company = job.company;
    if (!company) continue;

    let founderSummary = '';
    const founderMember = await CompanyMember.findOne({
      company: company._id,
      $or: [{ role: 'founder' }, { permission: 'owner' }],
    })
      .populate({ path: 'user', select: 'gender' })
      .lean();
    if (founderMember?.user && (founderMember.user as any).gender) {
      founderSummary = `Founder gender: ${(founderMember.user as any).gender}.`;
    }

    const content = buildJobSummary(job, company, founderSummary);
    const embedding = await getEmbedding(content);
    toInsert.push({
      content,
      embedding,
      metadata: { jobId: job._id.toString() },
    });
    if ((i + 1) % 10 === 0) console.log(`  ${i + 1}/${jobs.length}`);
  }

  await coll.deleteMany({});
  if (toInsert.length > 0) {
    await coll.insertMany(toInsert);
  }
  console.log(`Inserted ${toInsert.length} documents into ${VECTOR_DB}.${VECTOR_COLL}`);

  await client.close();
  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
