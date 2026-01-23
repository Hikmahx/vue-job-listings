<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

const userRole = ref('job_seeker')
const userName = ref('John Doe')
</script>

<template>
  <div class="bg-white rounded-lg shadow-md p-8">
    <h2 class="text-2xl font-bold text-gray-900 mb-4">Welcome Back, {{ userName }}</h2>
    <p class="text-gray-600 mb-6">Role: <span class="font-medium capitalize">{{ userRole.replace('_', ' ') }}</span></p>
    
    <Separator class="my-6" />

    <div v-if="userRole === 'job_seeker'" class="space-y-4">
      <h3 class="text-lg font-semibold text-gray-900">Your Applications</h3>
      <p class="text-gray-600">You have 3 active applications</p>
      <Button class="mt-4 bg-cyan-400 hover:bg-cyan-900 text-white">
        View Applications
      </Button>
    </div>

    <div v-else-if="userRole === 'team_member'" class="space-y-4">
      <h3 class="text-lg font-semibold text-gray-900">Team Jobs</h3>
      <p class="text-gray-600">Your team has 5 open positions</p>
      <Button class="mt-4 bg-cyan-400 hover:bg-cyan-900 text-white">
        Manage Positions
      </Button>
    </div>

    <div v-else-if="userRole === 'admin'" class="space-y-4">
      <h3 class="text-lg font-semibold text-gray-900">Admin Dashboard</h3>
      <p class="text-gray-600">Total jobs: 12 | Total applicants: 87 | Active users: 234</p>
      <Button class="mt-4 bg-cyan-400 hover:bg-cyan-900 text-white">
        View All Jobs
      </Button>
    </div>
  </div>
</template>
