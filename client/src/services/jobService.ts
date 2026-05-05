import { _axiosInstance } from './authService'
import type { Job } from '@/types'

// Re-use the same axios instance that authService already configures
// (BASE_URL, Authorization header, token refresh)
const api = _axiosInstance

export interface JobsResponse {
  count: number
  next: number | null
  previous: number | null
  results: Job[]
}

export interface JobFilters {
  page?: number
  page_size?: number
  search?: string
  location?: string
  minSalary?: number
  maxSalary?: number
  timeframe?: string
  workType?: string
  level?: string
  skills?: string | string[]
  markets?: string | string[]
  companySizes?: string | string[]
  contract?: string | string[]
  roles?: string | string[]
  currency?: string
  sortByCompany?: boolean
  aiMode?: boolean
  /** AI-only dynamic filters forwarded to the backend when aiMode=true */
  [key: string]: unknown
}

export interface ParseQueryResult {
  filters: Record<string, unknown>
  ai_filters: Record<string, unknown>
  ai_applied_criteria: string[]
  debug?: Record<string, unknown>
}

export const jobService = {
  async getJobs(filters: JobFilters = {}): Promise<JobsResponse> {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          params.append(key, value.join(','))
        } else {
          params.append(key, String(value))
        }
      }
    })
    const response = await api.get<JobsResponse>(`/jobs/?${params.toString()}`)
    return response.data
  },

  async getJobById(id: string): Promise<Job> {
    const response = await api.get<Job>(`/jobs/${id}/`)
    return response.data
  },

  async createJob(jobData: unknown): Promise<Job> {
    const response = await api.post<Job>('/jobs/create/', jobData)
    return response.data
  },

  async updateJob(id: string, jobData: unknown): Promise<Job> {
    const response = await api.put<Job>(`/jobs/update/${id}/`, jobData)
    return response.data
  },

  async deleteJob(id: string): Promise<void> {
    await api.delete(`/jobs/delete/${id}/`)
  },

  /**
   * RAG: Groq extracts filters from natural language query.
   * Returns ONLY filters (no jobs).
   * The client then applies them and calls getJobs() normally.
   *
   * POST /api/jobs/parse-query/
   */
  async parseQuery(query: string): Promise<ParseQueryResult> {
    const response = await api.post<ParseQueryResult>('/jobs/parse-query/', { query })
    return response.data
  },
}
