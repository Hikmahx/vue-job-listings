/**
 * RAG-TYPES.TS - Shared TypeScript Types
 *
 * Central type definitions for the entire RAG pipeline.
 * Import from here instead of redeclaring types across files.
 */

import type { Document } from 'mongodb';

// ---------------------------------------------------------------------------
// extract-filterable-fields types
// ---------------------------------------------------------------------------

export interface FieldInfo {
  type: string;
  enum: string[] | null;
  description: string;
}

export interface FilterableFields {
  [key: string]: FieldInfo;
}

export interface AllFilterableFields {
  job: FilterableFields;
  company: FilterableFields;
  user: FilterableFields;
  team_member: FilterableFields;
}

export interface FilterExamples {
  job_filters: {
    level: string;
    contract: string;
    workType: string;
    skills: string[];
  };
  company_filters: {
    market: string;
    foundedYear: number;
    teamSize: number;
    location: string;
  };
  user_filters: {
    experienceYears: number;
    gender: string;
    skills: string[];
  };
}

// ---------------------------------------------------------------------------
// generate-responses types
// ---------------------------------------------------------------------------

export interface ExtractedFilters {
  search: string;
  location: string;
  roles: string[];
  skills: string[];
  markets: string[];
  level: string;
  workType: string;
  contract: string[];
  companySizes: string[];
  minSalary: number | null;
  maxSalary: number | null;
  currency: string;
  timeframe: string;
}

export interface AIFilters {
  founderCeoGender: string | null;
  companyFoundedAfter: number | null;
  companyFoundedBefore: number | null;
  employeeMinAge: number | null;
  employeeMinExperienceYears: number | null;
  targetApplicantGender: string | null;
}

export interface ExtractFiltersResult {
  filters: ExtractedFilters;
  ai_filters: AIFilters;
  ai_applied_criteria: string[];
}

// Raw shape returned by the LLM before separation into filters / ai_filters
export interface RawLLMExtraction {
  search?: string;
  location?: string;
  roles?: unknown;
  skills?: unknown;
  markets?: unknown;
  level?: string;
  workType?: string;
  contract?: unknown;
  companySizes?: unknown;
  minSalary?: number | null;
  maxSalary?: number | null;
  currency?: string;
  timeframe?: string;
  founderCeoGender?: string | null;
  companyFoundedAfter?: number | null;
  companyFoundedBefore?: number | null;
  employeeMinAge?: number | null;
  employeeMinExperienceYears?: number | null;
  targetApplicantGender?: string | null;
}

// ---------------------------------------------------------------------------
// ingest-data types
// ---------------------------------------------------------------------------

export interface JobChunkMetadata {
  skills: string[];
  market: string;
  teamSize: number;
  foundedYear: number;
  workType: string;
}

export interface DocumentToInsert {
  jobId: string;
  companyId: string;
  position: string;
  company: string;
  location: string;
  level: string;
  text: string;
  metadata: JobChunkMetadata;
  embedding?: number[];
  createdAt: Date;
}

export interface IngestionResult {
  status: 'success' | 'warning' | 'error';
  message: string;
  jobsProcessed: number;
  embeddingsGenerated?: number;
}

// ---------------------------------------------------------------------------
// retrieve-documents types
// ---------------------------------------------------------------------------

export interface RetrievedDocument extends Document {
  jobId: string;
  companyId: string;
  position: string;
  company: string;
  location: string;
  level: string;
  text: string;
  metadata: JobChunkMetadata;
  similarityScore: number;
}

export interface FormattedDocument {
  position: string;
  company: string;
  location: string;
  level: string;
  text: string;
  similarity_score: number;
  metadata: JobChunkMetadata;
}

// ---------------------------------------------------------------------------
// rag-vector-index types
// ---------------------------------------------------------------------------

export interface CosmosSearchOptions {
  kind: 'vector-ivf' | 'vector-hnsw';
  m: number;
  efConstruction: number;
  efSearch: number;
  metric: 'cosine' | 'euclidean' | 'dotProduct';
}

export interface VectorIndexCreateOptions {
  name: string;
  cosmosSearchOptions: CosmosSearchOptions;
  background: boolean;
}

export interface VectorIndexResult {
  status: 'success';
  indexName: string;
  message: string;
}

// ---------------------------------------------------------------------------
// Lean Mongoose document shapes
// These mirror your actual Mongoose model fields — update them as your
// models evolve so ingest-data.ts keeps full type safety.
// ---------------------------------------------------------------------------

export interface LeanJob {
  _id: { toString(): string };
  position: string;
  role: string;
  level: string;
  location: string;
  workType?: string;
  contract: string;
  skills?: string[];
  minSalary?: number;
  maxSalary?: number;
  currency?: string;
  jobDescription?: string;
  company: unknown; // ObjectId reference
}

export interface LeanCompany {
  _id: { toString(): string };
  name: string;
  market: string;
  teamSize?: number;
  foundedYear?: number;
  location?: string;
  description?: string;
  founders?: unknown[]; // ObjectId references
}

export interface LeanFounder {
  _id: { toString(): string };
  name: string;
  gender?: string;
  background?: string;
}