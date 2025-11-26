<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useJobStore } from '@/stores/JobStore'
import { useFilterStore } from '@/stores/FilterStore'
import JobItem from './JobItem.vue'

const jobStore = useJobStore()
const filterStore = useFilterStore()

const { jobs } = storeToRefs(jobStore)
const { uniqueSelectedBtns } = storeToRefs(filterStore)

const filteredJobs = computed(() => {
  if (uniqueSelectedBtns.value.length === 0) {
    return jobs.value
  }

  return jobs.value.filter((job) => {
    const jobAttributes = [job.role, job.level, ...job.languages, ...job.tools]
    return uniqueSelectedBtns.value.every((selected) => jobAttributes.includes(selected))
  })
})
</script>

<template>
  <ul class="pt-24 px-4 lg:px-10 pb-px">
    <JobItem v-for="job in filteredJobs" :key="job.id" :job="job" />
  </ul>
</template>

<style scoped></style>
