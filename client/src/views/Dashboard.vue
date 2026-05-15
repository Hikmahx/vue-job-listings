<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/AuthStore'

const authStore = useAuthStore()

onMounted(async () => {
  try {
    await authStore.getProfile()
  } catch {
    // User may not be authenticated — MainLayout guards this route
  }
})
</script>

<template>
  <div>
    <div v-if="authStore.loading" class="text-center py-8">
      <p class="text-gray-600">Loading profile…</p>
    </div>

    <div v-else>
      <div class="grid grid-cols-2 gap-5 mb-6">
        <!-- Welcome card -->
        <div class="relative overflow-hidden rounded-2xl bg-cyan-400 p-9 text-white">
          <div class="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/[0.07]" />
          <div class="absolute bottom-[-20px] right-10 w-20 h-20 rounded-full bg-white/[0.05]" />
          <h1 class="text-3xl font-bold leading-tight mb-3">
            Welcome back,<br>{{ authStore.user?.fullName || 'User' }}
          </h1>
          <span class="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs text-[#c8edea]">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a4 4 0 00-5-3.87M9 20H4v-2a4 4 0 015-3.87m6-4.13a4 4 0 11-8 0 4 4 0 018 0z"/>
            </svg>
            {{ authStore.user?.role?.replace('_', ' ') || 'User' }}
          </span>
        </div>

        <!-- Stat cards column -->
        <div class="flex flex-col gap-5">
          <div class="rounded-2xl shadow-md bg-white p-5">
            <p class="text-[10px] uppercase tracking-widest text-cyan-400 mb-1">Active Jobs</p>
            <p class="text-3xl font-bold text-[#1e3a3a]">12</p>
            <p class="text-xs text-grayish-cyan mt-1">↑ 3 new this week</p>
          </div>
          <div class="rounded-2xl shadow-md bg-white p-5">
            <p class="text-[10px] uppercase tracking-widest text-cyan-400 mb-1">Companies</p>
            <p class="text-3xl font-bold text-[#1e3a3a]">4</p>
            <p class="text-xs text-grayish-cyan mt-1">Across 2 industries</p>
          </div>
        </div>
      </div>

    <Separator class="my-6" />

      <!-- Job Seeker -->
      <div v-if="authStore.user?.role === 'job_seeker'" class="rounded-2xl shadow-md bg-white p-8">
        <h2 class="text-base font-semibold text-gray-900 mb-1">Your Applications</h2>
        <p class="text-sm text-cyan-400 mb-5">View and manage your job applications</p>
        <RouterLink
          to="/dashboard/applied-jobs"
          class="inline-flex items-center gap-2 rounded-xl bg-cyan-400 hover:bg-cyan-900 px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-85"
        >
          View Applications
        </RouterLink>
      </div>

      <!-- Team Member -->
      <div v-else-if="authStore.user?.role === 'team_member'" class="rounded-2xl shadow-md bg-white p-8">
        <h2 class="text-base font-semibold text-gray-900 mb-1">Company Management</h2>
        <p class="text-sm text-cyan-400 mb-5">Manage your companies and create job postings</p>
        <div class="flex gap-3">
          <RouterLink
            to="/dashboard/companies"
            class="bg-cyan-400 hover:bg-cyan-900 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            My Companies
          </RouterLink>
          <RouterLink
            to="/dashboard/create-job"
            class="border border-cyan-400 hover:bg-cyan-900 text-cyan-400 px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Create Job
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>
