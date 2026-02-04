import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber?: string;
  gender?: 'male' | 'female' | 'other';
  dateOfBirth?: Date;
  bio?: string;
  experienceYears: number;
  skills: string[];
  linkedinUrl?: string;
  twitterUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  role: 'job_seeker' | 'team_member';
  location?: string;
  isStaff: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  getFullName(): string;
}

const UserSchema = new Schema<IUser>(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      maxlength: 50,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      maxlength: 50,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 8,
      select: false,
    },
    phoneNumber: {
      type: String,
      maxlength: 20,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
    },
    dateOfBirth: {
      type: Date,
    },
    bio: {
      type: String,
    },
    experienceYears: {
      type: Number,
      default: 0,
    },
    skills: {
      type: [String],
      default: [],
    },
    linkedinUrl: {
      type: String,
    },
    twitterUrl: {
      type: String,
    },
    githubUrl: {
      type: String,
    },
    portfolioUrl: {
      type: String,
    },
    role: {
      type: String,
      enum: ['job_seeker', 'team_member'],
      default: 'job_seeker',
    },
    location: {
      type: String,
      maxlength: 100,
    },
    isStaff: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: 'users',
  }
);

// Method to get full name
UserSchema.methods.getFullName = function (): string {
  return `${this.firstName} ${this.lastName}`;
};

export const User = mongoose.model<IUser>('User', UserSchema);
