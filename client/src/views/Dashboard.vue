<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/AuthStore'
import { Separator } from '@/components/ui/separator'

const authStore = useAuthStore()

onMounted(async () => {
  // Fetch latest profile data on mount (mirrors MERN: dispatch(getProfile()))
  try {
    await authStore.getProfile()
  } catch {
    // User may not be authenticated — MainLayout guards this route
  }
})
</script>

<template>
  <div class="bg-white rounded-lg shadow-md p-8">
    <h2 class="text-2xl font-bold text-gray-900 mb-4">
      Welcome Back, {{ authStore.user?.fullName || 'User' }}
    </h2>
    <p class="text-gray-600 mb-6">
      Role:
      <span class="font-medium capitalize">
        {{ authStore.user?.role?.replace('_', ' ') || 'User' }}
      </span>
    </p>

    <Separator class="my-6" />

    <div v-if="authStore.loading" class="text-center py-8">
      <p class="text-gray-600">Loading profile…</p>
    </div>

    <template v-else>
      <!-- Job Seeker -->
      <div v-if="authStore.user?.role === 'job_seeker'" class="space-y-4">
        <h3 class="text-lg font-semibold text-gray-900">Your Applications</h3>
        <p class="text-gray-600">View and manage your job applications</p>
        <RouterLink
          to="/dashboard/applied-jobs"
          class="inline-block mt-4 bg-cyan-400 hover:bg-cyan-900 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
        >
          View Applications
        </RouterLink>
      </div>

      <!-- Team Member -->
      <div v-else-if="authStore.user?.role === 'team_member'" class="space-y-4">
        <h3 class="text-lg font-semibold text-gray-900">Company Management</h3>
        <p class="text-gray-600">Manage your companies and create job postings</p>
        <div class="flex gap-4 mt-4">
          <RouterLink
            to="/dashboard/companies"
            class="bg-cyan-400 hover:bg-cyan-900 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            My Companies
          </RouterLink>
          <RouterLink
            to="/dashboard/create-job"
            class="bg-cyan-400 hover:bg-cyan-900 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Create Job
          </RouterLink>
        </div>
      </div>
    </template>
  </div>
</template>
