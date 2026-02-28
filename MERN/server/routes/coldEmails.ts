import express from 'express';
import {
  getColdEmailEntries,
  getColdEmailEntryById,
  createColdEmailEntry,
  updateColdEmailEntry,
  deleteColdEmailEntry,
} from '../controllers/coldEmails';
import { verifyToken } from '../middleware/auth';

const router = express.Router();

router.use(verifyToken);

router.get('/', getColdEmailEntries);
router.get('/:id', getColdEmailEntryById);
router.post('/', createColdEmailEntry);
router.put('/:id', updateColdEmailEntry);
router.delete('/:id', deleteColdEmailEntry);

export default router;
