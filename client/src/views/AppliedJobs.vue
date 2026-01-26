<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

const router = useRouter()
const userRole = ref('job_seeker')

const navigateToCreateJob = () => {
  router.push('/dashboard/create-job')
}
</script>

<template>
  <div class="bg-white rounded-lg shadow-md p-8">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-2xl font-bold text-gray-900">Applied Jobs</h2>
      <Button 
        v-if="userRole !== 'job_seeker'"
        @click="navigateToCreateJob"
        class="bg-cyan-400 hover:bg-cyan-900 text-white"
      >
        Create Job
      </Button>
    </div>
    
    <Separator class="my-6" />

    <div class="space-y-4">
      <p class="text-gray-600">You have not applied to any jobs yet</p>
    </div>
  </div>
</template>
