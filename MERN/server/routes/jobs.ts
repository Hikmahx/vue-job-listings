import express from 'express';
import { body } from 'express-validator';
import {
  getAllJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
} from '../controllers/jobs';
import { verifyToken } from '../middleware/auth';
import { canManageJob } from '../middleware/job';

const router = express.Router();

// GET ALL JOBS
router.get('/', getAllJobs);

// GET JOB BY ID
router.get('/:id', getJobById);

// CREATE JOB
router.post(
  '/create',
  verifyToken,
  [
    body('position').trim().notEmpty().withMessage('Position is required'),
    body('role').trim().notEmpty().withMessage('Role is required'),
    body('level').isIn(['junior', 'midweight', 'senior']).withMessage('Invalid level'),
    body('contract')
      .isIn(['contract', 'full-time', 'part-time', 'internship'])
      .withMessage('Invalid contract'),
    body('location').trim().notEmpty().withMessage('Location is required'),
    body('company').notEmpty().withMessage('Company is required'),
    body('details.description').trim().notEmpty().withMessage('Description is required'),
  ],
  createJob
);

// UPDATE JOB
router.put('/update/:id', verifyToken, canManageJob, updateJob);

// DELETE JOB
router.delete('/delete/:id', verifyToken, canManageJob, deleteJob);

export default router;
