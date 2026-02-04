import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ICompanyMember extends Document {
  user: Types.ObjectId;
  company: Types.ObjectId;
  role: 'founder' | 'employee';
  permission: 'owner' | 'admin' | 'member';
  title?: string;
  joinedAt: Date;
}

const CompanyMemberSchema = new Schema<ICompanyMember>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    company: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },
    role: {
      type: String,
      enum: ['founder', 'employee'],
      required: true,
    },
    permission: {
      type: String,
      enum: ['owner', 'admin', 'member'],
      required: true,
    },
    title: {
      type: String,
      maxlength: 100,
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
    collection: 'company_members',
  }
);

// Ensure unique user-company combination
CompanyMemberSchema.index({ user: 1, company: 1 }, { unique: true });

export const CompanyMember = mongoose.model<ICompanyMember>(
  'CompanyMember',
  CompanyMemberSchema
);
