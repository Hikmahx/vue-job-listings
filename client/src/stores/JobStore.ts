import { defineStore } from 'pinia'
import type { Job } from '@/types'
import { jobService, type JobFilters } from '@/services/jobService'
import { useFilterStore } from './FilterStore'

export const useJobStore = defineStore('jobStore', {
  state: () => ({
    jobs: [] as Job[],
    loading: false,
    error: null as string | null,
    currentPage: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0,
    currentJob: null as Job | null,
  }),

  getters: {
    getTotalPages(): number { return this.totalPages },
    getCurrentPage(): number { return this.currentPage },
    getCurrentJob(): Job | null { return this.currentJob },
  },

  actions: {
    /**
     * Fetch jobs using current FilterStore state.
     * Builds filterParams then calls jobService.getJobs.
     * aiFilters are forwarded as extra params when aiMode is on
     */
    async getData(page = 1) {
      const filterStore = useFilterStore()
      const filters = filterStore

      const filterParams: JobFilters = {
        page,
        page_size: this.pageSize,
      }

      if (filters.search) filterParams.search = filters.search
      if (filters.location) filterParams.location = filters.location
      if (filters.level) filterParams.level = filters.level
      if (filters.workType) filterParams.workType = filters.workType
      if (filters.currency) filterParams.currency = filters.currency
      if (filters.minSalary) filterParams.minSalary = filters.minSalary
      if (filters.maxSalary) filterParams.maxSalary = filters.maxSalary
      if (filters.timeframe) filterParams.timeframe = filters.timeframe
      if (filters.skills.length > 0) filterParams.skills = filters.skills
      if (filters.markets.length > 0) filterParams.markets = filters.markets
      if (filters.companySizes.length > 0) filterParams.companySizes = filters.companySizes
      if (filters.contract.length > 0) filterParams.contract = filters.contract
      if (filters.roles.length > 0) filterParams.roles = filters.roles
      if (filters.sortByCompany) filterParams.sortByCompany = true
      if (filters.aiMode) filterParams.aiMode = true

      // Forward AI-only filters
      if (filters.aiMode && filters.aiFilters) {
        Object.entries(filters.aiFilters).forEach(([key, value]) => {
          if (value === undefined || value === null || value === '') return
          if (filterParams[key] !== undefined) return
          filterParams[key] = value
        })
      }

      this.loading = true
      this.error = null

      try {
        const res = await jobService.getJobs(filterParams)
        this.jobs = res.results
        this.currentPage = page
        this.totalCount = res.count
        this.totalPages = Math.ceil(res.count / this.pageSize)
        return res
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Failed to fetch jobs'
        console.error('Failed to fetch jobs:', err)
        throw err
      } finally {
        this.loading = false
      }
    },

    async getJobById(id: string) {
      this.loading = true
      this.error = null
      try {
        const res = await jobService.getJobById(id)
        this.currentJob = res
        return res
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Failed to fetch job details'
        throw err
      } finally {
        this.loading = false
      }
    },

    async changePage(page: number) {
      await this.getData(page)
    },

    clearCurrentJob() {
      this.currentJob = null
    },
  },
})
