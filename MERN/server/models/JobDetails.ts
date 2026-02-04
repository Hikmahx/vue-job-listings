import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IJobDetails extends Document {
  job: Types.ObjectId;
  description: string;
  requirements: {
    content: string;
    items: string[];
  };
  responsibilities: {
    content: string;
    items: string[];
  };
  externalApply: boolean;
  apply?: string;
  experienceRequired?: string;
}

const JobDetailsSchema = new Schema<IJobDetails>(
  {
    job: {
      type: Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    requirements: {
      content: {
        type: String,
        default: '',
      },
      items: {
        type: [String],
        default: [],
      },
    },
    responsibilities: {
      content: {
        type: String,
        default: '',
      },
      items: {
        type: [String],
        default: [],
      },
    },
    externalApply: {
      type: Boolean,
      default: false,
    },
    apply: {
      type: String,
    },
    experienceRequired: {
      type: String,
      maxlength: 100,
    },
  },
  {
    timestamps: false,
    collection: 'job_details',
  }
);

export const JobDetails = mongoose.model<IJobDetails>('JobDetails', JobDetailsSchema);
