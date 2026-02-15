import { Request, Response } from 'express';
import { validationResult, Result } from 'express-validator';
import { Job } from '../models/Job';
import { JobDetails } from '../models/JobDetails';
import { Company } from '../models/Company';
import { CompanyMember } from '../models/CompanyMember';

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

    // Location filter
    if (req.query.location) {
      filter.location = { $regex: req.query.location, $options: 'i' };
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
    if (req.query.minSalary || req.query.maxSalary) {
      filter.$or = filter.$or || [];
      if (req.query.minSalary) {
        filter.minSalary = { $gte: parseInt(req.query.minSalary as string) };
      }
      if (req.query.maxSalary) {
        filter.maxSalary = { $lte: parseInt(req.query.maxSalary as string) };
      }
    }

    // Currency filter
    if (req.query.currency) {
      filter.currency = req.query.currency;
    }

    // Timeframe filter
    if (req.query.timeframe) {
      filter.timeframe = req.query.timeframe;
    }

    // Company market filter
    if (req.query.markets || req.query.companySizes) {
      const companyFilter: any = {};
      if (req.query.markets) {
        const markets = Array.isArray(req.query.markets)
          ? req.query.markets
          : (req.query.markets as string).split(',');
        companyFilter.market = { $in: markets };
      }
      if (req.query.companySizes) {
        const sizes = Array.isArray(req.query.companySizes)
          ? req.query.companySizes
          : (req.query.companySizes as string).split(',');
        const sizeRanges = sizes
          .map((size) => COMPANY_SIZE_RANGES[size as string])
          .filter(Boolean);
        if (sizeRanges.length > 0) {
          companyFilter.$or = sizeRanges.map((range) => ({
            teamSize: range.max
              ? { $gte: range.min, $lte: range.max }
              : { $gte: range.min },
          }));
        }
      }

      const companies = await Company.find(companyFilter).select('_id');
      const companyIds = companies.map((c) => c._id);
      filter.company = { $in: companyIds };
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
