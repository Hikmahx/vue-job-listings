<script setup lang="ts">
import { computed } from 'vue'
import JobItem from './JobItem.vue'
import type { Job } from '@/types'

const { jobs, onClickFilter, selectedBtn } = defineProps<{
  jobs: Job[]
  onClickFilter: (event: Event) => void
  selectedBtn: string[]
}>()

const filteredJobs = computed(() => {
  if (selectedBtn.length === 0) {
    return jobs
  }

  return jobs.filter((job) => {
    const jobAttributes = [job.role, job.level, ...job.languages, ...job.tools]

    return selectedBtn.every((selected) => jobAttributes.includes(selected))
  })
})
</script>

<template>
  <ul class="pt-24 px-10 pb-px">
    <JobItem v-for="job in filteredJobs" :key="job.id" :job="job" :onClickFilter="onClickFilter" />
  </ul>
</template>

<style scoped></style>
