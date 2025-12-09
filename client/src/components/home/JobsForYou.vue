<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useJobStore } from '@/stores/JobStore'
import { useRouter } from 'vue-router'
import SectionTitle from './SectionTitle.vue'
import JobItem from '@/components/jobs/JobItem.vue'
import { Button } from '@/components/ui/button'

const router = useRouter()
const jobStore = useJobStore()
const { jobs, loading } = storeToRefs(jobStore)
const { getData } = jobStore

onMounted(async () => {
  if (jobs.value.length === 0) {
    await getData()
  }
})

const displayedJobs = computed(() => jobs.value.slice(0, 5))
</script>

<template>
  <section class="py-16 lg:py-24 bg-cyan-50">
    <div class="container mx-auto px-4">
      <SectionTitle title="JOBS FOR YOU" />

      <div v-if="loading" class="text-center py-12">
        <p class="text-grayish-cyan">Loading jobs...</p>
      </div>

      <ul v-else-if="displayedJobs.length > 0" class="mb-12">
        <JobItem v-for="job in displayedJobs" :key="job.id" :job="job" />
      </ul>

      <div v-else class="text-center py-12">
        <p class="text-grayish-cyan">No jobs available at the moment.</p>
      </div>

      <!-- class="bg-cyan-400 hover:bg-cyan-900 text-white px-8 py-6 text-lg" -->
      <div class="text-center">
        <Button
          @click="router.push('/jobs')"
          class="bg-cyan-400 hover:bg-cyan-900 h-12 font-medium text-base tracking-wider w-full max-w-[168px]"

        >
          More Jobs
        </Button>
      </div>
    </div>
  </section>
</template>

<style scoped></style>

