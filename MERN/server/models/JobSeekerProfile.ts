import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IJobSeekerProfile extends Document {
  user: Types.ObjectId;
  resume?: string;
  workExperience: Array<{
    company: string;
    position: string;
    startDate: Date;
    endDate?: Date;
    description?: string;
  }>;
  desiredSalaryMin?: number;
  desiredSalaryMax?: number;
  openToRemote: boolean;
}

const JobSeekerProfileSchema = new Schema<IJobSeekerProfile>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    resume: {
      type: String,
    },
    workExperience: {
      type: [
        {
          company: String,
          position: String,
          startDate: Date,
          endDate: Date,
          description: String,
        },
      ],
      default: [],
    },
    desiredSalaryMin: {
      type: Number,
    },
    desiredSalaryMax: {
      type: Number,
    },
    openToRemote: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: false,
    collection: 'job_seeker_profiles',
  }
);

export const JobSeekerProfile = mongoose.model<IJobSeekerProfile>(
  'JobSeekerProfile',
  JobSeekerProfileSchema
);
