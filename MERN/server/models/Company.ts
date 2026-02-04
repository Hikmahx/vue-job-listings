import mongoose, { Document, Schema } from 'mongoose';

export interface ICompany extends Document {
  name: string;
  slug: string;
  logo?: string;
  description: string;
  market:
    | 'saas'
    | 'fintech'
    | 'healthtech'
    | 'ecommerce'
    | 'education'
    | 'software'
    | 'marketplace'
    | 'ai_ml'
    | 'devtools'
    | 'gaming'
    | 'social_media'
    | 'cryptocurrency'
    | 'security'
    | 'climate_tech'
    | 'real_estate'
    | 'travel'
    | 'food_beverage'
    | 'others';
  teamSize?: number;
  foundedYear?: number;
  website?: string;
  location: string;
  createdAt: Date;
  updatedAt: Date;
}

const CompanySchema = new Schema<ICompany>(
  {
    name: {
      type: String,
      required: [true, 'Company name is required'],
      unique: true,
      maxlength: 100,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    logo: {
      type: String,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    market: {
      type: String,
      required: [true, 'Market is required'],
      enum: [
        'saas',
        'fintech',
        'healthtech',
        'ecommerce',
        'education',
        'software',
        'marketplace',
        'ai_ml',
        'devtools',
        'gaming',
        'social_media',
        'cryptocurrency',
        'security',
        'climate_tech',
        'real_estate',
        'travel',
        'food_beverage',
        'others',
      ],
    },
    teamSize: {
      type: Number,
    },
    foundedYear: {
      type: Number,
    },
    website: {
      type: String,
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      maxlength: 100,
    },
  },
  {
    timestamps: true,
    collection: 'companies',
  }
);

export const Company = mongoose.model<ICompany>('Company', CompanySchema);
