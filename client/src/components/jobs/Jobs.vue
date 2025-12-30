<script setup lang="ts">
import { computed, watch, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useJobStore } from '@/stores/JobStore'
import { useFilterStore } from '@/stores/FilterStore'
import JobItem from './JobItem.vue'
import JobItemSkeleton from './JobItemSkeleton.vue'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'

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
  <div class="pt-24 px-4 lg:px-10">
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
      <Pagination
        :items-per-page="10"
        :total="totalPages * 10"
        :default-page="currentPage"
        @update:page="changePage"
        v-slot="{ page }"
      >
        <PaginationContent v-slot="{ items }">
          <PaginationPrevious />

          <div v-for="(item, index) in items" :key="index">
            <PaginationItem
              v-if="item.type === 'page'"
              :value="item.value"
              :is-active="item.value === page"
            >
              {{ item.value }}
            </PaginationItem>

            <PaginationEllipsis v-else-if="item.type === 'ellipsis'" :index="index" />
          </div>

          <PaginationNext />
        </PaginationContent>
      </Pagination>
    </div>
  </div>
</template>

<style scoped></style>
