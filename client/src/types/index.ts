export interface Job {
  id: string
  company: string
  logo: string
  new: boolean
  featured: boolean
  position: string
  role: string
  level: string
  postedAt: string
  contract: string
  location: string
  currency: string
  minSalary: number
  maxSalary: number
  market: string
  companySize: string
  workType: string
  timeframe: string
  skills: string[]
  jobDetails?: JobDetails | null
}

export interface JobDetails {
  description: string
  requirements: {
    content: string
    items: string[]
  }
  responsibilities: {
    content: string
    items: string[]
  }
  externalApply: boolean
  apply: string | null
  experienceRequired: string | null
  foundedYear: number | null
  website: string | null
}

export interface User {
  id: string
  firstName: string
  lastName: string
  fullName: string
  email: string
  role: 'job_seeker' | 'team_member'
  phoneNumber?: string
  gender?: 'male' | 'female' | 'other'
  dateOfBirth?: string
  location?: string
  experienceYears: number
  linkedinUrl?: string
  twitterUrl?: string
  githubUrl?: string
  portfolioUrl?: string
  createdAt: string
}

export interface Company {
  _id: string
  name: string
  slug: string
  logo?: string
  description: string
  market: string
  teamSize?: number
  foundedYear?: number
  website?: string
  location: string
  createdAt: string
  updatedAt: string
}

export interface FilterFields {
  search: string
  location: string
  minSalary: number | undefined
  maxSalary: number | undefined
  timeframe: string
  workType: string
  level: string
  skills: string[]
  markets: string[]
  companySizes: string[]
  contract: string[]
  roles: string[]
  currency: string
  sortByCompany: boolean
}

export interface JobApplication {
  job: number
  fullName: string
  email: string
  phone?: string
  resumeUrl: string
  coverLetter?: string
  portfolioUrl?: string
  linkedinUrl?: string
}
