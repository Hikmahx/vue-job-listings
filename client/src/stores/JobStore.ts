import { defineStore } from 'pinia'
import type { Job } from '../types'

export const useJobStore = defineStore('jobStore', {
  state: () => ({
    jobs: [] as Job[],
  }),
  getters: {},
  actions: {
    async getData() {
      try {
        const data = await fetch('./data.json')
        console.log(data)
        this.jobs = await data.json()
      } catch (error) {
        console.error('Failed to fetch jobs:', error)
      }
    },
  },
})
