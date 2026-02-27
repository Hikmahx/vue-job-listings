import { Request, Response } from 'express';
import { validationResult, Result } from 'express-validator';
import { Company } from '../models/Company';
import { CompanyMember } from '../models/CompanyMember';
import { deleteImageByUrl, isCloudinaryUrl, uploadLogoFile } from '../utils/cloudinary';

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
    // If logo was uploaded as file (multipart), upload to Cloudinary only now so we never create orphans
    if ((req as any).file) {
      try {
        req.body.logo = await uploadLogoFile((req as any).file);
      } catch (err: any) {
        return res.status(400).json({ message: err?.message || 'Logo upload failed' });
      }
    }

    const teamSize = req.body.teamSize != null ? (typeof req.body.teamSize === 'string' ? parseInt(req.body.teamSize, 10) : req.body.teamSize) : undefined;
    const foundedYear = req.body.foundedYear != null ? (typeof req.body.foundedYear === 'string' ? parseInt(req.body.foundedYear, 10) : req.body.foundedYear) : undefined;

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
      teamSize: Number.isNaN(teamSize) ? undefined : teamSize,
      foundedYear: Number.isNaN(foundedYear) ? undefined : foundedYear,
      website: req.body.website || '',
    });

    // Creator becomes OWNER founder
    if (!req.user?.id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    try {
      await CompanyMember.create({
        user: req.user.id,
        company: company._id,
        role: 'founder',
        permission: 'owner',
        title: 'Founder',
      });
    } catch (memberError: any) {
      console.error('Error creating company member:', memberError);
      if (company.logo) {
        try {
          await deleteImageByUrl(company.logo);
        } catch (e) {
          console.error('Cloudinary logo cleanup on rollback failed:', e);
        }
      }
      await Company.deleteOne({ _id: company._id });
      return res.status(500).json({ 
        message: 'Failed to create company membership', 
        error: memberError.message 
      });
    }

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

    // If logo was uploaded as file (multipart), upload to Cloudinary only now so we never create orphans
    if ((req as any).file) {
      try {
        req.body.logo = await uploadLogoFile((req as any).file);
      } catch (err: any) {
        return res.status(400).json({ message: err?.message || 'Logo upload failed' });
      }
      // Remove old logo from Cloudinary if it was there
      if (company.logo && isCloudinaryUrl(company.logo)) {
        try {
          await deleteImageByUrl(company.logo);
        } catch (err) {
          console.error('Cloudinary logo cleanup on update failed:', err);
        }
      }
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

    // If logo is being changed/removed (via URL or cleared), delete old Cloudinary image
    if (req.body.logo !== undefined && company.logo && isCloudinaryUrl(company.logo)) {
      const newLogo = req.body.logo || '';
      if (newLogo !== company.logo) {
        try {
          await deleteImageByUrl(company.logo);
        } catch (err) {
          console.error('Cloudinary logo cleanup on update failed:', err);
        }
      }
    }

    // Normalize number fields from form-data (strings)
    if (req.body.teamSize !== undefined) {
      req.body.teamSize = typeof req.body.teamSize === 'string' ? parseInt(req.body.teamSize, 10) : req.body.teamSize;
      if (Number.isNaN(req.body.teamSize)) req.body.teamSize = undefined;
    }
    if (req.body.foundedYear !== undefined) {
      req.body.foundedYear = typeof req.body.foundedYear === 'string' ? parseInt(req.body.foundedYear, 10) : req.body.foundedYear;
      if (Number.isNaN(req.body.foundedYear)) req.body.foundedYear = undefined;
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

    // Remove company logo from Cloudinary if it was uploaded there (avoid orphan assets)
    if (company.logo) {
      try {
        await deleteImageByUrl(company.logo);
      } catch (err) {
        console.error('Cloudinary logo cleanup failed:', err);
      }
    }

    await Company.deleteOne({ _id: company._id });
    res.json({ message: 'Company deleted successfully' });
  } catch (error: any) {
    console.error('Delete company error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
