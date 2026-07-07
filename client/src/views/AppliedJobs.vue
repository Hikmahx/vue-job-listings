<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { Briefcase } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/AuthStore'
const authStore = useAuthStore()
</script>
<template>
  <div class="bg-white rounded-lg shadow-md p-8">
    <div class="flex items-center gap-3 mb-6">
      <Briefcase class="w-6 h-6 text-cyan-400" />
      <h2 class="text-2xl font-bold text-gray-900">Applied Jobs</h2>
    </div>
    <div class="border-t border-gray-200 my-6" />
    <div class="text-center py-12">
      <Briefcase class="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h3 class="text-lg font-semibold text-gray-900 mb-2">No Applications Yet</h3>
      <p class="text-gray-600 mb-6">
        {{ authStore.user?.role === 'job_seeker'
          ? "You haven't applied to any jobs yet. Start browsing jobs to find your next opportunity!"
          : "You haven't received any applications yet." }}
      </p>
      <RouterLink v-if="authStore.user?.role === 'job_seeker'" to="/jobs"
        class="inline-block bg-cyan-400 hover:bg-cyan-900 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
        Browse Jobs
      </RouterLink>
    </div>
  </div>
</template>
