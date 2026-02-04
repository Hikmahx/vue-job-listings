import { Response, NextFunction } from 'express';
import { Job } from '../models/Job';
import { CompanyMember } from '../models/CompanyMember';
import { verifyToken, AuthRequest } from './auth';

// Check if user can manage a job (owner or admin of the company)
export const canManageJob = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await verifyToken(req, res, async () => {
      const job = await Job.findById(req.params.id).populate('company');
      if (!job) {
        return res.status(404).json({ message: 'Job not found' });
      }

      const company = (job as any).company;
      const membership = await CompanyMember.findOne({
        user: req.user?.id,
        company: company._id,
        permission: { $in: ['owner', 'admin'] },
      });

      if (!membership) {
        return res.status(403).json({
          message: 'You do not have permission to manage this job',
        });
      }

      (req as any).job = job;
      (req as any).membership = membership;
      next();
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
