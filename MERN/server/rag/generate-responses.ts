/**
 * GENERATE-RESPONSES.TS - LLM Response Generation
 * 
 * WHAT IT DOES (Phase 3 - Generation):
 * 1. Takes user query + retrieved documents (context)
 * 2. Sends to Groq LLM with extraction prompt
 * 3. LLM extracts filter suggestions from context
 * 4. Returns structured filters + AI-only criteria
 * 
 * WHY GROQ?
 * - Lightning fast (70B model responses in milliseconds)
 * - Lower latency than OpenAI GPT-4
 * - Excellent JSON extraction capability
 * - Cost-effective for frequent requests
 * 
 * RAG ADVANTAGE:
 * Without context:
 *   "female-founded" → LLM guesses based on training data
 * With context (from retrieveDocuments):
 *   "female-founded" → LLM extracts from actual job data
 *   → More accurate + customizable to YOUR data
 */

import Groq from 'groq-sdk';
import { retrieveDocuments, buildContextString } from './retrieve-documents';
import { buildDynamicFilterInstructions } from './extract-filterable-field';

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

interface ExtractedFilters {
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

interface AIFilters {
  founderCeoGender: string | null;
  companyFoundedAfter: number | null;
  companyFoundedBefore: number | null;
  employeeMinAge: number | null;
  employeeMinExperienceYears: number | null;
  targetApplicantGender: string | null;
}

interface ExtractFiltersResult {
  filters: ExtractedFilters;
  ai_filters: AIFilters;
  ai_applied_criteria: string[];
}

/**
 * Extract filters from user query using RAG + Groq LLM
 * 
 * COMPLETE RAG PIPELINE:
 * 1. retrieveDocuments() - Get relevant job examples
 * 2. buildContextString() - Format for LLM
 * 3. buildExtractionPrompt() - Create smart extraction prompt
 * 4. Groq LLM processes: query + context + examples → filter extraction
 * 5. Parse JSON response → Return filters
 * 
 * @param {string} userQuery - User's natural language search query
 * @param {string} mongoUri - MongoDB connection string
 * @param {string} mode - "ai" or "regular" search mode
 * @returns {Promise<Object>} - Extracted filters + ai-only criteria
 * 
 * EXAMPLE OUTPUT:
 * {
 *   filters: {
 *     search: "senior frontend",
 *     location: "US",
 *     roles: ["Frontend"],
 *     level: "senior",
 *     workType: "remote",
 *     // ... other filters
 *   },
 *   ai_filters: {
 *     founderCeoGender: "female",
 *     companyFoundedAfter: 2020,
 *     employeeMinExperienceYears: 5
 *   },
 *   ai_applied_criteria: [
 *     "Founder/CEO: Female",
 *     "Company established 2020 or later",
 *     "Employees with 5+ years experience"
 *   ]
 * }
 */
async function extractFiltersFromQuery(
  userQuery: string,
  mongoUri: string,
  mode: string = 'ai'
): Promise<ExtractFiltersResult> {
  try {
    let contextString = "";

    // If mode is "ai", retrieve relevant documents for context
    // This is what makes RAG powerful - LLM sees real examples
    if (mode === "ai") {
      console.log("[GENERATE] Retrieving relevant documents for context...");
      const retrievedDocs = await retrieveDocuments(
        userQuery,
        mongoUri,
        5 // Top 5 most relevant jobs
      );
      contextString = buildContextString(retrievedDocs);
      console.log("[GENERATE] ✓ Retrieved context documents");
    }

    // Build prompt for Groq
    const prompt = buildExtractionPrompt(userQuery, contextString, mode);

    console.log("[GENERATE] Sending to Groq LLM...");

    // Call Groq API
    const message = await groq.messages.create({
      model: "mixtral-8x7b-32768", // Fast, accurate model
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    // Extract JSON response
    const responseText = message.content[0].text;
    let extractedData: any;

    // Try to parse JSON from response
    try {
      extractedData = JSON.parse(responseText);
    } catch (error) {
      console.error("[GENERATE] Failed to parse Groq response as JSON:");
      console.error(responseText);
      throw new Error("LLM returned invalid JSON format");
    }

    // Separate filters into regular and AI-only
    const { filters, ai_filters } = separateFilters(extractedData);
    const ai_applied_criteria = buildAiAppliedCriteria(ai_filters);

    console.log("[GENERATE] ✓ Filters extracted successfully");

    return {
      filters,
      ai_filters,
      ai_applied_criteria,
    };
  } catch (error: any) {
    console.error("[GENERATE] Error extracting filters:", error.message);
    throw error;
  }
}

/**
 * Build extraction prompt for Groq
 * 
 * WHY THIS PROMPT?
 * - Teaches Groq the job search domain
 * - Shows exact field names and expected values
 * - Includes examples for each field
 * - Separate sections for regular vs AI-only filters
 * - Flexible synonym handling (learns patterns, not rigid rules)
 * 
 * @param {string} userQuery - User's search query
 * @param {string} contextString - Retrieved job data for RAG context
 * @param {string} mode - "ai" or "regular"
 * @returns {string} - Formatted prompt for LLM
 */
function buildExtractionPrompt(
  userQuery: string,
  contextString: string = '',
  mode: string = 'ai'
): string {
  const contextSection = contextString
    ? `\nRELEVANT JOB DATA FROM DATABASE:\n${contextString}`
    : '';

  const modeInstruction =
    mode === 'ai'
      ? '\nEXTRACT BOTH regular filters AND AI-inferred criteria from the query.'
      : '\nEXTRACT ONLY regular filters. Leave AI-only fields empty.';

  // Get dynamic schema fields from models
  const dynamicFieldInstructions = buildDynamicFilterInstructions();

  return `You are an intelligent job search filter extraction assistant.

${modeInstruction}
USER QUERY: "${userQuery}"
${contextSection}

${dynamicFieldInstructions}

EXTRACT and return ONLY valid JSON (no markdown, no explanation):

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

INSTRUCTIONS:

REGULAR FILTERS (What user explicitly searches for):
- search: Main job title keyword (e.g., "senior frontend")
- location: ISO country code (US, UK, NG, CA, IN, etc.)
- roles: [Backend, Frontend, Full-Stack, Mobile, DevOps, Data]
- skills: [React, Python, TypeScript, Django, Node.js, etc.]
- markets: [saas, fintech, healthtech, ecommerce, education, ai_ml, etc.]
- level: junior, midweight, senior
- workType: remote, hybrid, onsite
- contract: [full-time, part-time, contract, internship]
- companySizes: [1-10, 11-50, 51-200, 201-500, 500+]
- minSalary/maxSalary: numbers only (e.g., 80000, 120000)
- currency: $, £, €, ₦, etc.
- timeframe: hour, day, week, month, year

AI-ONLY FILTERS (Context clues - extract when mentioned):
- founderCeoGender: "male", "female", "other" (when user says "female-founded", "man-led", etc.)
- companyFoundedAfter: year (when user says "established 2020+", "founded after 2019")
- companyFoundedBefore: year (when user says "established before 2020")
- employeeMinAge: age (when user says "25+ years old", "at least 30")
- employeeMinExperienceYears: years (when user says "5+ years experience", "senior with 10 years")
- targetApplicantGender: "male", "female", "other" (when user says "for women", "targeting men")

EXTRACTION TIPS:
- Be flexible with synonyms (CEO = founder = leader)
- If fields are updated in the database schema, they appear above in the schema section
- Empty string "" for unmentioned fields, null for unmentioned numbers
- For arrays, only include relevant items
- Learn patterns from context data and actual field values

RETURN ONLY JSON.`;
}

/**
 * Separate extracted data into regular and AI-only filters
 * 
 * WHY SEPARATE?
 * Regular filters → shown in URL, persisted, user-explicit
 * AI filters → shown as suggestions, cleared in regular mode, AI-inferred
 * 
 * @param {Object} extractedData - Raw extraction from LLM
 * @returns {Object} - { filters, ai_filters }
 */
function separateFilters(
  extractedData: any
): { filters: ExtractedFilters; ai_filters: AIFilters } {
  // Regular filters (from FilterModal)
  const filters: ExtractedFilters = {
    search: extractedData.search || "",
    location: extractedData.location || "",
    roles: Array.isArray(extractedData.roles) ? extractedData.roles : [],
    skills: Array.isArray(extractedData.skills) ? extractedData.skills : [],
    markets: Array.isArray(extractedData.markets)
      ? extractedData.markets
      : [],
    level: extractedData.level || "",
    workType: extractedData.workType || "",
    contract: Array.isArray(extractedData.contract)
      ? extractedData.contract
      : [],
    companySizes: Array.isArray(extractedData.companySizes)
      ? extractedData.companySizes
      : [],
    minSalary: extractedData.minSalary || null,
    maxSalary: extractedData.maxSalary || null,
    currency: extractedData.currency || "",
    timeframe: extractedData.timeframe || "",
  };

  // AI-only filters (context-inferred, not in FilterModal)
  const ai_filters: AIFilters = {
    founderCeoGender: extractedData.founderCeoGender || null,
    companyFoundedAfter: extractedData.companyFoundedAfter || null,
    companyFoundedBefore: extractedData.companyFoundedBefore || null,
    employeeMinAge: extractedData.employeeMinAge || null,
    employeeMinExperienceYears: extractedData.employeeMinExperienceYears || null,
    targetApplicantGender: extractedData.targetApplicantGender || null,
  };

  return { filters, ai_filters };
}

/**
 * Build human-readable descriptions of AI-inferred criteria
 * 
 * EXAMPLE:
 * Input: { founderCeoGender: "female", companyFoundedAfter: 2020 }
 * Output: ["Founder/CEO: Female", "Company established 2020 or later"]
 * 
 * @param {Object} ai_filters - AI-inferred filter values
 * @returns {Array<string>} - Human-readable descriptions
 */
function buildAiAppliedCriteria(ai_filters: AIFilters): string[] {
  const criteria: string[] = [];

  if (ai_filters.founderCeoGender) {
    const gender =
      ai_filters.founderCeoGender.charAt(0).toUpperCase() +
      ai_filters.founderCeoGender.slice(1);
    criteria.push(`Founder/CEO: ${gender}`);
  }

  if (ai_filters.companyFoundedAfter) {
    criteria.push(
      `Company established ${ai_filters.companyFoundedAfter} or later`
    );
  }

  if (ai_filters.companyFoundedBefore) {
    criteria.push(
      `Company established before ${ai_filters.companyFoundedBefore}`
    );
  }

  if (ai_filters.employeeMinAge) {
    criteria.push(`Employees ${ai_filters.employeeMinAge} years or older`);
  }

  if (ai_filters.employeeMinExperienceYears) {
    criteria.push(
      `Employees with ${ai_filters.employeeMinExperienceYears}+ years experience`
    );
  }

  if (ai_filters.targetApplicantGender) {
    const gender =
      ai_filters.targetApplicantGender.charAt(0).toUpperCase() +
      ai_filters.targetApplicantGender.slice(1);
    criteria.push(`Targeting ${gender.toLowerCase()} applicants`);
  }

  return criteria;
}

export {
  extractFiltersFromQuery,
  buildExtractionPrompt,
  separateFilters,
  buildAiAppliedCriteria,
  type ExtractFiltersResult,
  type ExtractedFilters,
  type AIFilters,
};
