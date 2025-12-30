<script setup lang="ts">
import { computed, watch, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useJobStore } from '@/stores/JobStore'
import { useFilterStore } from '@/stores/FilterStore'
import JobItem from './JobItem.vue'
import JobItemSkeleton from './JobItemSkeleton.vue'
import Paginator from '../common/Paginator.vue'

const jobStore = useJobStore()
const filterStore = useFilterStore()

const { jobs, loading, error, currentPage, totalPages } = storeToRefs(jobStore)
const { getData, changePage } = jobStore
const { uniqueSelectedBtns } = storeToRefs(filterStore)

const filteredJobs = computed(() => {
  if (uniqueSelectedBtns.value.length === 0) {
    return jobs.value
  }

  return jobs.value.filter((job) => {
    const jobAttributes = [job.role, job.level, ...job.skills]
    return uniqueSelectedBtns.value.every((selected) => jobAttributes.includes(selected))
  })
})

onMounted(() => {
  getData(1)
})

watch(
  () => filterStore.toQueryObject(),
  () => {
    getData(1)
  },
  { deep: true, immediate: true },
)
</script>

<template>
  <div class="py-24 px-4 lg:px-10">
    <ul v-if="loading" class="flex flex-col gap-6">
      <JobItemSkeleton v-for="n in 6" :key="n" />
    </ul>

    <div v-else-if="error" class="text-red-500 font-semibold text-center py-20">
      {{ error }}
    </div>

    <div v-else-if="filteredJobs.length === 0" class="text-gray-500 font-medium text-center py-20">
      No jobs found matching your filters.
    </div>

    <ul v-else class="flex flex-col gap-6">
      <JobItem v-for="job in filteredJobs" :key="job.id" :job="job" />
    </ul>
    <div v-if="jobs.length > 0" class="flex justify-center mt-8">
      <Paginator :total-pages="totalPages" :current-page="currentPage" @change="changePage" />
    </div>
  </div>
</template>

<style scoped></style>
