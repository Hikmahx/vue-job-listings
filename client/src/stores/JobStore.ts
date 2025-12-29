import { defineStore } from 'pinia'
import type { Job } from '../types'
import axios from 'axios'
import { useFilterStore } from './FilterStore'

export const useJobStore = defineStore('jobStore', {
  state: () => ({
    jobs: [] as Job[],
    currentJob: null as Job | null,
    loading: false,
    error: null as string | null,
  }),
  getters: {},
  actions: {
    async getData() {
      const filterStore = useFilterStore()
      const queryObject = filterStore.toQueryObject()
      const params = new URLSearchParams(queryObject).toString()

      this.loading = true
      this.error = null

      try {
        const res = await axios.get(`http://127.0.0.1:8000/api/jobs?${params}`)
        // const res = await axios.get(`./data.json`)

        this.jobs = res.data
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

    clearCurrentJob() {
      this.currentJob = null
      this.error = null
    },
  },
})