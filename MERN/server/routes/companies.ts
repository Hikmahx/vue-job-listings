import express from 'express';
import multer from 'multer';
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

// Multer: parse multipart/form-data so we get the logo file (req.file) to upload to Cloudinary.
// Only run when client sends FormData; otherwise JSON body is used for "paste link".
const logoParser = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'));
    }
    cb(null, true);
  },
}).single('logo');

const optionalLogoUpload = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (req.is('multipart/form-data')) {
    return logoParser(req, res, next);
  }
  next();
};

// GET ALL COMPANIES
router.get('/', getAllCompanies);

// GET MY COMPANIES (for logged in founder)
router.get('/my-companies', verifyToken, getMyCompanies);

// GET COMPANY BY SLUG
router.get('/:slug', getCompanyBySlug);

// GET COMPANY PEOPLE
router.get('/:slug/people', getCompanyPeople);

// CREATE COMPANY (accepts JSON with logo URL or multipart with logo file)
router.post(
  '/create',
  verifyToken,
  optionalLogoUpload,
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

// UPDATE COMPANY (accepts JSON with logo URL or multipart with logo file)
router.put('/:slug/update', verifyToken, isCompanyFounder, optionalLogoUpload, updateCompany);

// DELETE COMPANY
router.delete('/:slug/delete', verifyToken, isCompanyOwner, deleteCompany);

export default router;
