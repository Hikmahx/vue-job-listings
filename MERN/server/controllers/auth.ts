import { Request, Response } from 'express';
import { validationResult, Result } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { JobSeekerProfile } from '../models/JobSeekerProfile';
import { TeamMemberProfile } from '../models/TeamMemberProfile';
import dotenv from 'dotenv';

dotenv.config();

interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

// Generate JWT Token
const generateToken = (id: string): string => {
  return jwt.sign({ user: { id, role: 'user' } }, process.env.JWT_SECRET as string, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

// @route   POST /api/accounts/register
// @desc    Register user
// @access  Public
export const registerUser = async (req: Request, res: Response) => {
  const errors: Result = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const {
      firstName,
      lastName,
      email,
      password,
      phoneNumber,
      gender,
      dateOfBirth,
      role,
      location,
      experienceYears,
      linkedinUrl,
      githubUrl,
      portfolioUrl,
    } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phoneNumber: phoneNumber || '',
      gender: gender || undefined,
      dateOfBirth: dateOfBirth || undefined,
      role: role || 'job_seeker',
      location: location || '',
      experienceYears: experienceYears || 0,
      linkedinUrl: linkedinUrl || '',
      githubUrl: githubUrl || '',
      portfolioUrl: portfolioUrl || '',
    });

    await user.save();

    // Create profiles
    await JobSeekerProfile.create({ user: user._id });
    await TeamMemberProfile.create({ user: user._id });

    const token = generateToken(user._id.toString());

    res.status(201).json({
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.getFullName(),
        email: user.email,
        role: user.role,
        phoneNumber: user.phoneNumber,
        gender: user.gender,
        dateOfBirth: user.dateOfBirth,
        location: user.location,
        experienceYears: user.experienceYears,
        linkedinUrl: user.linkedinUrl,
        twitterUrl: user.twitterUrl,
        githubUrl: user.githubUrl,
        portfolioUrl: user.portfolioUrl,
        createdAt: user.createdAt,
      },
      tokens: {
        access: token,
        refresh: token,
      },
    });
  } catch (error: any) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   POST /api/accounts/login
// @desc    Login user
// @access  Public
export const authenticateUser = async (req: Request, res: Response) => {
  const errors: Result = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email, password } = req.body;

    // Check if user exists and get password
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({ message: 'User account is disabled' });
    }

      // Check password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

    const payload = {
      user: {
        id: user._id.toString(),
        role: user.role,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET as string,
      {
        expiresIn: process.env.JWT_EXPIRE || '7d',
      },
      (error, token) => {
        if (error) throw error;
        res.json({
          token,
          user: {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            fullName: user.getFullName(),
            email: user.email,
            role: user.role,
            phoneNumber: user.phoneNumber,
            gender: user.gender,
            dateOfBirth: user.dateOfBirth,
            location: user.location,
            experienceYears: user.experienceYears,
            linkedinUrl: user.linkedinUrl,
            twitterUrl: user.twitterUrl,
            githubUrl: user.githubUrl,
            portfolioUrl: user.portfolioUrl,
            createdAt: user.createdAt,
          },
        });
      }
    );
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   GET /api/accounts/profile
// @desc    Get current user profile
// @access  Private
export const getLoggedInUser = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?.id)
      .populate('jobSeekerProfile')
      .populate('teamMemberProfile')
      .select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.getFullName(),
      email: user.email,
      role: user.role,
      phoneNumber: user.phoneNumber,
      gender: user.gender,
      dateOfBirth: user.dateOfBirth,
      location: user.location,
      experienceYears: user.experienceYears,
      linkedinUrl: user.linkedinUrl,
      twitterUrl: user.twitterUrl,
      githubUrl: user.githubUrl,
      portfolioUrl: user.portfolioUrl,
      createdAt: user.createdAt,
    });
  } catch (error: any) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   PUT /api/accounts/profile
// @desc    Update user profile
// @access  Private
export const updateUser = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update allowed fields
    const allowedUpdates = [
      'firstName',
      'lastName',
      'phoneNumber',
      'gender',
      'dateOfBirth',
      'bio',
      'experienceYears',
      'skills',
      'linkedinUrl',
      'twitterUrl',
      'githubUrl',
      'portfolioUrl',
      'location',
    ];

    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        (user as any)[field] = req.body[field];
      }
    });

    // Hash password if it's being updated
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.password, salt);
    }

    await user.save();

    res.json({
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.getFullName(),
      email: user.email,
      role: user.role,
      phoneNumber: user.phoneNumber,
      gender: user.gender,
      dateOfBirth: user.dateOfBirth,
      location: user.location,
      experienceYears: user.experienceYears,
      linkedinUrl: user.linkedinUrl,
      twitterUrl: user.twitterUrl,
      githubUrl: user.githubUrl,
      portfolioUrl: user.portfolioUrl,
      createdAt: user.createdAt,
    });
  } catch (error: any) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   DELETE /api/accounts/:id
// @desc    Delete user
// @access  Private
export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findByIdAndDelete(req.user?.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: 'User successfully deleted' });
  } catch (error: any) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'User not found' });
    }
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   POST /api/accounts/logout
// @desc    Logout user (JWT is stateless, just return success)
// @access  Private
export const logoutUser = async (req: AuthRequest, res: Response) => {
  res.json({ message: 'Logged out successfully' });
};
