/**
 * RAG service: aligned with django_api/jobs/api/ai_search.py and vector_search.py.
 * - Uses Groq (llama-3.3-70b-versatile) for filter extraction from natural language.
 * - Optional: MongoDB Atlas vector search for context (when OPENAI_API_KEY set).
 * Returns FilterModal-aligned filters + AI-only criteria (mapped to MERN API keys).
 */

import { MongoClient, Db } from 'mongodb';

const VECTOR_DB_NAME = 'vector_store_database';
const VECTOR_COLLECTION = 'embeddings_stream';
const VECTOR_INDEX = 'vector_index';

const GROQ_CHAT_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

export interface ParsedFilters {
  search?: string;
  location?: string;
  minSalary?: number;
  maxSalary?: number;
  workType?: string;
  level?: string;
  skills?: string[];
  markets?: string[];
  companySizes?: string[];
  contract?: string[];
  roles?: string[];
  currency?: string;
  timeframe?: string;
  sortByCompany?: boolean;
  foundedYearMin?: number;
  foundedYearMax?: number;
  founderGender?: 'male' | 'female' | 'other';
  employeeMinExperienceYears?: number;
  employeeMinAge?: number;
}

/** Response for parity: extracted_filters + ai_only + ai_applied_criteria */
export interface ParseQueryResult {
  extracted_filters: Record<string, unknown>;
  ai_only: Record<string, unknown>;
  ai_applied_criteria: string[];
}

/**
 * Build human-readable list for display when in aiMode (same as Django _build_ai_applied_criteria).
 */
function buildAiAppliedCriteria(aiOnly: {
  founderCeoGender?: string | null;
  companyFoundedAfter?: number | null;
  companyFoundedBefore?: number | null;
  employeeMinAge?: number | null;
  employeeMinExperienceYears?: number | null;
  targetApplicantGender?: string | null;
}): string[] {
  const out: string[] = [];
  if (aiOnly.founderCeoGender) {
    out.push(`Founder/CEO: ${aiOnly.founderCeoGender}`);
  }
  if (aiOnly.companyFoundedAfter != null) {
    out.push(`Company founded after ${aiOnly.companyFoundedAfter}`);
  }
  if (aiOnly.companyFoundedBefore != null) {
    out.push(`Company founded before ${aiOnly.companyFoundedBefore}`);
  }
  if (aiOnly.employeeMinAge != null) {
    out.push(`Employee at least ${aiOnly.employeeMinAge} years old`);
  }
  if (aiOnly.employeeMinExperienceYears != null) {
    out.push(`Employee with ${aiOnly.employeeMinExperienceYears}+ years experience`);
  }
  if (aiOnly.targetApplicantGender) {
    out.push(`Target applicants: ${aiOnly.targetApplicantGender}`);
  }
  return out;
}

/**
 * Prompt and rules aligned with django_api/jobs/api/ai_search.py (Groq JSON extraction).
 */
function buildExtractionPrompt(userQuery: string): string {
  return `Extract job search filters from this natural language query: "${userQuery}"

Return ONLY valid JSON (no markdown, no explanation) with this exact structure:
{
    "search": "",
    "location": "",
    "roles": [],
    "skills": [],
    "markets": [],
    "level": "",
    "workType": "",
    "contract": [],
    "companySizes": [],
    "minSalary": null,
    "maxSalary": null,
    "currency": "",
    "timeframe": "",
    "founderCeoGender": "",
    "companyFoundedAfter": null,
    "companyFoundedBefore": null,
    "employeeMinAge": null,
    "employeeMinExperienceYears": null,
    "targetApplicantGender": ""
}

Rules (FilterModal fields — use these exact values when possible):
- location: 2-letter ISO country code (e.g. Nigeria→NG, USA→US, UK→GB, Canada→CA)
- roles: from ["Backend", "Frontend", "Full-Stack", "Mobile", "DevOps", "Data"] (match phrasing: frontend developer→Frontend, fullstack→Full-Stack)
- skills: e.g. ["Vue.js", "React", "TypeScript", "Python", "Django", "Node.js", "Tailwind CSS", "HTML/CSS", "REST API"]
- markets: lowercase keys from ["saas", "fintech", "healthtech", "ecommerce", "education", "software", "marketplace", "ai_ml", "devtools", "gaming", "social_media", "cryptocurrency", "security", "climate_tech", "real_estate", "travel", "food_beverage", "others"] (SaaS industry→saas, gaming→gaming)
- level: "junior", "midweight", or "senior" (lowercase)
- workType: "remote", "hybrid", or "onsite" (lowercase)
- contract: array of "contract", "full-time", "part-time", "internship" (lowercase)
- companySizes: array from ["1-10", "11-50", "51-200", "201-500", "500+"] (e.g. "20+ employees"→include "11-50", "51-200" as appropriate)
- currency: symbol or code ($, £, €, ₦, USD, GBP, etc.)
- timeframe: "hour", "day", "week", "month", or "year" (lowercase)

Rules (AI-only criteria — extract when user mentions them):
- founderCeoGender: "male", "female", or "other" when user says founder/CEO should be man/male or woman/female
- companyFoundedAfter: integer year when user says "established after 2020", "founded after 2019", "recent company"
- companyFoundedBefore: integer year when user says "established before 2020"
- employeeMinAge: integer when user says "at least 25 years old", "employee 25+"
- employeeMinExperienceYears: integer when user says "5+ years experience", "over 5 years experience"
- targetApplicantGender: "male", "female", or "other" when user says "for women/females specifically", "for men/males", "targeting female applicants"

Use empty string "" and empty arrays [] for unmentioned fields. Use null for unmentioned numbers and salaries.`;
}

/**
 * Call Groq chat completions (same as Django: Groq, llama-3.3-70b-versatile, json_object).
 */
async function groqExtractJson(userPrompt: string): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('GROQ_API_KEY is required for RAG parse-query. Set it in your server environment.');
  }
  const res = await fetch(GROQ_CHAT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        {
          role: 'system',
          content:
            'You are a JSON extraction assistant. Return ONLY valid JSON with the exact keys given.',
        },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.1,
      max_tokens: 600,
      response_format: { type: 'json_object' },
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Groq API: ${res.status} ${err}`);
  }
  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const text = (data.choices?.[0]?.message?.content ?? '').trim();
  if (text.startsWith('```')) {
    const after = text.split('```')[1] ?? '';
    return after.startsWith('json') ? after.slice(4).trim() : after.trim();
  }
  return text;
}

/**
 * Optional: run vector search and return context (like backend.py / django vector_search).
 * Uses OpenAI embeddings if OPENAI_API_KEY is set; otherwise skips.
 */
async function getVectorContext(query: string): Promise<string> {
  const mongoUri = process.env.MONGO_URI;
  const openaiKey = process.env.OPENAI_API_KEY;
  if (!mongoUri || !openaiKey) return '';

  try {
    const embedRes = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: query.slice(0, 8000),
      }),
    });
    if (!embedRes.ok) return '';
    const embedData = (await embedRes.json()) as {
      data?: Array<{ embedding?: number[] }>;
    };
    const queryVector = embedData.data?.[0]?.embedding;
    if (!Array.isArray(queryVector)) return '';

    const client = new MongoClient(mongoUri);
    try {
      await client.connect();
      const db: Db = client.db(VECTOR_DB_NAME);
      const coll = db.collection(VECTOR_COLLECTION);
      const pipeline = [
        {
          $vectorSearch: {
            index: VECTOR_INDEX,
            path: 'embedding',
            queryVector,
            numCandidates: 50,
            limit: 5,
          },
        },
        { $project: { content: 1, _id: 0 } },
      ];
      const docs: { content?: string }[] = await coll.aggregate(pipeline).toArray();
      const contents = docs.map((d) => d.content || '').filter(Boolean);
      return contents.length > 0 ? `Relevant job/company snippets:\n${contents.join('\n---\n')}` : '';
    } finally {
      await client.close();
    }
  } catch (e) {
    console.warn('Vector search failed, using Groq only:', e);
    return '';
  }
}

/**
 * Map raw Groq/Django-style JSON to MERN API filter keys (FilterModal + extended).
 */
function rawToParsedFilters(raw: Record<string, unknown>): ParsedFilters {
  const str = (v: unknown) => (typeof v === 'string' ? v : undefined);
  const num = (v: unknown) => (typeof v === 'number' && !Number.isNaN(v) ? v : undefined);
  const arr = (v: unknown): string[] =>
    Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [];

  const contractRaw = raw.contract;
  const contract: string[] = Array.isArray(contractRaw)
    ? contractRaw.filter((x): x is string => typeof x === 'string')
    : typeof contractRaw === 'string' && contractRaw
      ? [contractRaw]
      : [];

  const founderCeo = (str(raw.founderCeoGender) ?? '').toLowerCase();
  const founderGender =
    founderCeo === 'male' || founderCeo === 'female' || founderCeo === 'other'
      ? (founderCeo as 'male' | 'female' | 'other')
      : undefined;

  return {
    search: str(raw.search) || undefined,
    location: str(raw.location) || undefined,
    minSalary: num(raw.minSalary),
    maxSalary: num(raw.maxSalary),
    workType: str(raw.workType) || undefined,
    level: str(raw.level) || undefined,
    skills: arr(raw.skills),
    markets: arr(raw.markets),
    companySizes: arr(raw.companySizes),
    contract,
    roles: arr(raw.roles),
    currency: str(raw.currency) || undefined,
    timeframe: str(raw.timeframe) || undefined,
    sortByCompany: undefined,
    foundedYearMin: num(raw.companyFoundedAfter),
    foundedYearMax: num(raw.companyFoundedBefore),
    founderGender,
    employeeMinExperienceYears: num(raw.employeeMinExperienceYears),
    employeeMinAge: num(raw.employeeMinAge),
  };
}

/**
 * Map extracted_filters + ai_only to MERN ParsedFilters for the client.
 */
export function resultToMernFilters(
  extracted_filters: Record<string, unknown>,
  ai_only: Record<string, unknown>
): ParsedFilters {
  const str = (v: unknown) => (typeof v === 'string' ? v : undefined);
  const num = (v: unknown) => (typeof v === 'number' && !Number.isNaN(v) ? v : undefined);
  const arr = (v: unknown): string[] =>
    Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [];

  const contractRaw = extracted_filters.contract;
  const contract: string[] = Array.isArray(contractRaw)
    ? contractRaw.filter((x): x is string => typeof x === 'string')
    : typeof contractRaw === 'string' && contractRaw
      ? [contractRaw]
      : [];

  const founderCeo = str(ai_only.founderCeoGender)?.toLowerCase();
  const founderGender =
    founderCeo === 'male' || founderCeo === 'female' || founderCeo === 'other'
      ? (founderCeo as 'male' | 'female' | 'other')
      : undefined;

  return {
    search: str(extracted_filters.search) || undefined,
    location: str(extracted_filters.location) || undefined,
    minSalary: num(extracted_filters.minSalary),
    maxSalary: num(extracted_filters.maxSalary),
    workType: str(extracted_filters.workType) || undefined,
    level: str(extracted_filters.level) || undefined,
    skills: arr(extracted_filters.skills),
    markets: arr(extracted_filters.markets),
    companySizes: arr(extracted_filters.companySizes),
    contract,
    roles: arr(extracted_filters.roles),
    currency: str(extracted_filters.currency) || undefined,
    timeframe: str(extracted_filters.timeframe) || undefined,
    sortByCompany: undefined,
    foundedYearMin: num(ai_only.companyFoundedAfter),
    foundedYearMax: num(ai_only.companyFoundedBefore),
    founderGender,
    employeeMinExperienceYears: num(ai_only.employeeMinExperienceYears),
    employeeMinAge: num(ai_only.employeeMinAge),
  };
}

/**
 * Extract structured filters from natural language using Groq (aligned with Django extract_filters_from_query).
 * Returns filters in MERN API shape. Optionally runs vector search for context before calling Groq.
 */
export async function parseQueryToFilters(query: string): Promise<ParsedFilters> {
  const { extracted_filters, ai_only } = await extractFiltersFromQuery(query);
  return resultToMernFilters(extracted_filters, ai_only);
}

/**
 * Return extracted_filters (FilterModal keys only), ai_only, and ai_applied_criteria.
 * Useful if the client wants to show ai_applied_criteria or match the Django response shape.
 */
export async function extractFiltersFromQuery(
  userQuery: string
): Promise<ParseQueryResult> {
  const vectorContext = await getVectorContext(userQuery);
  const userPrompt = vectorContext
    ? `${vectorContext}\n\nUser query: ${userQuery}`
    : userQuery;
  const fullPrompt = buildExtractionPrompt(userPrompt);

  let raw: Record<string, unknown>;
  try {
    const text = await groqExtractJson(fullPrompt);
    raw = JSON.parse(text) as Record<string, unknown>;
  } catch (e) {
    console.error('AI extraction error:', e);
    return {
      extracted_filters: {
        search: userQuery,
        location: '',
        roles: [],
        skills: [],
        markets: [],
        level: '',
        workType: '',
        contract: [],
        companySizes: [],
        minSalary: null,
        maxSalary: null,
        currency: '',
        timeframe: '',
      },
      ai_only: {},
      ai_applied_criteria: [],
    };
  }

  const FILTER_MODAL_KEYS = [
    'search',
    'location',
    'roles',
    'skills',
    'markets',
    'level',
    'workType',
    'contract',
    'companySizes',
    'minSalary',
    'maxSalary',
    'currency',
    'timeframe',
  ];
  const extracted_filters: Record<string, unknown> = {};
  for (const k of FILTER_MODAL_KEYS) {
    extracted_filters[k] = raw[k];
  }
  let contract = raw.contract;
  if (typeof contract === 'string' && contract) contract = [contract];
  if (!Array.isArray(contract)) contract = [];
  extracted_filters.contract = contract;
  if (extracted_filters.roles == null) extracted_filters.roles = [];
  if (extracted_filters.skills == null) extracted_filters.skills = [];
  if (extracted_filters.markets == null) extracted_filters.markets = [];
  if (extracted_filters.companySizes == null) extracted_filters.companySizes = [];

  const founderCeo = (String(raw.founderCeoGender ?? '')).trim().toLowerCase() || null;
  const targetApplicant = (String(raw.targetApplicantGender ?? '')).trim().toLowerCase() || null;
  const ai_only: Record<string, unknown> = {
    founderCeoGender:
      founderCeo === 'male' || founderCeo === 'female' || founderCeo === 'other' ? founderCeo : null,
    companyFoundedAfter: raw.companyFoundedAfter ?? null,
    companyFoundedBefore: raw.companyFoundedBefore ?? null,
    employeeMinAge: raw.employeeMinAge ?? null,
    employeeMinExperienceYears: raw.employeeMinExperienceYears ?? null,
    targetApplicantGender:
      targetApplicant === 'male' || targetApplicant === 'female' || targetApplicant === 'other'
        ? targetApplicant
        : null,
  };

  const ai_applied_criteria = buildAiAppliedCriteria({
    founderCeoGender: ai_only.founderCeoGender as string | null,
    companyFoundedAfter: ai_only.companyFoundedAfter as number | null,
    companyFoundedBefore: ai_only.companyFoundedBefore as number | null,
    employeeMinAge: ai_only.employeeMinAge as number | null,
    employeeMinExperienceYears: ai_only.employeeMinExperienceYears as number | null,
    targetApplicantGender: ai_only.targetApplicantGender as string | null,
  });

  return {
    extracted_filters,
    ai_only,
    ai_applied_criteria,
  };
}
