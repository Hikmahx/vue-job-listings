import express from 'express';
import { body } from 'express-validator';
import {
  getAllCompanies,
  getMyCompanies,
  getCompanyBySlug,
  getCompanyPeople,
  createCompany,
  updateCompany,
  deleteCompany,
} from '../controllers/company';
import { verifyToken } from '../middleware/auth';
import { isCompanyFounder, isCompanyOwner } from '../middleware/company';

const router = express.Router();

// GET ALL COMPANIES
router.get('/', getAllCompanies);

// GET MY COMPANIES (for logged in founder)
router.get('/my-companies', verifyToken, getMyCompanies);

// GET COMPANY BY SLUG
router.get('/:slug', getCompanyBySlug);

// GET COMPANY PEOPLE
router.get('/:slug/people', getCompanyPeople);

// CREATE COMPANY
router.post(
  '/create',
  verifyToken,
  [
    body('name').trim().notEmpty().withMessage('Company name is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('market').isIn([
      'saas',
      'fintech',
      'healthtech',
      'ecommerce',
      'education',
      'software',
      'marketplace',
      'ai_ml',
      'devtools',
      'gaming',
      'social_media',
      'cryptocurrency',
      'security',
      'climate_tech',
      'real_estate',
      'travel',
      'food_beverage',
      'others',
    ]),
    body('location').trim().notEmpty().withMessage('Location is required'),
  ],
  createCompany
);

// UPDATE COMPANY
router.put('/:slug/update', verifyToken, isCompanyFounder, updateCompany);

// DELETE COMPANY
router.delete('/:slug/delete', verifyToken, isCompanyOwner, deleteCompany);

export default router;
