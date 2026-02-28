export interface Job {
  id: string;
  company: string;
  logo: string;
  new: boolean;
  featured: boolean;
  position: string;
  role: string;
  level: string;
  postedAt: string;
  contract: string;
  location: string;
  currency: string;
  minSalary: number;
  maxSalary: number;
  market: string;
  companySize: string;
  workType: string;
  timeframe: string;
  skills: string[];
  jobDetails?: JobDetails | null;
}

export interface JobDetails {
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
  apply: string | null;
  experienceRequired: string | null;
  foundedYear: number | null;
  website: string | null;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  role: 'job_seeker' | 'team_member';
  phoneNumber?: string;
  gender?: 'male' | 'female' | 'other';
  dateOfBirth?: string;
  location?: string;
  experienceYears: number;
  linkedinUrl?: string;
  twitterUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  createdAt: string;
}

export interface Company {
  _id: string;
  name: string;
  slug: string;
  logo?: string;
  description: string;
  market: string;
  teamSize?: number;
  foundedYear?: number;
  website?: string;
  location: string;
  createdAt: string;
  updatedAt: string;
}

export interface FilterFields {
  search: string;
  location: string;
  minSalary: number | undefined;
  maxSalary: number | undefined;
  timeframe: string;
  workType: string;
  level: string;
  skills: string[];
  markets: string[];
  companySizes: string[];
  contract: string[];
  roles: string[];
  currency: string;
  sortByCompany: boolean;
}

/** Single recipient (name, email, optional avatar) */
export interface ColdEmailRecipient {
  fullName: string;
  email: string;
  avatar?: string;
}

/** Single initial message (subject, content, date, read) */
export interface ColdEmailMessage {
  subject: string;
  date: string;
  read: boolean;
  response: boolean;
  emailSent?: string;
}

/** Single follow-up slot: date sent + read indicator (1–4 per entry) */
export interface ColdEmailFollowUp {
  date: string;
  read: boolean;
}

export type ColdEmailStatus = 'opened' | 'replied' | 'ignored' | 'booked';

export interface ColdEmailEntry {
  id: string;
  company: string;
  roleApplyingFor: string;
  recipients: ColdEmailRecipient[];
  /** Single main message (subject, content, date, read) */
  message: ColdEmailMessage;
  /** Follow-ups 1–4: each has date + read. Min length 1, max 4. */
  followUps: ColdEmailFollowUp[];
  status: ColdEmailStatus;
  tags: string[];
  notes: string;
  followUpDate: string;
  createdAt: string;
  updatedAt: string;
  /** @deprecated use recipients */
  contactNames?: string;
  /** @deprecated use recipients */
  contactEmail?: string;
  /** @deprecated legacy API may still send; map to message + followUps */
  message1?: ColdEmailMessage;
  message2?: ColdEmailMessage;
  message3?: ColdEmailMessage;
  message4?: ColdEmailMessage;
  message5?: ColdEmailMessage;
}
