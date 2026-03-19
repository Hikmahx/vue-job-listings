import { Model, Schema } from 'mongoose';
import { Job } from '../models/Job';
import { Company } from '../models/Company';
import { User } from '../models/User';
import { CompanyMember } from '../models/CompanyMember';

/**
 * DYNAMIC FIELD EXTRACTION UTILITY
 * 
 * This module automatically extracts filterable fields from your Mongoose models.
 * Instead of hardcoding filter names, we inspect the actual schema to get all fields.
 * 
 * WHY THIS MATTERS:
 * - If you add "favoriteColor" to User model, RAG automatically uses it
 * - If you add "established2024" to Company model, RAG learns to extract it
 * - Update models once, RAG stays in sync without backend/frontend changes
 * - Future-proof: scales as your data models evolve
 */

interface FieldInfo {
  type: string;
  enum: string[] | null;
  description: string;
}

interface FilterableFields {
  [key: string]: FieldInfo;
}

interface AllFilterableFields {
  job: FilterableFields;
  company: FilterableFields;
  user: FilterableFields;
  team_member: FilterableFields;
}

interface FilterExamples {
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

/**
 * Extract all filterable fields from a Mongoose model schema
 * 
 * @param {Model} mongooseModel - The Mongoose model (e.g., Job, Company)
 * @returns {Object} Object with field names as keys and type info as values
 */
function extractFieldsFromModel(mongooseModel: Model<any>): FilterableFields {
  const fields: FilterableFields = {};
  const schema: Schema = mongooseModel.schema;

  Object.entries(schema.obj).forEach(([fieldName, fieldConfig]: [string, any]) => {
    // Skip internal fields, nested objects, and references
    if (
      fieldName.startsWith('_') ||
      !fieldConfig ||
      fieldConfig.type === 'ObjectId' ||
      fieldConfig.ref
    ) {
      return;
    }

    const fieldType: string = fieldConfig.type?.name || fieldConfig.type;
    const enumValues: string[] = fieldConfig.enum || [];

    fields[fieldName] = {
      type: fieldType,
      enum: enumValues.length > 0 ? enumValues : null,
      description: fieldConfig.description || `${fieldName} field`,
    };
  });

  return fields;
}

/**
 * Get all filterable fields across all models
 * Organizes them by model so LLM knows which fields belong where
 */
export function getAllFilterableFields(): AllFilterableFields {
  const jobFields = extractFieldsFromModel(Job);
  const companyFields = extractFieldsFromModel(Company);
  const userFields = extractFieldsFromModel(User);
  const memberFields = extractFieldsFromModel(CompanyMember);

  return {
    job: jobFields,
    company: companyFields,
    user: userFields,
    team_member: memberFields,
  };
}

/**
 * Build dynamic filter extraction instructions for the LLM
 * This creates a prompt section that teaches Groq about your current schema
 */
export function buildDynamicFilterInstructions(): string {
  const allFields = getAllFilterableFields();

  // Filter out timestamp fields and IDs
  const filterableFields: { [key: string]: FilterableFields } = {};
  Object.entries(allFields).forEach(([model, fields]) => {
    filterableFields[model] = {};
    Object.entries(fields).forEach(([fieldName, fieldInfo]) => {
      // Skip timestamps, IDs, and internal fields
      if (
        !['id', '_id', 'createdAt', 'updatedAt', 'timestamps'].includes(
          fieldName
        )
      ) {
        filterableFields[model][fieldName] = fieldInfo;
      }
    });
  });

  let instructions =
    'USER DATA SCHEMA - Extract filters based on these actual database fields:\n\n';

  Object.entries(filterableFields).forEach(([model, fields]) => {
    instructions += `${model.toUpperCase()} Fields:\n`;
    Object.entries(fields).forEach(([fieldName, fieldInfo]) => {
      const type = fieldInfo.type || 'string';
      if (fieldInfo.enum && fieldInfo.enum.length > 0) {
        instructions += `  - ${fieldName} (enum): [${fieldInfo.enum.join(', ')}]\n`;
      } else {
        instructions += `  - ${fieldName} (${type})\n`;
      }
    });
    instructions += '\n';
  });

  return instructions;
}

/**
 * Generate example filters from schema for LLM context
 * Shows Groq concrete examples of what filters look like
 */
export function generateFilterExamples(): FilterExamples {
  return {
    job_filters: {
      level: 'senior',
      contract: 'full-time',
      workType: 'remote',
      skills: ['React', 'TypeScript'],
    },
    company_filters: {
      market: 'saas',
      foundedYear: 2020,
      teamSize: 25,
      location: 'US',
    },
    user_filters: {
      experienceYears: 5,
      gender: 'female',
      skills: ['Python'],
    },
  };
}

export default {
  getAllFilterableFields,
  buildDynamicFilterInstructions,
  generateFilterExamples,
  extractFieldsFromModel,
};
