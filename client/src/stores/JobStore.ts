import { defineStore } from 'pinia'
import type { Job } from '../types'
import axios from 'axios'
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
    getTotalPages(): number {
      return this.totalPages
    },
    getCurrentPage(): number {
      return this.currentPage
    },
    getCurrentJob(): Job | null {
      return this.currentJob
    },
  },
  actions: {
    async getData(page = 1) {
      const filterStore = useFilterStore()
      const queryObject = filterStore.toQueryObject()
      const params = new URLSearchParams(queryObject).toString()

      const url = `http://127.0.0.1:8000/api/jobs?page=${page}${params ? '&' + params : ''}`

      this.loading = true
      this.error = null

      try {
        const res = await axios.get(url)

        this.jobs = res.data.results
        this.currentPage = page
        this.totalCount = res.data.count
        this.totalPages = Math.ceil(res.data.count / this.pageSize)
        return res.data
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
        const res = await axios.get(`http://127.0.0.1:8000/api/jobs/${id}/`)
        this.currentJob = res.data
        return res.data
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Failed to fetch job details'
        console.error('Failed to fetch job details:', err)
        throw err
      } finally {
        this.loading = false
      }
    },

    async changePage(page: number) {
      await this.getData(page)
    },
  },
})
