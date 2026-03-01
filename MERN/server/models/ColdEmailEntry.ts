import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IRecipient {
  fullName: string;
  email: string;
  avatar?: string;
}

const RecipientSchema = new Schema<IRecipient>(
  {
    fullName: { type: String, default: '' },
    email: { type: String, default: '' },
    avatar: { type: String, default: '' },
  },
  { _id: false }
);

export interface IColdEmailMessage {
  subject: string;
  date: string;
  read: boolean;
  response: boolean;
  emailSent: string;
}

const ColdEmailMessageSchema = new Schema<IColdEmailMessage>(
  {
    subject: { type: String, default: '' },
    date: { type: String, default: '' },
    read: { type: Boolean, default: false },
    response: { type: Boolean, default: false },
    emailSent: { type: String, default: '' },
  },
  { _id: false }
);

export interface IColdEmailFollowUp {
  date: string;
  read: boolean;
}

const ColdEmailFollowUpSchema = new Schema<IColdEmailFollowUp>(
  {
    date: { type: String, default: '' },
    read: { type: Boolean, default: false },
  },
  { _id: false }
);

export type ColdEmailStatus = 'opened' | 'replied' | 'ignored' | 'booked';

export interface IColdEmailEntry extends Document {
  user: Types.ObjectId;
  company: string;
  roleApplyingFor: string;
  recipients: IRecipient[];
  message: IColdEmailMessage;
  followUps: IColdEmailFollowUp[];
  status: ColdEmailStatus;
  tags: string[];
  notes: string;
  followUpDate: string;
  createdAt: Date;
  updatedAt: Date;
  contactNames?: string;
  contactEmail?: string;
  // Legacy (mapped to message + followUps when reading)
  message1?: IColdEmailMessage;
  message2?: IColdEmailMessage;
  message3?: IColdEmailMessage;
  message4?: IColdEmailMessage;
  message5?: IColdEmailMessage;
}

const ColdEmailEntrySchema = new Schema<IColdEmailEntry>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    company: { type: String, default: '' },
    roleApplyingFor: { type: String, default: '' },
    recipients: {
      type: [RecipientSchema],
      default: [],
    },
    message: { type: ColdEmailMessageSchema, default: () => ({}) },
    followUps: {
      type: [ColdEmailFollowUpSchema],
      default: () => [{ date: '', read: false }],
    },
    // Legacy: old docs have message1..5; we map to message + followUps in toResponse
    message1: { type: ColdEmailMessageSchema, default: undefined },
    message2: { type: ColdEmailMessageSchema, default: undefined },
    message3: { type: ColdEmailMessageSchema, default: undefined },
    message4: { type: ColdEmailMessageSchema, default: undefined },
    message5: { type: ColdEmailMessageSchema, default: undefined },
    status: {
      type: String,
      enum: ['opened', 'replied', 'ignored', 'booked'],
      default: 'ignored',
    },
    tags: { type: [String], default: [] },
    notes: { type: String, default: '' },
    followUpDate: { type: String, default: '' },
    contactNames: { type: String, default: '' },
    contactEmail: { type: String, default: '' },
  },
  {
    timestamps: true,
    collection: 'cold_email_entries',
  }
);

export const ColdEmailEntry = mongoose.model<IColdEmailEntry>(
  'ColdEmailEntry',
  ColdEmailEntrySchema
);
