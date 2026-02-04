import mongoose, { Document, Schema, Types } from 'mongoose';
import { ICompany } from './Company';

export interface IJob extends Document {
  company: Types.ObjectId;
  featured: boolean;
  position: string;
  role: string;
  level: 'junior' | 'midweight' | 'senior';
  postedAt: Date;
  contract: 'contract' | 'full-time' | 'part-time' | 'internship';
  location: string;
  currency?: string;
  minSalary: number;
  maxSalary: number;
  timeframe: 'hour' | 'day' | 'week' | 'month' | 'year';
  workType: 'remote' | 'hybrid' | 'onsite';
  skills: string[];
}

const JobSchema = new Schema<IJob>(
  {
    company: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    position: {
      type: String,
      required: [true, 'Position is required'],
      maxlength: 100,
    },
    role: {
      type: String,
      required: [true, 'Role is required'],
      maxlength: 50,
    },
    level: {
      type: String,
      enum: ['junior', 'midweight', 'senior'],
      required: true,
    },
    postedAt: {
      type: Date,
      default: Date.now,
    },
    contract: {
      type: String,
      enum: ['contract', 'full-time', 'part-time', 'internship'],
      required: true,
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      maxlength: 100,
    },
    currency: {
      type: String,
    },
    minSalary: {
      type: Number,
      default: 0,
    },
    maxSalary: {
      type: Number,
      default: 0,
    },
    timeframe: {
      type: String,
      enum: ['hour', 'day', 'week', 'month', 'year'],
      default: 'year',
    },
    workType: {
      type: String,
      enum: ['remote', 'hybrid', 'onsite'],
    },
    skills: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: false,
    collection: 'jobs',
  }
);

export const Job = mongoose.model<IJob>('Job', JobSchema);
