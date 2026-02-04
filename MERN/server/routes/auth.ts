import express from 'express';
import { body } from 'express-validator';
import {
  registerUser,
  authenticateUser,
  getLoggedInUser,
  updateUser,
  deleteUser,
  logoutUser,
} from '../controllers/auth';
import { verifyToken, verifyTokenAndUser } from '../middleware/auth';

const router = express.Router();

// GET LOGGED IN USER
router.get('/profile', verifyToken, getLoggedInUser);

// AUTHENTICATE USER AND GET TOKEN (Login)
router.post(
  '/login',
  body('email', 'Please include a valid email').isEmail(),
  body('password', 'Password is required').exists(),
  authenticateUser
);

// REGISTER USER
router.post(
  '/register',
  [
    body('firstName').trim().notEmpty().withMessage('First name is required').isLength({ max: 50 }),
    body('lastName').trim().notEmpty().withMessage('Last name is required').isLength({ max: 50 }),
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('password2').custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords must match');
      }
      return true;
    }),
    body('role').isIn(['job_seeker', 'team_member']).withMessage('Invalid role'),
  ],
  registerUser
);

// UPDATE USER
router.put('/profile', verifyToken, updateUser);

// DELETE USER
router.delete('/:id', verifyTokenAndUser, deleteUser);

// LOGOUT USER
router.post('/logout', verifyToken, logoutUser);

export default router;
