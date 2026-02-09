import { Request, Response } from 'express';
import { validationResult, Result } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { JobSeekerProfile } from '../models/JobSeekerProfile';
import { TeamMemberProfile } from '../models/TeamMemberProfile';
import { CompanyMember } from '../models/CompanyMember';
import dotenv from 'dotenv';

dotenv.config();

/** Company payload for profile (companiesFounded / companiesEmployed) */
function toCompanyPayload(company: any) {
  return {
    id: company._id,
    name: company.name,
    slug: company.slug,
    logo: company.logo || '',
    description: company.description,
    market: company.market,
    teamSize: company.teamSize,
    foundedYear: company.foundedYear,
    website: company.website,
    location: company.location,
    createdAt: company.createdAt,
    updatedAt: company.updatedAt,
  };
}

/** Build full profile: user + jobSeekerProfile + teamMemberProfile (isFounder, companiesFounded, companiesEmployed). Founder/employee come from CompanyMember, not stored on User. */
async function buildUserProfileResponse(user: any) {
  const userId = user._id;

  const [jobSeekerProfile, teamMemberProfile, founderMemberships, employeeMemberships] =
    await Promise.all([
      JobSeekerProfile.findOne({ user: userId }).lean(),
      TeamMemberProfile.findOne({ user: userId }).lean(),
      CompanyMember.find({ user: userId, role: 'founder' }).populate('company').lean(),
      CompanyMember.find({ user: userId, role: 'employee' }).populate('company').lean(),
    ]);

  const isFounder = founderMemberships.length > 0;
  const companiesFounded = founderMemberships.map((m: any) => toCompanyPayload(m.company));
  const companiesEmployed = employeeMemberships.map((m: any) => toCompanyPayload(m.company));

  const jobSeekerPayload = jobSeekerProfile
    ? {
        workExperience: (jobSeekerProfile as any).workExperience ?? [],
        desiredSalaryMin: (jobSeekerProfile as any).desiredSalaryMin ?? null,
        desiredSalaryMax: (jobSeekerProfile as any).desiredSalaryMax ?? null,
        openToRemote: (jobSeekerProfile as any).openToRemote ?? true,
      }
    : null;

  const teamMemberPayload = teamMemberProfile
    ? {
        currentPosition: (teamMemberProfile as any).currentPosition ?? '',
        verifiedEmployer: (teamMemberProfile as any).verifiedEmployer ?? false,
        isFounder,
        companiesFounded,
        companiesEmployed,
      }
    : null;

  return {
    id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    fullName: user.getFullName(),
    email: user.email,
    gender: user.gender,
    dateOfBirth: user.dateOfBirth,
    role: user.role,
    location: user.location,
    phoneNumber: user.phoneNumber,
    linkedinUrl: user.linkedinUrl,
    twitterUrl: user.twitterUrl,
    githubUrl: user.githubUrl,
    portfolioUrl: user.portfolioUrl,
    experienceYears: user.experienceYears,
    createdAt: user.createdAt,
    jobSeekerProfile: jobSeekerPayload,
    teamMemberProfile: teamMemberPayload,
  };
}

interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

// Generate JWT Token
const generateToken = (id: string, role: string): string => {
  const secret = process.env.JWT_SECRET as string;
  const expiresIn = process.env.JWT_EXPIRE ?? '7d';
  return jwt.sign({ user: { id, role } }, secret, {
    expiresIn: expiresIn as jwt.SignOptions['expiresIn'],
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

    const token = generateToken(user._id.toString(), user.role);

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

    const secret = process.env.JWT_SECRET as string;
    const expiresIn = (process.env.JWT_EXPIRE ?? '7d') as jwt.SignOptions['expiresIn'];
    jwt.sign(
      payload,
      secret,
      { expiresIn },
      (error, token) => {
        if (error) throw error;
        res.json({
          tokens: {
            access: token,
            refresh: token,
          },
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
// @desc    Get current user profile (user + jobSeekerProfile + teamMemberProfile with isFounder, companiesFounded, companiesEmployed)
// @access  Private
export const getLoggedInUser = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const payload = await buildUserProfileResponse(user);
    res.json(payload);
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

    const payload = await buildUserProfileResponse(user);
    res.json(payload);
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
