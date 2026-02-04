import { Response, NextFunction } from 'express';
import { Company } from '../models/Company';
import { CompanyMember } from '../models/CompanyMember';
import { verifyToken, AuthRequest } from './auth';

// Check if user is a founder of the company
export const isCompanyFounder = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // First verify token
    await verifyToken(req, res, async () => {
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

      (req as any).company = company;
      (req as any).membership = membership;
      next();
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Check if user is an admin of the company
export const isCompanyAdmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    await verifyToken(req, res, async () => {
      const companyId = req.params.companyId || (req.body.company as string);
      if (!companyId) {
        return res.status(400).json({ message: 'Company ID is required' });
      }

      const membership = await CompanyMember.findOne({
        user: req.user?.id,
        company: companyId,
        permission: { $in: ['owner', 'admin'] },
      });

      if (!membership) {
        return res.status(403).json({ message: 'You do not have admin permissions' });
      }

      (req as any).membership = membership;
      next();
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Check if user is the owner of the company
export const isCompanyOwner = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    await verifyToken(req, res, async () => {
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
        return res.status(403).json({ message: 'Only the owner can perform this action' });
      }

      (req as any).company = company;
      (req as any).membership = membership;
      next();
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
