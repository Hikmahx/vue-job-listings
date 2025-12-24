export interface Job {
  id: number
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
  minSalary: number | null
  maxSalary: number | null
  market: string
  companySize: string | null
  workType: string | null
  timeframe: string
  skills: string[]
  jobDetails?: JobDetails
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
  apply: string
  experienceRequired: string
  foundedYear: number
  website: string
}