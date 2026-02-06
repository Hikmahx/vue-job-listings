import { Request, Response } from 'express';
import { validationResult, Result } from 'express-validator';
import { Company } from '../models/Company';
import { CompanyMember } from '../models/CompanyMember';

interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

// Helper function to generate slug
const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

// @route   GET /api/companies
// @desc    Get all companies
// @access  Public
export const getAllCompanies = async (req: Request, res: Response) => {
  try {
    const companies = await Company.find().sort({ createdAt: -1 }).lean();
    res.json(companies);
  } catch (error: any) {
    console.error('Get companies error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   GET /api/companies/my-companies
// @desc    Get companies for logged in founder
// @access  Private
export const getMyCompanies = async (req: AuthRequest, res: Response) => {
  try {
    const memberships = await CompanyMember.find({
      user: req.user?.id,
      role: 'founder',
    })
      .populate('company')
      .lean();

    const companies = memberships.map((m: any) => ({
      id: m.company._id,
      name: m.company.name,
      slug: m.company.slug,
      logo: m.company.logo || '',
      description: m.company.description,
      market: m.company.market,
      location: m.company.location,
      teamSize: m.company.teamSize,
      foundedYear: m.company.foundedYear,
      website: m.company.website,
      permission: m.permission,
      createdAt: m.company.createdAt,
    }));

    res.json(companies);
  } catch (error: any) {
    console.error('Get my companies error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   GET /api/companies/:slug
// @desc    Get company by slug with full details
// @access  Public
export const getCompanyBySlug = async (req: Request, res: Response) => {
  try {
    const company = await Company.findOne({ slug: req.params.slug }).lean();
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    const founders = await CompanyMember.find({
      company: company._id,
      role: 'founder',
    })
      .populate('user', 'firstName lastName email')
      .lean();

    const team = await CompanyMember.find({
      company: company._id,
      role: 'employee',
    })
      .populate('user', 'firstName lastName email')
      .lean();

    res.json({
      id: company._id,
      name: company.name,
      slug: company.slug,
      logo: company.logo || '',
      description: company.description,
      market: company.market,
      location: company.location,
      teamSize: company.teamSize,
      foundedYear: company.foundedYear,
      website: company.website,
      createdAt: company.createdAt,
      updatedAt: company.updatedAt,
      founders: founders.map((f: any) => ({
        id: f._id,
        user: {
          id: f.user._id,
          firstName: f.user.firstName,
          lastName: f.user.lastName,
          email: f.user.email,
        },
        role: f.role,
        permission: f.permission,
        title: f.title,
        joinedAt: f.joinedAt,
      })),
      team: team.map((t: any) => ({
        id: t._id,
        user: {
          id: t.user._id,
          firstName: t.user.firstName,
          lastName: t.user.lastName,
          email: t.user.email,
        },
        role: t.role,
        permission: t.permission,
        title: t.title,
        joinedAt: t.joinedAt,
      })),
    });
  } catch (error: any) {
    console.error('Get company error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   GET /api/companies/:slug/people
// @desc    Get company people (founders and team)
// @access  Public
export const getCompanyPeople = async (req: Request, res: Response) => {
  try {
    const company = await Company.findOne({ slug: req.params.slug });
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    const founders = await CompanyMember.find({ company: company._id, role: 'founder' })
      .populate('user', 'firstName lastName email')
      .lean();

    const team = await CompanyMember.find({ company: company._id, role: 'employee' })
      .populate('user', 'firstName lastName email')
      .lean();

    res.json({
      founders: founders.map((f) => ({
        id: f._id,
        user: f.user,
        role: f.role,
        permission: f.permission,
        title: f.title,
        joinedAt: f.joinedAt,
      })),
      team: team.map((t) => ({
        id: t._id,
        user: t.user,
        role: t.role,
        permission: t.permission,
        title: t.title,
        joinedAt: t.joinedAt,
      })),
    });
  } catch (error: any) {
    console.error('Get company people error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   POST /api/companies/create
// @desc    Create a new company
// @access  Private
export const createCompany = async (req: AuthRequest, res: Response) => {
  const errors: Result = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const slug = generateSlug(req.body.name);

    // Check if slug already exists
    const existingCompany = await Company.findOne({ slug });
    if (existingCompany) {
      return res.status(400).json({ message: 'Company name already exists' });
    }

    const company = await Company.create({
      name: req.body.name,
      slug,
      description: req.body.description,
      market: req.body.market,
      location: req.body.location,
      logo: req.body.logo || '',
      teamSize: req.body.teamSize || undefined,
      foundedYear: req.body.foundedYear || undefined,
      website: req.body.website || '',
    });

    // Creator becomes OWNER founder
    await CompanyMember.create({
      user: req.user?.id,
      company: company._id,
      role: 'founder',
      permission: 'owner',
      title: 'Founder',
    });

    res.status(201).json(company);
  } catch (error: any) {
    console.error('Create company error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Company name already exists' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   PUT /api/companies/:slug/update
// @desc    Update a company
// @access  Private
export const updateCompany = async (req: AuthRequest, res: Response) => {
  try {
    const company = await Company.findOne({ slug: req.params.slug });
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    const membership = await CompanyMember.findOne({
      user: req.user?.id,
      company: company._id,
      role: 'founder',
    });

    if (!membership) {
      return res.status(403).json({ message: 'You are not a founder of this company' });
    }

    const allowedUpdates = [
      'name',
      'description',
      'market',
      'location',
      'logo',
      'teamSize',
      'foundedYear',
      'website',
    ];

    // If name is being updated, regenerate slug
    if (req.body.name && req.body.name !== company.name) {
      const newSlug = generateSlug(req.body.name);
      const existingCompany = await Company.findOne({ slug: newSlug });
      if (existingCompany && existingCompany._id.toString() !== company._id.toString()) {
        return res.status(400).json({ message: 'Company name already exists' });
      }
      company.slug = newSlug;
    }

    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        (company as any)[field] = req.body[field];
      }
    });

    await company.save();
    res.json(company);
  } catch (error: any) {
    console.error('Update company error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   DELETE /api/companies/:slug/delete
// @desc    Delete a company
// @access  Private
export const deleteCompany = async (req: AuthRequest, res: Response) => {
  try {
    const company = await Company.findOne({ slug: req.params.slug });
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    const membership = await CompanyMember.findOne({
      user: req.user?.id,
      company: company._id,
      role: 'founder',
      permission: 'owner',
    });

    if (!membership) {
      return res.status(403).json({ message: 'Only the owner can delete the company' });
    }

    await Company.deleteOne({ _id: company._id });
    res.json({ message: 'Company deleted successfully' });
  } catch (error: any) {
    console.error('Delete company error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
