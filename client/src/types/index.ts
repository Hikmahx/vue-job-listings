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
