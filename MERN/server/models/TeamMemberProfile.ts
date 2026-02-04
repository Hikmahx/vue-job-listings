import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ITeamMemberProfile extends Document {
  user: Types.ObjectId;
  currentPosition?: string;
  verifiedEmployer: boolean;
}

const TeamMemberProfileSchema = new Schema<ITeamMemberProfile>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    currentPosition: {
      type: String,
      maxlength: 100,
    },
    verifiedEmployer: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: false,
    collection: 'team_member_profiles',
  }
);

export const TeamMemberProfile = mongoose.model<ITeamMemberProfile>(
  'TeamMemberProfile',
  TeamMemberProfileSchema
);
