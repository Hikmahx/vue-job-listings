import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { validationResult, Result } from 'express-validator';
import { Job } from '../models/Job';
import { JobDetails } from '../models/JobDetails';
import { Company } from '../models/Company';
import { CompanyMember } from '../models/CompanyMember';
import { User } from '../models/User';
import { getName as getCountryName } from 'country-list';
import { extractFiltersFromQuery } from '../rag/generate-responses';

interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

// Helper function to format postedAt
const formatPostedAt = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffSecs / 3600);
  const diffDays = Math.floor(diffSecs / 86400);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365.25);

  if (diffSecs < 60) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${diffWeeks}w ago`;
  if (diffDays < 365) return `${diffMonths}mo ago`;
  return `${diffYears}y ago`;
};

// Helper function to check if job is new (posted within last 2 days)
const isNewJob = (date: Date): boolean => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return diffDays <= 2;
};

// Build jobDetails payload from a JobDetails doc and company (no populate)
function buildJobDetailsPayload(details: any, company: any) {
  if (!details) return null;
  return {
    description: details.description,
    requirements: details.requirements,
    responsibilities: details.responsibilities,
    externalApply: details.externalApply,
    apply: details.apply || null,
    experienceRequired: details.experienceRequired || null,
    foundedYear: company?.foundedYear || null,
    website: company?.website || null,
  };
}

// Map company size ranges
const COMPANY_SIZE_RANGES: Record<string, { min: number; max: number | null }> =
  {
    '1-10': { min: 1, max: 10 },
    '11-50': { min: 11, max: 50 },
    '51-200': { min: 51, max: 200 },
    '201-500': { min: 201, max: 500 },
    '500+': { min: 501, max: null },
  };

// @route   GET /api/jobs
// @desc    Get all jobs with filtering and pagination
// @access  Public
export const getAllJobs = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.page_size as string) || 10;
    const skip = (page - 1) * pageSize;

    // Build filter query
    const filter: any = {};

    // Search filter
    if (req.query.search) {
      filter.$or = [
        { position: { $regex: req.query.search, $options: 'i' } },
        { role: { $regex: req.query.search, $options: 'i' } },
        { 'company.name': { $regex: req.query.search, $options: 'i' } },
      ];
    }

    // Location filter (country code e.g. US matches jobs stored as "United States"; VN matches "Vietnam")
    if (req.query.location) {
      const loc = String(req.query.location).trim();
      const fullName =
        loc.length === 2 ? getCountryName(loc.toUpperCase()) ?? null : null;
      const escapedLoc = loc.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const escapedName = fullName
        ? fullName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        : null;
      filter.location = {
        $regex: escapedName ? `(${escapedLoc}|${escapedName})` : escapedLoc,
        $options: 'i',
      };
    }

    // Level filter
    if (req.query.level) {
      filter.level = req.query.level;
    }

    // Work type filter
    if (req.query.workType) {
      filter.workType = req.query.workType;
    }

    // Contract filter
    if (req.query.contract) {
      const contracts = Array.isArray(req.query.contract)
        ? req.query.contract
        : (req.query.contract as string).split(',');
      filter.contract = { $in: contracts };
    }

    // Role filter
    if (req.query.roles) {
      const roles = Array.isArray(req.query.roles)
        ? req.query.roles
        : (req.query.roles as string).split(',');
      filter.role = { $in: roles };
    }

    // Skills filter
    if (req.query.skills) {
      const skills = Array.isArray(req.query.skills)
        ? req.query.skills
        : (req.query.skills as string).split(',');
      filter.skills = { $in: skills };
    }

    // Salary filter
    if (req.query.minSalary) {
      filter.minSalary = { $gte: parseInt(req.query.minSalary as string) };
    }
    if (req.query.maxSalary) {
      filter.maxSalary = { $lte: parseInt(req.query.maxSalary as string) };
    }

    // Currency filter
    if (req.query.currency) {
      filter.currency = req.query.currency;
    }

    // Timeframe filter
    if (req.query.timeframe) {
      filter.timeframe = req.query.timeframe;
    }

    // Dynamic AI filters (any extra query params in AI mode).
    // Convention: keys are one of:
    // - company.<field>__op (e.g. company.foundedYear__gte=2020)
    // - founder.<userField>__op (e.g. founder.gender=male)
    // - employee.<userField>__op (e.g. employee.experienceYears__gte=5)
    // - job.<field>__op (e.g. job.featured=true)
    //
    // Supported ops: eq (default), gte, lte, in, regex
    const KNOWN_STANDARD_KEYS = new Set([
      'page',
      'page_size',
      'search',
      'location',
      'level',
      'workType',
      'contract',
      'roles',
      'skills',
      'minSalary',
      'maxSalary',
      'currency',
      'timeframe',
      'markets',
      'companySizes',
      'sortByCompany',
      'aiMode',
    ]);

    const aiMode = String(req.query.aiMode ?? '').toLowerCase() === 'true';
    const aiFilters: Record<string, string> = {};
    if (aiMode) {
      Object.entries(req.query).forEach(([k, v]) => {
        if (KNOWN_STANDARD_KEYS.has(k)) return;
        if (v == null) return;
        aiFilters[k] = String(v);
      });
    }

    if (aiMode && Object.keys(aiFilters).length > 0) {
      // Apply dynamic filters.
      const companyFilter: any = {};
      let companyIds: mongoose.Types.ObjectId[] | null = null;

      const applyCompanyIdsIntersection = (ids: mongoose.Types.ObjectId[]) => {
        if (companyIds === null) return (companyIds = ids);
        const set = new Set(ids.map((x) => x.toString()));
        companyIds = companyIds.filter((x) => set.has(x.toString()));
        return companyIds;
      };

      for (const [rawKey, rawVal] of Object.entries(aiFilters)) {
        const [keyPart, opPart] = rawKey.split('__');
        const op = (opPart || 'eq').toLowerCase();
        const val = rawVal;

        const applyOp = (target: any, field: string) => {
          if (op === 'gte') target[field] = { ...(target[field] || {}), $gte: Number(val) };
          else if (op === 'lte') target[field] = { ...(target[field] || {}), $lte: Number(val) };
          else if (op === 'in') target[field] = { $in: val.split(',').map((s) => s.trim()).filter(Boolean) };
          else if (op === 'regex') target[field] = { $regex: val, $options: 'i' };
          else target[field] = val;
        };

        if (keyPart.startsWith('company.')) {
          const field = keyPart.slice('company.'.length);
          if (field === 'teamSizeBand') {
            // Map band strings to ranges (re-use existing bands)
            const bands = val.split(',').map((s) => s.trim()).filter(Boolean);
            const ranges = bands.map((b) => COMPANY_SIZE_RANGES[b]).filter(Boolean) as Array<{ min: number; max: number | null }>;
            if (ranges.length) {
              companyFilter.$or = ranges.map((r) => ({
                teamSize: r.max ? { $gte: r.min, $lte: r.max } : { $gte: r.min },
              }));
            }
          } else {
            applyOp(companyFilter, field);
          }
          continue;
        }

        if (keyPart.startsWith('founder.')) {
          const userField = keyPart.slice('founder.'.length);
          // Companies that have at least one founder/owner whose User matches userField op value.
          const userMatch: any = {};
          applyOp(userMatch, userField);
          const users = await User.find(userMatch).select('_id').lean();
          const userIds = users.map((u: any) => u._id);
          const members = await CompanyMember.find({
            user: { $in: userIds },
            $or: [{ role: 'founder' }, { permission: 'owner' }],
          })
            .select('company')
            .lean();
          const ids = members.map((m: any) => m.company);
          applyCompanyIdsIntersection(ids);
          continue;
        }

        if (keyPart.startsWith('employee.')) {
          const userField = keyPart.slice('employee.'.length);
          const userMatch: any = {};
          if (userField === 'age') {
            const minAge = Number(val);
            if (!Number.isNaN(minAge) && minAge >= 0) {
              const cutoffDate = new Date();
              cutoffDate.setFullYear(cutoffDate.getFullYear() - minAge);
              userMatch.dateOfBirth = { $lte: cutoffDate };
            }
          } else {
            applyOp(userMatch, userField);
          }
          const users = await User.find(userMatch).select('_id').lean();
          const userIds = users.map((u: any) => u._id);
          const members = await CompanyMember.find({ user: { $in: userIds } })
            .select('company')
            .lean();
          const ids = members.map((m: any) => m.company);
          applyCompanyIdsIntersection(ids);
          continue;
        }

        if (keyPart.startsWith('job.')) {
          const field = keyPart.slice('job.'.length);
          applyOp(filter, field);
          continue;
        }
      }

      const finalCompanyIds = companyIds as mongoose.Types.ObjectId[] | null;
      if (finalCompanyIds !== null && finalCompanyIds.length === 0) {
        return res.json({ count: 0, next: null, previous: null, results: [] });
      }
      if (finalCompanyIds !== null) {
        companyFilter._id = { $in: finalCompanyIds };
      }
      if (Object.keys(companyFilter).length > 0) {
        const companies = await Company.find(companyFilter).select('_id');
        const ids = companies.map((c) => c._id);
        if (ids.length === 0) {
          return res.json({ count: 0, next: null, previous: null, results: [] });
        }
        filter.company = { $in: ids };
      }
    }

    // Sorting
    let sortBy: any = { postedAt: -1 };
    if (req.query.sortByCompany === 'true') {
      sortBy = { 'company.name': 1 };
    }

    // Get total count
    const totalCount = await Job.countDocuments(filter);

    // Get jobs (no details populate – fetch separately)
    const jobs = await Job.find(filter)
      .populate({
        path: 'company',
        select: 'name logo market teamSize foundedYear website',
      })
      .sort(sortBy)
      .skip(skip)
      .limit(pageSize)
      .lean();

    const jobIds = jobs.map((j: any) => j._id);
    const detailsList = await JobDetails.find({ job: { $in: jobIds } }).lean();
    const detailsByJobId = new Map(
      detailsList.map((d: any) => [d.job.toString(), d])
    );

    // Format response
    const formattedJobs = jobs.map((job: any) => {
      const details = detailsByJobId.get(job._id.toString());
      return {
        id: job._id,
        company: job.company.name,
        logo: job.company.logo || '',
        new: isNewJob(job.postedAt),
        featured: job.featured,
        position: job.position,
        role: job.role,
        level: job.level,
        postedAt: formatPostedAt(job.postedAt),
        contract: job.contract,
        location: job.location,
        currency: job.currency || '',
        minSalary: job.minSalary,
        maxSalary: job.maxSalary,
        timeframe: job.timeframe,
        market: job.company.market,
        companySize: job.company.teamSize?.toString() || '',
        workType: job.workType || '',
        skills: job.skills || [],
        jobDetails: buildJobDetailsPayload(details, job.company),
      };
    });

    res.json({
      count: totalCount,
      next: page * pageSize < totalCount ? page + 1 : null,
      previous: page > 1 ? page - 1 : null,
      results: formattedJobs,
    });
  } catch (error: any) {
    console.error('Get jobs error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * PARSE QUERY - RAG-POWERED FILTER EXTRACTION
 * 
 * HOW IT WORKS (RAG Phase 3: Generation):
 * 1. User sends natural language query: "I want female-founded tech startups in US"
 * 2. Groq LLM extracts two categories of filters:
 *    a) REGULAR FILTERS: location=US, markets=ai_ml (user explicitly mentioned)
 *    b) AI-ONLY FILTERS: founderCeoGender=female (AI inferred from context)
 * 3. Client receives both sets and can apply them differently:
 *    - Regular filters → shown in query string (persist across sessions)
 *    - AI filters → shown as "AI suggestions" (can be cleared in regular mode)
 * 
 * KEY DIFFERENCE FROM REGULAR FILTER MODAL:
 * - Filter Modal: User manually picks from dropdowns (deterministic)
 * - Parse Query: AI extracts patterns from natural language (probabilistic)
 * - This is why we SEPARATE them - different UX handling needed
 * 
 * @route   POST /api/jobs/parse-query
 * @desc    Parse natural language query into structured filters
 * @access  Public
 */
export const parseQuery = async (req: Request, res: Response) => {
  try {
    const query = typeof req.body?.query === 'string' ? req.body.query.trim() : '';
    const mode = req.body?.mode || 'ai'; // 'ai' or 'regular'
    
    if (!query) {
      return res.status(400).json({ message: 'query is required' });
    }

    const result = await extractFiltersFromQuery(
      query,
      process.env.MONGO_URI,
      mode
    );

    /**
     * RESPONSE STRUCTURE - Beginner's Guide:
     * 
     * `filters`: FilterModal fields (regular search filters)
     *   - location, roles, skills, workType, level, etc.
     *   - These are shown in URL/query string for persistence
     *   - Example: ?location=US&level=senior
     * 
     * `ai_filters`: AI-inferred context (not in FilterModal)
     *   - founderCeoGender, companyFoundedAfter, employeeMinExperienceYears, etc.
     *   - These are AI interpretations, may have false positives
     *   - Can be removed when user switches to regular mode
     * 
     * `ai_applied_criteria`: Human-readable descriptions
     *   - Converts ai_filters to text: "Founder/CEO: Female"
     *   - Shown to user as "AI extracted these criteria"
     *   - User can see what AI inferred and remove incorrect ones
     * 
     * USAGE IN CLIENT:
     * - Apply both filters to search
     * - In AI mode: show ai_applied_criteria as removable tags
     * - In regular mode: ignore ai_filters completely
     */
    return res.json({
      filters: result.filters,
      ai_filters: result.ai_filters,
      ai_applied_criteria: result.ai_applied_criteria,
      debug: {
        // For debugging - remove in production
        query_processed: query.substring(0, 100) + (query.length > 100 ? '...' : ''),
        filters_found: Object.values(result.filters).filter(
          (v) => v !== null && v !== '' && (!Array.isArray(v) || v.length > 0)
        ).length,
        ai_criteria_count: result.ai_applied_criteria.length,
      },
    });
  } catch (err: any) {
    console.error('parseQuery error:', err);
    return res.status(500).json({
      message:
        err.message ||
        'Failed to parse query. Ensure GROQ_API_KEY is set in the server environment.',
      error_type: err.constructor.name,
    });
  }
};

// @route   GET /api/jobs/:id
// @desc    Get job by ID with details
// @access  Public
export const getJobById = async (req: Request, res: Response) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate({
        path: 'company',
        select: 'name logo market teamSize foundedYear website',
      })
      .lean();

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const details = await JobDetails.findOne({ job: job._id }).lean();

    const formattedJob = {
      id: job._id,
      company: (job.company as any).name,
      logo: (job.company as any).logo || '',
      new: isNewJob(job.postedAt),
      featured: job.featured,
      position: job.position,
      role: job.role,
      level: job.level,
      postedAt: formatPostedAt(job.postedAt),
      contract: job.contract,
      location: job.location,
      currency: job.currency || '',
      minSalary: job.minSalary,
      maxSalary: job.maxSalary,
      timeframe: job.timeframe,
      market: (job.company as any).market,
      companySize: (job.company as any).teamSize?.toString() || '',
      workType: job.workType || '',
      skills: job.skills || [],
      jobDetails: buildJobDetailsPayload(details, job.company),
    };

    res.json(formattedJob);
  } catch (error: any) {
    console.error('Get job error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   POST /api/jobs/create
// @desc    Create a new job
// @access  Private
export const createJob = async (req: AuthRequest, res: Response) => {
  const errors: Result = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // Check if user is a team member with permission
    const company = await Company.findById(req.body.company);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    const membership = await CompanyMember.findOne({
      user: req.user?.id,
      company: company._id,
    });

    if (!membership) {
      return res
        .status(403)
        .json({ message: 'You are not a member of this company' });
    }

    if (!['owner', 'admin'].includes(membership.permission)) {
      return res
        .status(403)
        .json({ message: 'You do not have permission to post jobs' });
    }

    // Create job
    const jobData: any = {
      company: company._id,
      position: req.body.position,
      role: req.body.role,
      level: req.body.level,
      contract: req.body.contract,
      location: req.body.location,
      featured: req.body.featured || false,
      currency: req.body.currency || '',
      minSalary: req.body.minSalary || 0,
      maxSalary: req.body.maxSalary || 0,
      timeframe: req.body.timeframe || 'year',
      workType: req.body.workType || '',
      skills: req.body.skills || [],
    };

    const job = await Job.create(jobData);

    // Create job details
    const detailsData = {
      job: job._id,
      description: req.body.details.description,
      requirements: req.body.details.requirements || { content: '', items: [] },
      responsibilities: req.body.details.responsibilities || {
        content: '',
        items: [],
      },
      externalApply: req.body.details.externalApply || false,
      apply: req.body.details.apply || '',
      experienceRequired: req.body.details.experienceRequired || '',
    };

    await JobDetails.create(detailsData);

    const populatedJob = await Job.findById(job._id)
      .populate({
        path: 'company',
        select: 'name logo market teamSize foundedYear website',
      })
      .lean();

    const details = await JobDetails.findOne({ job: job._id }).lean();

    const formattedJob = {
      id: populatedJob!._id,
      company: (populatedJob!.company as any).name,
      logo: (populatedJob!.company as any).logo || '',
      new: isNewJob(populatedJob!.postedAt),
      featured: populatedJob!.featured,
      position: populatedJob!.position,
      role: populatedJob!.role,
      level: populatedJob!.level,
      postedAt: formatPostedAt(populatedJob!.postedAt),
      contract: populatedJob!.contract,
      location: populatedJob!.location,
      currency: populatedJob!.currency || '',
      minSalary: populatedJob!.minSalary,
      maxSalary: populatedJob!.maxSalary,
      timeframe: populatedJob!.timeframe,
      market: (populatedJob!.company as any).market,
      companySize: (populatedJob!.company as any).teamSize?.toString() || '',
      workType: populatedJob!.workType || '',
      skills: populatedJob!.skills || [],
      jobDetails: buildJobDetailsPayload(details, populatedJob!.company),
    };

    res.status(201).json(formattedJob);
  } catch (error: any) {
    console.error('Create job error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   PUT /api/jobs/update/:id
// @desc    Update a job
// @access  Private
export const updateJob = async (req: AuthRequest, res: Response) => {
  try {
    const job = await Job.findById(req.params.id).populate('company');
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const company = job.company as any;
    const membership = await CompanyMember.findOne({
      user: req.user?.id,
      company: company._id,
    });

    if (!membership || !['owner', 'admin'].includes(membership.permission)) {
      return res
        .status(403)
        .json({ message: 'You do not have permission to update this job' });
    }

    // Update job fields
    const allowedUpdates = [
      'position',
      'role',
      'level',
      'contract',
      'location',
      'featured',
      'currency',
      'minSalary',
      'maxSalary',
      'timeframe',
      'workType',
      'skills',
    ];

    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        (job as any)[field] = req.body[field];
      }
    });

    await job.save();

    // Update job details if provided
    if (req.body.details) {
      const details = await JobDetails.findOne({ job: job._id });
      if (details) {
        const detailFields = [
          'description',
          'requirements',
          'responsibilities',
          'externalApply',
          'apply',
          'experienceRequired',
        ];
        detailFields.forEach((field) => {
          if (req.body.details[field] !== undefined) {
            (details as any)[field] = req.body.details[field];
          }
        });
        await details.save();
      }
    }

    const populatedJob = await Job.findById(job._id)
      .populate({
        path: 'company',
        select: 'name logo market teamSize foundedYear website',
      })
      .lean();

    const details = await JobDetails.findOne({ job: job._id }).lean();

    const formattedJob = {
      id: populatedJob!._id,
      company: (populatedJob!.company as any).name,
      logo: (populatedJob!.company as any).logo || '',
      new: isNewJob(populatedJob!.postedAt),
      featured: populatedJob!.featured,
      position: populatedJob!.position,
      role: populatedJob!.role,
      level: populatedJob!.level,
      postedAt: formatPostedAt(populatedJob!.postedAt),
      contract: populatedJob!.contract,
      location: populatedJob!.location,
      currency: populatedJob!.currency || '',
      minSalary: populatedJob!.minSalary,
      maxSalary: populatedJob!.maxSalary,
      timeframe: populatedJob!.timeframe,
      market: (populatedJob!.company as any).market,
      companySize: (populatedJob!.company as any).teamSize?.toString() || '',
      workType: populatedJob!.workType || '',
      skills: populatedJob!.skills || [],
      jobDetails: buildJobDetailsPayload(details, populatedJob!.company),
    };

    res.json(formattedJob);
  } catch (error: any) {
    console.error('Update job error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   DELETE /api/jobs/delete/:id
// @desc    Delete a job
// @access  Private
export const deleteJob = async (req: AuthRequest, res: Response) => {
  try {
    const job = await Job.findById(req.params.id).populate('company');
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const company = job.company as any;
    const membership = await CompanyMember.findOne({
      user: req.user?.id,
      company: company._id,
    });

    if (!membership || !['owner', 'admin'].includes(membership.permission)) {
      return res
        .status(403)
        .json({ message: 'You do not have permission to delete this job' });
    }

    // Delete job details first
    await JobDetails.deleteOne({ job: job._id });
    // Delete job
    await Job.deleteOne({ _id: job._id });

    res.json({ message: 'Job deleted successfully' });
  } catch (error: any) {
    console.error('Delete job error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
